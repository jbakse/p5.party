import { DeepstreamClient } from "@deepstream/client";
import {
  Record as DSRecord,
  SubscriptionCallback,
} from "@deepstream/client/dist/src/record/record";

import onChange from "on-change";

import * as log from "./log";

import { UserData, JSONValue, JSONObject, RecordData } from "./validate";
import { isJSONValue, isJSONObject, isEmpty } from "./validate";
import { patchInPlace } from "./patch";

const sharedRecordLookup = new WeakMap<JSONObject, Record>();

export class Record {
  readonly #ds: DeepstreamClient;
  readonly #name: string;
  #dsRecord: DSRecord | null;
  #shared: JSONObject;
  #watchedShared: JSONObject;

  constructor(ds: DeepstreamClient, name: string) {
    this.#ds = ds;
    this.#name = name;
    this.#dsRecord = null;
    this.#shared = {};
    sharedRecordLookup.set(this.#shared, this);
    this.#watchedShared = onChange(
      this.#shared,
      this.#onClientChangeData.bind(this),
      {
        onValidate: this.#onClientValidateData.bind(this),
      }
    );
  }

  async load(initObject?: UserData): Promise<void> {
    if (this.#ds.getConnectionState() !== "OPEN") {
      log.error("Record.load() called before room is connected.");
      return;
    }
    this.#dsRecord = this.#ds.record.getRecord(this.#name);
    this.#dsRecord.subscribe(this.#onServerChangeData.bind(this), true);
    await this.#dsRecord.whenReady();
    if (!initObject) return;
    if (!isEmpty(this.#dsRecord.get())) return; // don't overwrite existing data
    if (!isJSONObject(initObject, "init-data")) return; // validate user data
    await this.#dsRecord.setWithAck(initObject);
  }

  async whenReady() {
    if (this.#dsRecord === null) {
      log.error(`Record '${this.#name}' loading hasn't begun.`);
      return;
    }
    await this.#dsRecord.whenReady();
    // when ready returns a Promise<dsRecord>
    // we don't want to return the dsRecord
    return;
  }

  setShared(data: UserData): void {
    if (!isJSONObject(data, "data")) return;

    if (!this.#dsRecord?.isReady) {
      // prettier-ignore
      log.warn(`setShared() called on '${this.#name}' before ready.\n Ignored: ${JSON.stringify(data)}`);
      return;
    }

    // todo: warn and allow non-owner writes
    this.#dsRecord.set(data);
  }

  watchShared(callback: SubscriptionCallback, triggerNow?: boolean): void;

  watchShared(
    path: string,
    callback: SubscriptionCallback,
    triggerNow?: boolean
  ): void;

  watchShared(
    path: string | SubscriptionCallback,
    cb?: SubscriptionCallback | boolean,
    triggerNow?: boolean
  ): void {
    if (!this.#dsRecord?.isReady) {
      log.warn(`watchShared() called on '${this.#name}' before fully ready.`);
      return;
    }

    this.whenReady().then(
      () => {
        // @ts-expect-error subscribe overload signatures match watchShared
        this.#dsRecord.subscribe(path, cb, triggerNow);
      },
      () => {
        /**/
      }
    );

    // if (typeof path === "string" && typeof cb === "function") {
    //   this.#dsRecord.subscribe(path, cb, triggerNow);
    // }
    // if (typeof path === "function" && typeof cb !== "function") {
    //   this.#dsRecord.subscribe(path, cb)
    // }
  }

  get shared(): JSONObject {
    return this.#watchedShared;
  }

  get name(): string {
    return this.#name;
  }

  // discard() {
  //   this.#dsRecord?.discard();
  // }

  async delete() {
    if (!this.#dsRecord?.isReady) {
      log.error(`delete() called on ${this.#name} before ready.`);
      return;
    }

    return new Promise((resolve) => {
      this.#dsRecord?.once("delete", resolve);
      void this.#dsRecord?.delete();
    });
  }

  async _set(path: string, value: JSONValue) {
    // value `as RecordData` because all JSONValues ARE supported
    await this.#dsRecord?.setWithAck(path, value as RecordData);
  }

  _get(key?: string): JSONValue {
    return this.#dsRecord?.get(key) as JSONValue;
  }

  #onClientValidateData(
    path: string,
    newValue: UserData,
    oldValue: UserData
  ): boolean {
    const valid = isJSONValue(newValue, `${this.#name}/${path}`);
    return valid;
  }

  #onClientChangeData(
    path: string,
    newValue: UserData,
    oldValue: UserData
  ): void {
    if (!this.#dsRecord?.isReady) {
      // prettier-ignore
      log.warn(`Shared object '${this.#name}' written to before ready.\n Ignored: ${path} = ${JSON.stringify(newValue)}`);
      return;
    }
    // todo: warn and allow non-owner writes

    // `as JSONValue` because newValue validated in onClientValidateData
    void this._set(path, newValue as JSONValue);
  }

  #onServerChangeData(data: JSONObject): void {
    /* istanbul ignore next */ // the server should never be sending this
    if (!isJSONObject(data, "server-data")) {
      log.error(`Incoming server data not valid.`);
    }
    // don't replace #shared itself as #watchedShared has a reference to it
    // instead patch it to match the incoming data
    patchInPlace(this.#shared, data, "shared");
  }

  static recordForShared(watchedShared: JSONObject): Record | undefined {
    const shared = onChange.target(watchedShared);

    if (!sharedRecordLookup.has(shared)) {
      log.error(`No record found for shared object.`);
      return undefined;
    }
    return sharedRecordLookup.get(shared);
  }
}

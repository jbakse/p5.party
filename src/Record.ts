import onChange from "on-change";

import { DeepstreamClient } from "@deepstream/client";
import { Record as DSRecord } from "@deepstream/client/dist/src/record/record";

import * as log from "./log";

import { SubscriptionCallback } from "./validate";
import { UserData, JSONValue, JSONObject, RecordData } from "./validate";
import { isJSONValue, isJSONObject, isEmpty } from "./validate";

import { patchInPlace } from "./patch";

type SharedObject = JSONObject;

const sharedRecordLookup = new WeakMap<SharedObject, Record>();

export class Record {
  readonly #ds: DeepstreamClient;
  readonly #name: string;
  #dsRecord: DSRecord | null;
  #shared: SharedObject;
  #watchedShared: SharedObject;
  #whenLoaded: Promise<void> | null;

  constructor(ds: DeepstreamClient, name: string) {
    this.#ds = ds;
    this.#name = name;
    this.#dsRecord = null;
    this.#shared = {};
    this.#watchedShared = onChange(
      this.#shared,
      this.#onClientChangeData.bind(this),
      {
        onValidate: this.#onClientValidateData.bind(this),
      }
    );
    this.#whenLoaded = null;

    sharedRecordLookup.set(this.#shared, this);
  }

  async load(initObject?: UserData, overwrite = false): Promise<void> {
    if (this.#whenLoaded) {
      log.warn("Record.load() called twice!", this.#name);
      return this.#whenLoaded;
    }

    if (this.#ds.getConnectionState() !== "OPEN") {
      log.error("Record.load() called before room is connected.", this.#name);
      return;
    }

    const innerLoad = async () => {
      this.#dsRecord = this.#ds.record.getRecord(this.#name);
      this.#dsRecord.subscribe(this.#onServerChangeData.bind(this), true);
      await this.#dsRecord.whenReady();
      if (!initObject) return;
      await this.initData(initObject, overwrite);
    };

    this.#whenLoaded = innerLoad();
    return this.#whenLoaded;
  }

  get whenLoaded(): Promise<void> {
    if (this.#whenLoaded === null) {
      log.error("Record.whenLoaded called before load().", this.#name);
      return Promise.reject(
        new Error("Record.whenLoaded called before load().")
      );
    }
    return this.#whenLoaded;
  }

  /**
   * sets initial data on the record only if the record is empty
   *
   * @param data initial data to set on the record
   */

  async initData(data: UserData, overwrite = false): Promise<void> {
    if (!this.#dsRecord?.isReady) {
      log.error("Record.initData() called before record ready.", this.#name);
      return;
    }

    // if (!data) return;
    if (!overwrite && !isEmpty(this.#dsRecord.get())) return; // don't overwrite existing data
    if (!isJSONObject(data, "init-data")) return; // don't try to write bad data

    // todo: allow but warn non-owner writes
    await this.#dsRecord.setWithAck(data);
  }

  setData(data: UserData): void {
    if (!this.#dsRecord?.isReady) {
      // prettier-ignore
      log.error(
        `Record.setData() called before record ready. ${
          this.#name
        }\n Ignored: ${JSON.stringify(data)}`
      );
      return;
    }
    if (!isJSONObject(data, "set-data")) return; // don't try to write bad data

    // todo: allow but warn non-owner writes
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
      log.warn(`watchShared() called on '${this.#name}' before ready.`);
      return;
    }

    // @ts-expect-error subscribe overload signatures DO match watchShared
    this.#dsRecord.subscribe(path, cb, triggerNow);
  }

  get shared(): JSONObject {
    return this.#watchedShared;
  }

  get name(): string {
    return this.#name;
  }

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
    return isJSONValue(newValue, `${this.#name}/${path}`);
  }

  #onClientChangeData(
    path: string,
    newValue: UserData,
    oldValue: UserData
  ): void {
    if (!this.#dsRecord?.isReady) {
      // prettier-ignore
      log.warn(
        `Shared object written to before ready. ${
          this.#name
        }\n Ignored: ${path} = ${JSON.stringify(newValue)}`
      );
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

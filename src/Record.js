import * as log from "./log";
import * as onChange from "on-change";
import { createEmitter } from "./emitter";

export class Record {
  #client;
  #name;
  #shared;
  #watchedShared;
  #emitter;
  #isReady;
  #record;

  constructor(client, name) {
    this.#client = client;
    this.#name = name;
    this.#shared = {};
    this.#watchedShared = onChange(
      this.#shared,
      this._onClientChangedData.bind(this)
    );
    this.#emitter = createEmitter();
    this.#isReady = false;
    this._connect();
  }

  async _connect() {
    await this.#client.whenReady();

    // subscribe to record
    this.#record = this.#client.getRecord(this.#name);
    this.#record.subscribe("shared", this._onServerChangedData.bind(this));
    await this.#record.whenReady();

    if (!this.#record.get("shared")) this.#record.set("shared", {});

    // report
    log.debug("RecordManager: Record ready.");
    log.debug(this.#record.get());

    // ready
    this.#isReady = true;
    this.#emitter.emit("ready");
  }

  whenReady(cb) {
    if (this.#isReady) {
      if (typeof cb === "function") cb();
      return Promise.resolve();
    }
    if (typeof cb === "function") this.#emitter.once("ready", cb);
    return new Promise((resolve) => {
      this.#emitter.once("ready", resolve);
    });
  }

  _onClientChangedData(path, newValue, oldValue) {
    // on-change alerts us when the value actually changes
    // so we don't need to test if newValue and oldValue are different
    this.#record.set("shared." + path, newValue);
  }
  _onServerChangedData(data) {
    // replace the CONTENTS of this.#shared
    // don't replace #shared itself as #watchedShared has a reference to it
    for (const key in this.#shared) {
      delete this.#shared[key];
    }
    for (const key in data) {
      this.#shared[key] = data[key];
    }
  }

  // this is broken until a "deep update" is implemented
  // allows getting a watched data for data not in shared.
  // path needs to exist on record for this to work.
  // getData(path) {
  //   const deep_value = (o, p) => p.split(".").reduce((a, v) => a[v], o);
  //   return deep_value(this.#watchedData, path);
  // }

  getShared() {
    return this.#watchedShared;
  }
}

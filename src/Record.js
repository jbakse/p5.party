import * as log from "./log";
import * as onChange from "on-change";
import { createEmitter } from "./emitter";

// const customMergeStrategy = (
//   localValue,
//   localVersion,
//   remoteValue,
//   remoteVersion,
//   callback
// ) => {
//   log.warn("Merge");
//   callback(null, remoteValue);
// };
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
    this.#shared[Symbol.for("Record")] = this;
    this.#emitter = createEmitter();
    this.#isReady = false;
    this._connect();
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

  setShared(data) {
    this.#record.set("shared", data);
  }

  async delete() {
    this.setShared({});
    await this.#record.whenReady();
    this.#record.delete();
  }

  async watchShared(path_or_cb, cb) {
    await this.whenReady();
    if (typeof path_or_cb === "string") {
      this.#record.subscribe("shared." + path_or_cb, cb);
    } else if (typeof path_or_cb === "function") {
      this.#record.subscribe("shared", path_or_cb);
    }
  }

  static recordForShared(shared) {
    return onChange.target(shared)[Symbol.for("Record")];
  }

  async _connect() {
    await this.#client.whenReady();

    // subscribe to record
    this.#record = this.#client.getRecord(this.#name);
    // this.#record.setMergeStrategy(customMergeStrategy);

    this.#record.subscribe("shared", this._onServerChangedData.bind(this));
    await this.#record.whenReady();
    // this.#record.delete(); // emergency clear it

    if (!this.#record.get("shared")) this.#record.set("shared", {});

    // report
    log.debug("RecordManager: Record ready.", this.#name);
    //log.debug(this.#record.get());

    // ready
    this.#isReady = true;
    this.#emitter.emit("ready");
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
}

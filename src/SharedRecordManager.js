import * as log from "./log";
import * as onChange from "on-change";
import { createEmitter } from "./emitter";

export class SharedRecordManager {
  #id;
  #roomManager;
  #name;
  #shared;
  #watchedShared;
  #emitter;
  #isReady;
  #record;

  constructor(id, roomManager, onReadyCB) {
    this.#id = id;
    this.#roomManager = roomManager;
    this.#name = `${this.#roomManager.getPrefix()}/${this.#id}`;
    this.#shared = {};
    this.#watchedShared = onChange(
      this.#shared,
      this._onClientChangedShared.bind(this)
    );
    this.#emitter = createEmitter();
    this.#isReady = false;
    this._connect(onReadyCB);
  }

  async _connect(onReadyCB) {
    await this.#roomManager.whenReady();
    this.#record = this.#roomManager.getClient().record.getRecord(this.#name);
    this.#record.subscribe("shared", this._onServerChangedShared.bind(this));
    await this.#record.whenReady();

    log.log("RecordManager: Record ready.");
    log.log(this.#record.get());
    if (typeof onReadyCB === "function") onReadyCB();
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

  _onClientChangedShared(path, newValue, oldValue) {
    // on-change alerts us when the value actually changes
    // so we don't need to test if newValue and oldValue are different
    this.#record.set("shared." + path, newValue);
  }
  _onServerChangedShared(shared) {
    // replace the CONTENTS of this.#shared
    // don't replace #shared itself as #watchedShared has a reference to it
    for (const key in this.#shared) {
      delete this.#shared[key];
    }
    for (const key in shared) {
      this.#shared[key] = shared[key];
    }
  }

  getShared() {
    return this.#watchedShared;
  }
}

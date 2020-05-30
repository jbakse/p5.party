import { ds_room } from "./index_p5";
import * as log from "./log";
import * as onChange from "on-change";

export class RecordManager {
  #id;
  #roomManager;
  #name;
  #shared;
  #watchedShared;
  #record;
  constructor(id, roomManager, onReadyCB) {
    this.#id = id;
    this.#roomManager = roomManager;
    this.#name = `${ds_room.getPrefix()}/${this.#id}`;
    this.#shared = {};
    this.#watchedShared = onChange(this.#shared, this._watchShared.bind(this));
    this._connect(onReadyCB);
  }
  _watchShared(path, newValue, oldValue) {
    // on-change alerts us when the value actually changes
    // we don't need to test if newValue and oldValue are different
    this.#record.set("shared." + path, newValue);
  }
  async _connect(onReadyCB) {
    await this.#roomManager.whenReady();
    this.#record = this.#roomManager.getClient().record.getRecord(this.#name);
    this._subscribeToShared();
    await this.#record.whenReady();
    // this.#record.setMergeStrategy(REMOTE_WINS);
    log.log("RecordManager: Record ready.");
    log.log(this.#record.get());
    if (typeof onReadyCB === "function") onReadyCB();
  }
  _subscribeToShared() {
    this.#record.subscribe("shared", (shared) => {
      // replace the CONTENTS of this.#shared
      // don't replace #shared itself as #watchedShared has a reference to it
      for (const key in this.#shared) {
        delete this.#shared[key];
      }
      for (const key in shared) {
        this.#shared[key] = shared[key];
      }
    });
  }
  getShared() {
    return this.#watchedShared;
  }
}

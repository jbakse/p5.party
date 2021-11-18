import * as log from "./log";
import onChange from "on-change";
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

  // called from deepstreem. this is called when the deepstreem data store is
  // updated, even if the update was local. If the update is local
  // this.#shared === data -> true
  // because this.#shared was updated first, triggering this callback
  // if the change originated non-locally, than this.#shared does need to be
  // updated

  _onServerChangedData(data) {
    // don't replace #shared itself as #watchedShared has a reference to it
    // instead patch it to match the incoming data
    patchInPlace(this.#shared, data, "shared");
  }
}

function getType(value) {
  if (value === null) return "null";
  if (typeof value === "object") return "object";
  if (typeof value === "boolean") return "primative";
  if (typeof value === "number") return "primative";
  if (typeof value === "string") return "primative";
  return "unsupported";
}

function patchInPlace(_old, _new, _keyPath = "") {
  if (typeof _old !== "object") return log.error("_old is not an object");
  if (typeof _new !== "object") return log.error("_new is not an object");

  const oldKeys = Object.keys(_old);
  const newKeys = Object.keys(_new);

  // remove old keys not in new
  for (const key of oldKeys) {
    if (!Object.prototype.hasOwnProperty.call(_new, key)) {
      log.debug(`remove ${_keyPath}.${key}`);
      if (Array.isArray(_old)) {
        _old.splice(key, 1);
      } else {
        delete _old[key];
      }
    }
  }

  // patch shared object and array keys
  for (const key of newKeys) {
    if (Object.prototype.hasOwnProperty.call(_old, key)) {
      const oldType = getType(_old[key]);
      const newType = getType(_new[key]);
      if (oldType === "unsupported") {
        log.error(
          `${_keyPath}.${key} is unsupported type: ${typeof _new[key]}`
        );
        continue;
      }
      if (newType === "unsupported") {
        log.error(
          `${_keyPath}.${key} is unsupported type: ${typeof _new[key]}`
        );
        continue;
      }
      if (oldType != "object" || newType != "object") {
        if (_old[key] !== _new[key]) {
          log.debug(`update ${_keyPath}.${key}`);
          _old[key] = _new[key];
        }
        continue;
      }
      patchInPlace(_old[key], _new[key], `${_keyPath}.${key}`);
    }
  }

  // add new keys not in old
  for (const key of newKeys) {
    if (!Object.prototype.hasOwnProperty.call(_old, key)) {
      log.debug(`add ${_keyPath}.${key}`);
      _old[key] = _new[key];
    }
  }
}

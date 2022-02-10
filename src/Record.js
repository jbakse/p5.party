import * as log from "./log";
import onChange from "on-change";
import { createEmitter } from "./emitter";
import { patchInPlace } from "./patch";

/*
 * Record
 *
 * - creates an object `#shared`
 * - wraps and observes `#shared` with `#watchShared` (using onChange)
 * // https://github.com/sindresorhus/on-change
 * - syncs changes via deepstream record `#record`
 * - deep merges incoming changes into `#shared`
 *
 * record.set() is async, you need to wait for whenReady before record.get() * * will reflect your change.
 * in contrast values set on properties of the shared object
 * should be available immediately
 *
 */
export class Record {
  #client; // party.Client: currently connected client
  #name; // string: full name of record (e.g. "appName-roomName/_recordName")
  #shared; // {}: internal read/write object to be synced with other clients
  #watchedShared; // Proxy: observable object wrapping #shared
  #dsRecord; // ds.Record: the record this party.Record is managing
  #ownerUid; // uid: the client that "owns" this record, or null if no "owner"
  // ownerUid is used to warn if a client tries to change "someone elses" data
  #isReady;
  #emitter;

  constructor(client, name, ownerUid = null) {
    this.#client = client;
    this.#name = name;
    this.#shared = {};
    this.#ownerUid = ownerUid;
    this.#watchedShared = onChange(
      this.#shared,
      this.#onClientChangedData.bind(this)
    );
    // create a reference back to this party.Record from the shared object
    // property key is a Symbol so its unique and mostly hidden
    this.#shared[Symbol.for("Record")] = this;
    this.#emitter = createEmitter();
    this.#isReady = false;
    this.#connect();
  }

  // whenReady returns a promise AND calls a callback
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

  getShared() {
    return this.#watchedShared;
  }

  // resets shared object to data
  // warns non-owners on write
  setShared(data) {
    if (this.#ownerUid && this.#ownerUid !== this.#client.getUid()) {
      log.warn(
        `setShared() 
        changing data on shared object owned by another client
        client: ${this.#client.getUid()}
        owner: ${this.#ownerUid}
        data: ${JSON.stringify(data)}
        `
      );
    }

    this.#setShared(data);
  }

  // todo: i don't think we need to have this in a private method
  // try pulling it into setShared.
  // this private/public split allows record to call setShared and bypass the owner check, but thats not really needed, and it might be good to get checked
  // resets shared object to data
  // does not warn non-owners on write
  #setShared(data) {
    this.#dsRecord.set("shared", data);
  }

  async delete() {
    // todo: is below line needed? is there a need to setShared to {} before deleting a record?
    this.#setShared({});
    await this.#dsRecord.whenReady();
    this.#dsRecord.delete();
  }

  async watchShared(path_or_cb, cb) {
    await this.whenReady();
    if (typeof path_or_cb === "string") {
      this.#dsRecord.subscribe("shared." + path_or_cb, cb);
    } else if (typeof path_or_cb === "function") {
      this.#dsRecord.subscribe("shared", path_or_cb);
    }
  }

  static recordForShared(shared) {
    return onChange.target(shared)[Symbol.for("Record")];
  }

  async #connect() {
    await this.#client.whenReady();

    // get and subscribe to record
    this.#dsRecord = this.#client.getDsRecord(this.#name);
    this.#dsRecord.subscribe("shared", this.#onServerChangedData.bind(this));

    await this.#dsRecord.whenReady();

    // initialize shared object
    // #todo should we use setWithAck or await #record.whenReady()?
    if (!this.#dsRecord.get("shared")) this.#dsRecord.set("shared", {});

    // report
    // log.debug("RecordManager: Record ready.", this.#name);

    // ready
    this.#isReady = true;
    this.#emitter.emit("ready");
  }

  #onClientChangedData(path, newValue, oldValue) {
    // on-change alerts us only when the value actually changes
    // so we don't need to test if newValue and oldValue are different

    if (this.#ownerUid && this.#ownerUid !== this.#client.getUid()) {
      log.warn(
        `changing data on shared object owned by another client
client: ${this.#client.getUid()}
owner: ${this.#ownerUid}
path: ${path}
newValue: ${JSON.stringify(newValue)}`
      );
    }
    this.#dsRecord.set("shared." + path, newValue);
  }

  // _onServerChangedData
  // called from deepstreem. this is called when the deepstreem data store is
  // updated, even if the update was local. If the update is local
  // this.#shared === data -> true
  // because this.#shared was updated first, triggering this callback
  // if the change originated non-locally, than this.#shared does need to be
  // updated

  #onServerChangedData(data) {
    // don't replace #shared itself as #watchedShared has a reference to it
    // instead patch it to match the incoming data
    patchInPlace(this.#shared, data, "shared");
  }
}

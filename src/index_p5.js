import "core-js/stable";
import "regenerator-runtime/runtime";
import * as onChange from "on-change";
import { makeLogger } from "./logging.js";

/* globals DeepstreamClient, p5 */

// const p5Log = makeLogger(
//   "log",
//   "p5",
//   "background-color: #F88; color: #ffff00; padding: 2px 5px; border-radius: 2px"
// );

const dsLog = makeLogger(
  "log",
  "ds",
  "background-color: #88F; color: #00ffff; padding: 2px 5px; border-radius: 2px"
);

const dsError = makeLogger(
  "log",
  "ds",
  "background-color: #ff0000; color: #ffffff; padding: 2px 5px; border-radius: 2px"
);

let ds_room;

p5.prototype.sharedConnect = function (sketch_name, room_name, host) {
  ds_room = new RoomManager(sketch_name, room_name, host);
  //   ds_room.whenReady(() => {
  // p5Log("sharedConnect ready");
  //   });
};

p5.prototype.loadShared = function (record_id) {
  const recordManager = new RecordManager(record_id, ds_room, () => {
    // p5Log("loadShared ready");
    this._decrementPreload();
  });

  return recordManager.getShared();
};

p5.prototype.registerPreloadMethod("loadShared", p5.prototype);

class RecordManager {
  #id;
  #name;
  #record;
  #shared;
  #watchedShared;
  #roomManager;

  constructor(id, roomManager, onReadyCB) {
    this.#id = id;
    this.#roomManager = roomManager;
    this.#name = `${ds_room.getPrefix()}/${this.#id}`;
    this.#shared = {};
    this.#watchedShared = onChange(this.#shared, this._watchShared.bind(this));
    this.#roomManager.whenReady(() => {
      this._connect(onReadyCB);
    });
  }

  _watchShared(path, newValue, oldValue) {
    // on-change alerts us when the value actually changes
    // we don't need to test if newValue and oldValue are different
    this.#record.set("shared." + path, newValue);
  }

  async _connect(onReadyCB) {
    this.#record = this.#roomManager.getClient().record.getRecord(this.#name);
    this._subscribeShared();
    await this.#record.whenReady();
    dsLog("RecordManager record ready");
    dsLog(this.#record.get());
    if (typeof onReadyCB === "function") onReadyCB();
  }

  _subscribeShared() {
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

class RoomManager {
  #app;
  #room;
  #host;
  #deepstreamClient;
  #clientName;
  #isReady = false;

  constructor(
    app = "default",
    room = "default",
    host = "wss://deepstream-server-1.herokuapp.com"
  ) {
    this.#app = app;
    this.#room = room;
    this.#host = host;
    this.#deepstreamClient = new DeepstreamClient(this.#host);
    this.#clientName = this.#deepstreamClient.getUid();
    this._connect();
  }

  whenReady(cb) {
    if (!(typeof cb === "function")) {
      dsError("RoomManager.whenReady() expects a callback");
    }
    if (this.#isReady) return cb();
    this.#deepstreamClient.on("__ready", cb);
  }

  getClient() {
    return this.#deepstreamClient;
  }

  getPrefix() {
    return `${this.#app}-${this.#room}`;
  }

  async _connect() {
    this.#deepstreamClient.on("error", (error, event, topic) =>
      dsError("error", error, event, topic)
    );

    this.#deepstreamClient.on("connectionStateChanged", (connectionState) =>
      dsLog("connectionStateChanged", connectionState)
    );

    await this.#deepstreamClient.login({ username: this.#clientName });
    dsLog("RoomManager login complete", this.#clientName);
    this.#isReady = true;
    this.#deepstreamClient.emit("__ready");
  }
}

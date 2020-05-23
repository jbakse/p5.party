import "core-js/stable";
import "regenerator-runtime/runtime";
import * as onChange from "on-change";
import { makeLogger } from "./logging.js";

/* globals DeepstreamClient, p5 */

const p5Log = makeLogger(
  "log",
  "p5",
  "background-color: #F88; color: #ffff00; padding: 2px 5px; border-radius: 2px"
);

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

console.log("register sharedConnect");

let ds_room;

p5.prototype.sharedConnect = function (sketch_name, room_name, host) {
  p5Log("sharedConnect");
  ds_room = new RoomManager(sketch_name, room_name, host);
  //   ds_room.whenReady(() => {
  //     p5Log("whenReady works?");
  //   });
  ds_room.connect(() => {
    p5Log("sharedConnect CB");
    this._decrementPreload();
  });
};

p5.prototype.registerPreloadMethod("sharedConnect", p5.prototype);

p5.prototype.loadShared = function (record_id) {
  p5Log("loadShared");

  const record = new RecordManager(record_id);
  //   setTimeout(() => {

  ds_room.whenReady(() => {
    p5Log("ds_room ready");
    record.connect(() => {
      p5Log("loadShared CB");
      self._decrementPreload();
    });
  });
  //   }, 1000);

  return record.getShared();
};

p5.prototype.registerPreloadMethod("loadShared", p5.prototype);

class RecordManager {
  #id;
  #name;
  #record;
  #shared;
  #watchedShared;
  constructor(id) {
    dsLog("RecordManager constructor");
    this.#id = id;
    this.#name = `${ds_room.getPrefix()}/${this.#id}`;
    this.#shared = {};
    this.#watchedShared = onChange(this.#shared, this._watchShared.bind(this));
  }

  _watchShared(path, newValue, oldValue) {
    // on-change alerts us when the value actually changes
    // we don't need to test if newValue and oldValue are different
    console.log("_watchShared", path, newValue, oldValue);
    this.#record.set("shared." + path, newValue);
  }

  async connect(cb) {
    dsLog("RecordManager connect");
    this.#record = ds_room.getClient().record.getRecord(this.#name);
    this._subscribeShared();
    await this.#record.whenReady();

    dsLog("RecordManager record ready", this.#record);
    dsLog(this.#record.get());
    cb();
  }

  _subscribeShared() {
    this.#record.subscribe("shared", (shared) => {
      dsLog("subscribe change");
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
    dsLog("RoomManager constructor");
    this.#app = app;
    this.#room = room;
    this.#host = host;
    this.#deepstreamClient = new DeepstreamClient(host);
    console.log("client", this.#deepstreamClient);
    this.#clientName = this.#deepstreamClient.getUid();
  }

  whenReady(cb) {
    if (this.#isReady) {
      cb();
      return;
    }
    this.#deepstreamClient.on("ready", cb);
  }

  getClient() {
    return this.#deepstreamClient;
  }

  getPrefix() {
    return `${this.#app}-${this.#room}`;
  }

  async connect(cb) {
    dsLog("RoomManager connect");
    this.#deepstreamClient.on("error", (error, event, topic) =>
      dsError("error", error, event, topic)
    );

    this.#deepstreamClient.on("connectionStateChanged", (connectionState) =>
      dsLog("connectionStateChanged", connectionState)
    );

    this.#deepstreamClient.on("ready", () => {
      dsLog("!!!!! ready");
    });
    await this.#deepstreamClient.login({ username: name });
    dsLog("RoomManager login complete", name);
    this.#isReady = true;
    this.#deepstreamClient.emit("ready");
    cb();
  }
}

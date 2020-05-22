import "core-js/stable";
import "regenerator-runtime/runtime";

// const onChange = require("on-change");
// import { onChange } from "on-change";
// console.log("onChange", onChange);

import { makeLogger } from "./logging.js";

/* globals DeepstreamClient, p5 */

console.log("index_p5.js!");

const dsLog = makeLogger(
  "log",
  "ds",
  "background-color: #888; color: #00ffff; padding: 2px 5px; border-radius: 2px"
);

const dsError = makeLogger(
  "log",
  "ds",
  "background-color: #ff0000; color: #ffffff; padding: 2px 5px; border-radius: 2px"
);

console.log("register sharedConnect");

let ds_room;

p5.prototype.sharedConnect = function (sketch_name, room_name, host) {
  //   const ret = {};
  // @todo self is not defined

  console.log("sharedConnect");
  ds_room = new RoomManager(sketch_name, room_name, host);
  ds_room.connect(() => {
    console.log("sharedConnect room cb");
    self._decrementPreload();
  });

  //   setupSS(sketch, room, name, (shared) => {
  //     ret.shared = shared;
  //     console.log("cb");
  //     if (typeof callback === "function") {
  //       callback(ret);
  //     }
  //     console.log("dec");
  //     self._decrementPreload();
  //   });

  //   return ret;
};

p5.prototype.registerPreloadMethod("sharedConnect", p5.prototype);

p5.prototype.loadShared = function (record_id) {
  console.log("loadShared");
  const ret = {};

  const record = new RecordManager(record_id);
  record.connect(() => {
    ret.record = record;
    console.log("loadShared record cb");
    self._decrementPreload();
  });

  return ret;
};

p5.prototype.registerPreloadMethod("loadShared", p5.prototype);

class RecordManager {
  #id;
  #name;
  #record;
  constructor(id) {
    dsLog("RecordManager constructor");
    this.#id = id;
    this.#name = `${ds_room.getPrefix()}/${name}`;
  }
  async connect(cb) {
    dsLog("RecordManager connect");
    this.#record = ds_room.getClient().record.getRecord("name");
    await this.#record.whenReady();
    dsLog("RecordManager record", this.#record);
    cb();
  }
}

class RoomManager {
  #app;
  #room;
  #host;
  #deepstreamClient;
  #clientName;

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
    this.#clientName = this.#deepstreamClient.getUid();
  }
  whenReady(cb) {
    console.log("whenReady called");
    return this.#deepstreamClient.whenReady(cb);
  }

  getClient() {
    return this.#deepstreamClient;
  }

  getPrefix() {
    return `${this.#app}-${this.#room}`;
  }
  async connect(cb) {
    dsLog("RoomManager connect");
    await this.#deepstreamClient.login({ username: name });
    dsLog("RoomManager login complete", name);

    this.#deepstreamClient.on("error", (error, event, topic) =>
      dsError("error", error, event, topic)
    );

    this.#deepstreamClient.on("connectionStateChanged", (connectionState) =>
      dsLog("connectionStateChanged", connectionState)
    );

    cb();
  }
}

// async function setupSS(sketch, room, name, cb) {
//   console.log("in setup");
//   await init(sketch, room);
//   console.log("init complete");
//   const shared = await GetShared(name);
//   console.log("get shared complete");
//   cb(shared);
// }

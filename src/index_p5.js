import "core-js/stable";
import "regenerator-runtime/runtime";
import * as onChange from "on-change";
import { makeLogger } from "./logging.js";

/* globals DeepstreamClient, p5 */

const dsLog = makeLogger(
  "log",
  "ds",
  "background-color: #88F; color: #00ffff; padding: 2px 5px; border-radius: 2px"
);

const dsError = makeLogger(
  "error",
  "error",
  "background-color: #ff0000; color: #ffffff; padding: 2px 5px; border-radius: 2px"
);

let ds_room;

p5.prototype.connectToSharedRoom = function (host, sketch_name, room_name, cb) {
  ds_room = new RoomManager(host, sketch_name, room_name);
  cb && ds_room.whenReady(cb);
};

p5.prototype.getSharedData = function (record_id, cb) {
  if (!ds_room) return dsError("loadShared() called before sharedConnect()");

  const recordManager = new RecordManager(record_id, ds_room, () => {
    this._decrementPreload();
    if (typeof cb === "function") cb();
  });

  return recordManager.getShared();
};

p5.prototype.registerPreloadMethod("getSharedData", p5.prototype);

class RecordManager {
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
    dsLog("RecordManager: Record ready.");
    dsLog(this.#record.get());
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

class RoomManager {
  #host;
  #app;
  #room;
  #deepstreamClient;
  #clientName;
  #isReady = false;
  #roomData;

  constructor(
    host = "wss://deepstream-server-1.herokuapp.com",
    app = "default",
    room = "default"
  ) {
    this.#app = app;
    this.#room = room;
    this.#host = host;
    this.#deepstreamClient = new DeepstreamClient(this.#host);
    this.#clientName = this.#deepstreamClient.getUid();
    this._connect();
  }

  whenReady(cb) {
    if (this.#isReady) {
      if (typeof cb === "function") cb();
      return Promise.resolve();
    }
    if (typeof cb === "function") this.#deepstreamClient.once("__ready", cb);
    return new Promise((resolve) => {
      this.#deepstreamClient.once("__ready", resolve);
    });
  }

  // @todo should I expose a getRecord instead? better encapsulated that way?
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

    this.#roomData = this.#deepstreamClient.record.getRecord(
      this.getPrefix() + "/" + "_room_data"
    );

    await this.#roomData.whenReady();

    // create participants list if it doesn't exist
    if (!this.#roomData.get("participants")) {
      this.#roomData.set("participants", {});
    }

    // subscribe to changes
    this.#roomData.subscribe("participants", (data) => {
      console.log("participants changed");
      console.log(data);
      this._chooseHost();
    });

    // add self to participant list
    if (!this.#roomData.get(`participants.${this.#clientName}`)) {
      this.#roomData.set(`participants.${this.#clientName}`, {});
    }

    // remove self from participant list
    window.addEventListener("beforeunload", () => {
      console.log("unload");
      this.#roomData.set(`participants.${this.#clientName}`, undefined);
    });

    // this.#deepstreamClient.presence.subscribe((username, isLoggedIn) => {
    //   if (isLoggedIn === false) {
    //     console.log(username, "logged out");
    //     if (this.#roomData.get(`participants.${username}`)) {
    //       this.#roomData.set(`participants.${username}`, undefined);
    //     }
    //   }
    // });

    await this._cleanParticipants();
  }
  async _chooseHost() {
    const participants = this.#roomData.get(`participants`);
    if (participants.length === 0) {
      return dsError(
        "Something went wrong. There are no participants in this room."
      );
    }
    console.log("chooseHost");

    let hostsFound = 0;
    for (const name in participants) {
      const p = participants[name];
      if (p.isHost === true) {
        console.log("Found host: ", name);
        hostsFound++;
      }
    }

    if (hostsFound === 0) {
      const newHostName = Object.keys(participants)[0];
      console.log("I'm SETTING THE HOST", newHostName);
      this.#roomData.set(`participants.${newHostName}.isHost`, true);
    }

    if (hostsFound > 1) {
      return dsError(`Something went wrong. Found ${hostsFound} hosts!`);
    }
  }

  async _cleanParticipants() {
    const connectedNames = await this.#deepstreamClient.presence.getAll();
    connectedNames.push(this.#clientName);
    const participants = this.#roomData.get("participants");
    for (const key in participants) {
      if (!connectedNames.includes(key)) {
        this.#roomData.set(`participants.${key}`, undefined);
      }
    }
  }
}

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

const dsWarn = makeLogger(
  "log",
  "warn",
  "background-color: #FF0; color: #000; padding: 2px 5px; border-radius: 2px"
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
  if (!ds_room) {
    dsError("getSharedData() called before connectToSharedRoom()");
    return undefined;
  }

  const recordManager = new RecordManager(record_id, ds_room, () => {
    this._decrementPreload();
    if (typeof cb === "function") cb();
  });

  return recordManager.getShared();
};

p5.prototype.isHost = function () {
  if (!ds_room) {
    dsError("isHost() called before connectToSharedRoom()");
    return undefined;
  }
  return ds_room.isHost();
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
    // this.#record.setMergeStrategy(
    //   (record, remoteData, remoteVersion, callback, cb) => {
    //     console.log(
    //       "merge strat envoked",
    //       record,
    //       remoteData,
    //       remoteVersion,
    //       callback,
    //       cb
    //     );
    //     cb(null, remoteData);
    //   }
    // );
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
    console.log("ds", DeepstreamClient);
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

  // displayParticipants() {
  //   const names = Object.keys(this.#roomData.get("participants"));
  //   let output = "";
  //   for (const name of names) {
  //     const shortName = name.substr(-4);
  //     const isHost = this.#roomData.get(`participants.${name}.isHost`)
  //       ? "(H)"
  //       : "";
  //     const isMe = this.#clientName === name ? "(M)" : "";
  //     output += `${shortName}${isHost}${isMe} `;
  //   }
  //   console.log(output);
  // }

  isHost() {
    return this.#roomData.get(`participants.${this.#clientName}.isHost`);
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

    // add self to participant list
    if (!this.#roomData.get(`participants.${this.#clientName}`)) {
      this.#roomData.set(`participants.${this.#clientName}`, {});
    }

    // handle leaving
    window.addEventListener("beforeunload", async () => {
      this.#roomData.set(`participants.${this.#clientName}`, undefined);
      await this._chooseHost();
    });

    this.#deepstreamClient.presence.subscribe(async (username, isLoggedIn) => {
      if (isLoggedIn) return;

      // participant should have removed self from room before logging out
      // if they didn't, remove them
      if (await this._participantInRoom(username)) {
        dsWarn(`Participant ${username} left unexpectedly`);
        this.#roomData.set(`participants.${username}`, undefined);
        await this._chooseHost();
      }
    });

    await this._removeDisconnectedPartipants();
    await this._chooseHost();
  }

  async _participantInRoom(username) {
    await this.#roomData.whenReady();
    const participants = this.#roomData.get(`participants`);
    return Object.keys(participants).includes(username);
  }

  async _chooseHost() {
    await this.#roomData.whenReady();
    const participants = this.#roomData.get(`participants`);
    if (Object.keys(participants).length === 0) {
      return dsWarn(
        "There are no participants in this room. Hopefully this is the last particpant to leave."
      );
    }

    let hostsFound = 0;
    // @todo funcitonal version for counting matches?
    for (const name in participants) {
      const p = participants[name];
      if (p.isHost === true) {
        // console.log("Found host: ", name);
        hostsFound++;
      }
    }

    if (hostsFound === 0) {
      const newHostName = Object.keys(participants).sort()[0];
      this.#roomData.set(`participants.${newHostName}.isHost`, true);
    }

    if (hostsFound > 1) {
      return dsError(`Something went wrong. Found ${hostsFound} hosts!`);
    }
  }

  async _removeDisconnectedPartipants() {
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

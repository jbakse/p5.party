import { DeepstreamClient } from "@deepstream/client";
import * as log from "./log";

export class RoomManager {
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
  displayParticipants() {
    let el = document.getElementById("_sharedParticipants");
    if (!el) {
      el = document.createElement("div");
      el.id = "_sharedParticipants";
      el.style.fontFamily = "monospace";
      document.body.appendChild(el);
    }
    const names = Object.keys(this.#roomData.get("participants")).sort();
    let output = "Ps: ";
    for (const name of names) {
      const shortName = name.substr(-4);
      const isHost = this.#roomData.get(`participants.${name}.isHost`)
        ? "(H)"
        : "";
      const isMe = this.#clientName === name ? "(M)" : "";
      output += `${shortName}${isHost}${isMe} `;
    }
    // console.log.log(output);
    el.textContent = output;
  }
  async _getAllClientsAndMe() {
    const clients = await this.#deepstreamClient.presence.getAll();
    clients.push(this.#clientName);
    return clients;
  }
  isHost() {
    return !!this.#roomData.get(`participants.${this.#clientName}.isHost`);
  }
  async _connect() {
    this.#deepstreamClient.on("error", (error, event, topic) =>
      log.error("error", error, event, topic)
    );
    this.#deepstreamClient.on("connectionStateChanged", (connectionState) =>
      log.log("connectionStateChanged", connectionState)
    );
    await this.#deepstreamClient.login({ username: this.#clientName });
    log.log("RoomManager login complete", this.#clientName);
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
      this.#deepstreamClient.close();
    });
    this.#deepstreamClient.presence.subscribe(async (username, isLoggedIn) => {
      console.log.log(`${username} ${isLoggedIn ? "arrived" : "left"}`);
      if (isLoggedIn) return;
      // participant should have removed self from room before logging out
      // if they didn't, remove them
      if (await this._participantInRoom(username)) {
        log.warn(`Participant ${username} left unexpectedly`);
        //this.#roomData.set(`participants.${username}`, undefined);
        this.#roomData.set(`participants.${username}.isHost`, false);
        await this._chooseHost();
      }
    });
    await this._removeDisconnectedPartipants();
    await this._chooseHost();
    await this.#roomData.whenReady();
    setInterval(this.displayParticipants.bind(this), 100);
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
      return log.warn(
        "There are no participants in this room. Hopefully this is the last particpant to leave."
      );
    }
    // count hosts
    let hostsFound = 0;
    for (const name in participants) {
      if (participants[name].isHost === true) hostsFound++;
    }
    if (hostsFound === 0) {
      log.log("Found 0 hosts!");
      // roomData/participants contains clients that are in the room
      // but some may be (temporarily) disconnected and shouldn't be made host
      // so choose host from intersection of inRoom and onLine
      const inRoom = Object.keys(participants);
      const onLine = await this._getAllClientsAndMe();
      // console.log.log("inRoom", inRoom);
      // console.log.log("onLine", onLine);
      let intersection = inRoom.filter((user) => onLine.includes(user));
      // console.log.log("intersection", onLine);
      const newHostName = intersection.sort()[0];
      // @todo, maybe only set host if this client the new host
      log.log("Setting new host:", newHostName);
      this.#roomData.set(`participants.${newHostName}.isHost`, true);
    }
    if (hostsFound > 1) {
      return log.error(`Something went wrong. Found ${hostsFound} hosts!`);
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

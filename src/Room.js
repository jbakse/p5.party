import { createEmitter } from "./emitter";
import { Record } from "./Record";
import * as log from "./log";

export class Room {
  #client;
  #appName;
  #roomName;
  #isReady;
  #emitter;
  #record;
  #participants;

  constructor(client, appName, roomName) {
    this.#client = client;
    this.#appName = appName;
    this.#roomName = roomName;
    this.#isReady = false;
    this.#emitter = createEmitter();
    this._connect();
  }

  async _connect() {
    await this.#client.whenReady();

    const recordName = `${this.#appName}-${this.#roomName}/_room_data`;
    this.#record = this.#client.getRecord(recordName);
    await this.#record.whenReady();

    // create participants list if it doesn't exist
    if (!this.#record.get("participants")) {
      this.#record.set("participants", []);
    }
    await this.#record.whenReady();

    // listen for participants joining and leaving room
    this.#participants = this.#record.get("participants");
    this.#record.subscribe("participants", (data) => {
      this.#participants = data;
      this._chooseHost();
    });

    // listen for clients connecting and disconnecting
    this.#client.presenceSubscribe(this._onPresenceHandler.bind(this));

    // ready
    this.#isReady = true;
    this.#emitter.emit("ready");

    setInterval(this._displayParticipants.bind(this), 100);
  }

  // whenReady returns a promise AND calls a callback
  whenReady(cb = () => {}) {
    if (this.#isReady) {
      cb();
      return Promise.resolve();
    } else {
      this.#emitter.once("ready", cb);
      return new Promise((resolve) => {
        this.#emitter.once("ready", resolve);
      });
    }
  }

  getRecord(id) {
    return new Record(this.#client, `${this.#appName}-${this.#roomName}/${id}`);
  }

  // add this client to the room
  join() {
    const name = this.#client.name();
    if (!this.#participants.includes(name)) {
      this.#record.set(`participants.${this.#participants.length}`, name);
    }
  }

  // remove this client from the room
  leave() {
    const newParticipants = this.#participants.filter(
      (p) => p !== this.#client.name()
    );
    this.#record.set(`participants`, newParticipants);
  }

  // check if this client is in the room
  contains(username) {
    return this.#participants.includes(username);
  }

  getHostName() {
    return this.#record.get(`host`);
  }

  async removeDisconnectedClients() {
    const online = await this.#client.getAllClients();
    const newParticipants = this.#participants.filter((p) =>
      online.includes(p)
    );
    this.#record.set(`participants`, newParticipants);
  }

  _onPresenceHandler(username, isLoggedIn) {
    console.log(username, isLoggedIn ? "arrived" : "left");
    if (!this.contains(username)) return;

    if (isLoggedIn) {
      log.warn(`Participant ${username} reconnected.`);
      this._chooseHost();
    }
    if (!isLoggedIn) {
      log.warn(`Participant ${username} disconnected.`);
      this._chooseHost();
    }
  }

  async _chooseHost() {
    const host = this.#record.get("host");
    const onlineClients = await this.#client.getAllClients();

    // if host is online, we don't need a new one
    if (onlineClients.includes(host)) return;

    // pick the first client that is online as the new host
    let newHost = this.#participants.find((p) => onlineClients.includes(p));

    // if we didn't find one, return
    if (!newHost) {
      log.debug("couldn't find a host in participants:", this.#participants);
      return;
    }

    // have only the new host set host so that multiple clients
    // don't try to set the host at once, causing problems with DS
    if (newHost === this.#client.name()) {
      log.debug("!!!!!Setting new host:", newHost);
      this.#record.set("host", newHost);
    }
  }

  async _displayParticipants() {
    // create element if needed
    let el = document.getElementById("_sharedParticipants");
    if (!el) {
      el = document.createElement("div");
      el.id = "_sharedParticipants";
      el.style.fontFamily = "monospace";
      document.body.appendChild(el);
    }

    // collect info
    const onlineClients = await this.#client.getAllClients();

    // generate output
    let output = `${this.#appName}-${this.#roomName}: `;

    for (const name of this.#participants) {
      const shortName = name.substr(-4);
      const isHost = this.#record.get(`host`) === name ? "H" : "";
      const isMissing = !onlineClients.includes(name) ? "!" : "";
      const isMe = this.#client.name() === name ? "M" : "";

      output += `${shortName}:${isHost}${isMe}${isMissing} `;
    }

    el.textContent = output;
  }
}

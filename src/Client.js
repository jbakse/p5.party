import { DeepstreamClient } from "@deepstream/client";
import { createEmitter } from "./emitter";
import * as log from "./log";

/*
 * Client
 *
 * Wraps and manages a deepstream client connection.
 * Keeps an up to date list of connected clients.
 *
 */
export class Client {
  #uid; // uid: provided by deepstream
  #dsClient; // DeepstreamClient: wrapped by this Client
  #clientUids = []; // [uid]: currently connected clients

  #isReady;
  #emitter;

  constructor(host) {
    this.#dsClient = new DeepstreamClient(host);
    this.#uid = this.#dsClient.getUid();
    this.#dsClient.on("error", (error, event, topic) =>
      log.error("error", error, event, topic)
    );
    // this.#dsClient.on("connectionStateChanged", (connectionState) =>
    //   log.debug("connectionStateChanged", connectionState)
    // );

    // get current connected clients and subscribe for updates
    this.#dsClient.presence.getAll((error, usernames) => {
      this.#clientUids = usernames;
    });
    this.#dsClient.presence.subscribe(async (username, isLoggedIn) => {
      this.#clientUids = await this.#dsClient.presence.getAll();
    });

    this.#isReady = false;
    this.#emitter = createEmitter();
    this.#dsClient.login({ username: this.#uid }, () => {
      this.#isReady = true;
      this.#emitter.emit("ready");
    });
  }

  // whenReady returns a promise AND calls a callback
  whenReady(cb) {
    if (this.#isReady) {
      if (typeof cb === "function") cb();
      return Promise.resolve();
    } else {
      if (typeof cb === "function") this.#emitter.once("ready", cb);
      return new Promise((resolve) => {
        this.#emitter.once("ready", resolve);
      });
    }
  }

  getDsRecord(name) {
    if (!this.#isReady) {
      log.error("Client.getDsRecord() called before client ready.");
    }
    return this.#dsClient.record.getRecord(name);
  }

  getList(name) {
    if (!this.#isReady) {
      log.error("Client.getList() called before client ready.");
    }
    return this.#dsClient.record.getList(name);
  }

  getAllClients() {
    const clients = [...this.#clientUids];
    if (!clients.includes(this.#uid)) clients.push(this.#uid);
    return clients;
  }

  presenceSubscribe(cb) {
    if (!this.#isReady) {
      log.error("Client.presenceSubscribe() called before client ready.");
    }
    this.#dsClient.presence.subscribe(cb);
  }

  close() {
    this.#dsClient.close();
  }

  getUid() {
    return this.#uid;
  }

  ////////////////////////////////////////////////
  // experimental pub/sub
  subscribe(event, cb) {
    this.#dsClient.event.subscribe(event, cb);
  }

  emit(event, data) {
    this.#dsClient.event.emit(event, data);
  }
}

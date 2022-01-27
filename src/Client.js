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
  #name; // uid: provided by deepstream
  #deepstreamClient; // ds.Client: wrapped by this Client
  #clients = []; // [uid]: currently connected clients

  #isReady;
  #emitter;

  constructor(host) {
    this.#deepstreamClient = new DeepstreamClient(host);
    this.#name = this.#deepstreamClient.getUid();
    this.#deepstreamClient.on("error", (error, event, topic) =>
      log.error("error", error, event, topic)
    );
    this.#deepstreamClient.on("connectionStateChanged", (connectionState) =>
      log.debug("connectionStateChanged", connectionState)
    );

    // get current connected clients and subscribe for updates
    this.#deepstreamClient.presence.getAll((error, clients) => {
      this.#clients = clients;
    });
    this.#deepstreamClient.presence.subscribe(async (username, isLoggedIn) => {
      this.#clients = await this.#deepstreamClient.presence.getAll();
    });

    this.#isReady = false;
    this.#emitter = createEmitter();
    this.#deepstreamClient.login({ username: this.#name }, () => {
      this.#isReady = true;
      this.#emitter.emit("ready");
    });
  }

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

  getRecord(name) {
    if (!this.#isReady) {
      log.error("Client.getRecord() called before client ready.");
    }
    return this.#deepstreamClient.record.getRecord(name);
  }

  getList(name) {
    if (!this.#isReady) {
      log.error("Client.getList() called before client ready.");
    }
    return this.#deepstreamClient.record.getList(name);
  }

  getAllClients() {
    const clients = [...this.#clients];
    if (!clients.includes(this.#name)) clients.push(this.#name);
    return clients;
  }

  presenceSubscribe(cb) {
    if (!this.#isReady) {
      log.error("Client.presenceSubscribe() called before client ready.");
    }
    this.#deepstreamClient.presence.subscribe(cb);
  }

  close() {
    this.#deepstreamClient.close();
  }

  // @todo getter?
  name() {
    return this.#name;
  }

  ////////////////////////////////////////////////
  // experimental pub/sub
  subscribe(event, cb) {
    this.#deepstreamClient.event.subscribe(event, cb);
  }

  emit(event, data) {
    this.#deepstreamClient.event.emit(event, data);
  }
}

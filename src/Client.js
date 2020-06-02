import { DeepstreamClient } from "@deepstream/client";
import { createEmitter } from "./emitter";
import * as log from "./log";

/* !global DeepstreamClient */

export class Client {
  #host;
  #name;
  #isReady;
  #emitter;
  #deepstreamClient;

  constructor(host) {
    this.#host = host;
    this.#deepstreamClient = new DeepstreamClient(host);
    this.#name = this.#deepstreamClient.getUid();
    this.#deepstreamClient.on("error", (error, event, topic) =>
      log.error("error", error, event, topic)
    );
    this.#deepstreamClient.on("connectionStateChanged", (connectionState) =>
      log.debug("connectionStateChanged", connectionState)
    );
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

  async getAllClients() {
    // @todo getAllClients() will get network heavy if a lot of people
    // were on at once. we could request getAll once and then update our own
    // list with a subscription
    // or a little slower, but more reliable maybe, subscribe to changes and refetch all then
    const clients = await this.#deepstreamClient.presence.getAll();
    clients.push(this.#name);
    return clients;
  }

  presenceSubscribe(cb) {
    this.#deepstreamClient.presence.subscribe(cb);
  }

  close() {
    this.#deepstreamClient.close();
  }

  //@todo getter
  name() {
    return this.#name;
  }
}

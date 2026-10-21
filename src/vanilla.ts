// The p5party namespace: the p5.party API for plain JavaScript, no p5.js
// required. Always available as window.p5party.
//
// connect(), loadShared(), and loadMyShared() return Promises; await them
// before using the shared objects.
//
// This object is type-checked against P5PartyAPI (types.ts), the published
// API types.

import type { P5PartyAPI, JSONObject } from "./types";

import * as party from "./party";
import { installP5 } from "./p5";

export const p5party: P5PartyAPI = {
  connect(server, appName, roomName = "_main") {
    return party.connect(server, appName, roomName, "p5party.connect()");
  },

  disconnect() {
    party.disconnect("p5party.disconnect()");
  },

  loadShared<T extends object = JSONObject>(name: string, initObject?: T) {
    const caller = "p5party.loadShared()";
    const load = party.startLoadShared(name, initObject, caller);
    if (!load) return notConnected(caller);
    return load.loaded as Promise<unknown> as Promise<T>;
  },

  loadMyShared<T extends object = JSONObject>(initObject?: T) {
    const caller = "p5party.loadMyShared()";
    const load = party.startLoadMyShared(initObject ?? {}, caller);
    if (!load) return notConnected(caller);
    return load.loaded as Promise<unknown> as Promise<T>;
  },

  loadGuestShareds<T extends object = JSONObject>() {
    // returns [] (and logs an error) if called before connecting
    const guests = party.loadGuestShareds("p5party.loadGuestShareds()");
    return (guests ?? []) as unknown[] as T[];
  },

  isHost() {
    return party.isHost("p5party.isHost()");
  },

  setShared(shared, data) {
    party.setShared(
      shared as JSONObject,
      data as JSONObject,
      "p5party.setShared()"
    );
  },

  watchShared(shared: object, a: unknown, b?: unknown, c?: unknown): void {
    party.watchShared(shared as JSONObject, a, b, c, "p5party.watchShared()");
  },

  subscribe(eventName, callback) {
    party.subscribe(eventName, callback, "p5party.subscribe()");
  },

  unsubscribe(eventName, callback) {
    party.unsubscribe(eventName, callback, "p5party.unsubscribe()");
  },

  emit(eventName, data) {
    party.emit(eventName, data, "p5party.emit()");
  },

  toggleInfo(show) {
    party.toggleInfo(show, "p5party.toggleInfo()");
  },

  installP5(p5) {
    installP5(p5);
  },
};

function notConnected(caller: string): Promise<never> {
  return Promise.reject(new Error(`${caller} called before p5party.connect()`));
}

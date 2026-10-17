// The p5party namespace: the p5.party API for plain JavaScript, no p5.js
// required. Always available as window.p5party.
//
// connect(), loadShared(), and loadMyShared() return Promises; await them
// before using the shared objects.

import { JSONObject, UserData, SubscriptionCallback } from "./validate";

import * as party from "./party";

export const p5party = {
  connect(host: string, appName: string, roomName = "_main"): Promise<void> {
    return party.connect(host, appName, roomName, "p5party.connect()");
  },

  disconnect(): void {
    party.disconnect("p5party.disconnect()");
  },

  loadShared(name: string, initObject?: UserData): Promise<JSONObject> {
    const caller = "p5party.loadShared()";
    const load = party.startLoadShared(name, initObject, caller);
    if (!load) return notConnected(caller);
    return load.loaded;
  },

  loadMyShared(initObject: UserData = {}): Promise<JSONObject> {
    const caller = "p5party.loadMyShared()";
    const load = party.startLoadMyShared(initObject, caller);
    if (!load) return notConnected(caller);
    return load.loaded;
  },

  loadGuestShareds(): JSONObject[] | undefined {
    return party.loadGuestShareds("p5party.loadGuestShareds()");
  },

  isHost(): boolean {
    return party.isHost("p5party.isHost()");
  },

  setShared(shared: JSONObject, object: JSONObject): void {
    party.setShared(shared, object, "p5party.setShared()");
  },

  watchShared(shared: JSONObject, a: any, b?: any, c?: any): void {
    party.watchShared(shared, a, b, c, "p5party.watchShared()");
  },

  subscribe(event: string, cb: SubscriptionCallback): void {
    party.subscribe(event, cb, "p5party.subscribe()");
  },

  unsubscribe(event: string, cb?: SubscriptionCallback): void {
    party.unsubscribe(event, cb, "p5party.unsubscribe()");
  },

  emit(event: string, data?: UserData): void {
    party.emit(event, data, "p5party.emit()");
  },

  toggleInfo(show?: boolean): void {
    party.toggleInfo(show, "p5party.toggleInfo()");
  },
};

function notConnected(caller: string): Promise<never> {
  return Promise.reject(new Error(`${caller} called before p5party.connect()`));
}

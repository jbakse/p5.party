/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { JSONObject, UserData } from "./validate";

import * as log from "./log";
import { version } from "../version";
import { Room } from "./Room";
import { Record } from "./Record";
import { SubscriptionCallback } from "@deepstream/client/dist/src/record/record";

const p5 = (window as any).p5;

p5 ? init() : log.warn("p5.js not found.");

function init() {
  const version_string = p5.prototype.VERSION
    ? `p5.js v${p5.prototype.VERSION}`
    : "p5.js is older than 1.3.1";
  log.styled("font-weight: bold", version_string);
  log.styled("font-weight: bold", `p5.party v${version}`);

  let room: Room | null = null;

  // ! partyConnect (preload)

  p5.prototype.partyConnect = function (
    host: string,
    appName: string,
    roomName: string,
    cb?: () => void
  ) {
    if (room !== null) {
      log.warn("You should call partyConnect() only one time");
      return;
    }
    const load = async () => {
      room = new Room(host, appName, roomName);
      await room.whenConnected;
      window.addEventListener("beforeunload", () => {
        room?.disconnect();
      });

      log.log("partyConnect done!");
      this._decrementPreload();
      cb?.();
    };
    void load();
  };
  p5.prototype.registerPreloadMethod("partyConnect", p5.prototype);

  // ! partyLoadShared (preload)

  p5.prototype.registerPreloadMethod("partyLoadShared", p5.prototype);
  p5.prototype.partyLoadShared = function (
    name: string,
    initObject = {},
    cb?: (shared: JSONObject) => void
  ): JSONObject | undefined {
    if (room === null) {
      log.error("partyLoadShared() called before partyConnect()");
      return undefined;
    }
    const record = room.getRecord(name);

    const load = async () => {
      await room?.whenConnected; // room null checked above
      await record.load(initObject);
      log.log(`partyLoadShared "${name}" done!`);
      cb?.(record.shared);
      this._decrementPreload();
    };

    void load();

    return record.shared;
  };

  // ! partyLoadMyShared

  p5.prototype.registerPreloadMethod("partyLoadMyShared", p5.prototype);
  p5.prototype.partyLoadMyShared = function (
    initObject = {},
    cb?: (shared: JSONObject) => void
  ) {
    if (room === null) {
      log.error("partyLoadMyShared() called before partyConnect()");
      return undefined;
    }

    const record = room.myGuestRecord;

    const load = async () => {
      await room?.whenConnected; // room null checked above
      await record.whenLoaded;
      await record.initData(initObject);
      log.log(`partyLoadMyShared done!`);
      cb?.(record.shared);
      this._decrementPreload();
    };

    void load();

    return record.shared;
  };

  // ! partyLoadGuestShareds

  p5.prototype.partyLoadGuestShareds = function () {
    if (room === null) {
      log.error("partyLoadGuestShareds() called before partyConnect()");
      return undefined;
    }
    return room.guestShareds;
  };

  p5.prototype.partyLoadParticipantShareds = function () {
    log.warn(
      "partyLoadParticipantShareds is deprecated. Use partyLoadGuestShareds instead."
    );
    if (room === null) {
      log.error("partyLoadParticipantShareds() called before partyConnect()");
      return undefined;
    }
    return room.guestShareds;
  };

  // ! partyIsHost

  p5.prototype.partyIsHost = function (): boolean {
    if (room === null) {
      log.error("partyIsHost() called before partyConnect()");
      return false;
    }
    return room.isHost();
  };

  // ! partySetShared

  p5.prototype.partySetShared = function (
    shared: JSONObject,
    object: JSONObject
  ): void {
    if (!Record.recordForShared(shared)) {
      log.warn(
        "partySetShared() doesn't recognize the provided shared object.",
        shared
      );
      return;
    }
    Record.recordForShared(shared)?.setData(object);
  };

  // ! partyWatchShared

  p5.prototype.partyWatchShared = function (
    shared: JSONObject,
    a: any,
    b: any,
    c: any
  ): void {
    if (!Record.recordForShared(shared)) {
      log.warn(
        "partyWatchShared() doesn't recognize the provided shared object.",
        shared
      );
      return;
    }
    Record.recordForShared(shared)?.watchShared(a, b, c);
  };

  // ! partySubscribe
  p5.prototype.partySubscribe = function (
    event: string,
    cb: SubscriptionCallback
  ): void {
    if (room === null) {
      log.error("partySubscribe() called before partyConnect()");
      return;
    }
    room.subscribe(event, cb);
  };

  // ! partyUnsubscribe
  p5.prototype.partyUnsubscribe = function (
    event: string,
    cb?: SubscriptionCallback
  ): void {
    if (room === null) {
      log.error("partyUnsubscribe() called before partyConnect()");
      return;
    }
    room.unsubscribe(event, cb);
  };

  // ! partyEmit
  p5.prototype.partyEmit = function (event: string, data?: UserData): void {
    if (room === null) {
      log.error("partyEmit() called before partyConnect()");
      return;
    }
    room.emit(event, data);
  };

  p5.prototype.partyToggleInfo = function () {
    log.warn(
      "partyToggleInfo is no longer available in this version of p5.party."
    );
  };
}

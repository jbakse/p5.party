/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

// Adds the partyXyz() functions to p5.js.
//
// p5.js 1: functions are added to p5.prototype. partyConnect(),
// partyLoadShared(), and partyLoadMyShared() work in preload() and return
// immediately.
//
// p5.js 2: functions are added via p5.registerAddon(). There is no
// preload(), so those three functions return Promises to await in an async
// setup(). If the p5.js-compatibility preload add-on is loaded, they also
// work in preload() like p5.js 1.

import { JSONObject, UserData, SubscriptionCallback } from "./validate";

import { version } from "../version";
import * as log from "./log";
import * as party from "./party";

export function installP5(p5Constructor: any): void {
  if (typeof p5Constructor.registerAddon === "function") {
    p5Constructor.registerAddon(
      (registeredP5: any, fn: any, lifecycles: any) => {
        init(registeredP5, fn);
        lifecycles.presetup = waitForPreloads;
      }
    );
  } else {
    init(p5Constructor, p5Constructor.prototype);
  }
}

function supportsPreload(instance: any): boolean {
  return (
    typeof instance._incrementPreload === "function" &&
    typeof instance._decrementPreload === "function"
  );
}

// p5.js 2 + p5.js-compatibility preload add-on: loads started in preload()
const pendingPreloads: Promise<unknown>[] = [];

async function waitForPreloads() {
  // p5.js 2 calls every add-on's presetup hook before awaiting any of them,
  // and the compatibility add-on's hook runs preload() synchronously. Waiting
  // one tick lets preload() run first, even if that add-on registered after
  // p5.party.
  await Promise.resolve();
  await Promise.allSettled(pendingPreloads);
}

function withPreload<T>(
  instance: any,
  operation: Promise<T>,
  legacyResult: T | undefined,
  methodName: string
): T | undefined | Promise<T> {
  // p5.js 2 + p5.js-compatibility preload add-on, called from preload()
  if (instance._isInPreload === true) {
    pendingPreloads.push(
      operation.catch((error: unknown) => {
        log.error(`${methodName} failed`, error);
      })
    );
    return legacyResult;
  }

  if (!supportsPreload(instance)) return operation;

  // p5.js 1 increments the preload count for us, but only when the method is
  // called from preload() (see registerPreloadMethod in init). Incrementing
  // here would let older p5.js 1.x versions re-run setup() when these methods
  // are called after preload.
  void operation.then(
    () => instance._decrementPreload(),
    (error: unknown) => {
      instance._decrementPreload();
      log.error(`${methodName} failed`, error);
    }
  );
  return legacyResult;
}

function init(p5Constructor: any, fn: any) {
  const p5Version = p5Constructor.VERSION ?? p5Constructor.prototype.VERSION;
  const version_string = p5Version
    ? `p5.js v${String(p5Version)}`
    : "p5.js is older than 1.3.1";
  log.styled("font-weight: bold", version_string);
  log.styled("font-weight: bold", `p5.party v${version}`);

  // p5.js 1: have p5 track these as preload methods
  if (typeof fn.registerPreloadMethod === "function") {
    fn.registerPreloadMethod("partyConnect", fn);
    fn.registerPreloadMethod("partyLoadShared", fn);
    fn.registerPreloadMethod("partyLoadMyShared", fn);
  }

  /// partyConnect (preload)

  fn.partyConnect = function (
    host: string,
    appName: string,
    roomName = "_main",
    cb?: () => void
  ) {
    const connected = party
      .connect(host, appName, roomName, "partyConnect()")
      .then(() => cb?.());
    return withPreload(this, connected, undefined, "partyConnect()");
  };

  fn.partyDisconnect = function () {
    party.disconnect("partyDisconnect()");
  };

  /// partyLoadShared (preload)

  fn.partyLoadShared = function (
    name: string,
    initObject?: UserData,
    cb?: (shared: JSONObject) => void
  ): JSONObject | undefined | Promise<JSONObject> {
    const load = party.startLoadShared(name, initObject, "partyLoadShared()");
    if (!load) return undefined;
    const loaded = load.loaded.then((shared) => {
      cb?.(shared);
      return shared;
    });
    return withPreload(this, loaded, load.shared, "partyLoadShared()");
  };

  /// partyLoadMyShared (preload)

  fn.partyLoadMyShared = function (
    initObject: UserData = {},
    cb?: (shared: JSONObject) => void
  ): JSONObject | undefined | Promise<JSONObject> {
    const load = party.startLoadMyShared(initObject, "partyLoadMyShared()");
    if (!load) return undefined;
    const loaded = load.loaded.then((shared) => {
      cb?.(shared);
      return shared;
    });
    return withPreload(this, loaded, load.shared, "partyLoadMyShared()");
  };

  /// partyLoadGuestShareds

  fn.partyLoadGuestShareds = function () {
    return party.loadGuestShareds("partyLoadGuestShareds()");
  };

  fn.partyLoadParticipantShareds = function () {
    log.warn(
      "partyLoadParticipantShareds is deprecated. Use partyLoadGuestShareds instead."
    );
    return party.loadGuestShareds("partyLoadParticipantShareds()");
  };

  /// partyIsHost

  fn.partyIsHost = function (): boolean {
    return party.isHost("partyIsHost()");
  };

  /// partySetShared

  fn.partySetShared = function (shared: JSONObject, object: JSONObject): void {
    party.setShared(shared, object, "partySetShared()");
  };

  /// partyWatchShared

  fn.partyWatchShared = function (
    shared: JSONObject,
    a: any,
    b: any,
    c: any
  ): void {
    party.watchShared(shared, a, b, c, "partyWatchShared()");
  };

  /// partySubscribe

  fn.partySubscribe = function (event: string, cb: SubscriptionCallback): void {
    party.subscribe(event, cb, "partySubscribe()");
  };

  /// partyUnsubscribe

  fn.partyUnsubscribe = function (
    event: string,
    cb?: SubscriptionCallback
  ): void {
    party.unsubscribe(event, cb, "partyUnsubscribe()");
  };

  /// partyEmit

  fn.partyEmit = function (event: string, data?: UserData): void {
    party.emit(event, data, "partyEmit()");
  };

  /// partyToggleInfo

  fn.partyToggleInfo = function (show?: boolean) {
    party.toggleInfo(show, "partyToggleInfo()");
  };
}

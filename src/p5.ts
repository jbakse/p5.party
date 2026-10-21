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

import type { P5PartyFunctions, JSONObject } from "./types";

import { version } from "../version";
import * as log from "./log";
import * as party from "./party";

// p5 constructors already set up, so installP5() is safe to call twice (e.g.
// automatically at load and again by p5party.installP5() in a bundler)
const installed = new WeakSet<object>();

export function installP5(p5Constructor: any): void {
  if (!p5Constructor || installed.has(p5Constructor)) return;
  installed.add(p5Constructor);

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

  // The functions are typed against P5PartyFunctions (types.ts), the
  // published API types. `this` is the p5 instance they're called on.
  const functions: P5PartyFunctions = {
    /// partyConnect (preload)

    partyConnect(this: any, server, appName, roomName = "_main", callback) {
      const connected = party
        .connect(server, appName, roomName, "partyConnect()")
        .then(() => callback?.());
      return withPreload(this, connected, undefined, "partyConnect()");
    },

    partyDisconnect() {
      party.disconnect("partyDisconnect()");
    },

    /// partyLoadShared (preload)

    partyLoadShared<T extends object = JSONObject>(
      this: any,
      name: string,
      initObject?: T,
      callback?: (shared: T) => void
    ): T {
      const load = party.startLoadShared(name, initObject, "partyLoadShared()");
      if (!load) return undefined as unknown as T;
      const loaded = load.loaded.then((shared) => {
        callback?.(shared as unknown as T);
        return shared;
      });
      // p5.js 1: the shared object; p5.js 2: a Promise (see P5PartyFunctions)
      return withPreload(
        this,
        loaded,
        load.shared,
        "partyLoadShared()"
      ) as unknown as T;
    },

    /// partyLoadMyShared (preload)

    partyLoadMyShared<T extends object = JSONObject>(
      this: any,
      initObject?: T,
      callback?: (shared: T) => void
    ): T {
      const load = party.startLoadMyShared(
        initObject ?? {},
        "partyLoadMyShared()"
      );
      if (!load) return undefined as unknown as T;
      const loaded = load.loaded.then((shared) => {
        callback?.(shared as unknown as T);
        return shared;
      });
      return withPreload(
        this,
        loaded,
        load.shared,
        "partyLoadMyShared()"
      ) as unknown as T;
    },

    /// partyLoadGuestShareds

    partyLoadGuestShareds<T extends object = JSONObject>(): T[] {
      const guests = party.loadGuestShareds("partyLoadGuestShareds()");
      return (guests ?? []) as unknown[] as T[];
    },

    partyLoadParticipantShareds<T extends object = JSONObject>(): T[] {
      log.warn(
        "partyLoadParticipantShareds is deprecated. Use partyLoadGuestShareds instead."
      );
      const guests = party.loadGuestShareds("partyLoadParticipantShareds()");
      return (guests ?? []) as unknown[] as T[];
    },

    /// partyIsHost

    partyIsHost() {
      return party.isHost("partyIsHost()");
    },

    /// partySetShared

    partySetShared(shared, data) {
      party.setShared(
        shared as JSONObject,
        data as JSONObject,
        "partySetShared()"
      );
    },

    /// partyWatchShared

    partyWatchShared(shared: object, a: any, b?: any, c?: any): void {
      party.watchShared(shared as JSONObject, a, b, c, "partyWatchShared()");
    },

    /// partySubscribe

    partySubscribe(eventName, callback) {
      party.subscribe(eventName, callback, "partySubscribe()");
    },

    /// partyUnsubscribe

    partyUnsubscribe(eventName, callback) {
      party.unsubscribe(eventName, callback, "partyUnsubscribe()");
    },

    /// partyEmit

    partyEmit(eventName, data) {
      party.emit(eventName, data, "partyEmit()");
    },

    /// partyToggleInfo

    partyToggleInfo(show) {
      party.toggleInfo(show, "partyToggleInfo()");
    },
  };

  Object.assign(fn, functions);
}

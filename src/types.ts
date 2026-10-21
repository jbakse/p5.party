// The public p5.party API types.
//
// This file is the single source of truth for p5.party's published types.
// `npm run build` compiles it into types/p5.party.d.ts. The implementations
// in vanilla.ts and p5.ts are type-checked against these interfaces, so the
// published types can't drift from the code.
//
// This file must stay self-contained (no imports), so the generated .d.ts
// doesn't depend on deepstream's internal types.

/** Any value that can be stored in a shared object: JSON data. */
export type JSONValue =
  null | boolean | number | string | JSONValue[] | { [key: string]: JSONValue };

/** A plain data object that can be shared. */
export type JSONObject = { [key: string]: JSONValue };

/** Called with the new value when a watched shared object changes. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WatchCallback = (data: any) => void;

/** Called with the message data when a subscribed event is received. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventCallback = (data: any) => void;

/**
 * The p5.party API for plain JavaScript (no p5.js required).
 *
 * Available as the global `p5party`, or with
 * `import { p5party } from "p5.party"`.
 *
 * About the type parameters on the load functions: they let you describe
 * the shape of your shared data, but p5.party doesn't check it. Starting
 * values only apply when the room is empty, and other clients (or an older
 * version of your sketch) may have written different data.
 */
export interface P5PartyAPI {
  /**
   * Connects to a p5.party server. Call this before the other functions.
   * @param server the server url, e.g. `"wss://demoserver.p5party.org"`
   * @param appName a unique name for your app, e.g. `"jbakse_pong"`
   * @param roomName optional room name, default `"_main"`
   * @returns resolves when the connection is ready
   */
  connect(server: string, appName: string, roomName?: string): Promise<void>;

  /**
   * Disconnects from the server. Shared objects stop syncing.
   */
  disconnect(): void;

  /**
   * Loads (or creates) the shared object with the given name.
   * @param name the name of the shared object on the server
   * @param initObject starting values, used only if the room is empty
   * @returns resolves to the shared object once it's loaded
   * @throws (rejects) if called before `connect()`
   */
  loadShared<T extends object = JSONObject>(
    name: string,
    initObject?: T
  ): Promise<T>;

  /**
   * Loads this client's own shared object ("myShared"), which every other
   * client can see in `loadGuestShareds()`.
   * @param initObject starting values
   * @returns resolves to this client's shared object once it's loaded
   * @throws (rejects) if called before `connect()`
   */
  loadMyShared<T extends object = JSONObject>(initObject?: T): Promise<T>;

  /**
   * Returns a live array of every guest's "myShared" object, including this
   * client's. The array updates as guests join, leave, and add data.
   *
   * Guests with empty shared objects are left out. But a guest's object may
   * not have the properties you expect yet (or another sketch using the same
   * app name may have written different data), so check before using it,
   * e.g. `if (typeof guest.x !== "number") continue;`.
   *
   * Call after connecting.
   */
  loadGuestShareds<T extends object = JSONObject>(): T[];

  /**
   * Returns true if this client is the room's host. Every room with guests
   * has exactly one host.
   */
  isHost(): boolean;

  /**
   * Replaces all of a shared object's properties with `data` (not merged).
   * `setShared(shared, {})` clears it.
   */
  setShared<T extends object>(shared: T, data: Partial<T>): void;

  /**
   * Calls `callback` when the shared object changes.
   * @param triggerNow also call `callback` right away
   */
  watchShared<T extends object>(
    shared: T,
    callback: WatchCallback,
    triggerNow?: boolean
  ): void;
  /**
   * Calls `callback` when the value at `path` on the shared object changes.
   * @param path a property path, e.g. `"position.x"`
   * @param triggerNow also call `callback` right away
   */
  watchShared<T extends object>(
    shared: T,
    path: string,
    callback: WatchCallback,
    triggerNow?: boolean
  ): void;

  /**
   * Calls `callback` whenever a message named `eventName` is emitted in
   * this room (by any client, including this one).
   */
  subscribe(eventName: string, callback: EventCallback): void;

  /**
   * Stops listening for `eventName`. Without a callback, removes all of
   * this client's callbacks for that event.
   */
  unsubscribe(eventName: string, callback?: EventCallback): void;

  /**
   * Sends a message to every client in the room (including this one).
   * @param data optional JSON data to send with the message
   */
  emit(eventName: string, data?: JSONValue): void;

  /**
   * Shows, hides, or toggles the info panel (also `ctrl-i`).
   * @param show `true` to show, `false` to hide, omit to toggle
   */
  toggleInfo(show?: boolean): void;

  /**
   * Adds the `partyXyz()` functions to p5.js.
   *
   * You only need this if p5.js isn't a global when p5.party loads, e.g.
   * `import p5 from "p5"` in a bundler. With `<script>` tags, p5.party does
   * this for you. Call it before creating your sketch.
   * @param p5 the p5 constructor
   */
  installP5(p5: unknown): void;
}

/**
 * The p5.js functions that p5.party adds (global mode, or on the sketch
 * object in instance mode). They exist only when p5.js is loaded.
 *
 * p5.js 1 vs p5.js 2: `partyConnect()`, `partyLoadShared()`, and
 * `partyLoadMyShared()` return right away in p5.js 1 (use them in
 * `preload()`), but return Promises in p5.js 2 (`await` them in an `async`
 * `setup()`). The load functions are typed as returning the shared object,
 * which is right for p5.js 1 and for `await` in p5.js 2. TypeScript can't
 * tell which p5.js version you're using, so it won't catch a missing
 * `await` in p5.js 2.
 */
export interface P5PartyFunctions {
  /**
   * Connects to a p5.party server. Call it in `preload()` (p5.js 1) or
   * `await` it in an async `setup()` (p5.js 2).
   * @param server the server url, e.g. `"wss://demoserver.p5party.org"`
   * @param appName a unique name for your app, e.g. `"jbakse_pong"`
   * @param roomName optional room name, default `"_main"`
   * @param callback optional, called when the connection is ready
   */
  partyConnect(
    server: string,
    appName: string,
    roomName?: string,
    callback?: () => void
  ): void | Promise<void>;

  /** Disconnects from the server. Shared objects stop syncing. */
  partyDisconnect(): void;

  /**
   * Loads (or creates) the shared object with the given name. In p5.js 1,
   * call it in `preload()`; in p5.js 2, `await` it.
   * @param initObject starting values, used only if the room is empty
   * @param callback optional, called with the shared object when it's ready
   */
  partyLoadShared<T extends object = JSONObject>(
    name: string,
    initObject?: T,
    callback?: (shared: T) => void
  ): T;

  /**
   * Loads this client's own shared object ("myShared"). In p5.js 1, call it
   * in `preload()`; in p5.js 2, `await` it.
   * @param initObject starting values
   * @param callback optional, called with the shared object when it's ready
   */
  partyLoadMyShared<T extends object = JSONObject>(
    initObject?: T,
    callback?: (shared: T) => void
  ): T;

  /**
   * Returns a live array of every guest's "myShared" object. Guests with
   * empty objects are left out, but check that a guest has the properties
   * you need before using them. See `p5party.loadGuestShareds()`.
   */
  partyLoadGuestShareds<T extends object = JSONObject>(): T[];

  /** @deprecated Use `partyLoadGuestShareds()` instead. */
  partyLoadParticipantShareds<T extends object = JSONObject>(): T[];

  /** Returns true if this client is the room's host. */
  partyIsHost(): boolean;

  /** Replaces all of a shared object's properties with `data`. */
  partySetShared<T extends object>(shared: T, data: Partial<T>): void;

  /** Calls `callback` when the shared object changes. */
  partyWatchShared<T extends object>(
    shared: T,
    callback: WatchCallback,
    triggerNow?: boolean
  ): void;
  /** Calls `callback` when the value at `path` on the shared object changes. */
  partyWatchShared<T extends object>(
    shared: T,
    path: string,
    callback: WatchCallback,
    triggerNow?: boolean
  ): void;

  /** Calls `callback` whenever a message named `eventName` is emitted. */
  partySubscribe(eventName: string, callback: EventCallback): void;

  /** Stops listening for `eventName` (all callbacks if none is given). */
  partyUnsubscribe(eventName: string, callback?: EventCallback): void;

  /** Sends a message to every client in the room (including this one). */
  partyEmit(eventName: string, data?: JSONValue): void;

  /** Shows, hides, or toggles the info panel (also `ctrl-i`). */
  partyToggleInfo(show?: boolean): void;
}

/** The p5.party API for plain JavaScript (no p5.js required). */
export declare const p5party: P5PartyAPI;

/** Adds the `partyXyz()` functions to p5.js. See `p5party.installP5()`. */
export declare function installP5(p5: unknown): void;

declare global {
  // `var` (not `const`) so these are also properties of `window`
  /* eslint-disable no-var */

  /** The p5.party API for plain JavaScript (no p5.js required). */
  var p5party: P5PartyAPI;

  var partyConnect: P5PartyFunctions["partyConnect"];
  var partyDisconnect: P5PartyFunctions["partyDisconnect"];
  var partyLoadShared: P5PartyFunctions["partyLoadShared"];
  var partyLoadMyShared: P5PartyFunctions["partyLoadMyShared"];
  var partyLoadGuestShareds: P5PartyFunctions["partyLoadGuestShareds"];
  /** @deprecated Use `partyLoadGuestShareds()` instead. */
  var partyLoadParticipantShareds: P5PartyFunctions["partyLoadParticipantShareds"];
  var partyIsHost: P5PartyFunctions["partyIsHost"];
  var partySetShared: P5PartyFunctions["partySetShared"];
  var partyWatchShared: P5PartyFunctions["partyWatchShared"];
  var partySubscribe: P5PartyFunctions["partySubscribe"];
  var partyUnsubscribe: P5PartyFunctions["partyUnsubscribe"];
  var partyEmit: P5PartyFunctions["partyEmit"];
  var partyToggleInfo: P5PartyFunctions["partyToggleInfo"];
  /* eslint-enable no-var */
}

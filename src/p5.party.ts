/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
declare let p5: any;

import { JSONObject, UserData } from "./validate";
import { SubscriptionCallback } from "@deepstream/client/dist/src/record/record";

import { version } from "../version";
import * as log from "./log";
import { Room } from "./Room";
import { Record } from "./Record";
import { createInfo, destroyInfo } from "./info";

if (typeof window !== "undefined") {
  (window as any).p5party = {
    Room,
    Record,
  };

  const p5Constructor = (window as any).p5;
  if (!p5Constructor) {
    log.warn("p5.js not found.");
  } else if (typeof p5Constructor.registerAddon === "function") {
    p5Constructor.registerAddon((registeredP5: any, fn: any) =>
      init(registeredP5, fn)
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

function withPreload<T>(
  instance: any,
  operation: Promise<T>,
  legacyResult: T | undefined,
  methodName: string
): T | undefined | Promise<T> {
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
    ? `p5.js v${p5Version}`
    : "p5.js is older than 1.3.1";
  log.styled("font-weight: bold", version_string);
  log.styled("font-weight: bold", `p5.party v${version}`);

  let room: Room | null = null;

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
    if (room !== null) {
      log.warn("You should call partyConnect() only one time");
      return;
    }
    const load = async () => {
      // connect room
      room = new Room(host, appName, roomName);
      await room.whenConnected;
      window.addEventListener("beforeunload", () => {
        room?.disconnect();
      });

      // install ctrl-i inspector pane binding
      document.addEventListener(
        "keyup",
        (e) => {
          if (e.ctrlKey && e.key === "i") {
            fn.partyToggleInfo();
          }
        },
        false
      );

      // check for auto reload
      await experimentalAutoReload();

      // install p5PartyEvents
      room.subscribe("p5PartyEvent", (data: JSONObject) => {
        // function handleAction() {
        if (!room) return;

        // reload-others
        if (
          data.action === "reload-others" &&
          data.sender != room.info().guestName
        ) {
          log.log("Recieved reload-others p5PartyEvent. Reloading...");
          window.location.reload();
        }

        // disconnect-others
        if (
          data.action === "disconnect-others" &&
          data.sender != room.info().guestName
        ) {
          log.log("Recieved disconnect-others p5PartyEvent. Disconnecting...");
          room.disconnect();
          void createInfo(room);
        }
        // }
        // void handleAction();
      });
      // finish up
      log.log("partyConnect done!");
      cb?.();
    };
    return withPreload(this, load(), undefined, "partyConnect()");
  };

  /// experimental auto reload
  /**
      EXPERIMENTAL FEATURE: Auto reloading When developing a sketch that uses
      p5.party, it is usually best to have all connected clients reload when the
      code changes. 

      When working in VS Code with Live Server, saving the code auto reloads all
      local browser tabs running the code, which is usually good enough. When
      working with the p5 web editor saving the code will reload the sketch in
      the same tab, but not in other tabs/windows.

      This feature is intended to make working in the p5 web editor (or similar
      environments) easier by reloaded all other connected clients when the
      "primary" client reloads. 

      To use this you would open the info panel (ctrl-i) and enable the "auto"
      checkbox. When enabled, reloading the tab will send a message to all other
      connected clients to reload.

      Reloading happens immediately after the "auto" guest connects, making the
      "auto" guest the host before it's setup() is called.
      */

  fn.partyDisconnect = function () {
    if (room === null) {
      log.error("partyDisconnect() called before partyConnect()");
      return;
    }
    room.disconnect();
  };

  async function experimentalAutoReload() {
    if (!room) return; //
    // check if this tab has "auto" enabled
    const auto = sessionStorage.getItem("auto") === "true";
    log.log("Experimental Auto:", auto);

    // if auto is enabled...
    if (auto) {
      // ...reload others and...
      log.log("Auto enabled. Reloading others...");
      room.emit("p5PartyEvent", {
        action: "auto-reload-others",
        sender: room.info().guestName,
      });
      // ...wait until this tab becomes the host...
      while (!room.isHost()) {
        log.log("Waiting...");
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    // install the auto-reload-others event listener
    room.subscribe("p5PartyEvent", async (data: JSONObject) => {
      // async function handleAction() {
      if (!room) return;

      // when we get an auto-reload-others message...
      if (
        data.action === "auto-reload-others" &&
        data.sender != room.info().guestName
      ) {
        // ... first remove the auto flag if it's set, otherwise this client
        // will send a reload message back, forming an endless loop ...
        const auto = sessionStorage.getItem("auto") === "true";
        if (auto) {
          log.alert(
            "Recieved auto-reload-others p5PartyEvent, but auto is set. Disabling auto..."
          );
          sessionStorage.setItem("auto", "false");
        }

        // ... then disconnect and reload
        log.log("Recieved auto-reload-others p5PartyEvent. Disconnecting...");
        room.disconnect();
        await new Promise((r) => setTimeout(r, 500));
        log.log("Reloading...");
        window.location.reload();
      }
      // }
      // void handleAction();
    });
  }
  /// partyLoadShared (preload)

  fn.partyLoadShared = function (
    name: string,
    initObject?: UserData,
    cb?: (shared: JSONObject) => void
  ): JSONObject | undefined | Promise<JSONObject> {
    if (room === null) {
      log.error("partyLoadShared() called before partyConnect()");
      return undefined;
    }
    const record = room.getRecord(name);

    const load = async () => {
      await room?.whenConnected; // room null checked above

      const overwrite = room?.isHost() === true;
      await record.load(initObject, overwrite);
      log.log(`partyLoadShared "${name}" done!`);
      cb?.(record.shared);
      return record.shared;
    };

    return withPreload(this, load(), record.shared, "partyLoadShared()");
  };

  /// partyLoadMyShared

  fn.partyLoadMyShared = function (
    initObject = {},
    cb?: (shared: JSONObject) => void
  ): JSONObject | undefined | Promise<JSONObject> {
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
      return record.shared;
    };

    return withPreload(this, load(), record.shared, "partyLoadMyShared()");
  };

  /// partyLoadGuestShareds

  fn.partyLoadGuestShareds = function () {
    if (room === null) {
      log.error("partyLoadGuestShareds() called before partyConnect()");
      return undefined;
    }
    return room.guestShareds;
  };

  fn.partyLoadParticipantShareds = function () {
    log.warn(
      "partyLoadParticipantShareds is deprecated. Use partyLoadGuestShareds instead."
    );
    if (room === null) {
      log.error("partyLoadParticipantShareds() called before partyConnect()");
      return undefined;
    }
    return room.guestShareds;
  };

  /// partyIsHost

  fn.partyIsHost = function (): boolean {
    if (room === null) {
      log.error("partyIsHost() called before partyConnect()");
      return false;
    }
    return room.isHost();
  };

  /// partySetShared

  fn.partySetShared = function (shared: JSONObject, object: JSONObject): void {
    if (!Record.recordForShared(shared)) {
      log.warn(
        "partySetShared() doesn't recognize the provided shared object.",
        shared
      );
      return;
    }
    Record.recordForShared(shared)?.setData(object);
  };

  /// partyWatchShared

  fn.partyWatchShared = function (
    shared: JSONObject,
    a: any,
    b: any,
    c: any
  ): void {
    if (!Record.recordForShared(shared)) {
      log.warn(
        "partyWatchShared() expected shared (argument 1) to be shared object.",
        shared
      );
      return;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */
    Record.recordForShared(shared)?.watchShared(a, b, c);
  };

  /// partySubscribe
  fn.partySubscribe = function (event: string, cb: SubscriptionCallback): void {
    if (room === null) {
      log.error("partySubscribe() called before partyConnect()");
      return;
    }
    room.subscribe(event, cb);
  };

  /// partyUnsubscribe
  fn.partyUnsubscribe = function (
    event: string,
    cb?: SubscriptionCallback
  ): void {
    if (room === null) {
      log.error("partyUnsubscribe() called before partyConnect()");
      return;
    }
    room.unsubscribe(event, cb);
  };

  /// partyEmit
  fn.partyEmit = function (event: string, data?: UserData): void {
    if (room === null) {
      log.error("partyEmit() called before partyConnect()");
      return;
    }
    room.emit(event, data);
  };

  let isInfoShown = false;
  fn.partyToggleInfo = function (show?: boolean) {
    if (room === null) {
      log.error("partyToggleInfo() called before partyConnect()");
      return;
    }

    isInfoShown = show ?? !isInfoShown;

    if (isInfoShown) {
      void createInfo(room);
    } else {
      destroyInfo();
    }
  };
}

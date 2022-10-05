/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { JSONObject, UserData } from "./validate";
import { SubscriptionCallback } from "@deepstream/client/dist/src/record/record";

import { version } from "../version";
import * as log from "./log";
import { Room } from "./Room";
import { Record } from "./Record";
import { createInfo, destroyInfo } from "./info";

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

      document.addEventListener(
        "keyup",
        (e) => {
          if (e.ctrlKey && e.key === "i") {
            p5.prototype.partyToggleInfo();
          }
        },
        false
      );

      // Auto reloading
      // When iterating, it is usually best to have all connected clients reload
      // when the code changes. This can be set up on local dev easily, but
      // the p5 web editor doesn't support this.
      // The auto setting, which can be manually enabled from the info panel tells p5 party to automatically reload all other guests in the room when the "auto" guest is reloaded.
      // Reloading happens immediately after the auto guest connects, making the auto guest the host before setup() is called.

      const auto = sessionStorage.getItem("auto") === "true";
      log.log("Auto:", auto);
      if (auto) {
        log.log("Auto enabled. Reloading others...");
        room.emit("p5PartyEvent", {
          action: "disconnect-reload",
          sender: room.info().guestName,
        });
        // await become host
        while (!room.isHost()) {
          log.log("Waiting...");
          await new Promise((r) => setTimeout(r, 100));
        }
      }

      room.subscribe("p5PartyEvent", (data: JSONObject) => {
        async function handleAction() {
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
            log.log(
              "Recieved disconnect-others p5PartyEvent. Disconnecting..."
            );
            room.disconnect();
            void createInfo(room);
          }

          // disconnect-reload;
          if (
            data.action === "disconnect-reload" &&
            data.sender != room.info().guestName
          ) {
            const auto = sessionStorage.getItem("auto") === "true";
            if (auto) {
              log.alert(
                "Recieved disconnect-reload p5PartyEvent, but auto is set. Disabling auto..."
              );
              sessionStorage.setItem("auto", "false");
            }
            log.log(
              "Recieved disconnect-reload p5PartyEvent. Disconnecting..."
            );
            room.disconnect();
            await new Promise((r) => setTimeout(r, 500));
            log.log("Reloading...");
            window.location.reload();
          }
        }
        void handleAction();
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
    initObject?: UserData,
    cb?: (shared: JSONObject) => void
  ): JSONObject | undefined {
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

  let isInfoShown = false;
  p5.prototype.partyToggleInfo = function (show?: boolean) {
    if (room === null) {
      log.error("partyToggleInfo() called before partyConnect()");
      return;
    }

    if (show === undefined) {
      isInfoShown = !isInfoShown;
    } else {
      isInfoShown = show;
    }
    if (isInfoShown) {
      void createInfo(room);
    } else {
      destroyInfo();
    }
  };
}

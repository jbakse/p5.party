/* eslint-disable @typescript-eslint/no-unsafe-argument */

// The framework-agnostic core of p5.party. It owns the connection to the
// room and implements the API. The p5 adapter (p5.ts) and the vanilla
// p5party namespace (vanilla.ts) are thin wrappers around these functions.

import { JSONObject, UserData, SubscriptionCallback } from "./validate";

import * as log from "./log";
import { Room } from "./Room";
import { Record } from "./Record";
import { createInfo, destroyInfo } from "./info";

let room: Room | null = null;
let whenConnected: Promise<void> | null = null;

/// connect

export function connect(
  host: string,
  appName: string,
  roomName = "_main",
  caller = "connect()"
): Promise<void> {
  if (room !== null && whenConnected !== null) {
    log.warn(`You should call ${caller} only one time`);
    return whenConnected;
  }

  // create the room synchronously, so that loadShared() etc. can be called
  // right after connect() without waiting (e.g. in p5's preload())
  room = new Room(host, appName, roomName);
  const connectingRoom = room;

  const load = async () => {
    await connectingRoom.whenConnected;
    window.addEventListener("beforeunload", () => {
      connectingRoom.disconnect();
    });

    // install ctrl-i inspector pane binding
    document.addEventListener(
      "keyup",
      (e) => {
        if (e.ctrlKey && e.key === "i") {
          toggleInfo();
        }
      },
      false
    );

    // check for auto reload
    await experimentalAutoReload(connectingRoom);

    // install p5PartyEvents
    connectingRoom.subscribe("p5PartyEvent", (data: JSONObject) => {
      // reload-others
      if (
        data.action === "reload-others" &&
        data.sender != connectingRoom.info().guestName
      ) {
        log.log("Recieved reload-others p5PartyEvent. Reloading...");
        window.location.reload();
      }

      // disconnect-others
      if (
        data.action === "disconnect-others" &&
        data.sender != connectingRoom.info().guestName
      ) {
        log.log("Recieved disconnect-others p5PartyEvent. Disconnecting...");
        connectingRoom.disconnect();
        void createInfo(connectingRoom);
      }
    });

    log.log(`${caller} done!`);
  };

  whenConnected = load();
  return whenConnected;
}

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

async function experimentalAutoReload(room: Room) {
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
  room.subscribe("p5PartyEvent", (data: JSONObject) => {
    const handleAction = async () => {
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
    };
    void handleAction();
  });
}

/// disconnect

export function disconnect(caller = "disconnect()"): void {
  if (room === null) {
    log.error(`${caller} called before connecting`);
    return;
  }
  room.disconnect();
}

/// loadShared

// Starts loading a shared object. Returns the shared object right away (it
// is empty until loaded) along with a promise that resolves when it is
// loaded. Returns undefined if not connected.
export function startLoadShared(
  name: string,
  initObject?: UserData,
  caller = "loadShared()"
): { shared: JSONObject; loaded: Promise<JSONObject> } | undefined {
  if (room === null) {
    log.error(`${caller} called before connecting`);
    return undefined;
  }
  const loadingRoom = room;
  const record = loadingRoom.getRecord(name);

  const load = async () => {
    await loadingRoom.whenConnected;
    const overwrite = loadingRoom.isHost();
    await record.load(initObject, overwrite);
    log.log(`${caller} "${name}" done!`);
    return record.shared;
  };

  return { shared: record.shared, loaded: load() };
}

/// loadMyShared

export function startLoadMyShared(
  initObject: UserData = {},
  caller = "loadMyShared()"
): { shared: JSONObject; loaded: Promise<JSONObject> } | undefined {
  if (room === null) {
    log.error(`${caller} called before connecting`);
    return undefined;
  }
  const loadingRoom = room;
  const record = loadingRoom.myGuestRecord;

  const load = async () => {
    await loadingRoom.whenConnected;
    await record.whenLoaded;
    await record.initData(initObject);
    log.log(`${caller} done!`);
    return record.shared;
  };

  return { shared: record.shared, loaded: load() };
}

/// loadGuestShareds

export function loadGuestShareds(
  caller = "loadGuestShareds()"
): JSONObject[] | undefined {
  if (room === null) {
    log.error(`${caller} called before connecting`);
    return undefined;
  }
  return room.guestShareds;
}

/// isHost

export function isHost(caller = "isHost()"): boolean {
  if (room === null) {
    log.error(`${caller} called before connecting`);
    return false;
  }
  return room.isHost();
}

/// setShared

export function setShared(
  shared: JSONObject,
  object: JSONObject,
  caller = "setShared()"
): void {
  const record = Record.recordForShared(shared);
  if (!record) {
    log.warn(`${caller} doesn't recognize the provided shared object.`, shared);
    return;
  }
  record.setData(object);
}

/// watchShared

export function watchShared(
  shared: JSONObject,
  a: any,
  b?: any,
  c?: any,
  caller = "watchShared()"
): void {
  const record = Record.recordForShared(shared);
  if (!record) {
    log.warn(
      `${caller} expected shared (argument 1) to be shared object.`,
      shared
    );
    return;
  }
  record.watchShared(a, b, c);
}

/// subscribe

export function subscribe(
  event: string,
  cb: SubscriptionCallback,
  caller = "subscribe()"
): void {
  if (room === null) {
    log.error(`${caller} called before connecting`);
    return;
  }
  room.subscribe(event, cb);
}

/// unsubscribe

export function unsubscribe(
  event: string,
  cb?: SubscriptionCallback,
  caller = "unsubscribe()"
): void {
  if (room === null) {
    log.error(`${caller} called before connecting`);
    return;
  }
  room.unsubscribe(event, cb);
}

/// emit

export function emit(event: string, data?: UserData, caller = "emit()"): void {
  if (room === null) {
    log.error(`${caller} called before connecting`);
    return;
  }
  room.emit(event, data);
}

/// toggleInfo

let isInfoShown = false;
export function toggleInfo(show?: boolean, caller = "toggleInfo()"): void {
  if (room === null) {
    log.error(`${caller} called before connecting`);
    return;
  }

  isInfoShown = show ?? !isInfoShown;

  if (isInfoShown) {
    void createInfo(room);
  } else {
    destroyInfo();
  }
}

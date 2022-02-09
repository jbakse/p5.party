import "regenerator-runtime/runtime";

import * as log from "./log";

import { Client } from "./Client";
import { Room } from "./Room";
import { Record } from "./Record";

import { version } from "../version";

// @todo remove this export?
window.party = { Client, Room, Record };

/* globals p5 */

let __client, __room;

window.p5 ? init() : log.warn("p5.js not found.");

function init() {
  // test with --no publish

  const version_string = p5.prototype.VERSION
    ? `p5.js v${p5.prototype.VERSION}`
    : "p5.js is older than 1.3.1";
  log.styled("font-weight: bold", version_string);
  log.styled("font-weight: bold", `p5.party v${version}`);

  ////////////////////////////////////////////////
  // partyConnect (preload)

  p5.prototype.registerPreloadMethod("partyConnect", p5.prototype);
  p5.prototype.partyConnect = function (host, sketch_name, room_name, cb) {
    if (__client) {
      log.warn("You should only call partyConnect() one time");
      return;
    }

    const connect = async () => {
      __client = new Client(host);
      __room = new Room(__client, sketch_name, room_name);
      await __room.whenReady();
      __room.join();
      __room.removeDisconnectedClients();
      window.addEventListener("beforeunload", () => {
        __room.leave();
        __client.close();
      });
    };

    connect().then(() => {
      log.log("partyConnect done!");
      cb && cb();
      this._decrementPreload();
    });
  };

  ////////////////////////////////////////////////
  // partyLoadShared (preload)

  p5.prototype.registerPreloadMethod("partyLoadShared", p5.prototype);
  p5.prototype.partyLoadShared = function (record_id, cb) {
    if (!__room) {
      log.error("partyLoadShared() called before partyConnect()");
      return undefined;
    }

    const record = __room.getRecord(record_id);

    record.whenReady(() => {
      log.log("partyLoadShared done!", record_id);
      cb && cb(record.getShared());
      this._decrementPreload();
    });

    return record.getShared();
  };

  ////////////////////////////////////////////////
  // partyLoadMyShared (preload)

  p5.prototype.registerPreloadMethod("partyLoadMyShared", p5.prototype);
  p5.prototype.partyLoadMyShared = function (cb) {
    if (!__room) {
      log.error("partyLoadMyShared() called before partyConnect()");
      return undefined;
    }

    const record = __room.getMyRecord();

    record.whenReady(() => {
      log.log("partyLoadMyShared done!");
      cb && cb(record.getShared());
      this._decrementPreload();
    });

    return record.getShared();
  };

  ////////////////////////////////////////////////
  // partyLoadParticipantShareds (preload)

  p5.prototype.registerPreloadMethod(
    "partyLoadParticipantShareds",
    p5.prototype
  );

  p5.prototype.partyLoadParticipantShareds = function (cb) {
    if (!__room) {
      log.error("partyLoadParticipantShareds() called before partyConnect()");
      return undefined;
    }

    const shareds = __room.getParticipantShareds(() => {
      log.log("partyLoadParticipantShareds done!");
      cb && cb(shareds);
      this._decrementPreload();
    });

    return shareds;
  };

  ////////////////////////////////////////////////
  // partyIsHost

  p5.prototype.partyIsHost = function () {
    if (!__room) {
      log.error("partyIsHost() called before partyConnect()");
      return undefined;
    }

    return __room.getHostName() === __client.getUid();
  };

  ////////////////////////////////////////////////
  // partySetShared

  p5.prototype.partySetShared = function (shared, object) {
    if (!Record.recordForShared(shared)) {
      log.warn(
        "partySetShared() doesn't recognize the provided shared object.",
        shared
      );
      return;
    }
    Record.recordForShared(shared).setShared(object);
  };

  ////////////////////////////////////////////////
  // partyWatchShared

  p5.prototype.partyWatchShared = function (shared, path, cb) {
    if (!Record.recordForShared(shared)) {
      log.warn(
        "partyWatchShared() doesn't recognize provided shared object.",
        shared
      );
      return;
    }
    Record.recordForShared(shared).watchShared(path, cb);
  };

  ////////////////////////////////////////////////
  // experimental pub/sub
  p5.prototype.partySubscribe = function (event, cb) {
    __client.subscribe(event, cb);
  };

  p5.prototype.partyEmit = function (event, data) {
    __client.emit(event, data);
  };
}

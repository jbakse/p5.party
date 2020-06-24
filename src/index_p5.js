import "regenerator-runtime/runtime";

import * as log from "./log";

import { Client } from "./Client";
import { Room } from "./Room";
import { Record } from "./Record";

// @todo remove this export?
window.party = { Client, Room, Record };

/* globals p5 */

let __client, __room;

window.p5 ? init() : log.warn("p5.js not found.");

function init() {
  p5.prototype.partyConnect = function (host, sketch_name, room_name, cb) {
    if (__client) {
      log.warn("You should only call partyConnect() one time");
      return;
    }
    connect(host, sketch_name, room_name).then(() => {
      log.log("partyConnect done!");

      cb && cb();
      this._decrementPreload();
    });
  };

  async function connect(host, sketch_name, room_name) {
    __client = new Client(host);
    __room = new Room(__client, sketch_name, room_name);
    await __client.whenReady();
    await __room.whenReady();
    __room.join();
    __room.removeDisconnectedClients();
  }

  p5.prototype.registerPreloadMethod("partyConnect", p5.prototype);

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

  p5.prototype.registerPreloadMethod("partyLoadShared", p5.prototype);

  p5.prototype.partyGetMyShared = function (cb) {
    if (!__room) {
      log.error("partyGetMyShared() called before partyConnect()");
      return undefined;
    }

    const record = __room.getMyRecord();

    record.whenReady(() => {
      log.log("partyGetMyShared done!");
      cb && cb(record.getShared());
      this._decrementPreload();
    });
    return record.getShared();
  };
  p5.prototype.registerPreloadMethod("partyGetMyShared", p5.prototype);

  p5.prototype.partyGetParticipantShareds = function (cb) {
    if (!__room) {
      log.error("partyGetParticipantShareds() called before partyConnect()");
      return undefined;
    }

    // @todo shouldn't call private method of __room
    // @todo maybe pass a cb to getParticipantShareds, which will return immediately but call callback when ready

    const updateP = __room._updateParticpantRecords();
    updateP.then(() => {
      log.log("partyGetParticipantShareds done!");
      cb && cb(__room.getParticipantShareds());
      this._decrementPreload();
    });

    return __room.getParticipantShareds();
  };

  p5.prototype.registerPreloadMethod(
    "partyGetParticipantShareds",
    p5.prototype
  );

  p5.prototype.partyIsHost = function () {
    if (!__room) {
      log.error("partyIsHost() called before partyConnect()");
      return undefined;
    }

    return __room.getHostName() === __client.name();
  };

  p5.prototype.partySetShared = function (shared, object) {
    if (!Record.recordForShared(shared)) {
      log.warn(
        "partySetShared() doesn't recognize provided shared object.",
        shared
      );
      return;
    }
    Record.recordForShared(shared).setShared(object);
  };

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
}

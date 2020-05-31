import "regenerator-runtime/runtime";
import { Client } from "./Client";
import { Room } from "./Room";
import { RoomManager } from "./RoomManager";
import { SharedRecordManager } from "./SharedRecordManager";
import * as log from "./log";

window.together = { Client, SharedRecordManager, Room };

/* globals p5 */

let ds_room;

if (typeof p5 !== "undefined") {
  init();
} else {
  log.error("Together requies p5");
}

function init() {
  p5.prototype.connectToSharedRoom = function (
    host,
    sketch_name,
    room_name,
    cb
  ) {
    // this._decrementPreload();
    ds_room = new RoomManager(host, sketch_name, room_name);
    cb && ds_room.whenReady(cb);
    ds_room.whenReady(() => this._decrementPreload());
  };
  p5.prototype.registerPreloadMethod("connectToSharedRoom", p5.prototype);

  p5.prototype.getSharedData = function (record_id, cb) {
    if (!ds_room) {
      log.error("getSharedData() called before connectToSharedRoom()");
      return undefined;
    }

    const recordManager = new SharedRecordManager(record_id, ds_room, () => {
      this._decrementPreload();
      if (typeof cb === "function") cb();
    });

    return recordManager.getShared();
  };
  p5.prototype.registerPreloadMethod("getSharedData", p5.prototype);

  p5.prototype.isHost = function () {
    if (!ds_room) {
      log.error("isHost() called before connectToSharedRoom()");
      return undefined;
    }
    return ds_room.isHost();
  };
}

import "regenerator-runtime/runtime";
import { RecordManager } from "./RecordManager";
import { RoomManager } from "./RoomManager";
import * as log from "./log";

/* globals p5 */

export let ds_room;

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
    ds_room = new RoomManager(host, sketch_name, room_name);
    cb && ds_room.whenReady(cb);
  };

  p5.prototype.getSharedData = function (record_id, cb) {
    if (!ds_room) {
      log.error("getSharedData() called before connectToSharedRoom()");
      return undefined;
    }

    const recordManager = new RecordManager(record_id, ds_room, () => {
      this._decrementPreload();
      if (typeof cb === "function") cb();
    });

    return recordManager.getShared();
  };

  p5.prototype.isHost = function () {
    if (!ds_room) {
      log.error("isHost() called before connectToSharedRoom()");
      return undefined;
    }
    return ds_room.isHost();
  };

  p5.prototype.registerPreloadMethod("getSharedData", p5.prototype);
}

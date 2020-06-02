import "regenerator-runtime/runtime";

import * as log from "./log";

import { Client } from "./Client";
import { Room } from "./Room";
import { Record } from "./Record";

// @todo remove this export
window.together = { Client, Room, Record };

/* globals p5 */

let __client, __room;

window.p5 ? init() : log.error("Together requires p5");

function init() {
  p5.prototype.connectToSharedRoom = function (
    host,
    sketch_name,
    room_name,
    cb
  ) {
    connect(host, sketch_name, room_name).then(() => {
      // log.warn("connectToSharedRoom done!");
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

  p5.prototype.registerPreloadMethod("connectToSharedRoom", p5.prototype);

  p5.prototype.getSharedData = function (record_id, cb) {
    if (!__room) {
      log.error("getSharedData() called before connectToSharedRoom()");
      return undefined;
    }

    const record = __room.getRecord(record_id);

    record.whenReady(() => {
      // log.warn("getSharedData done!", record_id);
      cb && cb();
      this._decrementPreload();
    });

    return record.getShared();
  };

  p5.prototype.registerPreloadMethod("getSharedData", p5.prototype);

  p5.prototype.isHost = function () {
    if (!__room) {
      log.error("isHost() called before connectToSharedRoom()");
      return undefined;
    }

    return __room.getHostName() === __client.name();
  };
}

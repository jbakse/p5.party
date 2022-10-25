/**
 * party.js
 *
 * This module loads the p5.party shared objects, and handles the host-specific
 * logic, including calling updateRocks and spawning and removing rocks.
 *
 * Here is an overview of the shared data:
 *
 * hostData: {  // general shared object, written to by host, read by everyone
 *   rocks: [   // array of rock data
 *     {
 *        x,    // x position
 *        y,    // y position
 *        r,    // rotation
 *        dX,   // speed in x direction
 *        dY,   // speed in y direction
 *        dR,   // rotation speed
 *        size, // diameter of the rock
 *        id,   // unique id for the rock (used to identify it)
 *     },
 *   ]
 *
 * me: {        // "my" shared object, written to own client, read by everyone
 *   alive,     // boolean, is the ship active
 *   x,         // x position
 *   y,         // y position
 *   dX,        // speed in x direction
 *   dY,        // speed in y direction
 *   angle,     // current heading
 *   thrusting, // boolean, (determines if thrust is drawn)
 *   reversing, // boolean, (determins if breaklights are drawn)
 *
 *   bullets: [ // array of bullet data
 *     {
 *       x,    // x position
 *       y,    // y position
 *       dX,   // speed in x direction
 *       dY,   // speed in y direction
 *       age,  // how many frames the bullet has been alive
 *     },
 *   ]
 * }
 *
 *
 */

/* global partyConnect partyLoadShared partyLoadMyShared partyLoadGuestShareds*/
/* global partyIsHost */
/* global partySubscribe */

import { initRock, initRocks, updateRocks } from "./gameStatePlay.js";

export let hostData, me, guests;

export function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "rocks", "main");

  hostData = partyLoadShared("host", { rocks: initRocks() });
  me = partyLoadMyShared({});
  guests = partyLoadGuestShareds({});
}

export function setup() {
  partySubscribe("rockHit", onRockHit);
}

export function update() {
  // bail if we are not the host
  if (!partyIsHost()) return;
  updateRocks();
}

function onRockHit(rock) {
  // bail if we are not the host
  if (!partyIsHost()) return;

  // verify rock exists
  if (!hostData.rocks.find((r) => r.id === rock.id)) return;

  // spawn new rocks
  if (rock.size > 16) {
    const newSize = rock.size / 2;
    hostData.rocks.push(
      initRock({
        size: newSize,
        x: rock.x,
        y: rock.y,
        dX: rock.dX + random(-1, 1),
        dY: rock.dY + random(-1, 1),
      })
    );
    hostData.rocks.push(
      initRock({
        size: newSize,
        x: rock.x,
        y: rock.y,
        dX: rock.dX + random(-1, 1),
        dY: rock.dY + random(-1, 1),
      })
    );
  }

  hostData.rocks = hostData.rocks.filter((r) => r.id !== rock.id);
}

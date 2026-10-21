// p5.party entry point for the ES module build (dist/p5.party.mjs).
//
//   import { p5party } from "p5.party";
//
// Also sets up the global p5party namespace (and the partyXyz() functions,
// if p5.js is a global), just like the <script> build. See init.ts.

import { init } from "./init";

/** The p5.party API for plain JavaScript (no p5.js required). */
export const p5party = init();

/** Adds the `partyXyz()` functions to p5.js. See `p5party.installP5()`. */
export function installP5(p5: unknown): void {
  p5party.installP5(p5);
}

export type {
  JSONValue,
  JSONObject,
  WatchCallback,
  EventCallback,
  P5PartyAPI,
  P5PartyFunctions,
} from "./types";

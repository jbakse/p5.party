// Starts p5.party in the page. Shared by both builds:
// - p5.party.ts (the <script> build) calls it,
// - index.ts (the ES module build) calls it and exports the result.
//
// Publishes the p5party namespace (see vanilla.ts) for use with or without
// p5.js. If p5.js is already a global, also adds the partyXyz() functions to
// p5 (see p5.ts). Otherwise, bundler users can call p5party.installP5(p5).

import type { P5PartyAPI } from "./types";

import { version } from "../version";
import * as log from "./log";
import { Room } from "./Room";
import { Record } from "./Record";
import { p5party } from "./vanilla";
import { installP5 } from "./p5";

export function init(): P5PartyAPI {
  if (typeof window === "undefined") return p5party;

  const w = window as unknown as { p5party?: P5PartyAPI; p5?: unknown };

  // If p5.party was already loaded (e.g. the <script> build and the module
  // build on the same page), reuse it, so there's only one connection.
  if (w.p5party) {
    log.warn(
      "p5.party was loaded more than once. Using the copy that loaded first."
    );
    return w.p5party;
  }

  const namespace = { ...p5party, Room, Record };
  w.p5party = namespace;

  if (w.p5) {
    installP5(w.p5);
  } else {
    log.styled("font-weight: bold", `p5.party v${version}`);
    log.log("p5.js not found. Use the p5party.* API, e.g. p5party.connect().");
  }

  return namespace;
}

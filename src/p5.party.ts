// p5.party entry point.
//
// Always publishes the p5party namespace (see vanilla.ts) for use with or
// without p5.js. If p5.js is loaded (before this script), also adds the
// partyXyz() functions to p5 (see p5.ts).

import { version } from "../version";
import * as log from "./log";
import { Room } from "./Room";
import { Record } from "./Record";
import { p5party } from "./vanilla";
import { installP5 } from "./p5";

if (typeof window !== "undefined") {
  const w = window as unknown as { p5party: unknown; p5?: unknown };

  w.p5party = {
    ...p5party,
    Room,
    Record,
  };

  const p5Constructor = w.p5;
  if (p5Constructor) {
    installP5(p5Constructor);
  } else {
    log.styled("font-weight: bold", `p5.party v${version}`);
    log.log("p5.js not found. Use the p5party.* API, e.g. p5party.connect().");
  }
}

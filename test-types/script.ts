// Script style (no import), like a /// <reference types="p5.party" /> user.
/// <reference path="../types/p5.party.d.ts" />

async function scriptStyle() {
  await p5party.connect("wss://demoserver.p5party.org", "types_test");
  const me = await p5party.loadMyShared({ x: 0 });
  me.x.toFixed();
  window.p5party.isHost();
}
void scriptStyle;

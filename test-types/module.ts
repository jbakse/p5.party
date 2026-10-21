// Module style: import { p5party } from "p5.party"
import { p5party, installP5 } from "p5.party";
import type { JSONObject } from "p5.party";

type Player = { x: number; y: number };

export async function moduleStyle() {
  await p5party.connect("wss://demoserver.p5party.org", "types_test");
  await p5party.connect("wss://demoserver.p5party.org", "types_test", "room");

  const me = await p5party.loadMyShared<Player>({ x: 0, y: 0 });
  me.x.toFixed();

  // inferred from the starting values
  const shared = await p5party.loadShared("shared", { score: 0 });
  shared.score += 1;

  // default type is JSONObject
  const untyped: JSONObject = await p5party.loadShared("untyped");
  void untyped;

  const guests = p5party.loadGuestShareds<Player>();
  for (const guest of guests) guest.y.toFixed();

  p5party.watchShared(shared, (data) => console.log(data));
  p5party.watchShared(shared, "score", (data) => console.log(data), true);
  p5party.setShared(shared, { score: 10 });
  p5party.setShared(shared, {});
  p5party.subscribe("hit", (data) => console.log(data));
  p5party.emit("hit", { x: 1 });
  p5party.unsubscribe("hit");
  const host: boolean = p5party.isHost();
  void host;
  p5party.toggleInfo(true);
  installP5({});
  p5party.disconnect();

  // @ts-expect-error: x is a number
  me.x = "nope";

  // @ts-expect-error: connect needs a server and an app name
  await p5party.connect();

  // @ts-expect-error: loadShared returns a Promise; await it first
  p5party.loadShared<Player>("shared").x;

  // @ts-expect-error: emit data must be JSON (no functions)
  p5party.emit("hit", () => {});
}

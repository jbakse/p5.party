// Side-effect import + globals (p5.js global mode)
import "p5.party";

type Player = { x: number; y: number };

export async function globalStyle() {
  // the global namespace
  await p5party.connect("wss://demoserver.p5party.org", "types_test");

  // p5.js 1 style: returns right away
  partyConnect("wss://demoserver.p5party.org", "types_test");
  const shared = partyLoadShared<Player>("shared", { x: 0, y: 0 });
  shared.x.toFixed();

  // p5.js 2 style: await
  await partyConnect("wss://demoserver.p5party.org", "types_test");
  const me = await partyLoadMyShared<Player>({ x: 0, y: 0 });
  me.y.toFixed();

  // callbacks
  partyLoadShared<Player>("shared", { x: 0, y: 0 }, (s) => s.x.toFixed());

  for (const guest of partyLoadGuestShareds<Player>()) guest.x.toFixed();
  partyWatchShared(shared, "x", (x) => console.log(x));
  partySetShared(shared, { x: 1 });
  partySubscribe("hit", (data) => console.log(data));
  partyEmit("hit");
  partyUnsubscribe("hit");
  partyToggleInfo();
  const host: boolean = partyIsHost();
  void host;
  partyDisconnect();

  // @ts-expect-error: y is a number
  shared.y = "nope";
}

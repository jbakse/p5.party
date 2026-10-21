# p5.party API reference

p5.party is a library for making multi-user sketches and prototypes. Clients connect to a shared server, load **shared objects**, and read and write them like plain JavaScript objects. p5.party keeps them in sync between everyone in the same room. It works with p5.js 1, p5.js 2, and plain JavaScript.

More: [README](https://github.com/jbakse/p5.party#readme) · [Examples](https://p5party.org/examples/) · [Guides (Notion)](https://justinbakse.notion.site/Welcome-to-p5-party-887564cad8ec455e9bee994362322f2e)

> This file is generated from `src/types.ts` by `npm run docs`. Edit the JSDoc there, or this intro in `docs/api-intro.md`.

## Loading p5.party

**`<script>` tag** (most sketches). Load it after p5.js, if you use p5.js:

```html
<script src="https://cdn.jsdelivr.net/npm/p5@1.11.13/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/npm/p5.party@latest/dist/p5.party.js"></script>
```

This defines the global `p5party` namespace and, when p5.js is loaded, adds the `partyXyz()` functions to p5.

**npm + a bundler** (Vite, etc.):

```js
import { p5party } from "p5.party";
// if you import p5 too:
import p5 from "p5";
p5party.installP5(p5);
```

## Three ways to use it

**p5.js 1**: connect and load in `preload()`; p5 waits for them before `setup()`.

```js
let shared;
function preload() {
  partyConnect("wss://demoserver.p5party.org", "my_app");
  shared = partyLoadShared("shared", { x: 200, y: 200 });
}
function setup() {
  createCanvas(400, 400);
}
function mousePressed() {
  shared.x = mouseX;
  shared.y = mouseY;
}
function draw() {
  background(220);
  ellipse(shared.x, shared.y, 100, 100);
}
```

**p5.js 2**: there is no `preload()`. `await` in an `async setup()`.

```js
let shared;
async function setup() {
  createCanvas(400, 400);
  await partyConnect("wss://demoserver.p5party.org", "my_app");
  shared = await partyLoadShared("shared", { x: 200, y: 200 });
}
function mousePressed() {
  if (!shared) return; // can run before setup() finishes
  shared.x = mouseX;
  shared.y = mouseY;
}
function draw() {
  background(220);
  ellipse(shared.x, shared.y, 100, 100);
}
```

**No p5.js**: use the `p5party` namespace; the loading functions return Promises.

```js
await p5party.connect("wss://demoserver.p5party.org", "my_app");
const shared = await p5party.loadShared("shared", { x: 200, y: 200 });
shared.x = 100; // synced to everyone in the room
```

## Things to know

- **Use a unique app name** (e.g. `"yourname_pong"`). Everyone on a server who uses the same app name shares data, including on the public demo server `wss://demoserver.p5party.org`.
- **Shared objects hold JSON data only**: numbers, strings, booleans, `null`, arrays, and plain objects. Not functions, class instances, or p5 objects (store `color.toString()` or `{ x, y }` instead).
- **Don't reassign a shared object** (`shared = { x: 1 }` breaks syncing). Set properties (`shared.x = 1`) or use `setShared()` / `partySetShared()` to replace everything.
- **Starting values only apply if the room is empty.** Otherwise you get the existing data.
- **Check other guests' data before using it.** `loadGuestShareds()` leaves out empty objects, but a guest may not have the properties you expect yet, or may be another sketch using the same app name.
- **p5.js 2:** `draw()` waits for an `async setup()`, but event handlers like `mousePressed()` don't. Check that shared objects are loaded first.
- **Write conflicts:** if two clients write to the same shared object at almost the same time, one write is lost. Have each client write to its own `loadMyShared()` object, or let the host (`isHost()`) do shared writes.
- **Nothing is permanent or secure.** Shared data lasts until the server restarts; there are no accounts or permissions. p5.party is for sketching and prototyping.
- **One connection per page.** Call `connect()` / `partyConnect()` once.

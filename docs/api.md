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

For p5.js 2, use `https://cdn.jsdelivr.net/npm/p5@2.3.4/lib/p5.js`. The same p5.party script works with p5.js 1, p5.js 2, or no p5.js at all. It defines the global `p5party` namespace and, when p5.js is loaded, adds the `partyXyz()` functions to p5.

**npm + a bundler** (Vite, etc.). The package includes TypeScript types; `import type { JSONObject } from "p5.party"` for the helper types:

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

**No p5.js**: use the `p5party` namespace; the loading functions return Promises. Top-level `await` works in a `<script type="module">`; in a regular `<script>`, put this in an `async` function.

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
- **Telling guests apart:** there are no built-in guest ids. Your own object is in the guest list (`guest === me`); to label others, store something in your myShared, e.g. `loadMyShared({ name, hue })`.
- **The host** is the guest who has been in the room longest. It's known when `connect()` resolves and changes only when the host leaves, so check `isHost()` when you need it (e.g. each frame) instead of once.
- **Give your myShared object starting values for every property.** A guest appears in `loadGuestShareds()` as soon as their object has any data, so properties set later can be missing for a moment.
- **Old versions of your sketch keep running.** Tabs still running old code keep connecting to the same app and room, with whatever data shape that code uses. Reload every tab after you change your code, or check a guest's data before you use it.
- **p5.js 2:** `draw()` waits for an `async setup()`, but event handlers like `mousePressed()` don't. Check that shared objects are loaded first.
- **Write conflicts:** if two clients write to the same shared object at almost the same time, one write is lost. Have each client write to its own `loadMyShared()` object, or let the host (`isHost()`) do shared writes.
- **Nothing is permanent or secure.** Shared data lasts until the server restarts; there are no accounts or permissions. p5.party is for sketching and prototyping.
- **One connection per page.** Call `connect()` / `partyConnect()` once.

## p5party (with or without p5.js)

The p5.party API for plain JavaScript (no p5.js required).

Available as the global `p5party`, or with
`import { p5party } from "p5.party"`.

About the type parameters on the load functions: they let you describe
the shape of your shared data, but p5.party doesn't check it. Starting
values only apply when the room is empty, and other clients (or an older
version of your sketch) may have written different data.

### p5party.connect()

```ts
p5party.connect(server: string, appName: string, roomName?: string): Promise<void>
```

Connects to a p5.party server. Call this before the other functions.

- `server`: the server url, e.g. `"wss://demoserver.p5party.org"`
- `appName`: a unique name for your app, e.g. `"jbakse_pong"`
- `roomName`: optional room name, default `"_main"`

Returns: resolves when the connection is ready

### p5party.disconnect()

```ts
p5party.disconnect(): void
```

Disconnects from the server. Shared objects stop syncing.

### p5party.loadShared()

```ts
p5party.loadShared<T extends object = JSONObject>(name: string, initObject?: T): Promise<T>
```

Loads (or creates) the shared object with the given name.

- `name`: the name of the shared object on the server
- `initObject`: starting values, used only if the room is empty

Returns: resolves to the shared object once it's loaded

Throws: (rejects) if called before `connect()`

### p5party.loadMyShared()

```ts
p5party.loadMyShared<T extends object = JSONObject>(initObject?: T): Promise<T>
```

Loads this client's own shared object ("myShared"), which every other
client can see in `loadGuestShareds()`.

Each page load gets a new, empty myShared (a client that reloads or
reconnects doesn't get its old data back), so `initObject` always
applies. Use `===` to find it in `loadGuestShareds()`.

- `initObject`: starting values

Returns: resolves to this client's shared object once it's loaded

Throws: (rejects) if called before `connect()`

### p5party.loadGuestShareds()

```ts
p5party.loadGuestShareds<T extends object = JSONObject>(): T[]
```

Returns a live array of every guest's "myShared" object, including this
client's (the same object `loadMyShared()` returns, so `guest === me`
works). The array updates as guests join, leave, and add data, so you
can call this once, right after connecting, and keep it.

Guests with empty shared objects are left out; a guest appears once
their object has data, so give `loadMyShared()` starting values for
every property. An older version of your sketch (or another sketch using
the same app name) can still put differently shaped data here.

Call after connecting.

### p5party.isHost()

```ts
p5party.isHost(): boolean
```

Returns true if this client is the room's host. Every room with guests
has exactly one host: the guest who has been in the room the longest.
It's known as soon as `connect()` resolves. If the host leaves, another
guest becomes host, so check `isHost()` each time you need it.

### p5party.setShared()

```ts
p5party.setShared<T extends object>(shared: T, data: Partial<T>): void
```

Replaces all of a shared object's properties with `data` (not merged):
properties not in `data` are removed. `setShared(shared, {})` clears it.

### p5party.watchShared()

```ts
p5party.watchShared<T extends object>(shared: T, callback: WatchCallback, triggerNow?: boolean): void
p5party.watchShared<T extends object>(shared: T, path: string, callback: WatchCallback, triggerNow?: boolean): void
```

Calls `callback` with the whole shared object when it changes.

- `triggerNow`: also call `callback` right away

Calls `callback` with the value at `path` when it changes.

- `path`: a property path, e.g. `"position.x"`
- `triggerNow`: also call `callback` right away

### p5party.subscribe()

```ts
p5party.subscribe(eventName: string, callback: EventCallback): void
```

Calls `callback` whenever a message named `eventName` is emitted in
this room (by any client, including this one).

### p5party.unsubscribe()

```ts
p5party.unsubscribe(eventName: string, callback?: EventCallback): void
```

Stops listening for `eventName`. Without a callback, removes all of
this client's callbacks for that event.

### p5party.emit()

```ts
p5party.emit(eventName: string, data?: JSONValue): void
```

Sends a message to every client in the room (including this one).

- `data`: optional JSON data to send with the message

### p5party.toggleInfo()

```ts
p5party.toggleInfo(show?: boolean): void
```

Shows, hides, or toggles the info panel (also `ctrl-i`).

- `show`: `true` to show, `false` to hide, omit to toggle

### p5party.installP5()

```ts
p5party.installP5(p5: unknown): void
```

Adds the `partyXyz()` functions to p5.js.

You only need this if p5.js isn't a global when p5.party loads, e.g.
`import p5 from "p5"` in a bundler. With `<script>` tags, p5.party does
this for you. Call it before creating your sketch.

- `p5`: the p5 constructor

## p5.js functions

The p5.js functions that p5.party adds (global mode, or on the sketch
object in instance mode). They exist only when p5.js is loaded.

p5.js 1 vs p5.js 2: `partyConnect()`, `partyLoadShared()`, and
`partyLoadMyShared()` return right away in p5.js 1 (use them in
`preload()`), but return Promises in p5.js 2 (`await` them in an `async`
`setup()`). The load functions are typed as returning the shared object,
which is right for p5.js 1 and for `await` in p5.js 2. TypeScript can't
tell which p5.js version you're using, so it won't catch a missing
`await` in p5.js 2.

### partyConnect()

```ts
partyConnect(server: string, appName: string, roomName?: string, callback?: () => void): void | Promise<void>
```

Connects to a p5.party server. Call it in `preload()` (p5.js 1) or
`await` it in an async `setup()` (p5.js 2).

- `server`: the server url, e.g. `"wss://demoserver.p5party.org"`
- `appName`: a unique name for your app, e.g. `"jbakse_pong"`
- `roomName`: optional room name, default `"_main"`
- `callback`: optional, called when the connection is ready

### partyDisconnect()

```ts
partyDisconnect(): void
```

Disconnects from the server. Shared objects stop syncing.

### partyLoadShared()

```ts
partyLoadShared<T extends object = JSONObject>(name: string, initObject?: T, callback?: (shared: T) => void): T
```

Loads (or creates) the shared object with the given name. In p5.js 1,
call it in `preload()`; in p5.js 2, `await` it.

- `initObject`: starting values, used only if the room is empty
- `callback`: optional, called with the shared object when it's ready

### partyLoadMyShared()

```ts
partyLoadMyShared<T extends object = JSONObject>(initObject?: T, callback?: (shared: T) => void): T
```

Loads this client's own shared object ("myShared"). In p5.js 1, call it
in `preload()`; in p5.js 2, `await` it.

- `initObject`: starting values
- `callback`: optional, called with the shared object when it's ready

### partyLoadGuestShareds()

```ts
partyLoadGuestShareds<T extends object = JSONObject>(): T[]
```

Returns a live array of every guest's "myShared" object. Guests with
empty objects are left out. See `p5party.loadGuestShareds()`.

### partyLoadParticipantShareds()

**Deprecated.** Use `partyLoadGuestShareds()` instead.

```ts
partyLoadParticipantShareds<T extends object = JSONObject>(): T[]
```

### partyIsHost()

```ts
partyIsHost(): boolean
```

Returns true if this client is the room's host.

### partySetShared()

```ts
partySetShared<T extends object>(shared: T, data: Partial<T>): void
```

Replaces all of a shared object's properties with `data`.

### partyWatchShared()

```ts
partyWatchShared<T extends object>(shared: T, callback: WatchCallback, triggerNow?: boolean): void
partyWatchShared<T extends object>(shared: T, path: string, callback: WatchCallback, triggerNow?: boolean): void
```

Calls `callback` when the shared object changes.

Calls `callback` when the value at `path` on the shared object changes.

### partySubscribe()

```ts
partySubscribe(eventName: string, callback: EventCallback): void
```

Calls `callback` whenever a message named `eventName` is emitted.

### partyUnsubscribe()

```ts
partyUnsubscribe(eventName: string, callback?: EventCallback): void
```

Stops listening for `eventName` (all callbacks if none is given).

### partyEmit()

```ts
partyEmit(eventName: string, data?: JSONValue): void
```

Sends a message to every client in the room (including this one).

### partyToggleInfo()

```ts
partyToggleInfo(show?: boolean): void
```

Shows, hides, or toggles the info panel (also `ctrl-i`).

## Types

### JSONValue

Any value that can be stored in a shared object: JSON data.

```ts
type JSONValue =
  null | boolean | number | string | JSONValue[] | { [key: string]: JSONValue };
```

### JSONObject

A plain data object that can be shared.

```ts
type JSONObject = { [key: string]: JSONValue };
```

### WatchCallback

Called with the new value when a watched shared object changes.

```ts
type WatchCallback = (data: any) => void;
```

### EventCallback

Called with the message data when a subscribed event is received.

```ts
type EventCallback = (data: any) => void;
```

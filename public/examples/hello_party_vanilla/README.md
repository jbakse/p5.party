# hello_party_vanilla

This is [hello_party](../hello_party) without p5.js. It draws with the canvas 2D API and `requestAnimationFrame()`.

Without p5.js, use the `p5party` namespace: `p5party.connect()`, `p5party.loadShared()`, `p5party.isHost()`, and so on. The loading functions return Promises.

```js
await p5party.connect("wss://demoserver.p5party.org", "hello_party");
const shared = await p5party.loadShared("shared", { x: 100, y: 100 });
```

The page loads `index.js` with `<script type="module">`, which allows `await` at the top level.

- **click** to move the dot

This example shares data with [hello_party](../hello_party). Open them side by side!

> Try this example in two browser windows at once!

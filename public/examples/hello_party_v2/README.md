# hello_party_v2

This is [hello_party](../hello_party) for p5.js 2.

p5.js 2 doesn't have `preload()`. Instead, `setup()` can be `async`, and you `await` loading. In p5.js 2, `partyConnect()`, `partyLoadShared()`, and `partyLoadMyShared()` return Promises.

```js
async function setup() {
  await partyConnect("wss://demoserver.p5party.org", "hello_party");
  shared = await partyLoadShared("shared", { x: 100, y: 100 });
}
```

`draw()` won't run until `setup()` finishes, but `mousePressed()` can, so this example checks that `shared` is loaded before writing to it.

- **click** to move the dot

This example shares data with [hello_party](../hello_party). Open them side by side!

> Try this example in two browser windows at once!

# hello_party_vanilla_dom

This is [hello_party](../hello_party) without p5.js or a canvas. The dot is an HTML element positioned with CSS.

Instead of redrawing every frame, this example uses `p5party.watchShared()` to update the dot only when the shared object changes.

```js
p5party.watchShared(
  shared,
  () => {
    dot.style.left = `${shared.x}px`;
    dot.style.top = `${shared.y}px`;
  },
  true,
);
```

See [hello_party_vanilla](../hello_party_vanilla) for a canvas version and an introduction to the `p5party` functions.

- **click** to move the dot

This example shares data with [hello_party](../hello_party). Open them side by side!

> Try this example in two browser windows at once!

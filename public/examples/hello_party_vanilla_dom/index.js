// This example doesn't use p5.js or a canvas. It moves an HTML element.
// See hello_party_vanilla for an introduction to the p5party.* functions.

// connect to the party server
await p5party.connect("wss://demoserver.p5party.org", "hello_party");

// load the shared object
const shared = await p5party.loadShared("shared", { x: 100, y: 100 });

p5party.toggleInfo(true);

const stage = document.getElementById("stage");
const dot = document.getElementById("dot");

stage.addEventListener("pointerdown", (e) => {
  // write shared data
  shared.x = e.offsetX;
  shared.y = e.offsetY;
});

// read shared data
// there is no draw loop: watchShared() calls this function whenever
// the shared object changes, and `true` calls it once right away
p5party.watchShared(
  shared,
  () => {
    dot.style.left = `${shared.x}px`;
    dot.style.top = `${shared.y}px`;
  },
  true,
);

// This example doesn't use p5.js. Without p5.js, use the p5party.* functions.
// connect(), loadShared(), and loadMyShared() return Promises, so we await
// them. (Top-level await works because index.html loads this file as a
// module: <script type="module">.)

// connect to the party server
await p5party.connect("wss://demoserver.p5party.org", "hello_party");

// load the shared object
// and provide starting values for the object to be used
// if there are no clients already connected to the room
const shared = await p5party.loadShared("shared", { x: 100, y: 100 });

p5party.toggleInfo(true);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.addEventListener("pointerdown", (e) => {
  // write shared data
  shared.x = e.offsetX;
  shared.y = e.offsetY;
});

function draw() {
  ctx.fillStyle = "#ffcccc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // read shared data
  ctx.fillStyle = "#000066";
  ctx.beginPath();
  ctx.arc(shared.x, shared.y, 50, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(draw);
}
draw();

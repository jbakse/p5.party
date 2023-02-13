// require https://cdn.jsdelivr.net/npm/p5@latest/lib/p5.min.js
// require https://cdn.jsdelivr.net/npm/p5.party@latest/dist/p5.party.js

let shared;

// color this player is drawing with
let drawColor = "#ee6666";

// colors player can choose from
const palette = [
  "#ee6666",
  "#eeee66",
  "#66ee66",
  "#66eeee",
  "#6666ee",
  "#ee66ee",
];

function preload() {
  partyConnect("wss://demoserver.p5party.org", "pixel_edit");
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 440);
  ellipseMode(CORNER);

  console.log(JSON.stringify(shared));

  // initialize grid only if needed
  if (!shared.grid) resetGrid();
}

function mousePressed() {
  // figure out what row + col are being clicked
  let col = floor(mouseX / 40);
  let row = floor(mouseY / 40);

  // if click is in bottom row then choose color from palette
  if (row === 10 && col >= 0 && col <= 5) drawColor = palette[col] || "white";

  // if click is on "x" reset grid
  if (row === 10 && col === 9) resetGrid();

  // if click is in pixel area then toggle pixel off/drawColor
  if (col >= 0 && col <= 9 && row >= 0 && row <= 9) {
    if (shared.grid[col][row] === drawColor) {
      shared.grid[col][row] = false;
    } else {
      shared.grid[col][row] = drawColor;
    }
  }
}

function resetGrid() {
  const newGrid = [];
  for (let col = 0; col < 10; col++) {
    newGrid[col] = new Array(10).fill(false);
  }
  shared.grid = newGrid;
}

function draw() {
  background("#333");
  drawUI();
  drawPixels();
}

function drawUI() {
  push();
  strokeWeight(3);

  // draw palette
  for (let i = 0; i < palette.length; i++) {
    fill(palette[i]);
    if (palette[i] === drawColor) {
      stroke("white");
    } else {
      stroke("black");
    }
    ellipse(i * 40 + 4, 400 + 4, 40 - 8, 40 - 8);
  }

  // draw reset button "x"
  noFill();
  stroke("red");
  line(360 + 5, 400 + 5, 400 - 5, 440 - 5);
  line(400 - 5, 400 + 5, 360 + 5, 440 - 5);

  pop();
}

function drawPixels() {
  push();
  noStroke();
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const x = col * 40;
      const y = row * 40;
      if (shared.grid[col][row]) {
        fill(color(shared.grid[col][row]));
        rect(x + 1, y + 1, 40 - 2, 40 - 2, 2, 2, 2, 2);
      }
    }
  }
  pop();
}

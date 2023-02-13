// location of each square on the board
// used to determine which square was clicked
// and where to draw marks
const squares = [
  { x: 50, y: 50, w: 100, h: 100 },
  { x: 150, y: 50, w: 100, h: 100 },
  { x: 250, y: 50, w: 100, h: 100 },
  { x: 50, y: 150, w: 100, h: 100 },
  { x: 150, y: 150, w: 100, h: 100 },
  { x: 250, y: 150, w: 100, h: 100 },
  { x: 50, y: 250, w: 100, h: 100 },
  { x: 150, y: 250, w: 100, h: 100 },
  { x: 250, y: 250, w: 100, h: 100 },
];

let shared;

function preload() {
  partyConnect("wss://demoserver.p5party.org", "tic_tac_toe", "main");
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 450);

  // this will reset the board anytime a new client joins
  // partyIsHost() can be used to reset the board only
  // if the room is empty
  resetBoard();
}

function draw() {
  background(50);

  drawGrid();
  drawMarks();

  drawWinner();
}

function mousePressed() {
  // if the game is already over, reset the board
  if (checkWin("x") || checkWin("o") || checkDraw()) {
    resetBoard();
    return;
  }

  // find the square that was clicked, if any
  const index = squares.findIndex((square) =>
    pointInRect({ x: mouseX, y: mouseY }, square)
  );

  // if no square was clicked, bail
  if (index === -1) return;

  // if the square is already filled, bail
  if (shared.board[index] !== "empty") return;

  // an empty square was clicked, set it according to the current turn
  shared.board[index] = shared.turn;

  // switch turns
  if (shared.turn === "x") {
    shared.turn = "o";
  } else {
    shared.turn = "x";
  }
}

function drawWinner() {
  push();
  fill("#fff");
  textSize(25);
  textAlign(CENTER, CENTER);

  if (checkWin("x")) {
    text("x wins!", width * 0.5, height - 40);
  } else if (checkWin("o")) {
    text("o wins!", width * 0.5, height - 40);
  } else if (checkDraw()) {
    text("draw!", width * 0.5, height - 40);
  }

  pop();
}

function drawGrid() {
  push();
  noFill();
  stroke("#888");
  strokeWeight(2);

  // draw lines
  line(150, 50, 150, 350);
  line(250, 50, 250, 350);
  line(50, 150, 350, 150);
  line(50, 250, 350, 250);
  pop();
}

function drawMarks() {
  push();
  noFill();
  stroke("white");
  strokeWeight(8);
  ellipseMode(CORNER);

  // loop through each square in the grid
  squares.forEach((square, index) => {
    // inset the square to size the x and o
    const s = insetRect(square, 20);

    // check the shared board state to see if and which mark to draw
    if (shared.board[index] === "x") {
      line(s.x, s.y, s.x + s.w, s.y + s.h);
      line(s.x + s.w, s.y, s.x, s.y + s.h);
    }
    if (shared.board[index] === "o") {
      ellipse(s.x, s.y, s.w, s.h);
    }
  });
  pop();
}

function resetBoard() {
  partySetShared(shared, {
    // prettier-ignore
    board: [
      "empty", "empty", "empty",
      "empty", "empty", "empty",
      "empty", "empty", "empty"
    ],
    turn: "x",
  });
}

// checks to see if the game has ended in a win for `mark`
function checkWin(mark) {
  const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // find which squares have the provided mark
  const xIndexes = getIndexes(shared.board, mark);

  // check if mark is inall the squares in any win combo
  const xWin = winCombos.find(
    (combo) =>
      xIndexes.includes(combo[0]) &&
      xIndexes.includes(combo[1]) &&
      xIndexes.includes(combo[2])
  );

  return Boolean(xWin);
}

// checks if the game has ended in a draw
function checkDraw() {
  if (checkWin("x") || checkWin("o")) return false;
  return shared.board.every((square) => square !== "empty");
}

// returns the indexes of all items in array matching value
function getIndexes(a, value) {
  const indexes = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] === value) {
      indexes.push(i);
    }
  }
  return indexes;
}

// checks if point p {x, y} is in rect r {x, y, w, h}
function pointInRect(p, r) {
  return p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h;
}

// returns a new rect {x, y, w, h} based on rect r and inset by amount
function insetRect(r, amount) {
  return {
    x: r.x + amount,
    y: r.y + amount,
    w: r.w - amount * 2,
    h: r.h - amount * 2,
  };
}

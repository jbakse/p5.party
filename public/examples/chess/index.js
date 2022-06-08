/**
 * Chess
 * This example stores the board state in a shared object.
 * The property `board` is an 8x8 array.
 * Technically, an array of 8 arrays, each with 8 elements.
 * Each element is an array of two elements: [color, piece].
 *
 * Initializing this array is done in setup, rather than
 * providing a object literal to partyLoadShared.
 *
 */

const WHITE = 0;
const BLACK = 1;

const PAWN = 0;
const ROOK = 1;
const KNIGHT = 2;
const BISHOP = 3;
const QUEEN = 4;
const KING = 5;
const NONE = 6;

let shared;
let chess_set;

let selection = false;

window.preload = () => {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "chess", "main");
  shared = partyLoadShared("shared");
  chess_set = loadImage("./chess_8.png");
};

window.setup = () => {
  createCanvas(512, 512);
  noStroke();

  if (partyIsHost()) {
    shared.board = [];
    for (let row = 0; row < 8; row++) {
      shared.board[row] = new Array(8).fill().map(() => [WHITE, NONE]);
      // curious about the line above?
      // https://medium.com/@wisecobbler/4-ways-to-populate-an-array-in-javascript-836952aea79f
    }
    shared.board[0][0] = [WHITE, ROOK];
    shared.board[1][0] = [WHITE, KNIGHT];
    shared.board[2][0] = [WHITE, BISHOP];
    shared.board[3][0] = [WHITE, KING];
    shared.board[4][0] = [WHITE, QUEEN];
    shared.board[5][0] = [WHITE, BISHOP];
    shared.board[6][0] = [WHITE, KNIGHT];
    shared.board[7][0] = [WHITE, ROOK];

    shared.board[0][1] = [WHITE, PAWN];
    shared.board[1][1] = [WHITE, PAWN];
    shared.board[2][1] = [WHITE, PAWN];
    shared.board[3][1] = [WHITE, PAWN];
    shared.board[4][1] = [WHITE, PAWN];
    shared.board[5][1] = [WHITE, PAWN];
    shared.board[6][1] = [WHITE, PAWN];
    shared.board[7][1] = [WHITE, PAWN];

    shared.board[0][6] = [BLACK, PAWN];
    shared.board[1][6] = [BLACK, PAWN];
    shared.board[2][6] = [BLACK, PAWN];
    shared.board[3][6] = [BLACK, PAWN];
    shared.board[4][6] = [BLACK, PAWN];
    shared.board[5][6] = [BLACK, PAWN];
    shared.board[6][6] = [BLACK, PAWN];
    shared.board[7][6] = [BLACK, PAWN];

    shared.board[0][7] = [BLACK, ROOK];
    shared.board[1][7] = [BLACK, KNIGHT];
    shared.board[2][7] = [BLACK, BISHOP];
    shared.board[3][7] = [BLACK, KING];
    shared.board[4][7] = [BLACK, QUEEN];
    shared.board[5][7] = [BLACK, BISHOP];
    shared.board[6][7] = [BLACK, KNIGHT];
    shared.board[7][7] = [BLACK, ROOK];
  }
};

window.draw = () => {
  noStroke();

  // draw board
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 0) {
        fill("#6cc");
      } else {
        fill("#c66");
      }
      rect(col * 64, row * 64, 64, 64);
    }
  }

  // draw selection
  if (selection) {
    fill("#ff0");
    rect(selection.col * 64, selection.row * 64, 64, 64);
  }

  // draw pieces
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      noSmooth();
      image(
        chess_set,
        col * 64,
        row * 64,
        64,
        64,
        shared.board[col][row][1] * 8, // tileset col / piece
        shared.board[col][row][0] * 8, // tileset row / color
        8,
        8
      );
    }
  }
};

window.mouseClicked = () => {
  if (selection) {
    const clicked = getMouseSquare();

    shared.board[clicked.col][clicked.row] =
      shared.board[selection.col][selection.row];
    shared.board[selection.col][selection.row] = [WHITE, NONE];

    selection = false;
  } else {
    selection = getMouseSquare();
  }
};

function getMouseSquare() {
  const col = constrain(floor(mouseX / 64), 0, 7);
  const row = constrain(floor(mouseY / 64), 0, 7);
  return { col, row };
}

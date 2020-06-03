// Multi Player Tic Tac Toe

/* eslint-disable no-unused-vars */
/* global partyConnect partyGetShared */
/* global createButton createSelect */

let shared;

let teamColors; // colors used to draw tokens
let selectedTeam; // team choosen from the dropdown

const gridSize = 150;

function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    // "ws://localhost:6020",
    "tic-tac-toe",
    "main"
  );
  shared = partyGetShared("globals");
}

function setup() {
  createCanvas(450, 450);
  teamColors = [color(250, 0), color(60, 98, 181), color(255, 220, 82)];

  // Init shared
  shared.boardState = shared.boardState || [0, 0, 0, 0, 0, 0, 0, 0, 0];
  shared.currentTurn = shared.currentTurn || "Blue";

  // Make a select menu
  const teamDropDownMenu = createSelect();
  teamDropDownMenu.option("Choose a Team");
  teamDropDownMenu.disable("Choose a Team");
  teamDropDownMenu.option("Blue");
  teamDropDownMenu.option("Yellow");
  teamDropDownMenu.option("Observer");

  // When an option is chosen, assign it to selectedTeam
  teamDropDownMenu.changed(() => {
    selectedTeam = teamDropDownMenu.value();
  });

  // Make the clear button
  const clearButton = createButton("clear").mousePressed(() => {
    if (selectedTeam != "Observer") {
      shared.currentTurn = "Blue";
      shared.boardState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
  });
}

function draw() {
  background(255, 0, 0);
  noStroke();
  rectMode(CORNER);

  // Draw board
  push();
  fill(250);
  stroke(255, 0, 0);
  strokeWeight(20);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      rect(i * gridSize, j * gridSize, gridSize, gridSize);
    }
  }
  pop();

  // Draw pieces
  push();
  for (let i = 0; i < 9; i++) {
    const grid_x = i % 3;
    const grid_y = Math.floor(i / 3);
    fill(teamColors[shared.boardState[i]]);
    ellipse(
      grid_x * gridSize + 0.5 * gridSize,
      grid_y * gridSize + 0.5 * gridSize,
      50,
      50
    );
  }
  pop();

  // Display current turn
  push();
  fill(230);
  rect(5, 5, 110, 20, 5);
  fill(0);
  textSize(12);
  textFont("Avenir");
  text(shared.currentTurn + " team's turn!", 10, 18);
  pop();

  showOutcome();
}

function mousePressed(e) {
  const x = Math.floor(mouseX / gridSize);
  const y = Math.floor(mouseY / gridSize);
  console.log(x);
  const index = y * 3 + x;

  if (selectedTeam === shared.currentTurn) {
    // Change state according to selectedTeam
    if (shared.boardState[index] === 0) {
      //ternary operator
      let stateNum = selectedTeam === "Blue" ? 1 : 2;
      shared.boardState[index] = (shared.boardState[index] + stateNum) % 3;
    }

    // Change turn
    if (index <= 9) {
      if (shared.currentTurn === "Blue") {
        shared.currentTurn = "Yellow";
      } else {
        shared.currentTurn = "Blue";
      }
    }
  }
  console.log(shared.boardState);
}

function checkForWin() {
  for (let i = 1; i < 3; i++) {
    if (arguments[i] === 0 || arguments[i] !== arguments[i - 1]) return false;
  }
  return true;
}

function showOutcome() {
  push();
  stroke(30);
  strokeWeight(10);
  let gameIsWon = false;

  if (
    checkForWin(
      shared.boardState[0],
      shared.boardState[1],
      shared.boardState[2]
    )
  ) {
    line(40, 75, 410, 75);
    gameIsWon = true;
  }

  if (
    checkForWin(
      shared.boardState[3],
      shared.boardState[4],
      shared.boardState[5]
    )
  ) {
    line(40, 225, 410, 225);
    gameIsWon = true;
  }

  if (
    checkForWin(
      shared.boardState[6],
      shared.boardState[7],
      shared.boardState[8]
    )
  ) {
    line(40, 375, 410, 375);
    gameIsWon = true;
  }

  if (
    checkForWin(
      shared.boardState[0],
      shared.boardState[3],
      shared.boardState[6]
    )
  ) {
    line(75, 40, 75, 410);
    gameIsWon = true;
  }

  if (
    checkForWin(
      shared.boardState[1],
      shared.boardState[4],
      shared.boardState[7]
    )
  ) {
    line(225, 40, 225, 410);
    gameIsWon = true;
  }

  if (
    checkForWin(
      shared.boardState[2],
      shared.boardState[5],
      shared.boardState[8]
    )
  ) {
    line(375, 40, 375, 410);
    gameIsWon = true;
  }

  if (
    checkForWin(
      shared.boardState[0],
      shared.boardState[4],
      shared.boardState[8]
    )
  ) {
    line(40, 40, 410, 410);
    gameIsWon = true;
  }

  if (
    checkForWin(
      shared.boardState[2],
      shared.boardState[4],
      shared.boardState[6]
    )
  ) {
    line(40, 410, 410, 40);
    gameIsWon = true;
  }

  if (shared.boardState.every(checkIfFull) && gameIsWon == false) {
    push();
    fill(255);
    stroke(0, 200);
    strokeWeight(5);
    rect(125, 175, 200, 100);

    fill(50);
    noStroke();
    textSize(45);
    text("DRAW", 155, 240);
    pop();
  } else {
    return false;
  }
  pop();
}

function checkIfFull(state) {
  return state != 0;
}

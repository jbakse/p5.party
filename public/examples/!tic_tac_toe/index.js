// Tic Tac Toe
//
// Multi-player Tic Tac Toe game created as an example for p5.party
//
// Written by Isabel Anguera

let shared; // p5.party shared object
let me; // p5.party shared record of user's own data
let participants; // p5.party shared record of all participant's data

const gridSize = 150;

let blueTeamColor;
let yellowTeamColor;

function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "tic_tac_toe",
    "default"
  );
  shared = partyLoadShared("globals");
  me = partyLoadMyShared();
  participants = partyLoadParticipantShareds();
}

function setup() {
  const boardExtension = 50;
  createCanvas(10 + gridSize * 3, gridSize * 3 + boardExtension);

  blueTeamColor = color(60, 98, 181);
  yellowTeamColor = color(255, 220, 82);

  // Init shared
  // boardState describes what is each cell of the board
  // 0 - empty, 1 - blue token, 2 - yellow token
  shared.boardState = shared.boardState || [0, 0, 0, 0, 0, 0, 0, 0, 0];
  shared.currentTurn = shared.currentTurn || "Blue";

  // Make a select menu
  const teamDropDownMenu = createSelect();
  teamDropDownMenu.option("Choose a Team");
  teamDropDownMenu.disable("Choose a Team");
  teamDropDownMenu.option("Blue");
  teamDropDownMenu.option("Yellow");
  teamDropDownMenu.option("Observer");

  // When an option is chosen, assign it to my.selectedTeam
  teamDropDownMenu.changed(() => {
    me.selectedTeam = teamDropDownMenu.value();
  });

  // Make the clear button
  createButton("clear").mousePressed(() => {
    if (me.selectedTeam !== "Observer") {
      partySetShared(shared, {
        boardState: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        currentTurn: "Blue",
      });
    }
  });
}

function draw() {
  background("red");
  noStroke();

  // Draw board
  push();
  fill("white");
  stroke("red");
  strokeWeight(10);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      rect(5 + i * gridSize, 5 + j * gridSize, gridSize, gridSize);
    }
  }
  pop();

  // Draw tokens
  push();
  for (let i = 0; i < 9; i++) {
    const grid_col = i % 3;
    const grid_row = Math.floor(i / 3);

    if (shared.boardState[i] === 0) continue;
    if (shared.boardState[i] === 1) fill(blueTeamColor);
    if (shared.boardState[i] === 2) fill(yellowTeamColor);

    ellipse(
      grid_col * gridSize + 0.5 * gridSize,
      grid_row * gridSize + 0.5 * gridSize,
      gridSize / 3,
      gridSize / 3
    );
  }
  pop();

  // Display current turn
  if (shared.currentTurn !== "nobody") {
    push();
    fill("white");
    textSize(22);
    textFont("Gill Sans");
    text(shared.currentTurn + " team's turn!", 12, 482);

    // Display num players on each team
    textSize(16);

    const blueTeamCount = participants.filter(
      (participant) => participant.selectedTeam === "Blue"
    ).length;

    const yellowTeamCount = participants.filter(
      (participant) => participant.selectedTeam === "Yellow"
    ).length;

    text(
      `Players on Blue: ${blueTeamCount}, Yellow ${yellowTeamCount}`,
      260,
      482
    );
    pop();
  }

  showOutcome();
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
  if (me.selectedTeam !== shared.currentTurn) return;

  const col = Math.floor(mouseX / gridSize);
  const row = Math.floor(mouseY / gridSize);
  const index = row * 3 + col;

  // return if cell already marked
  if (shared.boardState[index] > 0) return;

  shared.boardState[index] = me.selectedTeam === "Blue" ? 1 : 2;

  if (shared.currentTurn === "Blue") {
    shared.currentTurn = "Yellow";
  } else {
    shared.currentTurn = "Blue";
  }
}

function checkCombo(a, b, c) {
  return (
    shared.boardState[a] > 0 &&
    shared.boardState[a] === shared.boardState[b] &&
    shared.boardState[b] === shared.boardState[c]
  );
}

function showOutcome() {
  push();
  stroke(30);
  strokeWeight(10);

  let winner = false;

  // top row
  if (checkCombo(0, 1, 2)) {
    winner = shared.boardState[0] === 1 ? "Blue" : "Yellow";
    line(40, 75, 410, 75);
  }

  // middle row
  if (checkCombo(3, 4, 5)) {
    winner = shared.boardState[3] === 1 ? "Blue" : "Yellow";
    line(40, 225, 410, 225);
  }

  // bottom row
  if (checkCombo(6, 7, 8)) {
    winner = shared.boardState[6] === 1 ? "Blue" : "Yellow";
    line(40, 375, 410, 375);
  }

  // left column
  if (checkCombo(0, 3, 6)) {
    winner = shared.boardState[0] === 1 ? "Blue" : "Yellow";
    line(75, 40, 75, 410);
  }

  // middle column
  if (checkCombo(1, 4, 7)) {
    winner = shared.boardState[1] === 1 ? "Blue" : "Yellow";
    line(225, 40, 225, 410);
  }

  // right column
  if (checkCombo(2, 5, 8)) {
    winner = shared.boardState[2] === 1 ? "Blue" : "Yellow";
    line(375, 40, 375, 410);
  }

  // diagonal \
  if (checkCombo(0, 4, 8)) {
    winner = shared.boardState[0] === 1 ? "Blue" : "Yellow";
    line(40, 40, 410, 410);
  }

  // diagonal /
  if (checkCombo(2, 4, 6)) {
    winner = shared.boardState[2] === 1 ? "Blue" : "Yellow";
    line(40, 410, 410, 40);
  }

  // show "draw" message
  if (!winner && shared.boardState.every((cellState) => cellState > 0)) {
    shared.currentTurn = "nobody";

    push();
    fill("white");
    noStroke();
    textSize(22);
    textFont("Gill Sans");
    text("Tie Game!", 182, 482);
    pop();
  }

  // show winer message
  if (winner) {
    shared.currentTurn = "nobody";

    push();
    fill("white");
    noStroke();
    textSize(22);
    textFont("Gill Sans");
    textAlign(CENTER);
    text(`${winner} Team Wins!`, width * 0.5, 482);
    pop();
  }

  pop();
}

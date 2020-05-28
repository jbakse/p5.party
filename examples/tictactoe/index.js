/* global ss createButton */
/* eslint-disable no-unused-vars */

let shared;

let teamColors;
let team;

const gridSize = 130;

function preload() {
    connectToSharedRoom(
      "wss://deepstream-server-1.herokuapp.com",
      "tic-tac-toe",
      "main"
    );
    shared = getSharedData("globals");
}

function setup() {
  createCanvas(400, 400);
  teamColors = [color(250, 0), color(60,98, 181), color(255, 220, 82)];
  
  // make a select menu
  const teamDropDownMenu = createSelect();
    teamDropDownMenu.position(70, 440);
      teamDropDownMenu.option("Choose a Team")
      teamDropDownMenu.disable("Choose a Team");
      teamDropDownMenu.option("Blue");
      teamDropDownMenu.option("Yellow");
      teamDropDownMenu.option("Observer");

  // If an option is chosen, assign it a value
  teamDropDownMenu.changed(() => {
    team = teamDropDownMenu.value();      
  });

  // make a clear button
  const clearButton = createButton("clear").mousePressed(() => {
    if(team != "Observer") {
      shared.currentTurn = "Blue" || "Yellow";
      shared.boardState = [0,0,0, 0,0,0, 0,0,0];
    }   
  });
  clearButton.position(10, 430);  
}

function draw() {
  
  background(255, 0, 0);
  noStroke();
  rectMode(CORNER);

  // draw board
  for( let i = 0; i < 3; i++) {
    for(let j = 0; j < 3; j++) {
      fill(250);
      rect(i*140, j*140, 120, 120);
    }
  }
  
  // draw pieces
  for (let i = 0; i < 9; i++){

    fill(teamColors[shared.boardState[i]]);
   
    const grid_x = i % 3; 
    const grid_y = Math.floor(i / 3); 

    ellipse(grid_x * 133 + 67, grid_y * 133 + 65, 50, 50);
  }

  // display current turn
  fill(230);
  rect(5, 5, 110, 20, 5);

  fill(0);
  textSize(12);
  textFont("Avenir");
  text(shared.currentTurn +" team's turn!", 10, 18);

  declareOutcome();
}

function mousePressed(e) {
  const x = Math.floor(mouseX / gridSize);
  const y = Math.floor(mouseY / gridSize)

  const index = y * 3 + x;

  // Changes state based on which team's turn it is
  if(shared.boardState[index] === 0) {
    if(team === shared.currentTurn) {
      //ternary operator
      let stateNum = team === "Blue" ? 1 : 2;
      shared.boardState[index] = (shared.boardState[index] + stateNum) % 3;  
    }
  } 

  // Change turn on click in grid
  if (team === shared.currentTurn && index <= 9) {
    if (shared.currentTurn === "Blue") {
      shared.currentTurn = "Yellow";
    } else {                                      
      shared.currentTurn = "Blue";
    }
  }
  console.log(shared.boardState);
}

// Check for wins or draws
function declareOutcome() {

  stroke(50);
  strokeWeight(10);

  if(shared.boardState[0] === shared.boardState[1] && shared.boardState[1] === shared.boardState[2] && shared.boardState[2] != 0) {
    line(25, 65, 375, 65);
    }

  if(shared.boardState[3] === shared.boardState[4] && shared.boardState[4] === shared.boardState[5] && shared.boardState[5] != 0) {
    line(25, 197, 375, 197);
  } 
  
  if(shared.boardState[6] === shared.boardState[7] && shared.boardState[7] === shared.boardState[8] && shared.boardState[8] != 0) {
    line(25, 333, 375, 333);
  } 
  
  if(shared.boardState[0] === shared.boardState[3] && shared.boardState[3] === shared.boardState[6] && shared.boardState[6] != 0) {
    line(65, 25, 65, 375);
  } 
  
  if(shared.boardState[1] === shared.boardState[4] && shared.boardState[4] === shared.boardState[7] && shared.boardState[7] != 0) {
    line(200, 25, 200, 375);
  } 
  
  if(shared.boardState[2] === shared.boardState[5] && shared.boardState[5] === shared.boardState[8] && shared.boardState[8] != 0) {
    line(333, 25, 333, 375);
  } 
  
  if(shared.boardState[0] === shared.boardState[4] && shared.boardState[4] === shared.boardState[8] && shared.boardState[8] != 0) {
    line(35, 35, 365, 365);
  } 
  
  if(shared.boardState[2] === shared.boardState[4] && shared.boardState[4] === shared.boardState[6] && shared.boardState[6] != 0) {
    line(35, 365, 365, 35);

  } else {
    if(shared.boardState[0] != 0 && shared.boardState[1] != 0 && shared.boardState[2] != 0 && shared.boardState[3] != 0 && shared.boardState[4] != 0 && shared.boardState[5] != 0 && shared.boardState[6] != 0 && shared.boardState[7] != 0 && shared.boardState[8] != 0 && shared.boardState[9] != 0) {
      fill(255);
      stroke(0, 200);
      strokeWeight(5);
      rect(100, 150, 200, 100);

      fill(50);
      noStroke();
      textSize(45);
      text("DRAW", 130, 215);
    }
  }
 }


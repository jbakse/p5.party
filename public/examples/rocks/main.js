/**
 * main.js
 *
 * This is the entry point for the game. It doesn't do much itself, but rather
 * loads the other modules, sets things up, and coordinates the main game states.
 *
 * A major organizing prinicple of this code is that it is organized into
 * "gameStates". There is one gameState for the title screen and one for the
 * "play" state.
 *
 * Each gameState has a few methods and main is responsible for calling
 * these methods on the current gameState at the appropriate times.
 *
 * The methods are:
 *  enter - called when the game state is entered (optional)
 *  update - called every frame, game logic, no drawing
 *  draw - called every frame, should draw the scene, no game logic
 *  leave - called when the game state is left (optional)
 *  mousePressed - called when the mouse is pressed (optional)
 *  keyPressed - called when a key is pressed (optional)
 *  keyReleased - called when a key is released (optional)
 *
 * main.js provides a function called setGameState that gameStates can use to
 * change the current gameState.
 *
 * In additon main.js loads and manages the camera and the party modules.
 *
 */

import * as gameStateTitle from "./gameStateTitle.js";
import * as gameStatePlay from "./gameStatePlay.js";
import * as camera from "./camera.js";
import * as party from "./party.js";

// we need to store the width + height of the canvas so that we can refer
// to them before the canvas is created (e.g. in preload)
export const config = {
  width: 600, // width of the canvas
  height: 600, // height of the canvas
};

let fontDune; // the UI font
let canvas; // a reference to the canvas needed for the postprocessing

// p5.js auto detects setup() and draw() but since this code is a module
// the functions aren't global.
// This creates aliases of the p5 functions on window, so p5.js can find them
Object.assign(window, {
  preload,
  draw,
  setup,
  mousePressed,
  keyPressed,
  keyReleased,
});

function preload() {
  Object.values(gameStates).forEach((state) => state.preload?.());
  camera.preload();
  party.preload();
  fontDune = loadFont("./dune_rise/Dune_Rise.otf");
}

function setup() {
  canvas = createCanvas(config.width, config.height, WEBGL);
  noFill();
  noStroke();
  textFont(fontDune);
  preventDefaultKeys();

  party.setup();
  setGameState(gameStates.title);
}

function draw() {
  // update
  party.update();
  gameState.update();
  camera.update();

  // draw
  // WEBGL mode has origin at center, move origin to top left
  translate(-width / 2, -height / 2);
  camera.applyShake();
  gameState.draw();
  camera.postprocess(canvas);
}

function mousePressed() {
  gameState.mousePressed?.();
}

function keyPressed() {
  gameState.keyPressed?.();
}

function keyReleased() {
  gameState.keyReleased?.();
}

// ///////////////////////////////////////////////////
// Game State Manager

// gameState - keeps track of which game state is current
let gameState;

// gameStates - a map of the possible game states
export const gameStates = {
  title: gameStateTitle,
  play: gameStatePlay,
};

// setGameState
// called when the gamestate should change, calls leave on the old state,
// updates gameState, then calls enter on the new state
export function setGameState(newState) {
  // new state must be provided, and must have an update and draw function
  if (!newState || !newState.update || !newState.draw) {
    console.error("setGameState(newState): newState not not valid");
    return;
  }
  gameState?.leave?.();
  gameState = newState;
  gameState.enter?.();
}

// ///////////////////////////////////////////////////
// Utilities

// prevent browser from handling single key presses
// e.g. scrolling the page when the arrow keys are pressed
// allow "meta" key combos through
// e.g. cmd + r to reload the page

function preventDefaultKeys() {
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.ctrlKey || e.metaKey) {
      return true;
    }
    e.preventDefault();
    return false;
  });
}

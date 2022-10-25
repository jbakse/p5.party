/**
 * gameStateTitle.js
 *
 * Displays the title screen.
 *
 * When the user clicks, the game enters the "play" state.
 * This makes sure the game has keyboard focus and that a "gesture" occurs
 * before the game tries to play sounds (required by some browsers).
 */

import { gameStates, setGameState } from "./main.js";

export function enter() {
  // nothing
}

export function update() {
  // nothing
}

export function draw() {
  push();
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);

  textSize(100);
  translate(width / 2, height / 2);
  text("Rocks", 0, 0);

  textSize(10);
  translate(0, 100);
  fill(255, abs(sin(frameCount * 0.02)) * 255);
  text("click to begin", 0, 0);

  pop();
}

export function mousePressed() {
  setGameState(gameStates.play);
}

export function leave() {
  // nothing
}

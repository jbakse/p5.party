// https://opengameart.org/content/a-platformer-in-the-forest

/* eslint-disable no-unused-vars */
/* global connectToSharedRoom getSharedData */

let shared;

function preload() {
  connectToSharedRoom(
    "wss://deepstream-server-1.herokuapp.com",
    "simple",
    "main"
  );
  shared = getSharedData("globals");
}

async function setup() {
  createCanvas(400, 400);

  // set defaults on shared data
  shared.x = shared.x || 0;
  shared.y = shared.y || 0;
  shared.clickHistory = shared.clickHistory || [];
}

function draw() {
  background(0);
  noStroke();

  // read shared data
  fill("red");
  ellipse(shared.x, shared.y, 100, 100);

  fill("#6666ff");
  for (const p of shared.clickHistory) {
    ellipse(p.x, p.y, 20, 20);
  }
}

function mousePressed(e) {
  // write shared data
  shared.x = mouseX;
  shared.y = mouseY;
  shared.clickHistory.push({ x: mouseX, y: mouseY });
}

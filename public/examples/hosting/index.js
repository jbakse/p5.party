// https://opengameart.org/content/a-platformer-in-the-forest

/* eslint-disable no-unused-vars */
/* global connectToSharedRoom getSharedData isHost */

let shared;

function preload() {
  connectToSharedRoom(
    "wss://deepstream-server-1.herokuapp.com",
    "hosting",
    "main"
  );
  shared = getSharedData("globals");
}

function setup() {
  createCanvas(400, 400);
  noStroke();
  // set defaults on shared data
  shared.clicks = shared.clicks || [];
  shared.startTime = shared.startTime || new Date();
  console.log("start as host?", isHost());
}

function draw() {
  background(0);
  noStroke();
  // reset the history every 10 seconds
  // we don't want every participant doing this
  // so we can ask the host to handle it
  if (isHost()) {
    const elapsed = new Date() - new Date(shared.startTime);
    if (elapsed > 10000) {
      shared.startTime = new Date();
      shared.clicks = [];
    }

    fill(255);
    text("Hosting!", 10, 20);
    text(elapsed / 1000, 10, 40);
  }

  fill("red");
  for (const p of shared.clicks) {
    ellipse(p.x, p.y, 20, 20);
  }
}

function mousePressed(e) {
  // write shared data
  shared.clicks.push({ x: mouseX, y: mouseY });
}

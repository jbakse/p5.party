// https://opengameart.org/content/a-platformer-in-the-forest

/* eslint-disable no-unused-vars */
/* global sharedConnect loadShared */

let shared;

function preload() {
  console.log("preload");
  sharedConnect("simple", "main", "wss://deepstream-server-1.herokuapp.com");
  shared = loadShared("globals");
}

async function setup() {
  console.log("setup");

  createCanvas(400, 400);

  console.log(shared);
  shared.x = shared.x || 0;
  shared.y = shared.y || 0;
  console.log(shared);
}

function draw() {
  background(50);
  fill(200);
  noStroke();
  ellipse(shared.x, shared.y, 100, 100);
}

function mousePressed(e) {
  console.log("mousePressed");
  console.log(shared);
  shared.x = mouseX;
  shared.y = mouseY;
}

/* eslint-disable no-unused-vars */
/* global partyConnect partyLoadShared */

let shared;

function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "click_history",
    "main"
  );
  shared = partyLoadShared("globals");
}

function setup() {
  createCanvas(400, 400);

  // set defaults on shared data
  shared.x = shared.x || 0;
  shared.y = shared.y || 0;
  shared.color = shared.color || "white";
  shared.clickHistory = shared.clickHistory || [];
}

function draw() {
  background(0);
  noStroke();

  // read shared data
  fill(shared.color);
  ellipse(shared.x, shared.y, 100, 100);

  fill("#6666ff");
  for (const p of shared.clickHistory) {
    ellipse(p.x, p.y, 20, 20);
  }
}

function keyPressed() {
  // write shared data
  if (key === " ") shared.clickHistory = [];
}

function mousePressed(e) {
  // write shared data
  shared.x = mouseX;
  shared.y = mouseY;
  shared.color = color(random(255), random(255), random(255)).toString();
  shared.clickHistory.push({ x: mouseX, y: mouseY });
}

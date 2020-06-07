/* eslint-disable no-unused-vars */
/* global partyConnect partyLoadShared createButton*/

let shared = false;
function preload() {}

function setup() {
  createCanvas(400, 400);
  noStroke();
  fill("#3333cc");

  // set defaults on shared data
  shared.x = shared.x || 0;
  shared.y = shared.y || 0;

  createButton("connect").mousePressed(connectToParty);
}

function connectToParty() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "hello_party",
    "main",
    () => {
      console.log("connected!");
    }
  );
  partyLoadShared("shared", (s) => {
    console.log("shared object loaded!");
    shared = s;
  });
}

function mousePressed(e) {
  // write shared dataa
  shared.x = mouseX;
  shared.y = mouseY;
}

function draw() {
  if (!shared) {
    background("#666600");
    return;
  }

  background("#ffcccc");

  // read shared data
  ellipse(shared.x, shared.y, 100, 100);
}

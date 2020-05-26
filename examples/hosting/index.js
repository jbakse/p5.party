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

async function setup() {
  createCanvas(400, 400);
  noStroke();

  // set defaults on shared data
  shared.ball = shared.ball || {
    x: width * 0.5,
    y: 0,
    dX: 0,
    dY: 0,
  };

  shared.click = shared.click || {
    x: width * 0.5,
    y: height * 0.5,
  };
}

function draw() {
  background(0);
  noStroke();

  // read shared data
  if (isHost()) {
    fill(255);
    text("Hosting!", 10, 20);

    shared.ball.x += shared.ball.dX;
    shared.ball.y += shared.ball.dY;
    shared.ball.dY += 0.4;
    if (shared.ball.y > height + 50) {
      shared.ball = {
        x: width * 0.5,
        y: -50,
        dX: 0,
        dY: 0,
      };
    }
  }

  fill("white");
  ellipse(shared.ball.x, shared.ball.y, 40, 40);

  fill("red");
  ellipse(shared.click.x, shared.click.y, 40, 40);
}

function mousePressed(e) {
  // write shared data
  shared.click.x = mouseX;
  shared.click.y = mouseY;
}

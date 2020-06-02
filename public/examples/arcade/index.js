//
/* eslint-disable no-unused-vars */
/* global connectToSharedRoom getSharedData isHost createCheckbox */

let shared, host;

function preload() {
  connectToSharedRoom(
    "wss://deepstream-server-1.herokuapp.com",
    "arcade",
    "main"
  );
  shared = getSharedData("shared");
  host = getSharedData("host");
}

let run;
function setup() {
  createCanvas(400, 400);
  noStroke();

  run = createCheckbox("run");
  run.checked(true);

  // set defaults on shared data
  host.ball = host.ball || {
    x: width * 0.5,
    y: 0,
    dX: 0,
    dY: 0,
  };

  shared.click = shared.click || {
    x: width * 0.5,
    y: height * 0.5,
  };

  frameRate(60);
}

function draw() {
  background(0);
  noStroke();

  if (isHost()) {
    fill(255);
    text("Hosting!", 10, 20);
  }
  // read shared data
  if (run.checked() && isHost()) {
    // apply momentum
    host.ball.x += host.ball.dX;
    host.ball.y += host.ball.dY;

    // apply gravity
    host.ball.dY += 0.6;

    // respawn
    if (host.ball.y > height + 50) {
      host.ball = {
        x: width * 0.5,
        y: -50,
        dX: 0,
        dY: 0,
      };
    }

    // handle collisions
    if (dist(host.ball.x, host.ball.y, shared.click.x, shared.click.y) < 40) {
      // move out of penetration
      const n = createVector(
        host.ball.x - shared.click.x,
        host.ball.y - shared.click.y
      );
      n.normalize();
      host.ball.x = shared.click.x + n.x * 40;
      host.ball.y = shared.click.y + n.y * 40;

      // bounce ball
      const d = createVector(host.ball.dX, host.ball.dY);
      d.reflect(n.copy());
      host.ball.dX = d.x * 0.5;
      host.ball.dY = d.y * 0.5;
    }
  }

  // draw
  fill("white");
  ellipse(host.ball.x, host.ball.y, 40, 40);

  fill("green");
  ellipse(shared.click.x, shared.click.y, 40, 40);
}

function keyPressed(e) {
  console.log("keypress");
  host.ball = {
    x: width * 0.5,
    y: -50,
    dX: 0,
    dY: 0,
  };
}
function mousePressed(e) {
  // write shared data
  shared.click.x = mouseX;
  shared.click.y = mouseY;
}

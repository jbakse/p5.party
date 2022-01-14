let host;
let shared;

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "arcade", "main");
  shared = partyLoadShared("shared");
  host = partyLoadShared("host");
}

function setup() {
  createCanvas(400, 400);
  noStroke();

  // set initial values
  if (partyIsHost()) {
    host.ball = {
      x: width * 0.5,
      y: 0,
      dX: 0,
      dY: 0,
    };
    shared.click = {
      x: width * 0.51,
      y: height * 0.5,
    };
  }
}

function draw() {
  background("#660066");
  noStroke();

  if (partyIsHost()) {
    fill(255);
    textSize(20);
    textFont("Courier New");
    text("Hosting!", 10, 30);
  }

  // read shared data
  if (partyIsHost()) {
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
      const collision_vector = createVector(
        host.ball.x - shared.click.x,
        host.ball.y - shared.click.y
      );
      collision_vector.normalize();
      host.ball.x = shared.click.x + collision_vector.x * 40;
      host.ball.y = shared.click.y + collision_vector.y * 40;

      // bounce
      const velocityVector = createVector(host.ball.dX, host.ball.dY);
      velocityVector.reflect(collision_vector);
      velocityVector.mult(0.5);
      host.ball.dX = velocityVector.x;
      host.ball.dY = velocityVector.y;
    }
  }

  // draw
  fill("white");
  ellipse(host.ball.x, host.ball.y, 40, 40);

  fill("#66ff66");
  ellipse(shared.click.x, shared.click.y, 40, 40);
}

function mousePressed(e) {
  // write shared data
  shared.click.x = mouseX;
  shared.click.y = mouseY;
}

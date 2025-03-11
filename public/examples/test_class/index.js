let shared;

function preload() {
  partyConnect("wss://demoserver.p5party.org", "hello_class");
  shared = partyLoadShared("shared", { balls: [] });
}

function setup() {
  createCanvas(400, 400);
  noStroke();
  if (partyIsHost()) {
    shared.balls.push(new Ball(100, 200));
  }

  partyToggleInfo(true);
  // noLoop();
}

function draw() {
  background("#ffcccc");
  fill("#000066");

  for (const ball of shared.balls) {
    // ball doesn't have a prototype, set it to prototype of Ball
    if (Object.getPrototypeOf(ball) !== Ball.prototype) {
      console.log("promoting");
      Object.setPrototypeOf(ball, Ball.prototype);
    }
    ball.update();
    ball.draw();
  }
}

function mousePressed() {
  if (partyIsHost()) {
    shared.balls.push(new Ball(mouseX, mouseY));
  }
}

function keyPressed() {
  if (partyIsHost()) {
    shared.balls.shift();
  }
}

class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dX = 1;
    this.dY = 1;
  }
  update() {
    if (!partyIsHost()) return;
    this.x += this.dX;
    this.y += this.dY;
    if (this.x < 0) this.dX = abs(this.dX);
    if (this.x > width) this.dX = -abs(this.dX);
    if (this.y < 0) this.dY = abs(this.dY);
    if (this.y > height) this.dY = -abs(this.dY);
  }
  draw() {
    ellipse(this.x, this.y, 100, 100);
  }
}

let shared;

function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "empty_example",
    "main"
  );
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400);
  if (partyIsHost()) {
    partySetShared(shared, {
      pos: { x: 200, y: 200 },
      color: color("red").toString(),
    });
  }
}

function mousePressed() {
  // p5.Vectors can't be shared directly
  const mouseVector = createVector(mouseX, mouseY);

  // but you probably only need to share
  // the x and y (and sometimes Z) properties
  // unpack the values you need to share
  // from the vector
  shared.pos = { x: mouseVector.x, y: mouseVector.y };
  // shared.pos isn't a p5.Vector, just a simple data object

  // p5.Color objects can't be shared directly
  const randomColor = color(random(255), random(255), random(255));

  // but you can convert p5.Color objects to strings for sharing
  shared.color = randomColor.toString();

  // the string looks like this "rgba(255, 0, 0, 1)"
}

function draw() {
  background(220);
  noStroke();

  // p5 functions that take color arguments
  // can accept the color description strings
  fill(shared.color);

  // shared.pos has the x and y values we need.
  ellipse(shared.pos.x, shared.pos.y, 50, 50);
}

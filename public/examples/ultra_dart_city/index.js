let shared;

let barY;
let dir;

function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "ultra-dart-city-5",
    "main"
  );
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(450, 450);
  background("white");
  noStroke();

  barY = 350;
  dir = 1;

  // set defaults on shared data
  shared.x = 0;
  shared.y = 0;

  // board border
  fill(139, 69, 19);
  ellipse(200, 200, 325, 325);

  // board
  fill("green");
  ellipse(200, 200, 300, 300);

  // toss button
  const tossBtn = createButton("toss");
  tossBtn.mousePressed(tossDart);
}

function draw() {
  // bar - orange section
  fill(255, 200, 0);
  rect(20, 300, 40, 100);

  //bar - green section
  fill(150, 255, 0);
  rect(20, 300, 40, 40);

  // bar - red section
  fill(255, 0, 0);
  rect(20, 380, 40, 50);

  // marker movement
  if (barY > 409) {
    dir *= -1;
  } else if (barY < 300) {
    dir *= -1;
  }

  barY += dir * 3;

  // bar marker
  fill(255, 255, 0);
  rect(20, barY, 40, 20);

  // darts thrown
  fill(random(255), random(255), random(255));
  if (shared.x && shared.y != 0) {
    ellipse(shared.x, shared.y, 10, 10);
  }
}

function tossDart() {
  let precision = map(barY, 300, 409, 0, 200);

  let a = random() * 2 * PI;
  let r = precision * sqrt(random());

  let x = r * cos(a) + 200;
  let y = r * sin(a) + 200;

  shared.x = x;
  shared.y = y;
}

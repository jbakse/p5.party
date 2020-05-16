// https://opengameart.org/content/a-platformer-in-the-forest
/* global ss createButton */
/* eslint-disable no-unused-vars */

let shared;

async function setup() {
  createCanvas(400, 400);

  // ss.init takes a app name and a room name
  // for your version you'll want to replace "simple" with the name of your sketch
  await ss.init("simple", "main");

  // this loads a shared data store named "globals"
  // the second parameter is an object that defines the initial state if
  // the data store doesn't alreay exist
  shared = await ss.GetShared("globals", { x: 0, y: 0 });

  // check if the .history exists, if not start an empty []
  if (!shared.history) shared.history = [];

  // make a clear button
  createButton("clear").mousePressed(() => {
    shared.history = [];
  });
}

function draw() {
  // wait for shared to load before actually drawing
  if (!shared) return;

  background(50);

  // this next line uses the || trick to provide a default if `shared.color` doesn't exist
  fill(shared.color || "red");
  noStroke();

  ellipse(shared.x, shared.y, 100, 100);

  // loop through the stored points and draw them
  for (point of shared.history) {
    fill("gray");
    ellipse(point.x, point.y, 20, 20);
  }
}

function mousePressed(e) {
  // simple values like numbers and strings are easy
  // just set them and ss will sync them
  shared.x = mouseX;
  shared.y = mouseY;

  // more complicated data like arrays is more of a trouble
  // ss doesn't notice that the contents shared.history is changed here
  shared.history.push({ x: mouseX, y: mouseY });

  // you can use the .send() method on shared to push all the data manually
  // but this is slow because it pushes everything, even things that didn't change
  // and we already pushed .x and .y above so they get sent twice
  shared.send();

  // the syncing works pretty well if you don't have multiple clients rapidly
  // setting the value (like every frame on draw or mousemove)

  // see note in random color about keeping data simple
  shared.color = randomColor();
}

function randomColor() {
  // you (probably) can't store anything fancy (like instances) in shared.
  // i'm using p5's color's toString here to make a simple string to store
  // fill can use the string just fine
  return color(random(255), random(255), random(255)).toString();
}

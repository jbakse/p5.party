/* global uuidv4 */

class Rect {
  constructor(l = 0, t = 0, w = 0, h = 0) {
    this.l = l;
    this.t = t;
    this.w = w;
    this.h = h;
  }
}

class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

function pointInRect(p, r) {
  return p.x > r.l && p.x < r.l + r.w && p.y > r.t && p.y < r.t + r.h;
}

// function hydrate(data, _class) {
//   let o = new window[_class]();
//   o = Object.assign(o, data);
//   return o;
// }

const my_id = uuidv4();
let shared;
function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "hello_party",
    "main"
  );
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400);
  noStroke();

  shared.sprites = [];

  shared.sprites.push(initSprite(new Rect(10, 10, 100, 100), "#ffff66"));
  shared.sprites.push(initSprite(new Rect(30, 30, 100, 100), "#ff66ff"));
  shared.sprites.push(initSprite(new Rect(50, 50, 100, 100), "#66ffff"));

  console.log(shared.sprites);
}

function draw() {
  background("#cc6666");

  shared.sprites.forEach((s) => stepSprite(s));
  shared.sprites.forEach((s) => drawSprite(s));
}

function mousePressed() {
  for (const s of shared.sprites.slice().reverse()) {
    if (mousePressedSprite(s)) break;
  }
}

function mouseReleased() {
  shared.sprites.forEach((s) => mouseReleasedSprite(s));
}

function initSprite(rect = new Rect(), color = "red") {
  const s = {};
  s.rect = rect;
  s.color = color;
  return s;
}

function stepSprite(s) {
  if (s.inDrag && s.owner === my_id) {
    s.rect.l = mouseX + s.dragOffset.x;
    s.rect.t = mouseY + s.dragOffset.y;
  }
}

function drawSprite(s) {
  push();
  fill(s.color);
  noStroke();
  if (s.inDrag) {
    strokeWeight(3);
    stroke("black");
  }
  rect(s.rect.l, s.rect.t, s.rect.w, s.rect.h);
  pop();
}

function mousePressedSprite(s) {
  if (pointInRect(new Point(mouseX, mouseY), s.rect)) {
    const i = shared.sprites.indexOf(s);

    s.inDrag = true;
    console.log("changed", shared.sprites.indexOf(s) !== i);

    s.owner = my_id;
    s.dragOffset = new Point(s.rect.l - mouseX, s.rect.t - mouseY);

    shared.sprites.splice(i, 1);
    shared.sprites.push(s);
    return true;
  }
  return false;
}

function mouseReleasedSprite(s) {
  s.inDrag = false;
  s.owner = null;
}

import { Point, pointInRect, Rect } from "./shape.js";

const my_id = Math.random();

let shared;

window.preload = () => {
  partyConnect("wss://demoserver.p5party.org", "drag_conflict");
  shared = partyLoadShared("shared");
};

window.setup = () => {
  createCanvas(400, 400);
  noStroke();

  if (partyIsHost()) {
    shared.sprites = [];
    shared.sprites.push(initSprite(new Rect(10, 10, 100, 100), "#ffff66"));
    shared.sprites.push(initSprite(new Rect(30, 30, 100, 100), "#ff66ff"));
    shared.sprites.push(initSprite(new Rect(50, 50, 100, 100), "#66ffff"));
  }
};

window.draw = () => {
  background("#cc6666");
  shared.sprites.forEach(stepSprite);
  shared.sprites.forEach(drawSprite);
};

window.mousePressed = () => {
  for (const s of shared.sprites.slice().reverse()) {
    if (mousePressedSprite(s)) break;
  }
};

window.mouseReleased = () => {
  for (const s of shared.sprites.slice().reverse()) {
    if (mouseReleasedSprite(s)) break;
  }
};

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
  if (!s.inDrag && pointInRect(new Point(mouseX, mouseY), s.rect)) {
    // begin drag
    s.inDrag = true;
    s.owner = my_id;
    s.dragOffset = new Point(s.rect.l - mouseX, s.rect.t - mouseY);

    // move to top
    const i = shared.sprites.indexOf(s);
    shared.sprites.splice(i, 1);
    shared.sprites.push(s);
    return true;
  }
  return false;
}

function mouseReleasedSprite(s) {
  if (s.owner === my_id) {
    s.inDrag = false;
    s.owner = null;
  }
  return false;
}

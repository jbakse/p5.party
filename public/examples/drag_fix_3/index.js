import { Point, pointInRect, Rect } from "./shape.js";

const my_id = Math.random();

let shared;

window.preload = () => {
  partyConnect("wss://demoserver.p5party.org", "drag_fix_2");
  shared = partyLoadShared("shared");
};

window.setup = () => {
  createCanvas(400, 400);
  noStroke();

  if (partyIsHost()) {
    shared.sprites = [];
    shared.sprites.push(initSprite("a", new Rect(10, 10, 100, 100), "#ffff66"));
    shared.sprites.push(initSprite("b", new Rect(30, 30, 100, 100), "#ff66ff"));
    shared.sprites.push(initSprite("c", new Rect(50, 50, 100, 100), "#66ffff"));
  }

  partySubscribe("updateSprite", onUpdateSprite);
};

function onUpdateSprite({ id, updates }) {
  if (!partyIsHost()) return;
  const s = shared.sprites.find((s) => s.id === id);
  if (!s) return;
  for (const [k, v] of Object.entries(updates)) {
    s[k] = v;
  }
}

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

function initSprite(id, rect = new Rect(), color = "red") {
  const s = {};
  s.id = id;
  s.rect = rect;
  s.color = color;
  return s;
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

function stepSprite(s) {
  if (s.inDrag && s.owner === my_id) {
    // create new rect
    const rect = new Rect(
      mouseX + s.dragOffset.x,
      mouseY + s.dragOffset.y,
      s.rect.w,
      s.rect.h,
    );

    // update
    partyEmit("updateSprite", {
      id: s.id,
      updates: { rect },
    });
  }
}

function mousePressedSprite(s) {
  if (!s.inDrag && pointInRect(new Point(mouseX, mouseY), s.rect)) {
    // begin drag
    // s.inDrag = true;
    // s.owner = my_id;
    // s.dragOffset = new Point(s.rect.l - mouseX, s.rect.t - mouseY);

    partyEmit("updateSprite", {
      id: s.id,
      updates: {
        inDrag: true,
        owner: my_id,
        dragOffset: new Point(s.rect.l - mouseX, s.rect.t - mouseY),
      },
    });
    return true;

    // move to top
    // in drag_conflict squares are moved to the top when dragging starts
    // this is not implemented here yet
  }
  return false;
}

function mouseReleasedSprite(s) {
  if (s.owner === my_id) {
    // s.inDrag = false;
    // s.owner = null;

    partyEmit("updateSprite", {
      id: s.id,
      updates: {
        inDrag: false,
        owner: null,
      },
    });
  }
  return false;
}

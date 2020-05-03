// https://opengameart.org/content/a-platformer-in-the-forest

const dslog = makeLogger(
  "log",
  "ds",
  "background-color: #888; color: #00ffff; padding: 2px 5px; border-radius: 2px"
);

const dserror = makeLogger(
  "log",
  "ds",
  "background-color: #ff0000; color: #ffffff; padding: 2px 5px; border-radius: 2px"
);

let ds;
let sprite_list;
let sprites = [];
let images = [];

let king;

function preload() {
  images["images/king.png"] = loadImage("images/king.png");
}

function setup() {
  setupDeepstream();

  createCanvas(400, 400);
  background(50);

  const init_button = createButton("init");
  init_button.mousePressed(init);

  const nudge_button = createButton("nudge");
  nudge_button.mousePressed(() => {
    const data = king.get();
    king.set("x", data.x + 10);
  });

  const add_sprite_button = createButton("add sprite");
  add_sprite_button.mousePressed(() => {
    king = addSharedSprite(random(100), random(100), 60, 88, "images/king.png");
  });
}

function draw() {
  background(50);
  sprites.forEach((s) => s.draw());
}

function init() {
  // remove records from the list first, then delete them
  // so that ids in the list are always valid records
  const ids = sprite_list.getEntries();
  sprite_list.setEntries([]);
  ids.forEach(async (id) => {
    ds.record.getRecord(id).delete();
  });

  king = addSharedSprite(50, 50, 60, 88, "images/king.png");
}

async function setupDeepstream() {
  // connect to ds server
  ds = new DeepstreamClient("localhost:6020");
  const name = randomName();
  await ds.login({ username: name });
  dslog("login complete", name);

  ds.on("error", (error, event, topic) =>
    dserror("error", error, event, topic)
  );

  ds.on("connectionStateChanged", (connectionState) =>
    dslog("connectionStateChanged", connectionState)
  );

  // subscribe to sprite_list
  sprite_list = ds.record.getList("sprites");

  sprite_list.on("entry-added", (id, index) => {
    dslog("sprites entry-added", id, index);
    attachSprite(id);
  });

  sprite_list.on("entry-removed", (id, index) => {
    dslog("sprites entry-removed", id, index);
    detachSprite(id);
  });

  // populate sprites
  await sprite_list.whenReady();
  const ids = sprite_list.getEntries();
  ids.forEach((id) => {
    attachSprite(id);
  });
}

// i can't include the class name in the record
// and then instantiate the correct object because
// i instantiate the object _before_ the record is loaded
// i'd either have to figure out another way instantiate and add to list (null placeholder)
// or maybe use an entity component pattern instead
// all shared sprites are shared sprites, but they have a component that gives them behavior

function attachSprite(id) {
  const r = ds.record.getRecord(id);
  const s = new DraggedSprite(id, r);
  sprites.push(s);

  king = r;
}

function detachSprite(id) {
  ds.record.getRecord(id).discard();
  sprites = sprites.filter((sprite) => sprite.id !== id);
}

async function addSharedSprite(x, y, w, h, src, type = "SharedSprite", id) {
  id = id || `sprites/${ds.getUid()}`;
  const r = await ds.record.getRecord(id);
  r.set({ x, y, w, h, src, type });
  await r.whenReady();

  sprite_list.addEntry(id);
  return r;
}

class SharedSprite {
  constructor(id, record) {
    this.id = id;
    this.record = record;
  }

  draw() {
    const data = this.getData();
    if (!data) return;

    noSmooth();
    image(images[data.src], data.x, data.y, data.w, data.h);
    fill("white");
    text(this.id.substr(-5), data.x, data.y);
  }

  getData() {
    if (!this.record.isReady) {
      return false;
    }

    const data = this.record.get();

    if (!data || isEmpty(data)) {
      console.error("!data", this.id);
      return false;
    }
    return data;
  }
}

class DraggedSprite extends SharedSprite {
  mousePressed(e) {
    const data = this.getData();
    if (!data) return;

    if (
      mouseX > data.x &&
      mouseY > data.y &&
      mouseX < data.x + data.w &&
      mouseY < data.y + data.h
    ) {
      this.dragging = true;
      console.log("drag");
    }
  }

  mouseDragged(e) {
    if (this.dragging) {
      const data = this.getData();
      if (!data) return;
      this.record.set("x", mouseX - data.w * 0.5);
      this.record.set("y", mouseY - data.h * 0.5);
    }
  }

  mouseReleased() {
    this.dragging = false;
  }
}

window.addEventListener("unload", function (event) {
  console.log("I am the 3rd one.");
});

function mousePressed(e) {
  console.log("mousePressed");
  sprites.forEach((s) => {
    s.mousePressed && s.mousePressed(e);
  });
}

function mouseReleased(e) {
  sprites.forEach((s) => {
    s.mouseReleased && s.mouseReleased(e);
  });
}

function mouseMoved(e) {
  sprites.forEach((s) => {
    s.mouseMoved && s.mouseMoved(e);
  });
}

function mouseDragged(e) {
  sprites.forEach((s) => {
    s.mouseDragged && s.mouseDragged(e);
  });
}

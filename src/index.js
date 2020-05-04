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

class SharedSpriteManager {
  constructor() {
    this.sprites = [];
  }
  async init() {
    // subscribe to sprite_list
    this.sprite_list = ds.record.getList("sprites");

    this.sprite_list.on("entry-added", (id, index) => {
      dslog("sprites entry-added", id, index);
      this.attachSprite(id);
    });

    this.sprite_list.on("entry-removed", (id, index) => {
      dslog("sprites entry-removed", id, index);
      this.detachSprite(id);
    });

    // populate sprites
    await this.sprite_list.whenReady();
    const ids = this.sprite_list.getEntries();
    ids.forEach((id) => {
      this.attachSprite(id);
    });
  }

  attachSprite(id) {
    const r = ds.record.getRecord(id);
    const s = new DraggedSprite(id, r);
    this.sprites.push(s);

    king = r;
  }

  detachSprite(id) {
    ds.record.getRecord(id).discard();
    this.sprites = this.sprites.filter((s) => s.id !== id);
  }

  async addSharedSprite(x, y, w, h, src, type = "SharedSprite", id) {
    id = id || `sprites/${ds.getUid()}`;
    const r = await ds.record.getRecord(id);
    r.set({ x, y, w, h, src, type });
    await r.whenReady();

    this.sprite_list.addEntry(id);
    return r;
  }

  clear() {
    // remove records from the list first, then delete them
    // so that ids in the list are always valid records
    const ids = this.sprite_list.getEntries();
    this.sprite_list.setEntries([]);
    ids.forEach(async (id) => {
      ds.record.getRecord(id).delete();
    });
  }

  mousePressed(e) {
    this.sprites.forEach((s) => s.mousePressed && s.mousePressed(e));

    for (let i = this.sprites.length - 1; i >= 0; i--) {
      const s = this.sprites[i];
      const data = s.getData();
      if (
        s.mousePressedInside &&
        mouseX > data.x &&
        mouseY > data.y &&
        mouseX < data.x + data.w &&
        mouseY < data.y + data.h
      ) {
        s.mousePressedInside(e);
        break;
      }
    }
  }

  mouseReleased(e) {
    this.sprites.forEach((s) => s.mouseReleased && s.mouseReleased(e));
  }

  mouseMoved(e) {
    this.sprites.forEach((s) => s.mouseMoved && s.mouseMoved(e));
  }

  mouseDragged(e) {
    this.sprites.forEach((s) => s.mouseDragged && s.mouseDragged(e));
  }
}

let ds;

const images = [];

const spriteManager = new SharedSpriteManager();

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
    king = spriteManager.addSharedSprite(
      random(100),
      random(100),
      60,
      88,
      "images/king.png"
    );
  });
}

function draw() {
  background(50);
  spriteManager.sprites.forEach((s) => s.draw && s.draw());
}

function mousePressed(e) {
  spriteManager.mousePressed(e);
}

function mouseReleased(e) {
  spriteManager.mouseReleased(e);
}

function mouseMoved(e) {
  spriteManager.mouseMoved(e);
}

function mouseDragged(e) {
  spriteManager.mouseDragged(e);
}

function init() {
  spriteManager.clear();

  king = spriteManager.addSharedSprite(50, 50, 60, 88, "images/king.png");
}

async function setupDeepstream() {
  // connect to ds server
  // ds = new DeepstreamClient("localhost:6020");
  ds = new DeepstreamClient("deepstream-server-1.herokuapp.com");
  const name = randomName();
  await ds.login({ username: name });
  dslog("login complete", name);

  ds.on("error", (error, event, topic) =>
    dserror("error", error, event, topic)
  );

  ds.on("connectionStateChanged", (connectionState) =>
    dslog("connectionStateChanged", connectionState)
  );

  await spriteManager.init();
}

window.addEventListener("unload", function (event) {
  console.log("I'm Unloading!");
});

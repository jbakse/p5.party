// https://opengameart.org/content/a-platformer-in-the-forest

const images = [];

const spriteManager = new SharedSpriteManager();

let debug_king;

function preload() {
  images["images/king.png"] = loadImage("images/king.png");
  images["images/die.png"] = loadImage("images/die.png");
  images["images/green_1.png"] = loadImage("images/green_1.png");
  images["images/green_2.png"] = loadImage("images/green_2.png");
  images["images/train.png"] = loadImage("images/train.png");
}

async function setup() {
  createCanvas(400, 400);
  background(50);

  makeButtons();

  await initDeepstream();
  await spriteManager.init();
}

function draw() {
  background(50);
  spriteManager.draw();
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

window.addEventListener("unload", function (event) {
  spriteManager.unload();

  console.log("I'm Unloading!");
});

function makeButtons() {
  const clear_button = createButton("clear");
  clear_button.mousePressed(() => {
    spriteManager.clear();
  });

  const nudge_button = createButton("nudge");
  nudge_button.mousePressed(() => {
    const data = debug_king.get();
    debug_king.set("x", data.x + 10);
  });

  const d6 = createButton("d6");
  d6.mousePressed(() => {
    king = spriteManager.addSharedSprite(
      random(width - 32),
      random(height - 32),
      32,
      32,
      ["pixelImage", "draggable", "label", "d6"],
      { src: "images/die.png" }
    );
  });

  const ttt = createButton("ttt");
  ttt.mousePressed(() => {
    spriteManager.addSharedSprite(16, 16, 256, 80, ["pixelImage"], {
      src: "images/train.png",
    });

    spriteManager.addSharedSprite(64, 48, 16, 16, ["pixelImage", "draggable"], {
      src: "images/green_1.png",
      snapTo: 16,
    });

    spriteManager.addSharedSprite(96, 48, 16, 16, ["pixelImage", "draggable"], {
      src: "images/green_2.png",
      snapTo: 16,
    });
  });
}

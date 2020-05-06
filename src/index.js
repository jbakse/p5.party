// https://opengameart.org/content/a-platformer-in-the-forest

const images = [];

const spriteManager = new SharedSpriteManager();

let debug_king;

function preload() {
  images["images/king.png"] = loadImage("images/king.png");
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

  const add_sprite_button = createButton("add sprite");
  add_sprite_button.mousePressed(() => {
    king = spriteManager.addSharedSprite(
      random(100),
      random(100),
      40,
      40,
      "images/king.png",
      "D6"
    );
  });
}

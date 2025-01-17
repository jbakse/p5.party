let soapShared, wipeShared;
let dirtG;

const images = {};

function preload() {
  partyConnect("wss://demoserver.p5party.org", "soap");

  soapShared = partyLoadShared("soap", { locations: [] });
  wipeShared = partyLoadShared("wipe", { locations: [] });

  images.dirt = loadImage("dirt.webp");
  images.rainbow = loadImage("rainbow.png");
}

function setup() {
  createCanvas(512, 512);
  noStroke();

  dirtG = createGraphics(512, 512);
  dirtG.noStroke();

  noiseSeed(0);
}

function mouseDragged() {
  // host applies soap
  if (partyIsHost()) {
    soapShared.locations.push({
      x: mouseX + random(-30, 30),
      y: mouseY + random(-30, 30),
      size: random(10, 30),
    });
  }

  // not host wipes (if near soap)
  if (!partyIsHost()) {
    const s = soapShared.locations.find(
      (location) => dist(location.x, location.y, mouseX, mouseY) < 20
    );
    if (s) {
      wipeShared.locations.push({ x: mouseX, y: mouseY });
    }
    // remove s from soapShared.locations
    const index = soapShared.locations.indexOf(s);
    if (index !== -1) {
      soapShared.locations.splice(index, 1);
    }
  }
}

function draw() {
  // erase wiped areas from the graphics buffer
  redrawDirtLayer();
  const cleaned = calculateCleaned();

  // draw the rainbow
  image(images.rainbow, 0, 0, 512, 512);

  // draw the dirt layer
  image(dirtG, 0, 0, 512, 512);

  // draw the soap
  push();
  for (const location of soapShared.locations) {
    noFill();
    stroke(255);
    ellipse(location.x, location.y, location.size, location.size);
  }
  pop();

  // draw the cleaned%
  push();
  fill("white");
  text(`Cleaned: ${floor(cleaned * 100)}%`, 10, 20);
  pop();
}

function redrawDirtLayer() {
  dirtG.push();
  // draw the dirt layer from scratch
  dirtG.clear();
  dirtG.background(30, 30, 0, 200);
  dirtG.image(images.dirt, 0, 0, 512, 512);
  // erase the wiped areas
  dirtG.erase();
  for (const location of wipeShared.locations) {
    drawWipe(location);
  }
  dirtG.noErase();
  dirtG.pop();
}

function calculateCleaned() {
  let cleanPixels = 0;

  // loop over the alpha component, count pixels that are mostly clear.
  dirtG.loadPixels();
  for (let i = 3; i < dirtG.pixels.length; i += 4) {
    if (dirtG.pixels[i] < 50) {
      cleanPixels++;
    }
  }

  // calculate the total pixels, accounting for pixel density
  const totalPixels =
    dirtG.width * pixelDensity() * dirtG.height * pixelDensity();
  return cleanPixels / totalPixels;
}

function drawWipe(location) {
  // draw a few circles with some random placement
  // use noise so that randomness is consistent between frames
  dirtG.ellipse(
    location.x + noise(location.x, location.y, 1) * 50 - 25,
    location.y + noise(location.x, location.y, 2) * 50 - 25,
    50,
    50
  );
  dirtG.ellipse(
    location.x + noise(location.x, location.y, 3) * 20 - 10,
    location.y + noise(location.x, location.y, 4) * 20 - 10,
    40,
    40
  );
  dirtG.ellipse(
    location.x + noise(location.x, location.y, 5) * 100 - 50,
    location.y + noise(location.x, location.y, 6) * 100 - 50,
    20,
    20
  );
}

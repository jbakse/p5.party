/**
 * camera.js
 *
 * This module handles camera shake and the "chromatic abberation"
 * postprocessing effect.
 *
 * This module is loaded and managed by the main.js module.
 * And the gameStatePlay.js module uses the addShake() function.
 *
 */

let postprocessShader;

// shakeAmount keeps track of how shakey the camera is
// this value decreases quickly over time
// 0 = no shake
// 10 = pretty shakey
// 20 = very shakey
// etc. there is no max shake
let shakeAmount = 0;

export function preload() {
  postprocessShader = loadShader("./shader.vert", "./shader.frag");
}

export function update() {
  shakeAmount *= 0.9;
}

export function addShake(amount) {
  shakeAmount += amount;
}

// applyShake
// this function is called before drawing to the screen
// it translates and rotates the coordinate system to create a shake effect
// if you want to shake just part of what you draw (maybe shake the game
// world but not the ui) you can wrap tthis and the draw code in a push/pop
export function applyShake() {
  translate(width * 0.5, height * 0.5);

  translate(
    range_noise(-1, 1, frameCount * 0.8, 1) * shakeAmount,
    range_noise(-1, 1, frameCount * 0.8, 2) * shakeAmount
  );
  rotate(radians(range_noise(-0.2, 0.2, frameCount * 0.8, 3) * shakeAmount));
  translate(-width * 0.5, -height * 0.5);
}

// postprocess
// this function applies the fullscreen shader effect
export function postprocess(canvas) {
  push();
  // enable the shader
  shader(postprocessShader);
  // configure the shader
  postprocessShader.setUniform("tex0", canvas);
  postprocessShader.setUniform("resolution", [canvas.width, canvas.height]);
  postprocessShader.setUniform("time", millis() / 1000);
  postprocessShader.setUniform("shake", shakeAmount);

  // draw a rectangle filling the screen, the shader will be used
  // so instead of white we'll get the shader output
  // but you need some kind of fill for anythign to be drawn at all
  fill("white");
  rect(0, 0, width, height);
  pop();
}

function range_noise(min, max, a = 0, b = 0, c = 0) {
  push();
  noiseDetail(2, 0.5); // this config has a .75 max
  pop();
  return map(noise(a, b, c), 0, 0.75, min, max);
}

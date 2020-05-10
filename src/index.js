console.log("src/index.js");

import { SharedSprite } from "./sharedSprite.js";
import { SharedSpriteManager } from "./sharedSpriteManager.js";
import { initDeepstream } from "./deepstream.js";

window.ss = {
  SharedSprite,
  SharedSpriteManager,
  initDeepstream,
};

import "core-js/stable";
import "regenerator-runtime/runtime";

import { SharedSpriteManager } from "./sharedSpriteManager.js";
import { init } from "./deepstream.js";
import * as util from "./util.js";

window.ss = {
  // SharedSprite,
  SharedSpriteManager,
  init,
  util,
};

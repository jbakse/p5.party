// import "core-js/stable";
// import "regenerator-runtime/runtime";

import { SharedSpriteManager } from "./sharedSpriteManager.js";
import { GetShared } from "./sharedRecord.js";
import { init } from "./deepstream.js";

window.ss = {
  SharedSpriteManager,
  GetShared,

  init,
};

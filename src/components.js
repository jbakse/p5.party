import { roundTo } from "./util.js";

import { ds } from "./deepstream.js";

export const components = {};

/* global images */

components.draggable = class {
  mousePressedInside(e) {
    this.dragging = true;
    this.offsetX = mouseX - this.shared.x;
    this.offsetY = mouseY - this.shared.y;
  }

  mouseDragged(e) {
    if (this.dragging) {
      this.shared.x = roundTo(mouseX - this.offsetX, this.shared.snapTo || 1);
      this.shared.y = roundTo(mouseY - this.offsetY, this.shared.snapTo || 1);
    }
  }

  mouseReleased(e) {
    this.mouseDragged();
    this.dragging = false;
  }
};

components.pixelImage = class {
  draw() {
    push();
    tint(this.shared.color || "white");
    noSmooth();
    image(
      images[this.shared.src],
      this.shared.x,
      this.shared.y,
      this.shared.w,
      this.shared.h
    );
    pop();
  }
};

components.label = class {
  draw() {
    push();
    fill("white");
    textAlign(CENTER);

    text(
      this.sharedSprite.id.substr(-5),
      this.shared.x + this.shared.w * 0.5,
      this.shared.y + this.shared.h + 10
    );
    pop();
  }
};

components.d6 = class {
  // talk() {
  //   console.log("talk", this.sharedSprite);
  // }

  setup() {
    if (!this.shared.value) {
      this.roll();
    }
  }

  draw() {
    push();
    fill("black");
    textSize(16);
    textAlign(CENTER, CENTER);
    textFont("Courier New");
    text(
      this.shared.value,
      this.shared.x + this.shared.w * 0.5,
      this.shared.y + this.shared.h * 0.5
    );
    pop();
  }

  mousePressedInside(e) {
    this.roll();
  }

  roll() {
    const v = Math.floor(Math.random() * 6) + 1;
    this.shared.value = v;
  }
};

components.cursor = class {
  draw() {
    if (ds.clientName === this.shared.creator) {
      return;
    }
    push();
    tint(this.shared.color || "white");
    noSmooth();
    image(
      images[this.shared.src],
      this.shared.x,
      this.shared.y,
      this.shared.w,
      this.shared.h
    );
    pop();
  }

  mouseMoved(e) {
    if (ds.clientName !== this.shared.creator) return;
    this.shared.x = roundTo(mouseX - this.offsetX, this.shared.snapTo || 1);
    this.shared.y = roundTo(mouseY - this.offsetY, this.shared.snapTo || 1);
  }

  mouseDragged(e) {
    this.mouseMoved(e);
  }

  cleanUp() {
    console.log("cleanup");
    if (ds.clientName === this.shared.creator) this.sharedSprite.remove();
  }

  detach() {
    console.log("detach", this);
  }
};

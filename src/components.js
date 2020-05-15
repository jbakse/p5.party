import { roundTo } from "./util.js";

import { ds } from "./deepstream.js";

export const components = {};

/* global images spriteManager*/

components.draggable = class {
  mousePressedInside(e) {
    this.dragging = true;
    this.offsetX = mouseX - this.shared.x;
    this.offsetY = mouseY - this.shared.y;
  }

  mouseDragged(e) {
    if (this.dragging) {
      // this.shared.pos = { x: 0, y: 0 };
      // this.shared.pos.x = 10;
      this.shared.x = roundTo(mouseX - this.offsetX, this.shared.snapTo || 1);
      this.shared.y = roundTo(mouseY - this.offsetY, this.shared.snapTo || 1);
    }
  }

  mouseReleased(e) {
    if (this.dragging) {
      this.mouseDragged();
      this.shared.send();
    }
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

  mouseClickedInside(e) {
    this.roll();
  }

  roll() {
    const v = Math.floor(Math.random() * 6) + 1;
    this.shared.value = v;
  }
};

components.ball = class {
  setup() {
    this.shared.x = this.shared.x || width * 0.5;
    this.shared.y = this.shared.y || height * 0.5;
    this.shared.deltaX = this.shared.deltaX || random(3, 5);
    this.shared.deltaY = this.shared.deltaY || random(3, 5);
  }

  draw() {
    this.update();
  }

  update() {
    if (this.sharedSprite.creator !== ds.clientName) return;

    this.shared.x += this.shared.deltaX;
    this.shared.y += this.shared.deltaY;

    if (this.shared.x < 0) {
      this.shared.deltaX = abs(this.shared.deltaX);
    }
    if (this.shared.y < 0) {
      this.shared.deltaY = abs(this.shared.deltaY);
    }
    if (this.shared.x + this.shared.w > width) {
      this.shared.deltaX = -abs(this.shared.deltaX);
    }
    if (this.shared.y + this.shared.h > height) {
      this.shared.deltaY = -abs(this.shared.deltaY);
    }

    let paddle = spriteManager.getSharedSprite("paddle");

    const paddles = spriteManager.getSprites((s) => {
      return s.componentNames.includes("paddle");
    });

    for (paddle of paddles) {
      if (
        intersects(
          this.shared.x,
          this.shared.y,
          this.shared.w,
          this.shared.h,
          paddle.shared.x,
          paddle.shared.y,
          paddle.shared.w,
          paddle.shared.h
        )
      ) {
        const diffX =
          this.shared.x +
          this.shared.w * 0.5 -
          (paddle.shared.x + paddle.shared.w * 0.5);
        let diffY =
          this.shared.y +
          this.shared.h * 0.5 -
          (paddle.shared.y + paddle.shared.h * 0.5);
        diffY *= paddle.shared.w / paddle.shared.h;

        if (diffX > diffY) {
          this.shared.deltaX = Math.abs(this.shared.deltaX) * Math.sign(diffX);
        } else {
          this.shared.deltaY = Math.abs(this.shared.deltaY) * Math.sign(diffY);
        }
      }
    }
  }
};

function intersects(minx1, miny1, w1, h1, minx2, miny2, w2, h2) {
  const maxx1 = minx1 + w1;
  const maxy1 = miny1 + h1;
  const maxx2 = minx2 + w2;
  const maxy2 = miny2 + h2;

  return minx1 < maxx2 && miny1 < maxy2 && maxx1 > minx2 && maxy1 > miny2;
}

components.paddle = class {
  draw() {
    if (this.sharedSprite.creator !== ds.clientName) return;

    if (keyIsPressed && key === "a") {
      this.shared.y -= 5;
    }
    if (keyIsPressed && key === "z") {
      this.shared.y += 5;
    }
  }
};

components.cursor = class {
  draw() {
    if (ds.clientName === this.sharedSprite.creator) {
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
    if (ds.clientName !== this.sharedSprite.creator) return;

    this.shared.x = roundTo(mouseX, this.shared.snapTo || 1);
    this.shared.y = roundTo(mouseY, this.shared.snapTo || 1);
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

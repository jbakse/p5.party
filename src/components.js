const components = {};

components.draggable = class {
  mousePressedInside(e) {
    const data = this.sharedSprite.getData();
    if (!data) return;

    this.dragging = true;
    this.offsetX = mouseX - data.x;
    this.offsetY = mouseY - data.y;
  }

  mouseDragged(e) {
    const data = this.sharedSprite.getData();
    if (!data) return;

    if (this.dragging) {
      this.sharedSprite._record.set(
        "x",
        roundTo(mouseX - this.offsetX, data.snapTo || 1)
      );
      this.sharedSprite._record.set(
        "y",
        roundTo(mouseY - this.offsetY, data.snapTo || 1)
      );
    }
  }

  mouseReleased(e) {
    const data = this.sharedSprite.getData();
    if (!data) return;

    if (this.dragging) {
      this.sharedSprite._record.set(
        "x",
        roundTo(mouseX - this.offsetX, data.snapTo || 1)
      );
      this.sharedSprite._record.set(
        "y",
        roundTo(mouseY - this.offsetY, data.snapTo || 1)
      );
    }
    this.dragging = false;
  }
};

components.pixelImage = class {
  draw() {
    const data = this.sharedSprite.getData();
    if (!data) return;
    push();
    noSmooth();
    image(images[data.src], data.x, data.y, data.w, data.h);
    pop();
  }
};

components.label = class {
  draw() {
    const data = this.sharedSprite.getData();
    if (!data) return;

    push();
    fill("white");
    textAlign(CENTER);

    text(
      this.sharedSprite._id.substr(-5),
      data.x + data.w * 0.5,
      data.y + data.h + 10
    );
    pop();
  }
};

components.d6 = class {
  setup() {
    const data = this.sharedSprite.getData();
    if (!data) return;

    if (!data.value) {
      const v = Math.floor(Math.random() * 6) + 1;
      this.sharedSprite._record.set("value", v);
    }
  }

  draw() {
    const data = this.sharedSprite.getData();
    if (!data) return;

    push();
    fill("black");
    textSize(16);
    textAlign(CENTER, CENTER);
    textFont("Courier New");
    text(data.value, data.x + data.w * 0.5, data.y + data.h * 0.5);
    pop();
  }

  mousePressedInside(e) {
    const v = Math.floor(Math.random() * 6) + 1;

    this.sharedSprite._record.set("value", v);
  }
};

components.cursor = class {
  draw() {
    const data = this.sharedSprite.getData();
    if (!data) return;

    push();
    noSmooth();
    fill(data.color || "white");
    noStroke();
    ellipse(data.x, data.y, 20, 20);
    pop();
  }

  mouseMoved(e) {
    const data = this.sharedSprite.getData();
    if (!data) return;
    if (ds.clientName !== data.creator) return;
    console.log("set");
    this.sharedSprite._record.set("x", roundTo(mouseX, data.snapTo || 1));
    this.sharedSprite._record.set("y", roundTo(mouseY, data.snapTo || 1));
  }

  cleanUp() {
    console.log("cleanup");
    this.sharedSprite.remove();
  }
};

// figure out how to have cursor only "work" on own screen
// get rid of private member access!

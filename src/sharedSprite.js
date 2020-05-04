// i can't include the class name in the record
// and then instantiate the correct object because
// i instantiate the object _before_ the record is loaded
// i'd either have to figure out another way instantiate and add to list (null placeholder)
// or maybe use an entity component pattern instead
// all shared sprites are shared sprites, but they have a component that gives them behavior

class SharedSprite {
  constructor(id, record) {
    this.id = id;
    this.record = record;
  }

  draw() {
    const data = this.getData();
    if (!data) return;

    noSmooth();
    image(images[data.src], data.x, data.y, data.w, data.h);
    fill("white");
    text(this.id.substr(-5), data.x, data.y);
  }

  getData() {
    if (!this.record.isReady) {
      return false;
    }

    const data = this.record.get();

    if (!data || isEmpty(data)) {
      console.error("!data", this.id);
      return false;
    }
    return data;
  }
}

class DraggedSprite extends SharedSprite {
  mousePressedInside(e) {
    const data = this.getData();
    if (!data) return;

    // if (
    //   mouseX > data.x &&
    //   mouseY > data.y &&
    //   mouseX < data.x + data.w &&
    //   mouseY < data.y + data.h
    // ) {
    //   this.dragging = true;
    //   console.log("drag");
    // }

    this.dragging = true;
  }

  mouseDragged(e) {
    if (this.dragging) {
      const data = this.getData();
      if (!data) return;
      this.record.set("x", mouseX - data.w * 0.5);
      this.record.set("y", mouseY - data.h * 0.5);
    }
  }

  mouseReleased() {
    this.dragging = false;
  }
}

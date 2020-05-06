// i can't include the class name in the record
// and then instantiate the correct object because
// i instantiate the object _before_ the record is loaded
// i'd either have to figure out another way instantiate and add to list (null placeholder)
// or maybe use an entity component pattern instead
// all shared sprites are shared sprites, but they have a component that gives them behavior

class SharedSprite {
  _id;
  _record;
  _behavior = {};

  constructor(id, record) {
    this._id = id;
    this._record = record;
    this._record.whenReady((r) => {
      const type = r.get("type");
      if (!type) return;

      for (let key in behaviors[type]) {
        this[key] = behaviors[type][key];
      }
    });
  }

  draw() {
    const data = this._getData();
    if (!data) return;

    noSmooth();
    image(images[data.src], data.x, data.y, data.w, data.h);
    fill("white");
    text(this._id.substr(-5), data.x, data.y);
  }

  containsPoint(x, y) {
    const data = this._getData();
    if (!data) return;

    return (
      mouseX > data.x &&
      mouseY > data.y &&
      mouseX < data.x + data.w &&
      mouseY < data.y + data.h
    );
  }

  _getData() {
    if (!this._record.isReady) {
      return false;
    }

    const data = this._record.get();

    if (!data || isEmpty(data)) {
      console.error("!data", this._id);
      return false;
    }
    return data;
  }
}

const behaviors = {};

behaviors.DraggedSprite = {
  mousePressedInside(e) {
    const data = this._getData();
    if (!data) return;
    this.dragging = true;
    console.log("dragged");
  },

  mouseDragged(e) {
    if (this.dragging) {
      const data = this._getData();
      if (!data) return;
      this._record.set("x", mouseX - data.w * 0.5);
      this._record.set("y", mouseY - data.h * 0.5);
    }
  },

  mouseReleased() {
    this.dragging = false;
  },
};

behaviors.D6 = {
  draw() {
    const data = this._getData();
    if (!data) return;

    fill("red");
    rect(data.x, data.y, data.w, data.h);
    fill("white");
    text(this._id.substr(-5), data.x, data.y);
    text(data.value, data.x + 20, data.y + 20);
  },
  mousePressedInside(e) {
    const v = Math.floor(Math.random() * 6) + 1;
    console.log("pressed", v);

    this._record.set("value", v);
  },
};

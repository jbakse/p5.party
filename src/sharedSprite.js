// i can't include the class name in the record
// and then instantiate the correct object because
// i instantiate the object _before_ the record is loaded
// i'd either have to figure out another way instantiate and add to list (null placeholder)
// or maybe use an entity component pattern instead
// all shared sprites are shared sprites, but they have a component that gives them behavior

class SharedSprite {
  _id;
  _record;
  _components = [];

  constructor(id, record) {
    this._id = id;
    this._record = record;
    this._record.whenReady((r) => {
      console.log("r", r);

      const components = r.get("components");
      if (Array.isArray(components)) {
        this._components = components;
      }
      this._setup();
      // for (let key in components[type]) {
      //   this[key] = components[type][key];
      // }
    });
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

  // component handlers

  _setup() {
    for (const c of this._components) {
      components[c] && components[c].setup && components[c].setup.bind(this)();
    }
  }

  mouseReleased() {
    for (const c of this._components) {
      components[c] &&
        components[c].mouseReleased &&
        components[c].mouseReleased.bind(this)();
    }
  }
  mouseMoved() {
    for (const c of this._components) {
      components[c] &&
        components[c].mouseMoved &&
        components[c].mouseMoved.bind(this)();
    }
  }
  mouseDragged() {
    for (const c of this._components) {
      components[c] &&
        components[c].mouseDragged &&
        components[c].mouseDragged.bind(this)();
    }
  }
  draw() {
    for (const c of this._components) {
      components[c] && components[c].draw && components[c].draw.bind(this)();
    }
  }
  mousePressed() {
    for (const c of this._components) {
      components[c] &&
        components[c].mousePressed &&
        components[c].mousePressed.bind(this)();
    }
  }
  mousePressedInside() {
    for (const c of this._components) {
      components[c] &&
        components[c].mousePressedInside &&
        components[c].mousePressedInside.bind(this)();
    }
  }
}

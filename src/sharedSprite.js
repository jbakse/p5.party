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
  _componentNames = [];

  constructor(id, record) {
    this._id = id;
    this._record = record;
    this._record.whenReady((r) => {
      const componentNames = r.get("components");
      if (Array.isArray(componentNames)) {
        this._componentNames = componentNames;

        for (const name of componentNames) {
          const c = new components[name]();
          c.sharedSprite = this;
          this._components.push(c);
        }
      }
      // this._setup();
      this.sendMessage("setup");
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

  // similar to Unity's GameObject's SendMessage()
  sendMessage(methodName, value) {
    if (!methodName) return false;
    // console.log(this._components);
    for (const c of this._components) {
      // console.log(c, methodName);
      c[methodName] && c[methodName](value);
    }
  }
}

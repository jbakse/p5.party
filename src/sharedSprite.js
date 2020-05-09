export class SharedSprite {
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
      this.sendMessage("setup");
    });
  }

  containsPoint(x, y) {
    const data = this.getData();
    if (!data) return;

    return (
      mouseX > data.x &&
      mouseY > data.y &&
      mouseX < data.x + data.w &&
      mouseY < data.y + data.h
    );
  }

  getData() {
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

  setData(path, value, cb) {
    this._record.set(path, value, cb);
  }

  // sendMessage
  // similar to Unity's GameObject's SendMessage()
  sendMessage(methodName, value) {
    if (!methodName) return false;
    // console.log(this._components);
    for (const c of this._components) {
      // console.log(c, methodName);
      c[methodName] && c[methodName](value);
    }
  }

  remove() {
    spriteManager.removeSharedSprite(this._id);
  }
}

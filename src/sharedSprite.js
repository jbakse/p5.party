import { components } from "./components.js";
import { isEmptyObject } from "./util.js";

export class SharedSprite {
  id;
  #record;
  #components = [];
  #componentNames = [];
  #manager;

  constructor(manager, id, record) {
    this.#manager = manager;
    this.id = id;
    this.#record = record;
    this.#record.whenReady((r) => {
      const componentNames = r.get("components");
      if (Array.isArray(componentNames)) {
        this.#componentNames = componentNames;

        for (const name of componentNames) {
          const c = new components[name]();
          c.sharedSprite = this;
          this.#components.push(c);
        }
      }
      this.sendMessage("setup");
    });
  }

  containsPoint(x, y) {
    const data = this.getData();
    if (!data) return;

    return (
      x > data.x && y > data.y && x < data.x + data.w && y < data.y + data.h
    );
  }

  getData() {
    if (!this.#record.isReady) {
      return false;
    }

    const data = this.#record.get();

    if (!data || isEmptyObject(data)) {
      console.error("!data", this.id);
      return false;
    }
    return data;
  }

  setData(path, value, cb) {
    if (cb) {
      this.#record.set(path, value, cb);
    } else {
      this.#record.set(path, value);
    }
  }

  // sendMessage
  // similar to Unity's GameObject's SendMessage()
  sendMessage(methodName, value) {
    if (!methodName) return false;

    for (const c of this.#components) {
      c[methodName] && c[methodName](value);
    }
  }

  remove() {
    this.#manager.removeSharedSprite(this.id);
  }
}

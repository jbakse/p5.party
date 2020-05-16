import { components } from "./components.js";
import { SharedRecord } from "./sharedRecord.js";

export class SharedSprite {
  id;
  shared = {};
  creator;
  componentNames = [];
  isReady = false;
  #components = [];
  #manager;
  #record;

  constructor(manager, id) {
    this.#manager = manager;
    this.id = id;

    this.#record = new SharedRecord(id);
    this.#record.whenReady(() => {
      this.shared = this.#record.getShared();

      const componentNames = this.#record.get("components");
      this.creator = this.#record.get("creator");

      if (Array.isArray(componentNames)) {
        this.componentNames = componentNames;

        for (const name of componentNames) {
          const c = new components[name]();
          c.sharedSprite = this;
          c.shared = this.shared;
          this.#components.push(c);
        }
      }
      this.sendMessage("setup");
      this.isReady = true;
    });
  }

  containsPoint(x, y) {
    return (
      x > this.shared.x &&
      y > this.shared.y &&
      x < this.shared.x + this.shared.w &&
      y < this.shared.y + this.shared.h
    );
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

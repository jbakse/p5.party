import { components } from "./components.js";
import { isEmptyObject } from "./util.js";

export class SharedSprite {
  id;
  shared = {};
  #shared = {};
  #record;
  #components = [];
  #componentNames = [];
  #manager;

  constructor(manager, id, record) {
    this.#manager = manager;
    this.id = id;
    this.#record = record;
    this.#record.whenReady((r) => {
      this.#shared = r.get("shared");

      this.shared = new Proxy(this.#shared, {
        // get: function (obj, prop) {
        // console.log("someone got my", prop);
        // return obj[prop];
        // },
        set: (obj, prop, value) => {
          if (obj[prop] !== value) {
            this.setData(prop, value);
          }
          obj[prop] = value;
          return true;
        },
      });

      const componentNames = r.get("components");

      if (Array.isArray(componentNames)) {
        this.#componentNames = componentNames;

        for (const name of componentNames) {
          const c = new components[name]();
          c.sharedSprite = this;
          c.shared = this.shared;
          this.#components.push(c);
        }
      }
      this.sendMessage("setup");
    });
    this.#record.subscribe("shared", (shared) => {
      // replace the CONTENTS of this.shared
      // don't replace shared itself as components have a reference to it

      for (const key in this.#shared) {
        delete this.shared[key];
      }
      for (const key in shared) {
        this.#shared[key] = shared[key];
      }
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

    const data = this.#record.get("shared");

    if (!data || isEmptyObject(data)) {
      console.error("!data", this.id);
      return false;
    }
    return data;
  }

  setData(path, value, cb) {
    if (cb) {
      this.#record.set("shared." + path, value, cb);
    } else {
      this.#record.set("shared." + path, value);
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

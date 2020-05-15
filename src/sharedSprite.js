import { components } from "./components.js";

import { ds } from "./deepstream.js";

/**
 * Record Shape
 * creator: id
 * shared: {}
 */

/**
 * Sprite Record Shape
 * creator: id
 * components: [name, name, ...]
 * shared: {}
 */

export class SharedRecord {
  isReady = false;

  id;
  #record;
  #shared = {};
  #sharedProxy = {};

  #autoRead;
  #autoWrite;

  constructor(id) {
    this.id = id;
    this.#record = ds.record.getRecord(id);
    this.#record.whenReady(this._setupProxy.bind(this));
  }

  _setupProxy() {
    this.#autoRead =
      this.#record.get("autoRead") ||
      this.#record.get("creator") !== ds.clientName;

    this.#autoWrite =
      this.#record.get("autoWrite") ||
      this.#record.get("creator") === ds.clientName;

    this.#shared = this.#record.get("shared");

    this.#sharedProxy = new Proxy(this.#shared, {
      set: (obj, prop, value) => {
        if (obj[prop] !== value) {
          obj[prop] = value;
          if (this.#autoWrite) {
            this.set("shared." + prop, value);
          }
        }
        return true;
      },
    });

    Object.defineProperty(this.#shared, "send", {
      value: this.sendShared.bind(this),
      writable: false,
      enumerable: false,
      configurable: false,
    });

    this.#record.subscribe("shared", (shared) => {
      if (!this.#autoRead) return;

      // replace the CONTENTS of this.#shared
      // don't replace #shared itself as #sharedProxy has a reference to it

      for (const key in this.#shared) {
        delete this.#shared[key];
      }
      for (const key in shared) {
        this.#shared[key] = shared[key];
      }
    });

    this.isReady = true;
  }

  whenReady(cb) {
    this.#record.whenReady(cb);
  }

  getShared() {
    if (!this.isReady) return;
    return this.#sharedProxy;
  }

  get(path) {
    if (!this.isReady) return;
    return this.#record.get(path);
  }
  // set(path, value, cb) {
  //   if (!this.isReady) return;
  //   if (cb) {
  //     this.#record.set("shared." + path, value, cb);
  //   } else {
  //     this.#record.set("shared." + path, value);
  //   }
  // }
  set(...args) {
    if (!this.isReady) return;
    this.#record.set(...args);
  }

  sendShared() {
    // console.log("send shared!!!");
    this.set("shared", this.#shared);
  }
}

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

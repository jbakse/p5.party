import { components } from "./components.js";
import { isEmptyObject } from "./util.js";
import { ds } from "./deepstream.js";

export class SharedData {
  isReady = false;

  #id;
  #record;
  #shared = {};
  #sharedProxy = {};

  constructor(id) {
    this.#id = id;
    this.#record = ds.record.getRecord(id);
    this.#record.whenReady(this._setupProxy.bind(this));
  }

  _setupProxy() {
    this.#shared = this.#record.get("shared");
    this.#sharedProxy = new Proxy(this.#shared, {
      // get: function (obj, prop) {
      //   console.log("someone got my", prop);
      //   return obj[prop];
      // },
      set: (obj, prop, value) => {
        // console.log("set", obj, prop, value);
        if (obj[prop] !== value) {
          obj[prop] = value;
          this.set("shared." + prop, value);
        }
        return true;
      },
    });

    this.#record.subscribe("shared", (shared) => {
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

  send() {}
}

export class SharedSprite {
  id;
  shared = {};
  // #shared = {};
  // #record;
  #components = [];
  #componentNames = [];
  #manager;
  #sharedData;

  constructor(manager, id) {
    this.#manager = manager;
    this.id = id;

    this.#sharedData = new SharedData(id);
    this.#sharedData.whenReady(() => {
      this.shared = this.#sharedData.getShared();
      const componentNames = this.#sharedData.get("components");

      if (Array.isArray(componentNames)) {
        this.#componentNames = componentNames;

        for (const name of componentNames) {
          const c = new components[name]();
          c.sharedSprite = this;
          c.shared = this.#sharedData.getShared();
          this.#components.push(c);
        }
      }
      this.sendMessage("setup");
    });

    // this.#record = ds.record.getRecord(id);
    // this.#record.whenReady((r) => {
    //   this.#shared = r.get("shared");

    //   this.shared = new Proxy(this.#shared, {
    //     // get: function (obj, prop) {
    //     // console.log("someone got my", prop);
    //     // return obj[prop];
    //     // },
    //     set: (obj, prop, value) => {
    //       // console.log("set", obj, prop, value);
    //       if (obj[prop] !== value) {
    //         this.setData(prop, value);
    //       }
    //       obj[prop] = value;
    //       return true;
    //     },
    //   });

    //   const componentNames = r.get("components");

    //   if (Array.isArray(componentNames)) {
    //     this.#componentNames = componentNames;

    //     for (const name of componentNames) {
    //       const c = new components[name]();
    //       c.sharedSprite = this;
    //       c.shared = this.shared;
    //       this.#components.push(c);
    //     }
    //   }
    //   this.sendMessage("setup");
    // });
  }

  containsPoint(x, y) {
    return (
      x > this.shared.x &&
      y > this.shared.y &&
      x < this.shared.x + this.shared.w &&
      y < this.shared.y + this.shared.h
    );
  }

  // getData() {
  //   if (!this.#record.isReady) {
  //     return false;
  //   }

  //   const data = this.#record.get("shared");

  //   if (!data || isEmptyObject(data)) {
  //     console.error("!data", this.id);
  //     return false;
  //   }
  //   return data;
  // }

  // setData(path, value, cb) {
  //   if (cb) {
  //     this.#record.set("shared." + path, value, cb);
  //   } else {
  //     this.#record.set("shared." + path, value);
  //   }
  // }

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

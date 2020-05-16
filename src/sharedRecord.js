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
 * autoRead: true|false
 * autoWrite: true|false
 * shared: {}
 */

export async function GetShared(name, shared) {
  const recordName = `${ds.app}-${ds.room}-ss/${name}`;

  const exists = await ds.record.has(recordName);

  if (!exists) {
    const r = await ds.record.getRecord(recordName);
    const config = {
      creator: ds.clientName,
      autoRead: true,
      autoWrite: true,
      shared,
    };
    r.set(config);
    await r.whenReady();
  }

  const sharedRecord = new SharedRecord(recordName);
  await sharedRecord.whenReady();
  return sharedRecord.getShared();
}

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

    this.#shared = this.#record.get("shared") || {};

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
    return this.#record.whenReady(cb);
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

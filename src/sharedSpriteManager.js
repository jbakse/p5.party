import { ds, dsLog } from "./deepstream.js";
import { SharedSprite } from "./sharedSprite.js";

// eslint-disable-next-line no-unused-vars

export class SharedSpriteManager {
  isReady = false;
  #sprites = [];
  #sprite_list;
  #canvas;

  constructor() {}

  async init(canvas, listname = "sprites") {
    // connect canvas listeners
    this.#canvas = canvas;

    canvas.addEventListener("mousedown", (e) => {
      this.#sprites.forEach((s) => s.sendMessage("mousedown", e));
      this.#sprites.forEach((s) => s.sendMessage("mousePressed", e));
      for (let i = this.#sprites.length - 1; i >= 0; i--) {
        const s = this.#sprites[i];
        if (s.containsPoint(mouseX, mouseY)) {
          s.sendMessage("mousePressedInside", e);
          break;
        }
      }
    });

    canvas.addEventListener("mousemove", (e) => {
      this.#sprites.forEach((s) => s.sendMessage("mousemove", e));
      if (e.buttons > 0) {
        this.#sprites.forEach((s) => s.sendMessage("mouseDragged", e));
      } else {
        this.#sprites.forEach((s) => s.sendMessage("mouseMoved", e));
      }
    });

    canvas.addEventListener("mouseup", (e) => {
      this.#sprites.forEach((s) => s.sendMessage("mouseup", e));
      this.#sprites.forEach((s) => s.sendMessage("mouseReleased", e));
    });

    canvas.addEventListener("click", (e) => {
      this.#sprites.forEach((s) => s.sendMessage("click", e));
      this.#sprites.forEach((s) => s.sendMessage("mouseClicked", e));
    });

    canvas.addEventListener(
      "wheel",
      (e) => {
        this.#sprites.forEach((s) => s.sendMessage("wheel", e));
        this.#sprites.forEach((s) => s.sendMessage("mouseWheel", e));
      },
      { passive: true }
    );

    // unload listenter
    window.addEventListener("unload", this._unload.bind(this));

    // subscribe to sprite_list
    this.#sprite_list = ds.record.getList(`${ds.app}-${ds.room}/${listname}`);

    this.#sprite_list.on("entry-added", (id, index) => {
      dsLog("sprites entry-added", id, index);
      this._attachSprite(id);
    });

    this.#sprite_list.on("entry-removed", (id, index) => {
      dsLog("sprites entry-removed", id, index);
      this._detachSprite(id);
    });

    // populate existing sprites
    await this.#sprite_list.whenReady();
    const ids = this.#sprite_list.getEntries();
    ids.forEach((id) => this._attachSprite(id));
    this.isReady = true;
  }

  async addSharedSprite(components = [], shared, id) {
    const sprite_name = `${ds.app}-${ds.room}-ss/${id || ds.getUid()}`;
    const r = await ds.record.getRecord(sprite_name);

    shared = { x: 0, y: 0, w: 0, h: 0, z: 0, ...shared };
    r.set({ creator: ds.clientName, components, shared });
    await r.whenReady();

    // wait till record is ready before adding to list
    this.#sprite_list.addEntry(sprite_name);
    return sprite_name;
  }

  getSharedSprite(id) {
    const sprite_name = `${ds.app}-${ds.room}-ss/${id}`;
    return this.#sprites.find((e) => e.id === sprite_name);
  }

  removeSharedSprite(id) {
    this.#sprite_list.removeEntry(id);
    ds.record.getRecord(id).delete();
  }

  clear() {
    // remove records from the list first, then delete them
    // so that ids in the list are always valid records
    const ids = this.#sprite_list.getEntries();
    this.#sprite_list.setEntries([]);
    ids.forEach(async (id) => {
      ds.record.getRecord(id).delete();
    });
  }

  broadcastMessage(message, data) {
    this.#sprites.forEach((s) => s.sendMessage(message, data));
  }

  draw() {
    this.#sprites.sort((a, b) => {
      (b.shared.z || 0) - (a.shared.z || 0);
    });

    this.#sprites.forEach((s) => s.sendMessage("draw"));
  }

  _unload() {
    console.log("unload", this);
    this.#sprites.forEach((s) => s.sendMessage("cleanUp"));
  }

  _attachSprite(id) {
    const s = new SharedSprite(this, id);
    this.#sprites.push(s);
  }

  _detachSprite(id) {
    ds.record.getRecord(id).discard();
    this.#sprites.forEach((s) => {
      if (s.id != id) {
        s.sendMessage("detach");
      }
    });
    this.#sprites = this.#sprites.filter((s) => s.id !== id);
  }
}

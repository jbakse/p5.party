export class SharedSpriteManager {
  _sprites = [];
  _sprite_list;

  constructor() {}

  async init() {
    // subscribe to sprite_list
    this._sprite_list = ds.record.getList("sprites");

    this._sprite_list.on("entry-added", (id, index) => {
      dslog("sprites entry-added", id, index);
      this._attachSprite(id);
    });

    this._sprite_list.on("entry-removed", (id, index) => {
      dslog("sprites entry-removed", id, index);
      this._detachSprite(id);
    });

    // populate existing sprites
    await this._sprite_list.whenReady();
    const ids = this._sprite_list.getEntries();
    ids.forEach((id) => this._attachSprite(id));
  }

  async addSharedSprite(x, y, w, h, z, components = [], data, id) {
    const full_id = `sprites/${id || ds.getUid()}`;
    const r = await ds.record.getRecord(full_id);
    r.set({ creator: ds.clientName, x, y, w, h, z, components, ...data });
    await r.whenReady();

    // wait till record is ready before adding to list
    this._sprite_list.addEntry(full_id);
    return r;
  }

  removeSharedSprite(id) {
    this._sprite_list.removeEntry(id);
    ds.record.getRecord(id).delete();
  }

  clear() {
    // remove records from the list first, then delete them
    // so that ids in the list are always valid records
    const ids = this._sprite_list.getEntries();
    this._sprite_list.setEntries([]);
    ids.forEach(async (id) => {
      ds.record.getRecord(id).delete();
    });
  }

  mousePressed(e) {
    this._sprites.forEach((s) => s.sendMessage("mousePressed", e));

    for (let i = this._sprites.length - 1; i >= 0; i--) {
      const s = this._sprites[i];
      if (s.containsPoint(mouseX, mouseY)) {
        s.sendMessage("mousePressedInside", e);
        break;
      }
    }
  }

  mouseReleased(e) {
    this._sprites.forEach((s) => s.sendMessage("mouseReleased", e));
  }

  mouseMoved(e) {
    this._sprites.forEach((s) => s.sendMessage("mouseMoved", e));
  }

  mouseDragged(e) {
    this._sprites.forEach((s) => s.sendMessage("mouseDragged", e));
  }

  draw() {
    this._sprites.sort((a, b) => {
      (b._record.get("z") || 0) - (a._record.get("z") || 0);
    });

    this._sprites.forEach((s) => s.sendMessage("draw"));
  }

  unload() {
    console.log("unload sharedSpriteManager");
    this._sprites.forEach((s) => s.sendMessage("cleanUp"));
  }

  _attachSprite(id) {
    const r = ds.record.getRecord(id);
    const s = new SharedSprite(id, r);
    this._sprites.push(s);

    debug_king = r;
  }

  _detachSprite(id) {
    console.log(id);
    console.log(this._sprites);
    ds.record.getRecord(id).discard();
    this._sprites = this._sprites.filter((s) => s._id !== id);
  }
}

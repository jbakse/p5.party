class SharedSpriteManager {
  constructor() {
    this.sprites = [];
  }
  async init() {
    // subscribe to sprite_list
    this.sprite_list = ds.record.getList("sprites");

    this.sprite_list.on("entry-added", (id, index) => {
      dslog("sprites entry-added", id, index);
      this.attachSprite(id);
    });

    this.sprite_list.on("entry-removed", (id, index) => {
      dslog("sprites entry-removed", id, index);
      this.detachSprite(id);
    });

    // populate sprites
    await this.sprite_list.whenReady();
    const ids = this.sprite_list.getEntries();
    ids.forEach((id) => {
      this.attachSprite(id);
    });
  }

  attachSprite(id) {
    const r = ds.record.getRecord(id);
    const s = new DraggedSprite(id, r);
    this.sprites.push(s);

    king = r;
  }

  detachSprite(id) {
    ds.record.getRecord(id).discard();
    this.sprites = this.sprites.filter((s) => s.id !== id);
  }

  async addSharedSprite(x, y, w, h, src, type = "SharedSprite", id) {
    id = id || `sprites/${ds.getUid()}`;
    const r = await ds.record.getRecord(id);
    r.set({ x, y, w, h, src, type });
    await r.whenReady();

    this.sprite_list.addEntry(id);
    return r;
  }

  clear() {
    // remove records from the list first, then delete them
    // so that ids in the list are always valid records
    const ids = this.sprite_list.getEntries();
    this.sprite_list.setEntries([]);
    ids.forEach(async (id) => {
      ds.record.getRecord(id).delete();
    });
  }

  mousePressed(e) {
    this.sprites.forEach((s) => s.mousePressed && s.mousePressed(e));

    for (let i = this.sprites.length - 1; i >= 0; i--) {
      const s = this.sprites[i];
      const data = s.getData();
      if (
        s.mousePressedInside &&
        mouseX > data.x &&
        mouseY > data.y &&
        mouseX < data.x + data.w &&
        mouseY < data.y + data.h
      ) {
        s.mousePressedInside(e);
        break;
      }
    }
  }

  mouseReleased(e) {
    this.sprites.forEach((s) => s.mouseReleased && s.mouseReleased(e));
  }

  mouseMoved(e) {
    this.sprites.forEach((s) => s.mouseMoved && s.mouseMoved(e));
  }

  mouseDragged(e) {
    this.sprites.forEach((s) => s.mouseDragged && s.mouseDragged(e));
  }

  draw() {
    this.sprites.forEach((s) => s.draw && s.draw());
  }
}

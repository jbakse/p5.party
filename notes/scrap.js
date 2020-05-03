class Participant {
  constructor(name) {
    this.name = name;
  }

  async setup() {
    console.log("participant setup", participant.name);
    this.sprites = await ds.record.getList("sprites");
    console.log("participant connected to sprites");

    this.sprites.subscribe((s) => {
      console.log("sprites changed", s);
    });

    this.sprites.on("entry-added", (a, b) => console.log("!!on add", a, b));
    this.sprites.on("entry-removed", (a, b) =>
      console.log("!!on remove", a, b)
    );
    this.sprites.on("ready", (a, b) => console.log("!!on ready", a, b));

    createCanvas(800, 800);
  }

  draw() {
    const sprites = this.sprites.getEntries();
    // console.log(sprites);
    // sprites.forEach((s) => {
    //   s.draw();
    // });
  }
}

class Host {
  async setup() {
    console.log("host setup");
    this.ds = new DeepstreamClient("localhost:6020");
    await this.ds.login({ username: "host" });

    console.log("host connected");
    this.sprites = await this.ds.record.getList("sprites");
    // TODO get entries and clear them first? cleanup last instance before starting next?
    this.sprites.setEntries([]);

    const s = new DraggedSprite(
      50,
      50,
      60,
      88,
      "images/king.png",
      "sprites/king-1"
    );
    this.sprites.addEntry("sprites/king-1");
  }
}

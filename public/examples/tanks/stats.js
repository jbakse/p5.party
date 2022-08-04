export class StatTracker {
  #id;
  #frames;
  #startTime;

  constructor(my) {
    this.#frames = 0;
    this.#startTime = performance.now();
    this.frameRate = 0;
    this.ping = 0;
    this.#id = random(); // quick and dirty unique id
    my.stats = {};
    this.my = my;
    partySubscribe("ping", this.onPing.bind(this));
    partySubscribe("pong", this.onPong.bind(this));
  }
  // eslint-disable-next-line
  onPing(data) {
    if (partyIsHost()) {
      partyEmit("pong", data);
    }
  }
  onPong(data) {
    if (data.sender === this.#id) {
      this.ping = performance.now() - data.time;
      this.my.stats.ping = this.ping;
    }
  }
  tick() {
    this.#frames++;
    const now = performance.now();
    if (now > this.#startTime + 1000) {
      this.frameRate = this.#frames;
      this.#frames = 0;
      this.#startTime = now;

      this.my.stats.frameRate = this.frameRate;
      partyEmit("ping", {
        sender: this.#id,
        time: performance.now(),
      });
    }
    return this.frameRate;
  }
}

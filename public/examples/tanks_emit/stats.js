/* global uuidv4 */
/* global my */

/* exported StatTracker */
class StatTracker {
  #id;
  #frames;
  #startTime;

  constructor() {
    this.#frames = 0;
    this.#startTime = performance.now();
    this.frameRate = 0;
    this.ping = 0;
    this.#id = uuidv4();
    my.stats = {};
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
      my.stats.ping = this.ping;
    }
  }
  tick() {
    this.#frames++;
    const now = performance.now();
    if (now > this.#startTime + 1000) {
      this.frameRate = this.#frames;
      this.#frames = 0;
      this.#startTime = now;

      my.stats.frameRate = this.frameRate;
      partyEmit("ping", {
        sender: this.#id,
        time: performance.now(),
      });
    }
    return this.frameRate;
  }
}

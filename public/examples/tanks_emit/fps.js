class fpsCounter {
  constructor() {
    this.frames = 0;
    this.startTime = performance.now();
    this.frameRate = 0;
  }
  tick() {
    this.frames++;
    const now = performance.now();
    if (now > this.startTime + 1000) {
      this.frameRate = this.frames;
      this.frames = 0;
      this.startTime = now;
    }
    return this.frameRate;
  }
}

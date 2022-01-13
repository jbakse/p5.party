// tiny emitter based on nanoevents
// with added once()

// https://github.com/ai/nanoevents

export const createEmitter = () => ({
  events: {},
  emit(event, ...args) {
    for (const i of this.events[event] || []) {
      i(...args);
    }
  },
  on(event, cb) {
    (this.events[event] = this.events[event] || []).push(cb);
    return () =>
      (this.events[event] = this.events[event].filter((i) => i !== cb));
  },
  once(event, cb) {
    const unbind = this.on(event, (...args) => {
      unbind();
      cb(...args);
    });
    return unbind;
  },
});

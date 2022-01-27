// tiny emitter based on nanoevents
// with added once()

// https://github.com/ai/nanoevents

export const createEmitter = () => ({
  events: {},
  // send message to subscribers
  emit(event, ...args) {
    for (const i of this.events[event] || []) {
      i(...args);
    }
  },

  // subscribe to future messages
  on(event, cb) {
    (this.events[event] = this.events[event] || []).push(cb);
    return () =>
      (this.events[event] = this.events[event].filter((i) => i !== cb));
  },

  // subscribe for first future message only
  once(event, cb) {
    const unbind = this.on(event, (...args) => {
      unbind();
      cb(...args);
    });
    return unbind;
  },
});

export const debug = makeLogger(
  "log",
  "debug",
  "background-color: #888; color: #fff; padding: 2px 5px; border-radius: 2px"
);

export const log = makeLogger(
  "log",
  "party",
  "background-color: #88F; color: #00ffff; padding: 2px 5px; border-radius: 2px"
);

export const warn = makeLogger(
  "log",
  "party",
  "background-color: #FF0; color: #000; padding: 2px 5px; border-radius: 2px"
);

export const error = makeLogger(
  "error",
  "party",
  "background-color: #ff0000; color: #ffffff; padding: 2px 5px; border-radius: 2px"
);

function makeLogger(type, prefix, style) {
  // eslint-disable-next-line
  return console[type].bind(window.console, `%c${prefix}`, style);
}

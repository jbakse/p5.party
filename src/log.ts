export const debug = makeLogger(
  "log",
  "party-debug",
  "background-color: #888; color: #fff; padding: 2px 5px; border-radius: 2px"
);

export const log = makeLogger(
  "log",
  "party-log",
  "background-color: #88F; color: #00ffff; padding: 2px 5px; border-radius: 2px"
);

export const alert = makeLogger(
  "log",
  "party-alert",
  "background-color: #FF0; color: #000; padding: 2px 5px; border-radius: 2px"
);

export const warn = makeLogger(
  "warn",
  "party-warn",
  "background-color: #FF0; color: #000; padding: 2px 5px; border-radius: 2px"
);

export const error = makeLogger(
  "error",
  "party-error",
  "background-color: #ff0000; color: #ffffff; padding: 2px 5px; border-radius: 2px"
);

type loggerType = "debug" | "log" | "warn" | "error";
function makeLogger(type: loggerType, prefix: string, style: string) {
  // eslint-disable-next-line
  return console[type].bind(window.console, `%c${prefix}`, style);
}

// eslint-disable-next-line
export const styled = console.log.bind(
  window.console,
  "%cparty-log%c %c%s",
  "background-color: #88F; color: #00ffff; padding: 2px 5px; border-radius: 2px",
  "background: none;"
);

// https://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number

/* tslint:disable no-console */
console.log("logging.js");

const _consoleTrace = console.info.bind(
  window.console,
  "%ctrace",
  "background-color: #EEE; color: #666;"
);
const _consoleInfo = console.info.bind(
  window.console,
  "%cinfo",
  "background-color: #DDF; color: #666;"
);

const _consoleReport = console.log.bind(
  window.console,
  "%creport",
  "background-color: #66F; color: white;"
);

const _consoleLog = console.log.bind(
  window.console,
  "%clog",
  "background-color: gray; color: white;"
);

const _consoleWarn = console.warn.bind(
  window.console,
  "%cwarn",
  "background-color: black; color: yellow;"
);

const _consoleError = console.error.bind(
  window.console,
  "%cerror",
  "background-color: black; color: red;"
);

export const makeLogger = (type, prefix, style) => {
  return console[type].bind(window.console, `%c${prefix}`, style);
};

/** @hidden */
let consoleTrace = _consoleTrace;
/** @hidden */
let consoleInfo = _consoleInfo;
/** @hidden */
let consoleReport = _consoleReport;
/** @hidden */
let consoleLog = _consoleLog;
/** @hidden */
let consoleWarn = _consoleWarn;
/** @hidden */
let consoleError = _consoleError;

window.logging = {
  consoleTrace,
  consoleInfo,
  consoleReport,
  consoleLog,
  consoleWarn,
  consoleError,
};

/** @hidden */
export const setLoggingLevel = (level) => {
  const levelNum = ["trace", "info", "report", "log", "warn", "error"].indexOf(
    level
  );
  if (levelNum === -1) {
    return;
  }
  consoleTrace = nothing;
  consoleInfo = nothing;
  consoleReport = nothing;
  consoleLog = nothing;
  consoleWarn = nothing;
  consoleError = nothing;
  if (0 >= levelNum) {
    consoleTrace = _consoleTrace;
  }
  if (1 >= levelNum) {
    consoleInfo = _consoleInfo;
  }
  if (2 >= levelNum) {
    consoleReport = _consoleReport;
  }
  if (3 >= levelNum) {
    consoleLog = _consoleLog;
  }
  if (4 >= levelNum) {
    consoleWarn = _consoleWarn;
  }
  if (5 >= levelNum) {
    consoleError = _consoleError;
  }
};

function nothing() {
  // nothing
}

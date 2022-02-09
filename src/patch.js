// import * as log from "./log";

const log = console;

function getMergeType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  if (typeof value === "boolean") return "primitive";
  if (typeof value === "number" && Number.isFinite(value)) return "primitive";
  if (typeof value === "string") return "primitive";
  return "unsupported";
}

export function patchInPlace(_old, _new, _keyPath = "") {
  if (typeof _old !== "object") {
    log.error("_old is not an object");
    return;
  }
  if (typeof _new !== "object") {
    log.error("_new is not an object");
    return;
  }

  const oldKeys = Object.keys(_old).reverse();
  const newKeys = Object.keys(_new);

  // remove old keys not in new
  for (const key of oldKeys) {
    if (!Object.prototype.hasOwnProperty.call(_new, key)) {
      // log.debug(`remove ${_keyPath}.${key}`);
      if (Array.isArray(_old)) {
        _old.splice(key, 1);
      } else {
        delete _old[key];
      }
    }
  }

  // patch shared object and array keys
  for (const key of newKeys) {
    if (Object.prototype.hasOwnProperty.call(_old, key)) {
      const oldType = getMergeType(_old[key]);
      const newType = getMergeType(_new[key]);

      //   if (oldType === "unsupported") {
      //     log.error(
      //       `${_keyPath}.${key} is unsupported type: ${typeof _new[key]}`
      //     );
      //     continue;
      //   }

      // bail if type is unsupported
      if (newType === "unsupported") {
        log.error(
          `${_keyPath}.${key} is unsupported type: ${typeof _new[key]}`
        );
        continue;
      }

      // merge objects
      if (oldType === "object" && newType === "object") {
        patchInPlace(_old[key], _new[key], `${_keyPath}.${key}`);
        continue;
      }

      // merge arrays
      if (oldType === "array" && newType === "array") {
        patchInPlace(_old[key], _new[key], `${_keyPath}.${key}`);
        continue;
      }

      // replace everything else
      if (_old[key] !== _new[key]) {
        _old[key] = _new[key];
      }
    }
  }

  // add new keys not in old
  for (const key of newKeys) {
    if (!Object.prototype.hasOwnProperty.call(_old, key)) {
      // log.debug(`add ${_keyPath}.${key}`);
      _old[key] = _new[key];
    }
  }
}

// module.exports = { patchInPlace };

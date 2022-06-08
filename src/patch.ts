import { JSONObject, JSONValue } from "./validate";
import * as log from "./log";

/**
 * patches _old to deep equal _new
 * needed so objects can be updated without breaking references to them
 *
 * @param oldObject object to be updated
 * @param newObject object with values to use for update
 * @param path path to the object to be updated
 */

export function patchInPlace(
  oldObject: JSONObject,
  newObject: JSONObject,
  path = ""
): void {
  if (typeof oldObject !== "object") {
    log.error("_old is not an object");
    return;
  }
  if (typeof newObject !== "object") {
    log.error("_new is not an object");
    return;
  }

  const oldKeys = Object.keys(oldObject).reverse();
  const newKeys = Object.keys(newObject);

  // remove oldObject keys that are not in nnewObjectew
  for (const key of oldKeys) {
    if (!Object.prototype.hasOwnProperty.call(newObject, key)) {
      // log.debug(`remove ${_keyPath}.${key}`);
      if (Array.isArray(oldObject)) {
        oldObject.splice(parseInt(key), 1);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete oldObject[key];
      }
    }
  }

  // add newObject keys that are not in oldObject
  for (const key of newKeys) {
    if (!Object.prototype.hasOwnProperty.call(oldObject, key)) {
      // log.debug(`add ${_keyPath}.${key}`);
      oldObject[key] = newObject[key];
    }
  }

  // patch shared object and array keys
  for (const key of newKeys) {
    if (Object.prototype.hasOwnProperty.call(oldObject, key)) {
      const oldType = getMergeType(oldObject[key]);
      const newType = getMergeType(newObject[key]);

      // bail if type is unsupported
      if (newType === "unsupported") {
        log.error(
          `${path}.${key} is unsupported type: ${typeof newObject[key]}`
        );
        continue;
      }

      // merge objects
      if (oldType === "object" && newType === "object") {
        // casts are safe; objects in JSONObjects are always JSON Objects
        patchInPlace(
          oldObject[key] as JSONObject,
          newObject[key] as JSONObject,
          `${path}.${key}`
        );
        continue;
      }

      // merge arrays
      if (oldType === "array" && newType === "array") {
        // casts are safe; arrays in JSONObjects can be treated by
        // this function as JSONObjects
        patchInPlace(
          oldObject[key] as JSONObject,
          newObject[key] as JSONObject,
          `${path}.${key}`
        );
        continue;
      }

      // replace everything else
      if (oldObject[key] !== newObject[key]) {
        oldObject[key] = newObject[key];
      }
    }
  }
}

// module.exports = { patchInPlace };
function getMergeType(value: JSONValue): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  if (typeof value === "boolean") return "primitive";
  if (typeof value === "number" && Number.isFinite(value)) return "primitive";
  if (typeof value === "string") return "primitive";
  return "unsupported";
}

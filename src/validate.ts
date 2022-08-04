/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import dedent from "ts-dedent";

import {
  JSONValue,
  JSONObject,
  RecordData,
} from "@deepstream/client/dist/src/constants";

import { SubscriptionCallback } from "@deepstream/client/dist/src/record/record";

import * as log from "./log";

export { JSONValue, JSONObject, RecordData, SubscriptionCallback };
export type UserData = unknown;

/**
 * checks if `value` is JSONValue (JSON serializable)
 * logs error message if not
 *
 * @param value value to check
 * @param name the name of the value to use in debugging messages
 * @returns if the value is JSONValue
 */

export function isJSONValue(
  value: UserData,
  name = "unknown"
): value is JSONValue {
  const isJSON = validateJSONValue(value, "");
  if (!isJSON) {
    let details = "";
    if (validationError) {
      details = `\n"${name}${validationError.path}" ${validationError.message}`;
    }
    log.warn(`User provided data is not JSON serializable.${details}`);
  }
  return isJSON;
}

/**
 * checks if `value` is JSONObject (JSON serializable + object)
 * logs error message if not
 *
 * @param value value to check
 * @returns if the value is JSONObject
 */

export function isJSONObject(
  value: UserData,
  name?: string
): value is JSONObject {
  if (typeof value !== "object") {
    log.warn(`User provided data is not an object.`);
    return false;
  }
  return isJSONValue(value, name);
}

export function isEmpty(o: any): boolean {
  if (typeof o !== "object") return false;
  return Object.keys(o as object).length === 0;
}

function defined(value: unknown): boolean {
  return typeof value !== "undefined";
}

/**
 * checks the given value to see if it is JSON serializable
 * recursively checks all objects and arrays
 *
 * @param value the value to validate
 * @param path the starting path, this is used for error messages only
 * (and is currently useless)
 * @returns if the value is JSON serializable
 */

interface ValidationError {
  path: string;
  message: string;
}

// validationError is a module global and can be checked if/after validateJSONValue returns false for info on the error.
// note: is there a better pattern for providing error details here?

let validationError: ValidationError | null;

function validateJSONValue(value: UserData, path = ""): boolean {
  validationError = null;

  // JSONPrimitives are okay
  if (["string", "number", "boolean"].includes(typeof value)) return true;

  // nulls are okay
  if (value === null) return true;

  // arrays okay, check children
  if (Array.isArray(value)) {
    for (const [i, v] of Object.entries(value)) {
      if (!validateJSONValue(v, `${path}[${i}]`)) return false;
    }
    return true;
  }

  // plain objects okay, check children
  if (typeof value === "object" && value.constructor === Object) {
    for (const [k, v] of Object.entries(value)) {
      if (!validateJSONValue(v, `${path}.${k}`)) return false;
    }
    return true;
  }

  if (typeof value === "function") {
    validationError = {
      path,
      message: `is a function. Functions are not allowed.`,
    };
    return false;
  }
  if (typeof value === "symbol") {
    validationError = {
      path,
      message: `is a symbol. Symbols are not allowed.`,
    };
    return false;
  }

  if (
    typeof value === "object" &&
    defined((global as any).p5) &&
    value.constructor === (global as any).p5.Color
  ) {
    validationError = {
      path,
      message: dedent`is a p5.Color. p5.Colors are not allowed.

        You can't share p5.Colors with p5.party.

        In many cases you can convert a p5.Color to a string and share that.
        const c = color(255, 0, 0);
        shared.color = c.toString();
    `,
    };

    return false;
  }

  if (
    typeof value === "object" &&
    defined((global as any).p5) &&
    value.constructor === (global as any).p5.Vector
  ) {
    validationError = {
      path,
      message: dedent`is a p5.Vector. p5.Vector are not allowed.

        You can't share p5.Vector with p5.party.

        In some cases you can unpack just the x, y, and z values and share those.
        const v = createVector(1, 2);
        shared.pos = {x: v.x, y: v.y};
    `,
    };

    return false;
  }

  if (typeof value === "object") {
    // no warning for any objects not yet classified because its sometimes okay
    // for example the "stickies" example uses a Rect class with no methods
    // could possibly walk the prototype chain to see if there are any
    // properties that won't be shared and warn

    return true;
  }

  if (typeof value === "undefined") {
    // allow it, key should be removed
    return true;
  }
  validationError = {
    path,
    message: `is an unknown type. p5.party doesn't know what to do with it.`,
  };

  // if we got this far, we don't know what it is
  return false;
}

/**
 *  JSONValue is a Deepstream type that reflects what is JSON serializable
 *
 *  checking a key on a JSONValue will warn because a JSONValue might
 *  not be an object, it could be a primitive.
 *
 *  .log((value as JSONObject).test); // okay
 *  .log(value.test);                 // not okay
 */

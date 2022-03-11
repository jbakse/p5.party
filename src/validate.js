import * as log from "./log";
import dedent from "dedent";
/* globals p5 */

function defined(value) {
  return typeof value !== "undefined";
}
export function validateSerializable(recordName, path, value) {
  const t = typeof value;

  // basic types okay
  if (["undefined", "boolean", "number", "string"].includes(t)) return true;

  // nulls are ok
  if (value === null) return true;

  // arrays okay, check children
  if (Array.isArray(value)) {
    for (const [i, v] of Object.entries(value)) {
      if (!validateSerializable(recordName, `${path}[${i}]`, v)) return false;
    }
    return true;
  }

  // plain objects okay, check children
  if (typeof value === "object" && value.constructor === Object) {
    for (const [k, v] of Object.entries(value)) {
      if (!validateSerializable(recordName, `${path}.${k}`, v)) return false;
    }
    return true;
  }

  if (t === "function") {
    log.error(dedent`It looks like you are trying to share a function. 
        
        You can't share functions with p5.party.

        shared object: ${recordName}
        property: ${path}
        value: ${value}
    `);
    return false;
  }

  if (t === "symbol") {
    log.error(dedent`It looks like you are trying to share a symbol. 
        
        You can't share symbols with p5.party.

        shared object: ${recordName}
        property: ${path}
        value: ${value.toString()}
    `);
    return false;
  }

  if (t === "object" && defined(p5) && value.constructor === p5.Color) {
    log.error(dedent`It looks like you are trying to share a p5.Color. 
            
        You can't share p5.Colors with p5.party.


        In many cases you can convert a p5.Color to a string and share that.
        const c = color(255, 0, 0);
        shared.color = c.toString();

        shared object: ${recordName}
        property: ${path}
        value: ${value}
    `);
    return false;
  }

  if (t === "object" && defined(p5) && value.constructor === p5.Vector) {
    log.error(dedent`It looks like you are trying to share a p5.Vector. 

        You can't share p5.Colors with p5.Vector.

        In many cases you can unpack just the x, y, and z values and share those.
        const v = createVector(1, 2);
        shared.pos = {x: v.x, y: v.y};

        shared object: ${recordName}
        property: ${path}
        value: ${value}
    `);
    return false;
  }

  if (t === "object") {
    // no warning for any objects not yet classified because its sometimes okay
    // for example the "stickies" example uses a Rect class with no methods
    // could possibly walk the prototype chain to see if there are any
    // properties that won't be shared and warn

    return true;
  }

  log.error(dedent`It looks like you are trying to share a value p5.party doesn't understand.

    shared object: ${recordName}
    property: ${path}
    value: ${value}
  `);

  return false;
}

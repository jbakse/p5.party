let shared;

function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "identity_test",
    "main"
  );
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400);

  if (partyIsHost()) {
    // supported types
    shared.null = null;
    shared.boolean = true;
    shared.number = 1;
    shared.string = "hello";
    shared.array = [1, 2, 3];
    shared.object = {
      x: 1,
      y: 1,
    };

    // tricky types
    shared.date = new Date("January 1, 2001 01:00:00");
    shared.color = color("red").toString();
    shared.set = new Set([1, 2, 3]);
    shared.undefined = "temp";
    shared.undefined = undefined;
    shared.deleted = "temp";
    delete shared.deleted;

    // unsupported types
    shared.function = () => {
      console.log("hello");
    };

    shared.symbol = Symbol("hello");

    shared.infinity = Infinity; // -> null
    shared.nan = NaN; // -> null
  }
  console.log("A", shared);

  console.log("");
  console.log("SUPPORTED");
  test("null", shared.null, null);
  test("boolean", shared.boolean, true);
  test("number", shared.number, 1);
  test("string", shared.string, "hello");
  test("array", shared.array, [1, 2, 3]);
  test("object", shared.object, { x: 1, y: 1 });

  console.log("");
  console.log("TRICKY");
  test(
    "date are stringified",
    new Date(shared.date),
    new Date("January 1, 2001 01:00:00")
  );

  console.log(
    "colors need to be wrapped `shared.color color('red').toString()` and `color(shared.color)`"
  );
  console.log(shared.color);
  const c = color(shared.color);
  test("color", red(c), red(color("red")));
  test("color", green(c), green(color("red")));
  test("color", blue(c), blue(color("red")));

  test("undefineds are stripped", shared.undefined, undefined);
  test("undefineds are stripped", "undefined" in shared, false);
  test("deleted properties are stripped", "deleted" in shared, false);

  console.log("");
  console.log("UNSUPPORTED");
  test("functions are stripped", undefined);
  test("symbols are stripped", shared.symbol, undefined);
  test("infinity becomes null", shared.infinity, null);
  test("nan becomes null", shared.nan, null);
}

function test(name, value, expected) {
  if (same(value, expected)) {
    console.log(`%c${name}: passed`, "color: green", value, expected);
  } else {
    console.log(`%c${name}: failed`, "color: red", value, expected);
  }
}

function same(value, expected) {
  if (value === expected) {
    return true;
  }
  if (typeof value === "object" && typeof expected === "object") {
    if (Object.keys(expected).length !== Object.keys(value).length) {
      return false;
    }
    return Object.entries(expected).every(([k, v]) => v === value[k]);
  }
  return false;
}

function draw() {}

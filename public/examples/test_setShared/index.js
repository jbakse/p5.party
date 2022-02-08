let shared;

function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "test_setShared",
    "main"
  );
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400);

  if (partyIsHost()) {
    console.log("before set");
    console.log(JSON.stringify(shared));
    test("shared keys = 3", Object.keys(shared).length, 3);

    partySetShared(shared, {
      numbers: [],
      points: [],
    });
    console.log("after set");
    console.log(JSON.stringify(shared));

    test("shared keys = 2", Object.keys(shared).length, 2);
    test("numbers = []", shared.numbers, []);
    test("numbers.length = 0", shared.numbers.length, 0);
    test("points = []", shared.points, []);
    test("points.length = 0", shared.points.length, 0);

    console.log("push");
    shared.numbers.push(1);
    shared.numbers.push(2);
    shared.points.push({ x: 1, y: 1 });
    shared.points.push({ x: 2, y: 2 });

    console.log(JSON.stringify(shared));
    test("numbers = [1, 2]", shared.numbers, [1, 2]);
    test("numbers.length = 2", shared.numbers.length, 2);
    test("points = ...", shared.points, [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]);
    test("points.length = 2", shared.points.length, 2);

    shared.extra = "extra";
  }
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

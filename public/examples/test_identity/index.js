let shared;

function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "teset_identity",
    "main"
  );
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400);
  noStroke();

  shared.object = { count: 0 };
  noLoop();
}

function draw() {
  console.clear();

  show("shared.object", shared.object);

  console.log("r1 = shared.object");
  const r1 = shared.object;
  console.log("r2 = shared.object");
  const r2 = shared.object;

  show("r1", r1);
  show("r2", r2);
  show("r1 === r2", r1 === r2);

  console.log("r1.count++");
  r1.count++;

  show("r1", r1);
  show("r2", r2);
  show("r1 === r2", r1 === r2);

  console.log("r3 = shared.object");
  const r3 = shared.object;
  show("r2", r3);
  show("r1 === r3", r1 === r3);

  console.log("Add Properties");
  r1.prop1 = "A";
  r2.prop2 = "B";
  r3.prop3 = "C";

  show("r1", r1);
  show("r2", r2);
  show("r3", r3);

  const tests =
    r1.prop1 === r2.prop1 && //
    r1.prop2 === r2.prop2 && //
    r1.prop3 === r2.prop3 && //
    r1.prop1 === r3.prop1 && //
    r1.prop2 === r3.prop2 && //
    r1.prop3 === r3.prop3 && //
    r1 === r2 && //
    r1 === r3;

  console.log("success:", tests);

  background(tests ? "green" : "red");
}

function show(label, value) {
  console.log(`${label}:`, JSON.stringify(value));
}

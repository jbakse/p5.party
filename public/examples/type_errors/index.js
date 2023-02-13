let shared;

function preload() {
  partyConnect("wss://demoserver.p5party.org", "type_errors", "main");
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 100);

  partySetShared(shared, {});

  // okay
  console.log(`shared.null = null`);
  shared.null = null;

  console.log(`shared.boolean = true`);
  shared.boolean = true;

  console.log(`shared.number = 1`);
  shared.number = 1;

  console.log(`shared.string = "hello"`);
  shared.string = "hello";

  console.log(`shared.array = ["a", "b", "c"]`);
  shared.array = ["a", "b", "c"];

  console.log(`shared.object = { a: 0, b: 1, c: 2 }`);
  shared.object = { a: 0, b: 1, c: 2 };

  console.log(`shared.objectWithoutMethods = new ClassWithoutMethods("Anne")`);
  shared.objectWithoutMethods = new ClassWithoutMethods("Anne");

  // allowed but might not work
  console.log(`shared.objectWithMethods = new ClassWithMethods("Anne")`);
  shared.objectWithMethods = new ClassWithMethods("Anne");

  // not okay
  console.log(`shared.function = () => "hello"`);
  shared.function = () => "hello";

  console.log(`shared.color = color(255, 0, 0)`);
  shared.color = color(255, 0, 0);

  console.log(`shared.vector = createVector(0, 0)`);
  shared.vector = createVector(0, 0);

  console.log(`shared.object2 = { c: () => "hi"}`);
  shared.object2 = { c: () => "hi" };

  console.log(`shared.bigInt = BigInt(9007199254740991);`);
  shared.bigInt = BigInt(9007199254740991);

  console.log(`shared`);
  console.log(JSON.stringify(shared, null, 2));

  noLoop();
}

function draw() {
  background("#ffcccc");
  text("Look in the console for the errors.", 20, 20);
}

class ClassWithoutMethods {
  constructor(name) {
    this.name = name;
  }
}

class ClassWithMethods {
  constructor(name) {
    this.name = name;
  }
  talk() {
    console.log(`Hi, I'm ${this.name}`);
  }
}

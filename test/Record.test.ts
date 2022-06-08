/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-empty-function */
import { DeepstreamClient } from "@deepstream/client";

import { Record } from "../src/Record";
import { JSONValue } from "../src/validate";

import { HOST, millis, DELAY, warnSpy, errorSpy } from "./common";

// the validator checks for p5.color and p5.vector
// create some dummy constructors that will trick the validator into
// thinking we are using p5 classes even though we don't have p5 in the
// test suite

const p5 = {} as any;
(global as any).p5 = p5;

p5.Color = function () {};
p5.Vector = function () {};

// Deepstream Client Instances used for most tests
let ds1: DeepstreamClient;
let ds2: DeepstreamClient;

async function deleteTestRecord() {
  const r1 = new Record(ds1, "test");
  await r1.load();
  await r1.delete();
}

beforeAll(async () => {
  ds1 = new DeepstreamClient(HOST);
  ds2 = new DeepstreamClient(HOST);
  await Promise.all([
    ds1.login({ username: ds1.getUid() }),
    ds2.login({ username: ds2.getUid() }),
  ]);
});

afterAll(async () => {
  await Promise.all([ds1.close(), ds2.close()]);
});

describe("Record - Early Use", () => {
  it("Errors if loaded before ds connects", async () => {
    const ds1 = new DeepstreamClient(HOST);
    const r1 = new Record(ds1, "test");
    await r1.load();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockClear();
    ds1.close();
  });

  it("Errors if whenReady checked before load begins", async () => {
    const ds1 = new DeepstreamClient(HOST);
    const r1 = new Record(ds1, "test");
    await r1.whenReady();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockClear();
    ds1.close();
  });
});

describe("Record — Creating", () => {
  beforeAll(deleteTestRecord);
  afterAll(deleteTestRecord);

  it("ignores init object if not object and warns", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load("string");
    await r1.whenReady();

    const shared = r1.shared;
    expect(shared).toStrictEqual({});
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockClear();
  });

  it("uses init object if record is new.", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load({ a: 1 });

    const shared = r1.shared;

    expect(shared.a).toBe(1);
    expect(shared.b).toBeUndefined();
  });

  it("ignores init object if record exists.", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load({ a: 2, b: 2 });

    const shared = r1.shared;
    expect(shared.a).toBe(1);
    expect(shared.b).toBeUndefined();
  });
});

describe("Record — Deleting", () => {
  it("deletes records.", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load();
    expect(await ds1.record.has("test")).toBe(true);
    const r2 = new Record(ds1, "test");
    await r2.load();
    await r2.delete();
    expect(await ds1.record.has("test")).toBe(false);
  });

  it("should ", async () => {
    const r1 = new Record(ds1, "test");
    await r1.delete();
    expect(errorSpy).toHaveBeenCalledTimes(1);
    errorSpy.mockClear();
  });
});

describe("Record — Set + Get", () => {
  beforeAll(deleteTestRecord);
  afterAll(deleteTestRecord);

  it("sets + gets locally", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load();
    await r1._set("test", "test");

    expect(r1._get("test")).toBe("test");
  });
  it("sets + gets strings remotely", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load();
    await r1._set("testString", "test");
    await millis(DELAY);

    const r2 = new Record(ds2, "test");
    await r2.load();

    expect(r2._get("testString")).toBe("test");
  });

  it("sets + gets objects remotely", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load();
    await r1._set("testObject", { test: "test" });
    await millis(DELAY);

    const r2 = new Record(ds2, "test");
    await r2.load();

    expect(r2._get("testObject")).toStrictEqual({ test: "test" });
  });
});

describe("Record — Shared Object", () => {
  beforeAll(deleteTestRecord);
  afterAll(deleteTestRecord);

  it("warns and ignores if shared object written to early", () => {
    const r1 = new Record(ds1, "test");
    const shared1 = r1.shared;
    shared1.test = "test";

    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockClear();
  });

  it("returns record for shared object", () => {
    const r1 = new Record(ds1, "test");
    const shared1 = r1.shared;

    expect(Record.recordForShared(shared1)).toBe(r1);
  });

  it("warns on recordForShared with bad input", () => {
    Record.recordForShared({});
    expect(errorSpy).toHaveBeenCalledTimes(1);
    errorSpy.mockClear();
  });

  it("sets + gets locally", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load();
    const shared1 = r1.shared;
    shared1.test = "test";
    expect(shared1.test).toBe("test");
  });

  it("sets + gets strings remotely", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load();
    const shared1 = r1.shared;

    const r2 = new Record(ds2, "test");
    await r2.load();
    const shared2 = r2.shared;

    shared1.testString = "test";
    await millis(1000);

    expect(shared2.testString).toBe("test");
  });

  it("sets + gets objects remotely", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load();
    const shared1 = r1.shared;

    const r2 = new Record(ds2, "test");
    await r2.load();
    const shared2 = r2.shared;

    shared1.testObject = { test: "test" };
    await millis(DELAY);

    expect(shared2.testObject).toStrictEqual({ test: "test" });
  });

  it("removes properties set to undefined", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load();
    const shared1 = r1.shared;

    const r2 = new Record(ds2, "test");
    await r2.load();
    const shared2 = r2.shared;

    r1.setShared({ a: "a", b: "b" });
    await millis(DELAY);

    expect(shared2).toStrictEqual({ a: "a", b: "b" });

    shared1.a = undefined as unknown as JSONValue;
    await millis(DELAY);

    expect(shared1).toStrictEqual({ b: "b" });
    expect(shared2).toStrictEqual({ b: "b" });
  });

  it("shares supported types", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load();
    const shared1 = r1.shared;

    const r2 = new Record(ds2, "test");
    await r2.load();
    const shared2 = r2.shared;

    shared1.null = null;
    shared1.boolean = true;
    shared1.number = 1;
    shared1.string = "hello";
    shared1.array = [1, 2, 3];
    shared1.object = { x: 1, y: 1 };

    // basic 'data-only' class (these should work)
    class PointData {
      constructor(public x: number, public y: number) {
        this.x = x;
        this.y = y;
      }
    }
    shared1.point = new PointData(1, 1) as any;

    expect(shared1.null).toBeNull();
    expect(shared1.boolean).toBe(true);
    expect(shared1.number).toBe(1);
    expect(shared1.string).toBe("hello");
    expect(shared1.array).toEqual([1, 2, 3]);
    expect(shared1.object).toEqual({ x: 1, y: 1 });
    expect(shared1.point).toEqual({ x: 1, y: 1 });

    await millis(DELAY);
    expect(shared2.null).toBeNull();
    expect(shared2.boolean).toBe(true);
    expect(shared2.number).toBe(1);
    expect(shared2.string).toBe("hello");
    expect(shared2.array).toEqual([1, 2, 3]);
    expect(shared2.object).toEqual({ x: 1, y: 1 });
    expect(shared2.point).toEqual({ x: 1, y: 1 });
  });

  it("warns and doesn't share unsupported types (or null them).", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load();
    const shared1 = r1.shared;

    const r2 = new Record(ds2, "test");
    await r2.load();
    const shared2 = r2.shared;

    r1.setShared({});

    // cast as any to force bad types
    shared1.function = (() => {}) as any; // 1
    shared1.symbol = Symbol("hello") as any; // 2
    shared1.bigint = BigInt(1) as any; // 3
    shared1.object = { a: () => {} } as any; // 4
    shared1.array = [() => "hello"] as any; // 5
    shared1.color = new p5.Color(); // 6
    shared1.vector = new p5.Vector(); // 7
    shared1.infinity = Infinity;
    shared1.nan = NaN;

    expect(warnSpy).toHaveBeenCalledTimes(7);
    warnSpy.mockClear();

    expect(shared1.function).toBeUndefined();
    expect(shared1.symbol).toBeUndefined();
    expect(shared1.bigint).toBeUndefined();
    expect(shared1.object).toBeUndefined();
    expect(shared1.array).toBeUndefined();
    expect(shared1.color).toBeUndefined();
    expect(shared1.vector).toBeUndefined();
    expect(shared1.infinity).toBeNull();
    expect(shared1.nan).toBeNull();

    await millis(DELAY);
    expect(shared2.function).toBeUndefined();
    expect(shared2.symbol).toBeUndefined();
    expect(shared2.bigint).toBeUndefined();
    expect(shared2.object).toBeUndefined();
    expect(shared2.array).toBeUndefined();
    expect(shared2.color).toBeUndefined();
    expect(shared2.vector).toBeUndefined();
    expect(shared2.infinity).toBeNull();
    expect(shared2.nan).toBeNull();
  });

  it("preserves local object references when propeties are changed", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load();
    const shared1 = r1.shared;

    shared1.target = { a: 1 };
    const ref = shared1.target;

    expect(ref).toBe(shared1.target);

    shared1.target.a = 2;
    expect(ref).toBe(shared1.target);

    await millis(DELAY);
    expect(ref).toBe(shared1.target);
  });
});

describe("Record — setShared()", () => {
  beforeAll(deleteTestRecord);
  afterAll(deleteTestRecord);

  it("warns and ignores if called early", () => {
    const r1 = new Record(ds1, "test");
    r1.setShared({ test: "test" });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockClear();
  });

  it("should add and remove properties", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load({ old: "old", emptyIt: [1, 2, 3] });
    const r2 = new Record(ds1, "test");
    await r2.load();

    const newObject = {
      string: "hello",
      number: 1,
      array: [1, 2, 3],
      object: { a: 1 },
      emptyIt: [],
    };
    r1.setShared(newObject);
    await millis(DELAY);

    expect(r1.shared).toStrictEqual(newObject);
  });

  it("warns and ignores if not given JSONObject", async () => {
    const r1 = new Record(ds1, "test");
    await r1.load({});
    r1.setShared({});
    expect(r1.shared).toStrictEqual({});

    r1.setShared("string");
    r1.setShared({ test: BigInt(1) });

    expect(r1.shared).toStrictEqual({});

    expect(warnSpy).toHaveBeenCalledTimes(2);
    warnSpy.mockClear();
  });
});

describe("Record — watchShared()", () => {
  it("should warn if called early", () => {
    const r1 = new Record(ds1, "test");
    r1.watchShared(() => {});
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockClear();
  });

  it("should watch entire object", async () => {
    let calledCount = 0;
    const r1 = new Record(ds1, "test");
    await r1.load();

    r1.setShared({});
    r1.watchShared((data) => {
      calledCount++;
      expect(data).toBeInstanceOf(Object);
    });
    await millis(500);

    r1.shared.test = "test";
    r1.shared.test2 = "test2";
    await millis(500);

    await r1.delete();

    expect(calledCount).toBe(2);
  });

  it("should watch a specific property", async () => {
    let calledCount = 0;
    const r1 = new Record(ds1, "test");
    await r1.load();

    r1.setShared({});
    r1.watchShared("test", (data) => {
      calledCount++;
      expect(data).toBe("test");
    });
    await millis(500);

    r1.shared.test = "test";
    r1.shared.test2 = "test2";
    await millis(500);

    await r1.delete();

    expect(calledCount).toBe(1);
  });
});

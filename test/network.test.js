import { Client } from "../src/Client";
import { Room } from "../src/Room";
import { Record } from "../src/Record";

/* global  test expect describe beforeAll afterAll*/

// set long timeout for using interctive debugger
// jest.setTimeout(1000 * 60 * 5);

let client1;
let client2;

beforeAll(async () => {
  client1 = await connect();
  client2 = await connect();
  await millis(100);
});

afterAll(async () => {
  await millis(100);
  client1.record.delete();

  // todo: room.leave() is causing a deepstreem transition erro
  // client1.room.leave();
  // await millis(100);
  // client2.room.leave();

  await millis(50);
  client1.client.close();
  client2.client.close();
});

describe("basic", () => {
  test("check connection", () => {
    expect(client1.client).toBeInstanceOf(Client);
    expect(client1.room).toBeInstanceOf(Room);
    expect(client1.record).toBeInstanceOf(Record);
    expect(client1.shared).toBeInstanceOf(Object);

    expect(client2.client).toBeInstanceOf(Client);
    expect(client2.room).toBeInstanceOf(Room);
    expect(client2.record).toBeInstanceOf(Record);
    expect(client2.shared).toBeInstanceOf(Object);
  });

  test("supported types", async () => {
    client1.shared.null = null;
    client1.shared.boolean = true;
    client1.shared.number = 1;
    client1.shared.string = "hello";
    client1.shared.array = [1, 2, 3];
    client1.shared.object = { x: 1, y: 1 };

    expect(client1.shared.null).toBeNull();
    expect(client1.shared.boolean).toBe(true);
    expect(client1.shared.number).toBe(1);
    expect(client1.shared.string).toBe("hello");
    expect(client1.shared.array).toEqual([1, 2, 3]);
    expect(client1.shared.object).toEqual({ x: 1, y: 1 });

    await millis(100);
    expect(client2.shared.null).toBeNull();
    expect(client2.shared.boolean).toBe(true);
    expect(client2.shared.number).toBe(1);
    expect(client2.shared.string).toBe("hello");
    expect(client2.shared.array).toEqual([1, 2, 3]);
    expect(client2.shared.object).toEqual({ x: 1, y: 1 });
  });

  test("unsupported types", async () => {
    client1.shared.function = () => {};
    client1.shared.symbol = Symbol("hello");
    client1.shared.infinity = Infinity;
    client1.shared.nan = NaN;

    expect(client1.shared.function).toBeUndefined();
    expect(client1.shared.symbol).toBeUndefined();
    expect(client1.shared.infinity).toBeNull();
    expect(client1.shared.nan).toBeNull();

    await millis(100);
    expect(client2.shared.function).toBeUndefined();
    expect(client2.shared.symbol).toBeUndefined();
    expect(client2.shared.infinity).toBeNull();
    expect(client2.shared.nan).toBeNull();
  });

  test("setShared-add and remove properties", async () => {
    client1.shared.a = 1;
    client1.shared.b = 1;
    client1.record.setShared({
      string: "hello",
      number: 1,
      array: [1, 2, 3],
      object: { a: 1 },
      b: 2,
    });

    await millis(100);
    expect(client1.shared.string).toBe("hello");
    expect(client1.shared.number).toBe(1);
    expect(client1.shared.array).toEqual([1, 2, 3]);
    expect(client1.shared.object).toEqual({ a: 1 });
    expect(client1.shared.b).toBe(2);
    expect(client1.shared.a).toBeUndefined();

    expect(client2.shared.string).toBe("hello");
    expect(client2.shared.number).toBe(1);
    expect(client2.shared.array).toEqual([1, 2, 3]);
    expect(client2.shared.object).toEqual({ a: 1 });
    expect(client2.shared.b).toBe(2);
    expect(client2.shared.a).toBeUndefined();
  });

  test("setShared-empty out array + object", async () => {
    client1.shared.array = [1, 2, 3];
    client1.shared.object = { a: 1 };

    await millis(100);
    expect(client1.shared.array).toEqual([1, 2, 3]);
    expect(client1.shared.object).toEqual({ a: 1 });
    expect(client2.shared.array).toEqual([1, 2, 3]);
    expect(client2.shared.object).toEqual({ a: 1 });

    client1.record.setShared({
      array: [],
      object: {},
    });

    await millis(100);
    expect(client1.shared.array).toEqual([]);
    expect(client2.shared.array).toEqual([]);
    expect(client1.shared.object).toEqual({});
    expect(client2.shared.object).toEqual({});
  });

  test("preserve object references", async () => {
    client1.shared.target = { a: 1 };
    const ref = client1.shared.target;

    expect(ref).toBe(client1.shared.target);
    client1.shared.target.a = 2;
    client1.shared.anotherObject = { a: 1 };

    expect(ref).toBe(client1.shared.target);

    await millis(100);
    expect(ref).toBe(client1.shared.target);
  });

  test("subscribe without path", (done) => {
    function callback(data) {
      if (data.watch !== "seen") return;
      try {
        expect(data.watch).toBe("seen");
        done();
      } catch (error) {
        done(error);
      }
    }
    client2.record.watchShared(callback);
    client1.shared.watch = "seen";
  });

  test("subscribe with path", (done) => {
    function callback(data) {
      if (data !== "seen") return;
      try {
        expect(data).toBe("seen");
        done();
      } catch (error) {
        done(error);
      }
    }
    client2.record.watchShared("watch2", callback);

    client1.shared.watch2 = "seen";
  });

  test("recordForShared", () => {
    expect(Record.recordForShared(client1.shared)).toBe(client1.record);
  });
});

/**
 * Its important to allow some little waiting periods.
 * Obviously, data _receiving_ is asynchronous.
 * Less obvious, data _sending_ is also synchronous.
 * If the client disconnects immediately after sending the data,
 * the data won't be sent!
 */
function millis(ms = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function connect() {
  const host = "wss://deepstream-server-1.herokuapp.com";
  const sketch_name = "network_test";
  const room_name = "main";
  const record_id = "shared";

  const client = new Client(host);
  const room = new Room(client, sketch_name, room_name);
  await room.whenReady();
  room.join();
  room.removeDisconnectedClients();

  const record = room.getRecord(record_id);
  await record.whenReady();
  const shared = record.getShared();

  return { client, room, record, shared };
}

/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { JSONObject } from "@deepstream/client/dist/src/constants";
import onChange from "on-change";

import { Room } from "../src/Room";

import { HOST, millis, warnSpy, errorSpy } from "./common";

describe("Room", () => {
  let r: Room;

  it("connects", async () => {
    r = new Room(HOST, "test", "test");
    await r.whenConnected;
    expect(r._isConnected()).toBe(true);
  });

  it("double connects", async () => {
    await r.whenConnected;
    await r.whenConnected; // tripple even
    expect(r._isConnected()).toBe(true);
  });

  it("disconnects", () => {
    r.disconnect();
    expect(r._isConnected()).toBe(false);
  });

  it("double disconnects", () => {
    r.disconnect();
    expect(r._isConnected()).toBe(false);
  });

  it("waits for whenConnected", async () => {
    const r2 = new Room(HOST, "test", "test");
    void r2.whenConnected;
    await r2.whenConnected; // should wait
    await r2.whenConnected; // should be instant
    expect(r2._isConnected()).toBe(true);
    r2.disconnect();
  });
});

describe("getRecord", () => {
  let r1: Room;

  beforeAll(async () => {
    r1 = new Room(HOST, "test", "test");
    await Promise.all([r1.whenConnected]);
    expect(r1._isConnected()).toBe(true);
  });

  afterAll(() => {
    r1.disconnect();
  });

  it("should return records ", async () => {
    const record = r1.getRecord("test-getrecord");
    await record.load({ a: 1 });
    expect(record._get()).toEqual({ a: 1 });
    await record.delete();
  });
});

describe("Subscribe + Emit", () => {
  let r1: Room;
  let r2: Room;
  let r3: Room;

  beforeAll(async () => {
    r1 = new Room(HOST, "test", "test");
    r2 = new Room(HOST, "test", "test");
    r3 = new Room(HOST, "test", "test2");
    await Promise.all([r1.whenConnected, r2.whenConnected, r3.whenConnected]);
    expect(r1._isConnected()).toBe(true);
    expect(r2._isConnected()).toBe(true);
    expect(r3._isConnected()).toBe(true);
  });

  afterAll(() => {
    r1.disconnect();
    r2.disconnect();
    r3.disconnect();
  });

  it("transmits strings to same client", (done) => {
    r1.subscribe("test", (data) => {
      expect(data).toEqual("test");
      done();
    });
    r1.emit("test", "test");
  });

  it("warns if event data is invalid", () => {
    r1.emit("test", Symbol("hello"));
    r1.emit("test", { symbol: Symbol("hello") });
    expect(warnSpy).toHaveBeenCalledTimes(2);
    warnSpy.mockClear();
  });

  it("transmits strings to different client", (done) => {
    r2.subscribe("test-string", (data) => {
      expect(data).toEqual("test");
      done();
    });
    // delay allows time for subscription to be established
    setTimeout(() => r1.emit("test-string", "test"), 500);
  });

  it("transmits objects to different client", (done) => {
    r2.subscribe("test-object", (data) => {
      expect((data as JSONObject).test).toEqual("test");
      done();
    });
    // delay allows time for subscription to be established
    setTimeout(() => r1.emit("test-object", { test: "test" }), 500);
  });

  it("transmits undefined to different client", (done) => {
    r2.subscribe("test-undefined", (data) => {
      expect(data).toEqual(undefined);
      done();
    });
    // delay allows time for subscription to be established
    setTimeout(() => r1.emit("test-undefined"), 500);
  });

  it("doesn't transmit to other rooms", async () => {
    let count = 0;

    r2.subscribe("test-other-room", (data) => {
      count++;
    });
    r3.subscribe("test-other-room", (data) => {
      count++;
    });
    await millis(500);

    r1.emit("test-other-room", "other");
    await millis(500);

    expect(count).toEqual(1);
  });

  it("unsubscribes", async () => {
    let count = 0;
    function s() {
      count++;
    }

    r2.subscribe("test-unsub", s);
    await millis(500);

    r1.emit("test-unsub");
    await millis(500);

    r2.unsubscribe("test-unsub", s);
    await millis(500);

    r1.emit("test-unsub");
    await millis(500);

    expect(count).toEqual(1);
  });
});

describe("Guests", () => {
  let r1: Room;
  let r2: Room;
  let r3: Room;

  beforeAll(async () => {
    r1 = new Room(HOST, "test", "test");
    r2 = new Room(HOST, "test", "test");
    r3 = new Room(HOST, "test", "test2");
    await Promise.all([r1.whenConnected, r2.whenConnected, r3.whenConnected]);

    expect(r1._isConnected()).toBe(true);
    expect(r2._isConnected()).toBe(true);
    expect(r3._isConnected()).toBe(true);
  });

  afterAll(() => {
    r1.disconnect();
    r2.disconnect();
    r3.disconnect();
  });

  it("counts correctly", () => {
    expect(r1._guestNames.length).toEqual(2);
    expect(r2._guestNames.length).toEqual(2);
    expect(r3._guestNames.length).toEqual(1);
  });

  it("counts correctly after disconnect", async () => {
    r1.disconnect();
    await millis(500);
    expect(r2._guestNames.length).toEqual(1);
    expect(r3._guestNames.length).toEqual(1);
  });
});

describe("Guest Shareds", () => {
  it("local guestShareds contains my (immediate)", async () => {
    const r1 = new Room(HOST, "test", "test");
    void r1.whenConnected;
    const rec1 = r1.myGuestRecord;

    await r1.whenConnected;
    await rec1.whenLoaded;
    await rec1.initData({ a: Math.random() });

    const my = rec1.shared;
    const guests = r1.guestShareds;

    expect(guests.length).toEqual(1);
    expect(guests[0]).toEqual(my);

    r1.disconnect();
  });

  it("remote guestShares contains my (immediate)", async () => {
    const r1 = new Room(HOST, "test", "test");
    void r1.whenConnected;
    const rec1 = r1.myGuestRecord;
    await r1.whenConnected;
    await rec1.whenLoaded;
    await rec1.initData({ a: 1 });

    const my = rec1.shared;

    const r2 = new Room(HOST, "test", "test");
    await r2.whenConnected;
    const guestShareds = r2.guestShareds;

    await millis(500);

    expect(guestShareds.length).toEqual(1);
    expect(guestShareds[0]).toEqual(my);

    r1.disconnect();
    r2.disconnect();
  });

  it("local guestShares contains my (delayed)", async () => {
    const r1 = new Room(HOST, "test", "test");
    await r1.whenConnected;
    const rec1 = r1.myGuestRecord;
    await millis(500);
    await rec1.initData({ a: 1 });

    const my = rec1.shared;
    const guests = r1.guestShareds;
    expect(guests.length).toEqual(1);
    expect(guests[0]).toEqual(my);

    r1.disconnect();
  });

  it("remote guestShares contains my (delayed)", async () => {
    const r1 = new Room(HOST, "test", "test");
    await r1.whenConnected;
    const rec1 = r1.myGuestRecord;
    await millis(500);
    await rec1.initData({ a: 1 });
    const my = rec1.shared;

    const r2 = new Room(HOST, "test", "test");
    await r2.whenConnected;
    const guestShareds = r2.guestShareds;
    await millis(500);

    expect(guestShareds.length).toEqual(1);
    expect(guestShareds[0]).toEqual(my);

    r1.disconnect();
    r2.disconnect();
  });

  it("warns on changes to guestShareds", async () => {
    const r1 = new Room(HOST, "test", "test");
    await r1.whenConnected;
    const guestShareds = r1.guestShareds;

    const l1 = guestShareds.length;
    guestShareds[0] = {};
    const l2 = guestShareds.length;

    expect(l1).toEqual(l2);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    errorSpy.mockClear();

    r1.disconnect();
  });
});

describe("Host", () => {
  let r1: Room;
  let r2: Room;
  let r3: Room;

  beforeAll(async () => {
    r1 = new Room(HOST, "test", "test");
    r2 = new Room(HOST, "test", "test");
    r3 = new Room(HOST, "test", "test2");
    await Promise.all([r1.whenConnected, r2.whenConnected, r3.whenConnected]);
    expect(r1._isConnected()).toBe(true);
    expect(r2._isConnected()).toBe(true);
    expect(r3._isConnected()).toBe(true);
  });

  afterAll(() => {
    r1.disconnect();
    r2.disconnect();
    r3.disconnect();
  });

  it("same room, same host", () => {
    expect(r1.hostName).toBeDefined();
    expect(r2.hostName).toBeDefined();
    expect(r1.hostName).toBe(r2.hostName);
    expect(r1.isHost()).not.toEqual(r2.isHost());
  });

  it("different room, different host", () => {
    expect(r1.hostName).toBeDefined();
    expect(r3.hostName).toBeDefined();
    expect(r1.hostName).not.toBe(r3.hostName);
  });
});

describe("watch watch", () => {
  test("?", () => {
    const myArr: any[] = [];
    const myWatchedArr: any[] = onChange(myArr, (a, b, c) => {
      /**/
    });

    const myObj: Record<string, any> = {};

    myWatchedArr.push(myObj);
    // myArr changed

    myObj.a = 1;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    myWatchedArr[0].a = 2;
  });
});

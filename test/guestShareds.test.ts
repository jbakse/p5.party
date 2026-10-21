/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Room } from "../src/Room";

import { HOST, millis } from "./common";

// Each test uses its own room so tests don't see each other's guests.
function uniqueRoom() {
  return `guests-${Math.random().toString(36).slice(2)}`;
}

function isEmptyObject(o: object) {
  return Object.keys(o).length === 0;
}

describe("guestShareds filtering", () => {
  it("doesn't include a guest that never loads myShared", async () => {
    const room = uniqueRoom();
    const r1 = new Room(HOST, "test", room);
    await r1.whenConnected;
    await r1.myGuestRecord.whenLoaded;
    await r1.myGuestRecord.initData({ x: 1 });

    const r2 = new Room(HOST, "test", room);
    await r2.whenConnected;
    await millis(500);

    expect(r1.guestShareds.length).toEqual(1);
    expect(r1.guestShareds.some(isEmptyObject)).toBe(false);

    r1.disconnect();
    r2.disconnect();
  });

  it("doesn't include a guest whose myShared is initialized empty", async () => {
    const room = uniqueRoom();
    const r1 = new Room(HOST, "test", room);
    await r1.whenConnected;
    await r1.myGuestRecord.whenLoaded;
    await r1.myGuestRecord.initData({ x: 1 });

    const r2 = new Room(HOST, "test", room);
    await r2.whenConnected;
    await r2.myGuestRecord.whenLoaded;
    await r2.myGuestRecord.initData({});
    await millis(500);

    expect(r1.guestShareds.length).toEqual(1);
    expect(r1.guestShareds.some(isEmptyObject)).toBe(false);

    r1.disconnect();
    r2.disconnect();
  });

  it("adds a guest once their myShared has data", async () => {
    const room = uniqueRoom();
    const r1 = new Room(HOST, "test", room);
    await r1.whenConnected;
    await r1.myGuestRecord.whenLoaded;
    await r1.myGuestRecord.initData({ x: 1 });

    const r2 = new Room(HOST, "test", room);
    await r2.whenConnected;
    await r2.myGuestRecord.whenLoaded;
    await r2.myGuestRecord.initData({ x: 2 });
    await millis(500);

    expect(r1.guestShareds.length).toEqual(2);
    expect(r1.guestShareds.map((s) => s.x).sort()).toEqual([1, 2]);

    r1.disconnect();
    r2.disconnect();
  });

  it("removes a guest whose myShared is cleared", async () => {
    const room = uniqueRoom();
    const r1 = new Room(HOST, "test", room);
    await r1.whenConnected;
    await r1.myGuestRecord.whenLoaded;
    await r1.myGuestRecord.initData({ x: 1 });

    const r2 = new Room(HOST, "test", room);
    await r2.whenConnected;
    await r2.myGuestRecord.whenLoaded;
    await r2.myGuestRecord.initData({ x: 2 });
    await millis(500);
    expect(r1.guestShareds.length).toEqual(2);

    r2.myGuestRecord.setData({});
    await millis(500);

    expect(r1.guestShareds.length).toEqual(1);
    expect(r1.guestShareds.some(isEmptyObject)).toBe(false);

    r1.disconnect();
    r2.disconnect();
  });

  it("removes a guest that leaves", async () => {
    const room = uniqueRoom();
    const r1 = new Room(HOST, "test", room);
    await r1.whenConnected;
    await r1.myGuestRecord.whenLoaded;
    await r1.myGuestRecord.initData({ x: 1 });

    const r2 = new Room(HOST, "test", room);
    await r2.whenConnected;
    await r2.myGuestRecord.whenLoaded;
    await r2.myGuestRecord.initData({ x: 2 });
    await millis(500);
    expect(r1.guestShareds.length).toEqual(2);

    r2.disconnect();
    await millis(1000);

    expect(r1.guestShareds.length).toEqual(1);

    r1.disconnect();
  });

  it("never shows an empty guest while several guests join at once", async () => {
    const room = uniqueRoom();
    const r1 = new Room(HOST, "test", room);
    await r1.whenConnected;
    await r1.myGuestRecord.whenLoaded;
    await r1.myGuestRecord.initData({ x: 0 });

    // sample r1's guest list every 20ms while guests join
    const seen: string[] = [];
    let sampling = true;
    const sample = async () => {
      while (sampling) {
        for (const g of r1.guestShareds) {
          if (isEmptyObject(g)) seen.push("empty");
          else if (typeof g.x !== "number") seen.push(JSON.stringify(g));
        }
        await millis(20);
      }
    };
    const sampler = sample();

    const others = [1, 2, 3, 4].map(() => new Room(HOST, "test", room));
    await Promise.all(
      others.map(async (r, i) => {
        await r.whenConnected;
        await r.myGuestRecord.whenLoaded;
        await r.myGuestRecord.initData({ x: i + 1 });
      })
    );
    await millis(1000);
    sampling = false;
    await sampler;

    expect(seen).toEqual([]);
    expect(r1.guestShareds.length).toEqual(5);

    r1.disconnect();
    others.forEach((r) => r.disconnect());
  });
});

describe("p5.js compatibility", () => {
  function loadP5Party(isV2: boolean) {
    jest.resetModules();

    const state: { rooms: any[]; shared: Record<string, unknown> } = {
      rooms: [],
      shared: { value: 1 },
    };

    class MockRoom {
      whenConnected = Promise.resolve();
      myGuestRecord = {
        shared: {},
        whenLoaded: Promise.resolve(),
        initData: jest.fn().mockResolvedValue(undefined),
      };

      constructor() {
        state.rooms.push(this);
      }

      getRecord() {
        return {
          shared: state.shared,
          load: jest.fn().mockResolvedValue(undefined),
        };
      }

      info() {
        return { guestName: "guest" };
      }

      isHost() {
        return true;
      }

      subscribe() {}
      disconnect() {}
      emit() {}
      unsubscribe() {}
    }

    jest.doMock("../src/Room", () => ({ Room: MockRoom }));
    jest.doMock("../src/Record", () => ({
      Record: { recordForShared: jest.fn() },
    }));
    jest.doMock("../src/info", () => ({
      createInfo: jest.fn(),
      destroyInfo: jest.fn(),
    }));

    const p5Constructor: any = function () {};
    p5Constructor.VERSION = isV2 ? "2.0.0" : undefined;
    p5Constructor.prototype.VERSION = isV2 ? undefined : "1.11.3";

    if (!isV2) {
      p5Constructor.prototype.registerPreloadMethod = jest.fn();
    }

    if (isV2) {
      p5Constructor.registerAddon = (addon: Function) => {
        addon(p5Constructor, p5Constructor.prototype);
      };
    }

    (window as any).p5 = p5Constructor;
    jest.isolateModules(() => {
      require("../src/p5.party");
    });

    return { p5Constructor, state };
  }

  afterEach(() => {
    delete (window as any).p5;
    delete (window as any).p5party;
    jest.resetModules();
    jest.dontMock("../src/Room");
    jest.dontMock("../src/Record");
    jest.dontMock("../src/info");
  });

  it("registers as a p5.js 2 add-on and returns promises", async () => {
    const { p5Constructor, state } = loadP5Party(true);
    const instance = Object.create(p5Constructor.prototype);

    await expect(
      instance.partyConnect("ws://host", "app")
    ).resolves.toBeUndefined();
    await expect(instance.partyLoadShared("shared")).resolves.toBe(
      state.shared
    );
    await expect(instance.partyLoadMyShared()).resolves.toBe(
      state.rooms[0].myGuestRecord.shared
    );
  });

  it("retains p5.js 1 preload synchronization and immediate shared objects", async () => {
    const { p5Constructor, state } = loadP5Party(false);
    const instance = Object.create(p5Constructor.prototype);
    instance._incrementPreload = jest.fn();
    instance._decrementPreload = jest.fn();

    let connected!: () => void;
    const connectedPromise = new Promise<void>((resolve) => {
      connected = resolve;
    });
    expect(instance.partyConnect("ws://host", "app", "_main", connected)).toBe(
      undefined
    );
    await connectedPromise;

    let loaded!: () => void;
    const loadedPromise = new Promise<void>((resolve) => {
      loaded = resolve;
    });
    expect(instance.partyLoadShared("shared", undefined, () => loaded())).toBe(
      state.shared
    );
    await loadedPromise;
    await Promise.resolve();

    const myShared = state.rooms[0].myGuestRecord.shared;
    let mySharedLoaded!: () => void;
    const mySharedLoadedPromise = new Promise<void>((resolve) => {
      mySharedLoaded = resolve;
    });
    expect(instance.partyLoadMyShared({}, () => mySharedLoaded())).toBe(
      myShared
    );
    await mySharedLoadedPromise;
    await Promise.resolve();
    await Promise.resolve();

    // p5.js 1 increments the preload count itself (only during preload), so
    // p5.party should only decrement
    expect(instance._incrementPreload).not.toHaveBeenCalled();
    expect(instance._decrementPreload).toHaveBeenCalledTimes(3);
  });

  it("registers preload methods with p5.js 1", () => {
    const { p5Constructor } = loadP5Party(false);
    const registered = (
      p5Constructor.prototype.registerPreloadMethod as jest.Mock
    ).mock.calls.map((call: unknown[]) => call[0]);
    expect(registered).toEqual([
      "partyConnect",
      "partyLoadShared",
      "partyLoadMyShared",
    ]);
  });
});

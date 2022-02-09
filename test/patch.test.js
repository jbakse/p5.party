/* global test expect describe beforeEach jest*/

import { patchInPlace } from "../src/patch";

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("bad params", () => {
  test("{} <- 1", () => {
    const _old = {};
    const _new = 1;
    patchInPlace(_old, _new);
    expect(_old).toStrictEqual({});
  });

  test("1 <- {}", () => {
    const _old = 1;
    const _new = {};
    patchInPlace(_old, _new);
    expect(_old).toStrictEqual(1);
  });
});

describe("unsuported data", () => {
  test("ignore new unsupported data", () => {
    const _old = {
      symbol: "old",
      function: "old",
      infinity: "old",
      nan: "old",
    };

    const _new = {
      symbol: Symbol("hello"),
      function: () => {},
      infinity: Infinity,
      nan: NaN,
    };

    patchInPlace(_old, _new);
    expect(_old.symbol).toStrictEqual("old");
    expect(_old.function).toStrictEqual("old");
    expect(_old.infinity).toStrictEqual("old");
    expect(_old.nan).toStrictEqual("old");
  });

  test("overwrite old unsupported data", () => {
    const _old = {
      symbol: Symbol("hello"),
      function: () => {},
      infinity: Infinity,
      nan: NaN,
    };

    const _new = {
      symbol: "old",
      function: "old",
      infinity: "old",
      nan: "old",
    };

    patchInPlace(_old, _new);

    expect(_old).toStrictEqual(_new);
  });
});

describe("basics", () => {
  test("{} <- {}", () => {
    const _old = {};
    const _new = {};
    patchInPlace(_old, _new);
    expect(_old).toStrictEqual(_new);
    expect(_old).toStrictEqual({});
  });

  test("same values", () => {
    const _old = {
      null: null,
      boolean: true,
      number: 1,
      string: "hello",
      array: [1, 2, 3],
      object: { a: 0, b: 1, c: 2 },
    };

    const _new = {
      null: null,
      boolean: true,
      number: 1,
      string: "hello",
      array: [1, 2, 3],
      object: { a: 0, b: 1, c: 2 },
    };

    patchInPlace(_old, _new);
    expect(_old).toStrictEqual(_new);
  });

  test("new values of same type", () => {
    const _old = {
      null: null,
      boolean: true,
      number: 1,
      string: "hello",
      array: [1, 2, 3],
      object: { a: 0, b: 1, c: 2 },
    };

    const _new = {
      null: {},
      boolean: false,
      number: 2,
      string: "goodbye",
      array: [4, 5, 6],
      object: { d: 0, e: 1, f: 2 },
    };

    patchInPlace(_old, _new);
    expect(_old).toStrictEqual(_new);
  });
});

describe("arrays", () => {
  test("no change", () => {
    const _old = { a: [1, 2, 3, 4] };
    const _new = { a: [1, 2, 3, 4] };
    const _old_a = _old.a;
    patchInPlace(_old, _new);

    expect(_old_a).toBe(_old.a);
    expect(_old).toStrictEqual(_new);
  });

  test("change values", () => {
    const _old = { a: [1, 2, 3, 4] };
    const _new = { a: [5, 6, 7, 8] };
    const _old_a = _old.a;
    patchInPlace(_old, _new);

    expect(_old_a).toBe(_old.a);
    expect(_old).toStrictEqual(_new);
  });

  test("add to", () => {
    const _old = { a: [1, 2, 3, 4] };
    const _new = { a: [1, 2, 3, 4, 5, 6] };
    const _old_a = _old.a;
    patchInPlace(_old, _new);

    expect(_old_a).toBe(_old.a);
    expect(_old).toStrictEqual(_new);
  });

  test("remove from", () => {
    const _old = { a: [1, 2, 3, 4] };
    const _new = { a: [1, 2] };
    const _old_a = _old.a;
    patchInPlace(_old, _new);

    expect(_old_a).toBe(_old.a);
    expect(_old).toStrictEqual(_new);
  });

  test("remove from start", () => {
    const _old = { a: [1, 2, 3, 4] };
    const _new = { a: [3, 4] };
    const _old_a = _old.a;
    patchInPlace(_old, _new);

    expect(_old_a).toBe(_old.a);
    expect(_old).toStrictEqual(_new);
  });

  test("empty out", () => {
    const _old = { a: [1, 2, 3, 4] };
    const _new = { a: [] };
    const _old_a = _old.a;

    patchInPlace(_old, _new);

    expect(_old_a).toBe(_old.a);
    expect(_old).toStrictEqual(_new);
  });

  test("to other types", () => {
    const _old = {
      a: [1, 2, 3],
      b: [1, 2, 3],
      c: [1, 2, 3],
      d: [1, 2, 3],
    };

    const _new = {
      a: null,
      b: 1,
      c: "hello",
      d: { a: 1, b: 2, c: 3 },
    };

    patchInPlace(_old, _new);
    expect(_old).toStrictEqual(_new);
  });

  test("from other types", () => {
    const _old = {
      a: null,
      b: 1,
      c: "hello",
      d: { a: 1, b: 2, c: 3 },
    };
    const _new = {
      a: [1, 2, 3],
      b: [1, 2, 3],
      c: [1, 2, 3],
      d: [1, 2, 3],
    };

    patchInPlace(_old, _new);
    expect(_old).toStrictEqual(_new);
  });
});

describe("objects", () => {
  test("no change", () => {
    const _old = { o: { a: 1, b: 2, c: 3 } };
    const _new = { o: { a: 1, b: 2, c: 3 } };
    const _old_o = _old.o;
    patchInPlace(_old, _new);

    expect(_old_o).toBe(_old.o);
    expect(_old).toStrictEqual(_new);
  });

  test("change values", () => {
    const _old = { o: { a: 1, b: 2, c: 3 } };
    const _new = { o: { a: 4, b: 5, c: 6 } };
    const _old_o = _old.o;
    patchInPlace(_old, _new);

    expect(_old_o).toBe(_old.o);
    expect(_old).toStrictEqual(_new);
  });

  test("add properties", () => {
    const _old = { o: { a: 1, b: 2, c: 3 } };
    const _new = { o: { a: 1, b: 2, c: 3, d: 4, e: 5 } };
    const _old_o = _old.o;
    patchInPlace(_old, _new);

    expect(_old_o).toBe(_old.o);
    expect(_old).toStrictEqual(_new);
  });

  test("remove properties", () => {
    const _old = { o: { a: 1, b: 2, c: 3 } };
    const _new = { o: { a: 1 } };
    const _old_o = _old.o;
    patchInPlace(_old, _new);

    expect(_old_o).toBe(_old.o);
    expect(_old).toStrictEqual(_new);
  });

  test("remove sibling", () => {
    const _old = { a: [], o: { a: 1 } };
    const _new = { o: { a: 1 } };
    const _old_o = _old.o;
    patchInPlace(_old, _new);

    expect(_old_o).toBe(_old.o);
    expect(_old).toStrictEqual(_new);
  });

  test("empty out", () => {
    const _old = { o: { a: 1, b: 2, c: 3 } };
    const _new = { o: {} };
    const _old_o = _old.o;
    patchInPlace(_old, _new);

    expect(_old_o).toBe(_old.o);
    expect(_old).toStrictEqual(_new);
  });

  test("add property", () => {
    const _old = { a: 1 };
    const _new = { a: 1, b: 2 };
    patchInPlace(_old, _new);

    expect(_old).toStrictEqual(_new);
  });

  test("remove property", () => {
    const _old = { a: 1, b: 2 };
    const _new = { a: 1 };
    patchInPlace(_old, _new);

    expect(_old).toStrictEqual(_new);
  });

  test("no common property", () => {
    const _old = { a: 1 };
    const _new = { b: 2 };
    patchInPlace(_old, _new);
    expect(_old).toStrictEqual(_new);
  });

  test("to other types", () => {
    const _old = {
      a: { a: 1, b: 2, c: 3 },
      b: { a: 1, b: 2, c: 3 },
      c: { a: 1, b: 2, c: 3 },
      d: { a: 1, b: 2, c: 3 },
    };

    const _new = {
      a: null,
      b: 1,
      c: "hello",
      d: [0, 1, 2],
    };

    patchInPlace(_old, _new);
    expect(_old).toStrictEqual(_new);
  });

  test("from other types", () => {
    const _old = {
      a: null,
      b: 1,
      c: "hello",
      d: [0, 1, 2],
    };
    const _new = {
      a: { a: 1, b: 2, c: 3 },
      b: { a: 1, b: 2, c: 3 },
      c: { a: 1, b: 2, c: 3 },
      d: { a: 1, b: 2, c: 3 },
    };

    patchInPlace(_old, _new);
    expect(_old).toStrictEqual(_new);
  });
});

describe("refrences", () => {
  test.skip("slice", () => {
    // you might expect that if you remove the first item from the array
    // that a reference to the second item, would now refer to the the item in the first position
    // but the merge doesn't know if the first item was removed
    // or if the last item was removed and the other two items were changed

    const _old = { a: [{ id: 1 }, { id: 2 }, { id: 3 }] };
    const _new = { a: [{ id: 2 }, { id: 3 }] };
    // eslint-disable-next-line
    const _old_a_1 = _old.a[1];
    patchInPlace(_old, _new);
    expect(_old_a_1).toBe(_old.a[0]);
    expect(_old).toStrictEqual(_new);
  });
});

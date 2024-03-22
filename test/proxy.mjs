// this code tests how indexOf works with proxies created by onChange

// in the danger_mountain example, indexOf isn't working correctly on a shared array.
import onChange from "on-change";

const o = { a: [] };
const watched = onChange(o, () => {
  console.log("onChange");
});

watched.a = [{ a: 1 }, { a: 2 }, { a: 3 }];
// onChange
console.log("pre filter");
// pre filter
console.log("a", watched.a);
// a [ { a: 1 }, { a: 2 }, { a: 3 } ]
console.log("a.length", watched.a.length);
// a.length 3
console.log("indexOf[0]", watched.a.indexOf(watched.a[0]));
// indexOf[0] 0

watched.a = watched.a.filter(() => true);
// onChange
console.log("post filter");
// post filter
console.log("a", watched.a);
// a [ { a: 1 }, { a: 2 }, { a: 3 } ]
console.log("a.length", watched.a.length);
// a.length 3
console.log("indexOf[0]", watched.a.indexOf(watched.a[0]));
// indexOf[0] -1

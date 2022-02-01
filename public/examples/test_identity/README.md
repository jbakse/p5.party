# Identity Testing

This example illustrates and tests behavior related to identity testing properties of a shared object and related to the "not-equal" bug.

The bug _should_ be fixed as of 2021.11.19. This example also serves as a regression test.

# The identity bug. AKA The not-equal bug.

When you change a property of an object in the shared object, it is (was) often (always?) replaced with another object with the same values.

this seems like a kind of big deal problem...

```javascript
const s1 = shared.sprites[0];
const s2 = shared.sprites[0];

console.log("match before", s1 === shared.sprites[0], s1 === s2); // true, true
console.log(s1.touch++);
const s3 = shared.sprites[0];
console.log("match after", s1 === s3, s1 === s2); // false, true
```

# Why?

Changing a property on s1 triggers the following:

1. on-change observes the change, tells p5.party
2. p5.party tells local deepstream client
3. deepstreem client updates the data locally (and starts async remote broadcast process)
4. deepstream client tells p5.party (local) data has changed
5. p5.party overwrites the shared object's properties with the new values from deepstreem

At this point, the first item in the array (and maybe every thing in shared!) is a different object than before (with the same values). The values in the objects match, but they are different objects. === returns false.

# Multiple copies of the data to keep in sync

client app -reads/writes-> onchange's proxy -wraps-> p5.party's Record.shared -syncsto-> deepstream client data -syncsto-> deepstream server

# Does changing properties on s1 change s3 also?

No!

```javascript
s1.check = random();
s3.check = random();
console.log(s1.check === s3.check); // false
```

s1 and s2 are references to the same object, both set before any changes to shared data are made.

s3 is created after the data is changed, and so after the objects are replaced with clones.

s1 points to the original value, s3 points to a clone

# Does changing properties on s3 change s1?

- needs to be tested and documented...

# Two proxies with two different underlying objects.

This isn't just two different proxy objects being made of the same data. There are two data objects, and each has a proxy.

# How does any of this work then?

```javascript
const s1 = shared.sprites[0]; // get a reference to shared data
s1.animal = "bat"; // mutate shared data
// change is noted and synced
// shared.sprites[0] is replaced by new clone with the new data. s1 is now an "old" clone
// s1.animal doesn't get updates anymore. future assignments to shared.sprites[0] won't show upon s1 though!
s1.name = "barry"; // mutate shared data
// change is noted and synced: even though s1 is and old clone, it still sends changes just fine (but won't receive them)
```

# Possible solutions?

maybe `_onServerChangedData(data)` can be changed to very carefully update only specific changes? why don't we get more detailed info to act on from deepstream anyway? some kind of "deep assign?"

https://github.com/n1ru4l/graphql-live-query/tree/main/packages/json-patch-plus
https://github.com/Two-Screen/symmetry/
https://github.com/AsyncBanana/microdiff
https://news.ycombinator.com/item?id=29130661

# Original

This was the original code for updating Record.#shared when the bug above was identified. It wipes out everying in #shared and then copies everything from data in. This replaced even unchanged things even unchanged things with duplicates. This worked surprisingly well! We built all the initial demos on this. But leads to the idenity bug.

```javascript
for (const key in this.#shared) {
  delete this.#shared[key];
}
for (const key in data) {
  this.#shared[key] = data[key];
}
```

# Second Try

This was the second version, using the symmetry package to generate and apply a patch. It showed promise, but to get everything working using symmetry, i had to start chaning its internals. Symmetry has a copy-on-write approach and we need a patch-in-place and ultimately it looked like a hand rolled solution would be better.

```javascript
console.log("this: shared", this.#shared);
const p = createPatch(this.#shared, data);
if (p === "none") return;
if (p === "reset")
  log.error(
    "Patch is full reset, reset patches not supported",
    this.#shared,
    data
  );
if (typeof p === "object") applyPatch(this.#shared, p, true);
```

# Third try

As of 2021.11.19, Record isusing hand rolled object merge and it addresses the bug pretty well.

# Future

I'm considering replacing the hand rolled one with lodashs merge, on the theory that they are better programmers than me. :)

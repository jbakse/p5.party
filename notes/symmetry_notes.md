2021.11.19

You can probably delete this note after a while, if no reason to go back to symetry crops up.

I considred using the symmetry npm package to patch Record.#shared with incoming data. After some experimenting, I switched creating a custom function to patch in place. These notes are thoughts on what changes would have been needed to get symmetry to work for this use case.

# patch in place

rather than creating a new object from input and patch, change input by applying patch.

# document patch format

explain the format and vocabulary (t, a, o, r, s, p) in the patch format

# reset patches

comparing unrelated objects returns "reset"
i'd like it to return a patch that effects the reset

```javascript
const input = { a: 1 };
const input = { b: 2 };
createPatch(input, output); // "reset"
```

// adding a common key/value to both objects achieves this

```javascript
const input = { forcePatch: true, a: 1 };
const input = { forcePatch: true, b: 2 };
createPatch(input, output); // {"t":"o","r":["a"],"s":{"b":2}}
```

# no-op patches

comparing two identical objects returns "none"
I'd like it to return a no-op patch

```javascript
const input = { a: 1 };
const output = { a: 1 };
createPatch(input, output); // "none"
```

prefer somethig like `{"t": "o"}` that has no r, s, or p

// started going down the route of adding a forcePatch flag to create Patch
// for this to work it would have to work recursively, so i'd need to
// modify symetry's createPatch (like i did ofr apply patch below)
// before I do that, i should look to see if a "reset" patch would ever actually
// happen in this specific use case
// export function createPatch(left, right, forcePatch = false) {
// if (forcePatch) {
// left.\_forcePatch = true;
// }
// console.log("cp", left, right);
// const p = \_createPatch(left, right);
// return p;
// }

#shared has a [Symbol.for("Record")] key that points back at the owning record. it is being considerd by symmetery, is that a problem?

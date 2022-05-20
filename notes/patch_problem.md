# Problem: Removing Items From Array

If you have:

```javascript
before = [1, 2, 3];
after = [1, 3];
```

You can't be sure what operations were performed.
It could be:

1. remove 2nd item
2. remove 3rd item + change 2nd item

This is an issue if there are references to items in the array:

This is kindof what would happen in "normal" js:

```javascript
{
  const test = [{ a }, { b }, { c }];
  const ref = test[1];
  test.remove({ b });
  // test = [{a}, {c}]
  // ref = {b} (no longer in the array)
}
```

But this is what happens with p5 party:

```javascript
{
  const test = [{ a }, { b }, { c }];
  const ref = test[1];
  test.remove({ b });
  // { b } is mutated to mirror { c } and { c } is removed
  // test = [{ a }, { c }]
  // ref = { c } (test[1])
}
```

One possible (hard) way to do this would (maybe) be to give hidden and sync'd uuid's to each object

As of now, refrences to object properties behave alright, but arrays can act weird.

If its not possible to promise refrences behave as expected in all cases, should we try at all?

Would it be better to go with a simpler overwrite-everything approach, document loudly not to store references, and maybe try to detect if someone does and warn them?

Note: we can't detect creating the refrence, but can detect if someone reads/writes to it, since they are proxies.

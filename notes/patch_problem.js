{
  const before = {
    obj: {
      a: 1,
      b: 2,
      c: 3,
    },
    arr: [{ id: "a" }, { id: "b" }, { id: "c" }],
  };
}


// these next two things start the same
// change the test in different ways
// that look the same in the end
// but the ref ends up pointing to different things
// can patch in place work in a way that preserves refrences?

// sort of this is what a human user would do
{
  const test = [{ a }, { b }, { c }];
  const ref = test[1];
  test.remove({ b });
  // test = [{a}, {c}]
  // ref = {b} (removed)
}

// sort of this is how patch and place would deal with it
{
  const test = [{ a }, { b }, { c }];
  const ref = test[1];
  test.remove({ c });
  test[1] -> mutate to -> { c };
  // test = [{a}, {c}]
  // ref = { c } (test[1])
}

// patch in place doesn't know what happenend:
// when [{ a }, { b }, { c }] -> [{ a }, { c }]
// was b removed?
// was c removed AND b mutated to match c?



// is possible to preserve refrences into arrays
// is possible to preserve refrences into objects
// on possible (hard) way to do this would (maybe) be to give hidden and sync'd uuid's to each object

// does the incoming data sent to patch place for local initiated changes have the proper identies to detect the difference?
// does the incoming data sent to patch place for remote initiated changes have the proper identies to detect the difference?

// if its not possible to promise refrences stick, should we try at all?
// or would it be better to go with a niave overwrite everything approach, document loudly not to store reference, and maybe try to detect if someone does store a refrence and warn them? (can't detect creating the refrence, but can detect if someone reads/writes to it probably, since theyare proxies)


# Invalid State transition in participant code

This is an old note, might not be an issue anymore. Keeping it around a while to see if it shows back up.

Sometimes getting a Invalid state transition

```
Invalid state transition.
Details: {"transition":13,"state":"DELETING"}
History:
	From - to LOADING_OFFLINE via -
	From LOADING_OFFLINE to SUBSCRIBING via 23
	From SUBSCRIBING to READY via 4
	From READY to DELETING via 9
```

Review the code paths for getMyShared and getParticipantShared

Do they create and delete things correctly?
Do they wait FULLY for the records in participants to be ready?
All shared objects SHOULD be loaded and initialized BEFORE setup is called, but i don't think participant array currently is fully ready.

# Shortcut Bug

These are notes from a possibly outdated bug. Should test this to see what happens...

Demo the outdated shorcut problem:

```javascript
const test = {
  animals: {
    bird: {
      legs: 2,
    },
    cat: {
      legs: 4,
    },
  },
};

console.log("test", test);

const watchedTest = onChange(test, (path, newValue, oldValue) =>
  console.log(path, newValue, oldValue)
);

console.log("wt", watchedTest);

const watchedCat = watchedTest.animals.cat;

watchedCat.teeth = "3";

delete test.animals.cat;

console.log("t", test);

watchedCat.teeth = "5";

console.log(JSON.stringify(test));
```

# Unexpected Disconnect

Sometimes a client "unexpectedly leaves" because ds reconnects them (not sure why).
They get removed from the room and then we don't know they are there, but they are still there because they auto reconnect.
possible fixes

- mark them as missing and reconnect them if they reapear.
- can we have a client readd _themselves_ to room on autoreconnect
- don't remove participants on unexpected leave?
- remove them, but after time delay?

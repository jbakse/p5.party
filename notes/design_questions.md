`reviewed 2025.01`

# Open Questions ####################################################-

## partyDisconnect()?

https://github.com/jbakse/p5.party/issues/77

## partyChangeRoom()?

https://github.com/jbakse/p5.party/issues/77

## partyInfo()?

https://github.com/jbakse/p5.party/issues/73

We could provide info like
-list of rooms for app
-list/# of guests for room
-current host of room

## Protect against `Events before Setup()` bugs?

p5.js calls event handlers (like mousePressed) even before setup() has been called. p5.js#5588

p5.party sketches that access a shared object from event handlers should therefore check to see if the shared object is ready. Currently examples are using an `isSetup` flag for this, but its noisy.

It appears that preload() IS called before any event handlers, so the shared object will exist, just not be "ready".

Could p5.party act sensibly if the shared object is written/read before its ready?

Possibly: reads are undefined? reads are based on (new api) init values? writes are ignored? Writes are deferred? log warnings? throw warnings?

## Write-Locked Shared Objects?

It could be very useful, especially to p5.party beginners, to give warnings (or even errors) if a client tries to write to a shared object that "belongs" to another client.

- All writes via `participants[]` could be warned/errored, clients should read from `my`.
- Shared objects could be flagged as "host" owned
- Host owned would check that the current writer has the host flag.
- Maybe a party.getHostShared() that has same function getShared() but assigns host ownership?
- If the API is designed for it, this feature could help "self document" the code. Flagging that a shared object is host owned would make it clear to the library AND to coders what is intended.

  2025.01: Such guardrails could be useful to beginners and advance users both, but it would need to be carefully done to make it clear what is happening for beginners.

## Participant join/leave events

Expose Participant change event API?

- i think there are things this would allow that can't be reasonably done now.

# Low Priority ####################################################-

## Allow rejoining

Support a guest leaving and coming back via a local storage "cookie".

## API to boot participants?

- you can disconnect others from the info panel, add API acces for this?

# WONT DO ####################################################-

## Add partyDeleteShared() @wontdo 2025.01

Currently server data for shared objects, rooms, and games can't be deleted, (but can be replaced). They just acumulate until the server restarts.

## Provide ids @wontdo 2025.01

Should p5.party provide an id for each participant to user code?
Probably not. 1) sketchers can do this fine themselves 2) using ids is often the first thing you think of, but not actually the best way to do something

# Major Changes + Future Versions ###########################-

## Don't use proxies!?

Major change idea: don't use proxies. Could check shared objects after draw() to see if they have changed. Would also need to check after event callbacks (mousePressed, etc). Would also need to poll in case user modifies the shared object in setInterval, etc + the draw loop is paused. Could also maybe provide a function like `partySync()` that user could call if they were updating the shared object "out of band".

I don't see a reason to do this.

## Get Rid of partyIsHost!?

## add setupParty()?

## Add updateParty()?

Radical design question: Should we get rid of partyIsHost? We could replace it with `setupParty` and `stepParty` which would be called before setup and draw but only on the host?

apurv: yes
tanvi: yes

setupParty()

- called once only on the host before setup, intended for initializing shared objects.
- this is partially provided for now by passing in an init object, but this would be better for more complex setup.

updateParty()

- called before each draw (or maybe on its own timer), only by the host

## Share OOP Objects

How can we support sharing OOP objects?

Maybe some sort of user supplied serialize/deserialze functions?

Should each object get its own shared object? That would conceptually follow the idea that the internal state of one object should not impact the internal state of another.

^I think above I'm talking about how modifying two properties on the same shared object is a conflict but modifying two different shared objects at once is fine. The object is the "unit of conflict".

Wild thought: could you specify a class when creating a shared object. You could do somehting like partyLoadShared('tank1', Tank); I have no idea if that would make any sense or how it would work, just brainstorming.

## Support Persistant Worlds (officially)?

Deeptstream stores state locally in process memory, and can be connected to data store. Currently it does not connect to a data store, and data is lost on server/process restart

Theoretically, this library could be used for prototyping persitent worlds right now, and with a data store would be even better for that but as a design decision we have so far limitted the scope to single-session-multiplayer is it worth supporting persistant storage?

## Improve console loging of shared object (proxies)

I'm not thinking of a good way to do this. I don't want to alter console.log.
This is a quick trick for getting a nice log `console.log(JSON.parse(JSON.stringify(shared)));`

Maybe a partyLogShared() function?

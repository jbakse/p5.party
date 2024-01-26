# Design Questions

# Probably Soon

## Protect against bugs from Events before Setup()?

p5.js emits events (like mousePressed) even before setup() has been called. p5.js#5588

p5.party sketches that access a shared object from event handlers should therefore check to see if the shared object is ready. Currently examples are using an `isSetup` flag for this, but its noisy.

It appears that preload() IS called before any event handlers, so the shared object will exist, just not be "ready".

Could p5.party act sensibly if the shared object is written/read before its ready?

Possibly: reads are undefined? reads are based on (new api) init values? writes are ignored? Writes are deferred?

## Reset Empty Rooms on Connect?

We could reset empty rooms based on boolean argument to partyConnect.
Currently p5.party doesn't guarantee that the room is reset OR that it is persistant. It would help to be able to reset every time for clarity.

## Rename functions to party.getShared() etc?

Apurv: keep the prefix. either partySetShared or party.setShared
Tanvi: party.setShared is more clear.
Hyacinth: party.setShared

## API to boot participants?

all: yes, when people leave the sketch open it can be an issue.

note: "reload others" and "disconnect others" is now available in the info panel

- do we want api control for this?

## API to clean room

all: yes
this would be helpful

# Probably Later

## partyInfo Apis

We could provide info like
-list of rooms for app
-list/# of guests for room
-current host of room

## Write Locked Shared Objects?

It could be very useful, especially to p5.party beginners, to give warnings (or even errors) if a client tries to write to a shared object that "belongs" to another client.

- All writes via `participants[]` could be warned/errored, clients should read from `my`.
- Writes to normal shared objects could be assigned as public(default), owned by specific participant (maybe pass in my?), or owned by host.
  - maybe getMyShared() could support named objects like getShared
  - actually, maybe getShared should support unnamed shared like partyMyShared() also.
- Host owned would check that the current writer has the host flag.

How can we make non-complicated way to explicity specify if a shared Object should have a specific owner or host owner? "my" has a clear implied owner already, but what about regular old shared objects?

Maybe a party.getHostShared() that has same function getShared() but assigns host ownership?

Maybe an addional option on getShared();

- write locked/ownered shared objects
  Apurv-Makes sense, but how much complexity does it add?
  Apurv-You'd have to map what the permissions should be.
  Justin-Counter, you should be doing that anyway, and people are getting into trouble because they are not.
  Tanvi-I think it would be good if it is easy/uncomplicated.

## add setupParty()?

Add setupParty(), which would be called once if you are the host before setup, intended for initializing shared objects.
apurv: yes
tanvi: yes
hyacinth: yes

## Add stepParty()

Add stepParty() or stepHost(), which would called repeated before draw if you are the host, inteded for stepping game logic
apurv: not sure
tanvi: not sure
hyacinth: not sure

Potentially confusing

## Add setupGuest()

Add setupGuest() which would called once after setupParty() (if host) and before setup() intended to init `my`

tanvi: maybe, but initing my in setup is clearer since you don't need party is host

## Participant join/leave events

Expose Participant change event API?
all-yes, this would be helpful

## Allow rejoining

Support a guest leaving and coming back via a local storage "cookie".

## Add partyDeleteShared()

Do we need a partyDeleteShared()?
apurv: don't think so, you can make more
justin: low priority, doesn't come up in practice that much, but expected part of a CRUD interface

# Probably Not

## Provide ids

Should p5.party provide an id for each participant to user code? It does have an internal id.

Apurv: i haven't needed it
Tanvi: I don't think i -need- it, but would use it.
Hyacinth: other solutions exist
Justin: I vote no, two reasons 1) sketchers can do this fine themselves 2) using ids is often the first thing you think of, but not actually the best way to do something.

# Probably Moot

## Change example idiom for initing shared objects

Instead of using partyIsHost in setup to determine if client is first to connect, it might make sense to check the participant list length.

```javascript
if (participants.length === 1) {
  // initialize
}
```

This might more clearly reflect the intention "if i'm the only one here"

Is this clearer than partyIsHost?
apurv: yes
tanvi: yes
hyacinth: yes

But this requires loading the participant array even if you don't need it.

Also this question might be made mostly moot in the new api

# Who Knows?

## Don't use proxies!?

Major change idea: don't use proxies. Could check shared objects after draw() to see if they have changed. Would also need to check after event callbacks (mousePressed, etc). Would also need to poll in case user modifies the shared object in setInterval, etc + the draw loop is paused. Could also maybe provide a function like `partySync()` that user could call if they were updating the shared object "out of band".

## Get Rid of partyIsHost!?

Radical design question: Should we get rid of partyIsHost? We could replace it with `setupParty` and `stepParty` which would be called before setup and draw but only on the host?

remove partyIsHost
apurv: yes
tanvi: yes

## Share OOP Objects

How can we support sharing OOP objects?

Maybe some sort of user supplied serialize/deserialze functions?

Should each object get its own shared object? That would conceptually follow the idea that the internal state of one object should not impact the internal state of another.

^I think above I'm talking about how modifying two properties on the same shared object is a conflict but modifying two different shared objects at once is fine. The object is the "unit of conflict".

Wild thought: could you specify a class when creating a shared object. You could do somehting like partyLoadShared('tank1', Tank); I have no idea if that would make any sense or how it would work, just brainstorming.

## Support for Roles

Should p5.party have built in support for "roles" like player 1, player 2, player, observer

-apurv: yes, but mabye better to do yourself
-tanvi: yes
-justin: i think this is more game specific, so probably not something that should be in the library. This IS a very common feature, should document best practices in examples.
-tanvi: an observer wouldn't need a shared object in the participants array. there isn't a way for sketchers to control that currently (note: there is now)
-justin: interesting point.

note: this could also be a foundation for having p5.party support "turns" somehow.

## Announce you are host in the console.log

Appruv: Announce you are host in the console.log, also maybe indicated what host number you are (third host, etc).

## Support Persistant Worlds?

Deeptstream stores state locally in process memory, and can be connected to data store. Currently it does not connect to a data store, and data is lost on server/process restart

Theoretically, this library could be used for prototyping persitent worlds right now, and with a data store would be even better for that but as a design decision we have so far limitted the scope to single-session-multiplayer is it worth supporting persistant storage?

apurv: yes, adds more possibilities
tanvi: not worth the complication
hyacinth: not necessiary IF we are limiting to prototyping tool

## Improve console loging of shared object (proxies)

Have you had problems with console.log()?
apurv: no, workaround logging specific key `shared.x`
tanvi: no
hyacinth: occasionally

Option have a partyLogShared() that logs the shared object better

## remove info panel?

apurv: maybe move it to the console? okay to keep it.
tanvi: keep it, helpful to see what is happening

# Unsorted

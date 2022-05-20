# Connecting

old: `partyConnect(server, app_name, room_name, [callback])`
new: `party.connect(server, app_name, room_name, [clear = true], [callback]clear: option to clear the room if it currently has no connected guests
!!!

# Loading Shared Objects (Preloadable Functions)

old: `partyLoadShared(id, [callback])`
new: `party.loadShared(id, [default = {}], [callback])`
maybe: `party.getShared(...)`
default: properties to assign to shared object if it does not exist

old: `partyLoadMyShared([callback])`
new: `party.loadMyShared([default = {}], [callback])`
maybe: `party.getMyShared(...)`
default: properties to assign to shared object if it does not exist

maybe: only add a shared object to guests array if loadMyShared is called. this would allow observers to see the guests array but not be in it? con, this already sounds confusing.

old: `partyLoadParticipantShareds([callback])`
new: `party.loadGuestShareds([callback])`
maybe: `party.getGuestsShareds(...)`

# Working with Shared Objects

old: `partySetShared(shared, newData)`
new: `party.setShared(shared, newData)`

old: `partyWatchShared(shared, [path], [callback])`
new: `party.watchShared(shared, [path], [callback])`

# p5.party info functions

old: `partyIsHost()`
maybe: `party.isHost()`
maybe: `party.isHost`
maybe: `party.iAmHost`
maybe: remove

old: -
new: `party.guestCount`
number of guests in the currrent room

old: -
maybe: `party.roomInfo(appName, roomName)`
returns `{guestCount: #, sharedObjects: [{id: string, data: object}]}`

# info panel

old: `partyToggleInfo([show])`
new: `party.toggleInfo([show])`
new: info panel hidden by default

# events

old: `partySubscribe(eventName, callback)`
new: `party.subscribe(eventName, callback)`

old: `partyEmit(eventName, data)`
new: `party.emit(eventName, data)`

# User Functions

maybe: `partySetup()`
called once before setup() only if room is empty
shared objects are hidden from other clients until partySetup() returns
intended for initializing shared objects
benefit over providing default object: - can get room info? - is host? no. always host - guest count? no. always 1 (yourself)
leaning NO

maybe: `partyStep()`
called before each call to draw() only if client is host
jb-i'm not sure if this is a good idea, i think this reflects a good practice but its not very p5-like
leaning NO

maybe: `guestJoined(guestShared)`
ideally called when a guest joins after it inits their own shared object

maybe: `guestLeft(guestShared)`
called when a guest leaves, before their shared object is destroyed

# Clean Up

maybe: `party.resetRoom()`
disconnects all guests and removes all shared objects in the room
including caller?

maybe: `party.deleteShared(shared)`
maybe: `party.disconnect()`
maybe: `party.removeGuest(guest's shared)`
maybe: `party.removeGuests()`

# warnings()

- warn/error on write to guests array (clients should write to `my`)
- warn/error on non host write to "host owned" shared objects (how to mark as host owned? maybe all shared objects are host owned by default?)

# preload()

p5 will will wait for all p5.party shared objects loaded in preload() to become ready before calling setup()

# Design Questions

- Should the cannonical variable name for current participant shared object be "me" or "my"?

- can p5.party function names be improved?

  - should p5.party functions start with party? eg. partySetShared
  - should we change participants -> guests? shorter, more on theme

- Currently shared properties are initialized in setup(), but this does potentially lead to a race condition. Would it be better to have an init-object argument on partyLoadShared()?

  - in the examples are the `shared.x = share.x || 0` style inits confusing? should they be changed to another style? link to idiom?

- does setting `shared.x = 3` send a message even if shared.x is already 3?

  - Test this and document answer!

- should p5.party have some kind of write locking support so you can open a shared object in read only mode, or designate the writer for an object and get warnings if someone else writes?

  - it would probably be common to have particpiants be read only, but me/my be writeable
  - maybe a "host" write only mode, that warns/blocks if non host writes

- should p5.party provide an id for each participant? it does have an internal id. This might be especially helpful if we support a participant leaving and coming back via a local storage "cookie".

- should we support a client levaning and coming back as the same participant (e.g. a browser reload)?

- Persistant Worlds?
  deeptstream stores state locally in process memory, and can be connected to data store. currently it does not connect to a data store, and data is lost on server/process restart
  theoretically, this library could be used for prototyping persitent worlds right now, and with a data store would be even better for that
  but as a design decision we have so far limitted the scope to single-session-multiplayer
  is it worth supporting persistant storage?

- Radical design question: Should we get rid of partyIsHost. could replace it with `stepParty` which is called before draw but only on the host?

- Instead of using partyIsHost in setup to determine if client is first to connect, it might make sense to check the participant list length.

  ```
  if (participants.length === 1) {
    // initialize
  }
  ```

  This might more clearly reflect the intention "if i'm the only one here"

- When adding an unsupported type to a shared object, should we strip/null it on the LOCAL side, so that it will look the like the remote side (probably yes) see test_types example

- Can we add warnings to the console if the user is doing something that is probably wrong. "It looks like you are setting values on a participant shared that isn't yours" "It looks like you have set a shared object property to a funciton..." etc

- Do we need a partyDeleteShared()?

# Design Questions

- can p5.party function names be improved?

  - should p5.party functions start with party? eg. partySetShared
  - should we change participants -> guests? shorter, more on theme

- Currently shared properties are initialized in setup(), but this does potentially lead to a race condition. Would it be better to have an init-object argument on partyLoadShared()?

  - Is there a race condition?
    - First clients connect at same time.
    - One is designated host.
    - Host inits shared in setup().
    - Secon client setup()s before init state arrives.

- does setting `shared.x = 3` send a message even if shared.x is already 3?

  - checked. no, it doesn't

- p5.party now warns if if you set property on another clients participan shared.

  - should there be "host" only write mode, that warns/blocks if non host writes to community shared objects?

- should p5.party provide an id for each participant to user code? it does have an internal id. This might be especially helpful if we support a participant leaving and coming back via a local storage "cookie".

- should we support a client levaning and coming back as the same participant (e.g. a browser reload)?

- Persistant Worlds?
  deeptstream stores state locally in process memory, and can be connected to data store. currently it does not connect to a data store, and data is lost on server/process restart
  theoretically, this library could be used for prototyping persitent worlds right now, and with a data store would be even better for that
  but as a design decision we have so far limitted the scope to single-session-multiplayer
  is it worth supporting persistant storage?

- Radical design question: Should we get rid of partyIsHost. could replace it with `setupParty` and `stepParty` which is called before setup and draw but only on the host?

- Instead of using partyIsHost in setup to determine if client is first to connect, it might make sense to check the participant list length.

  ```
  if (participants.length === 1) {
    // initialize
  }
  ```

  This might more clearly reflect the intention "if i'm the only one here"

- When adding an unsupported type to a shared object, should we strip/null it on the LOCAL side, so that it will look the like the remote side (probably yes) see test_types example

  - this is done now.

- Can we add warnings to the console if the user is doing something that is probably wrong. "It looks like you are setting values on a participant shared that isn't yours" "It looks like you have set a shared object property to a funciton..." etc

  - this now happens in some cases.

- Do we need a partyDeleteShared()?

- Major change idea: don't use proxies. Could check shared objects after draw() to see if they have changed. Would also need to check after event callbacks (mousePressed, etc). Would also need to poll in case user modifies the shared object in setInterval or something. could maybe provide a function like `partySync()` that user could call if they were updating "out of band"

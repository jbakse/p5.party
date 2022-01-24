# Design Questions

- Should the cannonical variable name for current participant shared object be "me" or "my"?

- can p5.party function names be improved?

  - should p5.party functions start with party? eg. partySetShared

- Currently shared properties are initialized in setup(), but this does potentially lead to a race condition. Would it be better to have an init-object argument on partyLoadShared()?

  - in the examples are the `shared.x = share.x || 0` style inits confusing? should they be changed to another style? link to idiom?

- does setting `shared.x = 3` send a message even if shared.x is already 3?
  - Test this and document answer!

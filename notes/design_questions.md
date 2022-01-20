- Should the cannonical variable name for current participant shared object be "me" or "my"?
- should p5.party functions start with party? eg. partySetShared
- can p5.party function names be improved?
- Currently shared properties are initialized in setup(), but this does potentially lead to a race condition. Would it be better to have an init-object argument on partyLoadShared()?

- does setting `shared.x = 3` send a message even if shared.x is already 3? Document answer!

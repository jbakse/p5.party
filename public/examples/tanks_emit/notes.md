when two players try to alter the same share object at the same time, one or the other share object "wins"

even if the changes are to different properties of the shared object, one change is lost

this commonly happens when the host is trying to animate some data in a shared object (like moving a bullet) and another player tires to change _anything_ in the same shared object

i just tried working around this by having players add bullets in their own shared object and the host moves them over into the main shared.

this way the players don't write to shared at all

it partly worked but...

now the player writes new bullets to its own participant share + the host removes bullets from that share so they are both writing to the same share. If the player is writing to it a lot (like the player is turning when the shot is fired) we end up with the same kind of problem.

possible solution:
create a second global shared
all particpants write new bullets there
host consumes them
now we have multiple players + hosts writing to the same record, but not rapidly.

This is starting to look a lot like a message sending or event scheme. And deepstream does have Event stuff built in, and maybe that should be exposed by p5.party?

https://deepstream.io/tutorials/core/pubsub/

con - more complixty to the API
pro - maybe less complexity/workarounds in sketch code

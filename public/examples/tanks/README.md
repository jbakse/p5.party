# tanks

- **asdw** move tank
- **space** to fire

> Open this example in two browser windows at once!

# A Common Problem

When two players try to write to the same shared object at the same time a conflict occurs. Some data is lost and its possible for things to get into a bad state. A conflict occurs even if the changes are limited to different properties of the shared object.

One common time a conflict like this happens is when the host is trying to animate some data in a shared object (like moving a bullet every frame) and another player tires to change _anything_ in the same shared object.

# More Generally

This kind of problem comes up when 1) multiple clients write to the same record and 2) the writing is frequent (typically every frame).

If only one client is writing to the shared there is no potential for conficts.

If writing is infrequent (typically event based rather than every frame), the potential for a conflict is there, but its less likely to happen and much less likely to happen repeatedly leading to a bad state.

# A Partial Solution

On way to partially work around this by having players create new bullets in their own shared object. The host then moves them over into the main shared.

This way the players don't write to shared at all, only the host does.

This partially works but...

The player writes new bullets to its own participant share + the host removes bullets from that share so they are both writing to the same share. If nothing else is going on, this is fine. The host writes to the participant shared _in response_ to the participant writing to it, so they won't write at the same time.

But, if the participant is writing something else to the shared object, and writing it frequently (like the player is turning while shooting, so lots of updates to the tank angle) we end up with the same kind of problem.

# A Little Better

This example goes a step further and uses second shared object to communicate new bullets to the host. All particpants write new bullets there, the host will remove them and add them to the main shared. Now we have multiple players and the host writing to the same record, but not rapidly. So we can still get a conflict, but its much less likely.

This is starting to look a lot like a message sending or event scheme. A real messaging system could prevent conflicts in this case.

See tanks_emit for an example that uses messages to solve this problem.

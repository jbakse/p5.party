# Timer

Many multiplayer games need a shared timer. For example many games are played in rounds with a fixed time: e.g. 10 seconds or 5 minutes. These rounds should start and stop at (very nearly) the same time for every player. If every client kept track of time themselves, it would be quite likely be confusing. Instead there should be a single, authoritative clock shared by everyone.

In p5.party, the best way to manage a shared timer is to have the “host” take care of it. The host should start the round, keep track of time, and end the round.

One might consider having the host use `setTimeout()` for timekeeping, but `setTimeout()` is local to individual clients, and it is possible that the “host” might change to a different client between when the round starts and when it ends.

A better approach is to have the host record the time when the round starts and then periodically compare the current time to the start time to see how much time has elapsed. The host can announce the start and end of each round by setting a state property in a shared object or by using events (`partyEmit()`).

If you want the clients to display the elapsed or remaining time, it is probably best to have the host calculate the value and share it.

If the start time is kept in a shared object property, this approach will work even if the host changes during the round. This won’t work perfectly because the old host and the new host probably won’t have perfectly synchronized clocks. But in practice, this isn’t usually a significant problem when prototyping.

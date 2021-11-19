# Merging is Hard

When one client updates a value in a shared record, the new version of the record is sent to the server and then broadcast to all the other clients. Later, another client might update the record again and this version will get broadcast out. This works fine when the updates are spaced out enough that a client always has the latest version before trying to make an update.

But what happens if two clients try to update a record at nearly the same time? Lets imagine the simple case of two clients: A and B.

1. Both A and B are up to date with v10 of the shared record.
2. A makes a change, creating v11 and sends it to the server.
3. The server broadcasts A's v11.
4. Before B recieves A's v11, it makes a change creating a different version 11 and sends it to the server.
5. The server gets B's v11, but expected a v12.

What should the server do with B's v11?

- It could throw it out, losing B's change.
- It could renumber it v12, and broadcast it out rolling back A's change.
- It could try to merge B's v11 into A's v11, call the merge v12, and broadcast it out.
- It could send it back to just B, and ask B what to do. That is what deepstream does.

At first it might seem like the server should merge, or at least try to merge. But merging is hard! The best way to resolve a conflict will depend on the specifics of the application or game.

Here is what lodash's merge function does:

```javascript
var object = {
  a: [{ b: 2 }, { d: 4 }],
};

var other = {
  a: [{ c: 3 }, { e: 5 }],
};
_.merge(object, other);
// => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
```

This is a reasonable way to merge, but you might want something like this:

```javascript
// => { 'a': [{ 'b': 2}, {'c': 3}, {'d': 4}, {'e': 5} }] }
```

That is a reasonable way to merge them too. There is no way to tell which is better from the data alone. You need to know what the clients were trying to do to decide.

# Some Simple Examples

## Example 1

Image the server has this:

Server `{score: 10}`

And two clients send changes that arrive at the same time:

Client 1 `{score: 11}`
Client 2 `{score: 9}`

Which one should the server choose? 11? 9? Deny both and keep 10?

Without knowing more about the application, and why each client made its changes, its not clear what should happen?

## Example 2

In this example the server again receives two changes at the same time, but this time the values are the same!

Server `{score: 10}`
Client 1 `{score: 11}`
Client 2 `{score: 11}`

This one seems easy right? Both clients want to change the score to 11, so no conflict, just update the score to 11. Right? ...right?

Well what if what the clients were trying to do wasn't "set score to 11" but "increment score by 1". In that case the score should be 12.

## Example 3

The above examples show that if two clients try to change the same value at the same time, its a conflict that the server can't resolve in a general way.

What if two clients try to change _different_ values at the same time?

Server `{score: 10, rupies: 5}`
Client 1 `{score: 11, rupies: 5}`
Client 2 `{score: 10, rupies: 6}`

The server receives changes from Client 1 and Client 2 at the same time. Client 1 has updated the score. Client 2 has updated the rupies.

Can the server just merge them like this `{score: 11, rupies: 6}`?

Sometimes, but not safely in all circumstances.

Imagine a game like capture the flag. When a player touches the flag, they become "it", but only if no other player is currently "it".

Server `{player1IsIt: false, player2IsIt: false}`

Both clients are up to date with the latest data. Both players touch the flag at the same time. The data says no player is "it", so both update the data and claim to be "it" at the same time.

Client 1 `{player1IsIt: true, player2IsIt: false}`
Client 2 `{player1IsIt: false, player2IsIt: true}`

To the server, this situation looks the same as the score/rupies situation. In that case merging would work, in this case it wouldn't.

The server can only safely merge changes to different pieces of data, if those pieces of data are independent.

The way you tell p5.party/deepstream that two peices of data are independent, and that they changing them simultaneously is fine, is by putting the data in seperate records.

## Merging is Hard

This problem isn't unique to p5.party or deepstream. One of git's main jobs is merging source code changes.

Look at this very, very contrived code. The assert fails because a + b doesn't equal 3.

```javascript
a = 1;
b = 1;
assert(a + b === 3);
```

Two programmers create different fixes for this problem and submit them.

Programmer 1's Change

```javascript
a = 2;
b = 1;
assert(a + b === 3);
```

Programmer 2's Change

```javascript
a = 1;
b = 2;
assert(a + b === 3);
```

Gits normal merge strategy only flags conflicts with both changes impact the same lines.
This usually works fine, but in this case, it doesn't.

Merge

```javascript
a = 2;
b = 2;
assert(a + b === 3);
```

a github merge
{
i = 1 -> 0
a[i] -> i - 1
}

how do you fix this bug.

option 1, and seriously consider this: don't fix it.
this is a prototyping library, if the bug doesn't impact the usefulness of your application _as a prototype_ don't fix it
fixes can get very complicated, and take a lot of work
prototypes shouldn't

option 2, avoid it - use multiple single-write records: everyone can listen, but only one writer - commen model for this is a host writes to `shared`, everyone else writes to `my` - take turns writing to records - make slower games - use events instead of writing to a shared - use events to tell a designated writer to write

option 3, handle the conflict (but seriously, maybe don't go down this road)

Notes:

These kinds of problems are inherrent in network code. They also crop up in multithreaded code.

https://sequencediagram.org/
title Message Versioning

actor Client 1
actor Client 2
database Server

rbox over Server:1
rbox over Client 1,Server:when clients connect the server sends them the current version of the record
Client 1-->Server:Connect
Client 1<-Server:Version 1
Client 2-->Server:Connect
Client 2<-Server:Version 1

rbox over Client 1,Server:client 1 updates the record, creating version 2.\n\nversion 2 is sent to the server, and broadcast to the clients.
rbox over Server:1
Client 1->Server:Version 2
rbox over Server:2
Client 2<-Server:Version 2
#Client 1<-Server:Version 2

rbox over Client 1,Server:messages aren't actually instant
rbox over Server:2
Client 1->(3)Server:Version 3
rbox over Server:3
Client 2(3)<-Server:Version 3
#Client 1(6)<-Server:Version 3
space -6
Client 2-#red>(3)Server:Version 3
space -4
note right of Server#red:expected version 4

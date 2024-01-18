# drag_fix_3

Some little squres to drag around.

- **drag** to move a square

> Try this example in two browser windows at once!

drag_conflict has a write conflict bug in it.

This example fixes that bug by making sure only one guest (the host) writes to the shared object containing the squares' data. When a client wants to make a change it sends a message to the host, which then writes to the object.

Because only one the host writes to the shared object, there is no chance of a write conflict. But the extra network round trip adds a little latency.

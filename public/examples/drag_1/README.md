# drag1

Some little squres to drag around.

- **drag** to move a square

> Try this example in two browser windows at once!

This example has a conflict bug! The state of all three squares is kept in one shared object. While a participant drags a square, it sends frequent updates. If two guests are dragging squares at once, conflicts will occur.

The Drag2 example only allows one square to be dragged at once. This limits the functionality, but prevents the conflict.

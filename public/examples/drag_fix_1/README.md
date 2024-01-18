# drag_fix_1

Some little squres to drag around.

- **drag** to move a square

> Try this example in two browser windows at once!

drag_conflict has a write conflict bug in it.

This example _mostly_ fixes that bug by allowing only one square to be dragged at once. While one square is being dragged, the other squares are locked. So only one client can be dragging at any time.

However it is still possible for two guests to attempt to _start_ dragging at nearly the exact same time, which will cause a write conflict.

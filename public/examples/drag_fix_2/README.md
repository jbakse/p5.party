# drag_fix_2

Some little squres to drag around.

- **drag** to move a square

> Try this example in two browser windows at once!

drag_conflict has a write conflict bug in it.

This example _mostly_ fixes that bug by storing each square's data in a separate shared object. While a square is being dragged, no other players can try to drag it. In this example two players can drag different squares at the same time.

However it is still possible for two guests to attempt to start dragging _the same square_ at nearly the exact same time, which would cause a write conflict.

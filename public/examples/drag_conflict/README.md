# drag_conflict

<div style="color: red; background: yellow; display: inline-block;">
Warning: This example has a bug! See below.
</div>

Some little squres to drag around.

- **drag** to move a square

> Try this example in two browser windows at once!

This example has a write conflict bug in it which is fixed in different ways in the drag_fix_1, drag_fix_2, drag_fix_3.

In this example all of the square data is stored in one shared object. Moving two squares at the same time will cause a write conflict.

As described in [Avoiding Write Conflicts](https://www.notion.so/Avoiding-Write-Conflicts-9aff34b8ae5f47fd8e7f14279c99096f), conflict happens when **multiple clients write** to **the same shared object** at **nearly the same time**.

Since dragging involves very frequent writes, when two people drag at the same time, it is inevitable that those writes will happen at nearly the same time.

One way to avoid the write conflict is to allow only one square to be dragged at time. drag_fix_1 takes this approach

A second way to avoid the write conflict is store each square's data in a separate shared object. drag_fix_2 takes this approach.

A third to avoid the write conflict is to make sure only one guest (the host) writes to the shared object. drag_fix_3 takes this approach.

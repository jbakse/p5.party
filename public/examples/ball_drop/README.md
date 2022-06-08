# balldrop

This example shows a simple physics simulation. It uses `partyIsHost()` to make sure only one client runs the simulation at a time. The last click is stored in the shared record named `shared`. The position of the bouncing ball is stored in a second shared record named `host`. Having only one client—the host—write to the frequently updated shared record prevents write conflicts.

p5.party is better suited to slower paced games and apps, but this app shows what is possible if you push it a bit.

- **click** to move the obsticle

> Try this example in two browser windows at once!

# click_history

This example builds on the `hello_party` example, adding a history of user clicks using a shared array.

It also demonstrates a common pattern of initializing the shared object in setup using `partyIsHost()` and `partySetShrared()` together.

By using `partyIsHost()` in setup we can determine if this client is the only/first client in the room, and if so, initialize the shared object. Using `partySetShared()` sets all the values at once and removes any properties that might be left over from earlier development.

- **click** to move the dot and add to the click history
- **press space** to clear the history

> Open this example in two browser windows at once!

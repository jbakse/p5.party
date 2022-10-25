# Rocks!

Fly your spaceship. Shoot at rocks. Don't crash.

This example shows a larger, more complex game made with p5.party. It demonstrates a few things:

- Organizing your code into multiple JavaScript modules
- One way to manage the high-level game states in a game with multiple "screens"
- Using a fragment and vertex shader to do a post-processing screen effect.
- Working with sound using p5.sound.js
- Separating the game logic from the rendering code
- Using the `p5.party` library to make the game multiplayer
- Keeping all the "host" related code in its own module.

Of interest is the way that the network and game logic id divided up.

- The player's ship and bullets are updated by their respective client.
- The rocks are updated by the host.
- When a bullet hits a rock, the client sends a message to the host to destroy the rock.

This leads to a more responsive gameplay since the player sees their own ship react immediately, but it would also allow cheating. This is a fine trade off for prototyping.

# Ghosts

Ghosts is a technical prototype exploring how to record and playback user movement in the context of a p5.party game.

Ghosts is multiplayer game in which each player moves an onscreen avatar on a simple 2D game board with keyboard controls. Game play takes place in 10 second rounds. In the first round, each player sees their own avatar and the avatars of the other players. In subsequent rounds, each player sees their own avatar, the other player’s avatars, AND “ghost” avatars that replay the movement of each avatar from the previous rounds.

During a round each player keeps a record of their position in an array:

`[ {x, y}, {x, y}, ... ]`

The first item is the starting (first frame) position, the second item is the position during the second frame of the round, and so on.

At the end of each round, this data is added to the client's "participant" shared object and p5.party shares the data to the other clients. In future rounds, each client replays the recorded data from the other clients.

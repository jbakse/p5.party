# role_keeper

This is now half baked!

### RoleKeeper

RoleKeeper assigns roles to guests. It ensures that each specified role is given to one guest. If there are fewer guests than roles, the remaining roles are left unassigned. If there are more guests than roles, the extra guests are given the "unassigned" role.

Constructor Arguments

- `roles` (Array of Strings/Numbers): Specifies the roles available for assignment. This array must contain at least one role.
- `unassigned` (String/Number): Represents the default state for new or currently unassigned guests. This role is temporarily assigned until a specific role from the roles list can be allocated.

### TurnKeeper

TurnKeeper manages a rotation of turns.

Constructor Arguments

- `turns` (Array of Strings/Numbers): The names of turns to be managed. e.g. ["player1", "player2", "player3"] or ["red", "blue", "green", "yellow"]

- `getCurrentTurn()`: Returns the name of the current turn

- `nextTurn()`: Advances the turn to the next participant.

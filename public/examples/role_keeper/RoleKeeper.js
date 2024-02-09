export class TurnKeeper {
  #turns;
  #shared;

  constructor(turns = [1, 2]) {
    this.#turns = turns;
    this.#shared = partyLoadShared("turn_keeper", {}, () => {
      this.#shared.currentTurn = turns[0];
    });
  }

  getCurrentTurn() {
    return this.#shared.currentTurn || this.#turns[0];
  }

  nextTurn() {
    const currentIndex = this.#turns.indexOf(this.#shared.currentTurn);
    const nextIndex = (currentIndex + 1) % this.#turns.length;
    this.#shared.currentTurn = this.#turns[nextIndex];
  }
}

export class RoleKeeper {
  #roles;
  #unassigned;
  #guests;
  #me;
  #boundUpdate; // holds a bound version of the update function

  constructor(roles = [1, 2], unassigned = "unassigned") {
    if (roles.length < 1)
      console.error("RoleKeeper: You must have at least one role!");

    this.#roles = roles;
    this.#unassigned = unassigned;
    this.#guests = partyLoadGuestShareds();
    this.#boundUpdate = this.#update.bind(this);
    this.#me = partyLoadMyShared(undefined, () => {
      this.#me.role_keeper = { role: unassigned };

      this.#boundUpdate();
    });
  }

  #update() {
    requestAnimationFrame(this.#boundUpdate);

    // loop through roles and assign them if needed
    this.#roles.forEach((role) => {
      // if there isn't any guest currently in this role...
      if (!this.#guests.find((g) => g.role_keeper?.role === role)) {
        // find first unassigned guest...
        const guest = this.#guests.find(
          (g) => g.role_keeper?.role === this.#unassigned
        );
        // if that unassigned guest is me, take on the role
        if (guest === this.#me) guest.role_keeper.role = role;
      }
    });
  }
}

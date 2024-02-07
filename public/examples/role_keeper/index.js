let guests, me;

let turnKeeper;

window.preload = () => {
  partyConnect("wss://demoserver.p5party.org", "role_keeper");
  me = partyLoadMyShared();
  guests = partyLoadGuestShareds();

  new RoleKeeper(["player1", "player2"], "none");
  turnKeeper = new TurnKeeper(["player1", "player2"]);
};

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background("#333");
  fill("#fff");
  text("Role Keeper", 10, 20);

  text("Connected Guests", 10, 60);
  let y = 80;
  for (const guest of guests) {
    text(guest.role_keeper.role, 10, y);
    if (guest === me) text("<- you", 100, y);
    if (turnKeeper.getCurrentTurn() === guest.role_keeper.role)
      text("<- turn", 200, y);
    y += 20;
  }

  text(`You are: ${me.role_keeper.role}`, 10, height - 60);
  text(`Current Turn: ${turnKeeper.getCurrentTurn()}`, 10, height - 40);
  if (turnKeeper.getCurrentTurn() === me.role_keeper.role)
    text("Its your turn. Click to end turn.", 10, height - 20);
}

function mousePressed() {
  if (turnKeeper.getCurrentTurn() === me.role_keeper.role)
    turnKeeper.nextTurn();
}

class TurnKeeper {
  #turns;
  #shared;

  constructor(turns = [1, 2]) {
    this.#turns = turns;
    this.#shared = partyLoadShared("turn_keeper", {}, () => {
      this.#shared.currentTurn = turns[0];
    });
  }

  getCurrentTurn() {
    return this.#shared.currentTurn;
  }

  nextTurn() {
    const currentIndex = this.#turns.indexOf(this.#shared.currentTurn);
    const nextIndex = (currentIndex + 1) % this.#turns.length;
    this.#shared.currentTurn = this.#turns[nextIndex];
  }
}

class RoleKeeper {
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
      if (!this.#guests.find((g) => g.role_keeper.role === role)) {
        // find first unassigned guest...
        const guest = this.#guests.find(
          (g) => g.role_keeper.role === this.#unassigned
        );
        // if that unassigned guest is me, take on the role
        if (guest === this.#me) guest.role_keeper.role = role;
      }
    });
  }
}

let guests, me;
let roleKeeper;

// todo: add a way for there to be teams?
// todo: confirm its safe to load the same shared multiple times
// me = partyLoadMyShared();
// my = partyLoadMyShared();
// me === my is true
// how is that!?
// todo: if it is, then can RoleKeeper load the shareds for itself in addition to the main script loading them?
// todo: can i then call new RoleKeeper() from preload?
// would i then have to make something like rollKeeper.start() from setup?
// or await all the callbacks from the shareds to be loaded?

window.preload = () => {
  partyConnect("wss://demoserver.p5party.org", "role_keeper");
  me = partyLoadMyShared();

  guests = partyLoadGuestShareds();
};

function setup() {
  createCanvas(400, 400);
  roleKeeper = new RoleKeeper(guests, me, ["player1", "player2"], "none");
}

function draw() {
  background("#333");
  fill("#fff");
  text("Role Keeper", 10, 20);

  text("Connected Guests", 10, 60);
  let y = 80;
  for (const guest of guests) {
    text(guest.role, 10, y);
    if (guest === me) {
      text("<- me", 100, y);
    }
    if (roleKeeper.getCurrentTurn() === guest.role) {
      text("<- turn", 200, y);
    }
    y += 20;
  }

  text(`Current Turn: ${roleKeeper.getCurrentTurn()}`, 10, height - 40);
  if (roleKeeper.getCurrentTurn() === me.role)
    text("Its your turn. Click to end turn.", 10, height - 20);
}

function mousePressed() {
  if (roleKeeper.getCurrentTurn() === me.role) roleKeeper.nextTurn();
}

class RoleKeeper {
  constructor(guests, me, roles = [1, 2], unassigned = "unassigned") {
    if (roles.length < 1)
      console.error("RoleKeeper: You must have at least one role!");

    this.guests = guests;
    this.me = me;
    this.roles = roles;
    this.unassigned = unassigned;

    this.update = this.update.bind(this);
    this.shared = partyLoadShared("role_keeper", {}, () => {
      this.shared.currentTurn = roles[0];
      this.update();
    });

    // requestAnimationFrame(this.update);
  }

  getCurrentTurn() {
    return this.shared.currentTurn;
  }

  nextTurn() {
    const currentIndex = this.roles.indexOf(this.shared.currentTurn);
    const nextIndex = (currentIndex + 1) % this.roles.length;
    this.shared.currentTurn = this.roles[nextIndex];
  }

  update() {
    requestAnimationFrame(this.update);
    assignRoles(this.guests, this.me, this.roles, this.unassigned);
  }
}

function assignRoles(guests, me, roles = [1, 2], unassigned = "unassigned") {
  // upgrade from undefined to unassigned if specified
  if (unassigned && me.role === undefined) me.role = unassigned;

  // loop through roles and assign them if needed
  roles.forEach((role) => {
    // if there isn't any guest currently in this role...
    if (!guests.find((g) => g.role === role)) {
      // find an unassigned guest...
      const guest = guests.find(
        (g) => g.role === unassigned || g.role === undefined
      );
      // if that unassigned guest is me, take on the role
      if (guest === me) guest.role = role;
    }
  });
}

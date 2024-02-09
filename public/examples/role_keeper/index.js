import { RoleKeeper, TurnKeeper } from "./RoleKeeper.js";

let guests, me;

let turnKeeper;

window.preload = () => {
  partyConnect("wss://demoserver.p5party.org", "role_keeper");
  me = partyLoadMyShared();
  guests = partyLoadGuestShareds();

  new RoleKeeper(["player1", "player2"], "none");
  turnKeeper = new TurnKeeper(["player1", "player2"]);
};

window.setup = () => {
  createCanvas(400, 400);
};

window.draw = () => {
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
};

window.mousePressed = () => {
  if (turnKeeper.getCurrentTurn() === me.role_keeper.role)
    turnKeeper.nextTurn();
};

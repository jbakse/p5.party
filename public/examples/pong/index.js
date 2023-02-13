import { Rect, intersects } from "./shape.js";

let shared;
let me;
let guests;

window.preload = () => {
  partyConnect("wss://demoserver.p5party.org", "pong", "main3");
  shared = partyLoadShared("shared");
  me = partyLoadMyShared({ role: "observer", y: 20 });
  guests = partyLoadGuestShareds();
};

window.setup = () => {
  createCanvas(600, 400);
  noStroke();

  if (partyIsHost()) {
    shared.ball = new Rect(300, 200, 20, 20);
    shared.ball.dX = 4;
    shared.ball.dY = 4;
  }
};

window.draw = () => {
  assignPlayers();
  if (partyIsHost()) stepBall();
  me.y = mouseY - 50;

  fill("#fee");

  // draw background
  background("#211");

  // draw ball
  rect(shared.ball.l, shared.ball.t, shared.ball.w, shared.ball.h);

  // draw player 1
  const p1 = guests.find((p) => p.role === "player1");
  if (p1) rect(60, p1.y, 20, 100);

  // draw player 2
  const p2 = guests.find((p) => p.role === "player2");
  if (p2) rect(520, p2.y, 20, 100);

  // draw role
  textAlign(CENTER);
  text(me.role, 300, 380);
};

function stepBall() {
  const ball = shared.ball;
  ball.l += ball.dX;
  ball.t += ball.dY;

  // bounds
  if (ball.t < 0) ball.dY = abs(ball.dY);
  if (ball.l < 0) ball.dX = abs(ball.dX);
  if (ball.r > width) ball.dX = -abs(ball.dX);
  if (ball.b > height) ball.dY = -abs(ball.dY);

  // player 1
  const p1 = guests.find((p) => p.role === "player1");
  if (p1 && intersects(ball, new Rect(60, p1.y, 20, 100))) {
    ball.dX = abs(ball.dX);
  }

  // player 2
  const p2 = guests.find((p) => p.role === "player2");
  if (p2 && intersects(ball, new Rect(520, p2.y, 20, 100))) {
    ball.dX = -abs(ball.dX);
  }
}

// called from draw each player checks if player1 or 2 role is open
// and takes it if currently first inline
function assignPlayers() {
  // if there isn't a player1
  if (!guests.find((p) => p.role === "player1")) {
    console.log("need player1");
    // find the first observer
    const o = guests.find((p) => p.role === "observer");
    console.log("found", o, me, o === me);
    // if thats me, take the role
    if (o === me) o.role = "player1";
  }
  if (!guests.find((p) => p.role === "player2")) {
    const o = guests.find((p) => p.role === "observer");
    if (o === me) o.role = "player2";
  }
}

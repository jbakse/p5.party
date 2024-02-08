import DOMCursors from "./DOMCursors.js";

window.preload = () => {
  // connect to the party server
  partyConnect("wss://demoserver.p5party.org", "hello_party");
};

window.setup = () => {
  createCanvas(400, 400);

  new DOMCursors(true);
};

window.draw = () => {
  background("#334");
  fill("black");
  rect(0, 0, width * 0.5, height * 0.5);
  fill("white");
  rect(width * 0.5, 0, width * 0.5, height * 0.5);
};

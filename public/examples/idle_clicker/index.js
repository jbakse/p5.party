let me, guests;

function preload() {
  partyConnect("wss://demoserver.p5party.org", "idle_clicker", "main");
  guests = partyLoadGuestShareds();
  me = partyLoadMyShared({ score: 0, name: pick(names) });
}

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  textSize(28);
  let total = 0;
  for (let i = 0; i < guests.length; i++) {
    text(guests[i].name + " " + guests[i].score, 10, i * 32 + 96);
    total += guests[i].score;
  }
  text("Total " + total, 10, 32);
}

function mouseClicked() {
  me.score++;
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const names = [
  "Cookie",
  "Potato",
  "Lemon",
  "Plant",
  "Candy",
  "Cow",
  "Capitalist",
  "Hero",
  "Paperclip",
  "Forage",
  "Trimp",
  "Room",
];

let me, participants;

function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "idle_clicker",
    "main"
  );
  participants = partyLoadParticipantShareds();
  me = partyLoadMyShared();
}

function setup() {
  createCanvas(400, 400);
  me.score = 0;
  me.name = pick(names);
}

function draw() {
  background(220);
  textSize(28);
  let total = 0;
  for (let i = 0; i < participants.length; i++) {
    text(participants[i].name + " " + participants[i].score, 10, i * 32 + 96);
    total += participants[i].score;
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

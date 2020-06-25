let myShared, shareds;

function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "empty_example",
    "main"
  );
  shareds = partyLoadParticipantShareds();
  myShared = partyLoadMyShared();
}

function setup() {
  createCanvas(400, 400);
  myShared.score = myShared.score || 0;
  myShared.name = myShared.name || pickRandom(names);
}

function draw() {
  background(220);
  textSize(28);
  let total = 0;
  for (let i = 0; i < shareds.length; i++) {
    text(shareds[i].name + " " + shareds[i].score, 10, i * 32 + 96);
    total += shareds[i].score;
  }
  text("Total " + total, 10, 32);
}

function mouseClicked() {
  myShared.score++;
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

let names = [
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

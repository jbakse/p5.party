let chatHistory,
  userName,
  shared,
  chatLog,
  messageInput,
  sendButton,
  clearButton;

function preload() {
  partyConnect("wss://deepstream-server-1.herokuapp.com", "chat_log", "main");
  shared = partyLoadShared("globals");
}

function setup() {
  createCanvas(400, 400);
  chatLog = document.getElementById("chatLog");
  chatLog.style.height = height - 60 + "px";
  chatLog.style.width = width + "px";

  //textbox that contains writing message
  messageInput = createInput();
  messageInput.size(width - 50, 20);
  messageInput.position(20, height - 10);

  //button for sending messsages
  sendButton = createButton("SEND");
  sendButton.position(messageInput.x + messageInput.width, messageInput.y - 12);
  sendButton.size(AUTO, 24);
  sendButton.mousePressed(sendMessageToLog);
  sendButton.onkeypress = addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      sendMessageToLog();
    }
  });

  //name of the user running this instance
  userName = generateName();
  if (shared.log) {
    shared.log = "Weclome to chatLog, " + userName + "!";
  } else {
    shared.log = shared.log + "\n" + userName + " has entered the chat";
  }
}

function draw() {
  if (shared.log !== chatHistory) {
    chatLog.innerHTML = shared.log;
    chatLog.scrollTop = chatLog.scrollHeight;
    chatHistory = shared.log;
  }
  if (partyIsHost() && !clearButton) {
    clearButton = createButton("clear").mousePressed(() => {
      shared.log = userName + " has cleared the log. Blame them!";
    });
  }
}

function sendMessageToLog() {
  shared.log =
    chatLog.innerHTML + "\n" + userName + ": “" + messageInput.value() + "”";
  messageInput.value("");
}

function generateName() {
  return pickRandom(animalNames);
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const animalNames = [
  "Cat",
  "Moose",
  "Zebra",
  "Mongoose",
  "Goose",
  "Rabbit",
  "Lion",
  "Tiger",
  "Horse",
  "Pig",
  "Human",
  "Fish",
  "Ladybug",
  "Dog",
  "Rhino",
  "Python",
  "Snake",
  "Bear",
  "Deer",
  "Antelope",
  "Elephant",
  "Skunk",
  "Capybara",
  "Liger",
  "Donkey",
  "Camel",
  "Giraffe",
  "Walrus",
  "Goat",
  "Rooster",
  "Monkey",
  "Ape",
  "Gorilla",
  "Rat",
  "Ox",
  "Cow",
  "Chicken",
  "Eagle",
  "Parrot",
  "Wolf",
  "Sheep",
  "Anteater",
  "Mouse",
  "Spider",
  "Owl",
  "Carp",
  "Salmon",
  "Buffalo",
];

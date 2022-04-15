let userName, shared, chatLog, messageInput, sendButton, clearButton;

async function init() {
  //create a new client and connect to server
  const client = new party.Client("wss://deepstream-server-1.herokuapp.com");
  await client.whenReady();

  //create a room
  const room = new party.Room(client, "chat_log_nop5", "main");
  await room.whenReady();

  //join the room and remove any clients who are no longer present
  room.join();
  room.removeDisconnectedClients();

  //create a record that will be used for transporting data between users
  const record = room.getRecord("test");
  await record.whenReady();

  //get the shared object from the record
  shared = record.getShared();

  //clean up on exit
  window.addEventListener("beforeunload", () => {
    shared.log.push(`${userName} has left the chat`);
    shared.names.push(userName);
    room.leave();
    client.close();
  });

  setup();
  record.watchShared(onChange);
}
init();

function setup() {
  chatLog = document.getElementById("chatLog");

  //textbox that contains writing message
  messageInput = document.getElementById("messageInput");

  //button for sending messsages
  sendButton = document.getElementById("sendButton");
  // @todo move to addEventListener below? onkeypress is deprecated
  sendButton.onclick = sendMessageToLog;
  sendButton.onkeypress = addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      sendMessageToLog();
    }
  });

  //clears the shared log and leaves a blame message
  clearButton = document.getElementById("clearButton");
  clearButton.onclick = function () {
    shared.log = [`${userName} has cleared the log. Blame them!`];
  };

  if (!shared.log) {
    shared.log = [];
    shared.names = animalNames;
  }

  //add to chatLog all existing messages
  shared.log.forEach(addMessage);

  //random name for the user and introduction
  userName = spliceRandom(shared.names);
  shared.log.push(`${userName} has entered the chat`);
}

function onChange() {
  addMessage(shared.log[shared.log.length - 1]);
}

function addMessage(text) {
  const message = document.createElement("div");
  message.innerHTML = text;
  chatLog.append(message);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function sendMessageToLog() {
  shared.log.push(`${userName}: “${messageInput.value}”`);
  messageInput.value = "";
}

function spliceRandom(array) {
  return array.splice(Math.floor(Math.random() * array.length), 1);
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

// https://opengameart.org/content/a-platformer-in-the-forest

/* eslint-disable no-unused-vars */
/* global connectToSharedRoom getSharedData */

let chatHistory;
let yourName;
let shared;


async function init() {
  console.log("Create Connection Manager");
  const client = new party.Client("wss://deepstream-server-1.herokuapp.com");
  await client.whenReady();
  console.log("Connection Ready");

  console.log("Create Room");
  const room = new party.Room(client, "chat_log_nop5", "main");
  await room.whenReady();
  console.log("Room Ready");

  console.log("Join Room");
  room.join();
  room.removeDisconnectedClients();

  console.log("Create Record");
  const record = new party.Record(client, "chat_log_nop5-main/test");
  await record.whenReady();
  console.log("Record Ready");

  shared = record.getShared();

  // clean up on exit
  window.addEventListener("beforeunload", () => {
    room.leave();
    client.close();
  });
  setup();
  setInterval(draw, 100);
}
init();


function setup() {
  let height=400;
  let width=400;

  chatBox=document.createElement('DIV');
  chatBox.id="chatBox";
  chatBox.style.height=(height - 60)+"px";
  chatBox.style.width=width+"px";
  document.body.appendChild(chatBox);  


  //textbox that contains writing message
  messageInput = document.createElement("INPUT");
  document.body.appendChild(messageInput);  
  // messageInput.size(width-50,20);
  // messageInput.position(20, height-10);

  //name of the user runnign this instance
  yourName=nameGenerator();

  //button for sending messsages
  sendButton = document.createElement("BUTTON");
  sendButton.innerHTML="SEND";
  // sendButton.position(messageInput.x + messageInput.width, messageInput.y-12);
  // sendButton.size(AUTO,24);
  sendButton.onclick=sendMessageToLog;
  sendButton.onkeypress=addEventListener('keyup', function event(e){
    if (e.key==="Enter"){
      sendMessageToLog();
    }
  });
  document.body.appendChild(sendButton);

  if (!shared.log) { 
    shared.log='Weclome to ChatBox, '+yourName+'!';
  }
  else {
    shared.log=shared.log+'\n'+yourName+' has entered the chat';
  }
  clearButton=document.createElement("BUTTON");
  clearButton.innerHTML="Clear";
  clearButton.onclick=function() {
    shared.log=yourName+' has cleared the log. Blame them!';
  };
  document.body.appendChild(clearButton);
}


function draw() {
  if (!shared) return;
  if (shared.log!=chatHistory) {
    chatBox.innerHTML=shared.log;
    chatBox.scrollTop=chatBox.scrollHeight;
    chatHistory=shared.log;
  }
}


function sendMessageToLog() {
  shared.log=chatBox.innerHTML+'\n'+yourName+': “'+messageInput.value+'”';
  messageInput.value='';
}


function nameGenerator() {
  return random(animalNames);
}

function random(array) {
  return array[Math.floor(Math.random() * array.length)];
}

let animalNames=[
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
]
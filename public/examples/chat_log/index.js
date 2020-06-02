// https://opengameart.org/content/a-platformer-in-the-forest

/* eslint-disable no-unused-vars */
/* global connectToSharedRoom getSharedData */

let shared;
let chatHistory;
let yourName;

function preload() {
  connectToSharedRoom(
    "wss://deepstream-server-1.herokuapp.com",
    "chat_log",
    "main"
  );
  shared = getSharedData("globals");
}

async function setup() {
  let canvas=createCanvas(400, 400);
  chatBox=document.getElementById('chatBox');
  chatBox.style.height=(height - 60)+"px";
  chatBox.style.width=width+"px";

  //textbox that contains writing message
  messageInput = createInput();
  messageInput.size(width-50,20);
  messageInput.position(20, height-10);

  //name of the user runnign this instance
  yourName=nameGenerator();

  //button for sending messsages
  sendButton = createButton('send');
  sendButton.position(messageInput.x + messageInput.width, messageInput.y-12);
  sendButton.size(AUTO,24);
  sendButton.mousePressed(sendMessageToLog);
  sendButton.onkeypress=addEventListener('keyup', function event(e){
    if (e.key==="Enter"){
      sendMessageToLog();
    }
  });

  if (!shared.log) { 
    shared.log='Weclome to ChatBox, '+yourName+'!';
  }
  else {
    shared.log=shared.log+'\n'+yourName+' has entered the chat';
  }

  createButton("clear").mousePressed(() => {
    shared.log=yourName+' has cleared the log. Blame them!';
  });
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
  shared.log=chatBox.innerHTML+'\n'+yourName+': “'+messageInput.value()+'”';
  messageInput.value('');
}


function nameGenerator() {
  return random(animalNames);
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
/* eslint-disable no-unused-vars */
/* global connectToSharedRoom getSharedData */

let chatHistory;
let yourName;
let shared;
let chatBox;
let messageInput;
let sendButton;
let clearButton;

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

  // clean up on exit
  window.addEventListener("beforeunload", () => {
    shared.log=shared.log+'\n'+yourName+' has left the chat';
    room.leave();
    client.close();
  });

  shared = record.getShared();

  setup();
  setInterval(update, 100);
}
init();


function setup() {
  let height=400;
  let width=400;

  chatBox=document.createElement('DIV');
  chatBox.style.cssText="background-color: Snow; overflow: auto; white-space: pre; padding: 20px;"
  chatBox.id="chatBox";
  chatBox.style.height=(height - 60)+"px";
  chatBox.style.width=width+"px";
  document.body.appendChild(chatBox);  

  //textbox that contains writing message
  messageInput = document.createElement("INPUT");
  messageInput.style.width=(width-50)+"px";

  document.body.appendChild(messageInput);  

  //button for sending messsages
  sendButton = document.createElement("BUTTON");
  sendButton.innerHTML="SEND";

  sendButton.onclick=sendMessageToLog;
  sendButton.onkeypress=addEventListener('keyup', function event(e){
    if (e.key==="Enter"){
      sendMessageToLog();
    }
  });
  document.body.appendChild(sendButton);

  clearButton=document.createElement("BUTTON");
  clearButton.innerHTML="Clear";
  clearButton.onclick=function() {
    shared.log=yourName+' has cleared the log. Blame them!';
  };
  document.body.appendChild(clearButton);

  //random name of the user running this instance
  yourName=nameGenerator();

  if (shared.log) { 
    shared.log=shared.log+'\n'+yourName+' has entered the chat';
  }
  else {
    shared.log='Weclome to ChatBox, '+yourName+'!';
  }
}

function update() {
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
  "Cat","Moose","Zebra","Mongoose","Goose","Rabbit","Lion","Tiger","Horse","Pig","Human","Fish","Ladybug","Dog","Rhino","Python","Snake","Bear","Deer","Antelope","Elephant","Skunk","Capybara","Liger","Donkey","Camel","Giraffe","Walrus","Goat","Rooster","Monkey","Ape","Gorilla","Rat","Ox","Cow","Chicken","Eagle","Parrot","Wolf","Sheep","Anteater","Mouse","Spider","Owl","Carp","Salmon","Buffalo",
]
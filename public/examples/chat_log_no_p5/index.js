/* global connectToSharedRoom getSharedData */

let chatHistory,
  userName,
  shared,
  chatLog,
  messageInput,
  sendButton,
  clearButton;

async function init() {
  //create a new client on the backend server
  const client = new party.Client("wss://deepstream-server-1.herokuapp.com");
  await client.whenReady();

  //create a room using the parameters of the project name and room name
  const room = new party.Room(client, "chat_log_nop5", "main");
  await room.whenReady();
	
	//join the room and remove any clients who are no longer present
  room.join();
  room.removeDisconnectedClients();

	//create a record that will be used for transporting data between users
  const record = new party.Record(client, "chat_log_nop5-main/test");
  await record.whenReady();
	
	//create the global vaiable for accessing shared data
  shared = record.getShared();

  //clean up on exit
  window.addEventListener("beforeunload", () => {
    shared.log=shared.log+'\n'+userName+' has left the chat';
    room.leave();
    client.close();
  });

  shared = record.getShared();

  setup();
  setInterval(update, 100);
}
init();

function setup() {
  chatLog=document.createElement('DIV');
  chatLog.style.cssText="background-color: Snow; overflow: auto; white-space: pre; padding: 20px; height:400px; width:400px"
  document.body.appendChild(chatLog);  

  //textbox that contains writing message
  messageInput = document.createElement("INPUT");
  messageInput.style.width="330px";

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
    shared.log=userName+' has cleared the log. Blame them!';
  };
  document.body.appendChild(clearButton);

  //random name of the user running this instance
  userName=nameGenerator();

  if (shared.log) { 
    shared.log=shared.log+'\n'+userName+' has entered the chat';
  }
  else {
    shared.log='Weclome to chatLog, '+userName+'!';
  }
}

function update() {
  if (shared.log!=chatHistory) {
    chatLog.innerHTML=shared.log;
    chatLog.scrollTop=chatLog.scrollHeight;
    chatHistory=shared.log;
  }
}

function sendMessageToLog() { 
  shared.log=chatLog.innerHTML+'\n'+userName+': “'+messageInput.value+'”';
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
console.log("Party", party);

async function init() {
  console.log("Create Connection Manager");
  const client = new party.Client("wss://deepstream-server-1.herokuapp.com");
  await client.whenReady();
  console.log("Connection Ready");

  console.log("Create Room");
  const room = new party.Room(client, "nop5", "main");
  await room.whenReady();
  console.log("Room Ready");

  console.log("Join Room");
  room.join();
  // clients should remove themselves from the room before they disconnect
  // but sometimes they don't or can't
  // clear out any disconnected clients
  // @todo this should be taken care of for you, even if you are using party directly
  room.removeDisconnectedClients();

  console.log("Create Record");
  // @todo fix next line to use room as factory to make record so user doesn't
  // need to specify full record name
  const record = new party.Record(client, "nop5-main/test");
  await record.whenReady();
  console.log("Record Ready");

  const shared = record.getShared();
  shared.text = shared.text || "Hello!";

  // sync input field
  const input = document.querySelector("input");
  input.oninput = function () {
    shared.text = input.value;
  };
  // @todo it would be better to do this when the data changes
  // but right now p5.party.js doesn't expose the subscription events
  // so we poll here instead.
  setInterval(() => {
    if (input.value !== shared.text) input.value = shared.text;
  }, 100);

  // clean up on exit
  // @todo, this proably shouldn't be left to user code
  // p5.party wrapper handles this, maybe this can be handled by party classes directly?
  window.addEventListener("beforeunload", () => {
    room.leave();
    client.close();
  });
}

init();

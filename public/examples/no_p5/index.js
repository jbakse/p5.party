/* globals together */
console.log("Together", together);

async function init() {
  console.log("Create Connection Manager");
  const client = new together.Client("wss://deepstream-server-1.herokuapp.com");
  await client.whenReady();
  console.log("Connection Ready");

  console.log("Create Room");
  const room = new together.Room(client, "nop5", "main");
  await room.whenReady();
  console.log("Room Ready");

  console.log("Join Room");
  room.join();
  room.removeDisconnectedClients();

  const record = new together.Record(client, "nop5-main/test");
  await record.whenReady();
  console.log("Record Ready");
  const shared = record.getData("shared");
  shared.text = shared.text || "Hello!";

  const input = document.querySelector("input");

  input.onkeyup = function () {
    console.log("shared.text = ", input.value);
    shared.text = input.value;
  };
  // @todo, this isn't working
  // i'm afriad it has to do with how the wathcing works on deeply nested properties
  // i might not have seen it before because i was't going more than first level deep
  // but now i always am because I'm watching root istead of shared
  // look into it
  setInterval(() => {
    console.log("i", shared.text);
    if (input.value != shared.text) {
      input.value = shared.text;
    }
  }, 1000);

  window.addEventListener("click", () => {
    console.log("click");
    // room.leave();
  });
  window.addEventListener("beforeunload", () => {
    room.leave();
    client.close();
  });
}

init();

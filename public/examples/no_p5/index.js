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
  room.clearMissing();

  window.addEventListener("click", async () => {
    console.log("click");
    // room.leave();
  });
  window.addEventListener("beforeunload", () => {
    room.leave();
    client.close();
  });
}

init();

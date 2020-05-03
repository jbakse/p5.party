ds.presence.subscribe((username, isLoggedIn) => {
  console.log("presence", username, isLoggedIn);
});

const connectedClients = await ds.presence.getAll();
if (connectedClients.length === 0) {
  host = new Host();
  await host.setup();
}

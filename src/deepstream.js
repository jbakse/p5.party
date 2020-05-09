let ds;

const dslog = makeLogger(
  "log",
  "ds",
  "background-color: #888; color: #00ffff; padding: 2px 5px; border-radius: 2px"
);

const dserror = makeLogger(
  "log",
  "ds",
  "background-color: #ff0000; color: #ffffff; padding: 2px 5px; border-radius: 2px"
);

async function initDeepstream() {
  // ds = new DeepstreamClient("localhost:6020");
  ds = new DeepstreamClient("wss://deepstream-server-1.herokuapp.com");
  const name = randomName();
  await ds.login({ username: name });
  ds.clientName = name;
  dslog("login complete", name);

  ds.on("error", (error, event, topic) =>
    dserror("error", error, event, topic)
  );

  ds.on("connectionStateChanged", (connectionState) =>
    dslog("connectionStateChanged", connectionState)
  );
}

import { makeLogger } from "./logging.js";

/* globals DeepstreamClient */
export let ds;

export const dsLog = makeLogger(
  "log",
  "ds",
  "background-color: #888; color: #00ffff; padding: 2px 5px; border-radius: 2px"
);

export const dsError = makeLogger(
  "log",
  "ds",
  "background-color: #ff0000; color: #ffffff; padding: 2px 5px; border-radius: 2px"
);

export async function init(
  app = "default",
  room = "default",
  host = "wss://deepstream-server-1.herokuapp.com"
) {
  // ds = new DeepstreamClient("localhost:6020");
  ds = new DeepstreamClient(host);

  const name = ds.getUid();
  await ds.login({ username: name });
  ds.clientName = name;
  ds.app = app;
  ds.room = room;
  dsLog("login complete", name);

  ds.on("error", (error, event, topic) =>
    dsError("error", error, event, topic)
  );

  ds.on("connectionStateChanged", (connectionState) =>
    dsLog("connectionStateChanged", connectionState)
  );

  const result = await ds.presence.getAll();
  ds.clientList = result;
  console.log("everybody", ds.clientList, ds.clientName);

  ds.presence.subscribe((name, login) => {
    if (login) {
      ds.clientList.push(name);
    } else {
      ds.clientList.splice(ds.clientList.indexOf(name), 1);
    }
    console.log("everybody update", ds.clientList, ds.clientName);
  });
}

import { makeLogger } from "./logging.js";
import { randomName } from "./util.js";

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

export async function initDeepstream(
  host = "wss://deepstream-server-1.herokuapp.com"
) {
  // ds = new DeepstreamClient("localhost:6020");
  ds = new DeepstreamClient(host);
  const name = randomName();
  await ds.login({ username: name });
  ds.clientName = name;
  dsLog("login complete", name);

  ds.on("error", (error, event, topic) =>
    dsError("error", error, event, topic)
  );

  ds.on("connectionStateChanged", (connectionState) =>
    dsLog("connectionStateChanged", connectionState)
  );
}

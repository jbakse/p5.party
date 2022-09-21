import { store, component } from "reefjs";

let infoDiv;
let refreshId;
let infoComponent;

export async function createInfo(room) {
  console.log("createInfo", room);
  await room.whenConnected;
  console.log("A");
  if (infoDiv) return;

  console.log("1");
  // create info panel div
  infoDiv = document.createElement("div");
  infoDiv.className = "p5party_info";
  document.body.append(infoDiv);

  // setup UI with reef
  const data = store(room.info());

  function template() {
    const { appName, roomName, guestNames, isHost } = data;
    return `
      <style>
        .p5party_info {
          position: fixed;
          right: 0;
          top: 0;
          background: rgba(255,255,0,.1);
          padding: 10px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 18px;
        }
      </style>

      <div>${appName}</div>
      <div>${roomName}</div>
      <div>guests: ${guestNames.length}</div>
      <div>${isHost ? "hosting" : ""}</div>
    `;
  }

  infoComponent = component(infoDiv, template);

  // update UI
  refreshId = setInterval(() => {
    Object.assign(data, room.info());
  }, 100);
}

export function destroyInfo() {
  if (infoDiv) {
    infoDiv.remove();
    infoDiv = null;
  }
  if (infoComponent) infoComponent.stop();

  clearInterval(refreshId);
}

import { store, component } from "reefjs";
import * as log from "./log";

let infoDiv;
let refreshId;
let infoComponent;

export async function createInfo(room) {
  await room.whenConnected;

  if (infoDiv) return;

  // create info panel div
  infoDiv = document.createElement("div");
  infoDiv.className = "p5party_info";
  document.body.append(infoDiv);

  // setup UI with reef
  const data = store(room.info());

  function template() {
    const { appName, roomName, guestNames, isHost, isConnected } = data;
    const style = `
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
        .error {
          color: white;
          background: red;
          padding: 3px 6px;
        }
        button {
          display: block;
          margin-top: 6px;
          background: black;
          color: white;
          border: none;
          border-radius: 3px;
          padding: 3px 6px;
          cursor: pointer;
        }
        button:hover {
          background: #666;
        }
        button:active {
          background: #999;
        }
      </style>
    `;

    if (isConnected) {
      return (
        style +
        ` <div>${appName}</div>
          <div>${roomName}</div>
          <div>guests: ${guestNames.length}</div>
          <div>${isHost ? "hosting" : ""}</div>
          <button data-p5party="reload-others">reload others</button>
          <button data-p5party="disconnect-others">disconnect others</button>
        `
      );
    } else {
      return (
        style +
        ` <div class="error">disconnected</div>
        `
      );
    }
  }

  infoComponent = component(infoDiv, template);

  document.addEventListener("click", (event) => {
    let action = event.target.getAttribute("data-p5party");

    if (!action) return;
    if (action === "reload-others") {
      log.log("reload-others");
      room.emit("p5PartyEvent", {
        action: "reload-others",
        sender: room.info().guestName,
      });
    }
    if (action === "disconnect-others") {
      log.log("disconnect-others");
      room.emit("p5PartyEvent", {
        action: "disconnect-others",
        sender: room.info().guestName,
      });
    }
  });

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

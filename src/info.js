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
  const data = store({
    auto: sessionStorage.getItem("auto") === "true",
    ...room.info(),
  });

  function template() {
    const { /*auto,*/ appName, roomName, guestNames, isHost, isConnected } =
      data;
    const style = `
      <style>
        .p5party_info {
          position: fixed;
          right: 0;
          top: 0;
          padding: 10px;

          background: rgba(255,255,0,.1);
          
          font-family: 'Courier New', Courier, monospace;
          font-size: 18px;
        }

        .p5party_info .error {
          padding: 3px 6px;
          
          background: red;
          color: white;
        }

        .p5party_info button {
          display: block;
          margin-top: 6px;
          padding: 3px 6px;
          
          background: white;
          color: black;
          border: 1px solid black;
          border-radius: 3px;
          
          cursor: pointer;

          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
        }
        .p5party_info button:hover {
          background: #eee;
        }
        .p5party_info button:active {
          background: #ddd;
        }

        .p5party_info .checkbox {
          appearance: none;
          margin: 0;
          
          width: 1em;
          height: 1em;
          
          border: 1px solid black;
          border-radius: 3px;
          background: white;
          
          display: inline-grid;
          place-content: center;
        } 
        .p5party_info .checkbox::before {
          content: "";
          width: 0.65em;
          height: 0.65em;
          
          background: black;
          border-radius: 2px;
          
          transform: scale(0);
          transition: 120ms transform ease-in-out;
        }
        .p5party_info .checkbox:checked::before {
          transform: scale(1);
        }
        
        .p5party_info label {
          margin: 0;
          font-size: 14px;
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
        // <div>
        //   <input id="auto" class="checkbox" type="checkbox" data-p5party="auto" ${
        //     auto ? "checked" : ""
        //   }/>
        //   <label for="auto">auto</label>
        // </div>
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
    if (action === "auto") {
      log.log("auto", event.target.checked);
      sessionStorage.setItem("auto", String(event.target.checked));
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

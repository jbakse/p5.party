import { signal, component } from "reefjs";
import * as log from "./log";
import infoCss from "./info.css";

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
  const data = signal({
    auto: sessionStorage.getItem("auto") === "true",
    ...room.info(),
  });

  function template() {
    // experimental auto reload
    const { auto } = data;
    const { appName, roomName, guestNames, isHost, isConnected } = data;

    if (isConnected) {
      return `
        <style>${infoCss}</style>
        <div>${appName}</div>
        <div>${roomName}</div>
        <div>guests: ${guestNames.length}</div>
        <div>${isHost ? "hosting" : ""}</div>
        <button data-p5party="reload-others">reload others</button>
        <button data-p5party="disconnect-others">disconnect others</button>
      
        <!-- experimental auto reload -->
        <br/>
        Experimental:
        <div>
          <input id="auto" class="checkbox" type="checkbox" data-p5party="auto" ${
            auto ? "checked" : ""
          }/>
          <label for="auto">auto reload</label>
        </div>
        `;
    } else {
      return ` 
        <style>${infoCss}</style>
        <div class="error">disconnected</div>
        `;
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

    // experimental auto reload
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

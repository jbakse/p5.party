import Reef from "reefjs";
import * as log from "./log";

// eslint-disable-next-line
import css from "./InfoPanel.css";

const UPDATE_MS = 100;

export class InfoPanel {
  #client; // currently connected client
  #room; // current room
  #el; // the element used to display the info
  #reef; // reef component https://reefjs.com/
  constructor(client, room) {
    this.#client = client;
    this.#room = room;
    this.#el = createInfoPanelElement();

    this.#reef = new Reef(this.#el, {
      data: {},
      template,
      listeners: {
        logParticipant: (e) => {
          const participantShareds = this.#room._getParticipantSharedsObject();
          const shared = participantShareds[e.target.dataset.uid];
          log.debug(shared);
        },
        logShared: async (e) => {
          const name = e.target.dataset.name.split("/")[1];
          const record = this.#room.getRecord(name);
          const shared = record.getShared();
          await record.whenReady();
          log.debug(shared);
        },
      },
    });

    this.#room.whenReady(this.#startUpdates.bind(this));
  }

  toggle(show) {
    this.#el.classList.toggle("show", show);
  }

  #startUpdates() {
    setInterval(this.#update.bind(this), UPDATE_MS);
  }

  #update() {
    this.#reef.data = {
      onlineClientUids: this.#client.getOnlineClientUids(),
      myUid: this.#client.getUid(),
      ...this.#room._panelData(),
    };
  }
}

function createInfoPanelElement() {
  let el = document.getElementById("party-info");
  if (!el) {
    el = document.createElement("div");
    el.id = "party-info";
    document.body.appendChild(el);
  }
  return el;
}

function template(data) {
  const participantDivs = [];
  for (const uid of data.participantUids ?? []) {
    const shortName = uid.substr(-4);
    const me = data.myUid === uid ? "me" : "";
    const host = data.hostUid === uid ? "host" : "";
    const missing = data.onlineClientUids.includes(uid) ? "" : "missing";
    participantDivs.push(
      `<div class="participant ${host} ${missing} ${me}">
        <a onclick="logParticipant()" data-uid="${uid}">${shortName}</a>
      </div>`
    );
  }

  const sharedRecordDivs = [];
  for (const sharedRecordName of data.sharedRecordNames ?? []) {
    const shortName = sharedRecordName.split("/")[1];
    sharedRecordDivs.push(
      `<div  class="record">
        <a onclick="logShared()" data-name="${sharedRecordName}">${shortName}</a>
      </div>`
    );
  }

  const isHost = data.myUid === data.hostUid ? "host" : "";
  const myShortname = data.myUid.substr(-4);
  return `
          <div class="label">p5.party info</div>
          <div class="app">${data.appName}</div>
          <div class="room">${data.roomName}</div>
          <!-- <div class="id ${isHost}">${myShortname}</div> -->
          <div class="label">Participants</div>
          ${participantDivs.join("")}
          <div class="label">Shared Objects</div>
          ${sharedRecordDivs.join("")}
        `;
}

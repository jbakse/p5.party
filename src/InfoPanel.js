// eslint-disable-next-line
import css from "./InfoPanel.css";

const UPDATE_MS = 100;

export class InfoPanel {
  #client;
  #room;
  #el;

  constructor(client, room) {
    this.#client = client;
    this.#room = room;
    this.#el = createInfoPanelElement();

    this.#room.whenReady(this.#startUpdates.bind(this));
  }

  toggle(show) {
    this.#el.classList.toggle("show", show);
  }

  #startUpdates() {
    setInterval(this.#update.bind(this), UPDATE_MS);
  }

  #update() {
    // collect info
    const onlineClients = this.#client.getAllClients();
    const data = this.#room._panelData();
    const isHost = this.#room.getHostName() === this.#client.getUid();

    // generate output
    // const output = "";
    this.#el.innerHTML = "";

    const appendDiv = (content, ...classes) => {
      const el = document.createElement("div");
      const cleaned_classes = classes.filter((n) => n); // remove empty strings
      el.classList.add(...cleaned_classes);
      el.innerHTML = content;
      this.#el.appendChild(el);
      return el;
    };

    // header info
    appendDiv("p5.party info", "label");
    appendDiv(data.appName, "app");
    appendDiv(data.roomName, "room");
    const shortName = this.#client.getUid().substr(-4);
    const host = isHost ? "host" : "";
    appendDiv(shortName, "id", host);

    // participant info
    appendDiv("Participants", "label");
    for (const name of data.participantUids) {
      const shortName = name.substr(-4);
      const host = this.#room.getHostName() === name ? "host" : "";
      const missing = onlineClients.includes(name) ? "" : "missing";
      const me = this.#client.getUid() === name ? "me" : "";
      appendDiv(shortName, "participant", host, missing, me);
    }

    // shared objects
    appendDiv("Shared Objects", "label");
    for (const entry of data.recordDsList.getEntries()) {
      const name = entry.split("/")[1];
      appendDiv(`"${name}"`, "record");
    }

    // output += `<div class="label">#participantRecords</div>`;
    // // get keys from #participantRecords
    // const keys = Object.keys(data.participantRecords);
    // for (const key of keys) {
    //   output += `<div class="record">${key}</div>`;
    // }

    // this.#el.innerHTML = output;
  }
}

// add a child div to parent with provided classes and content

function createInfoPanelElement() {
  let el = document.getElementById("party-info");
  if (!el) {
    el = document.createElement("div");
    el.id = "party-info";
    document.body.appendChild(el);
  }
  return el;
}

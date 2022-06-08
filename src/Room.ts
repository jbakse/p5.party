import { DeepstreamClient } from "@deepstream/client";
// import { List as DSList } from "@deepstream/client/dist/src/record/list";

import * as log from "./log";
import { UserData, JSONValue, JSONObject, isEmpty } from "./validate";
import { isJSONValue } from "./validate";
import { Record } from "./Record";

// TODO: alias this through validate
import { SubscriptionCallback } from "@deepstream/client/dist/src/record/record";

// interface subscribeCallback {
//   (data: JSONValue): void;
// }

// export type subscribeCallback = (data: JSONValue) => void;

export class Room {
  readonly #ds: DeepstreamClient;
  readonly #roomId: string; // e.g. "app-room"
  readonly #guestName: string; // e.g. "app-room/client-uid"
  readonly #guestRecords: Map<string, Record>;
  readonly #guestShareds: JSONObject[];

  #myGuestRecord: Record; // record for this guest's shared object
  // #dsGuestRecordList: DSList | null; // names of guest records on the server
  #guestNames: string[];
  #hostName: string | undefined;

  constructor(host: string, appName: string, roomName: string) {
    this.#ds = new DeepstreamClient(host);
    this.#roomId = `${appName}-${roomName}`;
    this.#guestName = `${this.#roomId}/${this.#ds.getUid()}`;
    this.#guestRecords = new Map();
    this.#guestShareds = [];

    this.#myGuestRecord = new Record(this.#ds, this.#guestName);
    // this.#dsGuestRecordList = null;
    this.#guestNames = [];
    this.#hostName = undefined;

    // log.log("I am", this.#guestName);
  }

  async connect(): Promise<void> {
    if (this._isConnected()) return;

    // log in to deepstream server
    /* istanbul ignore next */ // error reporting
    this.#ds.on("error", (error: string, event: string, topic: string) =>
      log.error("ds error", error, event, topic)
    );

    this.#ds.presence.subscribe(this.#onPresence.bind(this));

    await this.#ds.login({ username: this.#guestName });

    // get room list and determine host
    await this.#updateGuestNames();

    // load guest record list
    // this.#dsGuestRecordList = this.#ds.record.getList(`${this.#roomId}/guests`);
    // this.#dsGuestRecordList.subscribe(this.#onDSGuestListChanged.bind(this));
    // await this.#dsGuestRecordList.whenReady();

    // add my guest record to list
    // this.#dsGuestRecordList.addEntry(this.#guestName);

    // get the guest records and update guestShareds
    this.#updateGuestShareds();

    // if host, do housekeeping
    // if (this.#hostName === this.#guestName) {
    //   await this.#deleteStaleGuestRecords();
    // }
  }

  _isConnected(): boolean {
    return this.#ds.getConnectionState() === "OPEN";
  }

  whenConnected(): Promise<void> {
    return new Promise((resolve) => {
      if (this._isConnected()) {
        resolve();
      } else {
        this.#ds.on("connectionStateChanged", () => {
          if (this._isConnected()) resolve();
        });
      }
    });
  }

  // at any given time any occupied room has exactly one host
  get hostName(): string | undefined {
    return this.#hostName;
  }

  // sorted list of connected guests in this room
  get _guestNames(): string[] {
    // return copy so that it can't be modified
    return [...this.#guestNames];
  }

  // get guestName(): string {
  //   return this.#guestName;
  // }

  isHost(): boolean {
    return this.#hostName === this.#guestName;
  }

  getRecord(name: string): Record {
    const r = new Record(this.#ds, `${this.#roomId}/${name}`);
    return r;
  }

  get myGuestRecord(): Record {
    return this.#myGuestRecord;
  }

  get guestShareds(): JSONObject[] {
    // return read only proxy of array
    // caller can still modify properties of the items
    return new Proxy(this.#guestShareds, {
      set() {
        log.error("The guestShared array is read-only.");
        // eat the value
        return true;
      },
    });
  }

  subscribe(event: string, cb: SubscriptionCallback): void {
    this.#ds.event.subscribe(`${this.#roomId}/${event}`, cb);
  }

  unsubscribe(event: string, cb?: SubscriptionCallback): void {
    // cb `as SubscriptionCallback` because cb CAN BE undefined
    this.#ds.event.unsubscribe(
      `${this.#roomId}/${event}`,
      cb as SubscriptionCallback
    );
  }

  emit(event: string, data?: UserData): void {
    if (data === undefined || isJSONValue(data, "emit-data")) {
      // data `as JSONValue` because data CAN BE undefined
      this.#ds.event.emit(`${this.#roomId}/${event}`, data as JSONValue);
    }
  }

  // note: disconnecting twice quickly throws.
  // i could keep a flag to see if disconnect has been called and only
  // allow it to be called once, but thats a little over defensive?
  disconnect() {
    // try {
    if (!this._isConnected()) return;
    this.#ds.close();
    // } catch (e) {
    // log.error("disconnect error", e);
    // }
  }

  // async #deleteStaleGuestRecords() {
  //   // deletes any guest records for any guests not currently in the room
  //   // even if called by host upon entering room, another guest
  //   // might have connected _immediately_ after host so we can't clear them
  //   // all without checking
  //   if (!this.#dsGuestRecordList) return;
  //   await this.#dsGuestRecordList.whenReady();

  //   const deleteRecord = async (name: string) => {
  //     // try {
  //     const r = this.#ds.record.getRecord(name);
  //     await r.whenReady();
  //     await r.delete();
  //     // } catch (e) {
  //     // log.error("deleteStaleGuestRecords error", e);
  //     // }
  //   };

  //   const getRecordNames = this.#dsGuestRecordList.getEntries();
  //   for (const guestRecordName of getRecordNames) {
  //     if (!this.#guestNames.includes(guestRecordName)) {
  //       // delete THEN remove from list
  //       console.log("deleting stale guest record", guestRecordName);
  //       await deleteRecord(guestRecordName);
  //       console.log("unlisting stale guest record", guestRecordName);
  //       this.#dsGuestRecordList.removeEntry(guestRecordName);
  //     }
  //   }
  // }

  // #onDSGuestListChanged(guestNames: string[]): void {
  //   void this.#updateGuestShareds();
  // }

  /**
   * clears #guestShares, adds shareds for current guests, install
   * watchers to remove/add shareds if they are empty/non-empty
   *
   */
  // ?: this code is pretty hard to read (and full of hacks now), maybe it woudl be clearer to keep an array of guest shareds including empty ones, and use on change to watch it and create a filtered version?
  #updateGuestShareds() {
    function installWatcher(this: Room, r: Record) {
      r.watchShared((data) => {
        // hack: if this Record is for the same server record, use the myGuestRecord shared instead, so identity checks on the client work. guests[0] === me
        let shared = r.shared;
        if (r.name === this.#myGuestRecord.name) {
          shared = this.#myGuestRecord.shared;
        }
        // remove shared if object is empty or record name not in guest shared
        if (isEmpty(data) || !this.#guestNames.includes(r.name)) {
          if (this.#guestShareds.includes(shared)) {
            this.#guestShareds.splice(this.#guestShareds.indexOf(shared), 1);
          }
        }
        // add if object is not empty and record name is in guest shared
        if (!isEmpty(data) && this.#guestNames.includes(r.name)) {
          if (!this.#guestShareds.includes(shared)) {
            this.#guestShareds.push(shared);
          }
        }
      }, true);
    }

    // add any missing records to guestRecords, start loading them
    for (const name of this.#guestNames) {
      if (this.#guestRecords.has(name)) continue;
      const r = new Record(this.#ds, name);
      this.#guestRecords.set(name, r);
      void r.load().then(installWatcher.bind(this, r));
    }

    // repopulate guestShareds
    this.#guestShareds.length = 0; // empty it
    for (const name of this.#guestNames) {
      const r = this.#guestRecords.get(name);
      r?.whenReady().then(() => {
        // hack: if this Record is for the same server record, use the myGuestRecord shared instead, so identity checks on the client work. guests[0] === me
        let shared = r.shared;
        if (r.name === this.#myGuestRecord.name) {
          shared = this.#myGuestRecord.shared;
        }
        if (!isEmpty(shared)) {
          if (!this.#guestShareds.includes(shared)) {
            this.#guestShareds.push(shared);
          }
        }
      }, undefined);
    }
  }

  #onPresence(username: string, isLoggedIn: boolean): void {
    if (!username.startsWith(`${this.#roomId}/`)) return; // not in this room
    if (isLoggedIn) {
      // add to #guestNames
      this.#guestNames.push(username);
      this.#guestNames.sort();
    } else {
      // remove from #guestNames
      this.#guestNames = this.#guestNames.filter(
        (guestName) => guestName !== username
      );
    }

    // update host
    this.#hostName = this.#guestNames[0];

    this.#updateGuestShareds();
  }

  async #updateGuestNames(): Promise<void> {
    const everyone = await this.#ds.presence.getAll();
    this.#guestNames = everyone
      .filter((guestName) => guestName.startsWith(`${this.#roomId}/`))
      .concat(this.#guestName)
      .sort();
    this.#hostName = this.#guestNames[0];
  }
}

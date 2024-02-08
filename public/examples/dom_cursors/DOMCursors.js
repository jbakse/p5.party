export default class DOMCursors {
  #hideCursor;
  #canvas;
  #guests;
  #me;
  #overCanvas;
  #cursors;

  constructor(hideCursor = false, canvas) {
    this.#hideCursor = hideCursor;
    this.#canvas = canvas ?? document.querySelector(".p5Canvas");
    this.#guests = partyLoadGuestShareds();
    this.#me = partyLoadMyShared(undefined, this.start.bind(this));
    this.#overCanvas = false;
    if (this.#hideCursor) this.#canvas.style.cursor = "none";
  }

  start() {
    // initialize my cursor
    this.#me.dom_cursors = {
      id: randomInt().toString(16), // random hex id
      mouse_x: -10000,
      mouse_y: 0,
      mouse_down: false,
      color: takeColor(this.#guests),
    };

    // stores the cursor elements
    this.#cursors = {};

    // add event listeners
    document.addEventListener("mousemove", this.onMouseMove.bind(this));
    document.addEventListener("mousedown", this.onMouseDown.bind(this));
    document.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.#canvas.addEventListener("mouseenter", this.onEnterCanvas.bind(this));
    this.#canvas.addEventListener("mouseleave", this.onLeaveCanvas.bind(this));

    // use animate to poll guests and update cursors
    // if p5party had a partyWatchGuests() function, we might use that instead?
    this.animate = this.animate.bind(this);
    this.animate();
  }

  onMouseMove(e) {
    // get the mouse position relative to the canvas
    this.#me.dom_cursors.mouse_x =
      e.clientX - this.#canvas.getBoundingClientRect().x;
    this.#me.dom_cursors.mouse_y =
      e.clientY - this.#canvas.getBoundingClientRect().y;
  }
  onMouseDown(e) {
    this.#me.dom_cursors.mouse_down = true;
  }
  onMouseUp(e) {
    this.#me.dom_cursors.mouse_down = false;
  }
  onEnterCanvas(e) {
    this.#overCanvas = true;
  }
  onLeaveCanvas(e) {
    this.#overCanvas = false;
  }

  animate(t) {
    // request next frame
    requestAnimationFrame(this.animate);

    // loop through the guests
    this.#guests.forEach((guest) => {
      // make sure this guest has a dom_cursors object
      if (!guest.dom_cursors) return;

      // if guest doesn't have a corresponding cursor element, create one
      if (!this.#cursors[guest.dom_cursors.id]) {
        const e = createCursorElement();
        document.body.appendChild(e);
        this.#cursors[guest.dom_cursors.id] = { e };
      }

      // update cursor position
      const cursor = this.#cursors[guest.dom_cursors.id];

      // pos + relative to canvas + adjust hot spot
      const x =
        guest.dom_cursors.mouse_x + this.#canvas.getBoundingClientRect().x - 8;

      const y =
        guest.dom_cursors.mouse_y + this.#canvas.getBoundingClientRect().y - 8;

      // set cursor element position with transform()
      // https://web.dev/articles/animations-guide

      cursor.e.style.transform = `translate(${x}px, ${y}px)`;

      // hide show this users cursor as needed
      if (guest === this.#me) {
        if (this.#hideCursor && this.#overCanvas) {
          cursor.e.style.display = "block";
        } else {
          cursor.e.style.display = "none";
        }
      }

      // show the spark if the mouse is down
      const burst = cursor.e.querySelector("#burst");
      if (guest.dom_cursors.mouse_down) {
        burst.style.stroke = guest.dom_cursors.color;
      } else {
        burst.style.stroke = "none";
      }

      // update the cursor color
      const base = cursor.e.querySelector("#cursor");
      base.style.fill = "black";
      base.style.stroke = guest.dom_cursors.color;
    });

    // remove cursors that don't have a guest
    Object.keys(this.#cursors).forEach((id) => {
      if (!this.#guests.find((guest) => guest.dom_cursors.id === id)) {
        this.#cursors[id].e.remove();
        delete this.#cursors[id];
      }
    });
  }
}

function randomInt(min = 0, max = Number.MAX_SAFE_INTEGER) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createCursorElement() {
  const e = document.createElement("div");
  e.classList.add("cursor");
  e.style.pointerEvents = "none";
  e.style.willChange = "transform";
  e.style.position = "fixed";
  e.style.top = "0";
  e.style.left = "0";
  e.style.width = "24px";
  e.style.height = "24px";
  e.innerHTML = cursor_svg;
  const base = e.querySelector("#cursor");
  base.style.filter = "drop-shadow(1px 1px 2px rgba(0,0,0,0.5)";
  return e;
}

// Takes an array of guests and returns the least used color among them.

function takeColor(guests) {
  // get all the colors taken by guests
  const takenColors = guests.map((g) => g.dom_cursors?.color || "none");

  // count the number of times each color is taken
  const colorCounts = colors.map((c) => {
    return {
      color: c,
      count: takenColors.filter((tc) => tc === c).length,
    };
  });

  // sort the colors by count
  colorCounts.sort((a, b) => a.count - b.count);

  // take the least used color
  return colorCounts[0].color;
}

const colors = [
  "#ffbbbb",
  "#ffffbb",
  "#bbffbb",
  "#bbffff",
  "#bbbbff",
  "#ffbbff",
];

const cursor_svg = `
  <svg width="100%" height="100%" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
      <path id="cursor" d="M9.668,10.755C9.55,10.445 9.625,10.094 9.86,9.86C10.094,9.625 10.445,9.55 10.755,9.668C14.542,11.111 23.48,14.516 27.708,16.127C28.042,16.254 28.257,16.579 28.244,16.936C28.232,17.293 27.993,17.602 27.651,17.705C24.695,18.592 20,20 20,20C20,20 18.592,24.695 17.705,27.651C17.602,27.993 17.293,28.232 16.936,28.244C16.579,28.257 16.254,28.042 16.127,27.708C14.516,23.48 11.111,14.542 9.668,10.755Z" style="fill:rgb(229,242,13);stroke:black;stroke-width:1.46px;"/>
      <g id="burst">
          <path d="M11,7L14,4" style="fill:none;stroke-width:1.46px;"/>
          <g transform="matrix(1,0,0,1,-7,7)">
              <path d="M11,7L14,4" style="fill:none;stroke-width:1.46px;"/>
          </g>
          <path d="M7,7L4,4" style="fill:none;stroke-width:1.46px;"/>
          <g transform="matrix(0.707107,0.707107,-0.707107,0.707107,9,-3.89949)">
              <path d="M7,7L4,4" style="fill:none;stroke-width:1.46px;"/>
          </g>
          <g transform="matrix(0.707107,-0.707107,0.707107,0.707107,-3.89949,9)">
              <path d="M7,7L4,4" style="fill:none;stroke-width:1.46px;"/>
          </g>
      </g>
  </svg>
  `;

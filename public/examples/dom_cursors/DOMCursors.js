// TODO doesn't work if the client is scrolled!

export default class DOMCursors {
  constructor(canvas, guests, me) {
    // get the canvas
    this.canvas = canvas;
    this.guests = guests;
    this.me = me;

    // initialize my cursor
    this.me.dom_cursors = {
      id: randomInt().toString(),
      mouse_x: 0,
      mouse_y: 0,
      mouse_down: false,
      color: takeColor(guests),
    };

    // stores the cursor elements
    this.cursors = {};

    document.addEventListener("mousemove", this.onMouseMove.bind(this));
    document.addEventListener("mousedown", this.onMouseDown.bind(this));
    document.addEventListener("mouseup", this.onMouseUp.bind(this));

    this.animate = this.animate.bind(this);
    this.animate();
  }

  onMouseMove(e) {
    // get the mouse position relative to the canvas
    const x = e.clientX - this.canvas.position().x + window.scrollX;
    const y = e.clientY - this.canvas.position().y + window.scrollY;
    this.me.dom_cursors.mouse_x = x;
    this.me.dom_cursors.mouse_y = y;
  }
  onMouseDown(e) {
    this.me.dom_cursors.mouse_down = true;
  }
  onMouseUp(e) {
    this.me.dom_cursors.mouse_down = false;
  }

  animate(t) {
    // request next frame
    requestAnimationFrame(this.animate);
    this.guests.forEach((guest) => {
      if (guest === this.me) return;
      if (!guest.dom_cursors) return;
      // if guest doesn't have a cursor, create one
      if (!this.cursors[guest.dom_cursors.id]) {
        const e = createCursorElement();
        document.body.appendChild(e);
        this.cursors[guest.dom_cursors.id] = { e };
      }

      // update cursor position
      const cursor = this.cursors[guest.dom_cursors.id];
      cursor.e.style.left =
        guest.dom_cursors.mouse_x + this.canvas.position().x - 10 + "px";
      cursor.e.style.top =
        guest.dom_cursors.mouse_y + this.canvas.position().y - 10 + "px";

      // show the burst if the mouse is down
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
    Object.keys(this.cursors).forEach((id) => {
      if (!this.guests.find((guest) => guest.dom_cursors.id === id)) {
        this.cursors[id].e.remove();
        delete this.cursors[id];
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
  e.style.position = "absolute";
  e.style.width = "24px";
  e.style.height = "24px";
  e.innerHTML = cursor_svg;
  const base = e.querySelector("#cursor");
  base.style.filter = "drop-shadow(1px 1px 2px rgba(0,0,0,0.5)";
  return e;
}

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

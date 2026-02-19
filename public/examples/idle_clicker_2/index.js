import DOMCursors from "../dom_cursors/DOMCursors.js";

let me, guests;

const particles = [];

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dX = random(-10, 10);
    this.dY = -10;
    this.size = random(10, 20);
    this.color = color(random(255), random(255), random(255));
  }
  update() {
    this.x += this.dX;
    this.y += this.dY;

    this.dY += 1;
  }
  draw() {
    push();
    fill(this.color);
    ellipse(this.x, this.y, this.size);
    pop();
  }
}

window.preload = () => {
  partyConnect("wss://demoserver.p5party.org", "idle_clicker");
  guests = partyLoadGuestShareds();
  me = partyLoadMyShared({ score: 0, name: pick(names) });

  partySubscribe("makeParticle", onMakeParticle);
};

const onMakeParticle = (data) => {
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
  particles.push(new Particle(data.x, data.y));
};

window.setup = () => {
  createCanvas(400, 400);
  new DOMCursors(true);
};
window.draw = () => {
  background(220, 200, 200);
  textSize(28);
  let total = 0;
  for (let i = 0; i < guests.length; i++) {
    text(guests[i].name + " " + guests[i].score, 10, i * 32 + 96);
    total += guests[i].score;
  }
  text("Total " + total, 10, 32);

  for (const p of particles) {
    p.update();
    p.draw();
  }
};

window.mouseClicked = () => {
  me.score++;

  partyEmit("makeParticle", {
    x: mouseX,
    y: mouseY,
  });
};

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const names = [
  "Cookie",
  "Potato",
  "Lemon",
  "Plant",
  "Candy",
  "Cow",
  "Capitalist",
  "Hero",
  "Paperclip",
  "Forage",
  "Trimp",
  "Room",
];

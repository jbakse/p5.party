const particles = [];

export function explodeParticles(
  amount,
  x,
  y,
  dX = 0,
  dY = 0,
  speed = 1,
  life = 50
) {
  repeat(amount, () => {
    const a = random(0, 2 * PI);
    const s = speed * random(0.75, 1.25);
    spawnParticle({
      x,
      y,
      dX: dX + sin(a) * s,
      dY: dY + cos(a) * s,
      life: life * lowRandom(0.25, 1),
    });
  });
}

export function updateParticles() {
  for (const p of particles) {
    if (p.life <= 0) continue;
    p.x += p.dX;
    p.y += p.dY;
    p.life--;
  }
}

export function drawParticles() {
  push();
  noStroke();
  fill("white");
  for (const p of particles) {
    if (p.life <= 0) continue;
    const size = map(p.life, 10, 0, 4, 0, true);
    ellipse(p.x, p.y, size);
  }
  pop();
}

function initParticles() {
  for (let i = 0; i < 1000; i++) {
    particles.push({
      life: 0,
    });
  }
}
initParticles();

function spawnParticle(overrides) {
  const particle = particles.find((p) => p.life <= 0);
  if (!particle) return;
  Object.assign(
    particle,
    {
      life: 100,
      x: 0,
      y: 0,
      dX: random(-1, 1),
      dY: random(-1, 1),
    },
    overrides
  );
}

function repeat(t, f) {
  const a = [];
  for (let i = 0; i < t; i++) {
    a.push(f(i));
  }
  return a;
}

function lowRandom(min, max) {
  return Math.min(
    random(min, max),
    random(min, max),
    random(min, max),
    random(min, max)
  );
}

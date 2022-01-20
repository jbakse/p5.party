export class Rect {
  constructor(l = 0, t = 0, w = 0, h = 0) {
    this.l = l;
    this.t = t;
    this.w = w;
    this.h = h;
  }
}

export class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

export function pointInRect(p, r) {
  return p.x > r.l && p.x < r.l + r.w && p.y > r.t && p.y < r.t + r.h;
}

export function intersects(r1, r2) {
  r1.b = r1.t + r1.h;
  r1.r = r1.l + r1.w;
  r2.b = r2.t + r2.h;
  r2.r = r2.l + r2.w;

  return r1.l < r2.r && r1.r > r2.l && r1.t < r2.b && r1.b > r2.t;
}

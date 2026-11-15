// 404 easter egg. The wide logo is already placed by home.css. This reads that
// box and flies the same image from it. The rigid body is the one in
// "Throwable logo.html": rectangle corners against the window, restitution 0.8,
// the same damping and the same floor that keeps it moving.
// A reduced-motion preference leaves the logo where it was placed.

export function throwLogo(el) {
  if (!el || el.dataset.thrown === "1") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const start = () => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return false;
    el.dataset.thrown = "1";
    fly(el, rect);
    return true;
  };

  let tries = 0;
  const wait = () => {
    if (start()) return;
    if (++tries > 120) return;
    requestAnimationFrame(wait);
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(wait));
  } else {
    requestAnimationFrame(wait);
  }
}

function fly(el, rect) {
  const placedW = rect.width;
  const placedH = rect.height;
  let W = window.innerWidth;
  let H = window.innerHeight;
  let Wd = placedW;
  let Hd = placedH;
  let I = (Wd * Wd + Hd * Hd) / 12;
  let x = rect.left + placedW / 2;
  let y = rect.top + placedH / 2;
  let vx = 380;
  let vy = 260;
  let ang = 0;
  let w = 1.2;
  let drag = false;
  let gx = 0;
  let gy = 0;
  let pid = null;
  let last = 0;
  let lx = 0;
  let ly = 0;
  let sx = 0;
  let sy = 0;
  let running = true;
  let t0 = 0;

  el.alt = "Enterprise-R";
  el.draggable = false;
  el.classList.add("is-thrown");

  function fit() {
    W = window.innerWidth;
    H = window.innerHeight;
    const maxW = Math.max(32, W - 8);
    const maxH = Math.max(32, H - 8);
    const scale = Math.min(1, maxW / placedW, maxH / placedH);
    Wd = placedW * scale;
    Hd = placedH * scale;
    I = (Wd * Wd + Hd * Hd) / 12;
    el.style.width = Wd + "px";
    el.style.height = Hd + "px";
    x = Math.min(Math.max(x, Wd / 2), W - Wd / 2);
    y = Math.min(Math.max(y, Hd / 2), H - Hd / 2);
  }

  function paint() {
    el.style.transform = "translate(" + (x - Wd / 2) + "px," + (y - Hd / 2) + "px) rotate(" + ang + "rad)";
  }

  function corners() {
    const hw = Wd / 2;
    const hh = Hd / 2;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map((p) => [p[0] * c - p[1] * s, p[0] * s + p[1] * c]);
  }

  // Inward normal, and how far a corner offset (px, py) sits past that wall.
  const walls = [
    { nx: 1, ny: 0, pen: (px) => -(x + px) },
    { nx: -1, ny: 0, pen: (px) => (x + px) - W },
    { nx: 0, ny: 1, pen: (_px, py) => -(y + py) },
    { nx: 0, ny: -1, pen: (_px, py) => (y + py) - H },
  ];

  function collide(bounce) {
    for (let it = 0; it < 2; it++) {
      for (let i = 0; i < 4; i++) {
        const wl = walls[i];
        const cs = corners();
        let best = -1;
        let bp = 0;
        for (let k = 0; k < 4; k++) {
          const p = wl.pen(cs[k][0], cs[k][1]);
          if (p > bp) {
            bp = p;
            best = k;
          }
        }
        if (best < 0) continue;
        x += wl.nx * bp;
        y += wl.ny * bp;
        if (!bounce) continue;
        const rx = cs[best][0];
        const ry = cs[best][1];
        const vcx = vx - w * ry;
        const vcy = vy + w * rx;
        const vn = vcx * wl.nx + vcy * wl.ny;
        if (vn < 0) {
          const rn = rx * wl.ny - ry * wl.nx;
          const j = -(1.8) * vn / (1 + rn * rn / I);
          vx += j * wl.nx;
          vy += j * wl.ny;
          w += rn * j / I;
        }
      }
    }
    w = Math.max(-25, Math.min(25, w));
  }

  function onDown(e) {
    drag = true;
    pid = e.pointerId;
    el.setPointerCapture(pid);
    el.classList.add("is-grab");
    const dx = e.clientX - x;
    const dy = e.clientY - y;
    const c = Math.cos(-ang);
    const s = Math.sin(-ang);
    gx = dx * c - dy * s;
    gy = dx * s + dy * c;
    sx = sy = 0;
    w = 0;
    vx = vy = 0;
    lx = e.clientX;
    ly = e.clientY;
    last = performance.now();
    e.preventDefault();
  }

  function onMove(e) {
    if (!drag || e.pointerId !== pid) return;
    const now = performance.now();
    const dt = Math.max((now - last) / 1000, 0.001);
    sx += ((e.clientX - lx) / dt - sx) * 0.35;
    sy += ((e.clientY - ly) / dt - sy) * 0.35;
    lx = e.clientX;
    ly = e.clientY;
    last = now;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    const ox = gx * c - gy * s;
    const oy = gx * s + gy * c;
    x = e.clientX - ox;
    y = e.clientY - oy;
    const tq = (ox * sy - oy * sx) / ((Wd * Wd + Hd * Hd) / 4);
    w += (Math.max(-14, Math.min(14, tq)) - w) * 0.2;
    collide(false);
  }

  function end(e) {
    if (!drag || (e && e.pointerId !== pid)) return;
    drag = false;
    el.classList.remove("is-grab");
    if (performance.now() - last > 90) sx = sy = 0;
    vx = sx;
    vy = sy;
    const m = Math.hypot(vx, vy);
    const cap = 3200;
    if (m > cap) {
      vx *= cap / m;
      vy *= cap / m;
    }
  }

  function frame(t) {
    if (!running) return;
    const dt = Math.min((t - t0) / 1000, 0.034);
    t0 = t;
    if (!drag) {
      x += vx * dt;
      y += vy * dt;
      ang += w * dt;
      collide(true);
      const f = Math.pow(0.55, dt);
      vx *= f;
      vy *= f;
      w *= Math.pow(0.55, dt);
      const sp = Math.hypot(vx, vy);
      if (sp < 140) {
        if (sp < 1) {
          vx = 140;
          vy = 100;
        } else {
          const g = 1 + (140 / sp - 1) * dt * 1.5;
          vx *= g;
          vy *= g;
        }
      }
      if (Math.abs(w) < 0.4) w += (w < 0 ? -1 : 1) * dt * 0.8;
    } else {
      ang += w * dt;
      sx *= Math.pow(0.2, dt);
      sy *= Math.pow(0.2, dt);
      w *= Math.pow(0.6, dt);
      collide(false);
    }
    paint();
    requestAnimationFrame(frame);
  }

  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
  window.addEventListener("resize", () => {
    fit();
    paint();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
      return;
    }
    if (running) return;
    running = true;
    t0 = 0;
    requestAnimationFrame((t) => {
      t0 = t;
      frame(t);
    });
  });

  fit();
  // fit() clamps toward the window. Put the centre back on the placed box
  // when that box already fits, so the launch starts where the logo was.
  if (Wd === placedW && Hd === placedH) {
    x = rect.left + placedW / 2;
    y = rect.top + placedH / 2;
  }
  paint();
  requestAnimationFrame((t) => {
    t0 = t;
    frame(t);
  });
}

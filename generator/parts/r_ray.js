  function ray(clientX, clientY) {
    const r = canvas.getBoundingClientRect(), nx = (clientX - r.left) / r.width * 2 - 1, ny = 1 - (clientY - r.top) / r.height * 2;
    const inv = M.inv(VP), p0 = M.apply(inv, [nx, ny, -1], 1), w0 = inv[3] * nx + inv[7] * ny - inv[11] + inv[15];
    const p1 = M.apply(inv, [nx, ny, 1], 1), w1 = inv[3] * nx + inv[7] * ny + inv[11] + inv[15];
    const o = p0.map(v => v / w0), f = p1.map(v => v / w1), d = f.map((v, i) => v - o[i]), l = Math.hypot(...d);
    return { o, d: d.map(v => v / l) };
  }
  function hitBox(rq, b) {
    let t0 = -1e9, t1 = 1e9;
    for (let k = 0; k < 3; k++) {
      if (Math.abs(rq.d[k]) < 1e-9) { if (rq.o[k] < b.min[k] || rq.o[k] > b.max[k]) return null; continue; }
      let a = (b.min[k] - rq.o[k]) / rq.d[k], c = (b.max[k] - rq.o[k]) / rq.d[k]; if (a > c) [a, c] = [c, a];
      t0 = Math.max(t0, a); t1 = Math.min(t1, c); if (t0 > t1) return null;
    }
    return t0;
  }

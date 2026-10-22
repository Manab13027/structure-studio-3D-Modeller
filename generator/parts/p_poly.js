  // ================================================================ floor-plan polygons
  // ---- floor plan: a polygon of corners (counter-clockwise), walls run between consecutive corners
  function polyArea(P) { let a = 0; for (let i = 0; i < P.length; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length]; a += x1 * y2 - x2 * y1; } return a / 2; }
  function wallSegs(room) {
    const P = room.pts, n = P.length;
    return P.map((a, i) => { const b = P[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-6;
      return { i, a, b, L, ux: dx / L, uy: dy / L, nx: -dy / L, ny: dx / L, rz: Math.atan2(-dy, -dx) / D2R, dir: Math.atan2(dy, dx) / D2R }; });
  }
  function segsCross(P) {   // true if any two non-adjacent walls intersect (invalid floor plan)
    const n = P.length, cr = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue;
      const a = P[i], b = P[(i + 1) % n], c = P[j], d = P[(j + 1) % n];
      if (cr(a, b, c) * cr(a, b, d) < 0 && cr(c, d, a) * cr(c, d, b) < 0) return true;
    }
    return false;
  }
  function triangulate(P) {
    const idx = P.map((_, i) => i), out = [], cr = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const inside = (p, a, b, c) => cr(a, b, p) >= -1e-9 && cr(b, c, p) >= -1e-9 && cr(c, a, p) >= -1e-9;
    let guard = 0;
    while (idx.length > 3 && guard++ < 2000) {
      let cut = false;
      for (let i = 0; i < idx.length; i++) {
        const ia = idx[(i + idx.length - 1) % idx.length], ib = idx[i], ic = idx[(i + 1) % idx.length], a = P[ia], b = P[ib], c = P[ic];
        if (cr(a, b, c) <= 1e-9) continue;
        if (idx.some(j => j !== ia && j !== ib && j !== ic && inside(P[j], a, b, c))) continue;
        out.push(ia, ib, ic); idx.splice(i, 1); cut = true; break;
      }
      if (!cut) break;
    }
    if (idx.length === 3) out.push(...idx);
    return out;
  }
  function offsetPoly(P, d) {
    const n = P.length, S = wallSegs({ pts: P });
    return P.map((p, i) => { const n1 = S[(i + n - 1) % n], n2 = S[i]; let mx = -(n1.nx + n2.nx), my = -(n1.ny + n2.ny); const l = Math.hypot(mx, my) || 1; mx /= l; my /= l;
      const k = Math.min(3, d / Math.max(0.3, mx * -n1.nx + my * -n1.ny)); return [p[0] + mx * k, p[1] + my * k]; });
  }
  function insidePoly(x, y, P) {
    let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c;
  }

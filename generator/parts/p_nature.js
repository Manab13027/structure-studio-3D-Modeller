  // ================================================================ realistic vegetation: painted leaf cards (cut-out), branching trunks, bark
  // Leaf textures are drawn once on a canvas (PNG with transparency). Trees are built like game-engine foliage:
  // a tapered trunk and branches, then dozens of leaf cards clustered around the branch tips.
  const LEAF_KINDS = ["leaf_oak", "leaf_birch", "leaf_shrub", "leaf_flower", "leaf_needle", "leaf_frond", "leaf_monstera", "leaf_fig", "leaf_grass", "leaf_bed", "leaf_maple"];
  for (const k of LEAF_KINDS) BASE_MATS[k] = { color: [1, 1, 1], rough: 1.0, tex: k, cut: true, two: true, fol: true };
  Object.assign(FIN, {
    bark: { label: "Bark", kind: "misc", tile: 1.2, rough: 0.95 }, bark_birch: { label: "Birch bark", kind: "misc", tile: 1.0, rough: 0.8 },
    palm_bark: { label: "Palm trunk", kind: "misc", tile: 0.9, rough: 0.95 }, hedge_leaf: { label: "Hedge leaves", kind: "misc", tile: 1.2, rough: 0.95 }
  });
  const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
  function leafPath(x, cx, cy, len, wid, ang, shape = 0.5) {   // pointed leaf, base at (cx,cy), pointing along ang
    x.save(); x.translate(cx, cy); x.rotate(ang); x.beginPath(); x.moveTo(0, 0);
    x.quadraticCurveTo(len * shape, -wid, len, 0); x.quadraticCurveTo(len * shape, wid, 0, 0); x.restore();
  }
  function paintLeaves(x, S, r, o) {   // a clump of small leaves on twigs
    const { n, hue, sat, lit, size, rad = 0.46, cx = S / 2, cy = S / 2, twig = true, round = 0.5 } = o;
    if (twig) { x.strokeStyle = "rgba(70,50,30,.9)"; x.lineCap = "round"; for (let i = 0; i < 9; i++) { const a = r() * 6.28; x.lineWidth = 2 + r() * 3; x.beginPath(); x.moveTo(cx, cy); x.quadraticCurveTo(cx + Math.cos(a + 0.4) * S * 0.2, cy + Math.sin(a + 0.4) * S * 0.2, cx + Math.cos(a) * S * rad * 0.9, cy + Math.sin(a) * S * rad * 0.9); x.stroke(); } }
    for (let i = 0; i < n; i++) {
      const a = r() * 6.28, d = Math.sqrt(r()) * S * rad, px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d * 0.95;
      const top = 1 - py / S, l = lit + (r() - 0.5) * 14 + top * 10 - (d / (S * rad)) * 4;
      const len = size * (0.7 + r() * 0.6);
      leafPath(x, px, py, len, len * round * 0.55, r() * 6.28, 0.45);
      x.fillStyle = hsl(hue + (r() - 0.5) * 18, sat + (r() - 0.5) * 12, Math.max(8, l)); x.fill();
      if (len > 14) { x.strokeStyle = hsl(hue, sat - 10, Math.max(8, l - 9), 0.6); x.lineWidth = 1; x.stroke(); }
    }
  }
  function drawLeafTex(key) {
    const S = 512, c = document.createElement("canvas"); c.width = c.height = S; const x = c.getContext("2d"), r = rng(hashOf(key) + 3);
    switch (key) {
      case "leaf_oak": paintLeaves(x, S, r, { n: 1100, hue: 95, sat: 40, lit: 25, size: 34, rad: 0.47 }); break;
      case "leaf_maple": paintLeaves(x, S, r, { n: 950, hue: 26, sat: 64, lit: 38, size: 34, round: 0.8, rad: 0.47 }); break;
      case "leaf_birch": paintLeaves(x, S, r, { n: 1300, hue: 80, sat: 46, lit: 34, size: 25, round: 0.75, rad: 0.47 }); break;
      case "leaf_shrub": paintLeaves(x, S, r, { n: 1500, hue: 102, sat: 38, lit: 23, size: 19, round: 0.6 }); break;
      case "leaf_flower": paintLeaves(x, S, r, { n: 1300, hue: 100, sat: 40, lit: 24, size: 19 });
        for (let i = 0; i < 70; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * S * 0.42, px = S / 2 + Math.cos(a) * d, py = S / 2 + Math.sin(a) * d, col = [[330, 70, 70], [350, 75, 55], [48, 90, 62], [0, 0, 96]][Math.floor(r() * 4)];
          for (let p = 0; p < 5; p++) { x.fillStyle = hsl(col[0], col[1], col[2] + (r() - 0.5) * 10); x.beginPath(); x.arc(px + Math.cos(p * 1.256) * 5, py + Math.sin(p * 1.256) * 5, 4.5, 0, 7); x.fill(); }
          x.fillStyle = "#e8c23a"; x.beginPath(); x.arc(px, py, 2.6, 0, 7); x.fill(); } break;
      case "leaf_needle": {   // fir spray: stem along the card (v = trunk -> tip), needles either side
        const stem = (x0, y0, x1, y1, w, depth) => {
          x.strokeStyle = "rgba(60,45,30,1)"; x.lineWidth = w; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
          const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L;
          for (let t = 0; t < L; t += 2) { const px = x0 + ux * t, py = y0 + uy * t, nl = (22 - depth * 4) * (1 - t / L * 0.45);
            for (const sd of [-1, 1]) { const a = Math.atan2(uy, ux) + sd * (0.9 + r() * 0.3); x.strokeStyle = hsl(135 + r() * 25, 30 + r() * 12, 15 + r() * 15); x.lineWidth = 2.6;
              x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * nl, py + Math.sin(a) * nl); x.stroke(); } }
          if (depth < 2) for (let t = L * 0.08; t < L * 0.9; t += L / (depth ? 6 : 11)) { const px = x0 + ux * t, py = y0 + uy * t, side = (Math.round(t / 3) % 2 ? 1 : -1), a = Math.atan2(uy, ux) + side * (0.75 + r() * 0.2), bl = Math.min(S * 0.42, (L - t) * 0.65);
            stem(px, py, px + Math.cos(a) * bl, py + Math.sin(a) * bl, w * 0.6, depth + 1); }
        };
        stem(S / 2, S - 4, S / 2, 8, 6, 0); break; }
      case "leaf_frond": {   // palm frond: midrib up the card, long leaflets either side
        x.strokeStyle = "#6b7a3a"; x.lineWidth = 6; x.beginPath(); x.moveTo(S / 2, S); x.lineTo(S / 2, 4); x.stroke();
        for (let t = 20; t < S - 6; t += 7) { const k = 1 - t / S, len = (40 + 190 * Math.sin(Math.PI * Math.min(1, (S - t) / S * 1.05))) * (0.85 + r() * 0.3);
          for (const sd of [-1, 1]) { leafPath(x, S / 2, S - t, len, 5 + 3 * k, sd > 0 ? -0.55 - k * 0.3 : Math.PI + 0.55 + k * 0.3, 0.4); x.fillStyle = hsl(85 + r() * 15, 45, 26 + r() * 12); x.fill(); } } break; }
      case "leaf_monstera": {   // one big split leaf, base at bottom centre
        x.translate(S / 2, S - 6); x.fillStyle = hsl(130, 55, 20); x.beginPath(); x.moveTo(0, 0);
        x.bezierCurveTo(-250, -60, -250, -420, 0, -500); x.bezierCurveTo(250, -420, 250, -60, 0, 0); x.fill();
        x.globalCompositeOperation = "destination-out"; for (let i = 0; i < 7; i++) for (const sd of [-1, 1]) { const t = 80 + i * 55; x.beginPath(); x.moveTo(sd * 30, -t); x.lineTo(sd * 260, -t - 40 + i * 6); x.lineTo(sd * 260, -t - 22 + i * 6); x.closePath(); x.fill();
          if (i % 2) { x.beginPath(); x.ellipse(sd * 70, -t - 15, 12, 7, 0.3 * sd, 0, 7); x.fill(); } }
        x.globalCompositeOperation = "source-over"; const g = x.createLinearGradient(-200, -500, 200, 0); g.addColorStop(0, "rgba(255,255,255,.16)"); g.addColorStop(1, "rgba(0,0,0,.15)");
        x.globalCompositeOperation = "source-atop"; x.fillStyle = g; x.fillRect(-256, -512, 512, 512); x.strokeStyle = hsl(110, 40, 40); x.lineWidth = 4; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -480); x.stroke(); break; }
      case "leaf_fig": {
        x.translate(S / 2, S - 6); x.fillStyle = hsl(118, 50, 22); x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(-120, -40, -60, -200, -190, -330); x.bezierCurveTo(-260, -470, 120, -540, 200, -380);
        x.bezierCurveTo(250, -280, 80, -150, 0, 0); x.fill(); x.globalCompositeOperation = "source-atop"; x.strokeStyle = hsl(90, 35, 42); x.lineWidth = 3; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-10, -250, 10, -460); x.stroke();
        x.lineWidth = 1.5; for (let i = 1; i < 9; i++) for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(0, -i * 50); x.lineTo(sd * 140, -i * 50 - 60); x.stroke(); } break; }
      case "leaf_grass": case "leaf_bed": {
        for (let i = 0; i < (key === "leaf_bed" ? 160 : 230); i++) { const bx = S * (0.1 + r() * 0.8), h = S * (key === "leaf_bed" ? 0.35 + r() * 0.3 : 0.55 + r() * 0.42), lean = (r() - 0.5) * 160;
          x.strokeStyle = key === "leaf_grass" ? hsl(60 + r() * 40, 35 + r() * 15, 30 + r() * 25) : hsl(105 + r() * 20, 45, 20 + r() * 14); x.lineWidth = 2 + r() * 3; x.lineCap = "round";
          x.beginPath(); x.moveTo(bx, S); x.quadraticCurveTo(bx + lean * 0.2, S - h * 0.6, bx + lean, S - h); x.stroke(); }
        if (key === "leaf_bed") for (let i = 0; i < 46; i++) { const px = S * (0.08 + r() * 0.84), py = S * (0.3 + r() * 0.35), col = [[330, 70, 65], [280, 45, 60], [45, 92, 58], [5, 75, 55], [0, 0, 95]][i % 5];
          for (let p = 0; p < 6; p++) { x.fillStyle = hsl(col[0], col[1], col[2]); x.beginPath(); x.arc(px + Math.cos(p) * 7, py + Math.sin(p) * 7, 6.5, 0, 7); x.fill(); } x.fillStyle = "#d9b13a"; x.beginPath(); x.arc(px, py, 4, 0, 7); x.fill(); }
        break; }
    }
    // keep a copy whose transparent pixels carry the average leaf colour, so far-away (mip-mapped) leaves stay green
    const id = x.getImageData(0, 0, S, S), d = id.data; let R = 0, G = 0, B = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { R += d[i]; G += d[i + 1]; B += d[i + 2]; n++; }
    R /= n || 1; G /= n || 1; B /= n || 1; const px = new Uint8Array(d.length);
    for (let i = 0; i < d.length; i += 4) { const a = d[i + 3] / 255; px[i] = d[i] * a + R * (1 - a); px[i + 1] = d[i + 1] * a + G * (1 - a); px[i + 2] = d[i + 2] * a + B * (1 - a); px[i + 3] = d[i + 3]; }
    LEAF_PIX[key] = { S, px };
    return c.toDataURL("image/png");
  }
  const LEAF_PIX = {};
  function drawNatureFin(key, x, S, r) {
    if (key === "bark" || key === "bark_birch" || key === "palm_bark") {
      const birch = key === "bark_birch", palm = key === "palm_bark";
      x.fillStyle = birch ? "#d9d6cc" : palm ? "#7d6a52" : "#4d3b2b"; x.fillRect(0, 0, S, S);
      if (palm) { for (let j = 0; j < 8; j++) { const g = x.createLinearGradient(0, j * 64, 0, j * 64 + 64); g.addColorStop(0, "#5a4a38"); g.addColorStop(0.7, "#8f7b60"); g.addColorStop(1, "#4a3b2c"); x.fillStyle = g; x.fillRect(0, j * 64, S, 64); } }
      else if (birch) { for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(30,28,26,${0.5 + r() * 0.4})`; const w = 20 + r() * 90; x.fillRect(r() * S, r() * S, w, 3 + r() * 9); } }
      else for (let i = 0; i < 90; i++) { const px = r() * S; x.strokeStyle = `rgba(${20 + r() * 20},${14 + r() * 14},${8},${0.5 + r() * 0.4})`; x.lineWidth = 3 + r() * 7; x.beginPath(); x.moveTo(px, 0);
        for (let y = 0; y <= S; y += 32) x.lineTo(px + (r() - 0.5) * 18, y); x.stroke(); }
      for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "0,0,0"},${r() * 0.12})`; x.fillRect(r() * S, r() * S, 2, 2); }
      return true;
    }
    if (key === "hedge_leaf") { x.fillStyle = "#1c2e14"; x.fillRect(0, 0, S, S);
      for (let k = 0; k < 9; k++) paintLeaves(x, S, r, { n: 260, hue: 100, sat: 40, lit: 25, size: 22, rad: 0.36, cx: (k % 3 + 0.5) * S / 3, cy: (Math.floor(k / 3) + 0.5) * S / 3, twig: false });
      return true; }
    return false;
  }

  // ---------------------------------------------------------------- card helpers
  // scattered cards around cluster centres; normals point away from the crown centre so the crown shades as one mass
  function leafCards(m, name, mat, clusters, o) {
    const r = o.rand, v = [], uv = [], nn = [], C = o.center, R = o.R || 2, up = o.up ?? 0.35;
    for (const cl of clusters) for (let i = 0; i < cl.n; i++) {
      const sz = cl.size * (0.75 + r() * 0.5), off = [(r() - 0.5) * 2 * cl.spread, (r() - 0.5) * 2 * cl.spread, (r() - 0.5) * 2 * cl.spread * (cl.flat ?? 0.8)];
      const p = [cl.p[0] + off[0], cl.p[1] + off[1], cl.p[2] + off[2]];
      let nv = [r() - 0.5, r() - 0.5, (r() - 0.5) * 0.8 + 0.25]; const nl = Math.hypot(...nv) || 1; nv = nv.map(q => q / nl);
      const ref = Math.abs(nv[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
      let a = [nv[1] * ref[2] - nv[2] * ref[1], nv[2] * ref[0] - nv[0] * ref[2], nv[0] * ref[1] - nv[1] * ref[0]]; const al = Math.hypot(...a); a = a.map(q => q / al);
      const b = [nv[1] * a[2] - nv[2] * a[1], nv[2] * a[0] - nv[0] * a[2], nv[0] * a[1] - nv[1] * a[0]], h = sz / 2;
      const P = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([s, t]) => [p[0] + (a[0] * s + b[0] * t) * h, p[1] + (a[1] * s + b[1] * t) * h, p[2] + (a[2] * s + b[2] * t) * h]);
      const N = P.map(q => { let d = [(q[0] - C[0]) / R, (q[1] - C[1]) / R, (q[2] - C[2]) / R + up]; const l = Math.hypot(...d) || 1; return d.map(z => z / l); });
      const U = [[0, 0], [1, 0], [1, 1], [0, 1]];
      for (const k of [0, 1, 2, 0, 2, 3]) { v.push(...P[k]); nn.push(...N[k]); uv.push(...U[k]); }
    }
    m.tris(name, mat, v, false, uv, nn);
  }
  // a flat card hinged at `base`, reaching along `dir` (sprays, fronds, single leaves)
  function hingedCard(acc, base, dir, side, len, wid, nrmUp = 0.6) {
    const P = [[base[0] - side[0] * wid / 2, base[1] - side[1] * wid / 2, base[2] - side[2] * wid / 2], [base[0] + side[0] * wid / 2, base[1] + side[1] * wid / 2, base[2] + side[2] * wid / 2]];
    const tip = [base[0] + dir[0] * len, base[1] + dir[1] * len, base[2] + dir[2] * len];
    P.push([tip[0] + side[0] * wid / 2, tip[1] + side[1] * wid / 2, tip[2] + side[2] * wid / 2], [tip[0] - side[0] * wid / 2, tip[1] - side[1] * wid / 2, tip[2] - side[2] * wid / 2]);
    let n = [side[1] * dir[2] - side[2] * dir[1], side[2] * dir[0] - side[0] * dir[2], side[0] * dir[1] - side[1] * dir[0]]; if (n[2] < 0) n = n.map(q => -q);
    n = [n[0] + dir[0] * 0.5, n[1] + dir[1] * 0.5, n[2] + nrmUp]; const l = Math.hypot(...n); n = n.map(q => q / l);
    const U = [[0, 0], [1, 0], [1, 1], [0, 1]];
    for (const k of [0, 1, 2, 0, 2, 3]) { acc.v.push(...P[k]); acc.nn.push(...n); acc.uv.push(...U[k]); }
  }
  const unit = v => { const l = Math.hypot(...v) || 1; return v.map(q => q / l); };
  const acc0 = () => ({ v: [], uv: [], nn: [] });
  function potParts(m, R, H, mat = "pot") {
    m.cone("pot", mat, 0, 0, 0, R * 0.78, R, H, 24); m.cyl("rim", mat, 0, 0, H - 0.02, R + 0.015, 0.04, { seg: 24 }); m.cyl("soil", "soil", 0, 0, H - 0.03, R - 0.02, 0.01, { seg: 24 });
  }

  // ---------------------------------------------------------------- trees
  function broadleaf(m, it, leaf, H0, trunkMat = "fin_bark", slim = false) {
    const r = rng(hashOf(it.id)), H = H0 * (0.85 + r() * 0.3), Ht = H * (slim ? 0.35 : 0.42), lean = [(r() - 0.5) * 0.4, (r() - 0.5) * 0.4];
    const tr = slim ? 0.14 : 0.26, top = [lean[0], lean[1], Ht];
    m.cone("flare", trunkMat, 0, 0, 0, tr * 1.6, tr, 0.35, 9);
    m.limb("trunk", trunkMat, [0, 0, 0.3], top, tr, tr * 0.7, 9);
    const C = [lean[0], lean[1], H * (slim ? 0.66 : 0.68)], CR = slim ? H * 0.17 : H * 0.3, clusters = [];
    const nb = slim ? 5 : 6;
    for (let k = 0; k < nb; k++) {
      const a = (k / nb) * 6.28 + r() * 0.6, z0 = Ht * (0.75 + r() * 0.3), rr = CR * (0.65 + r() * 0.35), z1 = C[2] + (r() - 0.35) * CR * 0.7;
      const end = [lean[0] + Math.cos(a) * rr, lean[1] + Math.sin(a) * rr, z1], start = [lean[0] * z0 / Ht, lean[1] * z0 / Ht, z0];
      const mid = [(start[0] + end[0]) / 2 + (r() - 0.5) * 0.4, (start[1] + end[1]) / 2 + (r() - 0.5) * 0.4, (start[2] + end[2]) / 2 + 0.3];
      m.limb("branch" + k, trunkMat, start, mid, tr * 0.5, tr * 0.32, 6); m.limb("branchb" + k, trunkMat, mid, end, tr * 0.32, tr * 0.12, 5);
      clusters.push({ p: end, n: slim ? 14 : 18, size: CR * 0.85, spread: CR * 0.4 });
    }
    m.limb("leader", trunkMat, top, [C[0], C[1], C[2] + CR * 0.5], tr * 0.6, tr * 0.15, 6);
    clusters.push({ p: [C[0], C[1], C[2] + CR * 0.55], n: 18, size: CR * 0.85, spread: CR * 0.42 }, { p: C, n: 16, size: CR * 0.9, spread: CR * 0.5 });
    if (slim) clusters.push({ p: [C[0], C[1], C[2] - CR * 0.8], n: 8, size: CR * 0.6, spread: CR * 0.35 });
    leafCards(m, "crown", leaf, clusters, { rand: r, center: C, R: CR * 1.2 });
  }
  CATALOG.tree = { label: "Deciduous tree", short: "Tree", site: true, def: {}, build(m, it) { broadleaf(m, it, "leaf_oak", 8.5); } };
  CATALOG.maple = { label: "Autumn maple", short: "Maple", site: true, def: {}, build(m, it) { broadleaf(m, it, "leaf_maple", 7.5); } };
  CATALOG.birch = { label: "Birch tree", short: "Birch", site: true, def: {}, build(m, it) { broadleaf(m, it, "leaf_birch", 10, "fin_bark_birch", true); } };
  CATALOG.conifer = { label: "Conifer (fir)", short: "Conifer", site: true, def: {},
    build(m, it) {
      const r = rng(hashOf(it.id)), H = 9 + r() * 3, base = H * 0.12, acc = acc0();
      m.limb("trunk", "fin_bark", [0, 0, 0], [0, 0, H - 1.0], 0.24, 0.05, 8);
      const tiers = 16;
      for (let t = 0; t < tiers; t++) {
        const f = t / (tiers - 1), z = base + f * (H - base) * 0.97, R = 0.3 + 2.4 * Math.pow(1 - f, 1.1), n = Math.max(5, Math.round(13 - f * 6));
        for (let k = 0; k < n; k++) {
          const a = (k / n) * 6.28 + t * 0.7 + r() * 0.4, dir = unit([Math.cos(a), Math.sin(a), -0.35 - r() * 0.2]), side = [-Math.sin(a), Math.cos(a), 0];
          hingedCard(acc, [Math.cos(a) * 0.08, Math.sin(a) * 0.08, z + 0.25], dir, side, R * 1.1, Math.max(0.6, R * 0.95), 0.9);
        }
      }
      hingedCard(acc, [0, 0, H - 0.9], [0, 0, 1], [1, 0, 0], 1.1, 0.6); hingedCard(acc, [0, 0, H - 0.9], [0, 0, 1], [0, 1, 0], 1.1, 0.6);
      m.tris("needles", "leaf_needle", acc.v, false, acc.uv, acc.nn);
    } };
  CATALOG.palm = { label: "Palm tree", short: "Palm", site: true, def: {},
    build(m, it) {
      const r = rng(hashOf(it.id)), H = 7 + r() * 2.5, bend = [(r() - 0.5) * 1.6, (r() - 0.5) * 1.6], pts = [];
      for (let k = 0; k <= 6; k++) { const f = k / 6; pts.push([bend[0] * f * f, bend[1] * f * f, H * f]); }
      for (let k = 0; k < 6; k++) m.limb("trunk" + k, "fin_palm_bark", pts[k], pts[k + 1], 0.24 - k * 0.018, 0.24 - (k + 1) * 0.018, 9);
      const top = pts[6], acc = acc0();
      for (let k = 0; k < 13; k++) {
        const a = (k / 13) * 6.28 + r() * 0.3, rise = k % 3 === 0 ? 0.55 : 0.15 - r() * 0.2, side = [-Math.sin(a), Math.cos(a), 0];
        let base = [top[0], top[1], top[2] + 0.1];
        for (let s = 0; s < 3; s++) { const pitch = rise - s * 0.55, dir = unit([Math.cos(a), Math.sin(a), pitch]), len = 1.25 - s * 0.15;
          hingedCard(acc, base, dir, side, len, 1.35 - s * 0.3, 0.8); base = [base[0] + dir[0] * len, base[1] + dir[1] * len, base[2] + dir[2] * len]; }
      }
      m.tris("fronds", "leaf_frond", acc.v, false, acc.uv, acc.nn);
      for (let k = 0; k < 4; k++) { const a = k * 1.57 + 0.4; m.sph("coconut" + k, "wood_dark", top[0] + Math.cos(a) * 0.22, top[1] + Math.sin(a) * 0.22, top[2] - 0.15, 0.13); }
    } };
  CATALOG.bush = { label: "Shrub", short: "Shrub", site: true, def: {},
    build(m, it) { const r = rng(hashOf(it.id)), cl = [];
      for (let k = 0; k < 6; k++) { const a = k * 1.05 + r(); cl.push({ p: [Math.cos(a) * 0.38 * (k > 0), Math.sin(a) * 0.38 * (k > 0), 0.45 + r() * 0.35], n: 7, size: 0.75, spread: 0.32 }); }
      m.limb("stem", "fin_bark", [0, 0, 0], [0, 0, 0.4], 0.04, 0.03, 5); leafCards(m, "leaves", "leaf_shrub", cl, { rand: r, center: [0, 0, 0.5], R: 0.9 }); } };
  CATALOG.flower_bush = { label: "Flowering shrub", short: "Flower shrub", site: true, def: {},
    build(m, it) { const r = rng(hashOf(it.id)), cl = [];
      for (let k = 0; k < 6; k++) { const a = k * 1.05 + r(); cl.push({ p: [Math.cos(a) * 0.35 * (k > 0), Math.sin(a) * 0.35 * (k > 0), 0.5 + r() * 0.3], n: 7, size: 0.75, spread: 0.3 }); }
      leafCards(m, "leaves", "leaf_flower", cl, { rand: r, center: [0, 0, 0.5], R: 0.9 }); } };
  CATALOG.grass_tuft = { label: "Ornamental grass", short: "Tall grass", site: true, def: {},
    build(m, it) { const acc = acc0(), r = rng(hashOf(it.id)); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI + r() * 0.3; hingedCard(acc, [0, 0, 0], unit([0.05 * Math.cos(a), 0.05 * Math.sin(a), 1]), [Math.cos(a), Math.sin(a), 0], 1.0, 1.0, 1.2); }
      m.tris("blades", "leaf_grass", acc.v, false, acc.uv, acc.nn); } };
  CATALOG.flower_bed = { label: "Flower bed", short: "Flower bed", site: true, def: { w: 3, d: 1.2 }, dims: [["w", "Length m", 0.6, 30], ["d", "Width m", 0.4, 6]],
    build(m, it) { const { w, d } = it.props, acc = acc0();
      for (const sy of [-1, 1]) m.box("edgeL" + sy, "wood", 0, sy * (d / 2 - 0.04), 0.1, w, 0.08, 0.2, { b: 0.01 }); for (const sx of [-1, 1]) m.box("edgeW" + sx, "wood", sx * (w / 2 - 0.04), 0, 0.1, 0.08, d, 0.2, { b: 0.01 });
      m.up("soil", "soil", 0, 0, 0.17, w - 0.12, d - 0.12);
      const rows = Math.max(1, Math.round(d / 0.4)), per = Math.max(1, Math.round(w / 0.45));
      for (let j = 0; j < rows; j++) for (let i = 0; i < per; i++) { const x = -w / 2 + (i + 0.5) * w / per, y = -d / 2 + (j + 0.5) * d / rows, a = (i * 0.9 + j) % 3;
        hingedCard(acc, [x, y, 0.17], [0, 0, 1], [Math.cos(a), Math.sin(a), 0], 0.55, 0.55, 1.2); hingedCard(acc, [x, y, 0.17], [0, 0, 1], [-Math.sin(a), Math.cos(a), 0], 0.55, 0.55, 1.2); }
      m.tris("flowers", "leaf_bed", acc.v, false, acc.uv, acc.nn); } };
  CATALOG.hedge = linear_({ label: "Hedge", short: "Hedge", site: true, def: { len: 6, h: 1.4, thick: 0.9 }, dims: [["len", "Length m", 0.5, 200], ["h", "Height m", 0.4, 4], ["thick", "Thickness m", 0.3, 3]],
    build(m, it) { const L = it.props.len, H = it.props.h, T = it.props.thick, r = rng(hashOf(it.id)), cl = [];
      m.box("hedge", "fin_hedge_leaf", 0, 0, H / 2 - 0.05, L - 0.1, T - 0.12, H - 0.1, { b: 0 });
      const n = Math.min(160, Math.floor(L / 0.5)); for (let k = 0; k < n; k++) { const x = -L / 2 + (k + 0.5) * L / n; cl.push({ p: [x, (r() - 0.5) * T * 0.4, H - 0.12], n: 3, size: 0.55, spread: 0.18, flat: 0.5 });
        if (k % 2 === 0) for (const sy of [-1, 1]) cl.push({ p: [x, sy * T * 0.44, 0.25 + r() * (H - 0.5)], n: 2, size: 0.45, spread: 0.12 }); }
      leafCards(m, "leaves", "leaf_shrub", cl, { rand: r, center: [0, 0, H * 0.4], R: Math.max(H, T), up: 0.6 }); } });

  // ---------------------------------------------------------------- house plants
  CATALOG.plant = { label: "Monstera (pot plant)", short: "Monstera", def: {},
    build(m, it) { const r = rng(hashOf(it.id)), acc = acc0(); potParts(m, 0.21, 0.42, "ceramic");
      for (let k = 0; k < 11; k++) { const a = k * 2.4 + r() * 0.4, rr = 0.12 + r() * 0.3, h = 0.65 + r() * 0.5, tip = [Math.cos(a) * rr, Math.sin(a) * rr, h];
        m.limb("stem" + k, "foliage", [0, 0, 0.4], tip, 0.012, 0.008, 4);
        const dir = unit([Math.cos(a), Math.sin(a), 0.35 + r() * 0.5]), side = [-Math.sin(a), Math.cos(a), 0]; hingedCard(acc, tip, dir, side, 0.42 + r() * 0.12, 0.42, 1.0); }
      m.tris("leaves", "leaf_monstera", acc.v, false, acc.uv, acc.nn); } };
  CATALOG.fiddle_fig = { label: "Fiddle-leaf fig", short: "Fig tree", def: {},
    build(m, it) { const r = rng(hashOf(it.id)), acc = acc0(); potParts(m, 0.2, 0.4, "pot"); m.limb("trunk", "fin_bark", [0, 0, 0.38], [0.04, 0.02, 1.55], 0.03, 0.018, 6);
      for (let k = 0; k < 26; k++) { const z = 0.75 + (k / 26) * 0.9, a = k * 2.3 + r() * 0.5, base = [Math.cos(a) * 0.04, Math.sin(a) * 0.04, z], dir = unit([Math.cos(a), Math.sin(a), 0.5 + r() * 0.6]);
        hingedCard(acc, base, dir, [-Math.sin(a), Math.cos(a), 0], 0.32 + r() * 0.08, 0.26, 1.0); }
      m.tris("leaves", "leaf_fig", acc.v, false, acc.uv, acc.nn); } };
  CATALOG.snake_plant = { label: "Snake plant", short: "Snake plant", def: {},
    build(m, it) { const r = rng(hashOf(it.id)), v = []; potParts(m, 0.15, 0.3, "ceramic");
      for (let k = 0; k < 11; k++) { const a = k * 2.2 + r(), b = [Math.cos(a) * 0.07, Math.sin(a) * 0.07, 0.28], h = 0.45 + r() * 0.35, w = 0.035 + r() * 0.02, lean = [Math.cos(a) * 0.08, Math.sin(a) * 0.08], sd = [-Math.sin(a + 1) * w, Math.cos(a + 1) * w];
        const p1 = [b[0] - sd[0], b[1] - sd[1], b[2]], p2 = [b[0] + sd[0], b[1] + sd[1], b[2]], t = [b[0] + lean[0], b[1] + lean[1], b[2] + h], mL = [b[0] + lean[0] * 0.5 - sd[0] * 1.2, b[1] + lean[1] * 0.5 - sd[1] * 1.2, b[2] + h * 0.55], mR = [b[0] + lean[0] * 0.5 + sd[0] * 1.2, b[1] + lean[1] * 0.5 + sd[1] * 1.2, b[2] + h * 0.55];
        v.push(...p1, ...p2, ...mR, ...p1, ...mR, ...mL, ...mL, ...mR, ...t); }
      m.tris("blades", "snake", v, true); } };
  CATALOG.areca_palm = { label: "Indoor palm", short: "Indoor palm", def: {},
    build(m, it) { const r = rng(hashOf(it.id)), acc = acc0(); potParts(m, 0.22, 0.4, "pot");
      for (let k = 0; k < 10; k++) { const a = k * 0.63 + r() * 0.3, tip = [Math.cos(a) * 0.15, Math.sin(a) * 0.15, 1.0 + r() * 0.4]; m.limb("cane" + k, "foliage2", [0, 0, 0.38], tip, 0.01, 0.007, 4);
        hingedCard(acc, tip, unit([Math.cos(a), Math.sin(a), 0.2 - r() * 0.4]), [-Math.sin(a), Math.cos(a), 0], 0.75, 0.6, 0.9); }
      m.tris("fronds", "leaf_frond", acc.v, false, acc.uv, acc.nn); } };
  CATALOG.flower_pot = { label: "Flower pot", short: "Flower pot", def: {},
    build(m, it) { const r = rng(hashOf(it.id)), cl = []; potParts(m, 0.14, 0.24, "pot_terracotta");
      for (let k = 0; k < 4; k++) cl.push({ p: [Math.cos(k * 1.6) * 0.06, Math.sin(k * 1.6) * 0.06, 0.38], n: 4, size: 0.24, spread: 0.08 });
      leafCards(m, "flowers", "leaf_flower", cl, { rand: r, center: [0, 0, 0.32], R: 0.3 }); } };
  BASE_MATS.snake = { color: [0.22, 0.4, 0.2], rough: 0.5 }; BASE_MATS.pot_terracotta = { color: [0.66, 0.36, 0.24], rough: 0.85 };

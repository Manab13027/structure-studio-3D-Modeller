  // ================================================================ extra materials (general building & site)
  Object.assign(BASE_MATS, {
    wood: { color: [0.56, 0.38, 0.22], rough: 0.55 }, wood_dark: { color: [0.29, 0.18, 0.11], rough: 0.5 }, wood_light: { color: [0.76, 0.62, 0.44], rough: 0.55 },
    fabric: { color: [0.37, 0.41, 0.45], rough: 0.95 }, fabric_warm: { color: [0.64, 0.54, 0.42], rough: 0.95 }, fabric_dark: { color: [0.18, 0.2, 0.22], rough: 0.95 },
    cushion: { color: [0.74, 0.68, 0.57], rough: 0.95 }, linen: { color: [0.93, 0.92, 0.89], rough: 0.9 }, duvet: { color: [0.46, 0.56, 0.67], rough: 0.9 },
    leather: { color: [0.27, 0.17, 0.11], rough: 0.5 }, ceramic: { color: [0.95, 0.95, 0.94], rough: 0.12, metal: 0.05 },
    steel: { color: [0.72, 0.73, 0.74], rough: 0.3, metal: 0.9 }, steel_dark: { color: [0.3, 0.32, 0.34], rough: 0.45, metal: 0.7 },
    counter: { color: [0.83, 0.81, 0.77], rough: 0.25 }, cab_white: { color: [0.9, 0.9, 0.88], rough: 0.4 }, cab_grey: { color: [0.42, 0.44, 0.45], rough: 0.45 },
    glass_dark: { color: [0.1, 0.13, 0.16], rough: 0.05, metal: 0.5 }, tyre: { color: [0.05, 0.05, 0.05], rough: 0.8 }, rim: { color: [0.65, 0.66, 0.68], rough: 0.3, metal: 0.9 },
    shade: { color: [0.95, 0.9, 0.8], rough: 0.8, emit: 0.6 }, bark: { color: [0.32, 0.23, 0.16], rough: 1 },
    foliage: { color: [0.23, 0.41, 0.18], rough: 0.9 }, foliage2: { color: [0.32, 0.5, 0.21], rough: 0.9 }, conifer: { color: [0.14, 0.29, 0.17], rough: 0.9 },
    hedge: { color: [0.2, 0.37, 0.16], rough: 0.95 }, water: { color: [0.22, 0.42, 0.52], rough: 0.04, metal: 0.35 },
    concrete: { color: [0.64, 0.64, 0.62], rough: 0.9 }, metal: { color: [0.56, 0.58, 0.6], rough: 0.4, metal: 0.6 },
    yellow: { color: [0.93, 0.73, 0.12], rough: 0.5 }, road_line: { color: [0.95, 0.95, 0.9], rough: 0.6 }, tank_white: { color: [0.87, 0.88, 0.87], rough: 0.45, metal: 0.2 },
    tower_red: { color: [0.8, 0.17, 0.13], rough: 0.5 }, brass: { color: [0.75, 0.6, 0.3], rough: 0.3, metal: 0.9 }, mirror: { color: [0.82, 0.86, 0.9], rough: 0.02, metal: 1 },
    stair: { color: [0.86, 0.85, 0.82], rough: 0.6 }, ceiling: { color: [0.9, 0.9, 0.88], rough: 0.95 }, soffit: { color: [0.82, 0.8, 0.76], rough: 0.9 },
    fascia: { color: [0.92, 0.92, 0.9], rough: 0.6 }, earth: { color: [0.3, 0.25, 0.19], rough: 1 }, rack_orange: { color: [0.88, 0.42, 0.1], rough: 0.5, metal: 0.3 },
    rack_blue: { color: [0.13, 0.3, 0.6], rough: 0.5, metal: 0.3 }, pallet: { color: [0.68, 0.55, 0.36], rough: 0.9 }, carton: { color: [0.66, 0.5, 0.32], rough: 0.95 },
    green_paint: { color: [0.22, 0.38, 0.28], rough: 0.5, metal: 0.3 }, lamp_cool: { color: [0.92, 0.96, 1.0], emit: 3.0 }, red_light: { color: [1, 0.15, 0.1], emit: 3.0 },
    amber_light: { color: [1, 0.65, 0.15], emit: 3.0 }, white_mark: { color: [0.93, 0.93, 0.9], rough: 0.7 }
  });

  // ================================================================ finishes (procedural, tiling textures; drawn once on demand)
  // tile = metres covered by one copy of the texture
  const FIN = {
    brick_red: { label: "Red brick", kind: "ext", tile: 0.9 }, brick_buff: { label: "Buff brick", kind: "ext", tile: 0.9 },
    render_white: { label: "White render", kind: "ext", tile: 2 }, render_grey: { label: "Grey render", kind: "ext", tile: 2 },
    concrete: { label: "Board-formed concrete", kind: "ext", tile: 2.4 }, stone: { label: "Stone", kind: "ext", tile: 1.6 },
    wood_cladding: { label: "Timber cladding", kind: "ext", tile: 1.2 }, metal_clad: { label: "Metal cladding", kind: "ext", tile: 2, metal: 0.4, rough: 0.5 },
    oak: { label: "Oak boards", kind: "floor", tile: 1.6, rough: 0.5 }, walnut: { label: "Walnut boards", kind: "floor", tile: 1.6, rough: 0.5 },
    tiles_white: { label: "White tiles", kind: "floor", tile: 1.2, rough: 0.25 }, tiles_grey: { label: "Grey tiles", kind: "floor", tile: 1.2, rough: 0.3 },
    marble: { label: "Marble", kind: "floor", tile: 1.6, rough: 0.15 }, carpet_grey: { label: "Grey carpet", kind: "floor", tile: 1, rough: 1 },
    carpet_blue: { label: "Blue carpet", kind: "floor", tile: 1, rough: 1 }, concrete_floor: { label: "Polished concrete", kind: "floor", tile: 3, rough: 0.35 },
    raised: { label: "Raised access floor", kind: "floor", tile: 4, rough: 0.55, tex: "floor" },
    clay_tiles: { label: "Clay tiles", kind: "roof", tile: 1.2 }, slate: { label: "Slate", kind: "roof", tile: 1.2 },
    metal_roof: { label: "Standing-seam metal", kind: "roof", tile: 2, metal: 0.5, rough: 0.45 }, membrane: { label: "Flat membrane", kind: "roof", tile: 3 },
    green_roof: { label: "Green (sedum) roof", kind: "roof", tile: 2 },
    grass: { label: "Grass", kind: "ground", tile: 4, rough: 1 }, asphalt: { label: "Asphalt", kind: "ground", tile: 4, rough: 0.9 },
    paving: { label: "Block paving", kind: "ground", tile: 1.2 }, gravel: { label: "Gravel", kind: "ground", tile: 2, rough: 1 }, sand: { label: "Sand", kind: "ground", tile: 3, rough: 1 }
  };
  const finOptions = (kind, cur) => Object.entries(FIN).filter(([, f]) => f.kind === kind || (kind === "floor" && f.kind === "ground" && false))
    .map(([k, f]) => `<option value="${k}"${k === cur ? " selected" : ""}>${f.label}</option>`).join("");
  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function drawFin(key) {
    const S = 512, c = document.createElement("canvas"); c.width = c.height = S; const x = c.getContext("2d"), r = rng(hashOf(key));
    const rgb = (a, j = 0) => `rgb(${a.map(v => Math.max(0, Math.min(255, Math.round(v + (r() - 0.5) * j)))).join(",")})`;
    const noise = (n, a, col, sz = 2) => { for (let i = 0; i < n; i++) { x.globalAlpha = a * r(); x.fillStyle = col; x.fillRect(r() * S, r() * S, sz * (0.5 + r()), sz * (0.5 + r())); } x.globalAlpha = 1; };
    const fill = col => { x.fillStyle = col; x.fillRect(0, 0, S, S); };
    const bricks = (base, mortar) => {
      fill(mortar); const rows = 12, bw = S / 4, bh = S / rows;
      for (let j = 0; j < rows; j++) for (let i = -1; i < 5; i++) { const ox = (j % 2) * bw / 2; x.fillStyle = rgb(base, 38); x.fillRect(i * bw + ox + 3, j * bh + 3, bw - 6, bh - 6); }
      noise(5000, 0.25, "#000", 2); noise(2500, 0.15, "#fff", 1.5);
    };
    const boards = (base, n, vertical) => {
      for (let i = 0; i < n; i++) {
        const w = S / n; let y0 = 0; const segs = vertical ? 2 : 1;
        for (let k = 0; k < segs; k++) {
          const len = vertical ? (k === 0 ? S * (0.3 + 0.4 * ((i * 37) % 10) / 10) : S) : S; x.fillStyle = rgb(base, 18);
          if (vertical) x.fillRect(i * w + 1, y0, w - 2, len - y0); else x.fillRect(0, i * w + 1, S, w - 2);
          if (vertical) { x.fillStyle = "rgba(0,0,0,.35)"; x.fillRect(i * w, len - 1, w, 2); y0 = len; }
        }
        x.strokeStyle = "rgba(0,0,0,.12)"; x.lineWidth = 1;
        for (let g = 0; g < 7; g++) { x.beginPath(); const p = i * w + 3 + r() * (w - 6);
          if (vertical) { x.moveTo(p, 0); x.bezierCurveTo(p + 4, S / 3, p - 4, S * 2 / 3, p + r() * 3, S); } else { x.moveTo(0, p); x.bezierCurveTo(S / 3, p + 3, S * 2 / 3, p - 3, S, p); } x.stroke(); }
      }
      x.fillStyle = "rgba(0,0,0,.4)"; for (let i = 0; i < n; i++) vertical ? x.fillRect(i * S / n, 0, 1.5, S) : x.fillRect(0, i * S / n, S, 1.5);
    };
    const grid = (base, grout, n, j = 10) => { fill(grout); const w = S / n; for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) { x.fillStyle = rgb(base, j); x.fillRect(a * w + 2, b * w + 2, w - 4, w - 4); } };
    switch (key) {
      case "brick_red": bricks([150, 66, 46], "#b8ab98"); break;
      case "brick_buff": bricks([196, 160, 112], "#d8cfbf"); break;
      case "render_white": fill("#e6e2da"); noise(9000, 0.12, "#8a8478", 2); noise(4000, 0.2, "#fff", 2); break;
      case "render_grey": fill("#a7a9a8"); noise(9000, 0.14, "#555", 2); noise(4000, 0.15, "#ddd", 2); break;
      case "concrete": fill("#9d9d99"); for (let i = 0; i < 40; i++) { x.globalAlpha = 0.035; x.fillStyle = r() > 0.5 ? "#fff" : "#000"; x.beginPath(); x.arc(r() * S, r() * S, 20 + r() * 70, 0, 7); x.fill(); }
        x.globalAlpha = 1; noise(6000, 0.18, "#444", 2); x.fillStyle = "rgba(0,0,0,.25)"; x.fillRect(0, S / 2, S, 2); x.fillRect(S / 2, 0, 2, S); x.fillRect(0, 0, S, 2); x.fillRect(0, 0, 2, S);
        for (const [a, b] of [[64, 64], [448, 64], [64, 320], [448, 320], [192, 192], [320, 448]]) { x.fillStyle = "rgba(0,0,0,.35)"; x.beginPath(); x.arc(a, b, 5, 0, 7); x.fill(); } break;
      case "stone": { fill("#7d776c"); let y = 0; while (y < S) { const h = 50 + Math.floor(r() * 3) * 22; let xx = -r() * 80; while (xx < S) { const w = 70 + r() * 120; x.fillStyle = rgb([168, 158, 140], 40); x.fillRect(xx + 3, y + 3, w - 6, Math.min(h, S - y) - 6); xx += w; } y += h; }
        noise(8000, 0.2, "#000", 2); break; }
      case "wood_cladding": fill("#3a2a1c"); boards([140, 100, 66], 8, false); for (let i = 0; i < 8; i++) { x.fillStyle = "rgba(0,0,0,.35)"; x.fillRect(0, (i + 1) * S / 8 - 6, S, 6); } break;
      case "metal_clad": for (let i = 0; i < S; i++) { const k = 0.5 + 0.5 * Math.cos(i / S * 16 * 2 * Math.PI); const v = Math.round(120 + 55 * k); x.fillStyle = `rgb(${v - 8},${v},${v + 6})`; x.fillRect(i, 0, 1, S); }
        noise(3000, 0.1, "#000", 2); x.fillStyle = "rgba(0,0,0,.25)"; x.fillRect(0, S - 2, S, 2); break;
      case "oak": fill("#6b4c2e"); boards([170, 128, 84], 8, true); break;
      case "walnut": fill("#2e1d12"); boards([104, 70, 44], 8, true); break;
      case "tiles_white": grid([232, 232, 228], "#b9b8b2", 4, 8); noise(2000, 0.08, "#888", 2); break;
      case "tiles_grey": grid([120, 124, 126], "#5d6062", 4, 14); noise(3000, 0.1, "#000", 2); break;
      case "marble": grid([226, 224, 218], "#c9c6be", 2, 6); x.strokeStyle = "rgba(90,90,96,.35)"; for (let i = 0; i < 18; i++) { x.lineWidth = 0.5 + r() * 2; x.beginPath(); let px = r() * S, py = r() * S; x.moveTo(px, py);
        for (let k = 0; k < 6; k++) { px += (r() - 0.3) * 90; py += (r() - 0.5) * 90; x.lineTo(px, py); } x.stroke(); } break;
      case "carpet_grey": fill("#6d7174"); noise(26000, 0.35, "#3e4245", 1.5); noise(14000, 0.25, "#9a9fa2", 1.5); break;
      case "carpet_blue": fill("#354a66"); noise(26000, 0.35, "#1f2c3f", 1.5); noise(14000, 0.25, "#5a7092", 1.5); break;
      case "concrete_floor": fill("#8e8f8c"); for (let i = 0; i < 40; i++) { x.globalAlpha = 0.025; x.fillStyle = r() > 0.5 ? "#fff" : "#000"; x.beginPath(); x.arc(r() * S, r() * S, 30 + r() * 90, 0, 7); x.fill(); }
        x.globalAlpha = 1; noise(4000, 0.12, "#333", 2); x.fillStyle = "rgba(0,0,0,.3)"; x.fillRect(0, 0, S, 2); x.fillRect(0, 0, 2, S); break;
      case "clay_tiles": fill("#5a2a18"); for (let j = 0; j < 10; j++) for (let i = 0; i < 9; i++) { const w = S / 8, h = S / 10, ox = (j % 2) * w / 2;
        const g = x.createLinearGradient(0, j * h, 0, j * h + h); const b = rgb([178, 84, 52], 30); g.addColorStop(0, b); g.addColorStop(0.85, b); g.addColorStop(1, "#3a170c"); x.fillStyle = g;
        x.beginPath(); x.ellipse(i * w + ox - w / 2 + w / 2, j * h + h / 2, w / 2 - 2, h / 2 + 2, 0, 0, 7); x.fill(); } noise(3000, 0.15, "#000", 2); break;
      case "slate": fill("#22262a"); for (let j = 0; j < 8; j++) for (let i = 0; i < 6; i++) { const w = S / 5, h = S / 8, ox = (j % 2) * w / 2; x.fillStyle = rgb([70, 76, 82], 18); x.fillRect(i * w + ox - w / 2 + 2, j * h + 2, w - 4, h - 3); }
        noise(4000, 0.15, "#000", 2); break;
      case "metal_roof": fill("#5e6a70"); noise(3000, 0.1, "#000", 2); for (let i = 0; i < 8; i++) { x.fillStyle = "rgba(255,255,255,.35)"; x.fillRect(i * S / 8, 0, 5, S); x.fillStyle = "rgba(0,0,0,.35)"; x.fillRect(i * S / 8 + 5, 0, 4, S); } break;
      case "membrane": fill("#5d5f60"); noise(9000, 0.15, "#000", 2); x.fillStyle = "rgba(255,255,255,.12)"; for (let i = 0; i < 3; i++) x.fillRect(0, i * S / 3, S, 3); break;
      case "green_roof": fill("#4b5e2a"); noise(20000, 0.5, "#6f8a35", 3); noise(9000, 0.4, "#2f3d18", 3); noise(800, 0.6, "#b5643a", 3); break;
      case "grass": fill("#4a6e2c"); noise(30000, 0.4, "#5f8838", 3); noise(16000, 0.35, "#36531f", 3); noise(4000, 0.25, "#8a9a4a", 2); break;
      case "asphalt": fill("#3b3d3f"); noise(30000, 0.4, "#2a2b2c", 2); noise(14000, 0.35, "#5c5e60", 1.5); break;
      case "paving": { fill("#6e6a64"); const w = S / 8, h = S / 16; for (let j = 0; j < 16; j++) for (let i = -1; i < 9; i++) { const ox = (j % 2) * w / 2; x.fillStyle = rgb([150, 142, 130], 22); x.fillRect(i * w + ox + 2, j * h + 2, w - 4, h - 4); }
        noise(4000, 0.15, "#000", 2); break; }
      case "gravel": fill("#8b847a"); noise(30000, 0.6, "#a59e92", 3); noise(20000, 0.5, "#5f5a52", 3); break;
      case "sand": fill("#cdb98e"); noise(30000, 0.3, "#b19d72", 2); noise(10000, 0.3, "#e5d6b0", 2); break;
      default: if (!drawNatureFin(key, x, S, r)) fill("#888");
    }
    return c.toDataURL("image/jpeg", 0.86);
  }
  // fixed pictures used by some objects (TV, painting, solar cells, helipad)
  function makeStaticTextures() {
    const mk = (key, w, h, emit, fn) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); TEX[key] = c.toDataURL("image/jpeg", 0.88); EMIT[key] = emit; };
    mk("tv", 512, 288, 0.9, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#6aa7d8"); g.addColorStop(0.6, "#cfe3ef"); g.addColorStop(0.61, "#5b7f45"); g.addColorStop(1, "#30482a");
      x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = "#3d5a3a"; x.beginPath(); x.moveTo(0, h * 0.62); for (let i = 0; i <= 10; i++) x.lineTo(i * w / 10, h * (0.45 + 0.12 * Math.sin(i * 1.7))); x.lineTo(w, h); x.lineTo(0, h); x.fill();
      x.fillStyle = "#fff6d0"; x.beginPath(); x.arc(w * 0.78, h * 0.22, 22, 0, 7); x.fill(); });
    mk("art", 512, 384, 0, (x, w, h) => { x.fillStyle = "#efe9dc"; x.fillRect(0, 0, w, h); const r = rng(7); const cols = ["#c8553d", "#2d6a8e", "#f2c14e", "#1f2a36", "#8aa29e"];
      for (let i = 0; i < 9; i++) { x.fillStyle = cols[i % cols.length]; x.globalAlpha = 0.85; if (i % 2) x.fillRect(r() * w * 0.8, r() * h * 0.8, 40 + r() * 160, 30 + r() * 120); else { x.beginPath(); x.arc(r() * w, r() * h, 20 + r() * 80, 0, 7); x.fill(); } }
      x.globalAlpha = 1; x.strokeStyle = "#1f2a36"; x.lineWidth = 6; x.beginPath(); x.moveTo(30, h - 60); x.bezierCurveTo(w / 3, 40, w * 2 / 3, h, w - 30, 50); x.stroke(); });
    mk("solar", 256, 512, 0, (x, w, h) => { x.fillStyle = "#c9cdd2"; x.fillRect(0, 0, w, h); for (let j = 0; j < 10; j++) for (let i = 0; i < 6; i++) { const g = x.createLinearGradient(0, 0, 40, 46); g.addColorStop(0, "#1d3360"); g.addColorStop(1, "#13224a"); x.fillStyle = g; x.fillRect(4 + i * 41.3, 4 + j * 50.6, 38, 47); } });
    mk("helipad", 1024, 1024, 0, (x, w) => { x.fillStyle = "#3f4244"; x.fillRect(0, 0, w, w); x.strokeStyle = "#e9e6dc"; x.lineWidth = 26; x.strokeRect(30, 30, w - 60, w - 60);
      x.strokeStyle = "#e6c13a"; x.lineWidth = 34; x.beginPath(); x.arc(w / 2, w / 2, 330, 0, 7); x.stroke(); x.fillStyle = "#e9e6dc"; x.font = "700 460px Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("H", w / 2, w / 2 + 20); });
    LIB.push({ key: "art", label: "Abstract painting", kind: "pic", emit: 0 }, { key: "tv", label: "TV picture (landscape)", kind: "pic", emit: 0.9 });
  }

  // ================================================================ levels: site, buildings, floors
  const SLAB = 0.2;
  const bldOf = it => it && it.b ? state.buildings.find(B => B.id === it.b) || null : null;
  const bldById = id => state.buildings.find(B => B.id === id) || null;
  const floorTop = (B, f) => B.base + f * B.fh;
  const clearH = B => B.fh - SLAB;
  const wallTopZ = B => floorTop(B, B.floors - 1) + (B.roof.type === "none" ? clearH(B) : B.fh);
  const FLOOR_NAMES = f => f === 0 ? "Ground" : f === 1 ? "1st" : f === 2 ? "2nd" : f === 3 ? "3rd" : f + "th";
  const view = { upTo: 99, af: 0, cut: true, ab: null };
  const showTop = B => Math.min(view.upTo, B.floors - 1);
  const activeFloor = B => Math.min(view.af, B.floors - 1);
  function buildingAt(x, y) { for (let i = state.buildings.length - 1; i >= 0; i--) { const B = state.buildings[i]; if (insidePoly(x, y, B.pts)) return B; } return null; }
  function itemZ(it) { const B = bldOf(it); return B ? floorTop(B, Math.min(it.f || 0, B.floors - 1)) : 0; }
  function levelRoom(it) { const B = bldOf(it); return B ? { h: clearH(B), fh: B.fh } : { h: 2.6, fh: 3 }; }
  function syncBld(B) {
    if (polyArea(B.pts) < 0) B.pts.reverse();
    const xs = B.pts.map(p => p[0]), ys = B.pts.map(p => p[1]);
    B.w = +(Math.max(...xs) - Math.min(...xs)).toFixed(2); B.d = +(Math.max(...ys) - Math.min(...ys)).toFixed(2);
    B.cx = (Math.max(...xs) + Math.min(...xs)) / 2; B.cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    B.floors = Math.max(1, Math.min(60, Math.round(B.floors || 1)));
    while ((B.floorFin || (B.floorFin = [])).length < B.floors) B.floorFin.push(B.floorFin[B.floorFin.length - 1] || "oak");
  }
  function newBuilding(o) {
    const B = { id: "b" + (uid++), name: "Building", pts: [[-5, -4], [5, -4], [5, 4], [-5, 4]], floors: 1, fh: 3.0, base: 0.2, wallT: 0.25, ext: "render_white", paint: "#d9d4ca",
      floorFin: ["oak"], dado: false, roof: { type: "gable", pitch: 35, mat: "clay_tiles", over: 0.45 }, ...o };
    B.roof = { type: "gable", pitch: 35, mat: "clay_tiles", over: 0.45, ...(o && o.roof || {}) };
    syncBld(B); return B;
  }

  // ================================================================ small geometry helpers
  const v3 = (p, z) => [p[0], p[1], z];
  // quad a,b,c,d counter-clockwise when seen from its front
  const quadV = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d);
  const quad2 = (out, a, b, c, d) => { quadV(out, a, b, c, d); quadV(out, d, c, b, a); };
  function clipHalf(poly, p, q, keepLeft) {
    const out = [], side = v => { const s = (q[0] - p[0]) * (v[1] - p[1]) - (q[1] - p[1]) * (v[0] - p[0]); return keepLeft ? s : -s; };
    for (let i = 0; i < poly.length; i++) {
      const A = poly[i], B = poly[(i + 1) % poly.length], sa = side(A), sb = side(B);
      if (sa >= 0) out.push(A);
      if ((sa >= 0) !== (sb >= 0)) { const t = sa / (sa - sb); out.push([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]); }
    }
    return out;
  }
  // triangles of polygon P (2D) minus convex holes (each CCW), as flat [x,y,...] triples
  function polyMinusHoles(P, holes) {
    let tris = []; const idx = triangulate(P);
    for (let i = 0; i < idx.length; i += 3) tris.push([P[idx[i]], P[idx[i + 1]], P[idx[i + 2]]]);
    for (const H of holes) {
      const next = [];
      for (const t of tris) {
        let rem = t; const pieces = [];
        for (let k = 0; k < H.length && rem.length >= 3; k++) {
          const p = H[k], q = H[(k + 1) % H.length];
          const outside = clipHalf(rem, p, q, false); if (outside.length >= 3 && Math.abs(polyArea(outside)) > 1e-6) pieces.push(outside);
          rem = clipHalf(rem, p, q, true);
        }
        if (!pieces.length && rem.length >= 3 && Math.abs(polyArea(rem)) > Math.abs(polyArea(t)) - 1e-6) { next.push(t); continue; }
        for (const pc of pieces) for (let k = 1; k + 1 < pc.length; k++) next.push([pc[0], pc[k], pc[k + 1]]);
      }
      tris = next;
    }
    return tris;
  }
  function stairRect(it) {   // world footprint of a staircase (CCW)
    const k = it.props.scale || [1, 1, 1], w = (it.props.w || 1) * k[0] / 2, run = stairRun(it) * k[1] / 2, a = it.rot * D2R, c = Math.cos(a), s = Math.sin(a);
    return [[-w, -run], [w, -run], [w, run], [-w, run]].map(([x, y]) => [it.x + x * c - y * s, it.y + x * s + y * c]);
  }
  const stairSteps = it => { const B = bldOf(it); return Math.max(3, Math.round((B ? B.fh : 3) / 0.18)); };
  const stairRun = it => stairSteps(it) * 0.27;

  // ================================================================ building shell (per building, floor and wall, so views can hide parts)
  // returns [{key, kind: "site"|"floor"|"wall"|"roof", b, f, nx, ny, prims}]
  function openingsFor(B, f) {
    const res = {};
    for (const it of state.items) { const c = CATALOG[it.type]; if (!c.opening || it.host || it.seg == null || it.b !== B.id || (it.f || 0) !== f) continue;
      const k = it.props.scale || [1, 1, 1], o = c.opening(it);
      (res[it.seg] || (res[it.seg] = [])).push({ c: it.t, w: o.w * k[0], h: o.h * k[2], sill: o.sill * k[2] }); }
    return res;
  }
  function siteShell() {
    const S = state.site, w = S.w / 2, d = S.d / 2, gm = "fin_" + (S.ground || "grass"), v = [];
    quadV(v, [-w, -d, 0], [w, -d, 0], [w, d, 0], [-w, d, 0]);
    return [{ key: "site", kind: "site", prims: [{ t: "tris", n: "ground", m: gm, v, g: "Site" }, { t: "box", n: "ground_base", m: "earth", p: [0, 0, -0.26], s: [S.w, S.d, 0.5], rz: 0, b: 0, g: "Site" }] }];
  }
  function buildingShell(B) {
    const groups = [], T = B.wallT, segs = wallSegs(B), n = segs.length, P = B.pts, ext = "fin_" + B.ext, paint = "paint_" + B.paint.replace("#", "").toLowerCase();
    const O = offsetPoly(P, T), gname = B.name || "Building";
    const holesFor = f => state.items.filter(it => it.type === "stairs" && it.b === B.id && (it.f || 0) === f - 1).map(stairRect);
    for (let f = 0; f < B.floors; f++) {
      const z0 = floorTop(B, f), top = f === B.floors - 1, z1 = top ? wallTopZ(B) : floorTop(B, f + 1), ceil = z0 + clearH(B);
      const fl = []; const G = `${gname} · ${FLOOR_NAMES(f)} floor`;
      const holes = f > 0 ? holesFor(f) : [];
      const tris = polyMinusHoles(P, holes), fin = "fin_" + (B.floorFin[f] || "oak");
      const fv = [], cv = [];
      for (const t of tris) { fv.push(...v3(t[0], z0 + 0.003), ...v3(t[1], z0 + 0.003), ...v3(t[2], z0 + 0.003)); cv.push(...v3(t[2], z0 - SLAB), ...v3(t[1], z0 - SLAB), ...v3(t[0], z0 - SLAB)); }
      fl.push({ t: "tris", n: `floor_${f}`, m: fin, v: fv, g: G });
      if (f > 0) {
        fl.push({ t: "tris", n: `ceiling_${f - 1}`, m: "ceiling", v: cv, g: G });
        const ed = []; for (const H of holes) for (let k = 0; k < 4; k++) { const a = H[k], b = H[(k + 1) % 4]; quadV(ed, v3(b, z0 - SLAB), v3(a, z0 - SLAB), v3(a, z0), v3(b, z0)); }   // hole edges face into the hole
        if (ed.length) fl.push({ t: "tris", n: `stairwell_${f}`, m: "ceiling", v: ed, g: G });
      } else {   // plinth under the ground floor
        const Pl = offsetPoly(P, T + 0.06), pv = [];
        for (const i of triangulate(Pl)) pv.push(...v3(Pl[i], z0));
        for (let i = 0; i < Pl.length; i++) { const a = Pl[i], b = Pl[(i + 1) % Pl.length]; quadV(pv, v3(a, 0), v3(b, 0), v3(b, z0), v3(a, z0)); }
        fl.push({ t: "tris", n: "plinth", m: "concrete", v: pv, g: G });
      }
      groups.push({ key: `${B.id}:f${f}`, kind: "floor", b: B.id, f, prims: fl });
      // walls: painted inside face (planes), solid outside skin (prism with mitred corners), openings cut through both
      const ops = openingsFor(B, f), zb = f === 0 ? z0 : z0;
      for (const sg of segs) {
        const pr = [], ev = [], i = sg.i, In = t => [sg.a[0] + sg.ux * t, sg.a[1] + sg.uy * t], Ou = t => t <= 1e-6 ? O[i] : t >= sg.L - 1e-6 ? O[(i + 1) % n] : [sg.a[0] + sg.ux * t - sg.nx * T, sg.a[1] + sg.uy * t - sg.ny * T];
        const list = (ops[i] || []).map(o => ({ a: Math.max(0, o.c - o.w / 2), b: Math.min(sg.L, o.c + o.w / 2), sill: z0 + o.sill, top: Math.min(z1, z0 + o.sill + o.h) })).filter(o => o.b > o.a).sort((x, y) => x.a - y.a);
        const prism = (t0, t1, za, zb2) => {
          if (t1 - t0 < 0.004 || zb2 - za < 0.004) return;
          const I0 = In(t0), I1 = In(t1), O0 = Ou(t0), O1 = Ou(t1);
          quadV(ev, v3(O0, za), v3(O1, za), v3(O1, zb2), v3(O0, zb2));                 // outside face
          quadV(ev, v3(I0, zb2), v3(O0, zb2), v3(O1, zb2), v3(I1, zb2));               // top
          if (za > zb + 0.01) quadV(ev, v3(I0, za), v3(I1, za), v3(O1, za), v3(O0, za));   // underside of a lintel
          if (t0 > 1e-6) quadV(ev, v3(I0, za), v3(O0, za), v3(O0, zb2), v3(I0, zb2));   // reveals
          if (t1 < sg.L - 1e-6) quadV(ev, v3(O1, za), v3(I1, za), v3(I1, zb2), v3(O1, zb2));
        };
        const piece = (name, mat, t0, t1, za, zb2, inset) => { if (t1 - t0 < 0.005 || zb2 - za < 0.005) return; const tc = (t0 + t1) / 2;
          pr.push({ t: "plane", n: name, m: mat, p: [sg.a[0] + sg.ux * tc + sg.nx * inset, sg.a[1] + sg.uy * tc + sg.ny * inset, (za + zb2) / 2], s: [t1 - t0, zb2 - za], r: [90, 0, sg.rz], g: G }); };
        const skirt = (name, t0, t1) => { if (t1 - t0 < 0.01) return; const tc = (t0 + t1) / 2;
          pr.push({ t: "box", n: name, m: "fascia", p: [sg.a[0] + sg.ux * tc + sg.nx * 0.009, sg.a[1] + sg.uy * tc + sg.ny * 0.009, z0 + 0.05], s: [t1 - t0, 0.018, 0.1], rz: sg.dir, b: 0.003, g: G }); };
        const WS = 1.1, inner = (id, t0, t1, za, zb2) => { piece("wall_" + id, paint, t0, t1, za, zb2, 0); if (B.dado) piece("dado_" + id, "wall_lower", t0, t1, za, Math.min(zb2, z0 + WS), 0.004); };
        let cur = 0;
        list.forEach((o, k) => {
          const id = `${f}_${i}_${k}`;
          inner(id, cur, o.a, z0, ceil); skirt("skirt_" + id, cur, o.a); prism(cur, o.a, zb, z1);
          if (o.sill > z0 + 0.01) { inner(id + "lo", o.a, o.b, z0, Math.min(o.sill, ceil)); skirt("skirtlo_" + id, o.a, o.b); prism(o.a, o.b, zb, o.sill); }
          if (o.top < ceil - 0.01) inner(id + "hi", o.a, o.b, o.top, ceil);
          if (o.top < z1 - 0.01) prism(o.a, o.b, o.top, z1);
          cur = Math.max(cur, o.b);
        });
        inner(`${f}_${i}`, cur, sg.L, z0, ceil); skirt(`skirt_${f}_${i}`, cur, sg.L); prism(cur, sg.L, zb, z1);
        if (ev.length) pr.push({ t: "tris", n: `outer_wall_${f}_${i}`, m: ext, v: ev, g: G });
        groups.push({ key: `${B.id}:w${f}:${i}`, kind: "wall", b: B.id, f, nx: sg.nx, ny: sg.ny, prims: pr });
      }
    }
    groups.push({ key: `${B.id}:roof`, kind: "roof", b: B.id, f: B.floors - 1, prims: roofPrims(B, O, `${gname} · Roof`) });
    return groups;
  }
  function roofPrims(B, O, G) {
    const R = B.roof, E = wallTopZ(B), out = [], P = B.pts, rm = "fin_" + (R.mat || "clay_tiles"), ext = "fin_" + B.ext;
    if (R.type === "none") return out;
    // ceiling of the top floor
    const cv = []; for (const i of triangulate(P)) cv.unshift(...v3(P[i], E - SLAB));   // reversed order: faces point down
    out.push({ t: "tris", n: "top_ceiling", m: "ceiling", v: cv, g: G });
    if (R.type === "flat") {
      const th = 0.25, Oi = offsetPoly(P, Math.max(0.02, B.wallT - 0.16)), dv = [], pv = [], ph = 0.75;
      for (const i of triangulate(O)) dv.push(...v3(O[i], E + th));
      out.push({ t: "tris", n: "roof_deck", m: rm, v: dv, g: G });
      for (let i = 0; i < O.length; i++) {
        const a = O[i], b = O[(i + 1) % O.length], ai = Oi[i], bi = Oi[(i + 1) % O.length];
        quadV(pv, v3(a, E), v3(b, E), v3(b, E + ph), v3(a, E + ph));            // outside of parapet
        quadV(pv, v3(bi, E + th), v3(ai, E + th), v3(ai, E + ph), v3(bi, E + ph));  // inside of parapet
        quadV(pv, v3(ai, E + ph), v3(a, E + ph), v3(b, E + ph), v3(bi, E + ph));    // coping
      }
      out.push({ t: "tris", n: "parapet", m: ext, v: pv, g: G });
      const cp = []; for (let i = 0; i < O.length; i++) { const a = O[i], b = O[(i + 1) % O.length], ai = Oi[i], bi = Oi[(i + 1) % O.length]; quadV(cp, v3(ai, E + ph + 0.002), v3(a, E + ph + 0.002), v3(b, E + ph + 0.002), v3(bi, E + ph + 0.002)); }
      out.push({ t: "tris", n: "coping", m: "steel_dark", v: cp, g: G });
      return out;
    }
    // pitched roofs sit on the footprint's bounding rectangle, aligned with its longest wall
    const segs = wallSegs({ pts: O }); let lg = segs[0]; for (const s of segs) if (s.L > lg.L) lg = s;
    let u = [lg.ux, lg.uy], v = [-lg.uy, lg.ux];
    const pr = p => [p[0] * u[0] + p[1] * u[1], p[0] * v[0] + p[1] * v[1]];
    let ss = O.map(pr), umin = Math.min(...ss.map(q => q[0])), umax = Math.max(...ss.map(q => q[0])), vmin = Math.min(...ss.map(q => q[1])), vmax = Math.max(...ss.map(q => q[1]));
    if (R.type !== "shed" && (umax - umin) < (vmax - vmin)) { [u, v] = [v, [-u[0], -u[1]]]; ss = O.map(pr); umin = Math.min(...ss.map(q => q[0])); umax = Math.max(...ss.map(q => q[0])); vmin = Math.min(...ss.map(q => q[1])); vmax = Math.max(...ss.map(q => q[1])); }
    const cu = (umin + umax) / 2, cvv = (vmin + vmax) / 2, au = (umax - umin) / 2, bv = (vmax - vmin) / 2, ov = Math.max(0, +R.over || 0);
    const Au = au + ov, Bv = bv + ov, tp = Math.tan(clamp(+R.pitch || 30, 3, 70) * D2R), zE = E - ov * tp, th = 0.14;
    const Pt = (s, t, z) => [u[0] * (cu + s) + v[0] * (cvv + t), u[1] * (cu + s) + v[1] * (cvv + t), z];
    const faces = [], walls = [];
    if (R.type === "gable") {
      const Rz = E + bv * tp;
      faces.push([Pt(-Au, -Bv, zE), Pt(Au, -Bv, zE), Pt(Au, 0, Rz + ov * 0), Pt(-Au, 0, Rz)], [Pt(Au, Bv, zE), Pt(-Au, Bv, zE), Pt(-Au, 0, Rz), Pt(Au, 0, Rz)]);
      for (const s of [-au, au]) walls.push([Pt(s, -bv, E), Pt(s, bv, E), Pt(s, 0, Rz)]);
    } else if (R.type === "hip") {
      const Rz = E + bv * tp, r = Math.max(0, Au - Bv);
      faces.push([Pt(-Au, -Bv, zE), Pt(Au, -Bv, zE), Pt(r, 0, Rz), Pt(-r, 0, Rz)], [Pt(Au, Bv, zE), Pt(-Au, Bv, zE), Pt(-r, 0, Rz), Pt(r, 0, Rz)],
                 [Pt(Au, -Bv, zE), Pt(Au, Bv, zE), Pt(r, 0, Rz)], [Pt(-Au, Bv, zE), Pt(-Au, -Bv, zE), Pt(-r, 0, Rz)]);
    } else {   // shed (mono-pitch), rising toward +v
      const zH = zE + 2 * Bv * tp, wH = E + 2 * bv * tp;
      faces.push([Pt(-Au, -Bv, zE), Pt(Au, -Bv, zE), Pt(Au, Bv, zH), Pt(-Au, Bv, zH)]);
      for (const s of [-au, au]) walls.push([Pt(s, -bv, E), Pt(s, bv, E), Pt(s, bv, wH)]);
      walls.push([Pt(-au, bv, E), Pt(au, bv, E), Pt(au, bv, wH), Pt(-au, bv, wH)]);
    }
    // the roof surface is the lowest of the roof planes, kept only over the footprint (+ overhang): works for L, T, U and angled plans
    const planes = faces.map(F => { const [p, q, r] = F, e1 = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], e2 = [r[0] - p[0], r[1] - p[1], r[2] - p[2]];
      const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]; if (Math.abs(n[2]) < 1e-9) return null;
      const A = -n[0] / n[2], Bc = -n[1] / n[2]; return { A, B: Bc, C: p[2] - A * p[0] - Bc * p[1], n }; });
    const zAt = p => Math.min(...planes.filter(Boolean).map(q => q.A * p[0] + q.B * p[1] + q.C));
    const Ov = ov > 0 ? offsetPoly(P, B.wallT + ov) : O, tidx = triangulate(Ov), tris = [];
    for (let i = 0; i < tidx.length; i += 3) tris.push([Ov[tidx[i]], Ov[tidx[i + 1]], Ov[tidx[i + 2]]]);
    const top = [], tuv = [], bot = [], edge = [], dn = (p, z) => [p[0], p[1], z - th];
    faces.forEach((F, fi) => {
      const pl = planes[fi]; if (!pl) return;
      let plan = F.map(p => [p[0], p[1]]); if (polyArea(plan) < 0) plan = plan.reverse(); if (Math.abs(polyArea(plan)) < 1e-6) return;
      const N = pl.n.map(q => q / (Math.hypot(...pl.n) || 1)), Nn = N[2] < 0 ? N.map(q => -q) : N;
      let ex = [-Nn[1], Nn[0], 0]; const el = Math.hypot(ex[0], ex[1]) || 1; ex = ex.map(q => q / el);
      const sl = [Nn[1] * ex[2] - Nn[2] * ex[1], Nn[2] * ex[0] - Nn[0] * ex[2], Nn[0] * ex[1] - Nn[1] * ex[0]];
      const tile = FIN[R.mat] ? FIN[R.mat].tile : 1.2, uvOf = p => [(p[0] * ex[0] + p[1] * ex[1]) / tile, (p[0] * sl[0] + p[1] * sl[1] + p[2] * sl[2]) / tile];
      for (const t of tris) {
        let pc = t; for (let k = 0; k < plan.length && pc.length >= 3; k++) pc = clipHalf(pc, plan[k], plan[(k + 1) % plan.length], true);
        if (pc.length < 3 || Math.abs(polyArea(pc)) < 1e-5) continue;
        const P3 = pc.map(p => [p[0], p[1], pl.A * p[0] + pl.B * p[1] + pl.C]);
        for (let k = 1; k + 1 < P3.length; k++) { for (const p of [P3[0], P3[k], P3[k + 1]]) { top.push(...p); tuv.push(...uvOf(p)); } bot.push(...dn(P3[k + 1], P3[k + 1][2]), ...dn(P3[k], P3[k][2]), ...dn(P3[0], P3[0][2])); }
      }
    });
    const along = (a, b, fn) => { const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.4)); for (let k = 0; k < n; k++) fn([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n], [a[0] + (b[0] - a[0]) * (k + 1) / n, a[1] + (b[1] - a[1]) * (k + 1) / n]); };
    for (let i = 0; i < Ov.length; i++) along(Ov[i], Ov[(i + 1) % Ov.length], (p, q) => { const zp = zAt(p), zq = zAt(q); quadV(edge, dn(p, zp), dn(q, zq), [q[0], q[1], zq], [p[0], p[1], zp]); });
    const wv = [];   // close the gaps between wall tops and the roof (gable ends, notches of L / T / U plans)
    for (let i = 0; i < O.length; i++) along(O[i], O[(i + 1) % O.length], (p, q) => { const zp = zAt(p) - th * 0.5, zq = zAt(q) - th * 0.5; if (zp - E < 0.01 && zq - E < 0.01) return;
      quadV(wv, [p[0], p[1], E], [q[0], q[1], E], [q[0], q[1], Math.max(E, zq)], [p[0], p[1], Math.max(E, zp)]); });
    out.push({ t: "tris", n: "roof", m: rm, v: top, uv: tuv, g: G }, { t: "tris", n: "soffit", m: "soffit", v: bot, g: G }, { t: "tris", n: "fascia", m: "fascia", v: edge, g: G });
    if (wv.length) out.push({ t: "tris", n: "gable_walls", m: ext, v: wv, g: G });
    return out;
  }

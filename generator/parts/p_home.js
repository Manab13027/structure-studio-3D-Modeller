  // ================================================================ everyday household items
  Object.assign(BASE_MATS, {
    velvet: { color: [0.25, 0.33, 0.36], rough: 0.95 }, oak_light: { color: [0.8, 0.66, 0.47], rough: 0.5 }, enamel: { color: [0.95, 0.95, 0.94], rough: 0.2, metal: 0.05 },
    stone_surround: { color: [0.75, 0.72, 0.66], rough: 0.8 }, fire: { color: [1.0, 0.55, 0.15], emit: 3.0 }, cotton: { color: [0.86, 0.84, 0.8], rough: 0.95 },
    kid_blue: { color: [0.36, 0.56, 0.78], rough: 0.6 }, kid_red: { color: [0.82, 0.3, 0.26], rough: 0.6 }, kid_yellow: { color: [0.95, 0.78, 0.25], rough: 0.6 },
    pool_water: { color: [0.32, 0.66, 0.78], rough: 0.03, metal: 0.25 }, pool_tile: { color: [0.83, 0.9, 0.92], rough: 0.3 }, rattan: { color: [0.55, 0.42, 0.28], rough: 0.85 },
    canvas_cream: { color: [0.9, 0.86, 0.76], rough: 0.9 }, rubber: { color: [0.1, 0.1, 0.11], rough: 0.85 }, piano_black: { color: [0.03, 0.03, 0.035], rough: 0.12, metal: 0.1 }
  });
  const H_ = (m, n, mat, x, y, z, sx, sy, sz, o) => m.box(n, mat, x, y, z, sx, sy, sz, o);   // short alias
  function drawers(m, p, x, y, w, z0, h, n, mat = "wood", pull = "steel") {
    for (let k = 0; k < n; k++) { const z = z0 + (k + 0.5) * h / n; m.box(p + "dr" + k, mat, x, y, z, w - 0.02, 0.012, h / n - 0.012, { b: 0.003 }); m.box(p + "pl" + k, pull, x, y - 0.015, z + h / n * 0.2, w * 0.3, 0.015, 0.015, { b: 0.006 }); }
  }

  // ---------------------------------------------------------------- living room
  CATALOG.sofa_l = { label: "Corner sofa", short: "Corner sofa", def: {},
    build(m) { H_(m, "baseA", "fabric", 0, 0, 0.24, 2.6, 0.9, 0.3, { b: 0.04 }); H_(m, "baseB", "fabric", 1.0, -0.95, 0.24, 0.9, 1.0, 0.3, { b: 0.04 });
      for (let k = 0; k < 3; k++) H_(m, "cush" + k, "fabric", -0.85 + k * 0.7, -0.05, 0.45, 0.68, 0.68, 0.14, { b: 0.05 });
      H_(m, "chaise", "fabric", 1.0, -1.0, 0.45, 0.82, 1.15, 0.14, { b: 0.05 }); H_(m, "back", "fabric_dark", 0, 0.38, 0.6, 2.6, 0.16, 0.5, { b: 0.05 });
      for (let k = 0; k < 3; k++) H_(m, "backc" + k, "fabric", -0.85 + k * 0.7, 0.26, 0.68, 0.64, 0.18, 0.38, { rx: -8, b: 0.07 });
      H_(m, "arm", "fabric", -1.22, 0, 0.48, 0.18, 0.9, 0.36, { b: 0.06 }); H_(m, "pillow", "fabric_warm", -0.9, 0.2, 0.72, 0.42, 0.14, 0.38, { rx: -12, dr: 8, b: 0.06 });
      for (const [x, y] of [[-1.2, 0.36], [1.35, 0.36], [1.35, -1.38], [-1.2, -0.36], [0.6, -1.38]]) m.cyl("foot" + x + y, "wood_dark", x, y, 0.045, 0.025, 0.09, { seg: 10 }); } };
  CATALOG.recliner = { label: "Recliner", short: "Recliner", def: {},
    build(m) { H_(m, "base", "leather", 0, 0, 0.25, 0.92, 0.9, 0.34, { b: 0.05 }); H_(m, "seat", "leather", 0, -0.05, 0.47, 0.6, 0.66, 0.14, { b: 0.05 });
      H_(m, "back", "leather", 0, 0.36, 0.78, 0.86, 0.24, 0.72, { rx: -14, b: 0.08 }); for (const sx of [-1, 1]) H_(m, "arm" + sx, "leather", sx * 0.36, 0, 0.55, 0.2, 0.9, 0.24, { b: 0.07 });
      H_(m, "foot", "leather", 0, -0.62, 0.36, 0.6, 0.38, 0.1, { rx: 12, b: 0.04 }); } };
  CATALOG.ottoman = { label: "Pouf / ottoman", short: "Pouf", def: {}, build(m) { m.cyl("pouf", "velvet", 0, 0, 0.21, 0.28, 0.42, { seg: 28 }); m.cyl("piping", "fabric_dark", 0, 0, 0.42, 0.285, 0.015, { seg: 28 }); } };
  CATALOG.bean_bag = { label: "Bean bag", short: "Bean bag", def: {}, build(m) { m.sph("bag", "kid_red", 0, 0, 0.3, 0.45, { sz: 0.7 }); m.sph("hollow", "kid_red", 0, 0.12, 0.55, 0.32, { sz: 0.55 }); } };
  CATALOG.side_table = { label: "Side table", short: "Side table", def: {},
    build(m) { m.cyl("top", "oak_light", 0, 0, 0.56, 0.26, 0.03, { seg: 28 }); m.cyl("stem", "steel_dark", 0, 0, 0.28, 0.025, 0.54, { seg: 12 }); m.cyl("foot", "steel_dark", 0, 0, 0.01, 0.18, 0.02, { seg: 24 });
      m.cyl("lampb", "ceramic", 0.06, 0, 0.68, 0.06, 0.2, { seg: 16 }); m.cone("lamps", "shade", 0.06, 0, 0.76, 0.13, 0.09, 0.16, 18); } };
  CATALOG.sideboard = { label: "Sideboard", short: "Sideboard", def: {},
    build(m) { H_(m, "body", "wood", 0, 0, 0.42, 1.8, 0.45, 0.68, { b: 0.008 }); for (let k = 0; k < 4; k++) { const x = -0.675 + k * 0.45; H_(m, "door" + k, "wood_light", x, -0.228, 0.42, 0.44, 0.008, 0.62, { b: 0.003 }); H_(m, "knob" + k, "brass", x + (k % 2 ? -0.18 : 0.18), -0.24, 0.5, 0.02, 0.02, 0.06, { b: 0.008 }); }
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) m.beam("leg" + sx + sy, "steel_dark", [sx * 0.82, sy * 0.18, 0], [sx * 0.85, sy * 0.19, 0.09], 0.025);
      m.cyl("vase", "ceramic", -0.55, 0, 0.88, 0.07, 0.26, { seg: 18 }); H_(m, "books", "kid_blue", 0.45, 0.02, 0.8, 0.3, 0.2, 0.08, { b: 0.004 }); H_(m, "frame", "black", 0.1, 0.12, 0.88, 0.2, 0.02, 0.26, { rx: -8, b: 0.004 }); } };
  CATALOG.console_table = { label: "Console / hall table", short: "Hall table", def: {},
    build(m) { H_(m, "top", "oak_light", 0, 0, 0.8, 1.2, 0.35, 0.035, { b: 0.008 }); H_(m, "shelf", "oak_light", 0, 0, 0.2, 1.1, 0.3, 0.025, { b: 0.006 });
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) H_(m, "leg" + sx + sy, "black", sx * 0.57, sy * 0.15, 0.4, 0.03, 0.03, 0.78, { b: 0.006 }); H_(m, "tray", "brass", 0.3, 0, 0.83, 0.3, 0.18, 0.02, { b: 0.006 }); } };
  CATALOG.fireplace = { label: "Fireplace", short: "Fireplace", wall: true, half: 0.9, def: {},
    build(m) { H_(m, "surround", "stone_surround", 0, -0.18, 0.58, 1.6, 0.36, 1.16, { b: 0.02 }); H_(m, "mantel", "wood_dark", 0, -0.22, 1.2, 1.8, 0.44, 0.08, { b: 0.012 });
      H_(m, "firebox", "black", 0, -0.33, 0.42, 0.9, 0.08, 0.62, { b: 0.01 }); H_(m, "hearth", "stone_surround", 0, -0.55, 0.03, 1.7, 0.4, 0.06, { b: 0.01 });
      for (let k = 0; k < 3; k++) m.cyl("log" + k, "wood_dark", -0.15 + k * 0.15, -0.36, 0.2, 0.05, 0.5, { rx: 90, dr: 90 + k * 12, seg: 10 });
      m.cone("flame", "fire", 0, -0.37, 0.22, 0.2, 0.02, 0.3, 10); H_(m, "glow", "fire", 0, -0.37, 0.24, 0.6, 0.02, 0.06, { b: 0 });
      H_(m, "mirror", "mirror", 0, -0.02, 1.7, 0.9, 0.02, 0.7, { b: 0.006 }); m.cyl("candle1", "white", -0.6, -0.25, 1.32, 0.03, 0.16, { seg: 10 }); m.cyl("candle2", "white", -0.5, -0.25, 1.3, 0.03, 0.12, { seg: 10 }); } };
  CATALOG.wall_tv = { label: "Wall-mounted TV", short: "Wall TV", wall: true, half: 0.85, def: {},
    build(m) { H_(m, "tv", "monitor", 0, -0.04, 1.25, 1.65, 0.04, 0.95, { b: 0.006 }); m.face("screen", texMat("tv"), 0, -0.061, 1.25, 1.61, 0.91); H_(m, "bracket", "black", 0, -0.01, 1.25, 0.4, 0.02, 0.3, { b: 0.004 }); } };
  CATALOG.wall_shelf = { label: "Wall shelves", short: "Wall shelves", wall: true, half: 0.6, def: {},
    build(m, it) { const cols = ["kid_blue", "kid_red", "olive", "white", "wood_dark"];
      for (let j = 0; j < 3; j++) { const z = 1.1 + j * 0.38; H_(m, "shelf" + j, "oak_light", 0, -0.12, z, 1.1, 0.24, 0.03, { b: 0.005 });
        for (let k = 0; k < 6; k++) if ((k + j) % 3) H_(m, `b${j}${k}`, cols[(k + j * 2) % 5], -0.45 + k * 0.08, -0.14, z + 0.13, 0.05, 0.18, 0.22, { b: 0.003 });
        m.cyl("pot" + j, "ceramic", 0.32, -0.12, z + 0.08, 0.06, 0.12, { seg: 14 }); } } };
  CATALOG.curtains = { label: "Curtains", short: "Curtains", wall: true, def: { w: 2.0, h: 2.4 }, halfFn: it => it.props.w / 2 + 0.1, dims: [["w", "Width m", 0.6, 8], ["h", "Drop m", 0.6, 4]],
    build(m, it) { const { w, h } = it.props; m.cyl("rod", "brass", 0, -0.1, h + 0.05, 0.015, w + 0.3, { rx: 90, dr: 90, seg: 10 });
      for (const sx of [-1, 1]) { const n = Math.max(4, Math.round(w / 0.16)); for (let k = 0; k < n; k++) { const x = sx * (w / 2 + 0.05 - k * 0.07); H_(m, `fold${sx}_${k}`, "cotton", x, -0.1 + (k % 2) * 0.03, h / 2 + 0.02, 0.075, 0.03, h, { b: 0.012 }); } } } };
  CATALOG.piano = { label: "Upright piano", short: "Piano", def: {},
    build(m) { H_(m, "body", "piano_black", 0, 0.12, 0.62, 1.5, 0.36, 1.24, { b: 0.01 }); H_(m, "keybed", "piano_black", 0, -0.14, 0.72, 1.5, 0.3, 0.08, { b: 0.008 });
      m.up("keys", texMat("keys"), 0, -0.16, 0.765, 1.3, 0.16); H_(m, "lid", "piano_black", 0, -0.02, 0.84, 1.42, 0.2, 0.1, { rx: -20, b: 0.008 });
      for (const sx of [-1, 1]) H_(m, "leg" + sx, "piano_black", sx * 0.7, -0.22, 0.34, 0.06, 0.06, 0.68, { b: 0.01 }); H_(m, "bench", "piano_black", 0, -0.62, 0.48, 0.8, 0.35, 0.06, { b: 0.01 });
      for (const sx of [-1, 1]) H_(m, "bleg" + sx, "piano_black", sx * 0.35, -0.62, 0.23, 0.05, 0.3, 0.46, { b: 0.008 }); } };
  CATALOG.aquarium = { label: "Aquarium", short: "Aquarium", def: {},
    build(m) { H_(m, "stand", "wood_dark", 0, 0, 0.38, 1.2, 0.45, 0.76, { b: 0.008 }); H_(m, "water", "pool_water", 0, 0, 1.04, 1.16, 0.41, 0.5, { b: 0 }); H_(m, "tank", "glass2", 0, 0, 1.06, 1.2, 0.45, 0.58, { b: 0.004 });
      H_(m, "hood", "black", 0, 0, 1.37, 1.2, 0.45, 0.06, { b: 0.006 }); for (let k = 0; k < 4; k++) m.sph("fish" + k, k % 2 ? "amber_light" : "kid_red", -0.35 + k * 0.22, -0.05 + (k % 2) * 0.08, 0.95 + k * 0.06, 0.03, { sz: 0.6 }); } };
  CATALOG.ceiling_fan = { label: "Ceiling fan", short: "Ceiling fan", def: {},
    build(m, it, room) { const z = room.h; m.cyl("rod", "steel", 0, 0, z - 0.2, 0.012, 0.4, { seg: 10 }); m.cyl("motor", "white", 0, 0, z - 0.42, 0.11, 0.12, { seg: 20 }); m.cyl("light", "shade", 0, 0, z - 0.5, 0.08, 0.05, { seg: 18 });
      for (let k = 0; k < 3; k++) { const a = k * 2.094; m.beam("blade" + k, "wood", [Math.cos(a) * 0.12, Math.sin(a) * 0.12, z - 0.42], [Math.cos(a) * 0.65, Math.sin(a) * 0.65, z - 0.44], 0.15, { t2: 0.012, b: 0.004 }); } } };
  CATALOG.ceiling_light = { label: "Ceiling light", short: "Ceiling light", def: {},
    build(m, it, room) { m.cyl("panel", "white", 0, 0, room.h - 0.02, 0.24, 0.04, { seg: 28 }); m.cyl("diffuser", "shade", 0, 0, room.h - 0.045, 0.21, 0.01, { seg: 28 }); } };
  CATALOG.pendant_light = { label: "Pendant light", short: "Pendant", def: { drop: 0.9 }, dims: [["drop", "Drop m", 0.2, 3]],
    build(m, it, room) { const z = room.h - it.props.drop; m.cyl("cord", "black", 0, 0, (room.h + z) / 2, 0.004, room.h - z, { seg: 6 }); m.cyl("canopy", "black", 0, 0, room.h - 0.02, 0.06, 0.03, { seg: 14 });
      m.cone("shade", "steel_dark", 0, 0, z - 0.28, 0.22, 0.05, 0.28, 22); m.sph("bulb", "warm_light", 0, 0, z - 0.22, 0.05); } };

  // ---------------------------------------------------------------- bedroom
  CATALOG.nightstand = { label: "Bedside table", short: "Bedside", def: {},
    build(m) { H_(m, "body", "wood", 0, 0, 0.27, 0.48, 0.4, 0.5, { b: 0.008 }); drawers(m, "", 0, -0.205, 0.46, 0.06, 0.44, 2, "wood_light", "brass");
      m.cyl("lampb", "ceramic", 0.08, 0.05, 0.6, 0.06, 0.2, { seg: 16 }); m.cone("lamps", "shade", 0.08, 0.05, 0.68, 0.14, 0.1, 0.18, 16); } };
  CATALOG.dresser = { label: "Chest of drawers", short: "Drawers", def: {},
    build(m) { H_(m, "body", "wood", 0, 0, 0.5, 1.0, 0.48, 0.92, { b: 0.008 }); drawers(m, "", 0, -0.245, 0.96, 0.08, 0.84, 4, "wood_light", "brass"); H_(m, "plinth", "wood_dark", 0, 0, 0.03, 0.96, 0.44, 0.06, { b: 0.004 }); } };
  CATALOG.dressing_table = { label: "Dressing table", short: "Dressing table", def: {},
    build(m) { H_(m, "top", "cab_white", 0, 0, 0.75, 1.1, 0.45, 0.04, { b: 0.008 }); for (const sx of [-1, 1]) { H_(m, "ped" + sx, "cab_white", sx * 0.4, 0, 0.37, 0.3, 0.43, 0.72, { b: 0.006 }); drawers(m, "d" + sx, sx * 0.4, -0.22, 0.28, 0.05, 0.66, 3, "cab_white", "brass"); }
      H_(m, "mirror", "mirror", 0, 0.18, 1.25, 0.7, 0.02, 0.85, { b: 0.006 }); H_(m, "mframe", "brass", 0, 0.19, 1.25, 0.74, 0.015, 0.89, { b: 0.004 }); m.cyl("stool", "velvet", 0, -0.45, 0.42, 0.2, 0.1, { seg: 22 });
      m.cyl("stoolleg", "brass", 0, -0.45, 0.19, 0.02, 0.38, { seg: 8 }); m.cyl("perfume", "glass2", -0.25, 0.05, 0.82, 0.03, 0.1, { seg: 10 }); } };
  CATALOG.bunk_bed = { label: "Bunk bed", short: "Bunk bed", def: {},
    build(m) { for (const sx of [-1, 1]) for (const sy of [-1, 1]) H_(m, "post" + sx + sy, "oak_light", sx * 0.5, sy * 1.0, 0.85, 0.07, 0.07, 1.7, { b: 0.01 });
      for (const z of [0.3, 1.25]) { H_(m, "frame" + z, "oak_light", 0, 0, z, 1.04, 2.04, 0.1, { b: 0.01 }); H_(m, "mat" + z, "linen", 0, 0, z + 0.12, 0.92, 1.92, 0.15, { b: 0.04 }); H_(m, "duv" + z, z > 1 ? "kid_blue" : "kid_red", 0, -0.25, z + 0.21, 0.96, 1.4, 0.05, { b: 0.025 }); H_(m, "pil" + z, "linen", 0, 0.75, z + 0.24, 0.6, 0.3, 0.1, { b: 0.04 }); }
      for (const sx of [-1, 1]) H_(m, "rail" + sx, "oak_light", sx * 0.5, 0.2, 1.62, 0.04, 1.5, 0.05, { b: 0.008 }); for (let k = 0; k < 5; k++) H_(m, "rung" + k, "oak_light", 0.5, -1.0 + 0.04, 0.45 + k * 0.25, 0.03, 0.03, 0.03, { b: 0 });
      for (let k = 0; k < 5; k++) m.beam("ladder" + k, "oak_light", [0.42, -1.06, 0.45 + k * 0.26], [0.58, -1.06, 0.45 + k * 0.26], 0.03); for (const x of [0.42, 0.58]) m.beam("lside" + x, "oak_light", [x, -1.06, 0], [x, -1.06, 1.6], 0.035); } };
  CATALOG.crib = { label: "Baby cot", short: "Cot", def: {},
    build(m) { H_(m, "mat", "linen", 0, 0, 0.42, 0.62, 1.22, 0.1, { b: 0.03 }); H_(m, "base", "cab_white", 0, 0, 0.35, 0.66, 1.26, 0.04, { b: 0.006 });
      for (const sy of [-1, 1]) H_(m, "end" + sy, "cab_white", 0, sy * 0.64, 0.45, 0.7, 0.04, 0.9, { b: 0.01 });
      for (const sx of [-1, 1]) { for (const z of [0.38, 0.88]) H_(m, `rail${sx}${z}`, "cab_white", sx * 0.33, 0, z, 0.03, 1.26, 0.03, { b: 0.006 }); for (let k = 0; k < 13; k++) H_(m, `slat${sx}${k}`, "cab_white", sx * 0.33, -0.57 + k * 0.095, 0.63, 0.018, 0.018, 0.5, { b: 0 }); }
      H_(m, "blanket", "kid_yellow", 0, -0.2, 0.48, 0.6, 0.6, 0.03, { b: 0.012 }); m.sph("teddy", "rattan", 0.12, 0.35, 0.55, 0.08); } };
  CATALOG.study_desk = { label: "Study desk & laptop", short: "Study desk", def: {},
    build(m) { H_(m, "top", "oak_light", 0, 0, 0.74, 1.2, 0.6, 0.03, { b: 0.008 }); for (const sx of [-1, 1]) for (const sy of [-1, 1]) H_(m, "leg" + sx + sy, "white", sx * 0.56, sy * 0.26, 0.37, 0.04, 0.04, 0.72, { b: 0.008 });
      H_(m, "drawer", "white", 0.35, -0.02, 0.66, 0.4, 0.5, 0.12, { b: 0.006 }); H_(m, "base", "alu", -0.1, -0.05, 0.765, 0.34, 0.24, 0.015, { b: 0.005 });
      H_(m, "lid", "alu", -0.1, 0.09, 0.88, 0.34, 0.012, 0.23, { rx: -12, b: 0.004 }); m.face("lcd", texMat("console_3"), -0.1, 0.081, 0.88, 0.31, 0.2, { rx: -12 });
      m.cyl("lampb", "black", 0.45, 0.18, 0.77, 0.07, 0.02, { seg: 14 }); m.beam("lamparm", "black", [0.45, 0.18, 0.78], [0.38, 0.1, 1.15], 0.015); m.cone("lamph", "black", 0.36, 0.06, 1.05, 0.08, 0.03, 0.1, 12); seat(m, "chair", 0, -0.55, 0, "fabric", "steel_dark"); } };

  // ---------------------------------------------------------------- bathroom & laundry
  CATALOG.double_vanity = { label: "Double vanity", short: "Double basin", def: {},
    build(m) { H_(m, "vanity", "wood", 0, 0, 0.42, 1.5, 0.5, 0.74, { b: 0.008 }); H_(m, "top", "counter", 0, 0, 0.82, 1.52, 0.52, 0.05, { b: 0.012 });
      for (const sx of [-1, 1]) { m.cyl("bowl" + sx, "enamel", sx * 0.38, -0.02, 0.89, 0.2, 0.1, { seg: 24 }); m.cyl("tap" + sx, "steel", sx * 0.38, 0.19, 0.95, 0.015, 0.2, { seg: 10 }); H_(m, "spout" + sx, "steel", sx * 0.38, 0.13, 1.04, 0.02, 0.12, 0.02, { b: 0.006 });
        H_(m, "mirror" + sx, "mirror", sx * 0.38, 0.245, 1.5, 0.6, 0.01, 0.8, { b: 0 }); H_(m, "door" + sx, "wood_light", sx * 0.38, -0.255, 0.42, 0.7, 0.01, 0.66, { b: 0.003 }); } } };
  CATALOG.towel_rail = { label: "Heated towel rail", short: "Towel rail", wall: true, half: 0.3, def: {},
    build(m) { for (const sx of [-1, 1]) m.cyl("side" + sx, "steel", sx * 0.25, -0.06, 1.05, 0.015, 1.1, { seg: 10 }); for (let k = 0; k < 9; k++) m.cyl("bar" + k, "steel", 0, -0.06, 0.55 + k * 0.12, 0.01, 0.5, { rx: 90, dr: 90, seg: 8 });
      H_(m, "towel", "cotton", 0, -0.08, 1.15, 0.42, 0.04, 0.55, { b: 0.012 }); } };
  CATALOG.bath_cabinet = { label: "Mirror cabinet", short: "Mirror cabinet", wall: true, half: 0.35, def: {},
    build(m) { H_(m, "box", "cab_white", 0, -0.07, 1.6, 0.6, 0.14, 0.7, { b: 0.006 }); for (const sx of [-1, 1]) H_(m, "mir" + sx, "mirror", sx * 0.15, -0.145, 1.6, 0.29, 0.008, 0.68, { b: 0 });
      H_(m, "light", "lamp_cool", 0, -0.08, 1.98, 0.55, 0.06, 0.03, { b: 0.01 }); } };
  function washer(m, dryer) { H_(m, "body", "enamel", 0, 0, 0.43, 0.6, 0.6, 0.85, { b: 0.02 }); H_(m, "panel", "cab_white", 0, -0.29, 0.78, 0.58, 0.04, 0.12, { b: 0.008 });
    m.cyl("ring", "steel", 0, -0.31, 0.42, 0.21, 0.04, { rx: 90, seg: 28 }); m.cyl("door", dryer ? "steel_dark" : "glass_dark", 0, -0.33, 0.42, 0.17, 0.02, { rx: 90, seg: 28 }); m.cyl("dial", "steel", 0.18, -0.315, 0.78, 0.04, 0.03, { rx: 90, seg: 16 });
    H_(m, "disp", "black", -0.1, -0.312, 0.78, 0.16, 0.004, 0.06, { b: 0 }); }
  CATALOG.washing_machine = { label: "Washing machine", short: "Washer", def: {}, build(m) { washer(m, false); } };
  CATALOG.dryer = { label: "Tumble dryer", short: "Dryer", def: {}, build(m) { washer(m, true); } };
  CATALOG.laundry_basket = { label: "Laundry basket", short: "Laundry", def: {}, build(m) { m.cone("basket", "rattan", 0, 0, 0, 0.2, 0.24, 0.55, 20); m.sph("clothes", "cotton", 0, 0, 0.52, 0.2, { sz: 0.5 }); } };
  CATALOG.water_heater = { label: "Water heater (geyser)", short: "Geyser", wall: true, half: 0.25, def: {},
    build(m) { m.cyl("tank", "enamel", 0, -0.24, 1.8, 0.22, 0.75, { seg: 24 }); m.sph("top", "enamel", 0, -0.24, 2.17, 0.22, { sz: 0.25 }); m.sph("bot", "enamel", 0, -0.24, 1.43, 0.22, { sz: 0.25 });
      for (const sx of [-0.07, 0.07]) m.cyl("pipe" + sx, "brass", sx, -0.24, 1.18, 0.012, 0.3, { seg: 8 }); m.cyl("dial", "steel_dark", 0, -0.46, 1.65, 0.04, 0.02, { rx: 90, seg: 14 }); } };

  // ---------------------------------------------------------------- kitchen
  CATALOG.kitchen_island = { label: "Kitchen island", short: "Island", def: {},
    build(m) { H_(m, "base", "cab_grey", 0, 0.1, 0.45, 2.0, 0.7, 0.8, { b: 0.008 }); H_(m, "top", "counter", 0, 0, 0.88, 2.2, 1.0, 0.05, { b: 0.012 });
      for (let k = 0; k < 4; k++) H_(m, "door" + k, "cab_grey", -0.75 + k * 0.5, 0.455, 0.47, 0.48, 0.008, 0.72, { b: 0.003 });
      for (let k = 0; k < 3; k++) { const x = -0.65 + k * 0.65; m.cyl("stool" + k, "leather", x, -0.75, 0.66, 0.18, 0.06, { seg: 20 }); m.cyl("stoolp" + k, "steel", x, -0.75, 0.33, 0.025, 0.62, { seg: 10 }); m.cyl("stoolb" + k, "steel", x, -0.75, 0.01, 0.18, 0.02, { seg: 20 }); m.cyl("stoolr" + k, "steel", x, -0.75, 0.25, 0.14, 0.015, { seg: 18 }); }
      m.cyl("bowl", "ceramic", 0.5, 0.15, 0.94, 0.15, 0.08, { seg: 20 }); for (let k = 0; k < 3; k++) m.sph("fruit" + k, k ? "kid_red" : "yellow", 0.45 + k * 0.05, 0.12 + (k % 2) * 0.06, 1.0, 0.05); } };
  CATALOG.bar_stool = { label: "Bar stool", short: "Bar stool", def: {}, build(m) { m.cyl("seat", "leather", 0, 0, 0.74, 0.19, 0.06, { seg: 20 }); m.cyl("post", "steel", 0, 0, 0.36, 0.025, 0.7, { seg: 10 }); m.cyl("base", "steel", 0, 0, 0.01, 0.2, 0.02, { seg: 20 }); m.cyl("ring", "steel", 0, 0, 0.28, 0.15, 0.015, { seg: 18 }); H_(m, "back", "leather", 0, 0.17, 0.92, 0.36, 0.04, 0.24, { b: 0.015 }); } };
  CATALOG.cooker = { label: "Cooker / range", short: "Cooker", def: {},
    build(m) { H_(m, "body", "steel", 0, 0, 0.45, 0.9, 0.62, 0.9, { b: 0.012 }); H_(m, "oven", "glass_dark", 0, -0.312, 0.42, 0.72, 0.008, 0.45, { b: 0 }); H_(m, "handle", "steel_dark", 0, -0.34, 0.7, 0.7, 0.02, 0.02, { b: 0.008 });
      H_(m, "hob", "black", 0, 0, 0.905, 0.88, 0.6, 0.01, { b: 0 }); for (const [a, b] of [[-0.22, -0.14], [0.22, -0.14], [-0.22, 0.14], [0.22, 0.14], [0, 0]]) m.cyl("burner" + a + b, "steel_dark", a, b, 0.915, 0.07, 0.012, { seg: 16 });
      for (let k = 0; k < 5; k++) m.cyl("knob" + k, "steel_dark", -0.3 + k * 0.15, -0.315, 0.8, 0.025, 0.03, { rx: 90, seg: 12 }); H_(m, "back", "steel", 0, 0.29, 0.98, 0.9, 0.04, 0.15, { b: 0.008 }); } };
  CATALOG.microwave = { label: "Microwave", short: "Microwave", def: {},
    build(m) { H_(m, "body", "steel", 0, 0, 0.15, 0.5, 0.38, 0.3, { b: 0.012 }); H_(m, "door", "glass_dark", -0.06, -0.191, 0.15, 0.34, 0.006, 0.24, { b: 0 }); H_(m, "pad", "black", 0.17, -0.191, 0.15, 0.1, 0.006, 0.24, { b: 0 }); } };
  CATALOG.dishwasher = { label: "Dishwasher", short: "Dishwasher", def: {},
    build(m) { H_(m, "body", "steel", 0, 0, 0.43, 0.6, 0.58, 0.85, { b: 0.012 }); H_(m, "handle", "steel_dark", 0, -0.3, 0.75, 0.4, 0.02, 0.02, { b: 0.008 }); H_(m, "panel", "black", 0, -0.292, 0.8, 0.5, 0.004, 0.06, { b: 0 }); } };
  CATALOG.kitchen_bin = { label: "Kitchen bin", short: "Bin", def: {}, build(m) { m.cyl("body", "steel", 0, 0, 0.32, 0.17, 0.64, { seg: 22 }); m.cyl("lid", "black", 0, 0, 0.655, 0.17, 0.03, { seg: 22 }); H_(m, "pedal", "black", 0, -0.18, 0.03, 0.12, 0.06, 0.02, { b: 0.006 }); } };
  CATALOG.water_dispenser = { label: "Water dispenser", short: "Water cooler", def: {},
    build(m) { H_(m, "body", "white", 0, 0, 0.5, 0.32, 0.32, 1.0, { b: 0.02 }); m.cyl("bottle", "glass2", 0, 0, 1.25, 0.14, 0.5, { seg: 22 }); for (const sx of [-1, 1]) H_(m, "tap" + sx, sx > 0 ? "kid_red" : "kid_blue", sx * 0.06, -0.17, 0.75, 0.04, 0.04, 0.05, { b: 0.01 }); } };
  CATALOG.dining_round = { label: "Round dining table", short: "Round table", def: {},
    build(m) { m.cyl("top", "wood", 0, 0, 0.75, 0.6, 0.04, { seg: 36 }); m.cyl("ped", "wood_dark", 0, 0, 0.38, 0.06, 0.72, { seg: 14 }); m.cyl("foot", "wood_dark", 0, 0, 0.03, 0.3, 0.06, { seg: 24 });
      for (let k = 0; k < 4; k++) { const a = k * 90, r = a * D2R; seat(m, "ch" + k, -Math.sin(r) * 0.78, Math.cos(r) * 0.78, a, "wood", "wood_dark"); } } };

  // ---------------------------------------------------------------- utility & fitness
  CATALOG.ac_split = { label: "Air conditioner (indoor)", short: "AC unit", wall: true, half: 0.45, def: {},
    build(m) { H_(m, "body", "enamel", 0, -0.12, 2.25, 0.9, 0.22, 0.3, { b: 0.05 }); H_(m, "vent", "cab_grey", 0, -0.22, 2.13, 0.8, 0.04, 0.04, { b: 0.01 }); H_(m, "led", "led_green", 0.35, -0.234, 2.2, 0.03, 0.004, 0.01, { b: 0 }); } };
  CATALOG.ac_outdoor = { label: "Air conditioner (outdoor)", short: "AC outdoor", site: true, def: {},
    build(m) { H_(m, "body", "enamel", 0, 0, 0.4, 0.85, 0.32, 0.6, { b: 0.02 }); m.cyl("grille", "cab_grey", -0.12, -0.17, 0.4, 0.24, 0.02, { rx: 90, seg: 26 }); for (const sx of [-1, 1]) H_(m, "foot" + sx, "steel_dark", sx * 0.33, 0, 0.05, 0.06, 0.4, 0.1, { b: 0.01 }); } };
  CATALOG.radiator = { label: "Radiator", short: "Radiator", wall: true, half: 0.5, def: {},
    build(m) { for (let k = 0; k < 14; k++) H_(m, "fin" + k, "enamel", -0.45 + k * 0.07, -0.06, 0.45, 0.05, 0.08, 0.55, { b: 0.012 }); m.cyl("valve", "steel", 0.52, -0.06, 0.2, 0.02, 0.1, { seg: 10 }); } };
  CATALOG.electric_panel = { label: "Fuse box", short: "Fuse box", wall: true, half: 0.25, def: {},
    build(m) { H_(m, "box", "cab_white", 0, -0.05, 1.7, 0.4, 0.1, 0.5, { b: 0.008 }); H_(m, "door", "cab_grey", 0, -0.102, 1.7, 0.36, 0.006, 0.46, { b: 0 }); H_(m, "sign", "yellow", 0, -0.106, 1.88, 0.08, 0.002, 0.07, { b: 0 }); } };
  CATALOG.treadmill = { label: "Treadmill", short: "Treadmill", def: {},
    build(m) { H_(m, "deck", "rubber", 0, 0, 0.12, 0.8, 1.8, 0.16, { b: 0.02 }); H_(m, "belt", "black", 0, 0.05, 0.205, 0.55, 1.5, 0.01, { b: 0 });
      for (const sx of [-1, 1]) m.beam("upright" + sx, "steel_dark", [sx * 0.36, -0.75, 0.2], [sx * 0.33, -0.85, 1.3], 0.05); H_(m, "console", "black", 0, -0.86, 1.32, 0.7, 0.18, 0.12, { rx: 25, b: 0.02 });
      m.face("screen", texMat("console_2"), 0, -0.91, 1.34, 0.3, 0.08, { rx: 25 }); } };
  CATALOG.exercise_bike = { label: "Exercise bike", short: "Exercise bike", def: {},
    build(m) { H_(m, "base", "rubber", 0, 0, 0.04, 0.5, 1.0, 0.06, { b: 0.02 }); m.beam("frame", "steel_dark", [0, 0.3, 0.05], [0, -0.2, 0.75], 0.07); m.beam("post", "steel_dark", [0, 0.3, 0.05], [0, 0.25, 0.85], 0.05);
      m.cyl("flywheel", "steel", 0, -0.3, 0.35, 0.22, 0.05, { rx: 90, dr: 90, seg: 24 }); H_(m, "saddle", "rubber", 0, 0.25, 0.88, 0.16, 0.26, 0.05, { b: 0.02 }); m.beam("bars", "steel_dark", [0, -0.2, 0.75], [0, -0.32, 1.1], 0.04); H_(m, "grip", "rubber", 0, -0.33, 1.1, 0.45, 0.04, 0.04, { b: 0.015 }); } };

  // ---------------------------------------------------------------- garden & outdoor living
  CATALOG.bbq = { label: "Barbecue grill", short: "BBQ", site: true, def: {},
    build(m) { H_(m, "cart", "steel_dark", 0, 0, 0.45, 1.1, 0.55, 0.7, { b: 0.012 }); H_(m, "hood", "black", 0, 0, 0.95, 0.75, 0.5, 0.3, { b: 0.1 }); for (const sx of [-1, 1]) H_(m, "shelf" + sx, "steel", sx * 0.62, 0, 0.82, 0.3, 0.45, 0.03, { b: 0.006 });
      H_(m, "handle", "steel", 0, -0.28, 1.0, 0.5, 0.03, 0.03, { b: 0.012 }); for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) m.cyl("wheel" + sx + sy, "rubber", sx * 0.5, sy * 0.22, 0.06, 0.06, 0.04, { rx: 90, dr: 90, seg: 14 }); m.cyl("gas", "kid_red", 0.3, 0.05, 0.3, 0.13, 0.45, { seg: 18 }); } };
  CATALOG.patio_set = { label: "Patio table & parasol", short: "Patio set", site: true, def: {},
    build(m) { m.cyl("top", "rattan", 0, 0, 0.73, 0.55, 0.03, { seg: 28 }); m.cyl("leg", "steel_dark", 0, 0, 0.36, 0.035, 0.72, { seg: 10 }); m.cyl("pole", "white", 0, 0, 1.3, 0.02, 2.4, { seg: 8 });
      m.cone("parasol", "canvas_cream", 0, 0, 2.05, 1.3, 0.05, 0.45, 8); m.cone("under", "canvas_cream", 0, 0, 2.04, 1.3, 0.05, 0.001, 8);
      for (let k = 0; k < 4; k++) { const a = k * 90 + 45, r = a * D2R; seat(m, "ch" + k, -Math.sin(r) * 0.85, Math.cos(r) * 0.85, a, "rattan", "steel_dark"); } } };
  CATALOG.sun_lounger = { label: "Sun lounger", short: "Lounger", site: true, def: {},
    build(m) { H_(m, "frame", "wood_light", 0, 0.15, 0.3, 0.65, 1.4, 0.05, { b: 0.01 }); H_(m, "mat", "canvas_cream", 0, 0.15, 0.34, 0.6, 1.36, 0.05, { b: 0.02 });
      H_(m, "back", "wood_light", 0, -0.75, 0.55, 0.65, 0.65, 0.05, { rx: 40, b: 0.01 }); H_(m, "bmat", "canvas_cream", 0, -0.73, 0.58, 0.6, 0.6, 0.05, { rx: 40, b: 0.02 });
      for (const sx of [-1, 1]) for (const y of [-0.8, 0.75]) H_(m, "leg" + sx + y, "wood_light", sx * 0.29, y, 0.14, 0.05, 0.05, 0.28, { b: 0.008 }); } };
  CATALOG.swing = { label: "Garden swing", short: "Swing", site: true, def: {},
    build(m) { for (const sx of [-1, 1]) { m.beam("legA" + sx, "wood", [sx * 1.3, -0.7, 0], [sx * 1.2, 0, 2.2], 0.09); m.beam("legB" + sx, "wood", [sx * 1.3, 0.7, 0], [sx * 1.2, 0, 2.2], 0.09); }
      m.beam("top", "wood", [-1.3, 0, 2.2], [1.3, 0, 2.2], 0.12); for (const x of [-0.6, -0.1, 0.1, 0.6]) m.beam("rope" + x, "rattan", [x, 0, 2.15], [x, 0, 0.5], 0.015);
      for (const x of [-0.35, 0.35]) H_(m, "seat" + x, x < 0 ? "kid_red" : "kid_blue", x, 0, 0.48, 0.45, 0.22, 0.03, { b: 0.008 }); } };
  CATALOG.slide = { label: "Children's slide", short: "Slide", site: true, def: {},
    build(m) { H_(m, "deck", "kid_yellow", 0, 0.9, 1.2, 0.8, 0.8, 0.06, { b: 0.01 }); for (const sx of [-1, 1]) for (const sy of [0.5, 1.3]) H_(m, "post" + sx + sy, "kid_blue", sx * 0.38, sy, 0.8, 0.06, 0.06, 1.6, { b: 0.01 });
      H_(m, "slide", "kid_red", 0, -0.35, 0.65, 0.55, 1.9, 0.04, { rx: 38, b: 0.01 }); for (const sx of [-1, 1]) H_(m, "lip" + sx, "kid_red", sx * 0.28, -0.35, 0.72, 0.04, 1.9, 0.14, { rx: 38, b: 0.01 });
      for (let k = 0; k < 5; k++) H_(m, "step" + k, "kid_blue", 0, 1.35 + k * 0.05, 0.2 + k * 0.22, 0.6, 0.12, 0.04, { b: 0.008 }); } };
  CATALOG.trampoline = { label: "Trampoline", short: "Trampoline", site: true, def: {},
    build(m) { m.cyl("mat", "rubber", 0, 0, 0.8, 1.6, 0.02, { seg: 36 }); m.cyl("pad", "kid_blue", 0, 0, 0.82, 1.75, 0.04, { seg: 36 }); m.cyl("padhole", "rubber", 0, 0, 0.83, 1.58, 0.04, { seg: 36 });
      for (let k = 0; k < 6; k++) { const a = k * 1.047; m.beam("leg" + k, "steel", [Math.cos(a) * 1.7, Math.sin(a) * 1.7, 0], [Math.cos(a) * 1.7, Math.sin(a) * 1.7, 0.8], 0.04); m.beam("net" + k, "steel_dark", [Math.cos(a) * 1.72, Math.sin(a) * 1.72, 0.8], [Math.cos(a) * 1.72, Math.sin(a) * 1.72, 2.6], 0.03); } } };
  CATALOG.pool = { label: "Swimming pool", short: "Pool", site: true, def: { w: 8, d: 4 }, dims: [["w", "Length m", 2, 40], ["d", "Width m", 1.5, 20]],
    build(m, it) { const { w, d } = it.props; m.up("water", "pool_water", 0, 0, 0.03, w, d); m.box("liner", "pool_tile", 0, 0, 0.012, w + 0.02, d + 0.02, 0.02, { b: 0 });
      for (const sy of [-1, 1]) m.box("copeL" + sy, "concrete", 0, sy * (d / 2 + 0.2), 0.06, w + 0.8, 0.4, 0.12, { b: 0.02 }); for (const sx of [-1, 1]) m.box("copeW" + sx, "concrete", sx * (w / 2 + 0.2), 0, 0.06, 0.4, d, 0.12, { b: 0.02 });
      for (const x of [-0.25, 0.25]) m.beam("ladder" + x, "steel", [w / 2 - 0.6 + x, -d / 2 - 0.25, 0.12], [w / 2 - 0.6 + x, -d / 2 + 0.05, 0.9], 0.03); } };
  CATALOG.doghouse = { label: "Dog kennel", short: "Kennel", site: true, def: {},
    build(m) { m.box("body", "wood", 0, 0, 0.35, 0.8, 1.0, 0.7, { b: 0.01 }); for (const s of [-1, 1]) m.box("roof" + s, "kid_red", s * 0.24, 0, 0.86, 0.6, 1.15, 0.04, { ry: s * 35, b: 0.008 });
      m.face("door", "black", 0, -0.505, 0.27, 0.36, 0.45); m.cyl("bowl", "steel", 0.3, -0.75, 0.04, 0.1, 0.06, { seg: 16 }); } };
  CATALOG.mailbox = { label: "Mailbox", short: "Mailbox", site: true, def: {},
    build(m) { m.box("post", "wood_dark", 0, 0, 0.55, 0.09, 0.09, 1.1, { b: 0.01 }); m.box("box", "black", 0, -0.05, 1.15, 0.25, 0.45, 0.2, { b: 0.04 }); m.box("flag", "kid_red", 0.135, 0, 1.25, 0.01, 0.06, 0.15, { b: 0 }); } };
  CATALOG.garden_lamp = { label: "Garden lamp", short: "Garden lamp", site: true, def: {},
    build(m) { m.cyl("post", "steel_dark", 0, 0, 0.35, 0.04, 0.7, { seg: 10 }); m.cyl("lamp", "warm_light", 0, 0, 0.75, 0.07, 0.12, { seg: 14 }); m.cone("cap", "steel_dark", 0, 0, 0.81, 0.12, 0.02, 0.08, 14); } };
  CATALOG.planter = { label: "Raised planter", short: "Planter", site: true, def: {},
    build(m, it) { const acc = acc0(); m.box("box", "wood", 0, 0, 0.3, 1.6, 0.6, 0.6, { b: 0.012 }); m.up("soil", "soil", 0, 0, 0.58, 1.5, 0.5);
      for (let k = 0; k < 6; k++) { const x = -0.6 + k * 0.24; hingedCard(acc, [x, 0, 0.58], [0, 0, 1], [1, 0, 0], 0.45, 0.4, 1.2); hingedCard(acc, [x, 0, 0.58], [0, 0, 1], [0, 1, 0], 0.45, 0.4, 1.2); }
      m.tris("plants", "leaf_bed", acc.v, false, acc.uv, acc.nn); } };
  CATALOG.bicycle = { label: "Bicycle", short: "Bicycle", site: true, def: {},
    build(m) { for (const y of [-0.52, 0.52]) { m.cyl("tyre" + y, "rubber", 0, y, 0.34, 0.34, 0.04, { rx: 90, dr: 90, seg: 28 }); m.cyl("hub" + y, "steel", 0, y, 0.34, 0.05, 0.06, { rx: 90, dr: 90, seg: 12 }); }
      m.beam("down", "kid_blue", [0, -0.45, 0.34], [0, 0.0, 0.32], 0.035); m.beam("top", "kid_blue", [0, -0.4, 0.75], [0, 0.1, 0.72], 0.035); m.beam("seat", "kid_blue", [0, 0.0, 0.32], [0, 0.12, 0.8], 0.035);
      m.beam("fork", "steel", [0, -0.52, 0.34], [0, -0.42, 0.85], 0.03); m.beam("chain", "kid_blue", [0, 0.0, 0.32], [0, 0.52, 0.34], 0.03); m.box("saddle", "rubber", 0, 0.13, 0.84, 0.12, 0.24, 0.05, { b: 0.02 }); m.beam("bars", "steel", [-0.25, -0.42, 0.9], [0.25, -0.42, 0.9], 0.025); } };
  CATALOG.clothesline = { label: "Rotary clothes line", short: "Clothes line", site: true, def: {},
    build(m) { m.cyl("pole", "steel", 0, 0, 0.9, 0.025, 1.8, { seg: 10 }); for (let k = 0; k < 4; k++) { const a = k * 1.571; m.beam("arm" + k, "steel", [0, 0, 1.6], [Math.cos(a) * 1.4, Math.sin(a) * 1.4, 1.8], 0.025); }
      for (let r = 1; r <= 3; r++) for (let k = 0; k < 4; k++) { const a = k * 1.571, b = a + 1.571, R = r * 0.45; m.beam(`line${r}${k}`, "white", [Math.cos(a) * R, Math.sin(a) * R, 1.6 + R * 0.14], [Math.cos(b) * R, Math.sin(b) * R, 1.6 + R * 0.14], 0.006, { b: 0 }); }
      for (let k = 0; k < 3; k++) m.box("sheet" + k, k ? "kid_blue" : "cotton", 0.5 + k * 0.15, 0.4, 1.4, 0.5, 0.01, 0.6, { dr: 45, b: 0 }); } };
  CATALOG.firepit = { label: "Fire pit", short: "Fire pit", site: true, def: {},
    build(m) { for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283; m.sph("stone" + k, "stone_surround", Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0.12, 0.15, { sz: 0.8 }); } m.cone("flame", "fire", 0, 0, 0.05, 0.25, 0.02, 0.45, 10);
      for (let k = 0; k < 3; k++) m.cyl("log" + k, "wood_dark", 0, 0, 0.08, 0.05, 0.6, { rx: 90, dr: k * 60, seg: 10 }); } };
  CATALOG.gate = { label: "Garden gate", short: "Gate", wall: true, def: { w: 1.2, h: 1.4 }, halfFn: it => it.props.w / 2 + 0.1,
    opening: it => ({ w: it.props.w, h: 6, sill: 0 }), dims: [["w", "Width m", 0.8, 6], ["h", "Height m", 0.6, 3]],
    build(m, it) { const { w, h } = it.props, n = Math.max(4, Math.round(w / 0.12)); for (const sx of [-1, 1]) m.box("post" + sx, "wood_dark", sx * (w / 2 + 0.05), 0, h / 2 + 0.1, 0.1, 0.1, h + 0.2, { b: 0.01 });
      for (const z of [0.25, h - 0.15]) m.box("rail" + z, "wood", 0, 0, z, w - 0.04, 0.04, 0.08, { b: 0.006 }); for (let k = 0; k < n; k++) m.box("p" + k, "wood_light", -w / 2 + (k + 0.5) * w / n, 0.03, h / 2 + 0.05, 0.08, 0.02, h - 0.1, { b: 0.004 }); } };

  // ---------------------------------------------------------------- the Add panel categories
  CATS.length = 0;
  CATS.push(
    ["Structure", ["stairs", "door", "door2", "archway", "window", "garage", "curtains", "partition", "column", "dais", "radiator", "fireplace"]],
    ["Living", ["sofa", "sofa_l", "armchair", "recliner", "coffee_table", "side_table", "tv_unit", "wall_tv", "sideboard", "console_table", "bookshelf", "wall_shelf", "rug", "ottoman", "bean_bag", "piano", "aquarium", "wall_art", "mirror", "floor_lamp"]],
    ["Lighting & air", ["ceiling_light", "pendant_light", "ceiling_fan", "floor_lamp", "ac_split", "ac_outdoor", "radiator", "water_heater", "electric_panel"]],
    ["Bedroom", ["bed_double", "bed_single", "bunk_bed", "crib", "nightstand", "wardrobe", "dresser", "dressing_table", "study_desk"]],
    ["Kitchen & dining", ["kitchen", "kitchen_island", "cooker", "fridge", "dishwasher", "microwave", "kitchen_bin", "water_dispenser", "dining_table", "dining_round", "bar_stool"]],
    ["Bath & laundry", ["bathtub", "shower", "toilet", "basin", "double_vanity", "bath_cabinet", "towel_rail", "washing_machine", "dryer", "laundry_basket", "water_heater"]],
    ["Plants & trees", ["plant", "fiddle_fig", "snake_plant", "areca_palm", "flower_pot", "tree", "maple", "birch", "conifer", "palm", "bush", "flower_bush", "grass_tuft", "flower_bed", "hedge", "planter"]],
    ["Garden & outdoor", ["patio_set", "bbq", "sun_lounger", "swing", "slide", "trampoline", "pool", "firepit", "pond", "bench", "garden_lamp", "doghouse", "mailbox", "bicycle", "clothesline", "gate", "path", "fence", "pwall", "car"]],
    ["Office", ["office_desk", "meeting_table", "reception", "lockers", "printer", "cabinet", "whiteboard", "chair", "stool", "treadmill", "exercise_bike"]],
    ["Ops & security", ["console", "command", "table", "videowall", "wallmap", "stand", "clock", "sign", "rack", "flag"]],
    ["Site & roads", ["road", "parking", "truck", "street_light", "bin", "bollard", "barrier", "guard_booth", "utility_box", "helipad", "flagpole"]],
    ["Infrastructure", ["generator", "water_tank", "container", "fuel_tank", "solar_array", "pallet_rack", "bridge"]],
    ["Large structures", ["lattice_tower", "mast", "dish", "water_tower", "wind_turbine", "silo", "hangar", "shed"]]
  );

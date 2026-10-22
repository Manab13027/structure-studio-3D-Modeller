  // ================================================================ materials
  const BASE_MATS = {
    wall: { color: [0.43, 0.46, 0.47], rough: 0.92, cull: true }, wall_lower: { color: [0.25, 0.28, 0.29], rough: 0.85, cull: true },
    wall_cap: { color: [0.16, 0.18, 0.19], rough: 0.8 }, rail: { color: [0.55, 0.53, 0.46], rough: 0.4, metal: 0.6 },
    base: { color: [0.10, 0.11, 0.12], rough: 0.9 }, floor: { color: [1, 1, 1], rough: 0.55, tex: "floor" },
    frame: { color: [0.06, 0.065, 0.07], rough: 0.45, metal: 0.3 }, alu: { color: [0.62, 0.64, 0.66], rough: 0.32, metal: 0.9 },
    console: { color: [0.21, 0.23, 0.24], rough: 0.5, metal: 0.25 }, desktop: { color: [0.36, 0.37, 0.35], rough: 0.55 },
    edge: { color: [0.12, 0.12, 0.12], rough: 0.5 }, monitor: { color: [0.045, 0.045, 0.05], rough: 0.35, metal: 0.2 },
    chair: { color: [0.075, 0.08, 0.085], rough: 0.85 }, mesh_back: { color: [0.12, 0.13, 0.14], rough: 0.9 },
    chair_leg: { color: [0.32, 0.33, 0.35], rough: 0.28, metal: 0.9 }, caster: { color: [0.03, 0.03, 0.03], rough: 0.6 },
    table_body: { color: [0.17, 0.19, 0.18], rough: 0.55, metal: 0.15 }, table_rim: { color: [0.45, 0.42, 0.30], rough: 0.35, metal: 0.65 },
    dais: { color: [0.24, 0.26, 0.24], rough: 0.75 }, door: { color: [0.36, 0.29, 0.21], rough: 0.6 },
    rack: { color: [0.09, 0.10, 0.11], rough: 0.45, metal: 0.5 }, blue_marker: { color: [0.15, 0.45, 0.95], rough: 0.45 },
    red_marker: { color: [0.90, 0.18, 0.15], rough: 0.45 }, pin: { color: [0.85, 0.85, 0.80], rough: 0.25, metal: 0.85 },
    keyboard: { color: [0.11, 0.11, 0.12], rough: 0.7 }, olive: { color: [0.33, 0.36, 0.22], rough: 0.85 },
    white: { color: [0.86, 0.86, 0.84], rough: 0.4 }, pc: { color: [0.13, 0.14, 0.15], rough: 0.5, metal: 0.3 },
    red: { color: [0.75, 0.08, 0.06], rough: 0.35 }, black: { color: [0.03, 0.03, 0.03], rough: 0.5 },
    leaf: { color: [0.18, 0.36, 0.17], rough: 0.8 }, leaf2: { color: [0.24, 0.45, 0.2], rough: 0.8 }, soil: { color: [0.2, 0.14, 0.09], rough: 1 },
    pot: { color: [0.3, 0.31, 0.3], rough: 0.6 }, cabinet: { color: [0.27, 0.29, 0.28], rough: 0.5, metal: 0.4 },
    led_strip: { color: [0.55, 0.85, 1.0], emit: 3.0 }, led_green: { color: [0.3, 1.0, 0.45], emit: 3.0 }, warm_light: { color: [1.0, 0.92, 0.75], emit: 3.0 },
    select: { color: [0.79, 0.71, 0.42], emit: 3.0 }, handle: { color: [0.5, 0.95, 0.65], emit: 3.0 },
    glass: { color: [0.62, 0.75, 0.84], rough: 0.05, metal: 0.3, emit: 0.55, cull: true },
    glass2: { color: [0.55, 0.68, 0.76], rough: 0.05, metal: 0.4, emit: 0.2 },
    partition: { color: [0.47, 0.5, 0.5], rough: 0.85 }
  };
  const EMIT = Object.fromEntries(LIB.map(l => [l.key, l.emit]));
  function texMat(key) { return "tex_" + key; }
  const ASSET_MATS = {};
  const colMat = hex => "col_" + String(hex || "#888888").replace("#", "").toLowerCase();
  function material(name) {
    if (BASE_MATS[name]) return BASE_MATS[name];
    if (name.startsWith("col_")) { const h = name.slice(4), v = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); return BASE_MATS[name] = { color: v.map(x => isFinite(x) ? x : 0.5), rough: 0.5, metal: 0.1 }; }
    if (name.startsWith("fin_")) { const k = name.slice(4), f = FIN[k]; if (!f) return BASE_MATS.concrete;
      const tk = f.tex || name; if (!f.tex && !TEX[name]) { TEX[name] = drawFin(k); EMIT[name] = 0; }
      return BASE_MATS[name] = { color: [1, 1, 1], rough: f.rough ?? 0.8, metal: f.metal || 0, tex: tk, tile: f.tile, emit: 0 }; }
    if (name.startsWith("paint_")) { const h = name.slice(6), v = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); return BASE_MATS[name] = { color: v.map(x => isFinite(x) ? x : 0.8), rough: 0.92, cull: true }; }
    if (name.startsWith("asset:")) return ASSET_MATS[name] || { color: [0.6, 0.6, 0.6], rough: 0.6 };
    const key = name.slice(4);
    return { color: [1, 1, 1], rough: 0.3, tex: key, emit: EMIT[key] ?? 1.2 };
  }

  // ================================================================ catalogue of equipment
  // Builders work in the item's local frame: origin on the floor (wall items: on the wall surface),
  // local +Y toward the wall / screens, the person using it stands on local -Y.
  // box options: dr (extra rotation about Z), rx (tilt about local X), b (edge bevel radius, metres)
  // Every item can be resized with props.scale = [width, depth, height] factors.
  const hashOf = id => { let h = 0; for (const ch of String(id)) h = (h * 33 + ch.charCodeAt(0)) >>> 0; return h; };

  function chairParts(m, p, lx, ly) {
    for (let k = 0; k < 5; k++) {                                   // five-star base with casters
      const a = (k * 72 + 18) * D2R, ca = Math.cos(a), sa = Math.sin(a);
      m.box(p + "leg" + k, "chair_leg", lx + ca * 0.15, ly + sa * 0.15, 0.075, 0.3, 0.045, 0.03, { dr: k * 72 + 18, b: 0.012 });
      m.cyl(p + "wheel" + k, "caster", lx + ca * 0.29, ly + sa * 0.29, 0.03, 0.03, 0.028, { rx: 90, dr: k * 72 + 108, seg: 14 });
    }
    m.cyl(p + "hub", "chair_leg", lx, ly, 0.08, 0.05, 0.06);
    m.cyl(p + "lift", "chair_leg", lx, ly, 0.26, 0.022, 0.32, { seg: 14 });
    m.box(p + "mech", "black", lx, ly, 0.43, 0.24, 0.26, 0.05);
    m.box(p + "seat", "chair", lx, ly + 0.02, 0.5, 0.5, 0.48, 0.09, { b: 0.04 });
    m.box(p + "spine", "black", lx, ly - 0.25, 0.6, 0.06, 0.03, 0.26, { rx: 8 });
    m.box(p + "back", "mesh_back", lx, ly - 0.29, 0.9, 0.46, 0.06, 0.56, { rx: 8, b: 0.03 });
    m.box(p + "lumbar", "chair", lx, ly - 0.255, 0.78, 0.4, 0.03, 0.12, { rx: 8, b: 0.012 });
    for (const sx of [-1, 1]) {
      m.box(p + "armpost" + sx, "black", lx + sx * 0.27, ly - 0.02, 0.6, 0.035, 0.05, 0.2, { b: 0.01 });
      m.box(p + "armpad" + sx, "chair", lx + sx * 0.27, ly + 0.02, 0.71, 0.07, 0.27, 0.03, { b: 0.012 });
    }
  }
  function monitorParts(m, p, lx, ly, z, tex, tilt, w = 0.62, h = 0.37) {
    const t = tilt * D2R;
    const at = d => [lx - d * Math.sin(t), ly + d * Math.cos(t)];   // point d metres along the screen's local +Y
    m.box(p + "body", "monitor", lx, ly, z, w, 0.028, h, { dr: tilt, b: 0.006 });
    const [hx, hy] = at(0.03); m.box(p + "hump", "monitor", hx, hy, z - 0.02, w * 0.45, 0.04, h * 0.5, { dr: tilt, b: 0.012 });
    const [sx, sy] = at(-0.0165); m.face(p + "screen", texMat(tex), sx, sy, z + 0.008, w - 0.03, h - 0.045, { dr: tilt });
    const [lx2, ly2] = at(-0.0152); m.box(p + "logo", "chair_leg", lx2, ly2, z - h / 2 + 0.012, 0.04, 0.002, 0.006, { dr: tilt, b: 0 });
  }
  function deskParts(m, p, it, width, screens) {
    const h = hashOf(it.id);
    m.box(p + "top", "desktop", 0, 0, 0.74, width, 0.8, 0.035, { b: 0.012 });
    m.box(p + "edgeband", "edge", 0, -0.401, 0.74, width - 0.02, 0.004, 0.03, { b: 0 });
    for (const sx of [-1, 1]) {
      m.box(p + "leg" + sx, "console", sx * (width / 2 - 0.04), 0.02, 0.37, 0.04, 0.68, 0.7, { b: 0.01 });
      m.box(p + "foot" + sx, "black", sx * (width / 2 - 0.04), 0.02, 0.012, 0.06, 0.74, 0.024, { b: 0.008 });
    }
    m.box(p + "modesty", "console", 0, 0.34, 0.45, width - 0.1, 0.02, 0.5, { b: 0.006 });
    m.box(p + "tray", "black", 0, 0.24, 0.63, width - 0.3, 0.14, 0.05, { b: 0.004 });
    // monitor rail with arms
    m.box(p + "rail", "alu", 0, 0.34, 0.78, width - 0.24, 0.04, 0.03, { b: 0.008 });
    const n = screens.length, sp = Math.min(0.64, (width - 0.2) / n);
    screens.forEach((tex, i) => {
      const lx = (i - (n - 1) / 2) * sp, tilt = -(i - (n - 1) / 2) * 12;
      m.cyl(p + "pole" + i, "alu", lx, 0.34, 0.93, 0.014, 0.3, { seg: 12 });
      m.box(p + "arm" + i, "alu", lx, 0.27, 1.06, 0.03, 0.14, 0.025, { b: 0.008 });
      monitorParts(m, p + "mon" + i, lx, 0.2, 1.1, tex, tilt);
    });
    // keyboard with key field, mouse
    m.box(p + "kbd", "keyboard", 0, -0.17, 0.765, 0.44, 0.14, 0.018, { b: 0.006 });
    m.up(p + "keys", texMat("keys"), 0, -0.17, 0.776, 0.42, 0.12);
    m.box(p + "mouse", "keyboard", 0.32, -0.17, 0.77, 0.06, 0.1, 0.03, { b: 0.014 });
    // phone, PC tower, mug (varies per desk so rows don't look cloned)
    if (h % 3 !== 0) { const px = -width / 2 + 0.22;
      m.box(p + "phone", "keyboard", px, -0.08, 0.775, 0.2, 0.18, 0.035, { rx: -10, b: 0.012 });
      m.box(p + "handset", "black", px - 0.06, -0.08, 0.8, 0.05, 0.19, 0.03, { b: 0.012 });
      m.up(p + "phscreen", texMat("console_3"), px + 0.04, -0.06, 0.7955, 0.08, 0.05); }
    if (h % 2 === 0) { m.cyl(p + "mug", "white", width / 2 - 0.2, -0.05, 0.805, 0.04, 0.095); m.cyl(p + "coffee", "soil", width / 2 - 0.2, -0.05, 0.851, 0.034, 0.004); }
    m.box(p + "pc", "pc", width / 2 - 0.22, 0.12, 0.23, 0.2, 0.46, 0.44, { b: 0.012 });
    m.box(p + "pcled", "led_strip", width / 2 - 0.22, -0.111, 0.42, 0.01, 0.003, 0.01, { b: 0 });
    chairParts(m, p + "chair_", 0, -0.72);
  }
  const MARKERS = { blue: [[.3, .3], [.32, .55], [.28, .78], [.18, .5], [.42, .42]], red: [[.66, .24], [.83, .5], [.78, .74], [.9, .3]],
                    pins: [[.62, .32, "red_marker"], [.8, .62, "red_marker"], [.55, .12, "blue_marker"]] };

  const CATALOG = {
    console: { label: "Operator console", short: "Console", slots: [["s0", "Left screen"], ["s1", "Right screen"]],
      def: { s0: "console_0", s1: "console_1" }, build(m, it) { deskParts(m, "", it, 1.6, [it.props.s0, it.props.s1]); } },
    command: { label: "Command desk", short: "Command desk", slots: [["s0", "Left screen"], ["s1", "Centre screen"], ["s2", "Right screen"]],
      def: { s0: "isr_feed", s1: "cop_main", s2: "force_status" }, build(m, it) { deskParts(m, "", it, 2.1, [it.props.s0, it.props.s1, it.props.s2]); } },
    table: { label: "Map table", short: "Map table", slots: [["map", "Table map"]], def: { map: "tactical_map", markers: true },
      build(m, it) {
        m.box("plinth", "black", 0, 0, 0.05, 4.0, 2.2, 0.1, { b: 0.01 });
        m.box("body", "table_body", 0, 0, 0.47, 4.3, 2.5, 0.74, { b: 0.03 });
        for (const sy of [-1, 1]) m.box("panel" + sy, "console", 0, sy * 1.252, 0.47, 3.9, 0.006, 0.5, { b: 0 });
        m.box("rim", "table_rim", 0, 0, 0.865, 4.5, 2.7, 0.05, { b: 0.022 });
        m.box("bed", "black", 0, 0, 0.887, 4.3, 2.5, 0.006, { b: 0 });
        m.up("map", texMat(it.props.map), 0, 0, 0.892, 4.2, 2.4);
        for (const sy of [-1, 1]) m.box("led" + sy, "led_strip", 0, sy * 1.36, 0.82, 4.3, 0.012, 0.012, { b: 0 });
        for (const sx of [-1, 1]) m.box("ledx" + sx, "led_strip", sx * 2.26, 0, 0.82, 0.012, 2.5, 0.012, { b: 0 });
        m.box("ctrl", "monitor", 2.0, -1.3, 0.93, 0.36, 0.04, 0.22, { rx: -35, b: 0.008 });
        m.face("ctrlscr", texMat("console_2"), 2.0, -1.328, 0.942, 0.32, 0.18, { rx: -35 });
        if (it.props.markers) {
          const xy = (fx, fy) => [-2.1 + 4.2 * fx, 1.2 - 2.4 * fy];
          MARKERS.blue.forEach(([fx, fy], i) => { const [x, y] = xy(fx, fy); m.box("blue" + i, "blue_marker", x, y + 0.09, 0.92, 0.13, 0.09, 0.05, { b: 0.01 }); });
          MARKERS.red.forEach(([fx, fy], i) => { const [x, y] = xy(fx, fy); m.box("red" + i, "red_marker", x, y + 0.09, 0.92, 0.1, 0.1, 0.05, { dr: 45, b: 0.01 }); });
          MARKERS.pins.forEach(([fx, fy, mt], i) => { const [x, y] = xy(fx, fy);
            m.cyl("pin" + i, "pin", x, y, 1.02, 0.006, 0.25, { seg: 8 }); m.sph("pinhead" + i, mt, x, y, 1.15, 0.016);
            m.box("flag" + i, mt, x + 0.07, y, 1.1, 0.13, 0.004, 0.08, { b: 0 }); });
        }
      } },
    videowall: { label: "Video wall", short: "Video wall", wall: true, half: 4.2,
      slots: [["center", "Centre display"], ["tl", "Top left"], ["bl", "Bottom left"], ["tr", "Top right"], ["br", "Bottom right"]],
      def: { center: "cop_main", tl: "isr_feed", bl: "force_status", tr: "radar_wide", br: "sync_matrix" },
      build(m, it) {
        m.box("backplate", "frame", 0, -0.04, 1.95, 8.3, 0.08, 2.62, { b: 0.01 });
        m.box("credenza", "console", 0, -0.27, 0.3, 8.0, 0.5, 0.6, { b: 0.015 });
        m.box("credtop", "desktop", 0, -0.27, 0.61, 8.06, 0.54, 0.025, { b: 0.008 });
        for (let k = -3; k <= 3; k++) m.box("doorseam" + k, "black", k * 1.14, -0.521, 0.3, 0.006, 0.004, 0.52, { b: 0 });
        // centre: 2x2 tiled 'video wall' with thin seams, sides: single displays with bezels
        m.box("cbezel", "monitor", 0, -0.12, 1.95, 3.66, 0.08, 2.46, { b: 0.01 });
        m.face("center", texMat(it.props.center), 0, -0.163, 1.95, 3.6, 2.4);
        m.box("seamv", "monitor", 0, -0.166, 1.95, 0.006, 0.003, 2.4, { b: 0 });
        m.box("seamh", "monitor", 0, -0.166, 1.95, 3.6, 0.003, 0.006, { b: 0 });
        for (const [k, x, z] of [["tl", -2.95, 2.575], ["bl", -2.95, 1.325], ["tr", 2.95, 2.575], ["br", 2.95, 1.325]]) {
          m.box(k + "bezel", "monitor", x, -0.12, z, 2.06, 0.07, 1.21, { b: 0.012 });
          m.face(k, texMat(it.props[k]), x, -0.158, z, 2.0, 1.15);
        }
        m.box("soundbar", "black", 0, -0.2, 0.69, 2.4, 0.1, 0.08, { b: 0.03 });
        m.box("led", "led_strip", 0, -0.18, 3.28, 8.2, 0.012, 0.012, { b: 0 });
      } },
    wallmap: { label: "Wall map board", short: "Wall map", wall: true, half: 2.3, slots: [["map", "Map"]], def: { map: "wall_topo" },
      build(m, it) {
        m.box("frame", "alu", 0, -0.025, 2.1, 4.5, 0.05, 2.35, { b: 0.012 });
        m.box("backing", "white", 0, -0.04, 2.1, 4.4, 0.03, 2.25, { b: 0 });
        m.face("map", texMat(it.props.map), 0, -0.0585, 2.1, 4.3, 2.15);
        m.box("glare", "alu", 0, -0.06, 0.985, 4.3, 0.04, 0.02, { b: 0.008 });   // bottom ledge
        for (const sx of [-1, 1]) m.box("lamparm" + sx, "frame", sx * 1.2, -0.12, 3.33, 0.02, 0.24, 0.02, { b: 0.005 });
        m.box("lamp", "frame", 0, -0.24, 3.31, 3.0, 0.06, 0.05, { b: 0.015 });
        m.box("lampglow", "warm_light", 0, -0.24, 3.284, 2.9, 0.035, 0.004, { b: 0 });
      } },
    stand: { label: "Display on stand", short: "Display stand", slots: [["s0", "Display"]], def: { s0: "radar_wide" },
      build(m, it) {
        for (const sx of [-1, 1]) {
          m.box("foot" + sx, "black", sx * 0.35, 0, 0.04, 0.08, 0.7, 0.05, { b: 0.015 });
          for (const sy of [-1, 1]) m.cyl("wheel" + sx + sy, "caster", sx * 0.35, sy * 0.3, 0.025, 0.025, 0.025, { rx: 90, seg: 12 });
          m.box("pole" + sx, "alu", sx * 0.35, 0.03, 0.85, 0.06, 0.04, 1.6, { b: 0.01 });
        }
        m.box("cross", "alu", 0, 0.03, 0.55, 0.7, 0.03, 0.06, { b: 0.008 });
        monitorParts(m, "disp", 0, -0.02, 1.45, it.props.s0, 0, 1.7, 0.98);
      } },
    whiteboard: { label: "Whiteboard", short: "Whiteboard", wall: true, half: 1.15, slots: [["s0", "Board content"]], def: { s0: "whiteboard" },
      build(m, it) {
        m.box("frame", "alu", 0, -0.02, 1.6, 2.2, 0.035, 1.4, { b: 0.01 });
        m.face("board", texMat(it.props.s0), 0, -0.0405, 1.6, 2.12, 1.32);
        m.box("tray", "alu", 0, -0.06, 0.9, 1.4, 0.07, 0.025, { b: 0.008 });
        ["red", "black", "blue_marker"].forEach((c, i) => m.cyl("marker" + i, c, -0.3 + i * 0.15, -0.065, 0.925, 0.009, 0.13, { rx: 90, dr: 90, seg: 10 }));
      } },
    sign: { label: "Room sign", short: "Sign", wall: true, half: 2.25, text: true, def: { text: "JOINT OPERATIONS CENTRE" },
      build(m, it, room) {
        m.box("plate", "frame", 0, -0.02, room.h - 0.6, 4.5, 0.03, 0.62, { b: 0.01 });
        m.face("sign", texMat(signKey(it.props.text)), 0, -0.0375, room.h - 0.6, 4.4, 0.55);
      } },
    clock: { label: "Clock strip", short: "Clocks", wall: true, half: 1.5, def: {},
      build(m, it, room) { m.box("frame", "frame", 0, -0.06, room.h - 0.24, 2.9, 0.1, 0.38, { b: 0.015 }); m.face("clocks", texMat("clocks"), 0, -0.113, room.h - 0.24, 2.76, 0.32); } },
    door: { label: "Door", short: "Door", wall: true, half: 0.85, def: { exit: false }, flags: [["exit", "Exit sign & extinguisher"]], opening: () => ({ w: 1.17, h: 2.16, sill: 0 }),
      build(m, it) {
        m.box("frameL", "alu", -0.6, -0.04, 1.08, 0.07, 0.09, 2.16, { b: 0.01 }); m.box("frameR", "alu", 0.6, -0.04, 1.08, 0.07, 0.09, 2.16, { b: 0.01 });
        m.box("frameT", "alu", 0, -0.04, 2.19, 1.27, 0.09, 0.07, { b: 0.01 });
        m.box("leaf", "door", 0, -0.04, 1.07, 1.12, 0.045, 2.12, { b: 0.006 });
        m.box("kick", "alu", 0, -0.065, 0.12, 1.08, 0.004, 0.2, { b: 0 });
        m.box("vision", "black", 0.25, -0.064, 1.5, 0.16, 0.004, 0.6, { b: 0 });
        m.box("lever", "alu", 0.38, -0.1, 1.02, 0.15, 0.025, 0.025, { b: 0.01 }); m.box("rose", "alu", 0.45, -0.075, 1.02, 0.06, 0.02, 0.06, { b: 0.02 });
        if (!it.props.exit) return;
        m.box("exit", "frame", 0, -0.05, 2.45, 0.42, 0.06, 0.16, { b: 0.008 }); m.face("exitface", texMat("exit"), 0, -0.083, 2.45, 0.38, 0.13);
        m.cyl("ext", "red", 0.95, -0.15, 0.32, 0.075, 0.55); m.cyl("exttop", "black", 0.95, -0.15, 0.63, 0.03, 0.08);
        m.box("exthandle", "black", 0.95, -0.15, 0.68, 0.14, 0.03, 0.02, { b: 0.005 });
        m.box("extbracket", "alu", 0.95, -0.06, 0.6, 0.1, 0.02, 0.1, { b: 0.005 });
      } },
    rack: { label: "Equipment rack", short: "Rack", def: {},
      build(m) {
        m.box("rack", "rack", 0, 0, 1.06, 0.62, 0.8, 2.06, { b: 0.012 });
        m.box("door", "frame", 0, -0.405, 1.06, 0.58, 0.012, 1.98, { b: 0.006 });
        m.face("face", texMat("rack"), 0, -0.414, 1.06, 0.5, 1.9);
        m.box("handle", "alu", 0.25, -0.425, 1.1, 0.02, 0.02, 0.22, { b: 0.008 });
        m.box("roof", "black", 0, 0, 2.1, 0.6, 0.78, 0.02, { b: 0.006 });
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) m.cyl("caster" + sx + sy, "caster", sx * 0.24, sy * 0.32, 0.02, 0.025, 0.04, { seg: 12 });
      } },
    cabinet: { label: "Filing cabinet", short: "Cabinet", def: {},
      build(m) {
        m.box("body", "cabinet", 0, 0, 0.66, 0.5, 0.62, 1.32, { b: 0.012 });
        for (let k = 0; k < 4; k++) {
          const z = 0.18 + k * 0.32; m.box("drawer" + k, "cabinet", 0, -0.315, z, 0.46, 0.012, 0.29, { b: 0.006 });
          m.box("pull" + k, "alu", 0, -0.33, z + 0.08, 0.16, 0.02, 0.02, { b: 0.008 }); m.box("label" + k, "white", 0, -0.322, z + 0.02, 0.08, 0.002, 0.04, { b: 0 });
        }
      } },
    plant: { label: "Plant", short: "Plant", def: {},
      build(m, it) {
        const h = hashOf(it.id);
        m.cyl("pot", "pot", 0, 0, 0.25, 0.22, 0.5, { seg: 24 }); m.cyl("soil", "soil", 0, 0, 0.495, 0.2, 0.01, { seg: 24 });
        m.cyl("stem", "soil", 0, 0, 0.75, 0.02, 0.5, { seg: 8 });
        for (let k = 0; k < 9; k++) {
          const a = (k * 137.5 + h % 60) * D2R, r = 0.12 + (k % 3) * 0.06, z = 0.85 + (k % 4) * 0.12;
          m.sph("leaf" + k, k % 2 ? "leaf" : "leaf2", Math.cos(a) * r, Math.sin(a) * r, z, 0.15 - (k % 3) * 0.02, { sz: 0.8 });
        }
      } },
    dais: { label: "Raised dais", short: "Dais", size: true, def: { w: 7, d: 2.2 },
      build(m, it) {
        const { w, d } = it.props;
        m.box("deck", "dais", 0, 0, 0.1, w, d, 0.2, { b: 0.015 });
        m.box("step", "dais", 0, d / 2 + 0.15, 0.05, Math.min(2.4, w - 0.4), 0.3, 0.1, { b: 0.012 });
        m.box("nosing", "alu", 0, d / 2 + 0.005, 0.195, w, 0.02, 0.012, { b: 0.004 });
        m.box("edge", "led_strip", 0, d / 2 + 0.012, 0.15, w, 0.004, 0.012, { b: 0 });
        m.box("stepled", "led_strip", 0, d / 2 + 0.302, 0.07, Math.min(2.4, w - 0.4), 0.004, 0.01, { b: 0 });
      } },
    chair: { label: "Chair", short: "Chair", def: {}, build(m) { chairParts(m, "", 0, 0); } },
    stool: { label: "Stool", short: "Stool", def: {},
      build(m) {
        m.cyl("base", "chair_leg", 0, 0, 0.015, 0.23, 0.03, { seg: 28 }); m.cyl("post", "chair_leg", 0, 0, 0.36, 0.028, 0.66, { seg: 14 });
        m.cyl("ring", "chair_leg", 0, 0, 0.3, 0.16, 0.018, { seg: 24 });
        m.cyl("seat", "chair", 0, 0, 0.71, 0.2, 0.07, { seg: 28 }); m.cyl("seatrim", "black", 0, 0, 0.672, 0.205, 0.012, { seg: 28 });
      } },
    flag: { label: "Flag stand", short: "Flag", def: {},
      build(m) {
        m.cyl("base", "chair_leg", 0, 0, 0.03, 0.2, 0.06, { seg: 24 }); m.cyl("pole", "pin", 0, 0, 1.22, 0.016, 2.36, { seg: 12 });
        m.sph("finial", "table_rim", 0, 0, 2.43, 0.04);
        for (let k = 0; k < 6; k++) m.box("cloth" + k, "olive", 0.06 + k * 0.12, 0.02 * Math.sin(k * 1.4), 1.95 - k * 0.012, 0.125, 0.008, 0.9, { dr: 14 * Math.cos(k * 1.4), b: 0 });
      } }
  };
  CATALOG.door2 = { label: "Double door", short: "Double door", wall: true, half: 1.15, def: { exit: false }, flags: [["exit", "Exit sign"]], opening: () => ({ w: 1.9, h: 2.2, sill: 0 }),
    build(m, it) {
      m.box("frameL", "alu", -0.99, -0.04, 1.1, 0.07, 0.09, 2.2, { b: 0.01 }); m.box("frameR", "alu", 0.99, -0.04, 1.1, 0.07, 0.09, 2.2, { b: 0.01 });
      m.box("frameT", "alu", 0, -0.04, 2.23, 2.05, 0.09, 0.07, { b: 0.01 });
      for (const sx of [-1, 1]) {
        m.box("leaf" + sx, "door", sx * 0.475, -0.04, 1.09, 0.94, 0.045, 2.16, { b: 0.006 });
        m.box("vision" + sx, "black", sx * 0.475, -0.064, 1.5, 0.18, 0.004, 0.7, { b: 0 });
        m.box("bar" + sx, "alu", sx * 0.45, -0.1, 1.0, 0.7, 0.03, 0.04, { b: 0.012 });
        m.box("kick" + sx, "alu", sx * 0.475, -0.065, 0.12, 0.9, 0.004, 0.2, { b: 0 });
      }
      if (it.props.exit) m.box("exit", "frame", 0, -0.05, 2.5, 0.42, 0.06, 0.16, { b: 0.008 }); if (it.props.exit) m.face("exitface", texMat("exit"), 0, -0.083, 2.5, 0.38, 0.13);
    } };
  CATALOG.archway = { label: "Open doorway", short: "Doorway", wall: true, def: { w: 1.4, h: 2.3 }, halfFn: it => it.props.w / 2 + 0.08,
    opening: it => ({ w: it.props.w, h: it.props.h, sill: 0 }), dims: [["w", "Opening width m", 0.6, 6], ["h", "Opening height m", 1.8, 3.5]],
    build(m, it) {
      const { w, h } = it.props;
      for (const sx of [-1, 1]) m.box("jamb" + sx, "alu", sx * (w / 2 + 0.03), -0.04, h / 2, 0.06, 0.12, h, { b: 0.01 });
      m.box("head", "alu", 0, -0.04, h + 0.03, w + 0.12, 0.12, 0.06, { b: 0.01 });
    } };
  CATALOG.window = { label: "Window", short: "Window", wall: true, def: { w: 1.6, h: 1.3, sill: 0.9, panes: 2 }, halfFn: it => it.props.w / 2 + 0.12,
    opening: it => ({ w: it.props.w, h: it.props.h, sill: it.props.sill }),
    dims: [["w", "Window width m", 0.4, 8], ["h", "Window height m", 0.3, 3], ["sill", "Sill height m", 0, 2.2], ["panes", "Panes", 1, 8]],
    build(m, it) {
      const { w, h, sill } = it.props, zc = sill + h / 2, f = 0.06, n = Math.max(1, Math.round(it.props.panes || 1));
      for (const sx of [-1, 1]) m.box("jamb" + sx, "alu", sx * (w / 2 + f / 2), 0, zc, f, 0.14, h + 2 * f, { b: 0.006 });
      m.box("head", "alu", 0, 0, sill + h + f / 2, w, 0.14, f, { b: 0.006 }); m.box("bottom", "alu", 0, 0, sill - f / 2, w, 0.14, f, { b: 0.006 });
      if (sill > 0.05) m.box("sillboard", "white", 0, -0.11, sill - 0.035, w + 0.24, 0.2, 0.035, { b: 0.008 });
      for (let k = 1; k < n; k++) m.box("mullion" + k, "alu", -w / 2 + w * k / n, 0, zc, 0.04, 0.1, h, { b: 0.004 });
      m.box("transom", "alu", 0, 0, sill + h * 0.72, w, 0.08, 0.035, { b: 0.004 });
      m.face("glass", "glass", 0, 0.012, zc, w, h);
    } };
  CATALOG.custom = { label: "Custom item", short: "Custom", custom: true,
    def: { name: "Custom item", shape: "box", w: 1.2, d: 0.6, h: 1.0, z: 0, color: "#4a5560", img: "", face: "front", wall: false },
    build(m, it) {
      const p = it.props, mat = colMat(p.color), img = p.img && TEX[p.img] ? texMat(p.img) : null, base = +p.z || 0;
      if (p.shape === "cyl") {
        m.cyl("body", mat, 0, 0, base + p.h / 2, p.w / 2, p.h, { seg: 40 });
        if (img) m.up("picture", img, 0, 0, base + p.h + 0.002, p.w * 0.68, p.w * 0.68);
      } else if (p.shape === "panel") {
        const y = p.wall ? -0.02 : 0;
        m.box("body", mat, 0, y, base + p.h / 2, p.w, 0.04, p.h, { b: 0.008 });
        if (img) m.face("picture", img, 0, y - 0.023, base + p.h / 2, Math.max(0.01, p.w - 0.04), Math.max(0.01, p.h - 0.04));
        if (!p.wall && base > 0.05) m.cyl("post", "chair_leg", 0, 0, base / 2, 0.03, base, { seg: 12 });
      } else {
        const y = p.wall ? -p.d / 2 : 0;
        m.box("body", mat, 0, y, base + p.h / 2, p.w, p.d, p.h, { b: Math.min(0.02, Math.min(p.w, p.d, p.h) * 0.2) });
        if (img && p.face === "top") m.up("picture", img, 0, y, base + p.h + 0.002, Math.max(0.01, p.w - 0.03), Math.max(0.01, p.d - 0.03));
        else if (img) m.face("picture", img, 0, y - p.d / 2 - 0.002, base + p.h / 2, Math.max(0.01, p.w - 0.03), Math.max(0.01, p.h - 0.03));
      }
    } };
  CATALOG.asset = { label: "3D model", short: "Model", def: { asset: "", name: "3D model" }, build(m, it) { if (ASSETS[it.props.asset]) m.mesh("model", it.props.asset); } };
  const labelOf = it => (it.type === "custom" || it.type === "asset") ? (it.props.name || CATALOG[it.type].label) : CATALOG[it.type].label;
  const isWall = it => !it.props.free && !!(CATALOG[it.type].wall || (it.type === "custom" && it.props.wall));
  const halfOf = it => (it.type === "custom" ? it.props.w / 2 : CATALOG[it.type].halfFn ? CATALOG[it.type].halfFn(it) : (CATALOG[it.type].half || 1)) * ((it.props.scale || [1])[0]);


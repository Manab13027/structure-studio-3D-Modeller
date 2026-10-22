  // ================================================================ state, history, persistence
  const STORE = "structurestudio.design.v1";
  let state = null, selected = null, uid = 1;
  const history = [], future = [];
  const mk = (type, x, y, rot = 0, props = {}) => ({ id: "i" + (uid++), type, x, y, rot, b: null, f: 0, props: { ...CATALOG[type].def, ...props } });
  function snapshot() { return JSON.stringify(state); }
  let lastCommitted = "", warnedFull = false;
  function commit() { history.push(lastCommitted); if (history.length > 60) history.shift(); future.length = 0; lastCommitted = snapshot(); persist(); updateUndo(); refreshStatus(); }
  function persist() { try { localStorage.setItem(STORE, snapshot()); } catch (e) { if (!warnedFull) { warnedFull = true; toast("This design is too big for browser storage (imported models or pictures). Use Save file to keep it."); } } }
  function load() {
    try { const s = localStorage.getItem(STORE); if (s) { const v = JSON.parse(s); if (validLayout(v)) return v; } } catch (e) { }
    return TEMPLATES.house.make();
  }
  function validLayout(v) { return v && (v.version === 2 ? v.site && Array.isArray(v.buildings) : !!v.room) && Array.isArray(v.items) && v.items.every(i => i && CATALOG[i.type] && isFinite(i.x) && isFinite(i.y)); }
  // layouts saved by the earlier ops-room editor become a one-room building on a small site
  function migrate(v) {
    if (v.version === 2) return v;
    const r = v.room, W = r.w || 14, D = r.d || 10, pts = Array.isArray(r.pts) && r.pts.length >= 3 ? r.pts.map(p => p.slice()) : [[-W / 2, -D / 2], [W / 2, -D / 2], [W / 2, D / 2], [-W / 2, D / 2]];
    const B = newBuilding({ name: "Operations room", pts, floors: 1, fh: (r.h || 3.6) + SLAB, wallT: 0.3, ext: "render_grey", paint: "#6e7577", floorFin: ["raised"], dado: true, roof: { type: "none" } });
    for (const it of v.items) { it.b = B.id; it.f = 0; if (it.type === "door" || it.type === "door2") it.props = { exit: true, ...(it.props || {}) }; }
    const ext = Math.max(B.w, B.d) + 16;
    return { version: 2, name: "Operations centre", site: { w: ext, d: ext, ground: "paving" }, buildings: [B], items: v.items, custom: v.custom || {}, assets: v.assets || {}, templates: v.templates || [] };
  }
  function adopt(v) {
    state = migrate(v); state.custom = state.custom || {}; state.assets = state.assets || {}; state.templates = state.templates || [];
    state.site = { w: 60, d: 50, ground: "grass", ...(state.site || {}) }; state.name = state.name || "Untitled design";
    const nums = [...state.items.map(i => i.id), ...state.buildings.map(b => b.id)].map(id => parseInt(String(id).slice(1)) || 0);
    uid = 1 + Math.max(0, ...nums);
    for (const B of state.buildings) { B.roof = { type: "gable", pitch: 35, mat: "clay_tiles", over: 0.45, ...(B.roof || {}) }; B.base = B.base ?? 0.2; B.wallT = B.wallT || 0.25; B.paint = B.paint || "#d9d4ca"; B.ext = FIN[B.ext] ? B.ext : "render_white"; syncBld(B); }
    registerCustom(state.custom); loadAllAssets();
    const ids = new Set(state.items.map(i => i.id));
    for (const it of state.items) {
      it.props = { ...CATALOG[it.type].def, ...(it.props || {}) }; it.rot = it.rot || 0;
      const B = bldById(it.b); if (!B) { it.b = null; it.f = 0; } else it.f = Math.min(Math.max(0, it.f || 0), B.floors - 1);
      if (it.host && !ids.has(it.host)) it.host = null;
    }
    for (const it of state.items) if (isWall(it) && !it.host && (it.seg == null || !bldOf(it) || it.seg >= bldOf(it).pts.length)) place(it, it.x, it.y);
    if (!bldById(view.ab)) view.ab = state.buildings[0] ? state.buildings[0].id : null;
    if (selected && !state.items.find(i => i.id === selected)) selected = null;
  }

  // ================================================================ starting templates
  const RECT = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  function T(list, type, x, y, rot = 0, props = {}, lv) {   // add an object; lv = [building, floor] for wall items / explicit floors
    const it = mk(type, x, y, rot, props);
    if (lv) { it.b = lv[0].id; it.f = lv[1]; }
    list.push(it); return it;
  }
  function finishTemplate(s) {   // resolve levels and wall attachment once everything exists
    const prev = state; state = s;
    for (const it of s.items) if (!isWall(it) && it.b == null && !CATALOG[it.type].site) assignLevel(it);
    for (const it of s.items) if (isWall(it)) place(it, it.x, it.y);
    state = prev; return s;
  }
  const TEMPLATES = {
    house: { label: "Family house", make() {
      uid = 1; const items = [], H = newBuilding({ name: "House", pts: RECT(-6, -1.5, 6, 7.5), floors: 2, fh: 3.0, wallT: 0.3, ext: "brick_red", paint: "#e6dfd2",
        floorFin: ["oak", "carpet_grey"], roof: { type: "gable", pitch: 35, mat: "clay_tiles", over: 0.45 } });
      const g = [H, 0], u = [H, 1], s = { version: 2, name: "Family house", site: { w: 40, d: 34, ground: "grass" }, buildings: [H], items, custom: {}, assets: {}, templates: [] };
      const fl = (type, x, y, rot, props, f) => { const it = T(items, type, x, y, rot, props); it.b = H.id; it.f = f; return it; };
      // ground floor: living (west), kitchen & dining (east), stairs beside the dividing wall
      fl("partition", 1.0, 1.25, 90, { len: 5.5 }, 0);
      T(items, "door", -1.0, -1.5, 0, { exit: false }, g); T(items, "window", -4.0, -1.5, 0, { w: 2.0 }, g); T(items, "window", 4.0, -1.5, 0, { w: 1.6 }, g);
      T(items, "window", -6, 5.6, 0, { w: 1.4 }, g); T(items, "window", 6, 6.3, 0, { w: 1.2 }, g);
      T(items, "window", -2.6, 7.5, 0, { w: 2.2, h: 2.1, sill: 0.05, panes: 3 }, g); T(items, "window", 3.6, 7.5, 0, { w: 1.6 }, g);
      fl("stairs", 1.62, 1.1, 0, {}, 0);
      fl("tv_unit", -5.62, 2.5, 90, {}, 0); fl("rug", -3.7, 2.5, 90, { color: "#8a4b3b" }, 0); fl("sofa", -2.0, 2.5, 270, {}, 0); fl("coffee_table", -3.6, 2.5, 90, {}, 0);
      fl("armchair", -3.8, 5.3, 0, {}, 0); fl("floor_lamp", -1.4, 5.4, 0, {}, 0); fl("bookshelf", -5.0, 7.32, 0, {}, 0); fl("plant", -5.5, -1.0, 0, {}, 0);
      fl("kitchen", 5.68, 2.2, 270, { len: 3.6 }, 0); fl("fridge", 5.63, 4.5, 270, {}, 0); fl("dining_table", 3.5, 5.8, 0, { seats: 6 }, 0); fl("plant", 1.6, 7.0, 0, {}, 0);
      // first floor: landing, three bedrooms, bathroom
      fl("partition", 1.0, 0.95, 90, { len: 4.9 }, 1); fl("partition", 2.12, 0.95, 90, { len: 4.9 }, 1);
      const pc = fl("partition", -2.5, 3.4, 0, { len: 7.0 }, 1), pd = fl("partition", 4.06, 3.4, 0, { len: 3.88 }, 1);
      const pe = fl("partition", -2.2, 4.6, 0, { len: 7.6 }, 1), pf = fl("partition", 3.8, 4.6, 0, { len: 4.4 }, 1); fl("partition", 1.6, 6.05, 90, { len: 2.9 }, 1);
      for (const [x, y] of [[-1.2, 3.4], [3.2, 3.4], [-1.2, 4.6], [3.0, 4.6]]) { const d = T(items, "door", x, y, 0, { exit: false }); d.b = H.id; d.f = 1; d.hostHint = true; }
      T(items, "window", -3.0, -1.5, 0, { w: 1.6 }, u); T(items, "window", 4.4, -1.5, 0, { w: 0.8, h: 0.8, sill: 1.4, panes: 1 }, u);
      T(items, "window", -2.6, 7.5, 0, { w: 1.8 }, u); T(items, "window", 4.4, 7.5, 0, { w: 1.4 }, u); T(items, "window", -6, 0.8, 0, { w: 1.2 }, u); T(items, "window", 6, 6.0, 0, { w: 1.2 }, u);
      fl("bed_double", -2.6, 6.42, 0, {}, 1); fl("wardrobe", -5.68, 5.9, 90, {}, 1); fl("rug", -2.6, 5.3, 0, { color: "#5c6b78" }, 1);
      fl("bed_single", 4.9, 6.42, 0, {}, 1); fl("bookshelf", 2.2, 7.32, 0, {}, 1);
      fl("bed_single", -5.0, 0.2, 90, {}, 1); fl("office_desk", -1.4, -1.1, 180, { s0: "console_6" }, 1); fl("plant", 0.5, 2.9, 0, {}, 1);
      fl("bathtub", 5.58, 0.4, 0, {}, 1); fl("toilet", 2.9, -1.17, 180, {}, 1); fl("basin", 3.9, -1.26, 180, {}, 1); fl("mirror", 3.9, -1.5, 0, {}, 1).seg = null;
      // garden & street
      T(items, "road", 0, -14.5, 0, { len: 40, w: 6.5 }); T(items, "road", 9, -5.1, 90, { len: 12.4, w: 3.2, lines: false });
      T(items, "path", -1.0, -6.4, 90, { len: 9.8, w: 1.2 }); T(items, "car", 9, -2.6, 0, { color: "#2f5d8c" }); T(items, "car", -6, -15.6, 90, { color: "#9b2a22" });
      T(items, "fence", -10.85, -11.25, 0, { len: 18.3, h: 1.0, style: "picket" }); T(items, "fence", 3.5, -11.25, 0, { len: 7.6, h: 1.0, style: "picket" }); T(items, "fence", 15.35, -11.25, 0, { len: 9.3, h: 1.0, style: "picket" });
      T(items, "fence", -20, 2.875, 90, { len: 28.25, h: 1.4, style: "picket" }); T(items, "fence", 20, 2.875, 90, { len: 28.25, h: 1.4, style: "picket" }); T(items, "hedge", 0, 16.4, 0, { len: 39.5, h: 1.6 });
      for (const [x, y, k] of [[-14, 10, "tree"], [-8.5, 13, "birch"], [14, 12.5, "maple"], [15.5, -5, "tree"], [-15.5, -1, "birch"]]) T(items, k, x, y);
      T(items, "flower_bed", -3.6, -2.4, 0, { w: 3.6, d: 0.9 }); T(items, "flower_bed", 3.9, -2.4, 0, { w: 3.2, d: 0.9 }); T(items, "patio_set", -2.6, 10.2); T(items, "bbq", 2.4, 10.6, 180);
      for (const [x, y] of [[-19, 8], [-19, 11], [19, 9]]) T(items, "grass_tuft", x, y); T(items, "trampoline", 9, 12.5); T(items, "mailbox", 7.0, -10.7); for (const [x, y] of [[-16.5, -6.5], [-17, 13.5]]) T(items, "conifer", x, y);
      for (const [x, y, k] of [[-6.6, -2.3, "bush"], [-6.7, 1.5, "flower_bush"], [6.7, -2.3, "bush"], [6.7, 1.0, "flower_bush"]]) T(items, k, x, y);
      T(items, "pond", -12, 3.5, 0, { scale: [0.9, 0.7, 1] }); T(items, "bench", -12.3, 7.8, 180); T(items, "shed", 14.5, 4.5, 0, { w: 3.2, d: 2.6, h: 2.3 });
      T(items, "street_light", -10, -11.7, 0); T(items, "street_light", 15, -11.7, 0); T(items, "bin", 11.4, -10.6);
      return finishTemplate(s);
    } },
    facility: { label: "Secure facility", make() {
      uid = 1; const items = [];
      const HQ = newBuilding({ name: "HQ office", pts: RECT(-30, -6, -6, 8), floors: 2, fh: 3.6, wallT: 0.3, ext: "render_white", paint: "#e4e2dc", floorFin: ["carpet_grey", "carpet_blue"], roof: { type: "flat", mat: "membrane" } });
      const WH = newBuilding({ name: "Warehouse", pts: RECT(8, -4, 38, 16), floors: 1, fh: 7.5, wallT: 0.25, ext: "metal_clad", paint: "#cfd2cf", floorFin: ["concrete_floor"], roof: { type: "gable", pitch: 10, mat: "metal_roof", over: 0.5 } });
      const s = { version: 2, name: "Secure facility", site: { w: 140, d: 100, ground: "grass" }, buildings: [HQ, WH], items, custom: {}, assets: {}, templates: [] };
      const fl = (B, f, type, x, y, rot, props) => { const it = T(items, type, x, y, rot, props); it.b = B.id; it.f = f; return it; };
      for (const f of [0, 1]) { for (const x of [-27.5, -23.5, -13, -9]) T(items, "window", x, -6, 0, { w: 2.4, h: 1.6, sill: 0.9, panes: 3 }, [HQ, f]);
        for (const x of [-27, -22, -17, -12, -8]) T(items, "window", x, 8, 0, { w: 2.4, h: 1.6, sill: 0.9, panes: 3 }, [HQ, f]);
        for (const y of [-2, 4]) { T(items, "window", -30, y, 0, { w: 2.0, h: 1.6, sill: 0.9 }, [HQ, f]); T(items, "window", -6, y + 1, 0, { w: 2.0, h: 1.6, sill: 0.9 }, [HQ, f]); } }
      T(items, "door2", -18.5, -6, 0, { exit: true }, [HQ, 0]); T(items, "window", -18.5, -6, 0, { w: 2.6, h: 0.9, sill: 2.45, panes: 3 }, [HQ, 1]);
      fl(HQ, 0, "reception", -18.5, -3.4, 0); fl(HQ, 0, "plant", -21.5, -5.2, 0); fl(HQ, 0, "plant", -15.5, -5.2, 0);
      fl(HQ, 0, "partition", -9, 1, 0, { len: 6, glass: true }); fl(HQ, 0, "partition", -12, 4.5, 90, { len: 7, glass: true });
      const md = T(items, "door", -12, 2.4, 0, { exit: false }); md.b = HQ.id; md.f = 0;
      fl(HQ, 0, "meeting_table", -9, 4.6, 90, { seats: 8 }); fl(HQ, 0, "videowall", -6, 4.5, 270).seg = null;
      fl(HQ, 0, "stairs", -7.25, -3.0, 0);
      for (const [x, y, r] of [[-27, 1.2, 0], [-24.8, 1.2, 0], [-27, 4.6, 180], [-24.8, 4.6, 180], [-21, 1.2, 0], [-21, 4.6, 180]]) fl(HQ, 0, "office_desk", x, y, r);
      fl(HQ, 0, "lockers", -29.4, -3.5, 90); fl(HQ, 0, "printer", -16.5, 7.4, 0); fl(HQ, 0, "cabinet", -15.6, 7.4, 0);
      for (let k = 0; k < 4; k++) for (const [y, r] of [[-3.4, 0], [-0.1, 180]]) fl(HQ, 1, "office_desk", -27 + k * 2.2, y, r);
      fl(HQ, 1, "partition", -16, 3.5, 90, { len: 9, glass: true }); fl(HQ, 1, "command", -11, 1.4, 0); fl(HQ, 1, "table", -11, 4.6, 0, { scale: [0.7, 0.7, 1] });
      fl(HQ, 1, "wallmap", -11, 8, 0).seg = null; for (const x of [-14.6, -7.6]) fl(HQ, 1, "console", x, 5.2, x < -10 ? 90 : 270);
      fl(HQ, 1, "meeting_table", -24, 5.2, 0, { seats: 10 }); fl(HQ, 1, "plant", -29.3, 7.3, 0); fl(HQ, 1, "rack", -6.6, -5.4, 270);
      for (const x of [15, 26]) T(items, "garage", x, -4, 0, { w: 4.5, h: 5.0 }, [WH, 0]); T(items, "door", 33, -4, 0, { exit: true }, [WH, 0]);
      for (const x of [14, 24, 34]) T(items, "window", x, 16, 0, { w: 3.0, h: 1.2, sill: 4.6, panes: 3 }, [WH, 0]);
      for (const y of [3.5, 8.5, 13.4]) fl(WH, 0, "pallet_rack", 24, y, 0, { bays: 8, levels: 4 });
      fl(WH, 0, "container", 12, 6, 90, { color: "#9a3b2d" });
      // perimeter, roads, parking, gate
      T(items, "fence", -35.5, -46, 0, { len: 61 }); T(items, "fence", 35.5, -46, 0, { len: 61 }); T(items, "fence", 0, 46, 0, { len: 132 }); T(items, "fence", -66, 0, 90, { len: 92 }); T(items, "fence", 66, 0, 90, { len: 92 });
      T(items, "road", 0, -15, 90, { len: 70, w: 7 }); T(items, "road", 2, -14, 0, { len: 84, w: 7 }); T(items, "road", 23, -9, 90, { len: 9, w: 6, lines: false }); T(items, "road", 0, 25, 90, { len: 10, w: 6, lines: false });
      T(items, "barrier", -3.6, -44, 0); T(items, "guard_booth", -7.2, -41.5, 0); T(items, "bollard", 4, -44); T(items, "bollard", -5, -46.5);
      T(items, "parking", -18.5, -20.3, 180, { n: 10 }); for (const [k, c] of [[0, "#d8d8d4"], [2, "#2b2f36"], [3, "#8c2b25"], [6, "#46607a"], [8, "#b9b9b5"]]) T(items, "car", -18.5 + (k - 4.5) * 2.6, -20.6, 0, { color: c });
      T(items, "truck", 15, -12.3, 90); for (const y of [-40, -26, -2, 10]) T(items, "street_light", 4.6, y, 270); for (const x of [-30, -14, 14, 30]) T(items, "street_light", x, -9.6, 0);
      T(items, "helipad", 42, -30); T(items, "lattice_tower", -52, 30, 0, { h: 36 }); T(items, "water_tower", 52, 34, 0, { h: 14 }); T(items, "dish", 3, 33, 180);
      T(items, "solar_array", -32, 30, 0, { rows: 3, cols: 14 }); T(items, "generator", -18, 13, 0); T(items, "fuel_tank", -8.5, 13.5, 0); T(items, "utility_box", -24, 11);
      T(items, "container", 46, 2, 90, { color: "#2e5e86" }); T(items, "container", 49, 2, 90, { color: "#5a6b3a" }); T(items, "container", 47.5, 2, 90, { color: "#a8642a", lift: 2.59 });
      T(items, "wind_turbine", 56, -38, 0, { h: 45 }); T(items, "hangar", -46, -28, 0, { r: 10, len: 26 }); T(items, "flagpole", -14, -10.4); T(items, "flagpole", -23, -10.4);
      for (const [x, y] of [[-40, -12], [-42, 6], [-36, 14], [-60, -5], [60, 20], [40, -15], [-58, 40], [30, 38], [-10, 38], [44, 40]]) T(items, "tree", x, y);
      for (const [x, y] of [[-63, 30], [-63, 20], [63, -10], [63, 0]]) T(items, "conifer", x, y);
      T(items, "hedge", -18.5, -9.6, 0, { len: 22, h: 0.9, thick: 0.7 });
      return finishTemplate(s);
    } },
    opsroom: { label: "Operations room", make() {
      uid = 1; const W = 14, D = 10, items = [];
      const R = newBuilding({ name: "Joint Operations Centre", pts: RECT(-W / 2, -D / 2, W / 2, D / 2), floors: 1, fh: 3.8, wallT: 0.3, ext: "render_grey", paint: "#6e7577", floorFin: ["raised"], dado: true, roof: { type: "none" } });
      const s = { version: 2, name: "Operations centre", site: { w: 30, d: 26, ground: "paving" }, buildings: [R], items, custom: {}, assets: {}, templates: [] };
      const o = (type, x, y, rot = 0, props = {}) => { const it = T(items, type, x, y, rot, props); it.b = R.id; it.f = 0; return it; };
      o("videowall", 0, D / 2, 0); o("clock", 0, D / 2, 0); o("table", 0, -0.3, 0);
      for (const [x, y] of [[-2.8, -0.3], [2.8, -0.3], [-1.0, -2.05], [1.0, -2.05]]) o("stool", x, y);
      const scr = [["console_0", "console_1"], ["console_2", "console_3"], ["console_4", "console_5"], ["console_6", "console_7"], ["console_1", "console_2"], ["console_3", "console_0"]];
      [-5.4, -3.6, -1.8, 1.8, 3.6, 5.4].forEach((x, i) => o("console", x, 2.75, 0, { s0: scr[i][0], s1: scr[i][1] }));
      for (const y of [-0.75, 1.0]) { o("console", -W / 2 + 0.75, y, 90, { s0: "console_4", s1: "console_7" }); o("console", W / 2 - 0.75, y, 270, { s0: "console_5", s1: "console_6" }); }
      o("wallmap", -W / 2, 0.15, 90, { map: "wall_topo" }); o("wallmap", W / 2, 0.15, 270, { map: "wall_world" });
      o("sign", 0, -D / 2, 180); o("whiteboard", 4.6, -D / 2, 180); o("door", -5.6, -D / 2, 180, { exit: true });
      o("dais", 0, -3.75, 0);
      o("command", -2.4, -3.45, 0, { s0: "console_0", s1: "console_2", s2: "console_4" }); o("command", 0, -3.45, 0); o("command", 2.4, -3.45, 0, { s0: "console_1", s1: "console_3", s2: "console_5" });
      for (const side of [-1, 1]) for (const k of [0, 1]) o("rack", side * (5.15 + k * 0.68), D / 2 - 0.5, 0);
      o("flag", -2.8, -D / 2 + 0.35, 0); o("flag", 2.8, -D / 2 + 0.35, 180);
      o("cabinet", 6.55, -4.55, 180); o("cabinet", 6.0, -4.55, 180); o("plant", -6.55, -4.5, 0); o("plant", 6.5, 3.4, 0);
      T(items, "car", -10, -9, 90, { color: "#3b4a3a" }); T(items, "bollard", -2, -6.5); T(items, "bollard", 2, -6.5); T(items, "generator", 10.5, 7.5, 90); T(items, "dish", -10, 8, 180, { d: 3 });
      return finishTemplate(s);
    } },
    blank: { label: "Blank site", make() {
      uid = 1; const B = newBuilding({ name: "Building 1", pts: RECT(-6, -4, 6, 4), floors: 1, fh: 3.0 });
      return finishTemplate({ version: 2, name: "New design", site: { w: 60, d: 50, ground: "grass" }, buildings: [B], items: [], custom: {}, assets: {}, templates: [] });
    } }
  };
  const SHAPES = {
    "Rectangle": [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]],
    "L-shape": [[-.5, -.5], [.5, -.5], [.5, .1], [.05, .1], [.05, .5], [-.5, .5]],
    "T-shape": [[-.5, .1], [-.17, .1], [-.17, -.5], [.17, -.5], [.17, .1], [.5, .1], [.5, .5], [-.5, .5]],
    "U-shape": [[-.5, -.5], [-.15, -.5], [-.15, .15], [.15, .15], [.15, -.5], [.5, -.5], [.5, .5], [-.5, .5]],
    "Angled corners": [[-.5, -.5], [.5, -.5], [.5, .2], [.3, .5], [-.3, .5], [-.5, .2]],
    "Hexagon": [0, 60, 120, 180, 240, 300].map(a => [0.5 * Math.cos(a * D2R), 0.5 * Math.sin(a * D2R) / 0.866]),
    "Octagon": [0, 45, 90, 135, 180, 225, 270, 315].map(a => [0.5 * Math.cos((a + 22.5) * D2R) / 0.924, 0.5 * Math.sin((a + 22.5) * D2R) / 0.924])
  };

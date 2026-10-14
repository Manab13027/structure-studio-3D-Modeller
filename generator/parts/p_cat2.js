  // ================================================================ item builder (replaces the ops-room version: adds ry, beams, triangle meshes, cones)
  function maker(it, out, zoff, group) {
    const a = it.rot * D2R, c = Math.cos(a), s = Math.sin(a);
    const [kx, ky, kz] = it.props.scale || [1, 1, 1];
    const W = (lx, ly) => [it.x + lx * kx * c - ly * ky * s, it.y + lx * kx * s + ly * ky * c];
    const tag = { item: it.id, g: group };
    const autoB = (sx, sy, sz) => Math.min(0.012, Math.min(sx, sy, sz) * 0.3);
    const sxy = dr => Math.abs(Math.sin((dr || 0) * D2R)) > 0.7 ? [ky, kx] : [kx, ky];
    const api = {
      box(n, m, lx, ly, z, sx, sy, sz, o = {}) { const [x, y] = W(lx, ly), [fx, fy] = sxy(o.dr); const S = [sx * fx, sy * fy, sz * kz];
        out.push({ t: "box", n, m, p: [x, y, z * kz + zoff], s: S, rz: it.rot + (o.dr || 0), rx: o.rx || 0, ry: o.ry || 0, b: Math.min(o.b ?? autoB(...S), Math.min(...S) * 0.45), ...tag }); },
      cyl(n, m, lx, ly, z, r, h, o = {}) { const [x, y] = W(lx, ly), horiz = Math.abs(o.rx || 0) > 45;
        out.push({ t: "cyl", n, m, p: [x, y, z * kz + zoff], r: r * (horiz ? kz : Math.min(kx, ky)), h: h * (horiz ? Math.min(kx, ky) : kz), seg: o.seg || 20, rx: o.rx || 0, rz: it.rot + (o.dr || 0), ...tag }); },
      sph(n, m, lx, ly, z, r, o = {}) { const [x, y] = W(lx, ly); out.push({ t: "sph", n, m, p: [x, y, z * kz + zoff], r: r * (kx + ky) / 2, sz: (o.sz || 1) * kz / ((kx + ky) / 2), ...tag }); },
      face(n, m, lx, ly, z, w, h, o = {}) { const [x, y] = W(lx, ly); out.push({ t: "plane", n, m, p: [x, y, z * kz + zoff], s: [w * kx, h * kz], r: [90 + (o.rx || 0), 0, it.rot + (o.dr || 0)], ...tag }); },
      up(n, m, lx, ly, z, w, h, o = {}) { const [x, y] = W(lx, ly); out.push({ t: "plane", n, m, p: [x, y, z * kz + zoff], s: [w * kx, h * ky], r: [o.tilt || 0, 0, it.rot + (o.dr || 0)], ...tag }); },
      mesh(n, asset) { out.push({ t: "mesh", n, m: "asset", asset, p: [it.x, it.y, zoff], rz: it.rot, k: [kx, ky, kz], ...tag }); },
      // a straight member between two local points (towers, braces, rails, blades)
      beam(n, m, p0, p1, t, o = {}) {
        const A = [p0[0] * kx, p0[1] * ky, p0[2] * kz], B = [p1[0] * kx, p1[1] * ky, p1[2] * kz], dx = B[0] - A[0], dy = B[1] - A[1], dz = B[2] - A[2];
        const len = Math.hypot(dx, dy, dz); if (len < 1e-4) return;
        const yaw = Math.atan2(dy, dx), pitch = Math.atan2(dz, Math.hypot(dx, dy)), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
        out.push({ t: "box", n, m, p: [it.x + mx * c - my * s, it.y + mx * s + my * c, (A[2] + B[2]) / 2 + zoff], s: [len + (o.ext || 0), t, o.t2 || t], rz: it.rot + yaw / D2R, rx: 0, ry: -pitch / D2R, b: o.b ?? Math.min(0.01, t * 0.2), ...tag });
      },
      // triangles given in local metres [x,y,z, ...]; two = also emit the back side
      tris(n, m, v, two, uv, nn) {
        const o = []; for (let i = 0; i < v.length; i += 3) { const [x, y] = W(v[i], v[i + 1]); o.push(x, y, v[i + 2] * kz + zoff); }
        if (two) for (let i = v.length - 9; i >= 0; i -= 9) for (const k of [6, 3, 0]) { const [x, y] = W(v[i + k], v[i + k + 1]); o.push(x, y, v[i + k + 2] * kz + zoff); }
        const pr = { t: "tris", n, m, v: o, ...tag };
        if (uv) pr.uv = uv;
        if (nn) { const r = []; for (let i = 0; i < nn.length; i += 3) r.push(nn[i] * c - nn[i + 1] * s, nn[i] * s + nn[i + 1] * c, nn[i + 2]); pr.nn = r; }
        out.push(pr);
      },
      // tapered round limb between two local points (trunks, branches, stems)
      limb(n, m, p0, p1, r0, r1, seg = 7) {
        const d = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]], L = Math.hypot(...d) || 1, dz = d.map(q => q / L);
        const ref = Math.abs(dz[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
        let u = [dz[1] * ref[2] - dz[2] * ref[1], dz[2] * ref[0] - dz[0] * ref[2], dz[0] * ref[1] - dz[1] * ref[0]]; const ul = Math.hypot(...u); u = u.map(q => q / ul);
        const w = [dz[1] * u[2] - dz[2] * u[1], dz[2] * u[0] - dz[0] * u[2], dz[0] * u[1] - dz[1] * u[0]];
        const ring = (p, r, k) => { const a = k / seg * 2 * Math.PI, ca = Math.cos(a) * r, sa = Math.sin(a) * r; return [p[0] + u[0] * ca + w[0] * sa, p[1] + u[1] * ca + w[1] * sa, p[2] + u[2] * ca + w[2] * sa]; };
        const v = [], nn = [], nrm = k => { const a = k / seg * 2 * Math.PI; return [u[0] * Math.cos(a) + w[0] * Math.sin(a), u[1] * Math.cos(a) + w[1] * Math.sin(a), u[2] * Math.cos(a) + w[2] * Math.sin(a)]; };
        for (let k = 0; k < seg; k++) { const A = ring(p0, r0, k), B = ring(p0, r0, k + 1), C = ring(p1, r1, k + 1), D = ring(p1, r1, k);
          v.push(...A, ...B, ...C, ...A, ...C, ...D); nn.push(...nrm(k), ...nrm(k + 1), ...nrm(k + 1), ...nrm(k), ...nrm(k + 1), ...nrm(k)); }
        api.tris(n, m, v, false, null, nn);
      },
      cone(n, m, lx, ly, z0, r0, r1, h, seg = 16) {   // frustum / cone standing on z0
        const v = [], P = (r, k, z) => [lx + r * Math.cos(k / seg * 2 * Math.PI), ly + r * Math.sin(k / seg * 2 * Math.PI), z];
        for (let k = 0; k < seg; k++) { const a0 = P(r0, k, z0), a1 = P(r0, k + 1, z0), b0 = P(r1, k, z0 + h), b1 = P(r1, k + 1, z0 + h);
          v.push(...a0, ...a1, ...b1); if (r1 > 1e-4) v.push(...a0, ...b1, ...b0);
          v.push(lx, ly, z0, ...a1, ...a0); if (r1 > 1e-4) v.push(lx, ly, z0 + h, ...b0, ...b1); }
        api.tris(n, m, v);
      }
    };
    return api;
  }
  // simple chair facing local -Y rotated by ang (dining / meeting tables)
  function seat(m, p, lx, ly, ang, mat, legMat) {
    const r = ang * D2R, at = (x, y) => [lx + x * Math.cos(r) - y * Math.sin(r), ly + x * Math.sin(r) + y * Math.cos(r)];
    for (const [x, y] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) { const [px, py] = at(x, y); m.box(p + "leg" + x + y, legMat, px, py, 0.22, 0.035, 0.035, 0.44, { dr: ang, b: 0.006 }); }
    const [sx, sy] = at(0, 0); m.box(p + "seat", mat, sx, sy, 0.46, 0.46, 0.46, 0.05, { dr: ang, b: 0.015 });
    const [bx, by] = at(0, 0.21); m.box(p + "back", mat, bx, by, 0.72, 0.44, 0.04, 0.46, { dr: ang, rx: -6, b: 0.015 });
  }
  // free-standing wall-like run with openings for hosted doors / windows / gates (interior walls, boundary walls)
  function wallRun(m, it, H, T, mat, cap) {
    const L = it.props.len;
    const ops = state.items.filter(o => o.host === it.id && CATALOG[o.type].opening).map(o => {
      const k = o.props.scale || [1, 1, 1], op = CATALOG[o.type].opening(o), cc = -L / 2 + o.t;
      return { a: Math.max(-L / 2, cc - op.w * k[0] / 2), b: Math.min(L / 2, cc + op.w * k[0] / 2), sill: op.sill * k[2], top: Math.min(H, (op.sill + op.h) * k[2]) };
    }).filter(o => o.b > o.a).sort((p, q) => p.a - q.a);
    const spans = []; let cur = -L / 2;
    for (const o of ops) { spans.push([cur, o.a, 0, H]); if (o.sill > 0.01) spans.push([o.a, o.b, 0, o.sill]); if (o.top < H - 0.01) spans.push([o.a, o.b, o.top, H]); cur = Math.max(cur, o.b); }
    spans.push([cur, L / 2, 0, H]);
    spans.forEach(([x0, x1, z0, z1], k) => {
      if (x1 - x0 < 0.01 || z1 - z0 < 0.01) return;
      const xc = (x0 + x1) / 2, w = x1 - x0, hgt = z1 - z0, zc = (z0 + z1) / 2;
      if (it.props.glass) m.box("pane" + k, "glass2", xc, 0, zc, w, 0.02, hgt, { b: 0 });
      else m.box("wall" + k, mat, xc, 0, zc, w, T, hgt, { b: Math.min(0.01, T / 4) });
      if (z0 < 0.01 && !it.props.glass && it.type === "partition") for (const sy of [-1, 1]) m.box(`skirt${k}_${sy}`, "fascia", xc, sy * (T / 2 + 0.008), 0.05, w, 0.016, 0.1, { b: 0.003 });
    });
    if (it.props.glass) {
      for (const sx of [-1, 1]) m.box("post" + sx, "alu", sx * (L / 2 - 0.03), 0, H / 2, 0.06, Math.max(0.1, T), H, { b: 0.01 });
      m.box("headrail", "alu", 0, 0, H - 0.03, L, Math.max(0.1, T), 0.06, { b: 0.01 });
      for (const o of ops) for (const sx of [o.a, o.b]) m.box("jamb" + sx.toFixed(2), "alu", sx, 0, o.top / 2, 0.05, Math.max(0.1, T), o.top, { b: 0.008 });
      let cx = -L / 2; for (const o of [...ops, { a: L / 2, b: L / 2 }]) { if (o.a - cx > 0.05) m.box("rail" + cx.toFixed(2), "alu", (cx + o.a) / 2, 0, 0.03, o.a - cx, Math.max(0.1, T), 0.06, { b: 0.008 }); cx = o.b; }
    } else if (cap) m.box("cap", cap, 0, 0, H + 0.03, L + 0.04, T + 0.06, 0.06, { b: 0.01 });
  }
  const LINEAR = ["partition", "pwall", "fence", "hedge", "road", "path", "bridge"];
  const HOSTS = ["partition", "pwall"];
  const linear_ = (o) => ({ halfFn: it => it.props.len / 2, noScale: true, linear: true, ...o });

  CATALOG.partition = linear_({ label: "Interior wall", short: "Wall", def: { len: 3, thick: 0.12, h: 0, glass: false },
    dims: [["len", "Length m", 0.3, 60], ["thick", "Thickness m", 0.05, 0.8], ["h", "Height m (0 = to ceiling)", 0, 12]],
    build(m, it, room) { wallRun(m, it, +it.props.h > 0 ? +it.props.h : room.h, it.props.thick || 0.12, "partition", "wall_cap"); } });
  CATALOG.pwall = linear_({ label: "Boundary wall", short: "Garden wall", site: true, def: { len: 6, thick: 0.25, h: 1.8, fin: "brick_red" },
    dims: [["len", "Length m", 0.3, 300], ["thick", "Thickness m", 0.1, 1], ["h", "Height m", 0.3, 8]], fin: "ext",
    build(m, it) { wallRun(m, it, +it.props.h || 1.8, it.props.thick || 0.25, "fin_" + (it.props.fin || "brick_red"), "concrete"); } });
  CATALOG.fence = linear_({ label: "Fence", short: "Fence", site: true, def: { len: 10, h: 2.0, style: "wire" }, dims: [["len", "Length m", 0.5, 400], ["h", "Height m", 0.5, 5]],
    styles: [["wire", "Security mesh"], ["picket", "Timber picket"], ["palisade", "Steel palisade"]],
    build(m, it) {
      const L = it.props.len, H = it.props.h || 2, st = it.props.style || "wire";
      const np = Math.max(1, Math.ceil(L / (st === "wire" ? 3 : 2.4)));
      for (let k = 0; k <= np; k++) { const x = -L / 2 + L * k / np;
        if (st === "picket") m.box("post" + k, "wood_light", x, 0, H / 2, 0.09, 0.09, H, { b: 0.01 }); else m.cyl("post" + k, "steel_dark", x, 0, H / 2 + 0.05, 0.04, H + 0.1, { seg: 10 }); }
      if (st === "wire") {
        for (let j = 0; j < 7; j++) m.box("wire" + j, "steel", 0, 0, 0.12 + j * (H - 0.15) / 6, L, 0.008, 0.008, { b: 0 });
        for (let k = 0; k < Math.min(np * 6, 600); k++) { const x = -L / 2 + (k + 0.5) * L / Math.min(np * 6, 600); m.box("strand" + k, "steel", x, 0, H / 2, 0.006, 0.006, H - 0.1, { b: 0 }); }
        m.box("toprail", "steel_dark", 0, 0, H, L, 0.04, 0.04, { b: 0.008 });
        for (let j = 0; j < 3; j++) m.box("barb" + j, "steel", 0, -0.08 - j * 0.07, H + 0.12 + j * 0.06, L, 0.006, 0.006, { b: 0 });
      } else {
        const sp = st === "picket" ? 0.16 : 0.13, n = Math.min(1600, Math.floor(L / sp));
        for (const z of st === "picket" ? [0.25, H - 0.25] : [0.3, H - 0.2]) m.box("rail" + z, st === "picket" ? "wood_light" : "steel_dark", 0, 0.05, z, L, 0.03, 0.08, { b: 0.006 });
        for (let k = 0; k < n; k++) { const x = -L / 2 + (k + 0.5) * L / n;
          if (st === "picket") m.box("p" + k, "fascia", x, 0.08, (H - 0.1) / 2 + 0.05, 0.08, 0.02, H - 0.1, { b: 0.004 }); else m.box("p" + k, "steel_dark", x, 0.08, H / 2, 0.06, 0.02, H, { b: 0.003 }); }
      }
    } });
  CATALOG.hedge = linear_({ label: "Hedge", short: "Hedge", site: true, def: { len: 6, h: 1.4, thick: 0.9 }, dims: [["len", "Length m", 0.5, 200], ["h", "Height m", 0.4, 4], ["thick", "Thickness m", 0.3, 3]],
    build(m, it) { const L = it.props.len, H = it.props.h, T = it.props.thick; m.box("hedge", "hedge", 0, 0, H / 2, L, T, H, { b: Math.min(0.3, T / 3) });
      const n = Math.min(80, Math.floor(L / 1.1)); for (let k = 0; k < n; k++) m.sph("lump" + k, k % 2 ? "hedge" : "foliage", -L / 2 + (k + 0.5) * L / n, ((k * 37) % 5 - 2) * 0.04, H - 0.1, T * 0.42, { sz: 0.6 }); } });
  CATALOG.road = linear_({ label: "Road", short: "Road", site: true, def: { len: 20, w: 6.5, lines: true }, dims: [["len", "Length m", 1, 400], ["w", "Width m", 2.5, 30]],
    build(m, it) { const L = it.props.len, w = it.props.w, z = 0.012 + (hashOf(it.id) % 7) * 0.0015;
      m.up("asphalt", "fin_asphalt", 0, 0, z, L, w);
      for (const sy of [-1, 1]) { m.box("kerb" + sy, "concrete", 0, sy * (w / 2 + 0.08), 0.06, L, 0.16, 0.12, { b: 0.01 }); m.box("edge" + sy, "road_line", 0, sy * (w / 2 - 0.25), z + 0.002, L, 0.1, 0.004, { b: 0 }); }
      if (it.props.lines && w > 4.5) { const n = Math.floor(L / 6); for (let k = 0; k < n; k++) m.box("dash" + k, "road_line", -L / 2 + 1.5 + k * 6 + 1.5, 0, z + 0.002, 3, 0.12, 0.004, { b: 0 }); } } });
  CATALOG.path = linear_({ label: "Footpath", short: "Path", site: true, def: { len: 8, w: 1.4, fin: "paving" }, dims: [["len", "Length m", 0.5, 300], ["w", "Width m", 0.6, 8]], fin: "ground",
    build(m, it) { const L = it.props.len, w = it.props.w, z = 0.02 + (hashOf(it.id) % 5) * 0.0015; m.up("path", "fin_" + (it.props.fin || "paving"), 0, 0, z, L, w);
      for (const sy of [-1, 1]) m.box("edging" + sy, "concrete", 0, sy * (w / 2 + 0.03), 0.03, L, 0.06, 0.06, { b: 0.005 }); } });
  CATALOG.bridge = linear_({ label: "Bridge", short: "Bridge", site: true, def: { len: 24, w: 5, h: 5 }, dims: [["len", "Length m", 4, 300], ["w", "Width m", 2, 30], ["h", "Deck height m", 0.5, 40]],
    build(m, it) { const L = it.props.len, w = it.props.w, H = it.props.h;
      m.box("deck", "concrete", 0, 0, H - 0.35, L, w, 0.7, { b: 0.03 }); m.up("surface", "fin_asphalt", 0, 0, H + 0.003, L, w - 0.6);
      for (const sy of [-1, 1]) { m.box("parapet" + sy, "concrete", 0, sy * (w / 2 - 0.15), H + 0.45, L, 0.3, 0.9, { b: 0.02 }); m.box("rail" + sy, "steel", 0, sy * (w / 2 - 0.15), H + 1.05, L, 0.06, 0.06, { b: 0.01 }); }
      const n = Math.max(1, Math.ceil(L / 14)); for (let k = 0; k <= n; k++) { const x = -L / 2 + 0.8 + (L - 1.6) * k / n;
        m.box("pier" + k, "concrete", x, 0, (H - 0.7) / 2, 1.0, w * 0.6, H - 0.7, { b: 0.03 }); m.box("cap" + k, "concrete", x, 0, H - 0.85, 1.4, w - 0.2, 0.3, { b: 0.02 }); } } });

  // ---------------------------------------------------------------- structure
  CATALOG.stairs = { label: "Staircase", short: "Stairs", def: { w: 1.0 }, dims: [["w", "Width m", 0.6, 4]], halfFn: it => it.props.w / 2,
    build(m, it, room) {
      const n = stairSteps(it), rise = room.fh / n, tr = 0.27, run = n * tr, w = it.props.w, x = w / 2 - 0.05;
      for (let k = 0; k < n; k++) { const y = -run / 2 + (k + 0.5) * tr, h = (k + 1) * rise;
        m.box("step" + k, "stair", 0, y, h / 2, w, tr, h, { b: 0.004 }); m.box("tread" + k, "wood", 0, y - 0.01, h - 0.01, w + 0.01, tr + 0.03, 0.03, { b: 0.006 });
        if (k % 2 === 0) m.beam("baluster" + k, "steel", [x, y, h], [x, y, h + 0.9], 0.02); }
      m.beam("handrail", "wood_dark", [x, -run / 2 + 0.13, rise + 0.9], [x, run / 2 - 0.13, room.fh + 0.9], 0.05, { b: 0.015, ext: 0.1 });
      m.box("newel0", "wood_dark", x, -run / 2 + 0.13, (rise + 0.95) / 2, 0.08, 0.08, rise + 0.95, { b: 0.01 });
    } };
  CATALOG.column = { label: "Column", short: "Column", def: { r: 0.2 }, dims: [["r", "Radius m", 0.05, 2]],
    build(m, it, room) { m.cyl("shaft", "concrete", 0, 0, room.h / 2, it.props.r, room.h, { seg: 28 }); m.cyl("base", "concrete", 0, 0, 0.05, it.props.r + 0.05, 0.1, { seg: 28 }); } };
  CATALOG.garage = { label: "Garage / roller door", short: "Garage door", wall: true, def: { w: 2.6, h: 2.2 }, halfFn: it => it.props.w / 2 + 0.1,
    opening: it => ({ w: it.props.w, h: it.props.h, sill: 0 }), dims: [["w", "Opening width m", 1.5, 12], ["h", "Opening height m", 1.8, 8]],
    build(m, it) { const { w, h } = it.props, n = Math.max(3, Math.round(h / 0.55));
      for (let k = 0; k < n; k++) m.box("panel" + k, "cab_white", 0, 0.06, (k + 0.5) * h / n, w, 0.04, h / n - 0.012, { b: 0.006 });
      for (const sx of [-1, 1]) m.box("guide" + sx, "steel_dark", sx * (w / 2 + 0.03), 0.06, h / 2, 0.06, 0.1, h, { b: 0.008 });
      m.box("handle", "steel", 0, 0.03, 0.4, 0.3, 0.03, 0.04, { b: 0.01 }); } };
  CATALOG.wall_art = { label: "Picture on wall", short: "Picture", wall: true, half: 0.6, slots: [["pic", "Picture"]], def: { pic: "art" },
    build(m, it) { m.box("frame", "wood_dark", 0, -0.02, 1.55, 1.1, 0.04, 0.84, { b: 0.008 }); m.face("pic", texMat(it.props.pic), 0, -0.041, 1.55, 1.0, 0.74); } };
  CATALOG.mirror = { label: "Mirror", short: "Mirror", wall: true, half: 0.4, def: {},
    build(m) { m.box("frame", "brass", 0, -0.015, 1.5, 0.7, 0.03, 1.0, { b: 0.008 }); m.box("glass", "mirror", 0, -0.032, 1.5, 0.64, 0.004, 0.94, { b: 0 }); } };

  // ---------------------------------------------------------------- living
  CATALOG.sofa = { label: "Sofa", short: "Sofa", def: { seats: 3 }, dims: [["seats", "Seats", 1, 6]],
    build(m, it) { const n = Math.round(it.props.seats || 3), W = n * 0.64 + 0.4;
      m.box("base", "fabric", 0, 0, 0.24, W, 0.9, 0.3, { b: 0.04 });
      for (let k = 0; k < n; k++) m.box("cushion" + k, "fabric", -W / 2 + 0.2 + (k + 0.5) * 0.64, -0.06, 0.45, 0.62, 0.66, 0.14, { b: 0.05 });
      for (let k = 0; k < n; k++) m.box("backc" + k, "fabric", -W / 2 + 0.2 + (k + 0.5) * 0.64, 0.3, 0.65, 0.6, 0.2, 0.42, { rx: -8, b: 0.07 });
      m.box("back", "fabric_dark", 0, 0.4, 0.55, W, 0.12, 0.6, { b: 0.04 });
      for (const sx of [-1, 1]) { m.box("arm" + sx, "fabric", sx * (W / 2 - 0.1), 0, 0.5, 0.2, 0.9, 0.36, { b: 0.06 });
        for (const sy of [-1, 1]) m.cyl("foot" + sx + sy, "wood_dark", sx * (W / 2 - 0.1), sy * 0.36, 0.045, 0.03, 0.09, { seg: 10 }); }
      m.box("throw", "cushion", -W / 2 + 0.45, 0.22, 0.62, 0.4, 0.15, 0.36, { rx: -14, b: 0.06 }); } };
  CATALOG.armchair = { label: "Armchair", short: "Armchair", def: {},
    build(m) { m.box("base", "fabric_warm", 0, 0, 0.24, 0.9, 0.86, 0.3, { b: 0.04 }); m.box("cushion", "fabric_warm", 0, -0.06, 0.45, 0.56, 0.64, 0.14, { b: 0.05 });
      m.box("back", "fabric_warm", 0, 0.34, 0.66, 0.9, 0.2, 0.6, { rx: -8, b: 0.06 }); for (const sx of [-1, 1]) m.box("arm" + sx, "fabric_warm", sx * 0.37, 0, 0.5, 0.16, 0.86, 0.36, { b: 0.06 });
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) m.cyl("foot" + sx + sy, "wood_dark", sx * 0.37, sy * 0.35, 0.045, 0.025, 0.09, { seg: 10 }); } };
  CATALOG.coffee_table = { label: "Coffee table", short: "Coffee table", def: {},
    build(m) { m.box("top", "wood", 0, 0, 0.42, 1.2, 0.65, 0.04, { b: 0.01 }); m.box("shelf", "wood", 0, 0, 0.12, 1.1, 0.55, 0.02, { b: 0.005 });
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) m.box("leg" + sx + sy, "steel_dark", sx * 0.56, sy * 0.28, 0.2, 0.03, 0.03, 0.4, { b: 0.006 });
      m.box("book", "red", -0.2, 0.05, 0.455, 0.24, 0.17, 0.03, { dr: 12, b: 0.004 }); m.cyl("bowl", "ceramic", 0.3, -0.05, 0.47, 0.1, 0.06, { seg: 20 }); } };
  CATALOG.tv_unit = { label: "TV & media unit", short: "TV unit", def: {},
    build(m) { m.box("unit", "wood_dark", 0, 0, 0.24, 1.9, 0.42, 0.44, { b: 0.008 }); for (let k = -1; k <= 1; k++) m.box("door" + k, "wood", k * 0.62, -0.212, 0.24, 0.6, 0.006, 0.4, { b: 0 });
      m.box("stand", "black", 0, 0.05, 0.5, 0.36, 0.22, 0.03, { b: 0.006 }); m.box("neck", "black", 0, 0.06, 0.6, 0.06, 0.04, 0.2, { b: 0.008 });
      m.box("tv", "monitor", 0, 0.05, 0.98, 1.45, 0.05, 0.84, { b: 0.008 }); m.face("screen", texMat("tv"), 0, 0.024, 0.98, 1.41, 0.8);
      m.box("soundbar", "black", 0, -0.08, 0.5, 0.9, 0.09, 0.07, { b: 0.025 }); } };
  CATALOG.rug = { label: "Rug", short: "Rug", def: { color: "#7a4a3a" }, colors: true,
    build(m, it) { m.box("rug", colMat(it.props.color), 0, 0, 0.006, 2.4, 1.7, 0.012, { b: 0.004 }); m.box("border", "cushion", 0, 0, 0.004, 2.5, 1.8, 0.008, { b: 0.003 }); } };
  CATALOG.floor_lamp = { label: "Floor lamp", short: "Lamp", def: {},
    build(m) { m.cyl("base", "steel_dark", 0, 0, 0.015, 0.16, 0.03, { seg: 24 }); m.cyl("pole", "steel", 0, 0, 0.8, 0.012, 1.55, { seg: 10 });
      m.cone("shade", "shade", 0, 0, 1.45, 0.22, 0.14, 0.3, 20); m.sph("bulb", "warm_light", 0, 0, 1.52, 0.05); } };
  CATALOG.bookshelf = { label: "Bookshelf", short: "Bookshelf", def: {},
    build(m, it) { const h = hashOf(it.id); for (const sx of [-1, 1]) m.box("side" + sx, "wood", sx * 0.44, 0, 1.0, 0.025, 0.32, 2.0, { b: 0.004 });
      m.box("back", "wood_dark", 0, 0.15, 1.0, 0.86, 0.01, 2.0, { b: 0 }); const cols = ["red", "blue_marker", "olive", "white", "wood_dark", "fabric_warm"];
      for (let j = 0; j < 6; j++) { const z = 0.02 + j * 0.39; m.box("shelf" + j, "wood", 0, 0, z, 0.86, 0.3, 0.025, { b: 0.003 });
        if (j < 5) { let x = -0.4; let k = 0; while (x < 0.36) { const bw = 0.03 + ((h >> (k % 20)) & 3) * 0.012, bh = 0.22 + ((h >> ((k + 3) % 20)) & 3) * 0.03;
          if ((k + j) % 9 !== 4) m.box(`book${j}_${k}`, cols[(k * 7 + j * 3 + h) % cols.length], x + bw / 2, 0.01, z + 0.0125 + bh / 2, bw - 0.004, 0.22, bh, { b: 0.002 }); x += bw; k++; } } } } };
  CATALOG.dining_table = { label: "Dining table", short: "Dining set", def: { seats: 6 }, dims: [["seats", "Chairs", 2, 10]],
    build(m, it) { const n = Math.max(2, Math.round(it.props.seats)), per = Math.ceil(n / 2), L = Math.max(1.0, per * 0.62 + 0.3);
      m.box("top", "wood", 0, 0, 0.745, L, 0.95, 0.04, { b: 0.01 }); for (const sx of [-1, 1]) for (const sy of [-1, 1]) m.box("leg" + sx + sy, "wood", sx * (L / 2 - 0.08), sy * 0.39, 0.36, 0.06, 0.06, 0.72, { b: 0.008 });
      for (let k = 0; k < n; k++) { const side = k % 2 ? 1 : -1, i = Math.floor(k / 2), cnt = side < 0 ? Math.ceil(n / 2) : Math.floor(n / 2), x = (i - (cnt - 1) / 2) * 0.62;
        seat(m, "chair" + k, x, side * 0.62, side < 0 ? 0 : 180, "wood", "wood_dark"); }
      m.cyl("vase", "ceramic", 0, 0, 0.84, 0.06, 0.16, { seg: 18 }); for (let k = 0; k < 3; k++) m.sph("flower" + k, k ? "red" : "yellow", (k - 1) * 0.05, 0.02, 0.96, 0.05); } };
  CATALOG.plant.label = "Pot plant";

  // ---------------------------------------------------------------- bed & bath
  function bed(m, W) {
    m.box("frame", "wood", 0, 0, 0.17, W + 0.06, 2.1, 0.26, { b: 0.01 }); for (const sx of [-1, 1]) for (const sy of [-1, 1]) m.box("foot" + sx + sy, "wood_dark", sx * (W / 2 - 0.02), sy * 1.0, 0.03, 0.06, 0.06, 0.06, { b: 0.01 });
    m.box("mattress", "linen", 0, -0.02, 0.4, W, 2.0, 0.22, { b: 0.05 }); m.box("duvet", "duvet", 0, -0.3, 0.53, W + 0.04, 1.44, 0.08, { b: 0.035 });
    m.box("fold", "linen", 0, 0.38, 0.535, W + 0.02, 0.12, 0.07, { b: 0.03 });
    const n = W > 1.2 ? 2 : 1; for (let k = 0; k < n; k++) m.box("pillow" + k, "linen", (k - (n - 1) / 2) * (W / 2), 0.72, 0.58, W / n - 0.12, 0.36, 0.13, { rx: -12, b: 0.05 });
    m.box("headboard", "fabric", 0, 1.06, 0.6, W + 0.14, 0.08, 1.08, { b: 0.03 });
  }
  CATALOG.bed_double = { label: "Double bed", short: "Double bed", def: {}, build(m) { bed(m, 1.6);
    for (const sx of [-1, 1]) { m.box("nightstand" + sx, "wood", sx * 1.15, 0.8, 0.25, 0.48, 0.42, 0.5, { b: 0.008 }); m.box("drawer" + sx, "wood_dark", sx * 1.15, 0.588, 0.38, 0.4, 0.006, 0.12, { b: 0 });
      m.cyl("lampb" + sx, "ceramic", sx * 1.15, 0.85, 0.6, 0.06, 0.2, { seg: 16 }); m.cone("lamps" + sx, "shade", sx * 1.15, 0.85, 0.68, 0.14, 0.1, 0.18, 16); } } };
  CATALOG.bed_single = { label: "Single bed", short: "Single bed", def: {}, build(m) { bed(m, 0.95); } };
  CATALOG.wardrobe = { label: "Wardrobe", short: "Wardrobe", def: {},
    build(m) { m.box("body", "cab_white", 0, 0, 1.1, 1.8, 0.62, 2.2, { b: 0.01 }); for (let k = 0; k < 3; k++) { const x = -0.6 + k * 0.6;
      m.box("door" + k, "cab_white", x, -0.315, 1.12, 0.58, 0.012, 2.1, { b: 0.004 }); m.box("handle" + k, "steel", x + (k === 1 ? -0.24 : 0.24), -0.33, 1.1, 0.02, 0.02, 0.3, { b: 0.008 }); }
      m.box("plinth", "black", 0, -0.02, 0.04, 1.76, 0.56, 0.08, { b: 0 }); } };
  CATALOG.bathtub = { label: "Bathtub", short: "Bath", def: {},
    build(m) { m.box("tub", "ceramic", 0, 0, 0.28, 0.8, 1.7, 0.56, { b: 0.04 }); m.box("inside", "white", 0, 0.02, 0.5, 0.64, 1.5, 0.12, { b: 0.06 });
      m.up("water", "water", 0, 0.02, 0.48, 0.6, 1.44); m.cyl("tap", "steel", 0, 0.78, 0.7, 0.02, 0.16, { seg: 10 }); m.box("spout", "steel", 0, 0.72, 0.76, 0.03, 0.14, 0.03, { b: 0.01 }); } };
  CATALOG.shower = { label: "Shower", short: "Shower", def: {},
    build(m) { m.box("tray", "ceramic", 0, 0, 0.04, 0.9, 0.9, 0.08, { b: 0.01 }); m.box("glassA", "glass2", 0, -0.45, 1.05, 0.9, 0.012, 2.0, { b: 0 }); m.box("glassB", "glass2", -0.45, 0, 1.05, 0.012, 0.9, 2.0, { b: 0 });
      m.cyl("pipe", "steel", 0, 0.42, 1.5, 0.015, 1.3, { seg: 10 }); m.cyl("head", "steel", 0, 0.3, 2.05, 0.1, 0.02, { seg: 20 }); m.box("arm", "steel", 0, 0.37, 2.12, 0.02, 0.14, 0.02, { b: 0.005 }); } };
  CATALOG.toilet = { label: "Toilet", short: "Toilet", def: {},
    build(m) { m.cyl("bowl", "ceramic", 0, -0.05, 0.2, 0.19, 0.4, { seg: 24 }); m.cyl("seat", "white", 0, -0.06, 0.41, 0.2, 0.03, { seg: 24 }); m.box("cistern", "ceramic", 0, 0.24, 0.6, 0.4, 0.18, 0.4, { b: 0.03 });
      m.box("flush", "steel", 0, 0.24, 0.805, 0.08, 0.05, 0.01, { b: 0.003 }); } };
  CATALOG.basin = { label: "Basin & vanity", short: "Basin", def: {},
    build(m) { m.box("vanity", "wood", 0, 0, 0.42, 0.8, 0.48, 0.74, { b: 0.008 }); m.box("top", "ceramic", 0, 0, 0.82, 0.82, 0.5, 0.06, { b: 0.02 });
      m.up("bowl", "white", 0, -0.03, 0.852, 0.5, 0.3); m.cyl("tap", "steel", 0, 0.17, 0.92, 0.015, 0.14, { seg: 10 }); m.box("spout", "steel", 0, 0.12, 0.98, 0.02, 0.1, 0.02, { b: 0.006 });
      m.box("mirror", "mirror", 0, 0.235, 1.45, 0.7, 0.01, 0.8, { b: 0 }); m.box("mframe", "steel", 0, 0.24, 1.45, 0.74, 0.008, 0.84, { b: 0 }); } };

  // ---------------------------------------------------------------- kitchen
  CATALOG.kitchen = { label: "Kitchen run", short: "Kitchen", def: { len: 3 }, dims: [["len", "Length m", 1.2, 8]], halfFn: it => it.props.len / 2,
    build(m, it) { const L = it.props.len, n = Math.max(2, Math.round(L / 0.6));
      m.box("plinth", "black", 0, 0.02, 0.05, L, 0.54, 0.1, { b: 0 }); m.box("base", "cab_white", 0, 0, 0.47, L, 0.58, 0.74, { b: 0.006 });
      m.box("worktop", "counter", 0, -0.01, 0.865, L + 0.02, 0.64, 0.04, { b: 0.006 }); m.box("upstand", "counter", 0, 0.3, 0.95, L, 0.02, 0.12, { b: 0 });
      for (let k = 0; k < n; k++) { const x = -L / 2 + (k + 0.5) * L / n; m.box("door" + k, "cab_white", x, -0.292, 0.47, L / n - 0.006, 0.006, 0.72, { b: 0 });
        m.box("handle" + k, "steel", x, -0.305, 0.8, 0.22, 0.015, 0.015, { b: 0.006 });
        m.box("wall" + k, "cab_white", x, 0.12, 1.85, L / n - 0.006, 0.35, 0.7, { b: 0.006 }); m.box("whandle" + k, "steel", x, -0.06, 1.55, 0.22, 0.015, 0.015, { b: 0.006 }); }
      const hx = Math.min(L / 2 - 0.4, 0.5); m.up("hob", "black", hx, -0.02, 0.887, 0.58, 0.5); for (const [a, b] of [[-0.14, -0.12], [0.14, -0.12], [-0.14, 0.12], [0.14, 0.12]]) m.cyl("ring" + a + b, "steel_dark", hx + a, -0.02 + b, 0.889, 0.08, 0.003, { seg: 20 });
      m.box("hood", "steel", hx, 0.05, 1.62, 0.6, 0.5, 0.12, { b: 0.01 }); m.box("oven", "glass_dark", hx, -0.293, 0.5, 0.56, 0.006, 0.5, { b: 0 });
      const sx = -Math.min(L / 2 - 0.4, 0.6); m.box("sink", "steel", sx, -0.02, 0.86, 0.5, 0.4, 0.06, { b: 0.02 }); m.cyl("tap", "steel", sx, 0.2, 0.98, 0.015, 0.2, { seg: 10 }); m.box("spout", "steel", sx, 0.13, 1.07, 0.02, 0.15, 0.02, { b: 0.006 }); } };
  CATALOG.fridge = { label: "Fridge freezer", short: "Fridge", def: {},
    build(m) { m.box("body", "steel", 0, 0, 0.93, 0.7, 0.68, 1.86, { b: 0.02 }); m.box("seam", "black", 0, -0.342, 1.2, 0.68, 0.004, 0.008, { b: 0 });
      for (const z of [0.7, 1.55]) m.box("handle" + z, "steel_dark", 0.28, -0.37, z, 0.025, 0.03, 0.35, { b: 0.01 }); } };

  // ---------------------------------------------------------------- office
  CATALOG.office_desk = { label: "Office desk", short: "Desk", slots: [["s0", "Screen"]], def: { s0: "console_3" }, build(m, it) { deskParts(m, "", it, 1.4, [it.props.s0]); } };
  CATALOG.meeting_table = { label: "Meeting table", short: "Meeting table", def: { seats: 8 }, dims: [["seats", "Chairs", 2, 16]],
    build(m, it) { const n = Math.max(2, Math.round(it.props.seats)), per = Math.ceil(n / 2), L = Math.max(1.4, per * 0.75 + 0.4);
      m.box("top", "wood_dark", 0, 0, 0.74, L, 1.2, 0.045, { b: 0.015 }); for (const sx of [-1, 1]) m.box("ped" + sx, "steel_dark", sx * L * 0.3, 0, 0.36, 0.12, 0.7, 0.72, { b: 0.01 });
      m.box("beam", "steel_dark", 0, 0, 0.62, L * 0.6, 0.08, 0.06, { b: 0.008 }); m.box("ports", "black", 0, 0, 0.765, 0.3, 0.1, 0.01, { b: 0 });
      for (let k = 0; k < n; k++) { const side = k % 2 ? 1 : -1, i = Math.floor(k / 2), cnt = side < 0 ? Math.ceil(n / 2) : Math.floor(n / 2), x = (i - (cnt - 1) / 2) * 0.75;
        seat(m, "chair" + k, x, side * 0.8, side < 0 ? 0 : 180, "chair", "chair_leg"); } } };
  CATALOG.reception = { label: "Reception desk", short: "Reception", def: {},
    build(m) { m.box("front", "wood", 0, -0.2, 0.55, 2.6, 0.12, 1.1, { b: 0.01 }); m.box("ledge", "counter", 0, -0.26, 1.12, 2.7, 0.32, 0.04, { b: 0.008 });
      m.box("desk", "cab_white", 0, 0.15, 0.73, 2.5, 0.7, 0.04, { b: 0.008 }); for (const sx of [-1, 1]) m.box("side" + sx, "wood", sx * 1.3, 0.1, 0.55, 0.06, 0.7, 1.1, { b: 0.01 });
      m.box("glow", "led_strip", 0, -0.27, 0.08, 2.5, 0.01, 0.02, { b: 0 }); monitorParts(m, "mon", 0.4, 0.3, 1.0, "console_3", 0); chairParts(m, "chair_", 0, 0.75); } };
  CATALOG.lockers = { label: "Lockers", short: "Lockers", def: {},
    build(m) { for (let k = 0; k < 4; k++) { const x = -0.45 + k * 0.3; m.box("col" + k, "cab_grey", x, 0, 0.95, 0.295, 0.5, 1.9, { b: 0.006 });
      for (let j = 0; j < 2; j++) { m.box(`door${k}_${j}`, "cab_grey", x, -0.252, 0.5 + j * 0.92, 0.27, 0.006, 0.88, { b: 0 });
        for (let v = 0; v < 4; v++) m.box(`vent${k}_${j}_${v}`, "black", x, -0.256, 0.85 + j * 0.92 + v * 0.025, 0.12, 0.002, 0.008, { b: 0 }); m.box(`lock${k}_${j}`, "steel", x + 0.09, -0.258, 0.6 + j * 0.92, 0.02, 0.006, 0.05, { b: 0 }); } } } };
  CATALOG.printer = { label: "Printer / copier", short: "Copier", def: {},
    build(m) { m.box("base", "cab_white", 0, 0, 0.45, 0.62, 0.6, 0.9, { b: 0.015 }); m.box("top", "cab_grey", 0, 0, 1.0, 0.6, 0.55, 0.2, { b: 0.02 });
      m.box("panel", "monitor", 0.18, -0.25, 1.06, 0.2, 0.1, 0.03, { rx: -20, b: 0.006 }); for (let k = 0; k < 3; k++) m.box("tray" + k, "cab_grey", 0, -0.302, 0.2 + k * 0.22, 0.56, 0.006, 0.18, { b: 0 }); } };

  // ---------------------------------------------------------------- site & landscape
  CATALOG.tree = { label: "Tree", short: "Tree", site: true, def: {},
    build(m, it) { const h = hashOf(it.id), H = 6.5 + (h % 5) * 0.5; m.cone("trunk", "bark", 0, 0, 0, 0.24, 0.14, H * 0.55, 10);
      for (let k = 0; k < 6; k++) { const a = (k * 72 + h % 90) * D2R, r = k ? 1.1 : 0, z = H * 0.68 + (k ? ((k * 13 + h) % 5) * 0.25 : 0.6);
        m.sph("crown" + k, k % 2 ? "foliage" : "foliage2", Math.cos(a) * r, Math.sin(a) * r, z, k ? 1.5 : 1.9, { sz: 0.85 }); } } };
  CATALOG.conifer = { label: "Conifer", short: "Conifer", site: true, def: {},
    build(m, it) { const H = 8 + (hashOf(it.id) % 4); m.cone("trunk", "bark", 0, 0, 0, 0.2, 0.1, H * 0.3, 8);
      for (let k = 0; k < 4; k++) m.cone("tier" + k, "conifer", 0, 0, H * (0.18 + k * 0.18), 2.0 - k * 0.42, 0.05, H * 0.36, 14); } };
  CATALOG.bush = { label: "Shrub", short: "Shrub", site: true, def: {},
    build(m, it) { const h = hashOf(it.id); for (let k = 0; k < 4; k++) { const a = (k * 97 + h) * D2R; m.sph("b" + k, k % 2 ? "hedge" : "foliage2", Math.cos(a) * 0.35 * (k > 0), Math.sin(a) * 0.35 * (k > 0), 0.45, 0.55, { sz: 0.8 }); } } };
  CATALOG.pond = { label: "Pond", short: "Pond", site: true, def: {},
    build(m) { m.cyl("water", "water", 0, 0, 0.02, 3, 0.04, { seg: 40 }); for (let k = 0; k < 22; k++) { const a = k / 22 * 2 * Math.PI; m.sph("stone" + k, k % 3 ? "concrete" : "cab_grey", Math.cos(a) * 3.1, Math.sin(a) * 3.1, 0.05, 0.3, { sz: 0.45 }); } } };
  CATALOG.car = { label: "Car", short: "Car", site: true, def: { color: "#8c2b25" }, colors: true,
    build(m, it) { const col = colMat(it.props.color);
      m.box("body", col, 0, 0, 0.6, 1.8, 4.4, 0.6, { b: 0.14 }); m.box("cabin", "glass_dark", 0, 0.2, 1.08, 1.6, 2.3, 0.5, { b: 0.14 }); m.box("roof", col, 0, 0.3, 1.33, 1.48, 1.7, 0.05, { b: 0.025 });
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) { m.cyl("tyre" + sx + sy, "tyre", sx * 0.8, sy * 1.38, 0.34, 0.34, 0.24, { rx: 90, dr: 90, seg: 20 }); m.cyl("rim" + sx + sy, "rim", sx * 0.84, sy * 1.38, 0.34, 0.2, 0.2, { rx: 90, dr: 90, seg: 16 }); }
      for (const sx of [-1, 1]) { m.box("head" + sx, "lamp_cool", sx * 0.6, -2.19, 0.72, 0.36, 0.03, 0.1, { b: 0.01 }); m.box("tail" + sx, "red_light", sx * 0.66, 2.19, 0.75, 0.3, 0.03, 0.08, { b: 0.01 }); m.box("mirror" + sx, col, sx * 0.94, -0.75, 1.0, 0.12, 0.08, 0.08, { b: 0.02 }); }
      m.box("bumperF", "black", 0, -2.2, 0.42, 1.76, 0.1, 0.16, { b: 0.04 }); m.box("bumperR", "black", 0, 2.2, 0.42, 1.76, 0.1, 0.16, { b: 0.04 }); m.box("plate", "white", 0, -2.26, 0.43, 0.5, 0.01, 0.11, { b: 0 }); } };
  CATALOG.truck = { label: "Truck", short: "Truck", site: true, def: { color: "#d9d4c8" }, colors: true,
    build(m, it) { const col = colMat(it.props.color);
      m.box("cab", "red", 0, -3.6, 1.65, 2.45, 2.0, 2.5, { b: 0.12 }); m.box("windscreen", "glass_dark", 0, -4.61, 2.25, 2.1, 0.04, 0.9, { rx: 8, b: 0.02 }); m.box("chassis", "black", 0, 0.3, 0.75, 1.0, 9.2, 0.3, { b: 0.02 });
      m.box("cargo", col, 0, 1.3, 2.4, 2.55, 7.2, 2.9, { b: 0.04 }); m.box("grille", "black", 0, -4.62, 1.1, 2.0, 0.04, 0.5, { b: 0.01 });
      for (const sy of [-3.6, 2.2, 3.6]) for (const sx of [-1, 1]) m.cyl("tyre" + sx + sy, "tyre", sx * 1.05, sy, 0.5, 0.5, 0.36, { rx: 90, dr: 90, seg: 20 });
      for (const sx of [-1, 1]) m.box("head" + sx, "lamp_cool", sx * 0.95, -4.63, 0.95, 0.3, 0.02, 0.15, { b: 0.01 }); } };
  CATALOG.parking = { label: "Parking bays", short: "Parking", site: true, def: { n: 6 }, dims: [["n", "Bays", 1, 40]],
    build(m, it) { const n = Math.round(it.props.n), W = n * 2.6;
      m.up("pad", "fin_asphalt", 0, 0, 0.016, W + 0.4, 5.6); m.box("back", "road_line", 0, 2.6, 0.019, W, 0.12, 0.004, { b: 0 });
      for (let k = 0; k <= n; k++) m.box("line" + k, "road_line", -W / 2 + k * 2.6, 0.1, 0.019, 0.12, 5.0, 0.004, { b: 0 });
      for (let k = 0; k < n; k++) m.box("stop" + k, "concrete", -W / 2 + (k + 0.5) * 2.6, 2.1, 0.06, 1.6, 0.18, 0.12, { b: 0.02 }); } };
  CATALOG.street_light = { label: "Street light", short: "Street light", site: true, def: {},
    build(m) { m.cyl("base", "concrete", 0, 0, 0.15, 0.22, 0.3, { seg: 16 }); m.cone("pole", "steel_dark", 0, 0, 0.3, 0.09, 0.06, 6.2, 12);
      m.beam("arm", "steel_dark", [0, 0, 6.3], [0, -1.3, 6.6], 0.07); m.box("head", "steel_dark", 0, -1.45, 6.58, 0.32, 0.65, 0.14, { b: 0.03 }); m.box("lamp", "lamp_cool", 0, -1.45, 6.5, 0.24, 0.5, 0.02, { b: 0 }); } };
  CATALOG.bench = { label: "Bench", short: "Bench", site: true, def: {},
    build(m) { for (const sx of [-0.75, 0.75]) { m.box("leg" + sx, "steel_dark", sx, 0, 0.22, 0.06, 0.5, 0.44, { b: 0.01 }); m.beam("bk" + sx, "steel_dark", [sx, 0.2, 0.44], [sx, 0.3, 0.85], 0.05); }
      for (let k = 0; k < 4; k++) m.box("slat" + k, "wood", 0, -0.2 + k * 0.13, 0.46, 1.8, 0.11, 0.04, { b: 0.01 });
      for (let k = 0; k < 2; k++) m.box("bslat" + k, "wood", 0, 0.26 + k * 0.03, 0.62 + k * 0.17, 1.8, 0.04, 0.12, { rx: -15, b: 0.01 }); } };
  CATALOG.bin = { label: "Litter bin", short: "Bin", site: true, def: {},
    build(m) { m.cyl("body", "green_paint", 0, 0, 0.45, 0.28, 0.9, { seg: 20 }); m.cyl("lid", "steel_dark", 0, 0, 0.93, 0.3, 0.06, { seg: 20 }); m.box("slot", "black", 0, -0.26, 0.8, 0.2, 0.06, 0.08, { b: 0.01 }); } };
  CATALOG.bollard = { label: "Bollard", short: "Bollard", site: true, def: {},
    build(m) { m.cyl("post", "steel_dark", 0, 0, 0.5, 0.1, 1.0, { seg: 16 }); m.cyl("band", "yellow", 0, 0, 0.85, 0.102, 0.08, { seg: 16 }); m.sph("cap", "steel_dark", 0, 0, 1.0, 0.1, { sz: 0.4 }); } };
  CATALOG.barrier = { label: "Boom barrier", short: "Barrier", site: true, def: {},
    build(m) { m.box("housing", "yellow", 0, 0, 0.55, 0.4, 0.4, 1.1, { b: 0.03 }); m.box("pivot", "steel_dark", 0, -0.22, 0.95, 0.2, 0.06, 0.2, { b: 0.02 });
      for (let k = 0; k < 8; k++) m.box("boom" + k, k % 2 ? "white" : "red", 0.25 + k * 0.5 + 0.25, -0.25, 0.95, 0.5, 0.08, 0.1, { b: 0.01 });
      m.box("rest", "steel_dark", 4.15, -0.25, 0.45, 0.08, 0.08, 0.9, { b: 0.01 }); } };
  CATALOG.guard_booth = { label: "Guard booth", short: "Guard booth", site: true, def: {},
    build(m) { m.box("plinth", "concrete", 0, 0, 0.1, 2.6, 2.6, 0.2, { b: 0.02 }); m.box("body", "cab_white", 0, 0, 1.0, 2.4, 2.4, 1.6, { b: 0.02 });
      m.box("glazing", "glass_dark", 0, 0, 1.6, 2.42, 2.42, 0.9, { b: 0.01 }); for (const [x, y] of [[-1.18, -1.18], [1.18, -1.18], [-1.18, 1.18], [1.18, 1.18]]) m.box("post" + x + y, "steel_dark", x, y, 1.6, 0.08, 0.08, 0.95, { b: 0.01 });
      m.box("upper", "cab_white", 0, 0, 2.2, 2.4, 2.4, 0.3, { b: 0.01 }); m.box("roof", "steel_dark", 0, 0, 2.45, 3.0, 3.0, 0.2, { b: 0.02 }); m.box("door", "cab_grey", 0.5, -1.205, 0.95, 0.8, 0.02, 1.9, { b: 0.006 });
      m.box("light", "amber_light", 0, 0, 2.62, 0.2, 0.2, 0.14, { b: 0.04 }); } };
  CATALOG.utility_box = { label: "Utility cabinet", short: "Utility box", site: true, def: {},
    build(m) { m.box("plinth", "concrete", 0, 0, 0.1, 1.3, 0.6, 0.2, { b: 0.01 }); m.box("body", "green_paint", 0, 0, 0.9, 1.2, 0.5, 1.4, { b: 0.02 });
      for (const sx of [-1, 1]) m.box("door" + sx, "green_paint", sx * 0.3, -0.255, 0.9, 0.58, 0.01, 1.3, { b: 0 }); m.box("sign", "yellow", 0.3, -0.262, 1.3, 0.16, 0.004, 0.14, { b: 0 }); } };
  CATALOG.helipad = { label: "Helipad", short: "Helipad", site: true, def: {},
    build(m) { m.box("pad", "concrete", 0, 0, 0.05, 21, 21, 0.1, { b: 0.03 }); m.up("marking", texMat("helipad"), 0, 0, 0.102, 20, 20);
      for (let k = 0; k < 16; k++) { const a = k / 16 * 2 * Math.PI; m.cyl("light" + k, "led_green", Math.cos(a) * 10.2, Math.sin(a) * 10.2, 0.13, 0.08, 0.06, { seg: 10 }); } } };
  CATALOG.flagpole = { label: "Flagpole", short: "Flagpole", site: true, def: {},
    build(m) { m.cyl("base", "concrete", 0, 0, 0.1, 0.4, 0.2, { seg: 20 }); m.cone("pole", "steel", 0, 0, 0.2, 0.07, 0.04, 9, 12); m.sph("finial", "brass", 0, 0, 9.25, 0.08);
      for (let k = 0; k < 6; k++) m.box("cloth" + k, "duvet", 0.12 + k * 0.25, 0.03 * Math.sin(k * 1.4), 8.4, 0.26, 0.01, 1.2, { dr: 10 * Math.cos(k * 1.4), b: 0 }); } };

  // ---------------------------------------------------------------- infrastructure
  CATALOG.generator = { label: "Generator set", short: "Generator", site: true, def: {},
    build(m) { m.box("pad", "concrete", 0, 0, 0.1, 4.4, 2.0, 0.2, { b: 0.02 }); m.box("skid", "steel_dark", 0, 0, 0.28, 3.9, 1.5, 0.16, { b: 0.01 });
      m.box("body", "green_paint", 0, 0, 1.25, 3.7, 1.4, 1.8, { b: 0.04 }); for (let k = 0; k < 10; k++) for (const sy of [-1, 1]) m.box(`louvre${k}${sy}`, "steel_dark", -1.6 + k * 0.08, sy * 0.705, 1.35, 0.04, 0.01, 1.0, { b: 0 });
      m.cyl("exhaust", "steel_dark", 1.3, 0.3, 2.55, 0.1, 0.8, { seg: 14 }); m.box("panel", "black", 1.55, -0.706, 1.4, 0.4, 0.006, 0.3, { b: 0 }); m.box("led", "led_green", 1.45, -0.71, 1.48, 0.04, 0.004, 0.02, { b: 0 }); } };
  CATALOG.water_tank = { label: "Water tank", short: "Water tank", site: true, def: {},
    build(m) { m.cyl("plinth", "concrete", 0, 0, 0.1, 1.8, 0.2, { seg: 32 }); m.cyl("tank", "tank_white", 0, 0, 1.8, 1.6, 3.2, { seg: 32 }); m.cone("lid", "tank_white", 0, 0, 3.4, 1.6, 0.25, 0.4, 32);
      for (let k = 0; k < 4; k++) m.cyl("hoop" + k, "metal", 0, 0, 0.6 + k * 0.8, 1.615, 0.04, { seg: 32 });
      for (const sx of [-0.2, 0.2]) m.beam("ladder" + sx, "steel", [sx, -1.68, 0.2], [sx, -1.68, 3.5], 0.04); for (let k = 0; k < 10; k++) m.box("rung" + k, "steel", 0, -1.68, 0.4 + k * 0.32, 0.4, 0.03, 0.03, { b: 0.005 }); } };
  CATALOG.container = { label: "Shipping container", short: "Container", site: true, def: { color: "#2e5e86" }, colors: true,
    build(m, it) { const col = colMat(it.props.color); m.box("box", col, 0, 0, 1.295, 6.06, 2.44, 2.59, { b: 0.02 });
      for (let k = 0; k < 22; k++) for (const sy of [-1, 1]) m.box(`rib${k}${sy}`, col, -2.85 + k * 0.272, sy * 1.235, 1.295, 0.1, 0.03, 2.35, { b: 0.008 });
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const z of [0.06, 2.53]) m.box(`corner${sx}${sy}${z}`, "steel_dark", sx * 2.98, sy * 1.17, z, 0.17, 0.15, 0.12, { b: 0.01 });
      for (const sy of [-0.45, 0.45]) m.box("bar" + sy, "steel", 3.04, sy, 1.3, 0.03, 0.03, 2.3, { b: 0.008 }); } };
  CATALOG.fuel_tank = { label: "Fuel tank", short: "Fuel tank", site: true, def: {},
    build(m) { m.box("bund", "concrete", 0, 0, 0.3, 7.6, 3.4, 0.6, { b: 0.03 }); for (const sx of [-1.8, 1.8]) m.box("saddle" + sx, "concrete", sx, 0, 0.8, 0.4, 2.0, 0.6, { b: 0.02 });
      m.cyl("tank", "tank_white", 0, 0, 2.15, 1.2, 6.2, { rx: 90, dr: 90, seg: 28 }); m.cyl("manway", "metal", 1.5, 0, 3.4, 0.3, 0.2, { seg: 16 });
      m.box("hazard", "yellow", 0, -1.2, 2.2, 1.0, 0.01, 0.4, { b: 0 }); m.box("pipe", "steel", -3.3, 0, 1.0, 0.1, 0.1, 1.6, { b: 0.02 }); } };
  CATALOG.solar_array = { label: "Solar array", short: "Solar", site: true, def: { rows: 2, cols: 8 }, dims: [["rows", "Rows", 1, 20], ["cols", "Panels per row", 1, 60]],
    build(m, it) { const R = Math.round(it.props.rows), C = Math.round(it.props.cols), pw = 1.05, ph = 1.75, tilt = 25, gap = 4;
      for (let r = 0; r < R; r++) { const y = (r - (R - 1) / 2) * gap, W = C * pw;
        for (let c = 0; c < C; c++) m.up(`pv${r}_${c}`, texMat("solar"), -W / 2 + (c + 0.5) * pw, y, 1.0, pw - 0.03, ph, { tilt });
        m.beam("rail" + r, "steel", [-W / 2, y, 0.95], [W / 2, y, 0.95], 0.06);
        for (let k = 0; k <= Math.ceil(C / 3); k++) { const x = -W / 2 + Math.min(W, k * 3 * pw); m.beam(`legF${r}_${k}`, "steel", [x, y - 0.6, 0], [x, y - 0.6, 0.62], 0.06); m.beam(`legB${r}_${k}`, "steel", [x, y + 0.6, 0], [x, y + 0.6, 1.36], 0.06); } } } };
  CATALOG.pallet_rack = { label: "Pallet racking", short: "Racking", def: { bays: 3, levels: 4 }, dims: [["bays", "Bays", 1, 20], ["levels", "Levels", 2, 8]],
    build(m, it) { const B = Math.round(it.props.bays), Lv = Math.round(it.props.levels), bw = 2.7, H = Lv * 1.5 + 0.3, W = B * bw;
      for (let k = 0; k <= B; k++) for (const sy of [-0.5, 0.5]) m.box(`up${k}${sy}`, "rack_blue", -W / 2 + k * bw, sy, H / 2, 0.08, 0.08, H, { b: 0.008 });
      for (let j = 0; j < Lv; j++) { const z = 0.15 + j * 1.5;
        if (j) for (const sy of [-0.5, 0.5]) m.box(`beam${j}${sy}`, "rack_orange", 0, sy, z, W, 0.05, 0.12, { b: 0.008 });
        for (let k = 0; k < B; k++) for (const px of [-0.6, 0.6]) { const x = -W / 2 + (k + 0.5) * bw + px, h = hashOf(it.id + j + k + px);
          m.box(`pal${j}${k}${px}`, "pallet", x, 0, z + 0.13, 1.1, 1.0, 0.14, { b: 0.006 }); if ((h % 5) !== 0) m.box(`load${j}${k}${px}`, "carton", x, 0, z + 0.2 + 0.5, 1.0, 0.95, 0.9 + (h % 3) * 0.1 - 0.1, { b: 0.01 }); } } } };

  // ---------------------------------------------------------------- large structures
  CATALOG.lattice_tower = { label: "Lattice tower", short: "Lattice tower", site: true, def: { h: 30 }, dims: [["h", "Height m", 6, 150]],
    build(m, it) { const H = it.props.h, b0 = Math.max(1.5, H * 0.1), b1 = Math.max(0.5, H * 0.02), S = Math.max(3, Math.round(H / 4)), hb = z => b0 + (b1 - b0) * z / H;
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { m.beam(`leg${sx}${sy}`, "metal", [sx * b0, sy * b0, 0], [sx * b1, sy * b1, H], 0.14); m.box(`foot${sx}${sy}`, "concrete", sx * b0, sy * b0, 0.2, 0.8, 0.8, 0.4, { b: 0.02 }); }
      const C = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      for (let k = 0; k < S; k++) { const z0 = H * k / S, z1 = H * (k + 1) / S, h0 = hb(z0), h1 = hb(z1);
        for (let e = 0; e < 4; e++) { const [ax, ay] = C[e], [bx, by] = C[(e + 1) % 4];
          m.beam(`girt${k}_${e}`, "metal", [ax * h1, ay * h1, z1], [bx * h1, by * h1, z1], 0.07);
          m.beam(`bra${k}_${e}`, "metal", [ax * h0, ay * h0, z0], [bx * h1, by * h1, z1], 0.05); m.beam(`brb${k}_${e}`, "metal", [bx * h0, by * h0, z0], [ax * h1, ay * h1, z1], 0.05); } }
      m.box("platform", "steel_dark", 0, 0, H + 0.05, b1 * 2 + 0.8, b1 * 2 + 0.8, 0.1, { b: 0.01 });
      for (const [x, y] of [[-b1, 0], [b1, 0], [0, b1]]) m.box("panel" + x + y, "tank_white", x * 1.2, y * 1.2, H - 1.2, 0.3, 0.12, 1.4, { dr: x ? 90 : 0, b: 0.03 });
      m.cyl("whip", "steel", 0, 0, H + 2, 0.04, 4, { seg: 8 }); m.sph("beacon", "red_light", 0, 0, H + 4.05, 0.12); } };
  CATALOG.mast = { label: "Guyed mast", short: "Mast", site: true, def: { h: 40 }, dims: [["h", "Height m", 8, 200]],
    build(m, it) { const H = it.props.h, n = 7; for (let k = 0; k < n; k++) m.cyl("seg" + k, k % 2 ? "white" : "tower_red", 0, 0, (k + 0.5) * H / n, 0.25, H / n, { seg: 14 });
      m.box("base", "concrete", 0, 0, 0.25, 1.4, 1.4, 0.5, { b: 0.02 }); m.sph("beacon", "red_light", 0, 0, H + 0.15, 0.18);
      for (let a = 0; a < 3; a++) { const ang = (a * 120 + 30) * D2R, R = H * 0.5, ax = Math.cos(ang) * R, ay = Math.sin(ang) * R;
        m.box("anchor" + a, "concrete", ax, ay, 0.2, 1, 1, 0.4, { b: 0.02 }); for (const f of [0.35, 0.65, 0.92]) m.beam(`guy${a}_${f}`, "steel", [ax, ay, 0.4], [0, 0, H * f], 0.025, { b: 0 }); } } };
  CATALOG.dish = { label: "Satellite dish", short: "Dish", site: true, def: { d: 4.8 }, dims: [["d", "Diameter m", 1, 30]],
    build(m, it) { const R = it.props.d / 2, el = 35, th = (90 - el) * D2R, cz = R * 0.55 + 1.2, depth = R * 0.25, rings = 8, seg = 28, v = [];
      const P = (rr, k) => { const a = k / seg * 2 * Math.PI, x = rr * Math.cos(a), y = rr * Math.sin(a), z = depth * (rr / R) ** 2;   // dish axis +Z, then tilt about X
        return [x, y * Math.cos(th) - z * Math.sin(th), cz + y * Math.sin(th) + z * Math.cos(th)]; };
      for (let i = 0; i < rings; i++) for (let k = 0; k < seg; k++) { const r0 = R * i / rings, r1 = R * (i + 1) / rings, a = P(r0, k), b = P(r1, k), c = P(r1, k + 1), d = P(r0, k + 1); v.push(...a, ...b, ...c, ...a, ...c, ...d); }
      m.tris("dish", "tank_white", v, true);
      m.cyl("pedestal", "concrete", 0, 0, 0.6, 0.5, 1.2, { seg: 20 }); m.box("yoke", "metal", 0, 0.2, cz - 0.4, 0.6, 0.8, 1.2, { b: 0.04 });
      const ax = [0, -Math.sin(th), Math.cos(th)], f = R * 0.9; m.beam("feed", "metal", [0, 0, cz], [ax[0] * f, ax[1] * f, cz + ax[2] * f], 0.08);
      for (const sx of [-1, 1]) m.beam("strut" + sx, "metal", [sx * R * 0.9, -0.2, cz - 0.05], [0, ax[1] * f, cz + ax[2] * f], 0.04);
      m.box("lnb", "tank_white", 0, ax[1] * f, cz + ax[2] * f, 0.25, 0.3, 0.25, { b: 0.04 }); } };
  CATALOG.water_tower = { label: "Water tower", short: "Water tower", site: true, def: { h: 14 }, dims: [["h", "Leg height m", 5, 40]],
    build(m, it) { const H = it.props.h, r = 3;
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { m.beam(`leg${sx}${sy}`, "metal", [sx * 2.6, sy * 2.6, 0], [sx * 1.8, sy * 1.8, H], 0.2); m.box(`foot${sx}${sy}`, "concrete", sx * 2.6, sy * 2.6, 0.2, 0.8, 0.8, 0.4, { b: 0.02 }); }
      for (let k = 1; k < 4; k++) { const z = H * k / 4, h = 2.6 - 0.8 * k / 4; for (const [a, b] of [[[-h, -h], [h, -h]], [[h, -h], [h, h]], [[h, h], [-h, h]], [[-h, h], [-h, -h]]]) m.beam(`ring${k}${a}${b}`, "metal", [...a, z], [...b, z], 0.1); }
      m.cyl("balcony", "steel_dark", 0, 0, H + 0.05, r + 0.5, 0.1, { seg: 36 }); m.cyl("tank", "tank_white", 0, 0, H + 2.2, r, 4.2, { seg: 36 }); m.cone("roof", "tank_white", 0, 0, H + 4.3, r + 0.1, 0.2, 1.4, 36);
      m.cyl("riser", "metal", 0, 0, H / 2, 0.35, H, { seg: 16 }); } };
  CATALOG.wind_turbine = { label: "Wind turbine", short: "Wind turbine", site: true, def: { h: 60 }, dims: [["h", "Hub height m", 15, 150]],
    build(m, it) { const H = it.props.h, L = H * 0.62, hz = H + 1.4, sp = (hashOf(it.id) % 120);
      m.cyl("found", "concrete", 0, 0, 0.3, H * 0.06 + 1, 0.6, { seg: 24 }); m.cone("tower", "tank_white", 0, 0, 0.6, H * 0.035 + 0.6, H * 0.02 + 0.4, H, 24);
      m.box("nacelle", "tank_white", 0, 1.2, hz, 2.6, 7, 2.8, { b: 0.4 }); m.sph("hub", "tank_white", 0, -2.6, hz, 1.3, { sz: 1 });
      for (let k = 0; k < 3; k++) { const a = (90 + k * 120 + sp) * D2R; m.beam("blade" + k, "tank_white", [Math.cos(a) * 1.2, -2.7, hz + Math.sin(a) * 1.2], [Math.cos(a) * L, -2.7, hz + Math.sin(a) * L], 0.35, { t2: 1.6, b: 0.15 }); } } };
  CATALOG.silo = { label: "Silo", short: "Silo", site: true, def: { h: 14 }, dims: [["h", "Height m", 4, 50]],
    build(m, it) { const H = it.props.h, r = 3; m.cyl("pad", "concrete", 0, 0, 0.15, r + 0.4, 0.3, { seg: 36 }); m.cyl("body", "metal", 0, 0, H / 2 + 0.3, r, H, { seg: 36 });
      for (let k = 1; k < 6; k++) m.cyl("band" + k, "steel_dark", 0, 0, 0.3 + H * k / 6, r + 0.02, 0.08, { seg: 36 }); m.cone("roof", "metal", 0, 0, H + 0.3, r + 0.15, 0.3, r * 0.55, 36);
      for (const sx of [-0.22, 0.22]) m.beam("ladder" + sx, "steel", [sx, -r - 0.08, 0.3], [sx, -r - 0.08, H + 0.3], 0.04); for (let k = 0; k < Math.floor(H / 0.35); k++) m.box("rung" + k, "steel", 0, -r - 0.08, 0.5 + k * 0.35, 0.44, 0.03, 0.03, { b: 0.005 }); } };
  CATALOG.hangar = { label: "Hangar", short: "Hangar", site: true, def: { r: 12, len: 32 }, dims: [["r", "Span / 2 m", 5, 40], ["len", "Length m", 8, 120]],
    build(m, it) { const R = it.props.r, L = it.props.len, n = 24, v = [], arc = k => [Math.cos(Math.PI * k / n) * R, Math.sin(Math.PI * k / n) * R];
      for (let k = 0; k < n; k++) { const [x0, z0] = arc(k), [x1, z1] = arc(k + 1); v.push(x0, -L / 2, z0, x0, L / 2, z0, x1, L / 2, z1, x0, -L / 2, z0, x1, L / 2, z1, x1, -L / 2, z1); }
      m.tris("vault", "metal", v, true);
      const ends = []; for (const y of [-L / 2, L / 2]) for (let k = 0; k < n; k++) { const [x0, z0] = arc(k), [x1, z1] = arc(k + 1); ends.push(0, y, 0, x0, y, z0, x1, y, z1); } m.tris("ends", "fin_metal_clad", ends, true);
      for (let k = 0; k <= Math.floor(L / 4); k++) { const y = -L / 2 + k * L / Math.floor(L / 4), rv = []; for (let j = 0; j < n; j++) { const [x0, z0] = arc(j), [x1, z1] = arc(j + 1), f = (R + 0.08) / R;
        rv.push(x0 * f, y - 0.12, z0 * f, x0 * f, y + 0.12, z0 * f, x1 * f, y + 0.12, z1 * f, x0 * f, y - 0.12, z0 * f, x1 * f, y + 0.12, z1 * f, x1 * f, y - 0.12, z1 * f); } m.tris("rib" + k, "steel_dark", rv, true); }
      const dh = R * 0.62, dw = 2 * Math.sqrt(R * R - dh * dh) - 0.6; m.face("doors", "steel_dark", 0, -L / 2 - 0.02, dh / 2, dw, dh);
      for (let k = 1; k < 6; k++) m.box("seam" + k, "black", -dw / 2 + k * dw / 6, -L / 2 - 0.04, dh / 2, 0.06, 0.02, dh, { b: 0 });
      m.up("apron", "concrete", 0, -L / 2 - 6, 0.015, 2 * R, 12); } };
  CATALOG.shed = { label: "Warehouse shed", short: "Shed", site: true, def: { w: 12, d: 8, h: 4.5 }, dims: [["w", "Width m", 3, 80], ["d", "Depth m", 3, 60], ["h", "Eaves height m", 2.2, 15]],
    build(m, it) { const { w, d, h } = it.props, p = 12, tp = Math.tan(p * D2R), rh = d / 2 * tp;
      m.box("walls", "fin_metal_clad", 0, 0, h / 2, w, d, h, { b: 0 }); m.box("plinth", "concrete", 0, 0, 0.15, w + 0.1, d + 0.1, 0.3, { b: 0.01 });
      for (const s of [-1, 1]) m.box("roof" + s, "fin_metal_roof", 0, s * d / 4, h + rh / 2 + 0.05, w + 0.5, (d / 2 + 0.4) / Math.cos(p * D2R), 0.1, { rx: -s * p, b: 0 });
      const v = []; for (const x of [-w / 2, w / 2]) v.push(x, -d / 2, h, x, d / 2, h, x, 0, h + rh); m.tris("gables", "fin_metal_clad", v, true);
      m.face("door", "cab_grey", 0, -d / 2 - 0.02, Math.min(h - 0.4, 4) / 2, Math.min(w * 0.4, 5), Math.min(h - 0.4, 4)); m.box("doorbox", "steel_dark", 0, -d / 2 - 0.2, Math.min(h - 0.4, 4) + 0.2, Math.min(w * 0.4, 5) + 0.3, 0.4, 0.4, { b: 0.02 }); } };

  // categories for the Add panel
  const CATS = [
    ["Structure", ["stairs", "door", "door2", "archway", "window", "garage", "partition", "column", "dais", "wall_art", "mirror"]],
    ["Living", ["sofa", "armchair", "coffee_table", "tv_unit", "rug", "floor_lamp", "bookshelf", "plant", "dining_table"]],
    ["Bed & bath", ["bed_double", "bed_single", "wardrobe", "bathtub", "shower", "toilet", "basin"]],
    ["Kitchen", ["kitchen", "fridge", "dining_table"]],
    ["Office", ["office_desk", "meeting_table", "reception", "lockers", "printer", "cabinet", "whiteboard", "chair", "stool"]],
    ["Ops & security", ["console", "command", "table", "videowall", "wallmap", "stand", "clock", "sign", "rack", "flag"]],
    ["Site", ["tree", "conifer", "bush", "hedge", "pond", "car", "truck", "parking", "road", "path", "fence", "pwall", "street_light", "bench", "bin", "bollard", "barrier", "guard_booth", "utility_box", "helipad", "flagpole"]],
    ["Infrastructure", ["generator", "water_tank", "container", "fuel_tank", "solar_array", "pallet_rack", "bridge"]],
    ["Large structures", ["lattice_tower", "mast", "dish", "water_tower", "wind_turbine", "silo", "hangar", "shed"]]
  ];

  // surfaces that wall items can hang on: both faces of interior / boundary walls, at that wall's level
  function wallFaces(lv) {
    const out = [];
    for (const w of state.items) {
      if (!HOSTS.includes(w.type)) continue;
      if (lv !== undefined && (w.b || null) + ":" + (w.b ? w.f || 0 : 0) !== lv) continue;
      const r = w.rot * D2R, ux = Math.cos(r), uy = Math.sin(r), vx = -uy, vy = ux, L = w.props.len, T = w.props.thick || 0.12;
      for (const side of [1, -1]) {
        const nx = vx * side, ny = vy * side;
        out.push({ host: w.id, side, L, ux, uy, nx, ny, b: w.b || null, f: w.f || 0, a: [w.x - ux * L / 2 + nx * T / 2, w.y - uy * L / 2 + ny * T / 2], rz: Math.atan2(nx, -ny) / D2R });
      }
    }
    return out;
  }
  const levelKey = it => (it.b || null) + ":" + (it.b ? it.f || 0 : 0);
  function putOnSurface(it, sf, t) {
    it.x = sf.a[0] + sf.ux * t; it.y = sf.a[1] + sf.uy * t; it.rot = sf.rz; it.t = t; it.b = sf.b || null; it.f = sf.f || 0;
    if (sf.host) { it.host = sf.host; it.side = sf.side; it.seg = null; } else { it.host = null; it.side = null; it.seg = sf.i; }
  }
  function syncHosted(w) {   // keep doors / windows on a wall when the wall moves, turns or changes length
    const faces = wallFaces().filter(f => f.host === w.id);
    for (const it of state.items) if (it.host === w.id) {
      const f = faces.find(f => f.side === it.side) || faces[0]; if (!f) continue;
      const hh = Math.min(halfOf(it), f.L / 2); putOnSurface(it, f, clamp(it.t, hh, f.L - hh));
    }
  }

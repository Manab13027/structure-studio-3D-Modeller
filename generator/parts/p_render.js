  // ================================================================ batching (world-space vertices per material; tiled finishes get metric UVs)
  function batch(prims) {
    const batches = {}, boxes = {};
    const B = m => batches[m] || (batches[m] = { P: [], N: [], U: [] });
    for (const p of prims) {
      if (p.t === "mesh") { meshInto(p, batches, boxes); continue; }
      const mat = material(p.m), tile = mat.tile || 0;
      const bb = p.item ? (boxes[p.item] || (boxes[p.item] = { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] })) : null;
      const grow = v => { if (bb) for (let k = 0; k < 3; k++) { if (v[k] < bb.min[k]) bb.min[k] = v[k]; if (v[k] > bb.max[k]) bb.max[k] = v[k]; } };
      if (p.t === "tris") {
        const b = B(p.m);
        for (let i = 0; i + 8 < p.v.length; i += 9) {
          const A = p.v.slice(i, i + 3), Bq = p.v.slice(i + 3, i + 6), C = p.v.slice(i + 6, i + 9);
          const u = [Bq[0] - A[0], Bq[1] - A[1], Bq[2] - A[2]], v = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
          let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; const l = Math.hypot(...n) || 1; n = n.map(c => c / l);
          for (let k = 0; k < 3; k++) {
            const P = [p.v[i + k * 3], p.v[i + k * 3 + 1], p.v[i + k * 3 + 2]]; b.P.push(...P); if (p.nn) b.N.push(p.nn[i + k * 3], p.nn[i + k * 3 + 1], p.nn[i + k * 3 + 2]); else b.N.push(...n); grow(P);
            const vi = i / 3 + k;
            if (p.uv) b.U.push(p.uv[vi * 2], p.uv[vi * 2 + 1]);
            else if (tile) { if (Math.abs(n[2]) > 0.7) b.U.push(P[0] / tile, P[1] / tile); else { const h = Math.hypot(n[0], n[1]) || 1; b.U.push((P[0] * -n[1] / h + P[1] * n[0] / h) / tile, P[2] / tile); } }
            else b.U.push(0, 0);
          }
        }
        continue;
      }
      let g, m, R, uvs = null;
      if (p.t === "box") { g = rboxGeo(p.s[0], p.s[1], p.s[2], p.b ?? 0); R = M.mul(M.rz((p.rz || 0) * D2R), M.mul(M.ry((p.ry || 0) * D2R), M.rx((p.rx || 0) * D2R))); m = M.mul(M.trans(...p.p), R); if (tile) uvs = g.UM.map(x => x / tile); }
      else if (p.t === "cyl") { g = cylGeo(p.seg || 20); R = M.mul(M.rz((p.rz || 0) * D2R), M.rx((p.rx || 0) * D2R)); m = M.mul(M.trans(...p.p), M.mul(R, M.scale(p.r * 2, p.r * 2, p.h))); }
      else if (p.t === "sph") { g = sphGeo(); R = null; m = M.mul(M.trans(...p.p), M.scale(p.r, p.r, p.r * (p.sz || 1))); }
      else { const uv = p.uv || (tile ? [p.s[0] / tile, p.s[1] / tile] : [1, 1]); g = planeGeo(uv[0], uv[1]); R = M.mul(M.rz(p.r[2] * D2R), M.mul(M.ry(p.r[1] * D2R), M.rx(p.r[0] * D2R))); m = M.mul(M.trans(...p.p), M.mul(R, M.scale(p.s[0], p.s[1], 1))); }
      const b = B(p.m), sphZ = p.t === "sph" ? (p.sz || 1) : 1;
      for (let i = 0; i < g.P.length; i += 3) {
        const v = M.apply(m, [g.P[i], g.P[i + 1], g.P[i + 2]], 1); b.P.push(v[0], v[1], v[2]); grow(v);
        let n = R ? M.apply(R, [g.N[i], g.N[i + 1], g.N[i + 2]], 0) : [g.N[i], g.N[i + 1], g.N[i + 2] / sphZ];
        if (!R) { const l = Math.hypot(...n) || 1; n = n.map(c => c / l); }
        b.N.push(n[0], n[1], n[2]);
      }
      for (const u of (uvs || g.U)) b.U.push(u);
    }
    return { batches, boxes };
  }

  // ================================================================ scene: shell groups + one GPU list per item
  const itemGPU = {}; let shellGroups = [], selGPU = [], itemBoxes = {}, itemPrims = {};
  function upload(batches) {
    const list = [];
    for (const [mname, b] of Object.entries(batches)) {
      if (!b.P.length) continue;
      const mat = material(mname);
      if (mat.tex) ensureTex(mat.tex);
      const vao = gl.createVertexArray(); gl.bindVertexArray(vao); const bufs = [];
      [[b.P, 0, 3], [b.N, 1, 3], [b.U, 2, 2]].forEach(([arr, loc, size]) => {
        const buf = gl.createBuffer(); bufs.push(buf); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      });
      list.push({ vao, bufs, count: b.P.length / 3, mat });
    }
    gl.bindVertexArray(null);
    return list;
  }
  const free = list => list.forEach(d => { gl.deleteVertexArray(d.vao); d.bufs.forEach(b => gl.deleteBuffer(b)); });

  // dais: things standing on a dais of the same level are lifted 0.2 m
  function onDais(it, daises) {
    for (const d of daises) {
      if (d === it || d.b !== it.b || (d.f || 0) !== (it.f || 0)) continue;
      const a = -d.rot * D2R, dx = it.x - d.x, dy = it.y - d.y, k = d.props.scale || [1, 1, 1];
      const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
      if (Math.abs(lx) <= d.props.w * k[0] / 2 && Math.abs(ly) <= d.props.d * k[1] / 2) return 0.2 * k[2];
    }
    return 0;
  }
  const liftOf = it => +it.props.lift || 0;
  function expandItem(it, daises) {
    const out = [], cat = CATALOG[it.type];
    const z = itemZ(it) + liftOf(it) + (isWall(it) || it.type === "dais" || it.host ? 0 : onDais(it, daises));
    try { cat.build(maker(it, out, z, labelOf(it)), it, levelRoom(it)); } catch (e) { console.warn("build", it.type, e); }
    return out;
  }
  function rebuildItem(it, daises) {
    if (itemGPU[it.id]) free(itemGPU[it.id]);
    const prims = expandItem(it, daises); itemPrims[it.id] = prims;
    const { batches, boxes } = batch(prims);
    itemGPU[it.id] = upload(batches); itemBoxes[it.id] = boxes[it.id];
  }
  function rebuildShell() {
    for (const g of shellGroups) free(g.draws);
    shellGroups = [...siteShell(), ...state.buildings.flatMap(buildingShell)];
    for (const g of shellGroups) g.draws = upload(batch(g.prims).batches);
  }
  function rebuildBuildingShell(bid) {
    const B = bldById(bid); if (!B) return rebuildShell();
    for (const g of shellGroups) if (g.b === bid) free(g.draws);
    const fresh = buildingShell(B); for (const g of fresh) g.draws = upload(batch(g.prims).batches);
    shellGroups = [...shellGroups.filter(g => g.b !== bid), ...fresh];
  }
  const lastHost = {};
  function rebuild(onlyId) {
    const daises = state.items.filter(i => i.type === "dais");
    const only = onlyId && state.items.find(i => i.id === onlyId);
    if (only && HOSTS.includes(only.type)) {
      syncHosted(only); rebuildItem(only, daises);
      for (const o of state.items) if (o.host === only.id) rebuildItem(o, daises);
    } else if (only && only.type !== "dais") {
      const prevB = lastHost["b:" + only.id];
      rebuildItem(only, daises);
      const prev = lastHost[only.id]; lastHost[only.id] = only.host || null; lastHost["b:" + only.id] = only.b || null;
      for (const hid of new Set([prev, only.host])) { const h = hid && state.items.find(i => i.id === hid); if (h) rebuildItem(h, daises); }
      if (CATALOG[only.type].opening || only.type === "stairs") for (const bid of new Set([prevB, only.b])) if (bid) rebuildBuildingShell(bid);
    } else {
      for (const id of Object.keys(itemGPU)) { free(itemGPU[id]); delete itemGPU[id]; delete itemPrims[id]; delete itemBoxes[id]; }
      rebuildShell();
      for (const w of state.items) if (HOSTS.includes(w.type)) syncHosted(w);
      for (const it of state.items) { rebuildItem(it, daises); lastHost[it.id] = it.host || null; lastHost["b:" + it.id] = it.b || null; }
    }
    for (const id of Object.keys(itemGPU)) if (!state.items.find(i => i.id === id)) { free(itemGPU[id]); delete itemGPU[id]; delete itemPrims[id]; delete itemBoxes[id]; }
    rebuildSelection(); rebuildHandles();
    shadowDirty = true; dirty = true; refreshStatus();
  }
  function rebuildSelection() {
    free(selGPU); selGPU = [];
    const sel = selected && itemBoxes[selected];
    if (!sel) return;
    const pad = 0.12, x0 = sel.min[0] - pad, x1 = sel.max[0] + pad, y0 = sel.min[1] - pad, y1 = sel.max[1] + pad, t = 0.05;
    const it = selectedItem(), z = (it ? itemZ(it) : 0) + 0.025;
    const ring = [{ p: [(x0 + x1) / 2, y0, z], s: [x1 - x0, t, 0.02] }, { p: [(x0 + x1) / 2, y1, z], s: [x1 - x0, t, 0.02] },
                  { p: [x0, (y0 + y1) / 2, z], s: [t, y1 - y0, 0.02] }, { p: [x1, (y0 + y1) / 2, z], s: [t, y1 - y0, 0.02] }];
    // raised items: a thin stem from the floor ring to the object, so its height reads clearly
    if (it && liftOf(it) > 0.02) ring.push({ p: [(x0 + x1) / 2, (y0 + y1) / 2, (z + sel.min[2]) / 2], s: [0.03, 0.03, Math.max(0.01, sel.min[2] - z)] });
    selGPU = upload(batch(ring.map(r => ({ t: "box", m: "select", p: r.p, s: r.s, rz: 0, b: 0 }))).batches);
  }

  // ================================================================ handles (corner editing) & draw preview
  let handleGPU = [], wallEditing = false, selCorner = -1, drawMode = false, drawStart = null, drawEnd = null, drawZ = 0, previewGPU = [];
  const activeBld = () => bldById(view.ab) || state.buildings[0] || null;
  function lineEnds(types) { const e = []; for (const w of state.items) if ((types || LINEAR).includes(w.type)) { const r = w.rot * D2R, dx = Math.cos(r) * w.props.len / 2, dy = Math.sin(r) * w.props.len / 2; e.push([w.x - dx, w.y - dy], [w.x + dx, w.y + dy]); } return e; }
  function nearestWall(x, y, B) {
    let best = null;
    for (const BB of B ? [B] : state.buildings) for (const sg of wallSegs(BB)) { const t = clamp((x - sg.a[0]) * sg.ux + (y - sg.a[1]) * sg.uy, 0, sg.L), qx = sg.a[0] + sg.ux * t, qy = sg.a[1] + sg.uy * t, d = Math.hypot(x - qx, y - qy);
      if (!best || d < best.d) best = { d, sg, t, qx, qy, B: BB }; }
    return best;
  }
  function snapDrawPoint(x, y, from) {
    const tol = 0.35 * Math.max(1, 1.2 / cam.zoom) * Math.max(1, viewR() / 25);
    for (const c of [...state.buildings.flatMap(B => B.pts), ...lineEnds()]) if (Math.hypot(c[0] - x, c[1] - y) < tol) return { p: c.slice(), how: "end" };
    if (from && $("angleSnap").checked) {
      const dx = x - from[0], dy = y - from[1], L = Math.hypot(dx, dy), a = Math.round(Math.atan2(dy, dx) / D2R / 15) * 15 * D2R;
      const Ls = $("snap").checked ? Math.round(L * 20) / 20 : L; let p = [from[0] + Math.cos(a) * Ls, from[1] + Math.sin(a) * Ls];
      const nw = nearestWall(p[0], p[1]); if (nw && nw.d < tol * 0.6) p = [nw.qx, nw.qy];
      return { p, how: "angle" };
    }
    const nw = nearestWall(x, y); if (nw && nw.d < tol * 0.6) return { p: [nw.qx, nw.qy], how: "wall" };
    const g = $("snap").checked ? v => Math.round(v * 4) / 4 : v => v; return { p: [g(x), g(y)], how: "grid" };
  }
  const DRAW_TYPES = [["partition", "Interior wall"], ["pwall", "Boundary / garden wall"], ["fence", "Fence"], ["hedge", "Hedge"], ["road", "Road"], ["path", "Footpath"], ["bridge", "Bridge"]];
  function rebuildPreview() {
    free(previewGPU); previewGPU = [];
    if (!drawMode) return;
    const pr = [], z = drawZ;
    const mark = p => pr.push({ t: "cyl", m: "handle", p: [p[0], p[1], z + 0.05], r: 0.14 * Math.max(1, viewR() / 25), h: 0.08, seg: 20 });
    if (drawStart) mark(drawStart);
    if (drawEnd) mark(drawEnd);
    if (drawStart && drawEnd) {
      const dx = drawEnd[0] - drawStart[0], dy = drawEnd[1] - drawStart[1], L = Math.hypot(dx, dy);
      if (L > 0.05) { const rz = Math.atan2(dy, dx) / D2R, t = $("drawType").value, d = CATALOG[t].def, H = t === "partition" ? 2.4 : t === "road" || t === "path" ? 0.04 : d.h || 1.5, w = d.w || d.thick || 0.15;
        pr.push({ t: "box", m: t === "road" || t === "path" ? "select" : "partition", p: [(drawStart[0] + drawEnd[0]) / 2, (drawStart[1] + drawEnd[1]) / 2, z + H / 2], s: [L, w, H], rz, b: 0 }); }
    }
    previewGPU = upload(batch(pr).batches); dirty = true;
  }
  function addDrawn(a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), type = $("drawType").value;
    if (L < 0.3) return false;
    const it = mk(type, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, ((Math.atan2(dy, dx) / D2R) + 360) % 360, { len: +L.toFixed(3) });
    assignLevel(it); state.items.push(it); selected = it.id; rebuild(it.id); commit(); renderInspector();
    return true;
  }
  function stopChain() { drawStart = null; drawEnd = null; $("drawLabel").hidden = true; rebuildPreview(); }
  function setDrawMode(on) {
    drawMode = on; $("drawBtn").setAttribute("aria-pressed", String(on)); $("drawHint").hidden = !on;
    if (on && wallEditing) setWallEditing(false);
    if (on) { select(null); if (cam.el < 80) animateTo(cam.az, 89); toast("Plan view: click to start drawing."); }
    stopChain(); canvas.style.cursor = on ? "crosshair" : "";
  }
  function setWallEditing(on) {
    if (on && drawMode) setDrawMode(false);
    wallEditing = on; selCorner = -1; const b = $("cornerBtn"); if (b) b.setAttribute("aria-pressed", String(on));
    if (on) { select(null); if (cam.el < 50) animateTo(cam.az, 62); toast("Drag green corners to reshape. Drag inside the building to move it."); }
    rebuildHandles(); renderBldPanel(); dirty = true;
  }
  function rebuildHandles() {
    free(handleGPU); handleGPU = [];
    const B = activeBld(); if (!wallEditing || !B) return;
    const pr = [], z = B.base + 0.06, k = Math.max(1, viewR() / 30);
    B.pts.forEach((p, i) => pr.push({ t: "cyl", m: i === selCorner ? "select" : "handle", p: [p[0], p[1], z], r: (i === selCorner ? 0.26 : 0.2) * k, h: 0.08, seg: 24 }));
    for (const sg of wallSegs(B)) pr.push({ t: "cyl", m: "led_strip", p: [(sg.a[0] + sg.b[0]) / 2 + sg.nx * 0.3 * k, (sg.a[1] + sg.b[1]) / 2 + sg.ny * 0.3 * k, z], r: 0.11 * k, h: 0.06, seg: 16 });
    handleGPU = upload(batch(pr).batches);
  }
  const allPrims = () => [...shellGroups.flatMap(g => g.prims), ...state.items.flatMap(it => itemPrims[it.id] || [])];

  // ================================================================ visibility (levels, cutaway)
  let camDir = [0, -1, 1];
  const segHidden = (nx, ny) => view.cut && nx * camDir[0] + ny * camDir[1] < -0.05;
  function itemVisible(it) {
    const B = bldOf(it);
    if (B && (it.f || 0) > showTop(B)) return false;
    if (B && isWall(it) && !it.host && it.seg != null) { const a = it.rot * D2R; if (segHidden(Math.sin(a), -Math.cos(a))) return false; }
    return true;
  }
  function groupVisible(g, forShadow) {
    if (g.kind === "site") return true;
    const B = bldById(g.b); if (!B) return false;
    if (g.kind === "roof") return !view.cut && view.upTo >= B.floors - 1;
    if (g.f > showTop(B)) return false;
    if (g.kind === "wall") return forShadow ? !view.cut : !segHidden(g.nx, g.ny);
    return true;
  }

  // ================================================================ camera + render
  const cam = { az: 45, el: 35.26, zoom: 1, ortho: true, target: [0, 0, 1.0], spin: true, R: 20 };
  let dirty = true, last = performance.now(), VP = null, eye = [0, 0, 0];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) cam.spin = false;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; dirty = true; }
  }
  const viewR = () => cam.R / cam.zoom;
  function fitSize() { return viewR(); }
  const siteR = () => Math.hypot(state.site.w, state.site.d) / 2;
  function contentBounds() {
    const mn = [1e9, 1e9, 0], mx = [-1e9, -1e9, 1];
    for (const B of state.buildings) for (const p of B.pts) { mn[0] = Math.min(mn[0], p[0]); mn[1] = Math.min(mn[1], p[1]); mx[0] = Math.max(mx[0], p[0]); mx[1] = Math.max(mx[1], p[1]); mx[2] = Math.max(mx[2], wallTopZ(B)); }
    for (const id in itemBoxes) { const b = itemBoxes[id]; if (!b) continue; for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], b.min[k]); mx[k] = Math.max(mx[k], b.max[k]); } }
    if (mn[0] > mx[0]) return { c: [0, 0, 1], r: siteR() };
    return { c: [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, Math.min(4, mx[2] * 0.3)], r: Math.max(6, Math.hypot(mx[0] - mn[0], mx[1] - mn[1]) / 2 * 1.08, mx[2] * 0.7) };
  }
  function fitView(what) {
    let c, r;
    if (what && what.pts) { const B = what; c = [B.cx, B.cy, Math.min(3, wallTopZ(B) / 2)]; r = Math.max(6, Math.hypot(B.w, B.d) / 2 * 1.15); }
    else ({ c, r } = contentBounds());
    cam.target = c; cam.R = r; cam.zoom = 1; shadowDirty = true; dirty = true;
  }
  let shKey = "";
  function renderShadow() {
    const r = Math.min(siteR() + 4, viewR() * 1.6 + 6), l = Math.hypot(...LDIR), ld = LDIR.map(v => v / l);
    const ctr = [cam.target[0], cam.target[1], 0], far = r * 3 + 120;
    const view_ = M.look(ld.map((v, i) => ctr[i] + v * (far / 2)), ctr, [0, 0, 1]);
    LMAT = M.mul(M.ortho(-r, r, -r, r, 1, far), view_);
    if (!shadowOK) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, shFbo); gl.viewport(0, 0, SHADOW, SHADOW); gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.useProgram(sprog); gl.uniformMatrix4fv(SU.L, false, new Float32Array(LMAT));
    gl.disable(gl.CULL_FACE);
    const list = [...shellGroups.filter(g => g.kind !== "site" && groupVisible(g, true)).flatMap(g => g.draws), ...state.items.filter(itemVisible).flatMap(it => itemGPU[it.id] || [])];
    gl.activeTexture(gl.TEXTURE0); gl.uniform1i(SU.S, 0);
    for (const d of list) { if (d.mat === BASE_MATS.select) continue; const t = d.mat.cut && d.mat.tex && textures[d.mat.tex];
      gl.uniform1f(SU.Cut, t ? 1 : 0); if (t) gl.bindTexture(gl.TEXTURE_2D, t.t); gl.bindVertexArray(d.vao); gl.drawArrays(gl.TRIANGLES, 0, d.count); }
    gl.enable(gl.CULL_FACE); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.useProgram(prog);
    shadowDirty = false;
  }
  function draw(list, fz) {
    gl.uniform1f(U.Fz, fz);
    for (const d of list) {
      const m = d.mat; gl.uniform3fv(U.Color, m.color); gl.uniform1f(U.Emit, m.emit || 0); gl.uniform1f(U.Metal, m.metal || 0); gl.uniform1f(U.Rough, m.rough ?? 0.6);
      const t = m.tex && textures[m.tex]; gl.uniform1f(U.Tex, t ? 1 : 0); if (t) gl.bindTexture(gl.TEXTURE_2D, t.t);
      if (m.cut && !t) continue;                                      // leaf texture still loading
      gl.uniform1f(U.Cut, m.cut ? 1 : 0); gl.uniform1f(U.Fol, m.fol ? 1 : 0); if (m.two) gl.disable(gl.CULL_FACE); else gl.enable(gl.CULL_FACE);
      gl.bindVertexArray(d.vao); gl.drawArrays(gl.TRIANGLES, 0, d.count);
    }
  }
  function render() {
    const asp = canvas.width / canvas.height, az = cam.az * D2R, el = cam.el * D2R, fit = fitSize();
    const SR = siteR() + 80, dist = SR * 1.5 + 60;
    camDir = [Math.sin(az) * Math.cos(el), -Math.cos(az) * Math.cos(el), Math.sin(el)];
    const key = [cam.target.map(v => Math.round(v / Math.max(1, fit / 4))).join(","), Math.round(Math.log2(fit) * 2), view.cut, view.upTo, Math.round(cam.az / 30)].join("|");
    if (key !== shKey) { shKey = key; shadowDirty = true; }
    if (shadowDirty) renderShadow();
    eye = cam.target.map((t, i) => t + camDir[i] * dist);
    const up = cam.el > 85 ? [Math.sin(az), Math.cos(az), 0] : [0, 0, 1];
    const view_ = M.look(eye, cam.target, up);
    const R2 = SR + Math.hypot(cam.target[0], cam.target[1]), zn = Math.max(0.5, dist - R2), zf = dist + R2;
    const proj = cam.ortho ? (asp >= 1 ? M.ortho(-fit * asp, fit * asp, -fit, fit, zn, zf) : M.ortho(-fit, fit, -fit / asp, fit / asp, zn, zf))
                           : M.persp(2 * Math.atan(fit / dist) * 1.05, asp, zn, zf);
    VP = M.mul(proj, view_);
    gl.useProgram(prog);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.05, 0.063, 0.075, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(U.VP, false, new Float32Array(VP)); gl.uniform3fv(U.Eye, eye);
    gl.uniform1f(U.RoomR, siteR() + 2);
    gl.uniformMatrix4fv(U.L, false, new Float32Array(LMAT)); gl.uniform3fv(U.Ldir, LDIR); gl.uniform1f(U.ShOn, shadowOK ? 1 : 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, shTex); gl.uniform1i(U.Sh, 1);
    gl.activeTexture(gl.TEXTURE0); gl.uniform1i(U.S, 0);
    for (const g of shellGroups) if (groupVisible(g)) { const B = bldById(g.b); draw(g.draws, g.kind === "site" || !B ? 0 : floorTop(B, g.f || 0)); }
    for (const it of state.items) if (itemVisible(it)) draw(itemGPU[it.id] || [], itemZ(it));
    draw([...selGPU, ...handleGPU, ...previewGPU], -100); gl.enable(gl.CULL_FACE);
    const b = ((360 - Math.round(cam.az)) % 360 + 360) % 360;
    $("hdg").textContent = String(b).padStart(3, "0") + "°";
    if (document.activeElement !== $("az")) $("az").value = b;
  }
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (cam.spin) { cam.az = (cam.az + dt * 12) % 360; dirty = true; }
    resize(); if (dirty) { render(); dirty = false; }
    requestAnimationFrame(frame);
  }

  // ================================================================ picking & placement
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
  function pick(rq) {
    let best = null, bt = 1e9;
    for (const it of state.items) {
      const b = itemBoxes[it.id]; if (!b || !itemVisible(it)) continue;
      let t = hitBox(rq, b); if (t === null) continue;
      const vol = (b.max[0] - b.min[0]) * (b.max[1] - b.min[1]);
      if (it.type === "dais" || it.type === "rug" || it.type === "parking" || it.type === "helipad" || it.type === "road" || it.type === "path") t += 0.5;   // prefer what stands on it
      if (vol > 400) t += 2;                                                                // big structures lose to small things in front of them
      if (t < bt) { bt = t; best = it; }
    }
    return best;
  }
  function floorPoint(rq, z = 0) { if (Math.abs(rq.d[2]) < 1e-6) return null; const t = (z - rq.o[2]) / rq.d[2]; return [rq.o[0] + rq.d[0] * t, rq.o[1] + rq.d[1] * t]; }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // which level a free-standing object belongs to: the building it stands in (active floor), or the site
  function assignLevel(it) {
    const c = CATALOG[it.type];
    if (c.site) { it.b = null; it.f = 0; return; }
    const B = buildingAt(it.x, it.y);
    if (B) { if (it.b !== B.id) { it.b = B.id; it.f = activeFloor(B); } else it.f = Math.min(it.f || 0, B.floors - 1); }
    else { it.b = null; it.f = 0; }
  }
  // free placement: objects go exactly where they are dropped (they may overlap); wall items stick to the nearest wall
  function place(it, x, y) {
    const snapOn = $("snap").checked, snap = snapOn ? v => Math.round(v * 4) / 4 : v => v;
    if (isWall(it)) {
      let best = null; const surfaces = [];
      for (const B of state.buildings) { const f = it.b === B.id ? Math.min(it.f || 0, B.floors - 1) : activeFloor(B); for (const sg of wallSegs(B)) surfaces.push({ ...sg, host: null, b: B.id, f }); }
      surfaces.push(...wallFaces().filter(fc => { if (!fc.b) return true; const B = bldById(fc.b); return B && fc.f === (it.b === B.id ? Math.min(it.f || 0, B.floors - 1) : activeFloor(B)); }));
      for (const sg of surfaces) {
        const hh = Math.min(halfOf(it), sg.L / 2);
        const t = clamp((x - sg.a[0]) * sg.ux + (y - sg.a[1]) * sg.uy, hh, sg.L - hh);
        const qx = sg.a[0] + sg.ux * t, qy = sg.a[1] + sg.uy * t, d = Math.hypot(x - qx, y - qy) + (sg.b === view.ab || sg.host ? 0 : 0.01);
        if (!best || d < best.d - 1e-6) best = { d, sg, t, hh };
      }
      if (!best) { it.x = x; it.y = y; it.b = null; it.f = 0; it.seg = null; it.host = null; return; }
      if (snapOn) best.t = clamp(Math.round(best.t * 4) / 4, best.hh, best.sg.L - best.hh);
      putOnSurface(it, best.sg, best.t);
      return;
    }
    const S = state.site;
    it.x = clamp(snap(x), -S.w / 2, S.w / 2); it.y = clamp(snap(y), -S.d / 2, S.d / 2);
    assignLevel(it);
  }
  // height of the highest thing directly under an object (to rest it on top)
  function supportHeight(it) {
    const me = itemBoxes[it.id]; if (!me) return 0;
    const base = itemZ(it) + (it.type !== "dais" ? onDais(it, state.items.filter(i => i.type === "dais")) : 0); let top = base;
    for (const o of state.items) {
      if (o === it || (o.b || null) !== (it.b || null) || (o.f || 0) !== (it.f || 0) || isWall(o) || LINEAR.includes(o.type) || o.type === "dais") continue;
      const b = itemBoxes[o.id]; if (!b || !itemVisible(o)) continue;
      const ox = Math.min(me.max[0], b.max[0]) - Math.max(me.min[0], b.min[0]), oy = Math.min(me.max[1], b.max[1]) - Math.max(me.min[1], b.min[1]);
      if (ox > 0.02 && oy > 0.02) top = Math.max(top, b.max[2]);
    }
    return top - base;
  }
  function setLift(it, v) { it.props.lift = Math.max(0, Math.min(60, +v || 0)); if (it.props.lift < 0.001) delete it.props.lift; rebuild(it.type === "dais" ? null : it.id); }

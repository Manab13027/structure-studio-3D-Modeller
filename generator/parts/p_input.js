  // ================================================================ input
  let editing = false, drag = null, cornerDrag = null, bldDrag = null;
  const ptrs = new Map(); let pinch0 = 0, zoom0 = 1;
  const groundZ = () => { const B = activeBld(); return 0; };
  function buildingUnder(rq) {   // building whose footprint the ray hits at its shown top floor
    for (let i = state.buildings.length - 1; i >= 0; i--) { const B = state.buildings[i], fp = floorPoint(rq, floorTop(B, showTop(B))); if (fp && insidePoly(fp[0], fp[1], B.pts)) return B; }
    return null;
  }
  canvas.addEventListener("pointerdown", e => {
    canvas.setPointerCapture(e.pointerId); canvas.focus({ preventScroll: true });
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, pan: e.shiftKey || e.button === 2 || e.button === 1 });
    setSpin(false);
    if (ptrs.size === 2) { drag = null; const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = cam.zoom; return; }
    if (!VP) return;
    const rq = ray(e.clientX, e.clientY);
    if (editing && drawMode) {
      if (e.button === 2) { stopChain(); return; }
      if (e.button !== 0) return;
      if (e.detail >= 2) { stopChain(); return; }
      if (!drawStart) { const g = floorPoint(rq, 0), B = g && $("drawType").value === "partition" ? buildingAt(g[0], g[1]) : null; drawZ = B ? floorTop(B, activeFloor(B)) : 0; }
      const fp = floorPoint(rq, drawZ); if (!fp) return;
      const sp = snapDrawPoint(fp[0], fp[1], drawStart).p;
      if (!drawStart) { drawStart = sp; drawEnd = null; }
      else if (addDrawn(drawStart, sp)) { drawStart = sp; drawEnd = null; }
      rebuildPreview(); return;
    }
    const B = activeBld();
    if (editing && wallEditing && B && !e.shiftKey && e.button === 0) {
      const fp = floorPoint(rq, B.base);
      if (fp) {
        const k = Math.max(1, viewR() / 30), near = (x, y, r) => Math.hypot(fp[0] - x, fp[1] - y) < r * k * Math.max(1, 1.2 / cam.zoom);
        let ci = B.pts.findIndex(p => near(p[0], p[1], 0.45));
        if (ci < 0) { const sg = wallSegs(B).find(sg => near((sg.a[0] + sg.b[0]) / 2 + sg.nx * 0.3 * k, (sg.a[1] + sg.b[1]) / 2 + sg.ny * 0.3 * k, 0.35));
          if (sg) { ci = splitWall(B, sg.i); toast("Corner added. Drag it to angle the walls."); } }
        if (ci >= 0) { selCorner = ci; cornerDrag = { B, i: ci, moved: false, keep: wallItemParams(B) }; canvas.classList.add("dragging"); rebuildHandles(); renderBldPanel(); dirty = true; return; }
        if (insidePoly(fp[0], fp[1], B.pts)) { bldDrag = { B, sx: fp[0], sy: fp[1], pts: B.pts.map(p => p.slice()), items: state.items.filter(i => i.b === B.id).map(i => [i, i.x, i.y]), moved: false }; canvas.classList.add("dragging"); return; }
      }
    }
    if (editing && !e.shiftKey && e.button === 0) {
      const it = pick(rq);
      if (it) {
        select(it.id);
        const z = itemZ(it) + (isWall(it) ? 0 : liftOf(it)), fp = floorPoint(rq, z);
        drag = { it, sx: fp ? fp[0] : it.x, sy: fp ? fp[1] : it.y, ox: it.x, oy: it.y, z, moved: false, vert: e.altKey && !isWall(it), lift0: liftOf(it), py: e.clientY };
        canvas.classList.add("dragging");
        if (drag.vert) toast("Moving up / down");
      }
    }
  });
  canvas.addEventListener("pointermove", e => {
    if (editing && drawMode && drawStart && VP && ptrs.size < 2) {
      const fp = floorPoint(ray(e.clientX, e.clientY), drawZ);
      if (fp) {
        drawEnd = snapDrawPoint(fp[0], fp[1], drawStart).p; rebuildPreview();
        const dx = drawEnd[0] - drawStart[0], dy = drawEnd[1] - drawStart[1], lab = $("drawLabel"), r = canvas.getBoundingClientRect();
        lab.innerHTML = `<b>${Math.hypot(dx, dy).toFixed(2)} m</b>${String(Math.round(((Math.atan2(dy, dx) / D2R) % 360 + 360) % 360)).padStart(3, "0")}° angle`;
        lab.style.left = (e.clientX - r.left + 18) + "px"; lab.style.top = (e.clientY - r.top + 18) + "px"; lab.hidden = false;
      }
      return;
    }
    const p = ptrs.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch0) cam.zoom = clamp(zoom0 * d / pinch0, 0.15, 12); dirty = true; return; }
    if (cornerDrag) {
      const B = cornerDrag.B, fp = floorPoint(ray(e.clientX, e.clientY), B.base); if (!fp) return;
      const snapv = $("snap").checked ? v => Math.round(v * 4) / 4 : v => v, prev = B.pts[cornerDrag.i].slice();
      B.pts[cornerDrag.i] = [snapv(fp[0]), snapv(fp[1])];
      if (segsCross(B.pts) || polyArea(B.pts) < 2) { B.pts[cornerDrag.i] = prev; return; }
      cornerDrag.moved = true; buildingChanged(B, cornerDrag.keep); return;
    }
    if (bldDrag) {
      const B = bldDrag.B, fp = floorPoint(ray(e.clientX, e.clientY), B.base); if (!fp) return;
      const snapv = $("snap").checked ? v => Math.round(v * 4) / 4 : v => v, mx = snapv(fp[0] - bldDrag.sx), my = snapv(fp[1] - bldDrag.sy);
      B.pts = bldDrag.pts.map(([x, y]) => [x + mx, y + my]); for (const [it, x, y] of bldDrag.items) { it.x = x + mx; it.y = y + my; }
      syncBld(B); bldDrag.moved = true; rebuild(); return;
    }
    if (drag) {
      if (drag.vert) { const s = 2 * fitSize() / canvas.clientHeight; drag.it.props.lift = Math.max(0, drag.lift0 + (drag.py - e.clientY) * s); drag.moved = true; rebuild(drag.it.type === "dais" ? null : drag.it.id); showLift(drag.it, e); return; }
      const fp = floorPoint(ray(e.clientX, e.clientY), drag.z); if (!fp) return;
      const wasB = drag.it.b;
      place(drag.it, drag.ox + fp[0] - drag.sx, drag.oy + fp[1] - drag.sy); drag.moved = true;
      if (drag.it.b !== wasB && !isWall(drag.it)) { drag.z = itemZ(drag.it) + liftOf(drag.it); }
      rebuild(drag.it.type === "dais" || (CATALOG[drag.it.type].opening && false) ? null : drag.it.id); return;
    }
    if (p.pan) {
      const s = 2 * fitSize() / canvas.clientHeight, az = cam.az * D2R, right = [Math.cos(az), Math.sin(az)], fwd = [-Math.sin(az), Math.cos(az)];
      cam.target[0] += (-right[0] * dx + fwd[0] * dy) * s; cam.target[1] += (-right[1] * dx + fwd[1] * dy) * s;
    } else { cam.az = (cam.az - dx * 0.4 + 360) % 360; cam.el = clamp(cam.el + dy * 0.3, 2, 89); }
    dirty = true;
  });
  function showLift(it, e) { const lab = $("drawLabel"), r = canvas.getBoundingClientRect(); lab.innerHTML = `<b>${liftOf(it).toFixed(2)} m</b>above floor`; lab.style.left = (e.clientX - r.left + 18) + "px"; lab.style.top = (e.clientY - r.top + 18) + "px"; lab.hidden = false; }
  const up = e => {
    const p = ptrs.get(e.pointerId); ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch0 = 0;
    canvas.classList.remove("dragging");
    if (cornerDrag) { if (cornerDrag.moved) commit(); cornerDrag = null; renderBldPanel(); return; }
    if (bldDrag) { if (bldDrag.moved) { commit(); renderBldPanel(); } bldDrag = null; return; }
    if (drag) { if (drag.vert) $("drawLabel").hidden = true; if (drag.moved) { commit(); renderInspector(); updateAddWhere(); } drag = null; return; }
    // a click on empty space: choose the building under the pointer, or clear the selection
    if (editing && p && Math.hypot(e.clientX - p.x0, e.clientY - p.y0) < 4 && e.type === "pointerup" && VP && !drawMode) {
      const rq = ray(e.clientX, e.clientY);
      if (!pick(rq)) { select(null); const B = buildingUnder(rq); if (B && B.id !== view.ab) setActiveBuilding(B.id); }
    }
  };
  canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("contextmenu", e => e.preventDefault());
  canvas.addEventListener("wheel", e => { e.preventDefault(); cam.zoom = clamp(cam.zoom * Math.exp(-e.deltaY * 0.0015), 0.15, 12); dirty = true; }, { passive: false });
  canvas.addEventListener("keydown", e => {
    const k = e.key, it = selectedItem(), B = activeBld();
    if (editing && wallEditing && selCorner >= 0 && B && (k === "Delete" || k === "Backspace")) { deleteCorner(B, selCorner); e.preventDefault(); return; }
    if (editing && drawMode && k === "Escape") { if (drawStart) stopChain(); else setDrawMode(false); e.preventDefault(); return; }
    if (editing && it) {
      const step = e.shiftKey ? 0.05 : 0.25;
      if (k === "Delete" || k === "Backspace") { removeSelected(); e.preventDefault(); return; }
      if (k === "r" || k === "R") { rotateSelected(e.shiftKey ? -90 : 90); e.preventDefault(); return; }
      if (k === "d" || k === "D") { duplicateSelected(); e.preventDefault(); return; }
      if ((k === "PageUp" || k === "]" || k === "PageDown" || k === "[") && !isWall(it)) { setLift(it, liftOf(it) + ((k === "PageUp" || k === "]") ? 1 : -1) * (e.shiftKey ? 0.01 : 0.05)); commit(); renderInspector(); e.preventDefault(); return; }
      const mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[k];
      if (mv) { const was = $("snap").checked; $("snap").checked = false; place(it, it.x + mv[0], it.y + mv[1]); $("snap").checked = was; rebuild(it.id); commit(); renderInspector(); e.preventDefault(); return; }
    }
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === "z") { e.shiftKey ? redo() : undo(); e.preventDefault(); return; }
    if (k === "ArrowLeft") cam.az = (cam.az + 355) % 360; else if (k === "ArrowRight") cam.az = (cam.az + 5) % 360;
    else if (k === "ArrowUp") cam.el = Math.min(89, cam.el + 3); else if (k === "ArrowDown") cam.el = Math.max(2, cam.el - 3);
    else if (k === "+" || k === "=") cam.zoom = Math.min(12, cam.zoom * 1.15); else if (k === "-") cam.zoom = Math.max(0.15, cam.zoom / 1.15);
    else return;
    setSpin(false); dirty = true; e.preventDefault();
  });
  window.addEventListener("resize", () => dirty = true);

  // view controls
  function setSpin(v) { cam.spin = v; $("spin").setAttribute("aria-pressed", String(v)); }
  $("spin").onclick = () => setSpin(!cam.spin);
  $("az").oninput = () => { setSpin(false); cam.az = (360 - +$("az").value) % 360; dirty = true; };
  document.querySelectorAll("[data-az]").forEach(b => b.onclick = () => { setSpin(false); animateTo(+b.dataset.az, +b.dataset.el); });
  $("fitBtn").onclick = () => { fitView(); };
  $("iso").onclick = () => { cam.ortho = true; $("iso").setAttribute("aria-pressed", "true"); $("persp").setAttribute("aria-pressed", "false"); dirty = true; };
  $("persp").onclick = () => { cam.ortho = false; $("persp").setAttribute("aria-pressed", "true"); $("iso").setAttribute("aria-pressed", "false"); dirty = true; };
  function setCut(on) { view.cut = on; $("cutBtn").setAttribute("aria-pressed", String(on)); $("outBtn").setAttribute("aria-pressed", String(!on)); shadowDirty = true; dirty = true; }
  $("cutBtn").onclick = () => setCut(true); $("outBtn").onclick = () => setCut(false);
  function animateTo(az, el) {
    const a0 = cam.az, e0 = cam.el, da = ((az - a0 + 540) % 360) - 180, t0 = performance.now(), dur = reduced ? 1 : 600;
    (function step(now) { const k = Math.min(1, (now - t0) / dur), s = k * k * (3 - 2 * k); cam.az = (a0 + da * s + 360) % 360; cam.el = e0 + (el - e0) * s; dirty = true; if (k < 1) requestAnimationFrame(step); })(t0);
  }
  $("editBtn").onclick = () => {
    editing = !editing; $("editBtn").setAttribute("aria-pressed", String(editing)); $("panel").hidden = !editing;
    $("modehint").hidden = !editing; canvas.classList.toggle("edit", editing);
    if (editing) setSpin(false); else { select(null); if (drawMode) setDrawMode(false); if (wallEditing) setWallEditing(false); }
    dirty = true;
  };

  // ================================================================ editing operations
  const selectedItem = () => state.items.find(i => i.id === selected) || null;
  function select(id) { selected = id; rebuildSelection(); dirty = true; renderInspector(); }
  function addItem(type, props) {
    const it = mk(type, cam.target[0], cam.target[1], 0, props ? JSON.parse(JSON.stringify(props)) : {});
    const S = state.site; it.x = clamp(it.x, -S.w / 2, S.w / 2); it.y = clamp(it.y, -S.d / 2, S.d / 2);
    if (isWall(it)) { const B = activeBld(); if (B) { const sg = wallSegs(B).sort((a, b) => b.L - a.L)[0]; const tx = sg.a[0] + sg.ux * sg.L / 2, ty = sg.a[1] + sg.uy * sg.L / 2;
      const nw = nearestWall(cam.target[0], cam.target[1]); place(it, nw && nw.d < 8 ? nw.qx : tx, nw && nw.d < 8 ? nw.qy : ty); } else place(it, it.x, it.y); }
    else if (CATALOG[it.type].site) { it.b = null; it.f = 0; }
    else { const B = activeBld(); if (B && !insidePoly(it.x, it.y, B.pts) && !buildingAt(it.x, it.y) && !CATALOG[type].site && editing) { it.x = B.cx; it.y = B.cy; if (!insidePoly(it.x, it.y, B.pts)) { const t = triangulate(B.pts); it.x = (B.pts[t[0]][0] + B.pts[t[1]][0] + B.pts[t[2]][0]) / 3; it.y = (B.pts[t[0]][1] + B.pts[t[1]][1] + B.pts[t[2]][1]) / 3; } }
      place(it, it.x, it.y); }
    state.items.push(it); selected = it.id; rebuild(it.id); commit(); renderInspector();
    toast(`${labelOf(it)} added${it.b ? " on the " + FLOOR_NAMES(it.f).toLowerCase() + " floor" : ""}. Drag it into place.`);
  }
  function removeSelected() { const it = selectedItem(); if (!it) return; state.items = state.items.filter(i => i !== it);
    if (HOSTS.includes(it.type)) for (const o of state.items) if (o.host === it.id) { o.host = null; place(o, o.x, o.y); } selected = null; rebuild(); commit(); renderInspector(); toast(`${labelOf(it)} removed`); }
  function duplicateSelected() {
    const it = selectedItem(); if (!it) return;
    const c = { ...JSON.parse(JSON.stringify(it)), id: "i" + (uid++) };
    const a = it.rot * D2R, wl = isWall(it), step = Math.max(0.9, halfOf(it) * 2 + 0.2);
    if (LINEAR.includes(it.type)) { c.x += -Math.sin(a) * 1.5; c.y += Math.cos(a) * 1.5; assignLevel(c); }
    else place(c, it.x + Math.cos(a) * (wl ? step : 0.9) + (wl ? 0 : 0.3), it.y + Math.sin(a) * (wl ? step : 0.9) - (wl ? 0 : 0.3));
    if (!wl && c.b === it.b) c.f = it.f;
    state.items.push(c); selected = c.id; rebuild(c.id); commit(); renderInspector();
  }
  function rotateSelected(deg) {
    const it = selectedItem(); if (!it) return;
    if (isWall(it)) { toast("Wall items face into the room. Tick ‘Place freely’ to turn them, or drag to another wall."); return; }
    it.rot = ((it.rot + deg) % 360 + 360) % 360; if (HOSTS.includes(it.type)) syncHosted(it); rebuild(it.id); commit(); renderInspector();
  }
  function undo() { if (!history.length) return; future.push(snapshot()); adopt(JSON.parse(history.pop())); lastCommitted = snapshot(); persist(); afterLoad(); }
  function redo() { if (!future.length) return; history.push(snapshot()); adopt(JSON.parse(future.pop())); lastCommitted = snapshot(); persist(); afterLoad(); }
  function updateUndo() { $("undo").disabled = !history.length; $("redo").disabled = !future.length; }
  function afterLoad() { selCorner = -1; rebuild(); renderAll(); updateUndo(); }

  // ---- building outline editing
  function wallItemParams(B) {
    const segs = wallSegs(B);
    return state.items.filter(it => isWall(it) && !it.host && it.b === B.id).map(it => ({ it, seg: it.seg, f: segs[it.seg] ? it.t / segs[it.seg].L : 0.5 }));
  }
  function buildingChanged(B, keep) {
    syncBld(B);
    const segs = wallSegs(B);
    for (const k of (keep || wallItemParams(B))) {
      const sg = segs[k.seg];
      if (sg) { const hh = Math.min(halfOf(k.it), sg.L / 2); putOnSurface(k.it, { ...sg, host: null, b: B.id, f: k.it.f || 0 }, clamp(sg.L * k.f, hh, sg.L - hh)); }
      else place(k.it, k.it.x, k.it.y);
    }
    rebuild(); renderBldPanel();
  }
  function splitWall(B, i) {
    const keep = wallItemParams(B), P = B.pts, a = P[i], b = P[(i + 1) % P.length];
    P.splice(i + 1, 0, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
    for (const k of keep) if (k.seg > i) k.seg++; else if (k.seg === i) { if (k.f > 0.5) { k.seg = i + 1; k.f = (k.f - 0.5) * 2; } else k.f *= 2; }
    buildingChanged(B, keep); commit(); return i + 1;
  }
  function deleteCorner(B, i) {
    const P = B.pts; if (P.length <= 3) { toast("A building needs at least 3 corners."); return; }
    const was = P[i]; P.splice(i, 1);
    if (segsCross(P) || polyArea(P) <= 0) { P.splice(i, 0, was); toast("Removing that corner would make the walls cross."); return; }
    selCorner = -1;
    buildingChanged(B, wallItemParams(B).map(k => ({ ...k, seg: -1 }))); commit(); toast("Corner removed");
  }

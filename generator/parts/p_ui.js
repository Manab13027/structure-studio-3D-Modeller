  // ================================================================ inspector extras: level, height above floor, free placement, options
  const LETTER = i => String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : "");
  function extraInspector(it) {
    const c = CATALOG[it.type], wallCapable = !!(c.wall || (it.type === "custom" && it.props.wall)), B = bldOf(it) || (!c.site ? buildingAt(it.x, it.y) : null);
    let h = `<details class="sub" id="posBox" open><summary>Position &amp; height</summary>`;
    if (!isWall(it)) {
      if (B && !c.site) h += `<label class="field"><span>Level in ${esc(B.name)}</span><select id="lvSel">${Array.from({ length: B.floors }, (_, f) => `<option value="${f}"${f === (it.f || 0) ? " selected" : ""}>${FLOOR_NAMES(f)} floor</option>`).join("")}</select></label>`;
      else h += `<p class="dims" style="margin:0">Stands on the site (ground level).</p>`;
      const lift = liftOf(it), mx = Math.max(3, B ? B.fh : 6, Math.ceil(lift + 1));
      h += `<label class="slider"><span>Above floor</span><input type="range" id="liftR" min="0" max="${mx}" step="0.01" value="${lift}"><output id="liftO">${lift.toFixed(2)} m</output></label>
        <div class="row"><label class="field" style="width:110px"><span>Exact height m</span><input type="number" id="liftN" min="0" max="60" step="0.01" value="${lift.toFixed(2)}"></label>
        <button id="restBtn" title="Lift it so it sits on top of whatever is under it">Rest on object below</button><button id="floorBtn">Back to floor</button></div>
        <p class="dims" style="margin:0">Objects can overlap and go anywhere. Alt / Option-drag in the view moves this up and down.</p>`;
    }
    if (wallCapable) h += `<label class="check"><input type="checkbox" id="freeChk"${it.props.free ? " checked" : ""}> Place freely (not stuck to a wall)</label>`;
    h += `</details>`;
    for (const [k, label] of c.flags || []) h += `<label class="check"><input type="checkbox" data-flag="${k}"${it.props[k] ? " checked" : ""}> ${esc(label)}</label>`;
    if (c.colors) h += `<label class="field"><span>Colour</span><input type="color" id="itColor" value="${esc(it.props.color || "#888888")}"></label>`;
    if (c.styles) h += `<label class="field"><span>Style</span><select id="itStyle">${c.styles.map(([v, l]) => `<option value="${v}"${it.props.style === v ? " selected" : ""}>${l}</option>`).join("")}</select></label>`;
    if (c.fin) h += `<label class="field"><span>Finish</span><select id="itFin">${finOptions(c.fin, it.props.fin)}</select></label>`;
    return h;
  }
  function bindExtra(it) {
    const lv = $("lvSel"); if (lv) lv.onchange = () => { it.f = +lv.value; rebuild(it.id); commit(); renderInspector(); };
    const R = $("liftR"), N = $("liftN");
    if (R) { R.oninput = () => { setLift(it, +R.value); $("liftO").textContent = (+R.value).toFixed(2) + " m"; N.value = (+R.value).toFixed(2); }; R.onchange = () => commit(); }
    if (N) N.onchange = () => { setLift(it, +N.value); commit(); renderInspector(); };
    const rb = $("restBtn"); if (rb) rb.onclick = () => { const h = supportHeight(it); setLift(it, h); commit(); renderInspector(); toast(h > 0.005 ? `Resting on top, ${h.toFixed(2)} m up` : "Nothing underneath it - left on the floor"); };
    const fb = $("floorBtn"); if (fb) fb.onclick = () => { setLift(it, 0); commit(); renderInspector(); };
    const fr = $("freeChk"); if (fr) fr.onchange = () => {
      if (fr.checked) { const a = it.rot * D2R; it.props.free = true; it.seg = null; it.host = null; it.side = null; it.x += Math.sin(a) * 0.5; it.y -= Math.cos(a) * 0.5; if (!bldOf(it)) assignLevel(it); }
      else { delete it.props.free; place(it, it.x, it.y); }
      rebuild(it.id); commit(); renderInspector();
    };
    $("inspector").querySelectorAll("[data-flag]").forEach(cb => cb.onchange = () => { it.props[cb.dataset.flag] = cb.checked; rebuild(it.id); commit(); });
    const ic = $("itColor"); if (ic) { ic.oninput = () => { it.props.color = ic.value; rebuild(it.id); }; ic.onchange = () => commit(); }
    const is = $("itStyle"); if (is) is.onchange = () => { it.props.style = is.value; rebuild(it.id); commit(); };
    const ifn = $("itFin"); if (ifn) ifn.onchange = () => { it.props.fin = ifn.value; rebuild(it.id); commit(); };
  }

  // ================================================================ Add panel: categories + search
  let catFilter = "All";
  function renderCatalog() {
    const q = $("catSearch").value.trim().toLowerCase(), box = $("catalog"); box.innerHTML = "";
    const seen = new Set(), list = [];
    for (const [cat, types] of CATS) if (catFilter === "All" || catFilter === cat) for (const t of types) {
      if (seen.has(t) || !CATALOG[t]) continue; const c = CATALOG[t];
      if (q && !(c.label + " " + c.short + " " + t + " " + cat).toLowerCase().includes(q)) continue;
      seen.add(t); list.push(t);
    }
    for (const t of list) { const b = document.createElement("button"); b.textContent = CATALOG[t].short; b.title = "Add " + CATALOG[t].label.toLowerCase(); b.onclick = () => addItem(t); box.appendChild(b); }
    if (!list.length) box.innerHTML = `<p class="empty" style="grid-column:1/-1">Nothing matches. Try another word, or make your own under My items.</p>`;
  }
  function renderChips() {
    $("catChips").innerHTML = ["All", ...CATS.map(c => c[0])].map(n => `<button role="tab" aria-pressed="${n === catFilter}" data-cat="${esc(n)}">${esc(n)}</button>`).join("");
    $("catChips").querySelectorAll("[data-cat]").forEach(b => b.onclick = () => { catFilter = b.dataset.cat; renderChips(); renderCatalog(); });
  }
  $("catSearch").oninput = () => { if ($("catSearch").value) { catFilter = "All"; renderChips(); } renderCatalog(); };
  function updateAddWhere() {
    const B = activeBld(); $("addWhere").textContent = B ? `inside → ${B.name}, ${FLOOR_NAMES(activeFloor(B)).toLowerCase()} floor` : "on the site";
  }

  // ================================================================ levels bar
  function renderLevels() {
    const n = Math.max(1, ...state.buildings.map(B => B.floors));
    const btns = [["All", 99], ...Array.from({ length: Math.min(n, 12) }, (_, f) => [f === 0 ? "G" : String(f), f])];
    $("levels").innerHTML = btns.map(([l, v]) => `<button data-lv="${v}" aria-pressed="${view.upTo === v}" title="${v === 99 ? "Show every floor" : "Show up to the " + FLOOR_NAMES(v).toLowerCase() + " floor and add things there"}">${l}</button>`).join("");
    $("levels").querySelectorAll("[data-lv]").forEach(b => b.onclick = () => setLevel(+b.dataset.lv));
  }
  function setLevel(v) {
    view.upTo = v; if (v !== 99) view.af = v; else { /* keep the floor you were adding to */ }
    renderLevels(); updateAddWhere(); renderBldPanel(); shadowDirty = true; dirty = true;
    if (selected && !itemVisible(selectedItem())) select(null);
    if (v !== 99 && !view.cut) setCut(true);
  }

  // ================================================================ buildings panel
  function setActiveBuilding(id) { view.ab = id; renderBldList(); renderBldPanel(); updateAddWhere(); if (wallEditing) { selCorner = -1; rebuildHandles(); } dirty = true; }
  function renderBldList() {
    $("bldList").innerHTML = state.buildings.map(B => `<button data-bid="${B.id}" aria-pressed="${B.id === view.ab}">${esc(B.name)}<small>${B.floors} fl · ${Math.abs(polyArea(B.pts)).toFixed(0)} m²</small></button>`).join("") ||
      `<p class="empty">No buildings. Add one below, or use the site on its own.</p>`;
    $("bldList").querySelectorAll("[data-bid]").forEach(b => b.onclick = () => setActiveBuilding(b.dataset.bid));
  }
  const opt = (pairs, cur) => pairs.map(([v, l]) => `<option value="${v}"${v === cur ? " selected" : ""}>${l}</option>`).join("");
  function renderBldPanel() {
    const B = activeBld(), box = $("bldPanel");
    if (!B) { box.innerHTML = ""; return; }
    const af = activeFloor(B), R = B.roof;
    box.innerHTML = `
      <label class="field"><span>Name</span><input type="text" id="bName" maxlength="40" value="${esc(B.name)}"></label>
      <div class="grid3">
        <label class="field"><span>Floors</span><input type="number" id="bFloors" min="1" max="60" step="1" value="${B.floors}"></label>
        <label class="field"><span>Floor-to-floor m</span><input type="number" id="bFh" min="2.4" max="12" step="0.1" value="${B.fh}"></label>
        <label class="field"><span>Wall m</span><input type="number" id="bT" min="0.08" max="1.2" step="0.01" value="${B.wallT}"></label>
      </div>
      <label class="slider"><span>Width</span><input id="bW" type="range" min="3" max="150" step="0.5" value="${B.w}"><output>${B.w} m</output></label>
      <label class="slider"><span>Depth</span><input id="bD" type="range" min="3" max="150" step="0.5" value="${B.d}"><output>${B.d} m</output></label>
      <div class="field"><span>Floor plan shape</span><div class="catalog" id="bShapes">${Object.keys(SHAPES).map(n => `<button data-shape="${n}">${n}</button>`).join("")}</div></div>
      <div class="row"><button id="cornerBtn" aria-pressed="${wallEditing}">Edit corners &amp; move</button><button id="bFit">Frame it</button><button id="bDup">Duplicate</button><button id="bDel" class="danger">Delete</button></div>
      <p class="dims" style="margin:0"${wallEditing ? "" : " hidden"}>Drag green corners to angle walls, click a small blue marker to add a corner, select a corner and press Delete to remove it. Drag inside the outline to move the building with everything in it.</p>
      <details class="sub" id="cornerBox"><summary>Corners &amp; wall lengths</summary><div id="corners" style="display:grid;gap:6px"></div></details>
      <div class="grid2">
        <label class="field"><span>Outside walls</span><select id="bExt">${finOptions("ext", B.ext)}</select></label>
        <label class="field"><span>Inside paint</span><input type="color" id="bPaint" value="${esc(B.paint)}"></label>
      </div>
      <label class="field"><span>Floor finish · ${FLOOR_NAMES(af).toLowerCase()} floor</span><span class="pair"><select id="bFloorFin">${finOptions("floor", B.floorFin[af])}</select><button id="bFinAll" title="Use this finish on every floor">All floors</button></span></label>
      <label class="check"><input type="checkbox" id="bDado"${B.dado ? " checked" : ""}> Darker lower wall band (dado)</label>
      <div class="grid2">
        <label class="field"><span>Roof</span><select id="rType">${opt([["none", "None (open top)"], ["flat", "Flat with parapet"], ["gable", "Gable"], ["hip", "Hip"], ["shed", "Mono-pitch (shed)"]], R.type)}</select></label>
        <label class="field"><span>Roof covering</span><select id="rMat">${finOptions("roof", R.mat)}</select></label>
      </div>
      ${R.type === "gable" || R.type === "hip" || R.type === "shed" ? `<label class="slider"><span>Pitch</span><input id="rPitch" type="range" min="5" max="60" step="1" value="${R.pitch}"><output>${R.pitch}°</output></label>
      <label class="slider"><span>Overhang</span><input id="rOver" type="range" min="0" max="1.5" step="0.05" value="${R.over}"><output>${(+R.over).toFixed(2)} m</output></label>` : ""}`;
    renderCorners();
    const B_ = B, num = (id, fn) => { const el = $(id); el.onchange = () => { fn(+el.value); }; };
    $("bName").oninput = () => { B_.name = $("bName").value || "Building"; renderBldList(); updateAddWhere(); }; $("bName").onchange = () => { rebuild(); commit(); };
    num("bFloors", v => { B_.floors = Math.max(1, Math.min(60, Math.round(v) || 1)); syncBld(B_); for (const it of state.items) if (it.b === B_.id && it.f >= B_.floors) it.f = B_.floors - 1; rebuild(); commit(); renderAll(); });
    num("bFh", v => { B_.fh = clamp(v || 3, 2.4, 12); rebuild(); commit(); renderBldPanel(); });
    num("bT", v => { B_.wallT = clamp(v || 0.25, 0.08, 1.2); rebuild(); commit(); });
    for (const [id, axis] of [["bW", 0], ["bD", 1]]) { const el = $(id); el.oninput = () => { resizeBuilding(B_, axis, +el.value); el.nextElementSibling.textContent = el.value + " m"; }; el.onchange = () => { commit(); renderBldList(); }; }
    box.querySelectorAll("[data-shape]").forEach(b => b.onclick = () => {
      const unit = SHAPES[b.dataset.shape], keep = wallItemParams(B_).map(k => ({ ...k, seg: -1 }));
      B_.pts = unit.map(([x, y]) => [+(B_.cx + x * B_.w).toFixed(2), +(B_.cy + y * B_.d).toFixed(2)]);
      buildingChanged(B_, keep); commit(); renderBldList(); toast(`${b.dataset.shape} plan. Doors and windows moved to the nearest wall.`);
    });
    $("cornerBtn").onclick = () => setWallEditing(!wallEditing);
    $("bFit").onclick = () => fitView(B_);
    $("bDup").onclick = () => {
      const C = JSON.parse(JSON.stringify(B_)); C.id = "b" + (uid++); C.name = B_.name + " copy"; const dx = B_.w + 6; C.pts = C.pts.map(([x, y]) => [x + dx, y]); syncBld(C); state.buildings.push(C);
      const map = {}; const copies = state.items.filter(i => i.b === B_.id).map(i => { const c = JSON.parse(JSON.stringify(i)); map[i.id] = c.id = "i" + (uid++); c.b = C.id; c.x += dx; return c; });
      for (const c of copies) if (c.host) c.host = map[c.host] || null; state.items.push(...copies);
      view.ab = C.id; rebuild(); commit(); renderAll(); toast("Building duplicated beside the original.");
    };
    $("bDel").onclick = () => {
      state.buildings = state.buildings.filter(x => x !== B_); const gone = new Set(state.items.filter(i => i.b === B_.id).map(i => i.id));
      state.items = state.items.filter(i => !gone.has(i.id)); for (const i of state.items) if (gone.has(i.host)) { i.host = null; place(i, i.x, i.y); }
      view.ab = state.buildings[0] ? state.buildings[0].id : null; if (wallEditing) setWallEditing(false); selected = null; rebuild(); commit(); renderAll(); toast(`${B_.name} removed with its contents. Undo brings it back.`);
    };
    $("bExt").onchange = () => { B_.ext = $("bExt").value; rebuildBuildingShell(B_.id); commit(); dirty = true; };
    $("bPaint").oninput = () => { B_.paint = $("bPaint").value; rebuildBuildingShell(B_.id); dirty = true; }; $("bPaint").onchange = () => commit();
    $("bFloorFin").onchange = () => { B_.floorFin[af] = $("bFloorFin").value; rebuildBuildingShell(B_.id); commit(); dirty = true; };
    $("bFinAll").onclick = () => { B_.floorFin = B_.floorFin.map(() => $("bFloorFin").value); rebuildBuildingShell(B_.id); commit(); dirty = true; toast("Same floor finish on every floor"); };
    $("bDado").onchange = () => { B_.dado = $("bDado").checked; rebuildBuildingShell(B_.id); commit(); dirty = true; };
    $("rType").onchange = () => { B_.roof.type = $("rType").value; if (B_.roof.type === "flat" && FIN[B_.roof.mat].kind === "roof" && !["membrane", "green_roof"].includes(B_.roof.mat)) B_.roof.mat = "membrane";
      if (["gable", "hip", "shed"].includes(B_.roof.type) && ["membrane", "green_roof"].includes(B_.roof.mat)) B_.roof.mat = "clay_tiles";
      rebuild(); commit(); renderBldPanel(); if (B_.roof.type !== "none" && view.cut) toast("Roofs show in the Outside view."); };
    $("rMat").onchange = () => { B_.roof.mat = $("rMat").value; rebuildBuildingShell(B_.id); commit(); dirty = true; };
    for (const [id, k, unit] of [["rPitch", "pitch", "°"], ["rOver", "over", " m"]]) { const el = $(id); if (!el) continue;
      el.oninput = () => { B_.roof[k] = +el.value; el.nextElementSibling.textContent = (k === "over" ? (+el.value).toFixed(2) : el.value) + unit; rebuildBuildingShell(B_.id); dirty = true; }; el.onchange = () => commit(); }
  }
  function resizeBuilding(B, axis, val) {
    const f = val / (axis ? B.d : B.w), cx = B.cx, cy = B.cy, keep = wallItemParams(B);
    const sc = ([x, y]) => axis ? [x, cy + (y - cy) * f] : [cx + (x - cx) * f, y];
    B.pts = B.pts.map(sc);
    for (const it of state.items) if (it.b === B.id && !isWall(it) && !it.host) { [it.x, it.y] = sc([it.x, it.y]);
      if (it.props.len) { const r = it.rot * D2R; it.props.len = +(it.props.len * Math.hypot(Math.cos(r) * (axis ? 1 : f), Math.sin(r) * (axis ? f : 1))).toFixed(3); } }
    buildingChanged(B, keep);
  }
  function renderCorners() {
    const B = activeBld(), el = $("corners"); if (!B || !el) return;
    const P = B.pts, segs = wallSegs(B);
    el.innerHTML = P.map((p, i) => `<div class="grid3" style="grid-template-columns:28px minmax(0,1fr) minmax(0,1fr) auto;align-items:center">
        <b style="color:${i === selCorner ? "var(--accent)" : "var(--fg)"}">${LETTER(i)}</b>
        <input type="number" step="0.05" data-cx="${i}" value="${p[0].toFixed(2)}" aria-label="Corner ${LETTER(i)} x (m)">
        <input type="number" step="0.05" data-cy="${i}" value="${p[1].toFixed(2)}" aria-label="Corner ${LETTER(i)} y (m)">
        <button data-cdel="${i}" title="Remove corner ${LETTER(i)}" aria-label="Remove corner ${LETTER(i)}">×</button></div>
      <div class="dims" style="padding-left:28px">wall ${LETTER(i)}–${LETTER((i + 1) % P.length)}: ${segs[i].L.toFixed(2)} m <button data-split="${i}" style="padding:3px 6px;margin-left:6px">+ corner</button></div>`).join("");
    el.querySelectorAll("input").forEach(inp => inp.onchange = () => {
      const i = +(inp.dataset.cx ?? inp.dataset.cy), axis = inp.dataset.cx !== undefined ? 0 : 1, prev = P[i].slice(), keep = wallItemParams(B);
      P[i][axis] = +inp.value || 0;
      if (segsCross(P) || polyArea(P) <= 0) { P[i] = prev; toast("That would make the walls cross."); renderCorners(); return; }
      buildingChanged(B, keep); commit();
    });
    el.querySelectorAll("[data-cdel]").forEach(b => b.onclick = () => deleteCorner(B, +b.dataset.cdel));
    el.querySelectorAll("[data-split]").forEach(b => b.onclick = () => { selCorner = splitWall(B, +b.dataset.split); rebuildHandles(); renderCorners(); });
  }
  $("newShape").innerHTML = Object.keys(SHAPES).map(n => `<option>${n}</option>`).join("");
  $("addBld").onclick = () => {
    const unit = SHAPES[$("newShape").value], W = 12, D = 9, S = state.site;
    // first free spot near the view centre (no overlap with other buildings, inside the site)
    const free = (x, y) => Math.abs(x) + W / 2 <= S.w / 2 && Math.abs(y) + D / 2 <= S.d / 2 &&
      state.buildings.every(B => Math.abs(B.cx - x) > (B.w + W) / 2 + 3 || Math.abs(B.cy - y) > (B.d + D) / 2 + 3);
    let cx = Math.round(cam.target[0]), cy = Math.round(cam.target[1]);
    search: for (let r = 0; r < 30; r++) for (let i = -r; i <= r; i++) for (const [dx, dy] of [[i, -r], [i, r], [-r, i], [r, i]]) {
      const x = Math.round(cam.target[0] + dx * 4), y = Math.round(cam.target[1] + dy * 4); if (free(x, y)) { cx = x; cy = y; break search; } }
    const B = newBuilding({ name: "Building " + (state.buildings.length + 1), pts: unit.map(([x, y]) => [+(cx + x * W).toFixed(2), +(cy + y * D).toFixed(2)]) });
    state.buildings.push(B); view.ab = B.id; rebuild(); commit(); renderAll(); toast(`${B.name} added. Use Edit corners & move to place it.`);
  };

  // ================================================================ site, draw, project
  $("sGround").innerHTML = finOptions("ground", "");
  function renderSite() { const S = state.site; $("sw").value = S.w; $("sd").value = S.d; $("swo").textContent = S.w + " m"; $("sdo").textContent = S.d + " m"; $("sGround").value = S.ground; }
  for (const [id, k] of [["sw", "w"], ["sd", "d"]]) { $(id).oninput = () => { state.site[k] = +$(id).value; $(id + "o").textContent = $(id).value + " m"; rebuildShell(); shadowDirty = true; dirty = true; refreshStatus(); }; $(id).onchange = () => commit(); }
  $("sGround").onchange = () => { state.site.ground = $("sGround").value; rebuildShell(); commit(); dirty = true; };
  $("drawType").innerHTML = DRAW_TYPES.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
  $("drawBtn").onclick = () => setDrawMode(!drawMode);
  $("drawType").onchange = () => { if (drawMode) stopChain(); };
  $("pjName").oninput = () => { state.name = $("pjName").value; refreshStatus(); }; $("pjName").onchange = () => commit();
  let tplPending = null;
  $("tplButtons").innerHTML = Object.entries(TEMPLATES).map(([k, t]) => `<button data-tpl="${k}">${t.label}</button>`).join("");
  $("tplButtons").querySelectorAll("[data-tpl]").forEach(b => b.onclick = () => { tplPending = b.dataset.tpl; $("tplMsg").textContent = `Replace this design with “${TEMPLATES[tplPending].label}”? Undo brings yours back.`; $("tplConfirm").hidden = false; });
  $("tplNo").onclick = () => { $("tplConfirm").hidden = true; tplPending = null; };
  $("tplYes").onclick = () => {
    $("tplConfirm").hidden = true; if (!tplPending) return; const keepT = state.templates, keepC = state.custom, keepA = state.assets;
    history.push(snapshot()); future.length = 0; const s = TEMPLATES[tplPending].make(); s.templates = keepT; s.custom = keepC; s.assets = keepA;
    view.ab = null; view.upTo = 99; view.af = 0; adopt(s); lastCommitted = snapshot(); persist(); selected = null; afterLoad(); fitView(); toast(`${TEMPLATES[tplPending].label} loaded`);
  };
  function refreshStatus() {
    if (!state) return;
    const fl = state.buildings.reduce((s, B) => s + B.floors, 0), area = state.buildings.reduce((s, B) => s + Math.abs(polyArea(B.pts)) * B.floors, 0);
    $("projName").textContent = state.name || "Structure Studio";
    $("subtitle").textContent = `${state.buildings.length} building${state.buildings.length === 1 ? "" : "s"} · ${fl} floor${fl === 1 ? "" : "s"} · ${area.toFixed(0)} m² floor area · ${state.items.length} objects · site ${state.site.w} × ${state.site.d} m`;
    $("bldSummary").textContent = `${state.buildings.length} · ${area.toFixed(0)} m²`; $("siteSummary").textContent = `${state.site.w} × ${state.site.d} m`;
  }
  function renderAll() {
    $("pjName").value = state.name || ""; renderInspector(); renderMine(); renderBldList(); renderBldPanel(); renderLevels(); renderSite(); updateAddWhere(); refreshStatus(); updateUndo();
  }

  // layout buttons
  $("undo").onclick = undo; $("redo").onclick = redo;
  const fileBase = () => (state.name || "design").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "design";
  $("saveLayout").onclick = () => saveFile(fileBase() + ".json", new Blob([JSON.stringify(state, null, 1)], { type: "application/json" }));
  $("openLayout").onclick = () => $("layoutFile").click();
  $("layoutFile").onchange = async () => {
    const f = $("layoutFile").files[0]; if (!f) return;
    try {
      const v = JSON.parse(await f.text()); if (!validLayout(v)) throw new Error("bad");
      history.push(snapshot()); future.length = 0; view.ab = null; adopt(v); lastCommitted = snapshot(); persist(); selected = null; afterLoad(); fitView(); toast(`Opened ${f.name}`);
    } catch (e) { toast("That file isn't a design saved from Structure Studio (or the ops-room editor)."); }
    $("layoutFile").value = "";
  };
  $("shot").onclick = () => { render(); canvas.toBlob(b => b && saveFile(fileBase() + ".png", b), "image/png"); };
  $("kit").onclick = async () => { try { toast("Building the Blender kit…"); await saveFile("structure_studio_kit.zip", buildKit()); } catch (e) { toast("Couldn't build the kit: " + e.message); } };

  // ================================================================ export for Blender: scene.json + kit
  function sceneJSON() {
    const prims0 = allPrims(), used = new Set(prims0.filter(p => p.t !== "mesh").map(p => p.m)), materials = {};
    for (const m of used) { const mt = material(m); materials[m] = { ...mt }; }
    const prims = prims0.map(({ item, ...p }) => {
      if (p.t === "mesh") { const A = ASSETS[p.asset], a = state.assets[p.asset];
        return { t: "asset", n: p.n, g: p.g, file: `assets/${p.asset}.${a.kind === "obj" ? "obj" : "glb"}`, p: p.p, rz: p.rz, s: p.k.map(v => v * A.base), off: A.off, yup: true }; }
      const q = { ...p }, tile = material(p.m).tile; delete q.nn;
      if (q.t === "tris" && !q.uv && tile) { const uv = []; for (let i = 0; i + 8 < q.v.length; i += 9) {
          const A = q.v.slice(i, i + 3), B = q.v.slice(i + 3, i + 6), C = q.v.slice(i + 6, i + 9), u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
          let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; const l = Math.hypot(...n) || 1; n = n.map(c => c / l);
          for (const P of [A, B, C]) { if (Math.abs(n[2]) > 0.7) uv.push(P[0] / tile, P[1] / tile); else { const h = Math.hypot(n[0], n[1]) || 1; uv.push((P[0] * -n[1] / h + P[1] * n[0] / h) / tile, P[2] / tile); } } }
        q.uv = uv; }
      if (q.t === "plane" && !q.uv) q.uv = tile ? [q.s[0] / tile, q.s[1] / tile] : [1, 1];
      return q; });
    const S = state.site;
    return { version: 2, name: state.name, site: { ...S }, buildings: state.buildings.map(B => ({ name: B.name, pts: B.pts, floors: B.floors, fh: B.fh, base: B.base, top: wallTopZ(B) })), materials, prims };
  }
  function buildKit() {
    const D = "structure_studio/", scene = sceneJSON(), files = [{ name: D + "scene.json", data: JSON.stringify(scene) }];
    const texKeys = new Set(Object.values(scene.materials).map(m => m.tex).filter(Boolean));
    for (const k of texKeys) if (TEX[k]) files.push({ name: `${D}textures/${k}.${extOf(TEX[k])}`, data: dataBytes(TEX[k]) });
    for (const [id, a] of Object.entries(state.assets || {})) if (state.items.some(i => i.type === "asset" && i.props.asset === id))
      files.push({ name: `${D}assets/${id}.${a.kind === "obj" ? "obj" : "glb"}`, data: dataBytes(a.data) });
    files.push({ name: D + "build_scene.py", data: BLENDER_PY });
    files.push({ name: D + "structure_studio.glb", data: buildGLB() });
    files.push({ name: D + "design.json", data: JSON.stringify(state) });
    files.push({ name: D + "README.txt", data: `Structure Studio - ${state.name}\n\nBlender: Scripting tab > Open build_scene.py > Run Script.\n  Builds this design, saves structure_studio.blend, exports structure_studio.glb. Press Space for the 360 turntable.\n  Collections are split per building, floor and roof, so you can hide the roof to look inside.\nOr import structure_studio.glb directly: File > Import > glTF 2.0.\ndesign.json re-opens in the web editor (Open file).\n` });
    return zip(files);
  }

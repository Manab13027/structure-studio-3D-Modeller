  function renderInspector() {
    renderPick();
    const it = selectedItem(), box = $("inspector");
    if (!it) { box.innerHTML = `<p class="empty">Click any object to select it, then drag to move it anywhere (objects may overlap). Alt-drag (Option-drag) moves it up or down.<br>Keys: R rotate · D duplicate · Delete remove · arrows nudge · [ ] or PgUp/PgDn raise / lower.</p>`; return; }
    const c = CATALOG[it.type], sc = it.props.scale || [1, 1, 1], bb = itemBoxes[it.id];
    const dimTxt = bb ? `${(bb.max[0] - bb.min[0]).toFixed(2)} × ${(bb.max[1] - bb.min[1]).toFixed(2)} × ${(bb.max[2] - bb.min[2]).toFixed(2)} m (footprint × height)` : "";
    const pct = v => Math.round(v * 100);
    let h = `<div class="sel-name">${esc(labelOf(it))}</div>
      <div class="row" style="color:var(--muted);font-size:11px;font-variant-numeric:tabular-nums">x ${it.x.toFixed(2)} m · y ${it.y.toFixed(2)} m · facing ${((360 - it.rot) % 360 + 360) % 360 === 0 ? "000" : String(Math.round(((it.rot % 360) + 360) % 360)).padStart(3, "0")}°</div>
      <div class="row">${isWall(it) ? "" : `<button data-rot="-90">⟲ 90°</button><button data-rot="-15">⟲ 15°</button><button data-rot="15">⟳ 15°</button><button data-rot="90">⟳ 90°</button>
        <label class="field" style="width:96px"><span>Angle °</span><input type="number" id="rotDeg" step="1" value="${Math.round(((it.rot % 360) + 360) % 360)}"></label>`}</div>
      ${it.type === "partition" ? (() => { const r = it.rot * D2R, L = it.props.len, ex = Math.cos(r) * L / 2, ey = Math.sin(r) * L / 2;
        return `<p class="dims" style="margin:0">Ends at (${(it.x - ex).toFixed(2)}, ${(it.y - ey).toFixed(2)}) and (${(it.x + ex).toFixed(2)}, ${(it.y + ey).toFixed(2)}) m. Add a door or window and drag it onto this wall to cut an opening.</p>`; })() : ""}
      <div class="row"><button id="dup">Duplicate</button><button id="del" class="danger">Delete</button>${(it.type === "custom" || it.type === "asset") ? `<button id="toMine" title="Reuse this item from My items">Keep in My items</button>` : ""}</div>
      ${extraInspector(it)}
      <details class="sub" id="sizeBox"${it.props.scale ? " open" : ""}${c.noScale ? " hidden" : ""}><summary>Size</summary>
        <div class="dims">${dimTxt}</div>
        <label class="slider"><span>Width</span><input type="range" id="sx" min="25" max="400" step="5" value="${pct(sc[0])}"><output>${pct(sc[0])}%</output></label>
        <label class="slider"><span>Depth</span><input type="range" id="sy" min="25" max="400" step="5" value="${pct(sc[1])}"><output>${pct(sc[1])}%</output></label>
        <label class="slider"><span>Height</span><input type="range" id="sz" min="25" max="400" step="5" value="${pct(sc[2])}"><output>${pct(sc[2])}%</output></label>
        <label class="check"><input type="checkbox" id="slock" checked> Keep proportions</label>
        ${it.type === "asset" && ASSETS[it.props.asset] ? `<label class="field"><span>Longest side (m)</span><input type="number" id="longest" min="0.05" max="30" step="0.05" value="${(ASSETS[it.props.asset].size * ASSETS[it.props.asset].base * Math.max(...sc)).toFixed(2)}"></label>` : ""}
        <button id="sreset">Original size</button>
      </details>`;
    if (it.type === "custom") {
      const p = it.props;
      h += `<label class="field"><span>Name</span><input type="text" id="pName" maxlength="40" value="${esc(p.name)}"></label>
        <div class="grid3"><label class="field"><span>Width m</span><input type="number" id="pW" step="0.05" min="0.05" value="${p.w}"></label>
        <label class="field"><span>Depth m</span><input type="number" id="pD" step="0.05" min="0.02" value="${p.d}"></label>
        <label class="field"><span>Height m</span><input type="number" id="pH" step="0.05" min="0.02" value="${p.h}"></label></div>
        <div class="grid2"><label class="field"><span>Above floor m</span><input type="number" id="pZ" step="0.05" min="0" value="${p.z}"></label>
        <label class="field"><span>Colour</span><input type="color" id="pColor" value="${esc(p.color)}"></label></div>
        <label class="field"><span>Shape</span><select id="pShape">${[["box", "Box"], ["cyl", "Cylinder"], ["panel", "Flat panel"]].map(([v, l]) => `<option value="${v}"${p.shape === v ? " selected" : ""}>${l}</option>`).join("")}</select></label>
        <label class="field"><span>Picture</span><span class="pair"><select data-slot="img"><option value="">None</option>${libraryOptions(p.img)}</select><button data-upload="img">Upload…</button></span></label>
        <label class="field"><span>Picture goes on</span><select id="pFace"><option value="front"${p.face !== "top" ? " selected" : ""}>Front face</option><option value="top"${p.face === "top" ? " selected" : ""}>Top face</option></select></label>
        <label class="check"><input type="checkbox" id="pWall"${p.wall ? " checked" : ""}> Mount on a wall</label>`;
    }
    if (c.dims) h += `<div class="grid2">` + c.dims.map(([k, label, mn, mx]) =>
        `<label class="field"><span>${label}</span><input type="number" data-dim="${k}" min="${mn}" max="${mx}" step="${k === "panes" ? 1 : 0.05}" value="${it.props[k]}"></label>`).join("") + `</div>`;
    if (it.type === "partition") h += `<label class="check"><input type="checkbox" id="pGlass"${it.props.glass ? " checked" : ""}> Glass partition</label>`;
    if (it.host && isWall(it)) h += `<p class="dims" style="margin:0">On a free-standing wall, ${it.t.toFixed(2)} m from its end</p>`;
    else if (it.seg != null && isWall(it)) h += `<p class="dims" style="margin:0">On ${esc(bldOf(it) ? bldOf(it).name : "")} wall ${LETTER(it.seg)}–${LETTER((it.seg + 1) % (bldOf(it) ? bldOf(it).pts.length : 4))}, ${FLOOR_NAMES(it.f || 0).toLowerCase()} floor, ${it.t.toFixed(2)} m from corner ${LETTER(it.seg)}</p>`;
    if (it.type === "asset") h += `<label class="field"><span>Name</span><input type="text" id="pName" maxlength="40" value="${esc(it.props.name)}"></label>
      <p class="dims" style="margin:0">${ASSETS[it.props.asset] ? Math.round(ASSETS[it.props.asset].tris).toLocaleString() + " triangles" : "Model file missing from this layout"}</p>`;
    for (const [slot, label] of c.slots || []) {
      h += `<label class="field"><span>${esc(label)}</span><span class="pair"><select data-slot="${slot}">${libraryOptions(it.props[slot])}</select>
            <button data-upload="${slot}" title="Use your own image (map, screenshot, photo)">Upload…</button></span></label>`;
    }
    if (c.text) h += `<label class="field"><span>Sign text</span><input type="text" id="signText" maxlength="40" value="${esc(it.props.text)}"></label>`;
    if (it.type === "table") h += `<label class="check"><input type="checkbox" id="markers"${it.props.markers ? " checked" : ""}> Unit markers and flags on the table</label>`;
    if (c.size) h += `<label class="slider"><span>Width</span><input type="range" id="pw" min="2" max="14" step="0.5" value="${it.props.w}"><output>${it.props.w} m</output></label>
                      <label class="slider"><span>Depth</span><input type="range" id="pd" min="1" max="8" step="0.25" value="${it.props.d}"><output>${it.props.d} m</output></label>`;
    h += `<input type="file" id="upFile" accept="image/*" hidden>`;
    box.innerHTML = h;
    box.querySelectorAll("[data-rot]").forEach(b => b.onclick = () => rotateSelected(+b.dataset.rot));
    $("dup").onclick = duplicateSelected; $("del").onclick = removeSelected;
    const rd_ = $("rotDeg"); if (rd_) rd_.onchange = () => { it.rot = ((+rd_.value || 0) % 360 + 360) % 360; if (!isWall(it)) place(it, it.x, it.y); rebuild(it.type === "dais" ? null : it.id); commit(); renderInspector(); };
    box.querySelectorAll("[data-dim]").forEach(inp => inp.onchange = () => {
      const k = inp.dataset.dim, mn = +inp.min, mx = +inp.max; it.props[k] = clamp(+inp.value || mn, mn, mx);
      if (isWall(it)) place(it, it.x, it.y); rebuild(it.id); commit(); renderInspector(); });
    const gl_ = $("pGlass"); if (gl_) gl_.onchange = () => { it.props.glass = gl_.checked; rebuild(it.id); commit(); };
    const keepBtn = $("toMine"); if (keepBtn) keepBtn.onclick = () => { addTemplate(it.type, it.props); toast(`${labelOf(it)} is in My items`); };
    // size
    const sliders = ["sx", "sy", "sz"].map(id => $(id));
    sliders.forEach((r, i) => r.oninput = () => {
      const cur = (it.props.scale || [1, 1, 1]).slice(), v = +r.value / 100;
      if ($("slock").checked) { const f = v / (cur[i] || 1); for (let k = 0; k < 3; k++) cur[k] = Math.min(4, Math.max(0.25, cur[k] * f)); } else cur[i] = v;
      it.props.scale = cur; sliders.forEach((s2, k) => { s2.value = Math.round(cur[k] * 100); s2.nextElementSibling.textContent = Math.round(cur[k] * 100) + "%"; });
      if (isWall(it)) place(it, it.x, it.y);
      rebuild(it.type === "dais" ? null : it.id);
    });
    sliders.forEach(r => r.onchange = () => { commit(); renderInspector(); });
    $("sreset").onclick = () => { delete it.props.scale; rebuild(it.type === "dais" ? null : it.id); commit(); renderInspector(); };
    const lg = $("longest"); if (lg) lg.onchange = () => { const A = ASSETS[it.props.asset], cur = it.props.scale || [1, 1, 1], want = Math.max(0.05, +lg.value);
      const f = want / (A.size * A.base * Math.max(...cur)); it.props.scale = cur.map(v => v * f); rebuild(it.id); commit(); renderInspector(); };
    // custom item properties
    const bindNum = (id, key, min) => { const el = $(id); if (el) el.onchange = () => { it.props[key] = Math.max(min, +el.value || min); if (isWall(it)) place(it, it.x, it.y); rebuild(it.id); commit(); renderInspector(); }; };
    bindNum("pW", "w", 0.05); bindNum("pD", "d", 0.02); bindNum("pH", "h", 0.02); bindNum("pZ", "z", 0);
    const nm = $("pName"); if (nm) { nm.oninput = () => { it.props.name = nm.value; renderPick(); }; nm.onchange = () => commit(); }
    const pc = $("pColor"); if (pc) { pc.oninput = () => { it.props.color = pc.value; rebuild(it.id); }; pc.onchange = () => commit(); }
    for (const [id, key] of [["pShape", "shape"], ["pFace", "face"]]) { const el = $(id); if (el) el.onchange = () => { it.props[key] = el.value; rebuild(it.id); commit(); }; }
    const pw = $("pWall"); if (pw) pw.onchange = () => { it.props.wall = pw.checked; if (!pw.checked) it.rot = 0; place(it, it.x, it.y); rebuild(it.id); commit(); renderInspector(); };
    box.querySelectorAll("select[data-slot]").forEach(s => s.onchange = () => { it.props[s.dataset.slot] = s.value; rebuild(it.id); commit(); });
    let upSlot = null;
    box.querySelectorAll("[data-upload]").forEach(b => b.onclick = () => { upSlot = b.dataset.upload; $("upFile").click(); });
    $("upFile").onchange = async () => {
      const f = $("upFile").files[0]; if (!f || !upSlot) return;
      try { const key = await importImage(f); it.props[upSlot] = key; rebuild(it.id); commit(); renderInspector(); toast(`Using ${f.name}`); }
      catch (err) { toast("That file couldn't be read as an image. Try a PNG or JPEG."); }
    };
    const st = $("signText"); if (st) { st.oninput = () => { it.props.text = st.value; rebuild(it.id); }; st.onchange = () => commit(); }
    const mk_ = $("markers"); if (mk_) mk_.onchange = () => { it.props.markers = mk_.checked; rebuild(it.id); commit(); };
    for (const [id, k] of [["pw", "w"], ["pd", "d"]]) { const r = $(id); if (r) { r.oninput = () => { it.props[k] = +r.value; r.nextElementSibling.textContent = r.value + " m"; rebuild(it.type === "dais" ? null : it.id); }; r.onchange = () => commit(); } }
    bindExtra(it);
  }

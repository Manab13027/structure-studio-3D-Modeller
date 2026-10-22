  // ================================================================ My items (templates), custom form, model import
  function addTemplate(type, props) {
    const pr = JSON.parse(JSON.stringify(props)); delete pr.scale;
    state.templates.push({ id: "t" + Date.now().toString(36), type, label: pr.name || CATALOG[type].label, props: pr }); commit(); renderMine();
  }
  function renderMine() {
    const box = $("mycatalog"); box.innerHTML = "";
    if (!state.templates.length) { box.innerHTML = `<p class="empty" style="grid-column:1/-1;margin:0">Items you create or import appear here, ready to add again.</p>`; return; }
    for (const t of state.templates) {
      const w = document.createElement("div"); w.className = "mine";
      const add = document.createElement("button"); add.textContent = t.label; add.title = "Add " + t.label;
      add.onclick = () => { if (t.type === "asset" && !ASSETS[t.props.asset]) { toast("That model's file isn't in this layout any more."); return; } addItem(t.type, t.props); };
      const rm = document.createElement("button"); rm.textContent = "×"; rm.title = "Remove from My items"; rm.setAttribute("aria-label", "Remove " + t.label + " from My items");
      rm.onclick = () => { state.templates = state.templates.filter(x => x !== t); commit(); renderMine(); };
      w.append(add, rm); box.appendChild(w);
    }
  }
  function fillImgSelect(sel, current) { sel.innerHTML = `<option value="">None</option>` + libraryOptions(current); }
  $("customForm").addEventListener("toggle", () => { if ($("customForm").open) fillImgSelect($("cImg"), $("cImg").value); });
  $("cUpload").onclick = () => $("cFile").click();
  $("cFile").onchange = async () => {
    const f = $("cFile").files[0]; if (!f) return;
    try { const key = await importImage(f); fillImgSelect($("cImg"), key); toast(`Picture ready: ${f.name}`); } catch (e) { toast("That file couldn't be read as an image. Try a PNG or JPEG."); }
    $("cFile").value = "";
  };
  $("cShape").onchange = () => { if ($("cShape").value === "panel") { $("cD").value = 0.04; $("cWall").checked = true; } };
  $("cAdd").onclick = () => {
    const num = (id, min, def) => { const v = parseFloat($(id).value); return isFinite(v) && v >= min ? v : def; };
    const props = { name: $("cName").value.trim() || "Custom item", shape: $("cShape").value, w: num("cW", 0.05, 1), d: num("cD", 0.02, 0.6), h: num("cH", 0.02, 1),
                    z: num("cZ", 0, 0), color: $("cColor").value, img: $("cImg").value, face: $("cFace").value, wall: $("cWall").checked };
    if ($("cSave").checked) addTemplate("custom", props);
    addItem("custom", props);
  };
  $("importModel").onclick = () => $("modelFile").click();
  $("modelFile").onchange = async () => {
    const f = $("modelFile").files[0]; $("modelFile").value = ""; if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["glb", "gltf", "obj"].includes(ext)) { toast("Use a .glb, .gltf or .obj file."); return; }
    if (f.size > 40e6) { toast("That file is over 40 MB. Simplify the model and try again."); return; }
    toast(`Reading ${f.name}…`);
    try {
      const data = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(f); });
      const id = "m" + Date.now().toString(36), a = { name: f.name.replace(/\.[^.]+$/, "").slice(0, 40), kind: ext === "obj" ? "obj" : "glb", data };
      const A = loadAsset(id, a);
      state.assets[id] = a;
      addTemplate("asset", { asset: id, name: a.name });
      addItem("asset", { asset: id, name: a.name });
      toast(`${a.name}: ${Math.round(A.tris).toLocaleString()} triangles, longest side ${(A.size * A.base).toFixed(2)} m. Use Size to adjust.`);
    } catch (e) { toast("Couldn't import that model: " + (e.message || e)); }
  };
  // resizable, remembered panel width
  (function () {
    const panel = $("panel"), grip = $("grip"); let w0 = 340, x0 = 0;
    const setW = w => { w = Math.round(Math.min(Math.max(260, w), Math.min(640, window.innerWidth - 200))); panel.style.setProperty("--panel-w", w + "px"); try { localStorage.setItem("studio.panelw", w); } catch (e) { } dirty = true; };
    try { const v = +localStorage.getItem("studio.panelw"); if (v) panel.style.setProperty("--panel-w", v + "px"); } catch (e) { }
    grip.addEventListener("pointerdown", e => { grip.setPointerCapture(e.pointerId); w0 = panel.getBoundingClientRect().width; x0 = e.clientX; e.preventDefault(); });
    grip.addEventListener("pointermove", e => { if (grip.hasPointerCapture(e.pointerId)) setW(w0 + (x0 - e.clientX)); });
    grip.addEventListener("keydown", e => { const w = panel.getBoundingClientRect().width; if (e.key === "ArrowLeft") setW(w + 20); else if (e.key === "ArrowRight") setW(w - 20); else return; e.preventDefault(); });
    for (const id of ["secAdd", "secMine"]) { const d = $(id); try { const v = localStorage.getItem("studio." + id); if (v) d.open = v === "1"; } catch (e) { }
      d.addEventListener("toggle", () => { try { localStorage.setItem("studio." + id, d.open ? "1" : "0"); } catch (e) { } }); }
  })();


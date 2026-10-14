  // ================================================================ export: scene.json, GLB, zip
  function dataBytes(uri) { const b64 = uri.slice(uri.indexOf(",") + 1), s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
  const extOf = uri => uri.startsWith("data:image/png") ? "png" : "jpg";
  const lin = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  function buildGLB() {
    const parts = [], views = [], accs = [], images = [], textures = [], texIdx = {}, mats = [], meshes = [], nodes = [];
    let off = 0;
    const view = (bytes, target) => { const pad = (4 - bytes.length % 4) % 4; const v = { buffer: 0, byteOffset: off, byteLength: bytes.length }; if (target) v.target = target; parts.push(bytes); if (pad) parts.push(new Uint8Array(pad)); off += bytes.length + pad; views.push(v); return views.length - 1; };
    const acc = (arr, type) => { const f = new Float32Array(arr), n = type === "VEC3" ? 3 : 2, a = { bufferView: view(new Uint8Array(f.buffer), 34962), componentType: 5126, count: f.length / n, type };
      if (n === 3) { const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (let i = 0; i < f.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], f[i + k]); mx[k] = Math.max(mx[k], f[i + k]); } a.min = mn; a.max = mx; }
      accs.push(a); return accs.length - 1; };
    for (const [mname, b] of Object.entries(batch(allPrims()).batches)) {
      const m = material(mname), P = [], N = [], UV = [], IDX = [], seen = new Map(); if (!b.P.length) continue;
      for (let i = 0, v = 0; i < b.P.length; i += 3, v++) {
        const key = [b.P[i], b.P[i + 1], b.P[i + 2], b.N[i], b.N[i + 1], b.N[i + 2], b.U[v * 2], b.U[v * 2 + 1]].map(x => Math.round(x * 1e4)).join(",");
        let k = seen.get(key);
        if (k === undefined) { k = P.length / 3; seen.set(key, k); P.push(b.P[i], b.P[i + 2], -b.P[i + 1]); N.push(b.N[i], b.N[i + 2], -b.N[i + 1]); UV.push(b.U[v * 2], 1 - b.U[v * 2 + 1]); }
        IDX.push(k);
      }
      const gm = { name: mname, doubleSided: !m.cull, ...(m.cut ? { alphaMode: "MASK", alphaCutoff: 0.5 } : {}), pbrMetallicRoughness: { baseColorFactor: [...m.color.map(lin), 1], metallicFactor: m.metal || 0, roughnessFactor: m.rough ?? 0.6 } };
      if (m.tex && TEX[m.tex]) {
        if (!(m.tex in texIdx)) { images.push({ name: m.tex, mimeType: extOf(TEX[m.tex]) === "png" ? "image/png" : "image/jpeg", bufferView: view(dataBytes(TEX[m.tex])) }); textures.push({ source: images.length - 1, sampler: 0 }); texIdx[m.tex] = textures.length - 1; }
        gm.pbrMetallicRoughness.baseColorTexture = { index: texIdx[m.tex] }; if (m.emit) gm.emissiveTexture = { index: texIdx[m.tex] };
      }
      if (m.emit) { gm.emissiveFactor = m.tex ? [1, 1, 1] : m.color.map(lin); if (m.emit > 1) gm.extensions = { KHR_materials_emissive_strength: { emissiveStrength: m.emit } }; }
      mats.push(gm);
      const ib = new Uint32Array(IDX); accs.push({ bufferView: view(new Uint8Array(ib.buffer), 34963), componentType: 5125, count: ib.length, type: "SCALAR" });
      const ia = accs.length - 1;
      meshes.push({ name: mname, primitives: [{ attributes: { POSITION: acc(P, "VEC3"), NORMAL: acc(N, "VEC3"), TEXCOORD_0: acc(UV, "VEC2") }, indices: ia, material: mats.length - 1 }] });
      nodes.push({ name: mname, mesh: meshes.length - 1 });
    }
    nodes.push({ name: "StructureStudio", children: nodes.map((_, i) => i) });
    const gltf = { asset: { version: "2.0", generator: "Structure Studio" }, extensionsUsed: ["KHR_materials_emissive_strength"], scene: 0, scenes: [{ nodes: [nodes.length - 1] }], nodes, meshes, materials: mats, textures, images,
                   samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }], accessors: accs, bufferViews: views, buffers: [{ byteLength: off }] };
    let js = new TextEncoder().encode(JSON.stringify(gltf)); const jpad = (4 - js.length % 4) % 4;
    if (jpad) { const t = new Uint8Array(js.length + jpad); t.set(js); t.fill(32, js.length); js = t; }
    const total = 12 + 8 + js.length + 8 + off, head = new DataView(new ArrayBuffer(20));
    head.setUint32(0, 0x46546C67, true); head.setUint32(4, 2, true); head.setUint32(8, total, true); head.setUint32(12, js.length, true); head.setUint32(16, 0x4E4F534A, true);
    const bh = new DataView(new ArrayBuffer(8)); bh.setUint32(0, off, true); bh.setUint32(4, 0x004E4942, true);
    return concat([new Uint8Array(head.buffer), js, new Uint8Array(bh.buffer), ...parts]);
  }
  function concat(arrs) { const n = arrs.reduce((s, a) => s + a.length, 0), o = new Uint8Array(n); let p = 0; for (const a of arrs) { o.set(a, p); p += a.length; } return o; }
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u) { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(files) {
    const enc = new TextEncoder(), local = [], central = []; let off = 0;
    for (const f of files) {
      const name = enc.encode(f.name), data = typeof f.data === "string" ? enc.encode(f.data) : f.data, crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30)); h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true);
      local.push(new Uint8Array(h.buffer), name, data);
      const c = new DataView(new ArrayBuffer(46)); c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
      c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, name.length, true); c.setUint32(42, off, true);
      central.push(new Uint8Array(c.buffer), name); off += 30 + name.length + data.length;
    }
    const cd = concat(central), e = new DataView(new ArrayBuffer(22)); e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
    e.setUint32(12, cd.length, true); e.setUint32(16, off, true);
    return new Blob([...local, cd, new Uint8Array(e.buffer)], { type: "application/zip" });
  }
  // downloads: through the viewer's save prompt when available, a normal browser download otherwise
  let dlCap = null;
  try { window.claude?.use?.("downloads").then(x => { dlCap = x; }).catch(() => { }); } catch (e) { }
  async function saveFile(filename, blob) {
    if (dlCap) {
      try { await dlCap.save({ filename, data: blob }); toast(`Saved ${filename}`); }
      catch (e) { toast(e && e.code === "declined" ? "Download cancelled" : `Couldn't save ${filename}: ${e && e.message || e}`); }
      return;
    }
    if (window.claude) { toast("Downloads aren't available in this view."); return; }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast(`Saved ${filename}`);
  }

  let toastT = 0;
  function toast(msg) { const t = $("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600); }


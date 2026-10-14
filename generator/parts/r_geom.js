  // ================================================================ geometry
  const GEO = {};
  // box with rounded (bevelled) edges: sample each face on a grid that's dense near the edges,
  // then project points in the edge zone onto a sphere of radius b around the inner box -> smooth CAD-like fillets
  function rboxGeo(sx, sy, sz, b) {
    const key = `rb${sx.toFixed(3)},${sy.toFixed(3)},${sz.toFixed(3)},${b.toFixed(4)}`;
    if (GEO[key]) return GEO[key];
    const h = [sx / 2, sy / 2, sz / 2]; b = Math.min(b, ...h.map(v => v * 0.98));
    const P = [], N = [], U = [], UM = [], seg = 2;
    const coords = H => { if (b < 1e-4) return [-H, H]; const a = []; for (let k = 0; k <= seg; k++) a.push(-H + b * (1 - Math.cos(k / seg * Math.PI / 2)) / 1 * (k === seg ? 1 : 1));
      const fixed = a.map((v, k) => -H + b * (k / seg)); const r = fixed.slice(); for (let k = seg; k >= 0; k--) r.push(H - b * (k / seg)); return r.filter((v, i, arr) => i === 0 || Math.abs(v - arr[i - 1]) > 1e-6); };
    const faces = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[-1, 0, 0], [0, -1, 0], [0, 0, 1]], [[0, 1, 0], [-1, 0, 0], [0, 0, 1]],
                   [[0, -1, 0], [1, 0, 0], [0, 0, 1]], [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [1, 0, 0], [0, -1, 0]]];
    const inner = h.map(v => Math.max(0, v - b));
    for (const [n, u, v] of faces) {
      const ax = k => k[0] ? 0 : k[1] ? 1 : 2;
      const au = ax(u), av = ax(v), an = ax(n), su = u[au], sv = v[av], sn = n[an];
      const cu = coords(h[au]), cv = coords(h[av]), grid = [];
      for (let j = 0; j < cv.length; j++) for (let i = 0; i < cu.length; i++) {
        const p = [0, 0, 0]; p[au] = cu[i] * su; p[av] = cv[j] * sv; p[an] = h[an] * sn;
        const q = p.map((c, k) => Math.max(-inner[k], Math.min(inner[k], c)));
        let d = p.map((c, k) => c - q[k]), l = Math.hypot(...d);
        if (l < 1e-9) { d = n.slice(); l = 1; }
        const nn = d.map(c => c / l);
        grid.push({ p: b < 1e-4 ? p : q.map((c, k) => c + nn[k] * b), n: b < 1e-4 ? n : nn, uv: [(cu[i] / h[au] + 1) / 2, (cv[j] / h[av] + 1) / 2], um: [cu[i] * su + h[au], cv[j] * sv + h[av]] });
      }
      const W = cu.length;
      for (let j = 0; j < cv.length - 1; j++) for (let i = 0; i < W - 1; i++) {
        const A = grid[j * W + i], B = grid[j * W + i + 1], C = grid[(j + 1) * W + i + 1], Dd = grid[(j + 1) * W + i];
        for (const V of [A, B, C, A, C, Dd]) { P.push(...V.p); N.push(...V.n); U.push(...V.uv); UM.push(...V.um); }
      }
    }
    return (GEO[key] = { P, N, U, UM });
  }
  function cylGeo(seg) {
    const key = "cy" + seg; if (GEO[key]) return GEO[key];
    const P = [], N = [], U = [];
    for (let i = 0; i < seg; i++) {
      const a0 = i / seg * 2 * Math.PI, a1 = (i + 1) / seg * 2 * Math.PI, c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      const v = [[c0, s0, -.5], [c1, s1, -.5], [c1, s1, .5], [c0, s0, -.5], [c1, s1, .5], [c0, s0, .5]];
      const n = [[c0, s0, 0], [c1, s1, 0], [c1, s1, 0], [c0, s0, 0], [c1, s1, 0], [c0, s0, 0]];
      for (let k = 0; k < 6; k++) { P.push(...v[k]); N.push(...n[k]); U.push(0, 0); }
      P.push(0, 0, .5, c0, s0, .5, c1, s1, .5); N.push(0, 0, 1, 0, 0, 1, 0, 0, 1); U.push(0, 0, 0, 0, 0, 0);
      P.push(0, 0, -.5, c1, s1, -.5, c0, s0, -.5); N.push(0, 0, -1, 0, 0, -1, 0, 0, -1); U.push(0, 0, 0, 0, 0, 0);
    }
    return (GEO[key] = { P, N, U });
  }
  function sphGeo() {
    if (GEO.sph) return GEO.sph;
    const P = [], N = [], U = [], la = 10, lo = 16, pt = (i, j) => { const th = i / la * Math.PI, ph = j / lo * 2 * Math.PI; return [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)]; };
    for (let i = 0; i < la; i++) for (let j = 0; j < lo; j++) {
      const a = pt(i, j), b = pt(i + 1, j), c = pt(i + 1, j + 1), d = pt(i, j + 1);
      for (const v of [a, b, c, a, c, d]) { P.push(...v); N.push(...v); U.push(0, 0); }
    }
    return (GEO.sph = { P, N, U });
  }
  function planeGeo(us, vs) { return { P: [-.5, -.5, 0, .5, -.5, 0, .5, .5, 0, -.5, -.5, 0, .5, .5, 0, -.5, .5, 0], N: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], U: [0, 0, us, 0, us, vs, 0, 0, us, vs, 0, vs] }; }

  function meshInto(p, batches, boxes) {
    const A = ASSETS[p.asset]; if (!A) return;
    const k = p.k.map(v => v * A.base), Rz = M.rz(p.rz * D2R);
    const m = M.mul(M.trans(...p.p), M.mul(Rz, M.mul(M.scale(...k), M.trans(...A.off))));
    const bb = boxes[p.item] || (boxes[p.item] = { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] });
    for (const sub of A.subs) {
      const b = batches[sub.mat] || (batches[sub.mat] = { P: [], N: [], U: [] });
      for (const i of sub.idx) {
        const v = M.apply(m, [sub.P[i * 3], sub.P[i * 3 + 1], sub.P[i * 3 + 2]], 1); b.P.push(v[0], v[1], v[2]);
        let n = M.apply(Rz, [sub.N[i * 3] / k[0], sub.N[i * 3 + 1] / k[1], sub.N[i * 3 + 2] / k[2]], 0); const l = Math.hypot(...n) || 1;
        b.N.push(n[0] / l, n[1] / l, n[2] / l); b.U.push(sub.U ? sub.U[i * 2] : 0, sub.U ? sub.U[i * 2 + 1] : 0);
        for (let q = 0; q < 3; q++) { if (v[q] < bb.min[q]) bb.min[q] = v[q]; if (v[q] > bb.max[q]) bb.max[q] = v[q]; }
      }
    }
  }

  // ================================================================ 3D model import (.glb / .gltf with embedded data / .obj)
  const ASSETS = {};
  function quatMat(q) { const [x, y, z, w] = q; return [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 0, 2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 0, 2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y), 0, 0, 0, 0, 1]; }
  function computeNormals(P, idx) {
    const N = new Float32Array(P.length);
    for (let t = 0; t < idx.length; t += 3) {
      const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]], A = [P[a * 3], P[a * 3 + 1], P[a * 3 + 2]], B = [P[b * 3], P[b * 3 + 1], P[b * 3 + 2]], C = [P[c * 3], P[c * 3 + 1], P[c * 3 + 2]];
      const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v = [C[0] - A[0], C[1] - A[1], C[2] - A[2]], n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      for (const i of [a, b, c]) for (let q = 0; q < 3; q++) N[i * 3 + q] += n[q];
    }
    for (let i = 0; i < N.length; i += 3) { const l = Math.hypot(N[i], N[i + 1], N[i + 2]) || 1; N[i] /= l; N[i + 1] /= l; N[i + 2] /= l; }
    return N;
  }
  const yUpToZUp = (A, n) => { for (let i = 0; i < A.length; i += n) { const y = A[i + 1], z = A[i + 2]; A[i + 1] = -z; A[i + 2] = y; } };
  function parseGLB(buf, id) {
    const dv = new DataView(buf); let json, bin = null;
    if (dv.getUint32(0, true) === 0x46546C67) {
      for (let o = 12; o < buf.byteLength;) { const len = dv.getUint32(o, true), type = dv.getUint32(o + 4, true), chunk = buf.slice(o + 8, o + 8 + len);
        if (type === 0x4E4F534A) json = JSON.parse(new TextDecoder().decode(chunk)); else if (type === 0x004E4942) bin = chunk; o += 8 + len; }
    } else json = JSON.parse(new TextDecoder().decode(buf));
    const buffers = (json.buffers || []).map(b => b.uri ? (b.uri.startsWith("data:") ? dataBytes(b.uri).buffer : null) : bin);
    if (buffers.some(b => !b)) throw new Error("This .gltf points to separate files. Export it as a single .glb instead.");
    const SIZE = { 5126: 4, 5125: 4, 5123: 2, 5122: 2, 5121: 1, 5120: 1 }, NUM = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
    function read(ai) {
      const a = json.accessors[ai], n = NUM[a.type], out = new Float32Array(a.count * n); if (a.bufferView === undefined) return out;
      const v = json.bufferViews[a.bufferView], cs = SIZE[a.componentType], stride = v.byteStride || cs * n;
      const d = new DataView(buffers[v.buffer], (v.byteOffset || 0) + (a.byteOffset || 0));
      for (let i = 0; i < a.count; i++) for (let k = 0; k < n; k++) {
        const o = i * stride + k * cs; let x;
        switch (a.componentType) { case 5126: x = d.getFloat32(o, true); break; case 5125: x = d.getUint32(o, true); break;
          case 5123: x = d.getUint16(o, true); if (a.normalized) x /= 65535; break; case 5122: x = d.getInt16(o, true); if (a.normalized) x = Math.max(x / 32767, -1); break;
          case 5121: x = d.getUint8(o); if (a.normalized) x /= 255; break; default: x = d.getInt8(o); if (a.normalized) x = Math.max(x / 127, -1); }
        out[i * n + k] = x;
      }
      return out;
    }
    const imgURI = {};
    function texFor(mat) {
      const t = mat && mat.pbrMetallicRoughness && mat.pbrMetallicRoughness.baseColorTexture; if (!t) return null;
      const src = json.textures[t.index].source, im = json.images[src]; if (imgURI[src]) return imgURI[src];
      let uri = im.uri && im.uri.startsWith("data:") ? im.uri : null;
      if (!uri && im.bufferView !== undefined) { const v = json.bufferViews[im.bufferView], bytes = new Uint8Array(buffers[v.buffer], v.byteOffset || 0, v.byteLength);
        let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
        uri = `data:${im.mimeType || "image/png"};base64,` + btoa(s); }
      if (!uri) return null;
      const key = `asset_${id}_${src}`; TEX[key] = uri; EMIT[key] = 0; return (imgURI[src] = key);
    }
    const subs = [], matKeys = {};
    function matName(mi) {
      if (matKeys[mi]) return matKeys[mi];
      const mt = (json.materials || [])[mi] || {}, pbr = mt.pbrMetallicRoughness || {}, f = pbr.baseColorFactor || [0.7, 0.7, 0.7, 1];
      const name = `asset:${id}:${mi ?? "d"}`, tex = texFor(mt);
      ASSET_MATS[name] = { color: f.slice(0, 3).map(c => Math.pow(c, 1 / 2.2)), metal: pbr.metallicFactor ?? (tex ? 0 : 0.2), rough: pbr.roughnessFactor ?? 0.6, tex: tex || undefined, cull: false };
      return (matKeys[mi] = name);
    }
    function visit(ni, parent) {
      const node = json.nodes[ni];
      let local = node.matrix ? node.matrix.slice() : M.mul(M.trans(...(node.translation || [0, 0, 0])), M.mul(quatMat(node.rotation || [0, 0, 0, 1]), M.scale(...(node.scale || [1, 1, 1]))));
      const world = M.mul(parent, local);
      if (node.mesh !== undefined) for (const pr of json.meshes[node.mesh].primitives) {
        if (pr.mode !== undefined && pr.mode !== 4) continue;
        const P0 = read(pr.attributes.POSITION), cnt = P0.length / 3;
        const idx = pr.indices !== undefined ? Array.from(read(pr.indices)) : Array.from({ length: cnt }, (_, i) => i);
        const P = new Float32Array(P0.length);
        for (let i = 0; i < cnt; i++) { const v = M.apply(world, [P0[i * 3], P0[i * 3 + 1], P0[i * 3 + 2]], 1); P.set(v, i * 3); }
        let N;
        if (pr.attributes.NORMAL !== undefined) { const N0 = read(pr.attributes.NORMAL); N = new Float32Array(N0.length);
          for (let i = 0; i < cnt; i++) { const v = M.apply(world, [N0[i * 3], N0[i * 3 + 1], N0[i * 3 + 2]], 0), l = Math.hypot(...v) || 1; N.set(v.map(x => x / l), i * 3); } }
        else N = computeNormals(P, idx);
        let U = pr.attributes.TEXCOORD_0 !== undefined ? read(pr.attributes.TEXCOORD_0) : null;
        if (U) for (let i = 1; i < U.length; i += 2) U[i] = 1 - U[i];
        yUpToZUp(P, 3); yUpToZUp(N, 3);
        subs.push({ P, N, U, idx, mat: matName(pr.material) });
      }
      for (const c of node.children || []) visit(c, world);
    }
    const sc = (json.scenes || [])[json.scene || 0];
    const roots = sc ? sc.nodes : (json.nodes || []).map((_, i) => i);
    for (const r of roots) visit(r, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    return subs;
  }
  function parseOBJ(text, id) {
    const v = [], vt = [], vn = [], P = [], U = [], N = [], idx = []; let hasN = true;
    for (const raw of text.split(/\r?\n/)) {
      const l = raw.trim(); if (!l || l[0] === "#") continue;
      const t = l.split(/\s+/), k = t[0];
      if (k === "v") v.push([+t[1], +t[2], +t[3]]); else if (k === "vt") vt.push([+t[1], +(t[2] || 0)]); else if (k === "vn") vn.push([+t[1], +t[2], +t[3]]);
      else if (k === "f") {
        const corners = t.slice(1).map(c => c.split("/").map(x => x === "" ? NaN : parseInt(x)));
        const res = (i, arr) => isNaN(i) ? null : arr[i < 0 ? arr.length + i : i - 1];
        for (let j = 1; j + 1 < corners.length; j++) for (const c of [corners[0], corners[j], corners[j + 1]]) {
          const pv = res(c[0], v); if (!pv) continue; const uv = res(c[1], vt), nv = res(c[2], vn);
          idx.push(P.length / 3); P.push(...pv); U.push(uv ? uv[0] : 0, uv ? uv[1] : 0); if (nv) N.push(...nv); else { hasN = false; N.push(0, 0, 0); }
        }
      }
    }
    if (!P.length) throw new Error("No faces found in that .obj file.");
    const Pf = new Float32Array(P), Nf = hasN ? new Float32Array(N) : computeNormals(Pf, idx);
    yUpToZUp(Pf, 3); yUpToZUp(Nf, 3);
    const name = `asset:${id}:0`; ASSET_MATS[name] = { color: [0.62, 0.64, 0.66], rough: 0.55, metal: 0.1 };
    return [{ P: Pf, N: Nf, U: new Float32Array(U), idx, mat: name }];
  }
  function loadAsset(id, a) {
    if (ASSETS[id]) return ASSETS[id];
    const bytes = dataBytes(a.data);
    const subs = a.kind === "obj" ? parseOBJ(new TextDecoder().decode(bytes), id) : parseGLB(bytes.buffer, id);
    let tris = 0; const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    for (const s of subs) { tris += s.idx.length / 3; for (let i = 0; i < s.P.length; i += 3) for (let q = 0; q < 3; q++) { mn[q] = Math.min(mn[q], s.P[i + q]); mx[q] = Math.max(mx[q], s.P[i + q]); } }
    if (!subs.length || !isFinite(mn[0])) throw new Error("That file has no triangle meshes.");
    if (tris > 800000) throw new Error(`That model has ${Math.round(tris / 1000)}k triangles; simplify it below 800k (Blender: Decimate modifier).`);
    const size = Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) || 1;
    // files are often in cm or mm: pick a sensible starting size, the Size controls refine it
    const base = a.base || (size > 20 ? 1.5 / size : size < 0.05 ? 1 / size : 1);
    a.base = base;
    return (ASSETS[id] = { subs, base, off: [-(mn[0] + mx[0]) / 2, -(mn[1] + mx[1]) / 2, -mn[2]], size, tris });
  }
  function loadAllAssets() {
    for (const [id, a] of Object.entries(state.assets || {})) {
      try { loadAsset(id, a); } catch (e) { console.warn("model", id, e); }
    }
  }


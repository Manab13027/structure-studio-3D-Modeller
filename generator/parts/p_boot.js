  window.__vp = () => VP;
  window.__studio = { scene: () => sceneJSON(), glb: () => buildGLB(), tex: k => TEX[k], state: () => state, view, cam,
    items: () => state.items.map(i => ({ id: i.id, type: i.type, x: i.x, y: i.y, rot: i.rot, b: i.b, f: i.f, seg: i.seg, t: i.t, host: i.host, props: i.props, n: (itemPrims[i.id] || []).length, bb: itemBoxes[i.id] })),
    project: (x, y, z) => { const v = M.apply(VP, [x, y, z], 1), w = VP[3] * x + VP[7] * y + VP[11] * z + VP[15], r = canvas.getBoundingClientRect(); return [r.left + (v[0] / w + 1) / 2 * r.width, r.top + (1 - v[1] / w) / 2 * r.height]; },
    selected: () => selected, itemZ: id => itemZ(state.items.find(i => i.id === id)),
    rebuild: () => { rebuild(); renderAll(); }, addItem: (t, p) => addItem(t, p),
    redraw: () => { dirty = true; render(); }, setCut, setLevel, fitView, select: id => select(id), setActiveBuilding, edit: on => { if (editing !== on) $("editBtn").click(); },
    loadTemplate: k => { view.ab = null; view.upTo = 99; view.af = 0; adopt(TEMPLATES[k].make()); lastCommitted = snapshot(); afterLoad(); fitView(); } };

  // ================================================================ boot
  makeStaticTextures();
  adopt(load()); lastCommitted = snapshot();
  renderChips(); renderCatalog(); rebuild(); renderAll(); fillImgSelect($("cImg"), "");
  fitView();
  document.fonts && document.fonts.ready.then(() => { for (const k in signCache) delete signCache[k]; rebuild(); });
  requestAnimationFrame(frame);
})();
</script>

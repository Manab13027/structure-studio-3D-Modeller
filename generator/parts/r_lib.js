  function libraryOptions(current) {
    const groups = [["Maps", LIB.filter(l => l.kind === "map")], ["Displays", LIB.filter(l => l.kind === "screen")], ["Pictures", LIB.filter(l => l.kind === "pic")],
                    ["Your images", Object.entries((state && state.custom) || {}).map(([key, v]) => ({ key, label: v.label }))]];
    return groups.filter(([, ls]) => ls.length).map(([g, ls]) => `<optgroup label="${g}">` + ls.map(l =>
      `<option value="${l.key}"${l.key === current ? " selected" : ""}>${esc(l.label)}</option>`).join("") + "</optgroup>").join("");
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function renderPick() {
    const counts = {};
    $("pick").innerHTML = `<option value="">Select an item…</option>` + state.items.map(it => {
      counts[it.type] = (counts[it.type] || 0) + 1;
      return `<option value="${it.id}"${it.id === selected ? " selected" : ""}>${esc(labelOf(it))} ${counts[it.type]}</option>`;
    }).join("");
  }
  $("pick").onchange = () => select($("pick").value || null);


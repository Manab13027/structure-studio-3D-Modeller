  // ================================================================ dynamic textures (sign text, uploads)
  const signCache = {};
  function signKey(text) {
    text = (text || "").trim().toUpperCase() || " ";
    if (signCache[text]) return signCache[text];
    let h = 0; for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const key = "sign_" + h.toString(36);
    const c = document.createElement("canvas"); c.width = 2048; c.height = 256; const x = c.getContext("2d");
    x.fillStyle = "#18201e"; x.fillRect(0, 0, 2048, 256);
    x.strokeStyle = "#96875a"; x.lineWidth = 6; x.strokeRect(20, 20, 2008, 216);
    let size = 120; x.font = `700 ${size}px "Saira Condensed", "Arial Narrow", sans-serif`;
    while (x.measureText(text).width > 1900 && size > 30) { size -= 4; x.font = `700 ${size}px "Saira Condensed", "Arial Narrow", sans-serif`; }
    x.fillStyle = "#d6c896"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, 1024, 132);
    TEX[key] = c.toDataURL("image/jpeg", 0.9); EMIT[key] = 0.2; signCache[text] = key;
    return key;
  }
  function registerCustom(custom) {
    for (const [key, v] of Object.entries(custom || {})) { TEX[key] = v.data; EMIT[key] = 1.0; }
  }

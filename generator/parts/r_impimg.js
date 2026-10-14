  async function importImage(file) {
    const url = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const s = Math.min(1, 2048 / Math.max(img.width, img.height)), c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.width * s)); c.height = Math.max(1, Math.round(img.height * s));
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    const key = "custom_" + Date.now().toString(36);
    state.custom[key] = { label: file.name.replace(/\.[^.]+$/, "").slice(0, 40), data: c.toDataURL("image/jpeg", 0.88) };
    registerCustom({ [key]: state.custom[key] });
    return key;
  }

"""Regenerate scene.json + structure_studio.glb (+ generated finish textures) for a template by running the editor headless.
Needs: pip install playwright && playwright install chromium.   Usage: python export_default.py [house|facility|opsroom|blank]"""
import asyncio, base64, json, os, pathlib, sys, tempfile
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
TPL = sys.argv[1] if len(sys.argv) > 1 else "house"

async def main():
    html = (ROOT / "viewer" / "structure_studio.html").read_text()
    page = pathlib.Path(tempfile.mkdtemp()) / "editor.html"
    page.write_text('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + "</body></html>")
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        pg = await b.new_page(viewport={"width": 900, "height": 640})
        await pg.goto(page.as_uri()); await pg.wait_for_timeout(2500)
        await pg.evaluate(f"() => window.__studio.loadTemplate('{TPL}')"); await pg.wait_for_timeout(800)
        scene = await pg.evaluate("() => window.__studio.scene()")
        design = await pg.evaluate("() => JSON.stringify(window.__studio.state())")
        glb = await pg.evaluate("() => { const u = window.__studio.glb(); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }")
        missing = {}
        for m in scene["materials"].values():
            k = m.get("tex")
            if k and not any((ROOT / "textures" / (k + e)).exists() for e in (".png", ".jpg")):
                missing[k] = await pg.evaluate("k => window.__studio.tex(k)", k)
        await b.close()
    for k, uri in missing.items():   # finishes, signs, TV picture... drawn inside the page
        if not uri: continue
        ext = "png" if uri.startswith("data:image/png") else "jpg"
        (ROOT / "textures" / f"{k}.{ext}").write_bytes(base64.b64decode(uri.split(",", 1)[1]))
    (ROOT / "scene.json").write_text(json.dumps(scene, separators=(",", ":")))
    (ROOT / "design.json").write_text(design)
    (ROOT / "structure_studio.glb").write_bytes(base64.b64decode(glb))
    print(f"{TPL}: scene.json {len(scene['prims'])} parts; structure_studio.glb {os.path.getsize(ROOT / 'structure_studio.glb') / 1e6:.1f} MB; {len(missing)} textures written")

asyncio.run(main())

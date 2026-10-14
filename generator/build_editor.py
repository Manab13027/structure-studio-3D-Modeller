"""Assemble Structure Studio: parts -> one self-contained HTML page (textures + Blender script embedded)."""
import base64, io, json, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARTS = os.path.join(ROOT, "generator", "parts")
ORDER = ["r_catalog", "p_core", "p_cat2", "p_nature", "p_home", "r_dyntex", "p_poly", "p_state", "r_math", "r_geom", "r_gl", "p_render", "p_input",
         "r_mine", "r_lib", "r_insp", "r_impimg", "p_ui", "r_export"]
LIB = [  # pictures people can choose for screens, maps and boards (all fictional)
    ("tactical_map", "Tactical map (exercise area)", "map", 0.8), ("wall_topo", "Theatre topographic map", "map", 0.25),
    ("wall_world", "Strategic AOR map", "map", 0.25), ("cop_main", "Common operational picture", "map", 1.4),
    ("radar_wide", "Air surveillance radar", "screen", 1.4), ("isr_feed", "ISR drone feed", "screen", 1.4),
    ("force_status", "Force status board", "screen", 1.4), ("sync_matrix", "Synchronisation matrix", "screen", 1.4),
    ("console_0", "Console: map view A", "screen", 1.2), ("console_4", "Console: map view B", "screen", 1.2),
    ("console_1", "Console: radar A", "screen", 1.2), ("console_5", "Console: radar B", "screen", 1.2),
    ("console_2", "Console: status A", "screen", 1.2), ("console_6", "Console: status B", "screen", 1.2),
    ("console_3", "Console: message log A", "screen", 1.2), ("console_7", "Console: message log B", "screen", 1.2),
    ("whiteboard", "Whiteboard: task list", "screen", 0.2),
    ("clocks", "Clocks", "internal", 1.6), ("rack", "Rack LEDs", "internal", 1.0), ("floor", "Floor", "internal", 0.0),
    ("keys", "Keyboard", "internal", 0.0), ("exit", "Exit sign", "internal", 2.0), ("sign", "Sign", "internal", 0.2),
]
tex = {}
for key, _, _, _ in LIB:
    im = Image.open(os.path.join(ROOT, "textures", key + ".png")).convert("RGB")
    if max(im.size) > 1600:
        im.thumbnail((1600, 1600))
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=86, optimize=True)
    tex[key] = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
lib = [{"key": k, "label": l, "kind": kind, "emit": e} for k, l, kind, e in LIB]
prelude = """<script>
const LIB = /*LIB*/[];
const TEX = /*TEX*/{};
const BLENDER_PY = /*BLENDER*/"";
(function () {
  "use strict";
  const D2R = Math.PI / 180;
  const $ = id => document.getElementById(id);
  const canvas = $("c");
  const gl = canvas.getContext("webgl2", { antialias: true, preserveDrawingBuffer: true });
  if (!gl) { $("err").textContent = "This browser can't show WebGL 2 graphics."; $("err").hidden = false; return; }
"""
read = lambda n: open(os.path.join(PARTS, n)).read()
html = read("head.html") + "\n" + prelude + "".join(read(n + ".js") + "\n" for n in ORDER) + read("p_boot.js")
blender = open(os.path.join(ROOT, "build_scene.py")).read()
html = html.replace("/*LIB*/[]", json.dumps(lib)).replace("/*TEX*/{}", json.dumps(tex))
html = html.replace('/*BLENDER*/""', json.dumps(blender).replace("<", "\\u003c"))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "viewer", "structure_studio.html")
open(out, "w").write(html)
print(out, f"{len(html) / 1e6:.2f} MB")

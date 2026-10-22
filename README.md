# Structure Studio

Design houses, offices, facilities and whole sites in 3D, then build them in Blender.
The web editor runs in any browser; the Blender script turns your design into a real
scene (`.blend`), a `.glb` model, an isometric render and an optional 360 video.

## Quick start (Mac)

1. Open `viewer/structure_studio.html` in Chrome or Safari (or use the published artifact link).
2. Click **Edit**, design, then **Download Blender kit (.zip)**. It lands in `~/Downloads`.
3. Double-click `run_all.command` (or run `./run_all.sh` in Terminal).
   It finds Blender (offers `brew install --cask blender` if missing), picks up the newest
   `structure_studio_kit*.zip` from Downloads, builds the scene, renders a still and opens
   everything. Add `--turntable` for the 360 video.

Options: `./run_all.sh --turntable`, `--no-render`, `--default` (ignore kits, build the
included family house), `--no-open`, `--blender /path/to/Blender`, or pass a kit zip path.

## What you can do in the editor

- **Templates** (Project): family house, secure facility, operations room, blank site.
- **Buildings**: any number; each has floors, floor-to-floor height, wall thickness,
  outline shape (rectangle, L, T, U, angled, hexagon, octagon or your own corners at any
  angle), outside finish (brick, render, concrete, stone, timber, metal), inside paint,
  floor finish per floor, and a roof (none, flat with parapet, gable, hip, mono-pitch)
  with pitch, overhang and covering. Pitched roofs follow L / T / U plans.
  **Edit corners & move**: drag corners, click a wall's mid marker to add a corner,
  drag inside the outline to move the building with everything in it.
- **Levels**: the Level buttons show the building up to a floor and choose the floor new
  objects go on. **Inside / Outside** switches between the cut-away view and the full
  exterior with roofs.
- **Add**: about 170 objects in categories with search: structure; living (corner sofa,
  recliner, sideboard, wall TV, fireplace, piano, aquarium, curtains...); lighting & air
  (ceiling lights, pendants, fans, AC, radiators, geyser); bedroom (bunk bed, cot, dresser,
  dressing table, study desk); kitchen & dining (island, cooker, dishwasher, microwave,
  round table); bath & laundry (double vanity, mirror cabinet, towel rail, washer, dryer);
  plants & trees; garden & outdoor (patio set, BBQ, pool, swing, slide, trampoline, fire pit,
  kennel...); office; ops & security; site & roads; infrastructure; large structures.
- **Plants and trees** are built like game foliage: tapered trunks and branches with bark,
  and painted leaf cards cut out around each leaf (oak, autumn maple, birch, fir, palm,
  shrubs, flowering shrubs, grasses, flower beds, monstera, fiddle-leaf fig, snake plant,
  indoor palm, flower pots). Each tree is slightly different.
  Stairs cut a hole in the floor above. Doors, windows and garage doors cut openings in
  building walls and drawn walls.
- **Moving things**: drag anywhere; objects may overlap. **Alt/Option-drag** (or `[` `]`,
  PgUp/PgDn) moves the selected object up and down; *Rest on object below* stacks it on
  whatever is under it (e.g. a container on a container, a TV on a cabinet). Wall items can
  be set to *Place freely* to unstick them from walls. Grid snapping is optional.
- **Draw**: interior walls, boundary walls, fences, hedges, roads, footpaths and bridges,
  chained at any angle (15° snapping optional).
- **My items**: your own boxes / cylinders / panels with pictures, and imported `.glb`/`.obj` models.
- **Save file / Open file** keep a design as JSON; layouts from the earlier ops-room editor open too.

Keys (edit mode): R rotate, D duplicate, Delete remove, arrows nudge, Ctrl/Cmd+Z undo.

## In Blender

Each building floor, roof, the site and each object group is its own collection.
Hide a "... - Roof" collection to look inside. Press Space for the turntable.
The camera `IsoCam` is a true isometric orthographic camera.

## Files

- `viewer/structure_studio.html` – the editor (self-contained).
- `build_scene.py` – Blender builder (Blender 3.6 – 4.x). Reads `scene.json` + `textures/`.
- `scene.json`, `structure_studio.glb`, `design.json` – the default family-house design.
- `run_all.sh`, `run_all.command` – one-click build on macOS.
- `generator/` – sources. `python3 generator/build_editor.py` rebuilds the editor;
  `python3 generator/export_default.py house|facility|opsroom|blank` re-exports the default scene.

All maps, screens and names are fictional.

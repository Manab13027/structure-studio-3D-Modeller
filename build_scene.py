"""
Structure Studio - Blender scene builder
========================================
Builds the design you made in the Structure Studio web editor (buildings with floors,
walls, doors, windows, roofs, furniture, site, roads, infrastructure) from scene.json
+ textures/ that sit next to this script.

HOW TO RUN (Blender 3.6 - 4.x)
  A) In Blender: Scripting workspace > Open > build_scene.py > Run Script (Alt+P)
  B) Terminal:   blender --python build_scene.py
     Headless, also render a still:          blender -b --python build_scene.py -- --render
     ...and a 360 turntable video:           blender -b --python build_scene.py -- --render --turntable
  C) One go (macOS): double-click run_all.command

RESULT
  * One collection per building floor, roof, site and object group: hide "<building> - Roof"
    (eye icon in the Outliner) to look inside.
  * Everything hangs off the empty "Studio_Turntable": press Space for a 360 degree turntable.
  * Camera "IsoCam" is a true isometric orthographic camera framing the whole design.
  * Saves structure_studio.blend and exports structure_studio.glb next to this script.
"""
import json
import math
import os
import sys

import bpy
from mathutils import Euler, Matrix, Vector

TURNTABLE_FRAMES = 240
TAG = "[studio]"


def find_base():
    cands = []
    try:
        cands.append(os.path.dirname(os.path.abspath(__file__)))
    except NameError:
        pass
    for t in bpy.data.texts:
        if t.filepath:
            cands.append(os.path.dirname(bpy.path.abspath(t.filepath)))
    if bpy.data.filepath:
        cands.append(os.path.dirname(bpy.data.filepath))
    cands.append(os.getcwd())
    for c in cands:
        for d in (c, os.path.dirname(c)):
            if os.path.isfile(os.path.join(d, "scene.json")) and os.path.isdir(os.path.join(d, "textures")):
                return d
    raise RuntimeError("Could not find scene.json and textures/ - keep them in the same folder as this script. "
                       f"Looked in: {cands}")


BASE = find_base()
SPEC = json.load(open(os.path.join(BASE, "scene.json")))
print(f"{TAG} data folder: {BASE}  ({len(SPEC['prims'])} parts)")


def lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def set_input(node, names, value):
    for n in names:
        if n in node.inputs:
            node.inputs[n].default_value = value
            return node.inputs[n]
    return None


def get_input(node, names):
    for n in names:
        if n in node.inputs:
            return node.inputs[n]
    return None


def clear_scene():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for coll in list(bpy.data.collections):
        bpy.data.collections.remove(coll)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras, bpy.data.images):
        for b in list(block):
            if b.users == 0:
                block.remove(b)


def tex_path(name):
    for ext in (".jpg", ".png", ".jpeg", ".webp"):
        p = os.path.join(BASE, "textures", name + ext)
        if os.path.isfile(p):
            return p
    return None


# ------------------------------------------------------------------ materials
def make_material(name, m):
    mat = bpy.data.materials.new("S_" + name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    col = m.get("color", [0.8, 0.8, 0.8])
    set_input(bsdf, ["Base Color"], (lin(col[0]), lin(col[1]), lin(col[2]), 1.0))
    set_input(bsdf, ["Roughness"], m.get("rough", 0.6))
    set_input(bsdf, ["Metallic"], m.get("metal", 0.0))
    emit = m.get("emit", 0.0)
    emit_in = get_input(bsdf, ["Emission Color", "Emission"])
    tp = tex_path(m["tex"]) if m.get("tex") else None
    if tp:
        img = bpy.data.images.load(tp, check_existing=True)
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = img
        tex.interpolation = "Cubic"
        tex.extension = "REPEAT" if m.get("tile") else "EXTEND"
        tex.location = (-400, 200)
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
        if emit and emit_in is not None:
            nt.links.new(tex.outputs["Color"], emit_in)
        if m.get("cut") and "Alpha" in bsdf.inputs:          # leaf cards: cut out around the painted leaves
            nt.links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
            for attr, val in (("blend_method", "CLIP"), ("shadow_method", "CLIP"), ("alpha_threshold", 0.5), ("surface_render_method", "DITHERED")):
                if hasattr(mat, attr):
                    try:
                        setattr(mat, attr, val)
                    except Exception:
                        pass
    elif emit and emit_in is not None:
        emit_in.default_value = (lin(col[0]), lin(col[1]), lin(col[2]), 1.0)
    if emit:
        set_input(bsdf, ["Emission Strength"], emit)
    if m.get("cull"):
        mat.use_backface_culling = True
    mat.diffuse_color = (lin(col[0]), lin(col[1]), lin(col[2]), 1.0)
    return mat


# ------------------------------------------------------------------ geometry, merged per (group, material) so big sites stay fast
class Bucket:
    def __init__(self):
        self.v, self.f, self.uv, self.smooth, self.bevel = [], [], [], [], []

    def add(self, verts, faces, uvs, smooth=False):
        o = len(self.v)
        self.v.extend(verts)
        for k, f in enumerate(faces):
            self.f.append(tuple(i + o for i in f))
            self.uv.append(uvs[k] if uvs else [(0.0, 0.0)] * len(f))
            self.smooth.append(smooth)


def xform(p, rot):
    R = Euler(tuple(math.radians(a) for a in rot), "XYZ").to_matrix()
    loc = Vector(p)
    return lambda v: tuple(loc + R @ Vector(v))


def geo_box(p, m):
    sx, sy, sz = p["s"]
    x, y, z = sx / 2, sy / 2, sz / 2
    T = xform(p["p"], (p.get("rx", 0), p.get("ry", 0), p.get("rz", 0)))
    tile = m.get("tile")
    # each face: 4 corners (counter-clockwise from outside) with the face's two size axes for UVs
    F = [((x, -y, -z), (x, y, -z), (x, y, z), (x, -y, z), sy, sz), ((-x, y, -z), (-x, -y, -z), (-x, -y, z), (-x, y, z), sy, sz),
         ((x, y, -z), (-x, y, -z), (-x, y, z), (x, y, z), sx, sz), ((-x, -y, -z), (x, -y, -z), (x, -y, z), (-x, -y, z), sx, sz),
         ((-x, -y, z), (x, -y, z), (x, y, z), (-x, y, z), sx, sy), ((-x, y, -z), (x, y, -z), (x, -y, -z), (-x, -y, -z), sx, sy)]
    verts, faces, uvs = [], [], []
    for a, b, c, d, w, h in F:
        i = len(verts)
        verts += [T(a), T(b), T(c), T(d)]
        faces.append((i, i + 1, i + 2, i + 3))
        su, sv = (w / tile, h / tile) if tile else (1, 1)
        uvs.append([(0, 0), (su, 0), (su, sv), (0, sv)])
    return verts, faces, uvs


def geo_cyl(p):
    seg, r, h = p.get("seg", 16), p["r"], p["h"]
    T = xform(p["p"], (p.get("rx", 0), 0, p.get("rz", 0)))
    v = [T((r * math.cos(2 * math.pi * i / seg), r * math.sin(2 * math.pi * i / seg), k)) for k in (-h / 2, h / 2) for i in range(seg)]
    f = [(i, (i + 1) % seg, seg + (i + 1) % seg, seg + i) for i in range(seg)]
    caps = [tuple(reversed(range(seg))), tuple(range(seg, 2 * seg))]
    return v, f, caps


def geo_sph(p, la=10, lo=16):
    r, sz = p["r"], p.get("sz", 1)
    c = Vector(p["p"])
    v = [tuple(c + Vector((0, 0, -r * sz)))]
    for i in range(1, la):
        th = math.pi * i / la
        for j in range(lo):
            ph = 2 * math.pi * j / lo
            v.append(tuple(c + Vector((r * math.sin(th) * math.cos(ph), r * math.sin(th) * math.sin(ph), -r * sz * math.cos(th)))))
    v.append(tuple(c + Vector((0, 0, r * sz))))
    f = [(0, 1 + (j + 1) % lo, 1 + j) for j in range(lo)]
    for i in range(la - 2):
        a, b = 1 + i * lo, 1 + (i + 1) * lo
        f += [(a + j, a + (j + 1) % lo, b + (j + 1) % lo, b + j) for j in range(lo)]
    top, last = len(v) - 1, 1 + (la - 2) * lo
    f += [(last + j, last + (j + 1) % lo, top) for j in range(lo)]
    return v, f


def geo_plane(p, m):
    w, h = p["s"]
    T = xform(p["p"], p["r"])
    us, vs = p.get("uv") or m.get("uv") or (1, 1)
    v = [T((-w / 2, -h / 2, 0)), T((w / 2, -h / 2, 0)), T((w / 2, h / 2, 0)), T((-w / 2, h / 2, 0))]
    return v, [(0, 1, 2, 3)], [[(0, 0), (us, 0), (us, vs), (0, vs)]]


def geo_tris(p):
    vv, uv = p["v"], p.get("uv")
    verts = [tuple(vv[i:i + 3]) for i in range(0, len(vv) - 2, 3)]
    faces = [(i, i + 1, i + 2) for i in range(0, len(verts) - 2, 3)]
    uvs = [[(uv[k * 2], uv[k * 2 + 1]) for k in f] for f in faces] if uv else None
    return verts, faces, uvs


def import_asset(p, coll, parent):
    path = os.path.join(BASE, p["file"])
    if not os.path.isfile(path):
        print(f"{TAG} missing model file {p['file']} - skipped")
        return
    before = set(bpy.data.objects)
    try:
        if path.lower().endswith(".obj"):
            if hasattr(bpy.ops.wm, "obj_import"):
                bpy.ops.wm.obj_import(filepath=path)
            else:
                bpy.ops.import_scene.obj(filepath=path)
        else:
            bpy.ops.import_scene.gltf(filepath=path)
    except Exception as e:
        print(f"{TAG} could not import {p['file']}: {e}")
        return
    new = [o for o in bpy.data.objects if o not in before]
    outer = bpy.data.objects.new(p["n"] + "_" + os.path.basename(p["file"]), None)
    outer.location = p["p"]
    outer.rotation_euler = Euler((0, 0, math.radians(p.get("rz", 0))), "XYZ")
    outer.scale = p["s"]
    outer.parent = parent
    inner = bpy.data.objects.new(outer.name + "_centre", None)
    inner.location = p["off"]
    inner.parent = outer
    coll.objects.link(outer)
    coll.objects.link(inner)
    for o in new:
        for c in list(o.users_collection):
            c.objects.unlink(o)
        coll.objects.link(o)
        if o.parent is None:
            o.parent = inner


def build():
    scene = bpy.context.scene
    clear_scene()
    root = bpy.data.collections.new("StructureStudio")
    scene.collection.children.link(root)
    turntable = bpy.data.objects.new("Studio_Turntable", None)
    turntable.empty_display_type = "CIRCLE"
    site = SPEC.get("site", {"w": 60, "d": 50})
    turntable.empty_display_size = max(site["w"], site["d"]) * 0.6
    root.objects.link(turntable)

    mats = {name: make_material(name, m) for name, m in SPEC["materials"].items()}
    buckets, colls = {}, {}
    lo, hi = [1e9] * 3, [-1e9] * 3

    def coll_for(g):
        name = (g or "Misc").replace("·", "-")[:60]
        if name not in colls:
            colls[name] = bpy.data.collections.new(name)
            root.children.link(colls[name])
        return colls[name]

    for p in SPEC["prims"]:
        g = p.get("g", "Misc")
        if p["t"] == "asset":
            import_asset(p, coll_for(g), turntable)
            continue
        m = SPEC["materials"][p["m"]]
        key = (g, p["m"])
        bk = buckets.setdefault(key, Bucket())
        if p["t"] == "box":
            v, f, uv = geo_box(p, m)
            bk.add(v, f, uv)
            if p.get("b", 0) > 0.0015:
                bk.bevel.append(p["b"])
        elif p["t"] == "cyl":
            v, side, caps = geo_cyl(p)
            o = len(bk.v)
            bk.add(v, side, None, smooth=True)
            for c in caps:
                bk.f.append(tuple(i + o for i in c))
                bk.uv.append([(0, 0)] * len(c))
                bk.smooth.append(False)
        elif p["t"] == "sph":
            v, f = geo_sph(p)
            bk.add(v, f, None, smooth=True)
        elif p["t"] == "tris":
            v, f, uv = geo_tris(p)
            bk.add(v, f, uv)
        else:
            v, f, uv = geo_plane(p, m)
            bk.add(v, f, uv)
        for q in v[-64:]:
            for k in range(3):
                lo[k] = min(lo[k], q[k])
                hi[k] = max(hi[k], q[k])

    for (g, mname), bk in buckets.items():
        if not bk.f:
            continue
        me = bpy.data.meshes.new(f"{g}-{mname}"[:60])
        me.from_pydata(bk.v, [], bk.f)
        layer = me.uv_layers.new(name="UVMap")
        li = 0
        for k, poly in enumerate(me.polygons):
            uvs = bk.uv[k]
            for j in range(poly.loop_total):
                layer.data[poly.loop_start + j].uv = uvs[j] if j < len(uvs) else (0, 0)
            poly.use_smooth = bk.smooth[k] or bool(bk.bevel)
        me.materials.append(mats[mname])
        me.update()
        ob = bpy.data.objects.new(me.name, me)
        ob.parent = turntable
        coll_for(g).objects.link(ob)
        if bk.bevel:                                            # rounded CAD-style edges on boxes
            bev = ob.modifiers.new("Bevel", "BEVEL")
            bev.width = max(0.002, min(0.02, sorted(bk.bevel)[len(bk.bevel) // 4]))
            bev.segments = 2
            bev.limit_method = "ANGLE"
            bev.angle_limit = math.radians(40)
            if hasattr(bev, "harden_normals"):
                bev.harden_normals = True
            if hasattr(me, "use_auto_smooth"):
                me.use_auto_smooth = True
                me.auto_smooth_angle = math.radians(35)
        if SPEC["materials"][mname].get("cull") and hasattr(ob, "visible_shadow"):
            ob.visible_shadow = False

    # --- lights: sun + soft sky, plus ceiling panels on each floor of each building
    def light(name, kind, loc, energy, rot=(0, 0, 0), size=None, color=(1, 1, 1)):
        ld = bpy.data.lights.new(name, kind)
        ld.energy = energy
        ld.color = color
        if size is not None and kind == "AREA":
            ld.shape = "RECTANGLE"
            ld.size, ld.size_y = size
        lo_ = bpy.data.objects.new(name, ld)
        lo_.location = loc
        lo_.rotation_euler = Euler(rot, "XYZ")
        lo_.parent = turntable
        root.objects.link(lo_)
        return lo_

    light("Sun", "SUN", (0, 0, 30), 3.2, rot=(math.radians(40), math.radians(10), math.radians(35)), color=(1.0, 0.97, 0.9))
    for b in SPEC.get("buildings", []):
        xs, ys = [p[0] for p in b["pts"]], [p[1] for p in b["pts"]]
        w, d = max(xs) - min(xs), max(ys) - min(ys)
        nx, ny = max(1, round(w / 5)), max(1, round(d / 5))
        for f in range(min(b["floors"], 20)):
            z = b["base"] + f * b["fh"] + b["fh"] - 0.35
            for i in range(nx):
                for j in range(ny):
                    x, y = min(xs) + w * (i + 0.5) / nx, min(ys) + d * (j + 0.5) / ny
                    if not inside(x, y, b["pts"]):
                        continue
                    light(f"{b['name']}_F{f}_{i}_{j}", "AREA", (x, y, z), 9 * (w / nx) * (d / ny),
                          size=(w / nx * 0.6, d / ny * 0.6), color=(1.0, 0.97, 0.92))

    world = scene.world or bpy.data.worlds.new("World")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = (0.42, 0.52, 0.66, 1)
        bg.inputs[1].default_value = 0.7

    # --- isometric camera framing everything
    cx, cy = (lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2
    span = max(hi[0] - lo[0], hi[1] - lo[1], 8)
    cd = bpy.data.cameras.new("IsoCam")
    cd.type = "ORTHO"
    cd.ortho_scale = span * 1.25
    cd.clip_start, cd.clip_end = 0.1, span * 6 + 200
    cam = bpy.data.objects.new("IsoCam", cd)
    rot = Euler((math.radians(54.7356), 0, math.radians(45)), "XYZ")
    cam.rotation_euler = rot
    cam.location = Vector((cx, cy, max(0.0, hi[2]) * 0.25)) + (rot.to_matrix() @ Vector((0, 0, 1))) * (span * 2 + 60)
    root.objects.link(cam)
    scene.camera = cam

    fc = turntable.driver_add("rotation_euler", 2)
    fc.driver.type = "SCRIPTED"
    fc.driver.expression = f"(frame - 1) * 6.283185307 / {TURNTABLE_FRAMES}"
    scene.frame_start, scene.frame_end = 1, TURNTABLE_FRAMES
    scene.frame_set(1)

    for eng in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
        try:
            scene.render.engine = eng
            break
        except TypeError:
            continue
    scene.render.resolution_x, scene.render.resolution_y = 1920, 1080
    scene.render.fps = 30
    try:
        scene.view_settings.view_transform = "Standard"
    except TypeError:
        pass
    ee = scene.eevee
    for attr, val in (("use_gtao", True), ("gtao_distance", 1.0), ("use_soft_shadows", True), ("taa_render_samples", 64),
                      ("use_shadows", True), ("use_raytracing", False), ("shadow_cascade_size", "4096")):
        if hasattr(ee, attr):
            try:
                setattr(ee, attr, val)
            except Exception:
                pass
    try:
        for win in bpy.context.window_manager.windows:
            for area in win.screen.areas:
                if area.type == "VIEW_3D":
                    sp = area.spaces.active
                    sp.shading.type = "MATERIAL"
                    sp.region_3d.view_perspective = "CAMERA"
                    sp.clip_end = span * 8 + 500
    except Exception:
        pass
    print(f"{TAG} built {len(buckets)} meshes in {len(colls)} collections")
    return scene


def inside(x, y, P):
    c, j = False, len(P) - 1
    for i in range(len(P)):
        xi, yi = P[i]
        xj, yj = P[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            c = not c
        j = i
    return c


def export(scene, render=False):
    blend = os.path.join(BASE, "structure_studio.blend")
    glb = os.path.join(BASE, "structure_studio.glb")
    try:
        bpy.ops.export_scene.gltf(filepath=glb, export_format="GLB", export_animations=False, export_apply=True)
    except TypeError:
        bpy.ops.export_scene.gltf(filepath=glb, export_format="GLB")
    except Exception as e:
        print(f"{TAG} GLB export skipped: {e}")
    bpy.ops.wm.save_as_mainfile(filepath=blend)
    print(f"{TAG} saved {blend}\n{TAG} exported {glb}")
    if render:
        scene.frame_set(1)
        scene.render.filepath = os.path.join(BASE, "structure_studio_iso.png")
        scene.render.image_settings.file_format = "PNG"
        bpy.ops.render.render(write_still=True)
        print(f"{TAG} rendered {scene.render.filepath}")


def render_turntable(scene, frames=TURNTABLE_FRAMES):
    r = scene.render
    r.resolution_x, r.resolution_y = 1280, 720
    scene.frame_start, scene.frame_end = 1, frames
    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = 24
    try:
        r.image_settings.file_format = "FFMPEG"
        r.ffmpeg.format = "MPEG4"
        r.ffmpeg.codec = "H264"
        r.ffmpeg.constant_rate_factor = "HIGH"
        r.filepath = os.path.join(BASE, "structure_studio_turntable.mp4")
    except Exception:
        r.image_settings.file_format = "PNG"
        os.makedirs(os.path.join(BASE, "turntable_frames"), exist_ok=True)
        r.filepath = os.path.join(BASE, "turntable_frames", "frame_")
    print(f"{TAG} rendering {frames}-frame turntable -> {r.filepath} (this takes a few minutes)")
    bpy.ops.render.render(animation=True)
    print(f"{TAG} turntable done: {r.filepath}")


if __name__ == "__main__":
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    sc = build()
    export(sc, render="--render" in argv)
    if "--turntable" in argv:
        render_turntable(sc)
    print(f"{TAG} done. Press Space to play the 360 turntable; hide a roof collection in the Outliner to look inside.")

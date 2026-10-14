#!/usr/bin/env bash
# =====================================================================
#  Structure Studio - run everything in one go (macOS)
#
#  1. Finds Blender (offers to install it with Homebrew if missing)
#  2. Picks the layout: a Blender kit zip you give it, or the newest
#     structure_studio_kit*.zip in ~/Downloads, or the default design
#  3. Builds the scene in Blender (headless): saves structure_studio.blend,
#     exports structure_studio.glb, renders structure_studio_iso.png
#  4. Optionally renders a 360 turntable video
#  5. Opens the results
#
#  Usage:   ./run_all.sh [options] [path/to/structure_studio_kit.zip]
#    --turntable     also render the 360 video (structure_studio_turntable.mp4, a few minutes)
#    --no-render     skip the still image (fastest: just .blend + .glb)
#    --default       ignore kits in Downloads, build the default design
#    --no-open       don't open anything at the end
#    --blender PATH  use this Blender executable
#  Or just double-click run_all.command in Finder.
# =====================================================================
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE"
LOG="$HERE/run_all.log"
: > "$LOG"

say()  { printf "\033[1;33m> %s\033[0m\n" "$*"; }
ok()   { printf "\033[1;32mOK %s\033[0m\n" "$*"; }
fail() { printf "\033[1;31mERROR %s\033[0m\n" "$*"; echo "  Full log: $LOG"; exit 1; }

TURNTABLE=0; RENDER=1; OPEN=1; USE_DEFAULT=0; KIT=""; BLENDER="${BLENDER:-}"
while [ $# -gt 0 ]; do
  case "$1" in
    --turntable) TURNTABLE=1 ;;
    --no-render) RENDER=0 ;;
    --no-open)   OPEN=0 ;;
    --default)   USE_DEFAULT=1 ;;
    --blender)   shift; BLENDER="${1:-}" ;;
    -h|--help)   sed -n '2,22p' "$0"; exit 0 ;;
    *.zip)       KIT="$1" ;;
    *)           fail "Unknown option: $1 (try --help)" ;;
  esac
  shift
done

# ---------------------------------------------------------------- 1. Blender
find_blender() {
  [ -n "$BLENDER" ] && [ -x "$BLENDER" ] && { echo "$BLENDER"; return; }
  for c in "/Applications/Blender.app/Contents/MacOS/Blender" \
           "$HOME/Applications/Blender.app/Contents/MacOS/Blender"; do
    [ -x "$c" ] && { echo "$c"; return; }
  done
  # any Blender*.app (e.g. "Blender 4.2.app") found by Spotlight
  local app
  app="$(mdfind "kMDItemCFBundleIdentifier == 'org.blenderfoundation.blender'" 2>/dev/null | head -n 1)"
  [ -n "$app" ] && [ -x "$app/Contents/MacOS/Blender" ] && { echo "$app/Contents/MacOS/Blender"; return; }
  command -v blender 2>/dev/null
}

say "Looking for Blender..."
BL="$(find_blender)"
if [ -z "$BL" ]; then
  if command -v brew >/dev/null 2>&1; then
    printf "Blender isn't installed. Install it now with Homebrew (about 400 MB)? [y/N] "
    read -r yn
    if [ "${yn:-n}" = "y" ] || [ "${yn:-n}" = "Y" ]; then
      brew install --cask blender >>"$LOG" 2>&1 || fail "Homebrew couldn't install Blender."
      BL="$(find_blender)"
    fi
  fi
  if [ -z "$BL" ]; then
    open "https://www.blender.org/download/" 2>/dev/null
    fail "Blender not found. Install it from blender.org (opened in your browser), then run this again."
  fi
fi
BL_VER="$("$BL" --version 2>/dev/null | head -n 1)"
ok "Using $BL_VER"

# ---------------------------------------------------------------- 2. which layout
if [ -z "$KIT" ] && [ "$USE_DEFAULT" = 0 ]; then
  KIT="$(ls -t "$HOME"/Downloads/structure_studio_kit*.zip 2>/dev/null | head -n 1 || true)"
  if [ -n "$KIT" ]; then
    # only use it if it's newer than this folder's default scene
    if [ "$KIT" -ot "$HERE/scene.json" ]; then KIT=""; fi
  fi
fi

if [ -n "$KIT" ]; then
  [ -f "$KIT" ] || fail "Kit not found: $KIT"
  WORK="$HERE/my_layout"
  say "Using your layout from $(basename "$KIT")"
  rm -rf "$WORK"; mkdir -p "$WORK"
  unzip -q -o "$KIT" -d "$WORK" >>"$LOG" 2>&1 || fail "Couldn't unzip $KIT"
  # the kit unzips to structure_studio/ ; find the folder holding scene.json
  SRC="$(dirname "$(find "$WORK" -name scene.json -maxdepth 3 | head -n 1)")"
  [ -f "$SRC/scene.json" ] || fail "That zip has no scene.json - download it again with 'Download Blender kit' in Structure Studio."
  cp "$HERE/build_scene.py" "$SRC/build_scene.py"      # always use the newest builder
else
  SRC="$HERE"
  say "Building the default design (family house)"
fi
[ -d "$SRC/textures" ] || fail "Missing textures/ next to scene.json in $SRC"

# ---------------------------------------------------------------- 3 + 4. build in Blender
ARGS=()
[ "$RENDER" = 1 ] && ARGS+=("--render")
[ "$TURNTABLE" = 1 ] && ARGS+=("--turntable")
STEPS="build + save .blend + export .glb"
[ "$RENDER" = 1 ] && STEPS="$STEPS + render still"
[ "$TURNTABLE" = 1 ] && STEPS="$STEPS + 360 video (several minutes)"
say "Blender: ${STEPS} ..."
START=$(date +%s)
if [ ${#ARGS[@]} -gt 0 ]; then
  "$BL" -b --factory-startup --python "$SRC/build_scene.py" -- "${ARGS[@]}" 2>&1 | tee -a "$LOG" | grep --line-buffered -E "\[studio\]|Error|Traceback|Fra:[0-9]+ .*Rendering"
else
  "$BL" -b --factory-startup --python "$SRC/build_scene.py" 2>&1 | tee -a "$LOG" | grep --line-buffered -E "\[studio\]|Error|Traceback"
fi
grep -q "Traceback" "$LOG" && fail "Blender reported an error (see the Traceback above)."
[ -f "$SRC/structure_studio.blend" ] || fail "Blender finished but structure_studio.blend wasn't created."
ok "Done in $(( $(date +%s) - START )) s"

# ---------------------------------------------------------------- 5. results
echo
echo "Results in: $SRC"
for f in structure_studio.blend structure_studio.glb structure_studio_iso.png structure_studio_turntable.mp4; do
  [ -e "$SRC/$f" ] && echo "  - ${f}"
done
if [ "$OPEN" = 1 ]; then
  [ -f "$SRC/structure_studio_iso.png" ] && open "$SRC/structure_studio_iso.png"
  [ -f "$SRC/structure_studio_turntable.mp4" ] && open "$SRC/structure_studio_turntable.mp4"
  [ -f "$HERE/viewer/structure_studio.html" ] && open "$HERE/viewer/structure_studio.html"
  open -a "$(dirname "$(dirname "$(dirname "$BL")")")" "$SRC/structure_studio.blend" 2>/dev/null || "$BL" "$SRC/structure_studio.blend" >/dev/null 2>&1 &
  ok "Opened the image, the 3D editor in your browser, and the scene in Blender (press Space there for the 360 turntable; hide a Roof collection to look inside)."
fi

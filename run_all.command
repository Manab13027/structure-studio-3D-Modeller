#!/usr/bin/env bash
# Double-click me in Finder to build everything (Blender scene, .glb, image) in one go.
# Add the 360 video too:  open Terminal and run  ./run_all.sh --turntable
cd "$(dirname "$0")"
chmod +x run_all.sh 2>/dev/null
./run_all.sh "$@"
echo
read -r -p "Press Return to close this window..." _

#!/usr/bin/env bash
# Downloads the current Grand River Transit GTFS (mirrored on GitHub by jason897/grt-gtfs-history).
set -euo pipefail
BRANCH="${1:-2026-07-05_2028-07-03}"
BASE="https://raw.githubusercontent.com/jason897/grt-gtfs-history/$BRANCH"
for dir in bus lrt; do
  mkdir -p "gtfs/$dir"
  for f in routes stops trips shapes; do curl -fsSL -o "gtfs/$dir/$f.txt" "$BASE/$dir/$f.txt"; done
done
echo "GTFS saved to ./gtfs ($BRANCH)"

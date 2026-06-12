#!/usr/bin/env bash
# Synthesize the Docker-CTA explainer SFX with ffmpeg (offline, reproducible).
# Re-run any time to regenerate the binaries deterministically.
set -euo pipefail

OUT="public/content/docker-cta/sfx"
mkdir -p "$OUT"

# --- explain-pad: ~3.5s low ambient riser (pink noise + 110Hz drone) ---
ffmpeg -y \
  -f lavfi -i "anoisesrc=color=pink:duration=3.5:amplitude=0.35:sample_rate=48000" \
  -f lavfi -i "sine=frequency=110:duration=3.5:sample_rate=48000" \
  -filter_complex "\
    [0:a]highpass=f=200,lowpass=f=2500[n]; \
    [1:a]volume=0.35[d]; \
    [n][d]amix=inputs=2:duration=longest, \
    afade=t=in:st=0:d=2.5, afade=t=out:st=3.0:d=0.5, \
    aecho=0.8:0.7:60:0.3, \
    loudnorm=I=-16:TP=-1.5:LRA=11" \
  -ar 48000 -ac 1 "$OUT/explain-pad.mp3"

# --- chime3: ascending ding C5/E5/G5, staggered 200ms apart ---
ffmpeg -y \
  -f lavfi -i "sine=frequency=523:duration=1.0:sample_rate=48000" \
  -f lavfi -i "sine=frequency=659:duration=0.9:sample_rate=48000" \
  -f lavfi -i "sine=frequency=784:duration=0.9:sample_rate=48000" \
  -filter_complex "\
    [0:a]afade=t=out:st=0.1:d=0.6,adelay=0[a]; \
    [1:a]afade=t=out:st=0.1:d=0.6,adelay=200[b]; \
    [2:a]afade=t=out:st=0.1:d=0.7,adelay=400[c]; \
    [a][b][c]amix=inputs=3:duration=longest, \
    loudnorm=I=-16:TP=-1.5:LRA=11" \
  -ar 48000 -ac 1 "$OUT/chime3.mp3"

echo "wrote:"
ls -la "$OUT/explain-pad.mp3" "$OUT/chime3.mp3"

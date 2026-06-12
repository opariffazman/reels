#!/usr/bin/env bash
# Synthesize the Docker-CTA SFX with ffmpeg (offline, reproducible).
# Punchy impact/boom palette for hook and explainer beats.
# Re-run any time to regenerate the binaries deterministically. Requires ffmpeg >= 4.
set -euo pipefail

OUT="public/content/docker-cta/sfx"
mkdir -p "$OUT"

NORM="loudnorm=I=-16:TP=-1.5:LRA=11"

# --- impact: hook word-slam — low thud (80Hz) + noise transient, fast decay ---
ffmpeg -y \
  -f lavfi -i "sine=frequency=80:duration=0.22:sample_rate=48000" \
  -f lavfi -i "anoisesrc=color=white:duration=0.06:amplitude=0.5:sample_rate=48000" \
  -filter_complex "\
    [0:a]afade=t=out:st=0.0:d=0.2[s]; \
    [1:a]highpass=f=1200,afade=t=out:st=0.0:d=0.06[n]; \
    [s][n]amix=inputs=2:duration=longest, $NORM" \
  -ar 48000 -ac 1 "$OUT/impact.mp3"

# --- boom: hero hit for "DO YOU?" / whip — deep sub (50Hz) + body + echo tail ---
ffmpeg -y \
  -f lavfi -i "sine=frequency=50:duration=0.6:sample_rate=48000" \
  -f lavfi -i "sine=frequency=95:duration=0.4:sample_rate=48000" \
  -filter_complex "\
    [0:a]afade=t=out:st=0.05:d=0.55[sub]; \
    [1:a]volume=0.5,afade=t=out:st=0.04:d=0.36[body]; \
    [sub][body]amix=inputs=2:duration=longest,aecho=0.8:0.6:55:0.3, $NORM" \
  -ar 48000 -ac 1 "$OUT/boom.mp3"

echo "wrote:"
ls -la "$OUT/impact.mp3" "$OUT/boom.mp3"

#!/usr/bin/env bash
# Synthesize the Docker-CTA explainer SFX with ffmpeg (offline, reproducible).
# Digital "blip + rising tone" palette for the explainer breakdown (no music bed).
# Re-run any time to regenerate the binaries deterministically. Requires ffmpeg >= 4.
set -euo pipefail

OUT="public/content/docker-cta/sfx"
mkdir -p "$OUT"

NORM="loudnorm=I=-16:TP=-1.5:LRA=11"

# --- blip-rise: package reveal — digital blip sweeping up 500->940Hz (chirp) ---
ffmpeg -y \
  -f lavfi -i "aevalsrc='0.6*sin(2*PI*(500*t+1000*t*t))':d=0.22:s=48000" \
  -af "afade=t=out:st=0.05:d=0.17, $NORM" \
  -ar 48000 -ac 1 "$OUT/blip-rise.mp3"

# --- blip-low: whale reveal — bigger/lower blip sweeping up 280->550Hz (chirp) ---
ffmpeg -y \
  -f lavfi -i "aevalsrc='0.6*sin(2*PI*(280*t+480*t*t))':d=0.28:s=48000" \
  -af "afade=t=out:st=0.06:d=0.22, $NORM" \
  -ar 48000 -ac 1 "$OUT/blip-low.mp3"

# --- blip-steps: three ascending dest blips (700/880/1050Hz) at 0 / 0.667 / 1.333s ---
# (matches laptop/server/cloud chips at local frames 155/175/195 @30fps) ---
ffmpeg -y \
  -f lavfi -i "sine=frequency=700:duration=0.1:sample_rate=48000" \
  -f lavfi -i "sine=frequency=880:duration=0.1:sample_rate=48000" \
  -f lavfi -i "sine=frequency=1050:duration=0.1:sample_rate=48000" \
  -filter_complex "\
    [0:a]afade=t=out:st=0.02:d=0.08,adelay=0[a]; \
    [1:a]afade=t=out:st=0.02:d=0.08,adelay=667[b]; \
    [2:a]afade=t=out:st=0.02:d=0.08,adelay=1333[c]; \
    [a][b][c]amix=inputs=3:duration=longest, $NORM" \
  -ar 48000 -ac 1 "$OUT/blip-steps.mp3"

# --- confirm: tagline payoff — two-note up confirm (660 -> 990Hz) ---
ffmpeg -y \
  -f lavfi -i "sine=frequency=660:duration=0.14:sample_rate=48000" \
  -f lavfi -i "sine=frequency=990:duration=0.22:sample_rate=48000" \
  -filter_complex "\
    [0:a]afade=t=out:st=0.04:d=0.10,adelay=0[a]; \
    [1:a]afade=t=out:st=0.06:d=0.16,adelay=110[b]; \
    [a][b]amix=inputs=2:duration=longest,aecho=0.8:0.6:40:0.25, $NORM" \
  -ar 48000 -ac 1 "$OUT/confirm.mp3"

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
ls -la "$OUT/blip-rise.mp3" "$OUT/blip-low.mp3" "$OUT/blip-steps.mp3" "$OUT/confirm.mp3" "$OUT/impact.mp3" "$OUT/boom.mp3"

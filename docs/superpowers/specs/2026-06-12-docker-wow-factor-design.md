# Docker CTA Reel — "Wow Factor" High-Energy Pass

**Date:** 2026-06-12
**Branch:** `feat/docker-cta-reel`
**Status:** Approved (brainstorming)

## Goal

Increase scroll-stopping power and watch-through on the 40s Docker CTA reel by:
1. Replacing the calm typewriter open with a **high-energy slam hook** (FOMO line, VO-silent).
2. Turning the static brand logo into a **whale hero moment** (swim-in, bob, ripple, bubbles).
3. A **kinetic motion pass** across the whole reel (punch/overshoot, camera push-in, beat-boundary whip-flashes, card light-sweep, background parallax).

Music stays **off** (consistent with the current cut). The change is contained to the first 8.5s for timing; the explainer/curriculum/CTA and VO clips 03–09 are untouched.

## Locked Decisions

- **Hook line:** `EVERYONE USES DOCKER.` → `DO YOU?` (FOMO), kinetic slams, **no voiceover** (impact SFX carries it).
- **Energy/vibe:** **High-energy / aggressive** — hard slams, screen shake, brief soft flashes, fast zoom/whip cuts. Flashes kept tasteful (≤2 frames, soft, never full-white strobing).
- **Whale hero moment** lives in the **brand beat**.
- **VO relocation:** the old hook VO (clip 01) moves into the brand beat; clip 02 also plays in brand. Clips 03–09 unchanged.

## Timeline (30 fps, 1200 frames total — unchanged)

Only the first two beats are rebalanced; `EXPLAIN_FROM=255` is unchanged so nothing downstream reshuffles.

| Beat | Frames | Was | Change |
|------|--------|-----|--------|
| Hook | **0–100** | 0–135 | `HOOK_DUR` 135 → **100**; rebuilt as slam hook |
| Brand | **100–255** | 135–255 | `BRAND_FROM` 135 → **100**, `BRAND_DUR` 120 → **155**; whale hero + 2 VO lines |
| Explainer | 255–555 | — | unchanged |
| Curriculum | 555–960 | — | unchanged |
| CTA | 960–1200 | — | unchanged |

`0–100` (hook) + `100–255` (brand) = 255 = `EXPLAIN_FROM`. ✓

### Voiceover

| Clip | Spoken | New `from` | Was | Notes |
|------|--------|-----------:|----:|-------|
| 01 | "Master Docker. In three days." | **172** (brand) | 8 | dur 78 → ends 250 (< 255) |
| 02 | "Docker. For beginners." | **106** (brand) | 150 | dur 58 → ends 164; plays first |
| 03–09 | — | unchanged | | explainer/curriculum/CTA |

Reordered so the brand reveal (clip 02) lands before the promise (clip 01). Each on-screen line reveals in sync with its clip (1:1 caption rule preserved for the brand).

## Beat 1 — Slam Hook (0–100), VO-silent

Heavy **INTER** (weight 800–900) impact typography (not the MONO typewriter). Frame 0 is already loaded (flash + first word mid-slam — never an empty gradient).

```
f0    flash + "EVERYONE"  slams in (scale 1.4→1.0 overshoot, shake)   impact SFX
f10        + "USES"       slams under it                              impact SFX
f20        + "DOCKER."    slams under it (largest)                    impact SFX
f30–44  hold the 3-line stack, subtle zoom-in
f45    hard cut → clear stack → "DO YOU?" HERO slam                   boom SFX + flash
        (scale 1.6→1.0, hard shake)
f55–85  hold "DO YOU?", pulse + slow zoom
f85–100 whip-zoom out (fast scale + fade) into brand                  whoosh SFX
```

SFX (absolute frames): `impact` @0/10/20, `boom` @45, `whoosh` @85. No typewriter, no typing-clicks, no hook ding.

## Beat 2 — Whale Hero + Brand (100–255)

Local frames are relative to `BRAND_FROM=100`.

```
local 0–40   Docker whale SWIMS IN from the left (translateX -500→0, spring),
             then a continuous vertical BOB (sin) + glow pulse.
             Water RIPPLE rings expand + BUBBLES rise beneath it.
local ~6     DOCKER wordmark slams in + "for beginners"  ── synced to VO 02 (abs 106)
local ~72    "Master Docker in 3 days" promise line in    ── synced to VO 01 (abs 172)
local 139–155 beat out-fade
```

- Whale uses the size-parameterized `DockerMark` (already in the file), wrapped to add swim-in translate + bob.
- Layout (portrait, top→bottom): whale → `DOCKER` wordmark → `for beginners` → `Master Docker in 3 days`. Keep it from feeling cramped; the implementer flags if it overflows the safe area.

## Beat 3 — Kinetic Motion Pass (whole reel)

Add small reusable helpers and apply them; keep each readable.

- **Punch springs:** reveals use an overshoot spring (e.g. `{ damping: 9, stiffness: 220 }`) plus a brief scale punch, replacing flat fades. Apply to the brand wordmark, explainer pieces, curriculum cards, CTA elements.
- **Camera push-in:** each beat's root scales slowly `1.0 → ~1.05` across its duration (a shared wrapper or inline transform) for constant subtle life.
- **Whip + soft flash at beat boundaries:** a brief (≤2 frame) soft-white flash + quick scale at each beat start (hook→brand→explainer→curriculum→CTA). Implemented as a `Flash` overlay at the boundary frames.
- **Specular light-sweep:** a skewed translucent-white highlight sweeps once across each glossy container card as it lands.
- **Background parallax:** faint large container silhouettes (rounded rects) drift slowly in the `Background` for depth; amplify the existing gradient drift.
- **Shake:** a `Shake` wrapper (decaying sin offset keyed to impact frames) used on the hook slams; optionally a small shake on the CTA reveal.

**Accessibility constraint:** flashes are soft (peak opacity ≤ ~0.6 white) and brief (≤2 frames), never a repeating strobe.

## Audio — new SFX

Music stays gated off. Add two cues to the committed generator `scripts/synth-docker-sfx.sh`:

| Cue | Synth (ffmpeg) | Use |
|-----|----------------|-----|
| `impact` (~0.18s) | low sine thud (~80 Hz) + short noise transient, fast `afade` out | hook word slams |
| `boom` (~0.6s) | deep sub sine (~50 Hz) + body + light `aecho` tail, `afade` out | "DO YOU?" hero hit; reusable for the whip |

`whoosh` reused for the whip. All cues `loudnorm=I=-16:TP=-1.5:LRA=11`, `-ar 48000 -ac 1`.

## Files Touched

| File | Change |
|------|--------|
| `src/components/DockerCtaVideo.tsx` | retime hook/brand constants; rewrite `HookBeat` (kinetic slams + shake/flash); rebuild `BrandBeat` (whale swim/bob/ripple/bubbles + 2 VO-synced lines); add motion helpers (`Flash`, `Shake`, push-in, card light-sweep, bg parallax); punch springs on reveals; new SFX path consts + hook SFX sequences; relocate VO 01/02 |
| `scripts/synth-docker-sfx.sh` | add `impact` + `boom` recipes |
| `public/content/docker-cta/sfx/impact.mp3`, `boom.mp3` | NEW assets |
| `src/Root.tsx` | none (duration unchanged) |

## Acceptance Criteria

1. Composition stays **1200 frames / 40.00s**; `EXPLAIN_FROM=255`, the timing/structure of beats 3–5, and VO clips 03–09 are unchanged. The motion-pass helpers (push-in, boundary flash, card sweep, punch springs) may add visual polish to those beats, but no content, copy, or timing changes there.
2. Hook (0–100) is **VO-silent kinetic slams**: `EVERYONE USES DOCKER.` then `DO YOU?`, loaded on frame 0, with `impact`/`boom`/`whoosh` SFX and shake/flash. No typewriter or typing-clicks in the hook.
3. Brand (100–255): whale **swims in + bobs**, with ripple + bubbles + glow; `DOCKER` + `for beginners` reveal in sync with **VO 02** (~106); `Master Docker in 3 days` reveals in sync with **VO 01** (~172).
4. Motion pass is visibly present: overshoot reveals, per-beat push-in, beat-boundary soft flashes, card light-sweep, background parallax.
5. Flashes are soft (≤~0.6 peak) and ≤2 frames; no repeating strobe.
6. `npm run lint` exits 0.
7. Full render ~40s, `max_volume` < 0 dB (no clipping); hook window (0–3.3s) carries impact SFX.

## Out of Scope

- Restoring the music bed.
- Re-synthesizing any VO (clips 01–09 reused as-is; only 01/02 are repositioned).
- Any content change to explainer/curriculum/CTA beyond the shared motion-pass helpers (push-in, flash, sweep, punch springs) applied to them.

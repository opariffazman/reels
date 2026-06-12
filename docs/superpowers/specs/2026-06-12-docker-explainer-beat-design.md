# Docker CTA Reel — "What is Docker" Explainer Beat

**Date:** 2026-06-12
**Branch:** `feat/docker-cta-reel`
**Status:** Approved (brainstorming)

## Goal

Make the Docker CTA reel more engaging by inserting a short, icon-driven
"what is Docker" infographic between the brand reveal and the curriculum. The
reel currently jumps brand → curriculum → CTA with no explanation of *what
Docker is or why it matters*. This beat adds that value, turning a pure CTA
into an educational hook that is more shareable.

## Locked Decisions

- **Length:** Extend total from 30s → **~40s**. The new beat is inserted; no
  existing beat is trimmed or compressed. (40s is still native for
  Reels / TikTok / Shorts.)
- **Narration:** **Silent** (no new voiceover), like the existing venue / CTA
  close beats. Visuals + SFX carry it.
- **Concept:** **"Build once, run anywhere."** Your app + its dependencies pack
  into a container, ride the Docker whale, and run identically on laptop,
  server, and cloud — the clearest one-breath "what is Docker."
- **Music:** **Disabled for now.** The background music bed is gated off behind
  a flag so the SFX and visuals can be evaluated cleanly. Re-enabling is a
  one-line change later.

## Placement & Timing

The explainer inserts after the brand reveal. Everything downstream shifts
**+300 frames** (`SHIFT = 300`). The two VO clips that play during hook/brand
(01, 02) stay put; the seven that play during curriculum/CTA (03–09) shift
with their beats.

```
0.0s   Hook        'Master Docker in 3 days'      (unchanged, 0–135)
4.5s   Brand       Docker logo reveal             (unchanged, 135–255)
8.5s   EXPLAINER   What is Docker  [NEW]          (255–555, dur 300)
18.5s  Curriculum  5 cards                        (shifted, 555–960)
32.0s  CTA         date / venue / whatsapp        (shifted, 960–1200)
40.0s  end
```

### Constant changes (`src/components/DockerCtaVideo.tsx`)

| Constant | Before | After |
|----------|-------:|------:|
| `DOCKERCTA_TOTAL_FRAMES` | 900 | **1200** |
| *(new)* `EXPLAIN_FROM` | — | **255** |
| *(new)* `EXPLAIN_DUR` | — | **300** |
| `CURR_FROM` | 255 | **555** |
| `CTA_FROM` | 660 | **960** |
| `HEADER_FROM` | 255 | **555** |
| `CARDS[].from` | 309/375/441/507/573 | **609/675/741/807/873** |
| `DATE_FROM` | 660 | **960** |
| `VENUE_FROM` | 735 | **1035** |
| `CTA_REVEAL_FROM` | 795 | **1095** |

`BRAND_*`, `HOOK_*`, `CURR_DUR` (405), `CTA_DUR` (240) are unchanged.
`src/Root.tsx` consumes `DOCKERCTA_TOTAL_FRAMES`, so its `durationInFrames`
updates automatically — no edit needed there.

### Voiceover shift

| Clip | Before `from` | After `from` |
|------|-------------:|-------------:|
| 01 (hook) | 8 | **8** (unchanged) |
| 02 (brand) | 150 | **150** (unchanged) |
| 03 | 258 | **558** |
| 04 | 312 | **612** |
| 05 | 378 | **678** |
| 06 | 444 | **744** |
| 07 | 510 | **810** |
| 08 | 576 | **876** |
| 09 (CTA) | 660 | **960** |

Sanity: clip 02 ends 150+58=208 < 255 (stays in brand). Clip 09 ends
960+74=1034; venue reveal at 1035 — the silent gap before the venue line is
preserved exactly as in the 30s cut.

## Explainer Storyboard

Vertical flow, native to portrait. Frames are **local to the beat (0–300)**.

```
            WHAT IS DOCKER?            title types in        0–28

      +-----------------------+
      |  your app + its deps  |        glossy container card
      |   [mdiPackageVariant] |        slides in from right  30–80
      +-----------------------+
                 v                      mdiArrowDown
         ( mdiDocker whale )            whale pops w/ glow    90–145
                 v                      mdiArrowDown
    [laptop]  [server]  [cloud]         3 dest chips stagger
    mdiLaptop mdiServer mdiCloud        in at 155 / 175 / 195

      runs the SAME everywhere          tagline types in      240–285
                                        hold + fade out       286–300
```

### Visual reuse

- **App card** reuses the existing `ContainerCard` corrugated styling (Docker
  blue, `cardEdge` border, glossy shadow). Label `your app + all its deps`,
  `mdiPackageVariant` icon instead of the checkmark.
- **Whale** reuses `DockerMark`'s radial glow + `mdiDocker`, smaller scale.
- **Destination chips** are icon+label pills in the same theme (icon in `ice`,
  label in `white`, subtle `cardFill` background), staggered via `spring`.
- **Arrows** use `mdiArrowDown` in `ice`, fading in between stages.
- **Title / tagline** use the existing `TypingText` primitive (`CHAR_FRAMES`,
  `CURSOR_BLINK`) so the type-on style matches the hook.

### New icons to confirm in `@mdi/js`

`mdiPackageVariant`, `mdiLaptop`, `mdiServer`, `mdiCloud`, `mdiArrowDown`.
(All standard MDI; the plan's first step verifies they import cleanly.)

## Audio

### Music — disabled for now

- Add `const MUSIC_ENABLED = false;`. Guard the music `<Audio>` mount with it.
- Keep `musicVolume` and the VO duck-window timing **intact** so re-enabling is
  a one-line flip later.
- VO clips 01–09 play unchanged against SFX-only audio.

### SFX plan

The explainer is silent-VO, so SFX must carry it. Two **new** synthesized cues
plus reuse of existing ones:

| Cue | Source | Abs. frame | Purpose |
|-----|--------|-----------:|---------|
| `explain-pad` (NEW, ~3.5s) | synth | 255 | low ambient riser under the entrance so silence ≠ dead air |
| `whoosh` | reuse | 285 | app-card entrance |
| `whoosh` | reuse | 345 | whale entrance |
| `chime3` (NEW, ~1s) | synth | 410 | 3-note ascending ding as laptop→server→cloud reveal |
| `ding` | reuse | ~535 | tagline "runs the SAME everywhere" |

Existing SFX accents on hook/curriculum/CTA are unchanged (their absolute
frames shift only where they were tied to shifted beats — i.e. the per-card
`click` SFX move with `CARDS`, and the CTA `swell`/`ding` move with
`CTA_REVEAL_FROM`).

### SFX synthesis (ffmpeg, offline, reproducible)

Tooling: **ffmpeg 8.1** (sox not installed; not required). A committed
generator script `scripts/synth-docker-sfx.sh` produces the new cues
deterministically and writes them to `public/content/docker-cta/sfx/`.

- **`explain-pad`** — `anoisesrc=color=pink` + low `sine=110` drone → `amix`,
  `highpass=200,lowpass=2500`, `afade=in` ~2.5s + `afade=out`, light `aecho`.
- **`chime3`** — three `sine` tones C5/E5/G5 (523/659/784 Hz), each
  exp-decayed via `afade=out`, staggered `adelay=0|200|400`, `amix`.
- Both finish with `loudnorm=I=-16:TP=-1.5:LRA=11`, `-ar 48000`, mp3.

Exact filter arguments are finalized during implementation; the script is the
source of truth so the binaries can be regenerated.

## Files Touched

| File | Change |
|------|--------|
| `src/components/DockerCtaVideo.tsx` | retimed constants (+300 shift), new `ExplainerBeat` component + sub-pieces, `MUSIC_ENABLED` flag + guarded music mount, new SFX imports/sequences, VO shift, total → 1200 |
| `scripts/synth-docker-sfx.sh` | NEW — ffmpeg generator for `explain-pad.mp3` + `chime3.mp3` |
| `public/content/docker-cta/sfx/explain-pad.mp3` | NEW asset |
| `public/content/docker-cta/sfx/chime3.mp3` | NEW asset |
| `src/Root.tsx` | none (duration derives from the constant) |

## Acceptance Criteria

1. Composition is **1200 frames / 40.00s** at 1080×1920, 30fps.
2. Explainer beat (255–555) shows the vertical flow; all five new icons render.
3. Curriculum and CTA are visually identical to the 30s cut, just shifted +300.
4. VO 01–02 timing unchanged; 03–09 shifted +300; every clip lands inside its
   beat with the same relative offset as before.
5. **No music** in the rendered output; SFX present (`explain-pad`, `whoosh`×2,
   `chime3`, `ding`) and not clipping.
6. `npm run lint` (eslint + tsc) exits 0.
7. Full render succeeds at ~40s with no audio clipping (`max_volume` < 0 dB).

## Out of Scope

- Restoring / mixing the music bed (deferred — flag flip later).
- New voiceover for the explainer.
- Any change to hook / brand / curriculum / CTA content beyond the +300 shift.

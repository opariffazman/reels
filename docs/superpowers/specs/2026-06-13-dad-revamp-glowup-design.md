# DAD site revamp — before/after glow-up reel

Date: 2026-06-13
Status: approved (design)

## Overview

A comparison reel for the DAD (Double A Digital) website revamp — follow-up to
the ClawdLens episode. Two portrait phone screen-recordings (before/after the
AI revamp) play full-bleed; the content swaps via varied build-sweep
transitions so it reads as the site being rebuilt. Glow-up
flex tone, music bed only, minimal `OLD`/`NEW` markers.

## Source footage

| File | Role | Specs |
|------|------|-------|
| `old-final2.webm` | before revamp | 390×844, 25fps, 42.5s |
| `new-final2.webm` | after revamp  | 390×844, 25fps, 53.8s |

Move into `public/content/dad-revamp/old.webm` and `.../new.webm`
(repo convention: assets live under `public/content/<topic>/`).

Note: source is only 390px wide → scaled **full-bleed** to fill the 1080-wide
frame (~2.77×) it's a touch soft. Acceptable for a mobile reel; full-bleed reads
far more immersive on a phone than a device-in-device mockup.

## Composition

- id: `dad-revamp`
- 1080×1920, 30fps
- ~40s total (~1200 frames; final value derived from the segment array)
- Registered in `src/Root.tsx` alongside the existing compositions.

## Visual structure

Each recording plays **full-bleed** — `objectFit: cover` filling the entire
1080×1920 frame (slight top/bottom crop). No phone mockup or container; on a
phone the device-in-device frame is redundant and full-bleed is more immersive.
The build-sweep transitions wipe the whole screen.

A compact pill badge sits in the **top-left corner** (opaque, so it stays legible
over any content) and flips each beat:
- `OLD` — muted red
- `NEW` — accent green (`COLORS.accent`)

The badge is rendered on the absolute timeline (one `Sequence` per beat), not
inside a beat, so exactly one correct label shows and it swaps cleanly at each
cut rather than two overlapping during a transition.

### Beats (alternating old→new, 3 glow-up reveals, varied wipe each time)

| # | Beat | Source window* | Transition into it |
|---|------|----------------|--------------------|
| 1 | OLD hero ("DAD makes it simple") | old ~1–7s   | — (open) |
| 2 | NEW hero ("We got your back")    | new ~1–7s   | **build sweep ↓ (down)** — O→N reveal #1 |
| 3 | OLD projects (dark AWS diagrams) | old ~36–42s | plain quick cut (dip-to-dark) — topic reset |
| 4 | NEW products (Modul EdTech cards)| new ~9–16s  | **build sweep ⤡ (diagonal)** — O→N reveal #2 |
| 5 | OLD footer / CTA                 | old ~30–36s | plain quick cut (dip-to-dark) — topic reset |
| 6 | NEW product page + footer        | new ~40–48s | **build sweep ◎ (radial)** — O→N reveal #3 |

*Windows are tunable in-code via a `SEGMENTS`-style array (same pattern as
`ClawdLensV2Video`), to be finalized by scrubbing during build. Each beat ≈
6.5s of footage; transitions ≈ 15–20 frames.

Pattern O→N→O→N→O→N ends on the new site so the glow-up lands. old↔new are
*thematic* pairs (hero vs hero, products vs projects), not pixel-matched
scroll positions — fine for the glow-up read.

### The OLD→NEW signature: "build sweep"

The 3 O→N reveals share one signature transition; only the direction varies
(down / diagonal / radial) to keep variety. The N→O resets are deliberately
plain (a fast ~6-frame dip-to-dark cut) so the build sweeps stay the payoff.

Build sweep look: a feathered wipe where the entering (new) screen is revealed
behind a moving boundary, with a bright accent-green **glowing leading edge**
(soft blur/bloom) travelling across — reads as an AI scanner laying down the
rebuilt site. Old behind the edge, new ahead. Duration ~16–20 frames.

Implementation: a custom `TransitionPresentation` for `@remotion/transitions`
(progress 0→1 drives a CSS gradient mask on the entering layer with a soft
edge, plus an absolutely-positioned glow bar at the mask position). Direction
is a prop (translate/rotate the mask + bar). No particles — ~40 lines.

SFX: a synthesized **`glitch.mp3`** on each build sweep (digital "rebuild"
sound — bit-crushed noise stutter + rising zap, 0.45s), at
`public/content/dad-revamp/sfx/glitch.mp3`, timed to the sweep travel; optional
soft `ping.mp3` (from `content/devops1-bootcamp/sfx/`) as it completes. The N→O
dip cuts get no SFX. Levels sit under the music bed (~0.5); these are the only
SFX in the piece.

### End stamp

Beat 6 holds ~3s (room for the VO to breathe), then a small centered stamp: **"Rebuilt by Claude Fable"** +
DAD mark, accompanied by a single voiceover line (see Audio). Music ducks
under the VO, then fades out. No CTA/link card.

## Audio

Music bed — reuse `public/content/devops1-bootcamp/bg-music-clawdlens-v2.mp3`.
Envelope: fade in (~0.5s), steady ~0.4, duck to ~0.13 under the end-stamp VO,
fade out at the tail. Same `musicVolume`/ducking pattern as `ClawdLensV2Video`.

One voiceover line, only on the end stamp (beats 1–6 stay music-only):
- Text: **"Rebuilt by Claude Fable."** (tunable; English to match the on-screen
  stamp + the clawdlens-v2 robotic-narrator lines).
- Robotic-narrator register via **Piper** offline TTS — same route the
  clawdlens series uses (`ClawdLensVideo`/`ClawdLensV2Video` note "Piper TTS").
  Voice `en_US-ryan-high` (the original model name wasn't recoverable from the
  repo). Generated → `public/voiceover/dad-revamp/end.mp3` (~1.56s).
- Timed to start as the stamp appears; music ducks under it.

Transition SFX: synthesized `dad-revamp/sfx/glitch.mp3` (+ optional soft
`ping.mp3` on completion) on each of the 3 build sweeps only — see "The
OLD→NEW signature". Sits under the music bed.

## Implementation notes

Build as a single new component `src/components/DadRevampVideo.tsx`:
- `<TransitionSeries>` from `@remotion/transitions` for the 6 footage beats.
- O→N reveals: a custom `buildSweep(direction)` `TransitionPresentation`
  (feathered mask + glow edge). N→O resets: a plain dip-to-dark (e.g. `fade`
  through black, or `none` with a 6-frame black flash). New code, ~40 lines.
- `Video` + `Audio` from `@remotion/media`, `trimBefore`/`trimAfter` for
  segment windows, `muted` on the footage (recordings have no needed audio).
- Footage plays full-bleed: `objectFit: cover` filling the frame (source ratio
  0.462 vs frame 0.5625 → minor top/bottom crop, acceptable). No `PhoneMockup`.
- Reuse `COLORS`, `INTER` (`src/fonts`), `staticFile`.

Reuse map: `COLORS`, `INTER`, `@remotion/media`, `@remotion/transitions`,
existing music bed. New code = one component + one `<Composition>` registration.

## Success criteria

- `bun run lint` passes (eslint + tsc) — this repo's "test".
- Renders to `out/dad-revamp.mp4` at 1080×1920.
- Reads clearly as before→after: each O→N wipe is a legible glow-up; `OLD`/`NEW`
  labels never ambiguous; ends on the new site with the Fable stamp.

## Out of scope

- No voiceover except the single end-stamp line; no captions/subtitles, no CTA/link card.
- No re-encoding of source footage (trim in-code).
- No new dependencies.

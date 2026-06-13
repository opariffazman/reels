# DAD Revamp Glow-Up Reel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `dad-revamp` Remotion composition — a before/after glow-up reel of the DAD website, framed in a phone mockup, with old→new "build sweep" transitions, a glitch SFX, music bed, and an end-stamp voiceover.

**Architecture:** One new `<Composition>` driven by a single component (`DadRevampVideo`). Six footage beats (alternating old/new) are arranged in a `<TransitionSeries>`; the three OLD→NEW cuts use a custom `buildSweep` `TransitionPresentation` (feathered mask + glowing edge), the two NEW→OLD resets use `fade`. A glitch SFX fires on each sweep; an end stamp + ElevenLabs voiceover close it out.

**Tech Stack:** Remotion 4, `@remotion/media` (`Video`/`Audio`), `@remotion/transitions` (`TransitionSeries`, `linearTiming`, `fade`, custom presentation), existing `PhoneMockup`, `COLORS`, `INTER`. ElevenLabs TTS for the one VO line. ffmpeg-synthesized glitch SFX (already created).

---

## Verification convention (read first)

This Remotion repo has **no unit-test framework**; its "test" is `bun run lint`
(= `eslint src && tsc`) plus **still/clip renders** you eyeball. So this plan's
verification steps are `bun run lint` and `npx remotion still …` instead of
TDD asserts. (Project convention overrides the generic TDD template.) The logic
here is mostly declarative timing arrays + CSS gradients — a rendered frame is a
stronger check than a string-equality assert.

Render entry is `src/index.ts` (auto-detected). If the CLI can't find it, prefix
commands with `src/index.ts`, e.g. `npx remotion still src/index.ts dad-revamp …`.

## File structure

- **Create** `public/content/dad-revamp/old.webm`, `.../new.webm` — source footage (moved from repo root).
- *(exists)* `public/content/dad-revamp/sfx/glitch.mp3` — synthesized build-sweep SFX.
- **Create** `public/voiceover/dad-revamp/end.mp3` — end-stamp VO (generated in Task 5).
- **Create** `src/components/BuildSweep.tsx` — the custom OLD→NEW transition presentation.
- **Create** `src/components/DadRevampVideo.tsx` — the composition component (beats, transitions, labels, audio, end stamp).
- **Create** `generate-voiceover.ts` (repo root) — one-off ElevenLabs TTS script.
- **Modify** `src/Root.tsx` — register the `dad-revamp` composition.

---

### Task 1: Place source footage

**Files:**
- Create: `public/content/dad-revamp/old.webm` (moved from `./old-final2.webm`)
- Create: `public/content/dad-revamp/new.webm` (moved from `./new-final2.webm`)

- [ ] **Step 1: Move the two recordings into the asset folder**

Run:
```bash
mkdir -p public/content/dad-revamp
mv old-final2.webm public/content/dad-revamp/old.webm
mv new-final2.webm public/content/dad-revamp/new.webm
```

- [ ] **Step 2: Verify they're in place and readable**

Run:
```bash
ls -la public/content/dad-revamp/
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 public/content/dad-revamp/old.webm public/content/dad-revamp/new.webm
```
Expected: both files listed; durations print ~`42.52` and ~`53.76`.

- [ ] **Step 3: Commit**

```bash
git add public/content/dad-revamp/old.webm public/content/dad-revamp/new.webm
git commit -m "feat(dad-revamp): add before/after source footage"
```

---

### Task 2: The `buildSweep` custom transition presentation

**Files:**
- Create: `src/components/BuildSweep.tsx`

A `@remotion/transitions` presentation is `{ component, props }`. The component
renders twice — once for the `exiting` (old) scene, once for `entering` (new).
We leave the old scene untouched underneath and reveal the new one on top behind
a moving feathered edge, with a blurred accent-green glow band riding that edge.

- [ ] **Step 1: Write the component**

```tsx
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";

export type SweepDirection = "down" | "diagonal" | "radial";
type BuildSweepProps = { direction: SweepDirection };

const FEATHER = 9; // soft reveal-edge width, in %
const ACCENT_GLOW = "rgba(34,197,94,0.9)"; // COLORS.accent @ 0.9 alpha

// Build the mask (what's revealed) or glow (bright band at the edge) gradient
// for a given direction and edge position (%). Edge overshoots 100 so that at
// progress = 1 the whole scene is revealed.
const gradient = (
  kind: "mask" | "glow",
  direction: SweepDirection,
  edge: number,
): string => {
  const stops =
    kind === "mask"
      ? `#000 ${edge - FEATHER}%, transparent ${edge}%`
      : `transparent ${edge - FEATHER - 3}%, ${ACCENT_GLOW} ${
          edge - FEATHER / 2
        }%, transparent ${edge}%`;
  if (direction === "radial") {
    return `radial-gradient(circle at 50% 50%, ${stops})`;
  }
  const angle = direction === "diagonal" ? "135deg" : "180deg"; // down = to bottom
  return `linear-gradient(${angle}, ${stops})`;
};

const BuildSweep: React.FC<
  TransitionPresentationComponentProps<BuildSweepProps>
> = ({ presentationProgress, presentationDirection, passedProps, children }) => {
  // Old scene: render as-is; it sits underneath and gets covered.
  if (presentationDirection === "exiting") {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const edge = interpolate(presentationProgress, [0, 1], [0, 100 + FEATHER]);
  const maskImage = gradient("mask", passedProps.direction, edge);
  const glowImage = gradient("glow", passedProps.direction, edge);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ maskImage, WebkitMaskImage: maskImage }}>
        {children}
      </AbsoluteFill>
      {/* Glowing build-head riding the reveal edge */}
      <AbsoluteFill
        style={{
          backgroundImage: glowImage,
          filter: "blur(7px)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export const buildSweep = (
  direction: SweepDirection,
): TransitionPresentation<BuildSweepProps> => ({
  component: BuildSweep,
  props: { direction },
});
```

- [ ] **Step 2: Lint (typecheck)**

Run: `bun run lint`
Expected: PASS (no eslint/tsc errors). If tsc complains that `{ direction }`
doesn't satisfy `Record<string, unknown>`, it won't — string-union props are
assignable to `unknown`. Fix any unused-import lint nits if they appear.

- [ ] **Step 3: Commit**

```bash
git add src/components/BuildSweep.tsx
git commit -m "feat(dad-revamp): add buildSweep transition presentation"
```

---

### Task 3: The `DadRevampVideo` composition component

**Files:**
- Create: `src/components/DadRevampVideo.tsx`

This holds the beat/transition arrays (the **tunable cut points**), the phone
framing, OLD/NEW pills, music envelope, glitch SFX, and the end stamp + VO.

- [ ] **Step 1: Write the component**

```tsx
import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { COLORS } from "../colors";
import { INTER } from "../fonts";
import { PhoneMockup } from "./PhoneMockup";
import { buildSweep, type SweepDirection } from "./BuildSweep";

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);

const OLD_VIDEO = "content/dad-revamp/old.webm";
const NEW_VIDEO = "content/dad-revamp/new.webm";
const MUSIC = "content/devops1-bootcamp/bg-music-clawdlens-v2.mp3";
const GLITCH = "content/dad-revamp/sfx/glitch.mp3";
const END_VO = "voiceover/dad-revamp/end.mp3";

// Phone fills most of the 1920 height; 9:16 frame → width 844.
const PHONE_HEIGHT = 1500;

// --- Beats: thematic old/new pairs. Source windows (seconds) are TUNABLE. ----
type Beat = {
  src: "old" | "new";
  from: number;
  to: number;
  label: "OLD" | "NEW";
};
const BEATS: Beat[] = [
  { src: "old", from: 1.0, to: 7.0, label: "OLD" }, // 1 hero (before)
  { src: "new", from: 1.0, to: 7.5, label: "NEW" }, // 2 hero (after)
  { src: "old", from: 36.0, to: 42.0, label: "OLD" }, // 3 projects (before)
  { src: "new", from: 9.0, to: 15.0, label: "NEW" }, // 4 products (after)
  { src: "old", from: 30.0, to: 35.5, label: "OLD" }, // 5 footer (before)
  { src: "new", from: 40.0, to: 47.0, label: "NEW" }, // 6 product page (after)
];
const BEAT_FRAMES = BEATS.map((b) => sec(b.to) - sec(b.from));

// --- Transitions between beats (5). Build sweeps on O→N, fade on N→O. --------
const SWEEP = 18;
const RESET = 8;
type Trans =
  | { kind: "sweep"; dir: SweepDirection; frames: number }
  | { kind: "reset"; frames: number };
const TRANSITIONS: Trans[] = [
  { kind: "sweep", dir: "down", frames: SWEEP }, // T0 old→new hero
  { kind: "reset", frames: RESET }, // T1 new→old
  { kind: "sweep", dir: "diagonal", frames: SWEEP }, // T2 old→new products
  { kind: "reset", frames: RESET }, // T3 new→old
  { kind: "sweep", dir: "radial", frames: SWEEP }, // T4 old→new product page
];
const TRANS_FRAMES = TRANSITIONS.reduce((a, t) => a + t.frames, 0);

export const DADREVAMP_TOTAL_FRAMES =
  BEAT_FRAMES.reduce((a, b) => a + b, 0) - TRANS_FRAMES;

// Absolute start frame of each beat (transitions overlap, shortening the line).
const BEAT_START: number[] = BEAT_FRAMES.reduce<number[]>((acc, _d, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + BEAT_FRAMES[i - 1] - TRANSITIONS[i - 1].frames);
  return acc;
}, []);

// Each build sweep's SFX starts at the entering (new) beat's start.
const SWEEP_SFX_FRAMES = TRANSITIONS.map((t, i) =>
  t.kind === "sweep" ? BEAT_START[i + 1] : null,
).filter((f): f is number => f !== null);

// --- End stamp + VO timing ---------------------------------------------------
const END_HOLD = sec(3.0);
const END_STAMP_FROM = DADREVAMP_TOTAL_FRAMES - END_HOLD;
const VO_FROM = END_STAMP_FROM + sec(0.5);
const VO_DUR = sec(2.3); // re-measured from end.mp3 in Task 5

// --- Music bed: fade in, steady, duck under the VO, fade out ------------------
const MUSIC_BASE = 0.4;
const MUSIC_DUCK = 0.14;
const MUSIC_RAMP = 10;
const musicVolume = (f: number): number => {
  const envelope = interpolate(
    f,
    [0, 14, DADREVAMP_TOTAL_FRAMES - 30, DADREVAMP_TOTAL_FRAMES],
    [0, MUSIC_BASE, MUSIC_BASE, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const duck = interpolate(
    f,
    [VO_FROM - MUSIC_RAMP, VO_FROM, VO_FROM + VO_DUR, VO_FROM + VO_DUR + MUSIC_RAMP],
    [1, MUSIC_DUCK / MUSIC_BASE, MUSIC_DUCK / MUSIC_BASE, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return envelope * Math.min(1, duck);
};

// --- OLD/NEW pill, floating just above the phone -----------------------------
const PillLabel: React.FC<{ label: "OLD" | "NEW" }> = ({ label }) => {
  const isNew = label === "NEW";
  return (
    <div
      style={{
        position: "absolute",
        top: -76,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        padding: "10px 30px",
        borderRadius: 999,
        fontFamily: INTER,
        fontWeight: 800,
        fontSize: 34,
        letterSpacing: 3,
        color: isNew ? "#06231a" : "#2a0e0e",
        background: isNew ? COLORS.accent : "#ef4444",
        boxShadow: `0 8px 30px ${
          isNew ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.45)"
        }`,
      }}
    >
      {label}
    </div>
  );
};

// --- One beat: the recording inside the phone, on a branded gradient ---------
const BeatView: React.FC<{ beat: Beat }> = ({ beat }) => {
  const src = beat.src === "old" ? OLD_VIDEO : NEW_VIDEO;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background:
          "radial-gradient(120% 120% at 50% 0%, #1b2a4a 0%, #0b1020 55%, #05070f 100%)",
      }}
    >
      <div style={{ position: "relative" }}>
        <PillLabel label={beat.label} />
        <PhoneMockup height={PHONE_HEIGHT}>
          <AbsoluteFill>
            <Video
              src={staticFile(src)}
              trimBefore={sec(beat.from)}
              trimAfter={sec(beat.to)}
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </AbsoluteFill>
        </PhoneMockup>
      </div>
    </AbsoluteFill>
  );
};

// --- End stamp: new site stays behind a scrim; "Rebuilt by Claude Fable" -----
const EndStamp: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(frame, [0, 22], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(5,7,15,0.72)",
        opacity: appear,
      }}
    >
      <div
        style={{
          textAlign: "center",
          transform: `translateY(${rise}px)`,
          fontFamily: INTER,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: COLORS.muted,
          }}
        >
          Double A Digital
        </div>
        <div
          style={{
            marginTop: 22,
            fontWeight: 800,
            fontSize: 78,
            lineHeight: 1.05,
            letterSpacing: -1,
            color: COLORS.white,
          }}
        >
          Rebuilt by
          <br />
          <span style={{ color: COLORS.accent }}>Claude Fable</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const DadRevampVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#05070f" }}>
      {/* Music bed */}
      <Audio src={staticFile(MUSIC)} volume={musicVolume} />

      {/* Footage beats with sweeps (O→N) and fades (N→O) */}
      <TransitionSeries>
        {BEATS.flatMap((beat, i) => {
          const seq = (
            <TransitionSeries.Sequence
              key={`seq-${i}`}
              durationInFrames={BEAT_FRAMES[i]}
            >
              <BeatView beat={beat} />
            </TransitionSeries.Sequence>
          );
          if (i === BEATS.length - 1) return [seq];
          const t = TRANSITIONS[i];
          const transition = (
            <TransitionSeries.Transition
              key={`trans-${i}`}
              timing={linearTiming({ durationInFrames: t.frames })}
              presentation={
                t.kind === "sweep"
                  ? buildSweep(t.dir)
                  : fade({ shouldFadeOutExitingScene: true })
              }
            />
          );
          return [seq, transition];
        })}
      </TransitionSeries>

      {/* Glitch SFX on each build sweep */}
      {SWEEP_SFX_FRAMES.map((f, i) => (
        <Sequence key={`glitch-${i}`} from={f} durationInFrames={sec(0.5)}>
          <Audio src={staticFile(GLITCH)} volume={0.5} />
        </Sequence>
      ))}

      {/* End stamp + voiceover */}
      <Sequence from={END_STAMP_FROM} durationInFrames={END_HOLD}>
        <EndStamp />
      </Sequence>
      <Sequence from={VO_FROM}>
        <Audio src={staticFile(END_VO)} volume={1.1} />
      </Sequence>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Lint (typecheck)**

Run: `bun run lint`
Expected: PASS. Common fixes: if `TransitionSeries.flatMap` children trip the
runtime validator at render time (not lint), fall back to listing the 6
`Sequence` + 5 `Transition` children explicitly — same props, no map.

- [ ] **Step 3: Commit**

```bash
git add src/components/DadRevampVideo.tsx
git commit -m "feat(dad-revamp): add glow-up composition component"
```

---

### Task 4: Register the composition

**Files:**
- Modify: `src/Root.tsx`

- [ ] **Step 1: Add the import** (top of `src/Root.tsx`, after the existing imports)

```tsx
import {
  DadRevampVideo,
  DADREVAMP_TOTAL_FRAMES,
} from "./components/DadRevampVideo";
```

- [ ] **Step 2: Add the `<Composition>`** (inside the `<>` fragment, after the `clawdlens-v2` composition)

```tsx
    <Composition
      id="dad-revamp"
      component={DadRevampVideo}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={DADREVAMP_TOTAL_FRAMES}
    />
```

- [ ] **Step 3: Lint**

Run: `bun run lint`
Expected: PASS.

- [ ] **Step 4: Render a still at the first build sweep to verify the glow edge**

Run: `npx remotion still dad-revamp out/dr-sweep1.png --frame=171`
Expected: a still ~9 frames into the down sweep — the NEW hero partly revealed
from the top, an accent-green glow band across the reveal edge, old hero below.
Open `out/dr-sweep1.png` and confirm. (Frame 171 = beat-2 start 162 + ~9.)

- [ ] **Step 5: Render stills at each beat mid-point to sanity-check framing**

Run:
```bash
npx remotion still dad-revamp out/dr-b1.png --frame=80
npx remotion still dad-revamp out/dr-b2.png --frame=260
npx remotion still dad-revamp out/dr-b3.png --frame=430
npx remotion still dad-revamp out/dr-b4.png --frame=600
npx remotion still dad-revamp out/dr-b5.png --frame=760
npx remotion still dad-revamp out/dr-b6.png --frame=920
```
Expected: phone-framed site in each, OLD/NEW pill correct per beat, important
content not cropped off the top/bottom by `objectFit: cover`. Note any beat
where the hero/nav is cropped — fixed in Task 6.

- [ ] **Step 6: Commit**

```bash
git add src/Root.tsx
git commit -m "feat(dad-revamp): register dad-revamp composition"
```

---

### Task 5: Generate the end-stamp voiceover

**Files:**
- Create: `generate-voiceover.ts` (repo root)
- Create: `public/voiceover/dad-revamp/end.mp3`

Requires `ELEVENLABS_API_KEY` in the environment (or `.env`). If you don't have
one, skip generation and drop a hand-made `end.mp3` at the path below instead —
the rest of the reel renders without it (only the closing line is missing).

- [ ] **Step 1: Write the generation script**

```ts
// One-off: generate the end-stamp VO via ElevenLabs.
// Run: ELEVENLABS_API_KEY=... bun generate-voiceover.ts
import { writeFileSync, mkdirSync } from "node:fs";

const VOICE_ID = "TX3LPaxmHKxFdv7VOQHJ"; // "Liam" — swap for a robotic/system voice to taste
const TEXT = "Rebuilt by Claude Fable.";
const OUT_DIR = "public/voiceover/dad-revamp";
const OUT = `${OUT_DIR}/end.mp3`;

const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error("ELEVENLABS_API_KEY not set");

const res = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
  {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: TEXT,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.4, similarity_boost: 0.75, style: 0.5 },
    }),
  },
);
if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, Buffer.from(await res.arrayBuffer()));
console.log("wrote", OUT);
```

- [ ] **Step 2: Run it**

Run: `bun generate-voiceover.ts`
Expected: `wrote public/voiceover/dad-revamp/end.mp3`.

- [ ] **Step 3: Measure the duration and update `VO_DUR` if needed**

Run: `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 public/voiceover/dad-revamp/end.mp3`
Then in `src/components/DadRevampVideo.tsx`, set `VO_DUR = sec(<measured seconds, rounded up>)`.
If the line is longer than ~2.4s, also bump `END_HOLD` so the VO fits inside the
end stamp (`END_HOLD` should be ≥ `0.5 + VO_seconds + 0.3`).

- [ ] **Step 4: Lint + render the closing clip to hear/see it land**

Run:
```bash
bun run lint
npx remotion still dad-revamp out/dr-end.png --frame=1010
```
Expected: lint PASS; `out/dr-end.png` shows the new site behind a dark scrim
with "Rebuilt by **Claude Fable**". (Audio is verified in the Task 7 full render.)

- [ ] **Step 5: Commit**

```bash
git add generate-voiceover.ts public/voiceover/dad-revamp/end.mp3 src/components/DadRevampVideo.tsx
git commit -m "feat(dad-revamp): generate end-stamp voiceover"
```

---

### Task 6: Scrub & finalize the six segment windows

**Files:**
- Modify: `src/components/DadRevampVideo.tsx` (the `BEATS` array only)

The `BEATS` `from`/`to` values are first guesses from sampled frames. Finalize
them so each beat shows a strong, representative slice and the `objectFit: cover`
crop doesn't hide the hero/nav.

- [ ] **Step 1: Export reference frames from the raw recordings**

Run:
```bash
mkdir -p out/scrub
for t in 1 4 7 10 13 16 30 33 36 39 42; do
  ffmpeg -v error -ss $t -i public/content/dad-revamp/old.webm -frames:v 1 out/scrub/old_${t}s.jpg -y
done
for t in 1 4 7 9 12 15 40 43 46 48 52; do
  ffmpeg -v error -ss $t -i public/content/dad-revamp/new.webm -frames:v 1 out/scrub/new_${t}s.jpg -y
done
```
Expected: JPGs in `out/scrub/`. Eyeball them to choose the best ~5.5–7s window
per beat: 1 old-hero, 2 new-hero, 3 old-projects, 4 new-products, 5 old-footer,
6 new-product-page.

- [ ] **Step 2: Update the `BEATS` windows**

Edit the `from`/`to` seconds in the `BEATS` array to your chosen windows. Keep
each beat ≥ 5.5s so it breathes. (Changing these automatically updates
`BEAT_FRAMES`, `BEAT_START`, `DADREVAMP_TOTAL_FRAMES`, and the SFX/end timing.)

- [ ] **Step 3: Lint + re-render beat stills to confirm**

Run:
```bash
bun run lint
npx remotion still dad-revamp out/dr-b1.png --frame=80
npx remotion still dad-revamp out/dr-b4.png --frame=600
```
Expected: lint PASS; chosen content visible and not cropped. (Re-check other
beats as needed — frame numbers shift if you changed durations; use Remotion
Studio `bun run dev` to scrub interactively instead.)

- [ ] **Step 4: Commit**

```bash
git add src/components/DadRevampVideo.tsx
git commit -m "feat(dad-revamp): finalize segment cut points"
```

---

### Task 7: Full render & final verification

**Files:** none (render only)

- [ ] **Step 1: Lint once more**

Run: `bun run lint`
Expected: PASS.

- [ ] **Step 2: Render the full reel**

Run: `npx remotion render dad-revamp out/dad-revamp.mp4`
Expected: completes; `out/dad-revamp.mp4` written, ~35s, 1080×1920.

- [ ] **Step 3: Verify the output**

Run: `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -show_entries format=duration -of default=noprint_wrappers=1 out/dad-revamp.mp4`
Expected: `width=1080`, `height=1920`, duration ~`34.7` (or your tuned length).

Then watch it and confirm:
- 3 OLD→NEW build sweeps with the green glow edge (down / diagonal / radial),
  each with the glitch SFX; OLD↔NEW pills flip correctly.
- 2 NEW→OLD fades read as clean topic resets.
- Music fades in, ducks under the closing VO, fades out.
- Ends on the new site with "Rebuilt by Claude Fable" + VO.

- [ ] **Step 4: Commit the render**

```bash
git add out/dad-revamp.mp4
git commit -m "feat(dad-revamp): render before/after glow-up reel"
```

---

## Self-review

**Spec coverage:**
- 1080×1920 @30fps ~40s comp → Task 3 (`DADREVAMP_TOTAL_FRAMES` ≈ 1040 = ~34.7s) + Task 4. ✓
- Footage → `public/content/dad-revamp/` → Task 1. ✓
- Phone mockup framing → Task 3 `BeatView`/`PhoneMockup`. ✓
- 6 beats alternating O→N, ending on new → Task 3 `BEATS`. ✓
- OLD/NEW pill flips per beat → Task 3 `PillLabel`. ✓
- Build-sweep signature on O→N, varied direction (down/diagonal/radial) → Task 2 + Task 3 `TRANSITIONS`. ✓
- Plain dip/fade on N→O resets → Task 3 `fade({shouldFadeOutExitingScene})`. ✓
- Glitch SFX on each sweep → Task 3 `SWEEP_SFX_FRAMES` + `glitch.mp3` (exists). ✓
- Music bed only on beats, ducked under end VO, fade out → Task 3 `musicVolume`. ✓
- End stamp "Rebuilt by Claude Fable" + VO → Task 3 `EndStamp` + Task 5. ✓
- Tunable cut points / scrub → Task 6. ✓
- Render to `out/dad-revamp.mp4` + lint passes → Task 7. ✓

**Placeholder scan:** No TBD/TODO. `VO_DUR`/`BEATS` windows are explicitly
tunable values with a task (5 / 6) to finalize them, not placeholders — they
render as-is with the given defaults.

**Type consistency:** `SweepDirection` ("down"|"diagonal"|"radial") defined in
`BuildSweep.tsx`, imported and used in `TRANSITIONS`. `buildSweep(dir)` returns
`TransitionPresentation`. `DADREVAMP_TOTAL_FRAMES` exported from
`DadRevampVideo.tsx`, imported in `Root.tsx`. Audio/Video from `@remotion/media`
with `trimBefore`/`trimAfter` in frames (matches `ClawdLensV2Video`). Consistent.

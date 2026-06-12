# Docker "What is Docker" Explainer Beat — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Insert a ~10s silent, icon-driven "what is Docker" explainer beat ("build once, run anywhere") after the brand reveal, extending the reel to 40s, carried by SFX with the music bed gated off.

**Architecture:** Single-file Remotion composition (`DockerCtaVideo.tsx`). A new `ExplainerBeat` component mounts in a `<Sequence>` at frame 255; every downstream beat and VO clip 03–09 shifts +300 frames. Two new SFX (`explain-pad`, `chime3`) are synthesized with ffmpeg via a committed generator script; existing `whoosh`/`ding` are reused. Music is disabled behind a `MUSIC_ENABLED` flag.

**Tech Stack:** Remotion 4.0.446 (React 19, TypeScript), `@mdi/js`, ffmpeg 8.1. No unit-test framework — verification = `npm run lint` (eslint + tsc) + `npx remotion still` + full render + `ffprobe`/`volumedetect`.

**Reference spec:** `docs/superpowers/specs/2026-06-12-docker-explainer-beat-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `scripts/synth-docker-sfx.sh` | NEW — reproducible ffmpeg generator for the two explainer SFX |
| `public/content/docker-cta/sfx/explain-pad.mp3` | NEW asset — ambient riser under the entrance |
| `public/content/docker-cta/sfx/chime3.mp3` | NEW asset — ascending 3-note ding for destinations |
| `src/components/DockerCtaVideo.tsx` | retimed constants, `ExplainerBeat` + sub-pieces, `MUSIC_ENABLED` gate, explainer SFX wiring |
| `src/Root.tsx` | none — `durationInFrames` derives from `DOCKERCTA_TOTAL_FRAMES` |

Task order: **1** synth assets → **2** retime constants → **3** build + mount the beat → **4** audio (music gate + SFX). Each task ends lint-clean and committed.

---

## Task 1: Synthesize the explainer SFX

**Files:**
- Create: `scripts/synth-docker-sfx.sh`
- Create (generated): `public/content/docker-cta/sfx/explain-pad.mp3`, `public/content/docker-cta/sfx/chime3.mp3`

- [ ] **Step 1: Write the generator script**

Create `scripts/synth-docker-sfx.sh`:

```bash
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
```

- [ ] **Step 2: Make it executable and run it**

Run:
```bash
chmod +x scripts/synth-docker-sfx.sh && ./scripts/synth-docker-sfx.sh
```
Expected: ffmpeg runs twice without error; final `wrote:` line lists both mp3 files with non-zero sizes.

- [ ] **Step 3: Verify durations and that the files are real audio**

Run:
```bash
for f in explain-pad chime3; do
  echo -n "$f: "
  ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 \
    "public/content/docker-cta/sfx/$f.mp3"
done
```
Expected: `explain-pad:` ≈ `3.5`, `chime3:` ≈ `1.3` (both > 0, no error).

- [ ] **Step 4: Confirm the assets are tracked (not gitignored)**

Run:
```bash
git status --short public/content/docker-cta/sfx/explain-pad.mp3 \
  public/content/docker-cta/sfx/chime3.mp3
```
Expected: both shown as untracked (`??`). If they do NOT appear, they are being ignored — stop and report (existing sibling `whoosh.mp3` is tracked, so they should not be).

- [ ] **Step 5: Commit**

```bash
git add scripts/synth-docker-sfx.sh \
  public/content/docker-cta/sfx/explain-pad.mp3 \
  public/content/docker-cta/sfx/chime3.mp3
git commit -m "chore(docker-cta): synth explainer SFX (ambient pad + ascending chime)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Retime constants and shift downstream beats + VO

After this task the reel renders at 40s with hook → brand → a 10s background-only gap → curriculum → CTA. The gap is filled in Task 3.

**Files:**
- Modify: `src/components/DockerCtaVideo.tsx` (constants only)

- [ ] **Step 1: Bump the total frame count**

Replace line 23:
```ts
export const DOCKERCTA_TOTAL_FRAMES = 900;
```
with:
```ts
export const DOCKERCTA_TOTAL_FRAMES = 1200;
```

- [ ] **Step 2: Add the explainer constants and shift the beat timing**

Replace the whole beat-timing block (currently lines 39–60):
```ts
// ---- Beat timing (frames @ 30fps) ----
const HOOK_FROM = 0;
const HOOK_DUR = 135;
const BRAND_FROM = 135;
const BRAND_DUR = 120;
const CURR_FROM = 255;
const CURR_DUR = 405;
const CTA_FROM = 660;
const CTA_DUR = 240;

const HEADER_FROM = 255;
const CARDS: { label: string; from: number }[] = [
  { label: "Docker Basics", from: 309 },
  { label: "Images & Containers", from: 375 },
  { label: "Docker Compose", from: 441 },
  { label: "Troubleshoot & Secure", from: 507 },
  { label: "Backup & Restore", from: 573 },
];

const DATE_FROM = 660;
const VENUE_FROM = 735;
const CTA_REVEAL_FROM = 795;
```
with:
```ts
// ---- Beat timing (frames @ 30fps) ----
const HOOK_FROM = 0;
const HOOK_DUR = 135;
const BRAND_FROM = 135;
const BRAND_DUR = 120;

// Explainer beat ("what is Docker"); everything below shifts +300 vs the 30s cut.
const EXPLAIN_FROM = 255;
const EXPLAIN_DUR = 300;

const CURR_FROM = 555;
const CURR_DUR = 405;
const CTA_FROM = 960;
const CTA_DUR = 240;

const HEADER_FROM = 555;
const CARDS: { label: string; from: number }[] = [
  { label: "Docker Basics", from: 609 },
  { label: "Images & Containers", from: 675 },
  { label: "Docker Compose", from: 741 },
  { label: "Troubleshoot & Secure", from: 807 },
  { label: "Backup & Restore", from: 873 },
];

const DATE_FROM = 960;
const VENUE_FROM = 1035;
const CTA_REVEAL_FROM = 1095;
```

- [ ] **Step 3: Shift VO clips 03–09 by +300 (01–02 unchanged)**

Replace the `VOICEOVER` array (currently lines 77–87):
```ts
const VOICEOVER: { file: string; from: number; durationInFrames: number }[] = [
  { file: "voiceover/docker-cta/01.mp3", from: 8, durationInFrames: 78 },
  { file: "voiceover/docker-cta/02.mp3", from: 150, durationInFrames: 58 },
  { file: "voiceover/docker-cta/03.mp3", from: 258, durationInFrames: 32 },
  { file: "voiceover/docker-cta/04.mp3", from: 312, durationInFrames: 40 },
  { file: "voiceover/docker-cta/05.mp3", from: 378, durationInFrames: 59 },
  { file: "voiceover/docker-cta/06.mp3", from: 444, durationInFrames: 38 },
  { file: "voiceover/docker-cta/07.mp3", from: 510, durationInFrames: 52 },
  { file: "voiceover/docker-cta/08.mp3", from: 576, durationInFrames: 56 },
  { file: "voiceover/docker-cta/09.mp3", from: 660, durationInFrames: 74 },
];
```
with:
```ts
const VOICEOVER: { file: string; from: number; durationInFrames: number }[] = [
  { file: "voiceover/docker-cta/01.mp3", from: 8, durationInFrames: 78 },
  { file: "voiceover/docker-cta/02.mp3", from: 150, durationInFrames: 58 },
  { file: "voiceover/docker-cta/03.mp3", from: 558, durationInFrames: 32 },
  { file: "voiceover/docker-cta/04.mp3", from: 612, durationInFrames: 40 },
  { file: "voiceover/docker-cta/05.mp3", from: 678, durationInFrames: 59 },
  { file: "voiceover/docker-cta/06.mp3", from: 744, durationInFrames: 38 },
  { file: "voiceover/docker-cta/07.mp3", from: 810, durationInFrames: 52 },
  { file: "voiceover/docker-cta/08.mp3", from: 876, durationInFrames: 56 },
  { file: "voiceover/docker-cta/09.mp3", from: 960, durationInFrames: 74 },
];
```

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: exit 0 (no errors). `EXPLAIN_FROM`/`EXPLAIN_DUR` are not yet referenced — eslint's `no-unused-vars` WILL flag them. If it does, that is expected at this point; proceed to Step 5 which renders a still, then commit only after Task 3 references them. **If lint fails solely on `EXPLAIN_FROM`/`EXPLAIN_DUR` unused, skip the lint gate for this task and note it** — they are consumed in Task 3. All other code must be clean.

> Note for the implementer: to keep every commit lint-clean, Task 2 and Task 3 may be committed together if the unused-constant lint error blocks Task 2's commit. Prefer that over disabling the lint rule.

- [ ] **Step 5: Render a shifted-curriculum still to confirm the shift**

Run: `npx remotion still docker-cta out/t2-curr.png --frame=620`
Expected: PNG written; it shows the curriculum header "You will learn:" with the first card ("Docker Basics") — confirming the curriculum now lives at ~frame 620 (was ~320).

- [ ] **Step 6: Commit (if lint is clean; otherwise defer to Task 3)**

```bash
git add src/components/DockerCtaVideo.tsx
git commit -m "feat(docker-cta): retime beats +300f for explainer, total 40s

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Build and mount the ExplainerBeat

**Files:**
- Modify: `src/components/DockerCtaVideo.tsx` (new imports, new component + sub-pieces, mount Sequence)

- [ ] **Step 1: Add the new icon imports**

Replace the `@mdi/js` import block (currently lines 11–18):
```ts
import {
  mdiDocker,
  mdiCheckCircle,
  mdiCalendar,
  mdiMapMarker,
  mdiWhatsapp,
  mdiArrowRight,
} from "@mdi/js";
```
with:
```ts
import {
  mdiDocker,
  mdiCheckCircle,
  mdiCalendar,
  mdiMapMarker,
  mdiWhatsapp,
  mdiArrowRight,
  mdiPackageVariant,
  mdiLaptop,
  mdiServer,
  mdiCloud,
  mdiArrowDown,
} from "@mdi/js";
```

- [ ] **Step 2: Add the explainer copy constants**

Immediately below the `CURSOR_BLINK` constant (currently line 63, `const CURSOR_BLINK = 16;`), add:
```ts
const EXPLAIN_APP_LABEL = "your app + all its deps";
const EXPLAIN_TAGLINE = "runs the SAME everywhere";
```

- [ ] **Step 3: Add the explainer sub-pieces and main beat component**

Insert this block immediately AFTER the `BrandBeat` component closes (after its `};` at current line 258) and BEFORE the `ContainerCard` component:

```tsx
// ---- Explainer: down-arrow connector ----
const DownArrow: React.FC<{ localFrom: number }> = ({ localFrom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - localFrom,
    fps,
    config: { damping: 18, stiffness: 200 },
  });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [-12, 0])}px)`,
      }}
    >
      <MdiIcon path={mdiArrowDown} size={56} color={DOCKER.ice} />
    </div>
  );
};

// ---- Explainer: a destination chip (laptop / server / cloud) ----
const DestChip: React.FC<{
  localFrom: number;
  icon: string;
  label: string;
}> = ({ localFrom, icon, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - localFrom,
    fps,
    config: { damping: 14, stiffness: 200 },
  });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px) scale(${interpolate(
          p,
          [0, 1],
          [0.8, 1],
        )})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "24px 26px",
        borderRadius: 20,
        background: DOCKER.cardFill,
        border: `2px solid ${DOCKER.cardEdge}`,
        boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
        minWidth: 188,
      }}
    >
      <MdiIcon path={icon} size={84} color={DOCKER.ice} />
      <span
        style={{
          fontFamily: INTER,
          fontWeight: 700,
          fontSize: 38,
          color: DOCKER.white,
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ---- Explainer beat: "build once, run anywhere" ----
const ExplainerBeat: React.FC = () => {
  const frame = useCurrentFrame(); // relative to EXPLAIN_FROM
  const { fps } = useVideoConfig();

  const card = spring({
    frame: frame - 30,
    fps,
    config: { damping: 16, stiffness: 180 },
  });
  const cardX = interpolate(card, [0, 1], [520, 0]);
  const whale = spring({
    frame: frame - 90,
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  const out = interpolate(frame, [EXPLAIN_DUR - 16, EXPLAIN_DUR], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 18,
        opacity: out,
        padding: 70,
      }}
    >
      {/* title — types in from local frame 0 */}
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 62,
          letterSpacing: -1,
          color: DOCKER.white,
          textAlign: "center",
          marginBottom: 10,
          textShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}
      >
        <TypingText
          text={"WHAT IS DOCKER?"}
          charFrames={CHAR_FRAMES}
          cursorBlinkFrames={CURSOR_BLINK}
          cursorColor={DOCKER.ice}
        />
      </div>

      {/* app package card */}
      <div
        style={{
          opacity: card,
          transform: `translateX(${cardX}px)`,
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "26px 34px",
          borderRadius: 22,
          backgroundImage: `repeating-linear-gradient(90deg, ${DOCKER.cardFill} 0px, ${DOCKER.cardFill} 26px, #1A57B0 26px, #1A57B0 30px)`,
          border: `2px solid ${DOCKER.cardEdge}`,
          boxShadow: "0 18px 46px rgba(0,0,0,0.4)",
        }}
      >
        <MdiIcon path={mdiPackageVariant} size={64} color={DOCKER.ice} />
        <span
          style={{
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 44,
            color: DOCKER.white,
          }}
        >
          {EXPLAIN_APP_LABEL}
        </span>
      </div>

      <DownArrow localFrom={82} />

      {/* docker whale */}
      <div
        style={{
          position: "relative",
          transform: `scale(${whale})`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${DOCKER.ice} 0%, transparent 65%)`,
            opacity: 0.35,
          }}
        />
        <MdiIcon path={mdiDocker} size={190} color={DOCKER.white} />
      </div>

      <DownArrow localFrom={147} />

      {/* destinations */}
      <div style={{ display: "flex", gap: 26 }}>
        <DestChip localFrom={155} icon={mdiLaptop} label="laptop" />
        <DestChip localFrom={175} icon={mdiServer} label="server" />
        <DestChip localFrom={195} icon={mdiCloud} label="cloud" />
      </div>

      {/* tagline — nested Sequence so TypingText starts typing at local 240 */}
      <Sequence from={240}>
        <div
          style={{
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 44,
            color: DOCKER.ice,
            textAlign: "center",
            marginTop: 16,
          }}
        >
          <TypingText
            text={EXPLAIN_TAGLINE}
            charFrames={CHAR_FRAMES}
            cursorBlinkFrames={CURSOR_BLINK}
            cursorColor={DOCKER.white}
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 4: Mount the beat in the composition**

In the `DockerCtaVideo` render, insert the explainer `<Sequence>` between the `BrandBeat` sequence and the `CurriculumBeat` sequence. Find:
```tsx
      <Sequence from={BRAND_FROM} durationInFrames={BRAND_DUR}>
        <BrandBeat />
      </Sequence>
      <Sequence from={CURR_FROM} durationInFrames={CURR_DUR}>
        <CurriculumBeat />
      </Sequence>
```
Replace with:
```tsx
      <Sequence from={BRAND_FROM} durationInFrames={BRAND_DUR}>
        <BrandBeat />
      </Sequence>
      <Sequence from={EXPLAIN_FROM} durationInFrames={EXPLAIN_DUR}>
        <ExplainerBeat />
      </Sequence>
      <Sequence from={CURR_FROM} durationInFrames={CURR_DUR}>
        <CurriculumBeat />
      </Sequence>
```

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: exit 0. All new imports/constants (`EXPLAIN_FROM`, `EXPLAIN_DUR`, the icons, the labels) are now referenced.

- [ ] **Step 6: Render stills across the beat**

Run:
```bash
npx remotion still docker-cta out/t3-title.png  --frame=275
npx remotion still docker-cta out/t3-card.png   --frame=300
npx remotion still docker-cta out/t3-whale.png  --frame=360
npx remotion still docker-cta out/t3-chips.png  --frame=465
npx remotion still docker-cta out/t3-tag.png    --frame=540
```
Expected: five PNGs. Inspect them — title "WHAT IS DOCKER?" typing (275), app card present (300), whale + first arrow (360), three destination chips (465), tagline "runs the SAME everywhere" with curriculum NOT yet started (540). Read each PNG to confirm.

- [ ] **Step 7: Commit**

```bash
git add src/components/DockerCtaVideo.tsx
git commit -m "feat(docker-cta): add 'what is Docker' explainer beat

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

(If Task 2's commit was deferred for the unused-constant lint issue, this commit covers both Task 2 and Task 3 changes — `git add` the same file and the message above suffices.)

---

## Task 4: Audio — gate music off and wire explainer SFX

**Files:**
- Modify: `src/components/DockerCtaVideo.tsx` (audio constants + render audio)

- [ ] **Step 1: Add the music flag and the new SFX paths**

Find the audio constants block (currently lines 65–74):
```ts
// ---- Audio ----
const MUSIC = "content/docker-cta/bg-music.mp3";
const CLICK_SFX = "content/devops1-bootcamp/sfx/click.mp3";
const DING_SFX = "content/devops1-bootcamp/sfx/ding.mp3";
const WHOOSH_SFX = "content/docker-cta/sfx/whoosh.mp3";
const SWELL_SFX = "content/docker-cta/sfx/swell.mp3";

const MUSIC_BASE = 0.36; // bed level in gaps
const MUSIC_DUCK = 0.14; // bed level under VO
const DUCK_RAMP = 8;
```
Replace with:
```ts
// ---- Audio ----
const MUSIC_ENABLED = false; // music bed disabled for now; flip to true to restore
const MUSIC = "content/docker-cta/bg-music.mp3";
const CLICK_SFX = "content/devops1-bootcamp/sfx/click.mp3";
const DING_SFX = "content/devops1-bootcamp/sfx/ding.mp3";
const WHOOSH_SFX = "content/docker-cta/sfx/whoosh.mp3";
const SWELL_SFX = "content/docker-cta/sfx/swell.mp3";
const EXPLAIN_PAD_SFX = "content/docker-cta/sfx/explain-pad.mp3";
const CHIME3_SFX = "content/docker-cta/sfx/chime3.mp3";

const MUSIC_BASE = 0.36; // bed level in gaps
const MUSIC_DUCK = 0.14; // bed level under VO
const DUCK_RAMP = 8;
```

- [ ] **Step 2: Gate the music mount**

In `DockerCtaVideo`, find:
```tsx
      <Audio src={staticFile(MUSIC)} volume={musicVolume} />
```
Replace with:
```tsx
      {MUSIC_ENABLED && <Audio src={staticFile(MUSIC)} volume={musicVolume} />}
```
(`musicVolume`, `MUSIC`, `MUSIC_BASE`, `MUSIC_DUCK`, `DUCK_RAMP` remain lexically referenced here, so eslint will not flag them.)

- [ ] **Step 3: Add the explainer SFX sequences**

Find the brand whoosh SFX in the render:
```tsx
      <Sequence from={BRAND_FROM}>
        <Audio src={staticFile(WHOOSH_SFX)} volume={0.7} />
      </Sequence>
```
Insert the explainer SFX block immediately AFTER it:
```tsx
      <Sequence from={BRAND_FROM}>
        <Audio src={staticFile(WHOOSH_SFX)} volume={0.7} />
      </Sequence>

      {/* Explainer beat SFX (silent VO; SFX carries the beat) */}
      <Sequence from={EXPLAIN_FROM}>
        <Audio src={staticFile(EXPLAIN_PAD_SFX)} volume={0.5} />
      </Sequence>
      <Sequence from={EXPLAIN_FROM + 30}>
        <Audio src={staticFile(WHOOSH_SFX)} volume={0.7} />
      </Sequence>
      <Sequence from={EXPLAIN_FROM + 90}>
        <Audio src={staticFile(WHOOSH_SFX)} volume={0.7} />
      </Sequence>
      <Sequence from={EXPLAIN_FROM + 155}>
        <Audio src={staticFile(CHIME3_SFX)} volume={0.8} />
      </Sequence>
      <Sequence from={EXPLAIN_FROM + 280}>
        <Audio src={staticFile(DING_SFX)} volume={0.8} />
      </Sequence>
```

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: exit 0. `EXPLAIN_PAD_SFX` and `CHIME3_SFX` are now referenced; `MUSIC_ENABLED` is referenced in the guard.

- [ ] **Step 5: Full render**

Run: `npx remotion render docker-cta out/docker-cta.mp4 --codec=h264 --crf=18`
Expected: render completes with no error; output written to `out/docker-cta.mp4`.

- [ ] **Step 6: Verify duration and no clipping**

Run:
```bash
echo -n "duration: "
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 out/docker-cta.mp4
ffmpeg -i out/docker-cta.mp4 -af volumedetect -f null - 2>&1 | grep -E "max_volume|mean_volume"
```
Expected: `duration:` ≈ `40.0`; `max_volume` is below `0.0 dB` (no clipping).

- [ ] **Step 7: Spot-check that the explainer carries audio and music is absent**

Run:
```bash
# Explainer window (frames 255-555 -> 8.5s-18.5s): SFX should be audible, no music bed.
ffmpeg -ss 8.5 -t 10 -i out/docker-cta.mp4 -af volumedetect -f null - 2>&1 | grep mean_volume
```
Expected: a finite `mean_volume` (not `-91 dB` / `-inf`), confirming the explainer SFX are present in that window. (Subjective check that there is no background music is left to the user reviewing the file.)

- [ ] **Step 8: Commit**

```bash
git add src/components/DockerCtaVideo.tsx
git commit -m "feat(docker-cta): explainer SFX + gate music bed off

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review (completed by plan author)

**Spec coverage:**
- Length → 40s / total 1200 → Task 2 Step 1 + acceptance via Task 4 Step 6. ✓
- Silent narration → no new VO; Task 3 adds no `<Audio>`. ✓
- "Build once, run anywhere" concept → Task 3 `ExplainerBeat` (app card → whale → laptop/server/cloud → tagline). ✓
- +300 shift of beats and VO 03–09 → Task 2 Steps 2–3. ✓
- New icons → Task 3 Step 1 (verified resolvable during brainstorming). ✓
- Music disabled via flag → Task 4 Steps 1–2. ✓
- Two synth SFX + reproducible script → Task 1. ✓
- Acceptance criteria (1200 frames, icons render, curriculum/CTA shifted, VO timing, no music, no clipping, lint 0) → covered across Tasks 2–4 verification steps. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code; every run step shows the command and expected output. ✓

**Type/name consistency:** `EXPLAIN_FROM`/`EXPLAIN_DUR` defined in Task 2, consumed in Tasks 3–4. `EXPLAIN_APP_LABEL`/`EXPLAIN_TAGLINE`, `EXPLAIN_PAD_SFX`/`CHIME3_SFX` defined and consumed within their tasks. `DownArrow`/`DestChip`/`ExplainerBeat` defined in Task 3 and referenced only there. Icon names match the verified `@mdi/js` exports. ✓

**Lint-ordering note:** Task 2 introduces two constants used only in Task 3; the plan explicitly allows committing Tasks 2+3 together if the unused-constant rule blocks Task 2's standalone commit — avoiding any lint-rule suppression.

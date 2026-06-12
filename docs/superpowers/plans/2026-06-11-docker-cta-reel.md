# Docker Training CTA Reel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a ~30s portrait Remotion reel (`docker-cta`) that drives WhatsApp registration for the Taming Tech "Docker for Beginner" training, using the Container Stack hype concept with English piper VO and 1:1 synced captions.

**Architecture:** A single self-contained component `src/components/DockerCtaVideo.tsx` (HomelabVideo pattern) drives four time-sequenced beats over 900 frames. Internal sub-components (`DockerMark`, `ContainerCard`, caption beats) render the visuals; a music bed is ducked under VO clips 01–09 via a `musicVolume(frame)` callback; clips 10–11 (venue + CTA) play silent. Registered as a `<Composition>` in `src/Root.tsx`.

**Tech Stack:** Remotion 4.0.446, React 19, TypeScript, `@remotion/media` (`<Audio>`), `@mdi/js` icons via `MdiIcon`, `TypingText` typewriter primitive, piper offline TTS, ffmpeg for audio post.

**Testing note:** This repo has **no unit-test framework**. Per project convention (and `src/...` memory), verification for every task is: `npm run lint` (eslint + `tsc`) must be clean, plus `npx remotion still docker-cta out/check-<n>.png --frame=<f>` visual checkpoints. The "test" steps below use those commands. `out/` is gitignored — checkpoints are not committed.

---

## File Structure

| File | Responsibility | Action |
|------|----------------|--------|
| `src/components/DockerCtaVideo.tsx` | Entire reel: theme tokens, timing constants, sub-components, 4 beats, audio | Create |
| `src/Root.tsx` | Register `docker-cta` composition | Modify |
| `public/content/docker-cta/bg-music.mp3` | Music bed (copied real track) | Create (asset) |
| `public/voiceover/docker-cta/01.mp3 … 09.mp3` | piper VO clips | Create (asset) |
| SFX | Reused from `public/content/devops1-bootcamp/sfx/` via `staticFile` — no new files | — |

**Shared timing contract** (all tasks reference these exact constants, defined in Task 3):

```
FPS = 30, DOCKERCTA_TOTAL_FRAMES = 900
Beat 1 Hook:        from 0,   dur 135   (0–4.5s)
Beat 2 Brand:       from 135, dur 120   (4.5–8.5s)
Beat 3 Curriculum:  from 255, dur 405   (8.5–22s)
  header   from 255
  card[0]  from 309   Docker Basics
  card[1]  from 375   Images & Containers
  card[2]  from 441   Docker Compose
  card[3]  from 507   Troubleshoot & Secure
  card[4]  from 573   Backup & Restore
Beat 4 CTA:         from 660, dur 240   (22–30s)
  date     from 660   "27–29 July 2026"      (VO 09)
  venue    from 735   "Taman Melawati, KL"   (silent)
  cta      from 795   DAFTAR + WhatsApp      (silent)
```

---

## Task 1: Asset scaffold + music bed

**Files:**
- Create dir: `public/content/docker-cta/`
- Create dir: `public/voiceover/docker-cta/`
- Create: `public/content/docker-cta/bg-music.mp3` (copied)

- [ ] **Step 1: Create asset directories**

```bash
mkdir -p public/content/docker-cta public/voiceover/docker-cta
```

- [ ] **Step 2: Probe candidate music beds for real (non-silent) audio**

Scaffolded folders sometimes ship silent placeholder audio (−91 dB). Probe before trusting:

```bash
for f in public/content/homelab-automation/bg-music.mp3 \
         public/content/devops1-bootcamp/bg-music-clawdlens-v2.mp3; do
  echo "== $f =="
  ffmpeg -hide_banner -i "$f" -af volumedetect -f null /dev/null 2>&1 | grep -E "mean_volume|max_volume|Duration"
done
```

Expected: at least one track reports `mean_volume` well above −90 dB (real audio) with a usable Duration.

- [ ] **Step 3: Copy the chosen real track to the episode's bed**

Prefer `homelab-automation/bg-music.mp3` if non-silent (upbeat); otherwise use the committed `bg-music-clawdlens-v2.mp3`. Copy the chosen file:

```bash
cp public/content/homelab-automation/bg-music.mp3 public/content/docker-cta/bg-music.mp3
# fallback if the homelab track was silent:
# cp public/content/devops1-bootcamp/bg-music-clawdlens-v2.mp3 public/content/docker-cta/bg-music.mp3
ffmpeg -hide_banner -i public/content/docker-cta/bg-music.mp3 -af volumedetect -f null /dev/null 2>&1 | grep -E "mean_volume|Duration"
```

Expected: the copy exists and reports real (non-silent) audio. Note its Duration — if shorter than 30s the bed will `loop` (handled in Task 8).

- [ ] **Step 4: Verify SFX are real (reused, not copied)**

```bash
for s in click ding whoosh swell ping; do
  echo "== $s =="
  ffmpeg -hide_banner -i public/content/devops1-bootcamp/sfx/$s.mp3 -af volumedetect -f null /dev/null 2>&1 | grep mean_volume
done
```

Expected: each `mean_volume` is well above −90 dB. If any is silent, synthesize a replacement with ffmpeg lavfi (`anoisesrc` highpassed = click; dual `sine` amix = ding) into `public/content/docker-cta/sfx/` and reference that path instead.

- [ ] **Step 5: Commit the music bed**

```bash
git add public/content/docker-cta/bg-music.mp3
git commit -m "chore(docker-cta): add music bed asset"
```

---

## Task 2: Generate piper voiceover (clips 01–09)

**Files:**
- Create: `public/voiceover/docker-cta/01.mp3 … 09.mp3`

The piper binary is ephemeral — re-download to `/tmp` (clawdlens recipe). VO is English, robotic, terse fragments. Numbers written as words so piper reads them correctly.

- [ ] **Step 1: Download piper binary + voice model to /tmp**

```bash
cd /tmp
curl -L -o piper.tar.gz https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz
tar xzf piper.tar.gz
curl -L -o piper/en_US-lessac-medium.onnx https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx
curl -L -o piper/en_US-lessac-medium.onnx.json https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json
cd /tmp/piper && ./piper --help >/dev/null 2>&1 && echo "piper OK"
```

Expected: `piper OK`.

- [ ] **Step 2: Synthesize each line → loudnorm → mp3**

Run from the repo root. Each line is synthesized to a wav, then loudness-normalized to the project's −16 LUFS standard and encoded to mp3.

```bash
cd /home/debian/repo/sharing
PIPER=/tmp/piper
MODEL=$PIPER/en_US-lessac-medium.onnx
OUT=public/voiceover/docker-cta

synth () { # $1=number  $2=text
  echo "$2" | $PIPER/piper -m $MODEL -f /tmp/vo.wav
  ffmpeg -hide_banner -y -i /tmp/vo.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11" "$OUT/$1.mp3"
}

synth 01 "Master Docker. In three days."
synth 02 "Docker. For beginners."
synth 03 "You will learn."
synth 04 "Docker basics."
synth 05 "Images, and containers."
synth 06 "Docker Compose."
synth 07 "Troubleshoot, and secure."
synth 08 "Backup, and restore."
synth 09 "Twenty seventh, to twenty ninth July."
ls -la $OUT
```

Expected: `01.mp3 … 09.mp3` all present and non-zero size.

- [ ] **Step 3: Measure clip durations in frames (needed for ducking in Task 8)**

```bash
for n in 01 02 03 04 05 06 07 08 09; do
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 public/voiceover/docker-cta/$n.mp3)
  frames=$(printf "%.0f" "$(echo "$dur * 30" | bc -l)")
  echo "$n  ${dur}s  ${frames}f"
done
```

Expected: each ~0.9–1.8s. **Record the per-clip frame counts** — they are pasted into the `VOICEOVER` array in Task 8.

- [ ] **Step 4: Commit the VO clips**

```bash
git add public/voiceover/docker-cta
git commit -m "feat(docker-cta): piper VO clips 01-09 (English robotic narrator)"
```

---

## Task 3: Composition scaffold — theme, timing, gradient background

**Files:**
- Create: `src/components/DockerCtaVideo.tsx`
- Modify: `src/Root.tsx`

- [ ] **Step 1: Create the component with theme, timing, and the gradient background**

Create `src/components/DockerCtaVideo.tsx`:

```tsx
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { Audio } from "@remotion/media";
import {
  mdiDocker,
  mdiCheckCircle,
  mdiCalendar,
  mdiMapMarker,
  mdiWhatsapp,
  mdiArrowRight,
} from "@mdi/js";
import { INTER, MONO } from "../fonts";
import { MdiIcon } from "./MdiIcon";
import { TypingText } from "./TypingText";

export const DOCKERCTA_TOTAL_FRAMES = 900;

// ---- Docker-brand theme tokens (local to this episode) ----
const DOCKER = {
  blue: "#2496ED",
  blueDeep: "#1D63ED",
  navy: "#0a1a3f",
  navyDeep: "#061129",
  white: "#FFFFFF",
  ice: "#CDE8FF", // light-blue accent / captions
  cardFill: "#1E63C9",
  cardEdge: "#54A6FF",
  green: "#22c55e",
  textDim: "#9DC2F0",
} as const;

// ---- Beat timing (frames @ 30fps) — see plan timing contract ----
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

// Shared typing cadence
const CHAR_FRAMES = 2;
const CURSOR_BLINK = 16;

// ---- Animated Docker-blue gradient background ----
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * 0.02) * 6;
  const glow = Math.sin(frame * 0.04) * 0.05 + 0.18;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${155 + drift}deg, ${DOCKER.blue} 0%, ${DOCKER.blueDeep} 42%, ${DOCKER.navy} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 38%, rgba(205,232,255,${glow}) 0%, transparent 55%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const DockerCtaVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: DOCKER.navyDeep }}>
      <Background />
      {/* Beats added in later tasks */}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Register the composition in `src/Root.tsx`**

Add the import after the existing `ClawdLensV2Video` import block (around line 12):

```tsx
import {
  DockerCtaVideo,
  DOCKERCTA_TOTAL_FRAMES,
} from "./components/DockerCtaVideo";
```

Add the composition inside the `<>` fragment, after the `clawdlens-v2` `<Composition>` (around line 49):

```tsx
    <Composition
      id="docker-cta"
      component={DockerCtaVideo}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={DOCKERCTA_TOTAL_FRAMES}
    />
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: clean (no eslint errors, no tsc errors). `MONO`, the mdi icon imports, `Audio`, `spring`, `useVideoConfig` are imported but unused at this stage — if eslint flags unused imports as errors, temporarily prefix the still-unused ones is NOT allowed; instead they are all consumed by Task 4–8. If lint fails ONLY on unused imports, proceed to Step 4 and resolve them as their tasks land; if it fails the build, comment out the not-yet-used icon imports and re-add them in the task that uses each.

- [ ] **Step 4: Visual checkpoint — gradient renders**

Run: `npx remotion still docker-cta out/check-bg.png --frame=30`
Expected: a 1080×1920 PNG showing the Docker-blue→navy gradient with a soft central glow. Open/inspect it.

- [ ] **Step 5: Commit**

```bash
git add src/components/DockerCtaVideo.tsx src/Root.tsx
git commit -m "feat(docker-cta): composition scaffold + gradient background"
```

---

## Task 4: Beat 1 — typewriter hook

**Files:**
- Modify: `src/components/DockerCtaVideo.tsx`

- [ ] **Step 1: Add the Hook beat sub-component**

Add this sub-component above `DockerCtaVideo`:

```tsx
// ---- Beat 1: typewriter hook ----
const HookBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [HOOK_DUR - 16, HOOK_DUR], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: out,
        padding: 80,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 96,
          lineHeight: 1.18,
          letterSpacing: -1,
          color: DOCKER.white,
          textAlign: "center",
          textShadow: "0 6px 30px rgba(0,0,0,0.45)",
        }}
      >
        <TypingText
          text={"Master Docker in 3 days"}
          charFrames={CHAR_FRAMES}
          cursorBlinkFrames={CURSOR_BLINK}
          cursorColor={DOCKER.ice}
        />
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Mount the beat in `DockerCtaVideo`**

Replace the `{/* Beats added in later tasks */}` comment with:

```tsx
      <Sequence from={HOOK_FROM} durationInFrames={HOOK_DUR}>
        <HookBeat />
      </Sequence>
      {/* Beats added in later tasks */}
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 4: Visual checkpoints — mid-type and full**

```bash
npx remotion still docker-cta out/check-hook-mid.png --frame=40
npx remotion still docker-cta out/check-hook-full.png --frame=110
```

Expected: frame 40 shows a partially-typed line with cursor; frame 110 shows the full "Master Docker in 3 days" centered in mono white.

- [ ] **Step 5: Commit**

```bash
git add src/components/DockerCtaVideo.tsx
git commit -m "feat(docker-cta): beat 1 typewriter hook"
```

---

## Task 5: Beat 2 — Docker logo mark + brand reveal

**Files:**
- Modify: `src/components/DockerCtaVideo.tsx`

- [ ] **Step 1: Add the `DockerMark` and `BrandBeat` sub-components**

Add above `DockerCtaVideo`:

```tsx
// ---- Docker logo mark (mdiDocker) with glow halo ----
const DockerMark: React.FC<{ enter: number }> = ({ enter }) => {
  return (
    <div
      style={{
        position: "relative",
        transform: `scale(${enter})`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${DOCKER.ice} 0%, transparent 65%)`,
          opacity: 0.35,
        }}
      />
      <MdiIcon path={mdiDocker} size={300} color={DOCKER.white} />
    </div>
  );
};

// ---- Beat 2: brand reveal ----
const BrandBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 13, stiffness: 200 } });
  const wordmark = spring({
    frame: frame - 10,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const caption = spring({
    frame: frame - 22,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const out = interpolate(frame, [BRAND_DUR - 16, BRAND_DUR], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 24,
        opacity: out,
      }}
    >
      <DockerMark enter={enter} />
      <div
        style={{
          opacity: wordmark,
          transform: `translateY(${interpolate(wordmark, [0, 1], [24, 0])}px)`,
          fontFamily: INTER,
          fontWeight: 800,
          fontSize: 120,
          letterSpacing: 2,
          color: DOCKER.white,
        }}
      >
        DOCKER
      </div>
      <div
        style={{
          opacity: caption,
          transform: `translateY(${interpolate(caption, [0, 1], [16, 0])}px)`,
          fontFamily: INTER,
          fontWeight: 600,
          fontSize: 46,
          color: DOCKER.ice,
        }}
      >
        for beginners
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Mount the beat**

Replace the `{/* Beats added in later tasks */}` comment with:

```tsx
      <Sequence from={BRAND_FROM} durationInFrames={BRAND_DUR}>
        <BrandBeat />
      </Sequence>
      {/* Beats added in later tasks */}
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 4: Visual checkpoint**

Run: `npx remotion still docker-cta out/check-brand.png --frame=200`
Expected: white Docker logo (whale + containers) with glow halo, "DOCKER" wordmark, and "for beginners" caption stacked centered.

- [ ] **Step 5: Commit**

```bash
git add src/components/DockerCtaVideo.tsx
git commit -m "feat(docker-cta): beat 2 Docker logo mark + brand reveal"
```

---

## Task 6: Beat 3 — curriculum container cards

**Files:**
- Modify: `src/components/DockerCtaVideo.tsx`

- [ ] **Step 1: Add the `ContainerCard` and `CurriculumBeat` sub-components**

Add above `DockerCtaVideo`. `ContainerCard` renders a corrugated shipping-container card that slides in from the right; `CurriculumBeat` stacks the header + 5 cards on the absolute timeline.

```tsx
// ---- A single corrugated container card ----
const ContainerCard: React.FC<{ label: string; localFrame: number }> = ({
  label,
  localFrame,
}) => {
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 16, stiffness: 180 },
  });
  const x = interpolate(enter, [0, 1], [520, 0]);
  return (
    <div
      style={{
        opacity: enter,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        gap: 28,
        width: 860,
        padding: "30px 38px",
        borderRadius: 22,
        // corrugated container ridges
        backgroundImage: `repeating-linear-gradient(90deg, ${DOCKER.cardFill} 0px, ${DOCKER.cardFill} 26px, #1A57B0 26px, #1A57B0 30px)`,
        border: `2px solid ${DOCKER.cardEdge}`,
        boxShadow: "0 18px 46px rgba(0,0,0,0.4)",
      }}
    >
      <MdiIcon path={mdiCheckCircle} size={56} color={DOCKER.green} />
      <span
        style={{
          fontFamily: INTER,
          fontWeight: 700,
          fontSize: 50,
          color: DOCKER.white,
          textShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ---- Beat 3: header + stacking cards ----
const CurriculumBeat: React.FC = () => {
  const frame = useCurrentFrame(); // absolute (no wrapping Sequence)
  const headerProg = spring({
    frame: frame - HEADER_FROM,
    fps: 30,
    config: { damping: 18, stiffness: 200 },
  });
  const out = interpolate(
    frame,
    [CURR_FROM + CURR_DUR - 16, CURR_FROM + CURR_DUR],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 22,
        opacity: out,
        paddingTop: 60,
      }}
    >
      <div
        style={{
          opacity: headerProg,
          transform: `translateY(${interpolate(headerProg, [0, 1], [20, 0])}px)`,
          fontFamily: INTER,
          fontWeight: 800,
          fontSize: 64,
          color: DOCKER.white,
          marginBottom: 18,
          alignSelf: "center",
        }}
      >
        You will learn:
      </div>
      {CARDS.map((c) => (
        <ContainerCard key={c.label} label={c.label} localFrame={frame - c.from} />
      ))}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Mount the beat**

The `CurriculumBeat` reads the absolute frame itself (cards reveal at their own `from`), so mount it WITHOUT a wrapping `<Sequence>` but gate its visibility window with one. Replace the `{/* Beats added in later tasks */}` comment with:

```tsx
      <Sequence from={CURR_FROM} durationInFrames={CURR_DUR}>
        <CurriculumBeat />
      </Sequence>
      {/* Beats added in later tasks */}
```

Note: because the beat is inside a `<Sequence from={CURR_FROM}>`, `useCurrentFrame()` inside it is already relative to `CURR_FROM`. Update `CurriculumBeat` references accordingly: the header spring uses `frame - (HEADER_FROM - CURR_FROM)` = `frame - 0`, and each card uses `frame - (c.from - CURR_FROM)`. Adjust by defining local offsets:

```tsx
// inside CurriculumBeat, replace the header spring frame and card localFrame:
//   headerProg frame: frame - (HEADER_FROM - CURR_FROM)
//   card localFrame:  frame - (c.from - CURR_FROM)
```

Apply these exact edits inside `CurriculumBeat`:
- Header spring: `frame: frame - (HEADER_FROM - CURR_FROM),`
- `out` interpolate: `[CURR_DUR - 16, CURR_DUR]`
- Card: `localFrame={frame - (c.from - CURR_FROM)}`

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 4: Visual checkpoints — partial and full stack**

```bash
npx remotion still docker-cta out/check-curr-2.png --frame=400
npx remotion still docker-cta out/check-curr-full.png --frame=630
```

Expected: frame 400 shows the header + ~2 cards slid in; frame 630 shows the header + all 5 container cards stacked with green checks.

- [ ] **Step 5: Commit**

```bash
git add src/components/DockerCtaVideo.tsx
git commit -m "feat(docker-cta): beat 3 curriculum container cards"
```

---

## Task 7: Beat 4 — CTA close (date / venue / DAFTAR + WhatsApp)

**Files:**
- Modify: `src/components/DockerCtaVideo.tsx`

- [ ] **Step 1: Add the `CtaBeat` sub-component**

Add above `DockerCtaVideo`. Inside a `<Sequence from={CTA_FROM}>`, `useCurrentFrame()` is relative to `CTA_FROM`, so local reveal offsets are `DATE_FROM-CTA_FROM=0`, `VENUE_FROM-CTA_FROM=75`, `CTA_REVEAL_FROM-CTA_FROM=135`.

```tsx
// ---- Beat 4: CTA close ----
const Line: React.FC<{
  localFrom: number;
  icon: string;
  children: React.ReactNode;
}> = ({ localFrom, icon, children }) => {
  const frame = useCurrentFrame();
  const p = spring({
    frame: frame - localFrom,
    fps: 30,
    config: { damping: 18, stiffness: 200 },
  });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily: INTER,
        fontWeight: 700,
        fontSize: 52,
        color: DOCKER.white,
      }}
    >
      <MdiIcon path={icon} size={48} color={DOCKER.ice} />
      <span>{children}</span>
    </div>
  );
};

const CtaBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const cta = spring({
    frame: frame - (CTA_REVEAL_FROM - CTA_FROM),
    fps: 30,
    config: { damping: 12, stiffness: 200 },
  });
  const pulse = 1 + Math.sin(frame * 0.18) * 0.02;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 30,
        padding: 70,
      }}
    >
      <Line localFrom={DATE_FROM - CTA_FROM} icon={mdiCalendar}>
        27–29 July 2026
      </Line>
      <Line localFrom={VENUE_FROM - CTA_FROM} icon={mdiMapMarker}>
        Taman Melawati, KL
      </Line>

      {/* DAFTAR button + WhatsApp (silent reveal) */}
      <div
        style={{
          opacity: cta,
          transform: `scale(${interpolate(cta, [0, 1], [0.8, 1]) * pulse})`,
          marginTop: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "26px 54px",
            borderRadius: 999,
            background: DOCKER.white,
            boxShadow: `0 16px 50px rgba(0,0,0,0.45)`,
          }}
        >
          <span
            style={{
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: 58,
              color: DOCKER.blueDeep,
              letterSpacing: 0.5,
            }}
          >
            DAFTAR SEKARANG
          </span>
          <MdiIcon path={mdiArrowRight} size={56} color={DOCKER.blueDeep} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 46,
            color: DOCKER.white,
          }}
        >
          <MdiIcon path={mdiWhatsapp} size={48} color={DOCKER.green} />
          <span>6013 446 4601</span>
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 500,
            fontSize: 32,
            color: DOCKER.textDim,
            marginTop: 6,
          }}
        >
          Taming Tech · HRDcorp Claimable
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Mount the beat**

Replace the `{/* Beats added in later tasks */}` comment with:

```tsx
      <Sequence from={CTA_FROM} durationInFrames={CTA_DUR}>
        <CtaBeat />
      </Sequence>
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: clean. All previously-unused imports (`mdiCalendar`, `mdiMapMarker`, `mdiWhatsapp`, `mdiArrowRight`) are now consumed.

- [ ] **Step 4: Visual checkpoints — partial and final card**

```bash
npx remotion still docker-cta out/check-cta-mid.png --frame=760
npx remotion still docker-cta out/check-cta-final.png --frame=880
```

Expected: frame 760 shows date + venue lines; frame 880 shows the full card: "27–29 July 2026", "Taman Melawati, KL", white "DAFTAR SEKARANG →" pill, WhatsApp "6013 446 4601", and "Taming Tech · HRDcorp Claimable".

- [ ] **Step 5: Commit**

```bash
git add src/components/DockerCtaVideo.tsx
git commit -m "feat(docker-cta): beat 4 CTA close with WhatsApp register"
```

---

## Task 8: Audio — VO clips, SFX, ducked music bed

**Files:**
- Modify: `src/components/DockerCtaVideo.tsx`

- [ ] **Step 1: Add audio constants and the `musicVolume` ducking callback**

Add near the top constants (after `CTA_REVEAL_FROM`). **Paste the measured frame durations from Task 2 Step 3 into `durationInFrames`** (the values below are typical piper-lessac lengths; replace each with the real measurement):

```tsx
// ---- Audio ----
const MUSIC = "content/docker-cta/bg-music.mp3";
const SFX_DIR = "content/devops1-bootcamp/sfx";
const CLICK_SFX = `${SFX_DIR}/click.mp3`;
const DING_SFX = `${SFX_DIR}/ding.mp3`;
const WHOOSH_SFX = `${SFX_DIR}/whoosh.mp3`;
const SWELL_SFX = `${SFX_DIR}/swell.mp3`;

const MUSIC_BASE = 0.36; // bed level in gaps
const MUSIC_DUCK = 0.14; // bed level under VO
const DUCK_RAMP = 8;

// VO clips 01–09 on the absolute timeline. durationInFrames = measured (Task 2 Step 3).
const VOICEOVER: { file: string; from: number; durationInFrames: number }[] = [
  { file: "voiceover/docker-cta/01.mp3", from: 8, durationInFrames: 48 },
  { file: "voiceover/docker-cta/02.mp3", from: 150, durationInFrames: 42 },
  { file: "voiceover/docker-cta/03.mp3", from: 258, durationInFrames: 30 },
  { file: "voiceover/docker-cta/04.mp3", from: 312, durationInFrames: 33 },
  { file: "voiceover/docker-cta/05.mp3", from: 378, durationInFrames: 42 },
  { file: "voiceover/docker-cta/06.mp3", from: 444, durationInFrames: 36 },
  { file: "voiceover/docker-cta/07.mp3", from: 510, durationInFrames: 42 },
  { file: "voiceover/docker-cta/08.mp3", from: 576, durationInFrames: 39 },
  { file: "voiceover/docker-cta/09.mp3", from: 660, durationInFrames: 60 },
];

// Music bed: fade in, hold at base, fade out; ducked under each VO window.
const musicVolume = (f: number): number => {
  const envelope = interpolate(
    f,
    [0, 20, DOCKERCTA_TOTAL_FRAMES - 30, DOCKERCTA_TOTAL_FRAMES],
    [0, MUSIC_BASE, MUSIC_BASE, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  let duck = 1;
  for (const vo of VOICEOVER) {
    const d = interpolate(
      f,
      [
        vo.from - DUCK_RAMP,
        vo.from,
        vo.from + vo.durationInFrames,
        vo.from + vo.durationInFrames + DUCK_RAMP,
      ],
      [1, MUSIC_DUCK / MUSIC_BASE, MUSIC_DUCK / MUSIC_BASE, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    duck = Math.min(duck, d);
  }
  return envelope * duck;
};
```

- [ ] **Step 2: Add the per-keystroke `TypingClicks` helper**

Add above `DockerCtaVideo` (mirrors the clawdlens helper):

```tsx
const CLICK_EVERY = 2;
const TypingClicks: React.FC<{ charCount: number }> = ({ charCount }) => {
  const clicks = [];
  for (let i = 0; i < charCount; i += CLICK_EVERY) {
    clicks.push(
      <Sequence
        key={i}
        from={i * CHAR_FRAMES}
        durationInFrames={CLICK_EVERY * CHAR_FRAMES}
      >
        <Audio src={staticFile(CLICK_SFX)} volume={0.5} />
      </Sequence>,
    );
  }
  return <>{clicks}</>;
};
```

- [ ] **Step 3: Wire music bed, VO, and SFX into `DockerCtaVideo`**

Add the music bed as the FIRST child of the root `<AbsoluteFill>` (before `<Background />`):

```tsx
      <Audio src={staticFile(MUSIC)} volume={musicVolume} loop />
```

Add the VO clips and SFX as the LAST children (after the CTA `<Sequence>`):

```tsx
      {/* Voiceover (clips 01–09; 10–11 are silent by design) */}
      {VOICEOVER.map((vo) => (
        <Sequence key={vo.file} from={vo.from}>
          <Audio src={staticFile(vo.file)} volume={1.1} />
        </Sequence>
      ))}

      {/* SFX accents */}
      <Sequence from={HOOK_FROM}>
        <TypingClicks charCount={"Master Docker in 3 days".length} />
      </Sequence>
      <Sequence from={HOOK_FROM + 23 * CHAR_FRAMES}>
        <Audio src={staticFile(DING_SFX)} volume={0.8} />
      </Sequence>
      <Sequence from={BRAND_FROM}>
        <Audio src={staticFile(WHOOSH_SFX)} volume={0.7} />
      </Sequence>
      {CARDS.map((c) => (
        <Sequence key={`sfx-${c.label}`} from={c.from} durationInFrames={8}>
          <Audio src={staticFile(CLICK_SFX)} volume={0.7} />
        </Sequence>
      ))}
      <Sequence from={CTA_REVEAL_FROM}>
        <Audio src={staticFile(SWELL_SFX)} volume={0.8} />
      </Sequence>
      <Sequence from={CTA_REVEAL_FROM + 6}>
        <Audio src={staticFile(DING_SFX)} volume={0.9} />
      </Sequence>
```

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/components/DockerCtaVideo.tsx
git commit -m "feat(docker-cta): wire VO, SFX, and ducked music bed"
```

---

## Task 9: Full render + audio verification + final polish

**Files:**
- (verification only; small tuning edits to `src/components/DockerCtaVideo.tsx` if needed)

- [ ] **Step 1: Render the full reel**

Run: `npx remotion render docker-cta out/docker-cta.mp4 --codec=h264 --crf=18`
Expected: a ~30s 1080×1920 H.264 mp4 with no render errors.

- [ ] **Step 2: Verify duration and audio levels**

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 out/docker-cta.mp4
ffmpeg -hide_banner -i out/docker-cta.mp4 -af volumedetect -f null /dev/null 2>&1 | grep -E "mean_volume|max_volume"
```

Expected: duration ≈ 30s; `max_volume` near 0 dB without clipping (≤ 0). If the bed drowns the VO, lower `MUSIC_BASE`/`MUSIC_DUCK` or raise VO `volume`; if clipping, lower SFX volumes.

- [ ] **Step 3: Spot-check the rendered frames visually**

```bash
ffmpeg -hide_banner -y -i out/docker-cta.mp4 -vf "select=eq(n\,110)+eq(n\,200)+eq(n\,630)+eq(n\,880)" -vsync 0 out/frame-%02d.png
```

Expected: hook full, brand reveal, full card stack, CTA final — all legible, on-brand, nothing clipped off the 1080×1920 frame. Verify the Docker logo, container cards, and CTA pill look correct. If the whale mark or any text overflows, adjust sizes/padding and re-render.

- [ ] **Step 4: Final lint gate**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 5: Commit any tuning + finalize**

```bash
git add src/components/DockerCtaVideo.tsx
git commit -m "fix(docker-cta): final audio/visual tuning after full render" || echo "no tuning needed"
```

---

## Self-Review

- **Spec coverage:** Portrait 1080×1920 (Task 3) ✓ · Container Stack hype concept (Tasks 3,5,6) ✓ · piper English VO 01–09 (Task 2) ✓ · 1:1 synced captions (Tasks 4–7 text matches VO script) ✓ · clips 10–11 silent (Task 7 venue/CTA have no VO entry) ✓ · `mdiDocker` mark (Task 5) ✓ · curriculum 5 cards (Task 6) ✓ · WhatsApp CTA + date/venue/HRDcorp (Task 7) ✓ · music ducking + SFX reuse (Tasks 1,8) ✓ · register composition (Task 3) ✓ · verification lint+still+render (every task, Task 9) ✓.
- **Placeholder scan:** VO `durationInFrames` are the one measured-at-build value — Task 2 Step 3 produces them with an exact command and Task 8 Step 1 instructs pasting them in; defaults are realistic, not "TBD". No other placeholders.
- **Type consistency:** `DOCKERCTA_TOTAL_FRAMES`, `CHAR_FRAMES`, `CURSOR_BLINK`, `CARDS`, beat constants, and the `DOCKER` token object are defined in Task 3 and referenced consistently in Tasks 4–8. `musicVolume`/`VOICEOVER`/SFX constants defined in Task 8 before use. Frame-relativity inside `<Sequence>` handled explicitly in Tasks 6 and 7.
- **Known build caveat:** Task 3 Step 3 calls out that not-yet-used imports may trip eslint; each is consumed by a later task, with the comment-out fallback if the build hard-fails.

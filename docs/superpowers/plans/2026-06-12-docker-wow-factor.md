# Docker Reel "Wow Factor" High-Energy Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Docker CTA reel scroll-stopping: a high-energy VO-silent slam hook, a whale hero moment in the brand beat, and a kinetic motion pass (punch/overshoot, camera push-in, beat-boundary flashes, card light-sweep, background parallax).

**Architecture:** Single-file Remotion composition (`DockerCtaVideo.tsx`). Hook and brand beats are retimed within the first 8.5s (`EXPLAIN_FROM=255` unchanged → nothing downstream reshuffles). New shared motion helpers (`Shake`, `Flash`, `PushIn`, `LightSweep`, `FloatingContainers`) and spring configs (`PUNCH`, `SETTLE`). Two new SFX (`impact`, `boom`) via the existing ffmpeg generator. Music stays off.

**Tech Stack:** Remotion 4.0.446 (React 19, TypeScript), `@mdi/js`, ffmpeg 8.1. No unit-test framework — verification = `npm run lint` (eslint + tsc) + `npx remotion still` + full render + `ffprobe`.

**Reference spec:** `docs/superpowers/specs/2026-06-12-docker-wow-factor-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `scripts/synth-docker-sfx.sh` | add `impact` + `boom` recipes |
| `public/content/docker-cta/sfx/impact.mp3`, `boom.mp3` | NEW assets |
| `src/components/DockerCtaVideo.tsx` | retime hook/brand; rebuild `HookBeat` + `BrandBeat`; add motion helpers + configs; punch springs; new SFX wiring; relocate VO 01/02 |

Task order: **1** SFX → **2** retime + VO → **3** hook rebuild → **4** brand whale hero → **5** motion pass. Each ends lint-clean and committed.

---

## Task 1: Synthesize impact + boom SFX

**Files:** `scripts/synth-docker-sfx.sh` (modify), two new mp3s.

- [ ] **Step 1: Append the two recipes to the generator**

In `scripts/synth-docker-sfx.sh`, immediately BEFORE the final `echo "wrote:"` line, insert:

```bash
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

```

Then update the final `ls -la` line so the listing includes the new files:
```bash
ls -la "$OUT/blip-rise.mp3" "$OUT/blip-low.mp3" "$OUT/blip-steps.mp3" "$OUT/confirm.mp3" "$OUT/impact.mp3" "$OUT/boom.mp3"
```

- [ ] **Step 2: Regenerate (re-runs all cues; deterministic) and verify**

Run:
```bash
./scripts/synth-docker-sfx.sh
for f in impact boom; do
  echo -n "$f: "
  ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "public/content/docker-cta/sfx/$f.mp3"
done
```
Expected: script exits 0; `impact:` ≈ `0.22`, `boom:` ≈ `0.6` (both > 0).

- [ ] **Step 3: Confirm the new assets are tracked**

Run: `git status --short public/content/docker-cta/sfx/impact.mp3 public/content/docker-cta/sfx/boom.mp3`
Expected: both shown as untracked (`??`). If not, STOP and report (siblings are tracked, so these should be too).

- [ ] **Step 4: Commit**

```bash
git add scripts/synth-docker-sfx.sh public/content/docker-cta/sfx/impact.mp3 public/content/docker-cta/sfx/boom.mp3
git commit -m "chore(docker-cta): synth impact + boom SFX for the slam hook

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Retime hook/brand and relocate VO 01/02

This task alone leaves the OLD hook/brand components playing in the new windows (valid intermediate — renders, lint clean). Tasks 3–4 rebuild them.

**Files:** `src/components/DockerCtaVideo.tsx` (constants + VO array).

- [ ] **Step 1: Retime the hook and brand constants**

Find:
```ts
const HOOK_FROM = 0;
const HOOK_DUR = 135;
const BRAND_FROM = 135;
const BRAND_DUR = 120;
```
Replace with:
```ts
const HOOK_FROM = 0;
const HOOK_DUR = 100;
const BRAND_FROM = 100;
const BRAND_DUR = 155;
```
(`EXPLAIN_FROM=255` and everything below are unchanged: 100 + 155 = 255.)

- [ ] **Step 2: Relocate VO clips 01 and 02 into the brand beat**

Find the first three VOICEOVER entries:
```ts
  { file: "voiceover/docker-cta/01.mp3", from: 8, durationInFrames: 78 },
  { file: "voiceover/docker-cta/02.mp3", from: 150, durationInFrames: 58 },
  { file: "voiceover/docker-cta/03.mp3", from: 558, durationInFrames: 32 },
```
Replace with (01 → 172, 02 → 106; 03 unchanged, shown for anchor):
```ts
  { file: "voiceover/docker-cta/02.mp3", from: 106, durationInFrames: 58 },
  { file: "voiceover/docker-cta/01.mp3", from: 172, durationInFrames: 78 },
  { file: "voiceover/docker-cta/03.mp3", from: 558, durationInFrames: 32 },
```
(Order in the array doesn't matter to Remotion; clip 02 now plays first at 106, clip 01 at 172. Both end before 255: 106+58=164, 172+78=250.)

- [ ] **Step 3: Lint + still**

Run: `npm run lint` → expect exit 0.
Run: `npx remotion still docker-cta out/t2-brand.png --frame=180`
Expected: PNG written showing the (old) brand content now positioned in the 100–255 window.

- [ ] **Step 4: Commit**

```bash
git add src/components/DockerCtaVideo.tsx
git commit -m "feat(docker-cta): retime hook->100f, brand->155f; move VO 01/02 into brand

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Rebuild the hook as a high-energy slam (VO-silent)

**Files:** `src/components/DockerCtaVideo.tsx` (add motion helpers + configs; replace `HookBeat`; swap hook SFX; add a composition-level `Flash`).

- [ ] **Step 1: Add shared motion configs + Shake/Flash helpers**

Immediately ABOVE the `// ---- Animated gradient background ----` comment, insert:

```tsx
// ---- Shared motion ----
const PUNCH = { damping: 9, stiffness: 240 } as const; // overshoot for slams/reveals
const SETTLE = { damping: 16, stiffness: 180 } as const; // gentle settle

// Decaying screen-shake keyed to impact frames (local).
const Shake: React.FC<{
  impacts: number[];
  amplitude?: number;
  children: React.ReactNode;
}> = ({ impacts, amplitude = 18, children }) => {
  const frame = useCurrentFrame();
  let dx = 0;
  let dy = 0;
  for (const hit of impacts) {
    const t = frame - hit;
    if (t >= 0 && t < 12) {
      const decay = 1 - t / 12;
      dx += Math.sin(t * 2.1) * amplitude * decay;
      dy += Math.cos(t * 2.7) * amplitude * decay;
    }
  }
  return <div style={{ transform: `translate(${dx}px, ${dy}px)` }}>{children}</div>;
};

// Soft white flash at given frames (reads the frame of whatever context it is
// mounted in). Peak <= 0.6, <= 2 frames, never a repeating strobe.
const Flash: React.FC<{ hits: number[]; peak?: number }> = ({
  hits,
  peak = 0.55,
}) => {
  const frame = useCurrentFrame();
  let o = 0;
  for (const hit of hits) {
    const t = frame - hit;
    if (t >= 0 && t < 2) o = Math.max(o, peak * (1 - t / 2));
  }
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{ background: "#FFFFFF", opacity: o, pointerEvents: "none" }}
    />
  );
};
```

- [ ] **Step 2: Replace the `HookBeat` component**

Find the entire existing `HookBeat` component (from `// ---- Beat 1: typewriter hook ----` through its closing `};`) and replace it with:

```tsx
// ---- Beat 1: high-energy slam hook (VO-silent) ----
const HOOK_DOYOU = 45; // local frame the "DO YOU?" hero slam takes over
const HOOK_WHIP = 85; // local frame the whip-out begins

const SlamWord: React.FC<{ text: string; from: number; size: number }> = ({
  text,
  from,
  size,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from) return null;
  const p = spring({ frame: frame - from, fps, config: PUNCH });
  const scale = interpolate(p, [0, 1], [1.4, 1.0]);
  const opacity = interpolate(frame - from, [0, 3], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
        fontFamily: INTER,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: -2,
        lineHeight: 1.0,
        color: DOCKER.white,
        textShadow: "0 6px 30px rgba(0,0,0,0.5)",
      }}
    >
      {text}
    </div>
  );
};

const HookBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const showStack = frame < HOOK_DOYOU;
  const doYou = spring({ frame: frame - HOOK_DOYOU, fps, config: PUNCH });
  const doYouScale = interpolate(doYou, [0, 1], [1.6, 1.0]);
  const stackZoom = interpolate(frame, [0, HOOK_DOYOU], [1, 1.08], {
    extrapolateRight: "clamp",
  });
  const whip = interpolate(frame, [HOOK_WHIP, HOOK_DUR], [1, 1.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const whipFade = interpolate(frame, [HOOK_WHIP, HOOK_DUR], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 70,
        transform: `scale(${whip})`,
        opacity: whipFade,
      }}
    >
      <Shake impacts={[0, 10, 20, HOOK_DOYOU]} amplitude={22}>
        {showStack ? (
          <div
            style={{
              transform: `scale(${stackZoom})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <SlamWord text="EVERYONE" from={0} size={118} />
            <SlamWord text="USES" from={10} size={118} />
            <SlamWord text="DOCKER." from={20} size={150} />
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${doYouScale})`,
              fontFamily: INTER,
              fontWeight: 900,
              fontSize: 220,
              letterSpacing: -4,
              color: DOCKER.white,
              textShadow: "0 8px 40px rgba(0,0,0,0.55)",
            }}
          >
            DO YOU?
          </div>
        )}
      </Shake>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Swap the hook SFX and mount the composition Flash**

In `DockerCtaVideo`'s render, find the hook SFX block:
```tsx
      {/* SFX accents */}
      <Sequence from={HOOK_FROM}>
        <TypingClicks charCount={"Master Docker in 3 days".length} />
      </Sequence>
      <Sequence from={HOOK_FROM + 23 * CHAR_FRAMES}>
        <Audio src={staticFile(DING_SFX)} volume={0.8} />
      </Sequence>
```
Replace with:
```tsx
      {/* SFX accents */}
      {/* Slam-hook hits: impact per word, boom on "DO YOU?", whoosh on the whip */}
      <Sequence from={HOOK_FROM}>
        <Audio src={staticFile(IMPACT_SFX)} volume={0.6} />
      </Sequence>
      <Sequence from={HOOK_FROM + 10}>
        <Audio src={staticFile(IMPACT_SFX)} volume={0.6} />
      </Sequence>
      <Sequence from={HOOK_FROM + 20}>
        <Audio src={staticFile(IMPACT_SFX)} volume={0.65} />
      </Sequence>
      <Sequence from={HOOK_FROM + HOOK_DOYOU}>
        <Audio src={staticFile(BOOM_SFX)} volume={0.7} />
      </Sequence>
      <Sequence from={HOOK_FROM + HOOK_WHIP}>
        <Audio src={staticFile(WHOOSH_SFX)} volume={0.7} />
      </Sequence>
```

Then add the two new SFX path constants. Find:
```ts
const CONFIRM_SFX = "content/docker-cta/sfx/confirm.mp3";
```
Add immediately after it:
```ts
const IMPACT_SFX = "content/docker-cta/sfx/impact.mp3";
const BOOM_SFX = "content/docker-cta/sfx/boom.mp3";
```

Then mount the composition-level flash. Find the closing of the SFX/CTA block — the very last `</Sequence>` before the final `</AbsoluteFill>` of `DockerCtaVideo`. Immediately BEFORE that final `</AbsoluteFill>`, add:
```tsx
      {/* Soft white flashes on the big hits (reads absolute frame at root) */}
      <Flash hits={[0, HOOK_FROM + HOOK_DOYOU]} />
```

- [ ] **Step 4: Lint**

Run: `npm run lint` → expect exit 0. (`TypingClicks` is still used by the explainer; `DING_SFX` still used by the CTA; `IMPACT_SFX`/`BOOM_SFX`/`Flash`/`Shake`/`PUNCH`/`SlamWord`/`HOOK_DOYOU`/`HOOK_WHIP` are all now referenced.)

- [ ] **Step 5: Stills across the hook**

Run:
```bash
npx remotion still docker-cta out/t3-h0.png  --frame=2
npx remotion still docker-cta out/t3-h1.png  --frame=24
npx remotion still docker-cta out/t3-h2.png  --frame=50
npx remotion still docker-cta out/t3-h3.png  --frame=92
```
Expected (read each): f2 = "EVERYONE" already large/slamming + soft flash (frame 0 loaded); f24 = three-line stack EVERYONE/USES/DOCKER.; f50 = "DO YOU?" huge; f92 = whip-zoom mostly faded toward the brand. Report what you see.

- [ ] **Step 6: Commit**

```bash
git add src/components/DockerCtaVideo.tsx
git commit -m "feat(docker-cta): rebuild hook as high-energy slam (EVERYONE USES DOCKER / DO YOU)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Brand whale hero moment

**Files:** `src/components/DockerCtaVideo.tsx` (add `Whale` + `WaterFX`; replace `BrandBeat`).

- [ ] **Step 1: Add the Whale and WaterFX sub-pieces**

Immediately ABOVE the existing `// ---- Beat 2: brand reveal ----` comment, insert:

```tsx
// ---- Whale that swims in and bobs ----
const Whale: React.FC = () => {
  const frame = useCurrentFrame(); // local to brand
  const { fps } = useVideoConfig();
  const swim = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const x = interpolate(swim, [0, 1], [-540, 0]);
  const bob = Math.sin(frame * 0.13) * 12;
  return (
    <div style={{ transform: `translate(${x}px, ${bob}px)` }}>
      <DockerMark enter={swim} size={230} />
    </div>
  );
};

// ---- Water ripple rings + rising bubbles beneath the whale ----
const WaterFX: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative", width: 300, height: 70 }}>
      {[0, 25, 50].map((off, i) => {
        const t = (((frame - off) % 75) + 75) % 75;
        const p = t / 75;
        return (
          <div
            key={`r${i}`}
            style={{
              position: "absolute",
              left: "50%",
              top: 24,
              width: 200,
              height: 40,
              marginLeft: -100,
              borderRadius: "50%",
              border: `2px solid ${DOCKER.ice}`,
              opacity: (1 - p) * 0.22,
              transform: `scale(${0.4 + p * 1.3})`,
            }}
          />
        );
      })}
      {[0, 1, 2, 3, 4].map((i) => {
        const t = (((frame + i * 13) % 60) + 60) % 60;
        const p = t / 60;
        return (
          <div
            key={`b${i}`}
            style={{
              position: "absolute",
              left: 60 + i * 45,
              top: 24,
              width: 8 + (i % 3) * 3,
              height: 8 + (i % 3) * 3,
              borderRadius: "50%",
              background: DOCKER.ice,
              opacity: Math.sin(p * Math.PI) * 0.3,
              transform: `translateY(${interpolate(p, [0, 1], [10, -48])}px)`,
            }}
          />
        );
      })}
    </div>
  );
};
```

- [ ] **Step 2: Replace the `BrandBeat` component**

Find the entire existing `BrandBeat` component (from `// ---- Beat 2: brand reveal ----` through its closing `};`) and replace it with:

```tsx
// ---- Beat 2: brand reveal with whale hero moment ----
const BrandBeat: React.FC = () => {
  const frame = useCurrentFrame(); // local to BRAND_FROM
  const { fps } = useVideoConfig();
  // DOCKER + "for beginners" synced to VO 02 (abs 106 = local ~6)
  const brand = spring({ frame: frame - 6, fps, config: PUNCH });
  const beginners = spring({ frame: frame - 16, fps, config: SETTLE });
  // "Master Docker in 3 days" promise synced to VO 01 (abs 172 = local ~72)
  const promise = spring({ frame: frame - 72, fps, config: PUNCH });
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
        gap: 14,
        opacity: out,
        padding: 70,
      }}
    >
      <Whale />
      <WaterFX />
      <div
        style={{
          opacity: brand,
          transform: `scale(${interpolate(brand, [0, 1], [0.7, 1])})`,
          fontFamily: INTER,
          fontWeight: 800,
          fontSize: 120,
          letterSpacing: 2,
          color: DOCKER.white,
          marginTop: 6,
        }}
      >
        DOCKER
      </div>
      <div
        style={{
          opacity: beginners,
          transform: `translateY(${interpolate(beginners, [0, 1], [16, 0])}px)`,
          fontFamily: INTER,
          fontWeight: 600,
          fontSize: 46,
          color: DOCKER.ice,
        }}
      >
        for beginners
      </div>
      <div
        style={{
          opacity: promise,
          transform: `translateY(${interpolate(promise, [0, 1], [20, 0])}px)`,
          fontFamily: INTER,
          fontWeight: 700,
          fontSize: 40,
          color: DOCKER.white,
          marginTop: 14,
        }}
      >
        Master Docker in 3 days
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Lint + stills**

Run: `npm run lint` → expect exit 0.
Run:
```bash
npx remotion still docker-cta out/t4-b1.png --frame=120
npx remotion still docker-cta out/t4-b2.png --frame=170
npx remotion still docker-cta out/t4-b3.png --frame=240
```
Expected (read each): f120 = whale partway swum in (offset left) + DOCKER/for-beginners appearing; f170 = whale settled center with ripple/bubbles, DOCKER + "for beginners" visible; f240 = full brand incl. "Master Docker in 3 days" promise line. Confirm the column is not cramped/overflowing the portrait frame; report if it is.

- [ ] **Step 4: Commit**

```bash
git add src/components/DockerCtaVideo.tsx
git commit -m "feat(docker-cta): whale hero moment in the brand beat (swim + bob + ripple)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Kinetic motion pass (push-in, punch, flashes, sweep, parallax)

**Files:** `src/components/DockerCtaVideo.tsx` (add `PushIn`, `LightSweep`, `FloatingContainers`; punch springs on cards + CTA; wrap beats in `PushIn`; extend the composition flash to beat boundaries; parallax in `Background`).

- [ ] **Step 1: Add the PushIn, LightSweep, and FloatingContainers helpers**

Immediately BELOW the `Flash` component (added in Task 3), insert:

```tsx
// Slow camera push-in across a beat (scale 1 -> 1.05 over `dur`).
const PushIn: React.FC<{ dur: number; children: React.ReactNode }> = ({
  dur,
  children,
}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, dur], [1, 1.05], {
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ transform: `scale(${s})` }}>{children}</AbsoluteFill>;
};

// One-shot specular highlight sweeping across a card. Driven by an explicit
// localFrame prop (NOT useCurrentFrame) so it tracks the card's own timeline.
const LightSweep: React.FC<{
  localFrame: number;
  from: number;
  dur: number;
  width: number;
}> = ({ localFrame, from, dur, width }) => {
  const t = localFrame - from;
  if (t < 0 || t > dur) return null;
  const x = interpolate(t, [0, dur], [-width * 0.5, width * 1.1]);
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: 120,
        transform: `translateX(${x}px) skewX(-18deg)`,
        background:
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
        pointerEvents: "none",
      }}
    />
  );
};

// Faint container silhouettes drifting in the background for depth/parallax.
const FloatingContainers: React.FC = () => {
  const frame = useCurrentFrame();
  const boxes = [
    { x: 110, y: 320, w: 190, s: 0.015, drift: 40 },
    { x: 760, y: 720, w: 150, s: 0.012, drift: 30 },
    { x: 190, y: 1320, w: 230, s: 0.01, drift: 50 },
    { x: 820, y: 1520, w: 160, s: 0.017, drift: 34 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {boxes.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y + Math.sin(frame * b.s) * b.drift,
            width: b.w,
            height: b.w * 0.7,
            borderRadius: 16,
            border: "2px solid rgba(205,232,255,0.10)",
            background: "rgba(205,232,255,0.04)",
            transform: `rotate(${Math.sin(frame * b.s + i) * 4}deg)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Add parallax to the Background**

In the `Background` component, find the inner radial-glow `AbsoluteFill`:
```tsx
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 38%, rgba(205,232,255,${glow}) 0%, transparent 55%)`,
        }}
      />
    </AbsoluteFill>
  );
```
Replace with (adds `<FloatingContainers />` behind the glow):
```tsx
      <FloatingContainers />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 38%, rgba(205,232,255,${glow}) 0%, transparent 55%)`,
        }}
      />
    </AbsoluteFill>
  );
```

- [ ] **Step 3: Punch spring + light-sweep on the curriculum cards**

In `ContainerCard`, find:
```tsx
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
```
Replace with (PUNCH config + a slight scale punch + `position: relative`/`overflow: hidden` so the sweep is clipped to the card):
```tsx
  const { fps } = useVideoConfig();
  const enter = spring({ frame: localFrame, fps, config: PUNCH });
  const x = interpolate(enter, [0, 1], [520, 0]);
  const scale = interpolate(enter, [0, 1], [0.92, 1]);
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        opacity: Math.min(1, enter),
        transform: `translateX(${x}px) scale(${scale})`,
```
Then, still in `ContainerCard`, find the label span's closing and the component's closing `</div>`:
```tsx
      >
        {label}
      </span>
    </div>
  );
};
```
Replace with (adds the sweep as the last child, firing ~12 frames after the card starts):
```tsx
      >
        {label}
      </span>
      <LightSweep localFrame={localFrame} from={12} dur={20} width={860} />
    </div>
  );
};
```

- [ ] **Step 4: Punch springs on the CTA lines and button**

In the `Line` component (CTA), find:
```tsx
  const p = spring({
    frame: frame - localFrom,
    fps,
    config: { damping: 18, stiffness: 200 },
  });
```
Replace with:
```tsx
  const p = spring({ frame: frame - localFrom, fps, config: PUNCH });
```
Then in `CtaBeat`, find the CTA reveal spring:
```tsx
  const cta = spring({
    frame: frame - (CTA_REVEAL_FROM - CTA_FROM),
    fps,
    config: { damping: 12, stiffness: 200 },
  });
```
Replace with:
```tsx
  const cta = spring({
    frame: frame - (CTA_REVEAL_FROM - CTA_FROM),
    fps,
    config: PUNCH,
  });
```

- [ ] **Step 5: Wrap the brand/explainer/curriculum/CTA beats in PushIn, and extend the boundary flash**

In `DockerCtaVideo`'s render, find the four beat sequences (brand, explainer, curriculum, CTA) and wrap each beat component in `<PushIn dur={...}>`:
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
      <Sequence from={CTA_FROM} durationInFrames={CTA_DUR}>
        <CtaBeat />
      </Sequence>
```
Replace with:
```tsx
      <Sequence from={BRAND_FROM} durationInFrames={BRAND_DUR}>
        <PushIn dur={BRAND_DUR}>
          <BrandBeat />
        </PushIn>
      </Sequence>
      <Sequence from={EXPLAIN_FROM} durationInFrames={EXPLAIN_DUR}>
        <PushIn dur={EXPLAIN_DUR}>
          <ExplainerBeat />
        </PushIn>
      </Sequence>
      <Sequence from={CURR_FROM} durationInFrames={CURR_DUR}>
        <PushIn dur={CURR_DUR}>
          <CurriculumBeat />
        </PushIn>
      </Sequence>
      <Sequence from={CTA_FROM} durationInFrames={CTA_DUR}>
        <PushIn dur={CTA_DUR}>
          <CtaBeat />
        </PushIn>
      </Sequence>
```
Then find the composition flash added in Task 3:
```tsx
      {/* Soft white flashes on the big hits (reads absolute frame at root) */}
      <Flash hits={[0, HOOK_FROM + HOOK_DOYOU]} />
```
Replace with (adds soft flashes at each beat boundary):
```tsx
      {/* Soft white flashes: hook hits + each beat boundary (whip cuts) */}
      <Flash
        hits={[0, HOOK_FROM + HOOK_DOYOU, BRAND_FROM, EXPLAIN_FROM, CURR_FROM, CTA_FROM]}
        peak={0.4}
      />
```

- [ ] **Step 6: Lint + full render + verify**

Run: `npm run lint` → expect exit 0.
Run: `npx remotion render docker-cta out/docker-cta.mp4 --codec=h264 --crf=18` → expect success.
Run:
```bash
echo -n "duration: "; ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 out/docker-cta.mp4
ffmpeg -i out/docker-cta.mp4 -af volumedetect -f null - 2>&1 | grep max_volume
ffmpeg -ss 0 -t 3.3 -i out/docker-cta.mp4 -af volumedetect -f null - 2>&1 | grep mean_volume
```
Expected: duration ≈ 40.0; `max_volume` < 0 dB; the hook window (0–3.3s) `mean_volume` is finite (impact/boom present).
Run stills to confirm the motion pass and that downstream beats still render correctly:
```bash
npx remotion still docker-cta out/t5-curr.png --frame=700
npx remotion still docker-cta out/t5-cta.png  --frame=1190
```
Expected: curriculum cards render (with the relative push-in scale) and a card light-sweep may be visible mid-stack; CTA fully composed. Read both.

- [ ] **Step 7: Commit**

```bash
git add src/components/DockerCtaVideo.tsx
git commit -m "feat(docker-cta): kinetic motion pass (push-in, punch, flashes, sweep, parallax)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review (completed by plan author)

**Spec coverage:**
- Slam hook (EVERYONE USES DOCKER / DO YOU), VO-silent, loaded frame 0, impact/boom/whoosh, shake/flash → Task 3. ✓
- Hook/brand retime + VO 01/02 relocation (synced to brand text) → Task 2 (timing) + Task 4 (text reveals at local 6/72 matching abs 106/172). ✓
- Whale hero (swim, bob, glow via DockerMark, ripple, bubbles) → Task 4. ✓
- Motion pass: punch springs (cards/CTA), push-in (beats), boundary flashes, card light-sweep, bg parallax → Task 5. ✓
- Flashes soft (peak ≤0.55 hook / 0.4 boundaries) and ≤2 frames (`t < 2`) → Task 3/5. ✓
- New impact + boom SFX via the generator → Task 1. ✓
- 1200/40s, EXPLAIN_FROM=255 unchanged → Task 2 (100+155=255), verified Task 5 render. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code; every run step shows command + expected output. ✓

**Type/name consistency:** `PUNCH`/`SETTLE` defined in Task 3, used in Tasks 3–5. `Shake`/`Flash` defined Task 3 (Flash reused Task 5). `IMPACT_SFX`/`BOOM_SFX` defined + used Task 3. `Whale`/`WaterFX` defined + used Task 4. `PushIn`/`LightSweep`/`FloatingContainers` defined + used Task 5. `HOOK_DOYOU`/`HOOK_WHIP` defined Task 3, reused for SFX/flash frames. `LightSweep` takes `localFrame` (not `useCurrentFrame`) to match `ContainerCard`'s passed-in `localFrame`. ✓

**Lint-ordering:** Each task references everything it introduces within the same commit (no cross-task unused-var gap): Task 3 introduces PUNCH/SETTLE/Shake/Flash/SlamWord/SFX consts and uses them immediately; Task 4 uses PUNCH/SETTLE (already defined in Task 3) + new Whale/WaterFX; Task 5 introduces PushIn/LightSweep/FloatingContainers and applies them in the same commit.

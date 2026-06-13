import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import type { TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { COLORS } from "../colors";
import { INTER } from "../fonts";
import { buildSweep, type SweepDirection } from "./BuildSweep";

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);

const OLD_VIDEO = "content/dad-revamp/old.webm";
const NEW_VIDEO = "content/dad-revamp/new.webm";
const MUSIC = "content/devops1-bootcamp/bg-music-clawdlens-v2.mp3";
const GLITCH = "content/dad-revamp/sfx/glitch.mp3";
const END_VO = "voiceover/dad-revamp/end.mp3";

// --- Beats: thematic old/new pairs. Source windows (seconds) are TUNABLE. ----
type Beat = {
  src: "old" | "new";
  from: number;
  to: number;
  label: "OLD" | "NEW";
};
const BEATS: Beat[] = [
  { src: "old", from: 3.5, to: 9.5, label: "OLD" }, // 1 dark generic hero + cards
  { src: "new", from: 0.5, to: 7.0, label: "NEW" }, // 2 light "We got your back" hero
  { src: "old", from: 32.5, to: 38.5, label: "OLD" }, // 3 dark AWS project diagrams
  { src: "new", from: 4.0, to: 10.5, label: "NEW" }, // 4 colorful EdTech product cards
  { src: "old", from: 9.5, to: 14.5, label: "OLD" }, // 5 dark lower + "Let's chat" CTA
  { src: "new", from: 40.5, to: 47.5, label: "NEW" }, // 6 Simple E-Commerce product page
];
const BEAT_FRAMES = BEATS.map((b) => sec(b.to) - sec(b.from));

// --- Transitions between beats (5). Build sweeps on O->N, fade on N->O. -------
const SWEEP = 18;
const RESET = 8;
type Trans =
  | { kind: "sweep"; dir: SweepDirection; frames: number }
  | { kind: "reset"; frames: number };
const TRANSITIONS: Trans[] = [
  { kind: "sweep", dir: "down", frames: SWEEP }, // T0 old->new hero
  { kind: "reset", frames: RESET }, // T1 new->old
  { kind: "sweep", dir: "diagonal", frames: SWEEP }, // T2 old->new products
  { kind: "reset", frames: RESET }, // T3 new->old
  { kind: "sweep", dir: "radial", frames: SWEEP }, // T4 old->new product page
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
const VO_DUR = sec(1.7); // measured 1.56s from end.mp3 (piper en_US-ryan-high)

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

// --- OLD/NEW pill — pinned near the top. Rendered on the absolute
// timeline (one per beat) rather than inside a beat, so exactly one correct
// label shows and it swaps cleanly at each cut instead of overlapping during
// the transition. ------------------------------------------------------------
const PillOverlay: React.FC<{ label: "OLD" | "NEW" }> = ({ label }) => {
  const isNew = label === "NEW";
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 32,
          padding: "9px 26px",
          borderRadius: 999,
          fontFamily: INTER,
          fontWeight: 800,
          fontSize: 32,
          letterSpacing: 3,
          color: isNew ? "#06231a" : "#2a0e0e",
          background: isNew ? COLORS.accent : "#ef4444",
          boxShadow: "0 6px 24px rgba(0,0,0,0.55)",
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};

// --- One beat: the recording full-bleed (fills the whole 1080x1920 frame) ----
const BeatView: React.FC<{ beat: Beat }> = ({ beat }) => {
  const src = beat.src === "old" ? OLD_VIDEO : NEW_VIDEO;
  return (
    <AbsoluteFill style={{ backgroundColor: "#05070f" }}>
      <Video
        src={staticFile(src)}
        trimBefore={sec(beat.from)}
        trimAfter={sec(beat.to)}
        muted
        objectFit="cover"
        style={{ width: "100%", height: "100%", objectPosition: "center" }}
      />
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

      {/* Footage beats with sweeps (O->N) and fades (N->O) */}
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
          const presentation = (
            t.kind === "sweep"
              ? buildSweep(t.dir)
              : fade({ shouldFadeOutExitingScene: true })
          ) as TransitionPresentation<Record<string, unknown>>;
          const transition = (
            <TransitionSeries.Transition
              key={`trans-${i}`}
              timing={linearTiming({ durationInFrames: t.frames })}
              presentation={presentation}
            />
          );
          return [seq, transition];
        })}
      </TransitionSeries>

      {/* OLD/NEW pill on the absolute timeline — one per beat, swaps at each cut */}
      {BEATS.map((beat, i) => {
        const from = BEAT_START[i];
        const to = i < BEATS.length - 1 ? BEAT_START[i + 1] : END_STAMP_FROM;
        return (
          <Sequence key={`pill-${i}`} from={from} durationInFrames={to - from}>
            <PillOverlay label={beat.label} />
          </Sequence>
        );
      })}

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

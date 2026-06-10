import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  Series,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { COLORS } from "../colors";
import { INTER } from "../fonts";
import { TypingText } from "./TypingText";

/**
 * ClawdLens v2 — "There's Gen Z, but I'm Gen 'y'".
 *
 * Base footage is a 4K HEVC *phone recording of a laptop* (rotation -90 →
 * portrait), transcoded to 1080×1920 H.264. It has NO audio, so the bed is
 * pure robot-voice TTS + keystroke/ding SFX (no music to duck).
 *
 * The 62.5s source is cut down to ~44.5s in-code via a <Series> of trimmed
 * <Video> segments (cut points are tunable here without re-encoding):
 *   1. the plain "DAD" website (the before)
 *   2. the superpowers redesign spec + approve prompt
 *   3. the `y` keystroke that approves it  ← the payoff beat
 *   4. the ClawdLens agent HUD getting to work
 */
const BASE_VIDEO = "content/devops1-bootcamp/clawdlens-v2.mp4";
const CLICK_SFX = "content/devops1-bootcamp/sfx/click.mp3";
const DING_SFX = "content/devops1-bootcamp/sfx/ding.mp3";

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);

// --- The cut: source [from,to] seconds, played back to back ----------------
const SEGMENTS: { fromSec: number; toSec: number; note: string }[] = [
  { fromSec: 2.0, toSec: 8.0, note: "plain DAD website (before)" },
  { fromSec: 14.0, toSec: 20.5, note: "superpowers redesign spec + approve" },
  { fromSec: 21.5, toSec: 25.5, note: "the `y` keystroke" },
  { fromSec: 29.5, toSec: 53.0, note: "ClawdLens HUD at work" },
];

const SEG_FRAMES = SEGMENTS.map((s) => sec(s.toSec) - sec(s.fromSec));
export const CLAWDLENSV2_TOTAL_FRAMES = SEG_FRAMES.reduce((a, b) => a + b, 0);

// Cumulative composition-frame where each segment starts (for caption timing).
const SEG_START: number[] = SEG_FRAMES.reduce<number[]>((acc, d, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SEG_FRAMES[i - 1]);
  return acc;
}, []);

// The `y` press is at source ~23.5s, inside segment 3 (starts at src 21.5s).
const Y_PRESS_FRAME = SEG_START[2] + sec(23.5 - 21.5);

const CHAR_FRAMES = 2;
const CURSOR_BLINK = 16;
const FADE = 8;
const CLICK_EVERY = 2;

// --- Captions ---------------------------------------------------------------
// "hero" = big, centered, typewriter (the hook + the payoff). "info" = calmer
// fade/slide milestone line. Timed to the cut above (composition frames).
type Caption = {
  text: string;
  from: number;
  durationInFrames: number;
  kind: "hero" | "info";
  emphasis?: boolean;
  fontSize: number;
};

const CAPTIONS: Caption[] = [
  {
    text: "There's Gen Z — but I'm Gen 'y'",
    from: 8,
    durationInFrames: 150,
    kind: "hero",
    fontSize: 58,
  },
  {
    text: "Full redesign specification, generated",
    from: SEG_START[1] + 12,
    durationInFrames: 168,
    kind: "info",
    fontSize: 42,
  },
  {
    text: "Input: y. Confirmed.",
    from: SEG_START[2] + 24,
    durationInFrames: 90,
    kind: "hero",
    fontSize: 60,
  },
  {
    text: "Reading. Planning. Building.",
    from: SEG_START[3] + 48,
    durationInFrames: 220,
    kind: "info",
    fontSize: 42,
  },
  {
    text: "Powered by the new Claude Fable",
    from: SEG_START[3] + 320,
    durationInFrames: 240,
    kind: "info",
    fontSize: 40,
  },
  {
    text: "Result pending. Stand by.",
    from: SEG_START[3] + 595,
    durationInFrames: CLAWDLENSV2_TOTAL_FRAMES - (SEG_START[3] + 595),
    kind: "info",
    emphasis: true,
    fontSize: 52,
  },
];

// --- Robot-voice TTS (piper), system-narrator register. Each starts on its
// caption's `from`. CAPTIONS[0] (the "Gen 'y'" title) is intentionally SILENT
// — it plays as a typed main-title card with keystroke clicks only, then the
// narration starts once the operation begins. ---------------------------------
const VOICEOVER: { file: string; from: number }[] = [
  { file: "voiceover/clawdlens-v2/02.mp3", from: CAPTIONS[1].from },
  { file: "voiceover/clawdlens-v2/03.mp3", from: CAPTIONS[2].from },
  { file: "voiceover/clawdlens-v2/04.mp3", from: CAPTIONS[3].from },
  { file: "voiceover/clawdlens-v2/05.mp3", from: CAPTIONS[4].from },
  { file: "voiceover/clawdlens-v2/06.mp3", from: CAPTIONS[5].from },
];

/** Per-keystroke click SFX while a hero line types in. */
const TypingClicks: React.FC<{ charCount: number }> = ({ charCount }) => {
  const clicks = [];
  for (let i = 0; i < charCount; i += CLICK_EVERY) {
    clicks.push(
      <Sequence
        key={i}
        from={i * CHAR_FRAMES}
        durationInFrames={CLICK_EVERY * CHAR_FRAMES}
      >
        <Audio src={staticFile(CLICK_SFX)} volume={0.6} />
      </Sequence>,
    );
  }
  return <>{clicks}</>;
};

const Scrim: React.FC<{
  children: React.ReactNode;
  emphasis?: boolean;
  big?: boolean;
}> = ({ children, emphasis = false, big = false }) => (
  <div
    style={{
      maxWidth: big ? 900 : 860,
      padding: big ? "32px 46px" : "20px 36px",
      borderRadius: big ? 28 : 20,
      background: "rgba(8, 11, 20, 0.78)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: `1px solid ${emphasis ? COLORS.accent : COLORS.videoBorder}`,
      boxShadow: "0 22px 60px rgba(0,0,0,0.6)",
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

/** Big, centered, typewriter caption — hook + payoff beats. */
const HeroBeat: React.FC<{ text: string; beatDuration: number; fontSize: number }> = ({
  text,
  beatDuration,
  fontSize,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, FADE, beatDuration - FADE, beatDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, pointerEvents: "none" }}
    >
      <Scrim big>
        <span
          style={{
            fontFamily: INTER,
            fontWeight: 800,
            fontSize,
            lineHeight: 1.15,
            letterSpacing: -0.5,
            color: COLORS.white,
            textShadow: "0 2px 16px rgba(0,0,0,0.65)",
          }}
        >
          <TypingText
            text={text}
            charFrames={CHAR_FRAMES}
            cursorBlinkFrames={CURSOR_BLINK}
            cursorColor={COLORS.accent}
          />
        </span>
      </Scrim>
    </AbsoluteFill>
  );
};

/**
 * Calmer milestone caption — fades + slides, sits in the lower third (over the
 * keyboard, clear of the laptop screen). The teaser uses accent emphasis.
 */
const InfoBeat: React.FC<{
  text: string;
  beatDuration: number;
  fontSize: number;
  emphasis?: boolean;
}> = ({ text, beatDuration, fontSize, emphasis = false }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, FADE, beatDuration - FADE, beatDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const slide = interpolate(frame, [0, FADE], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 360,
        pointerEvents: "none",
      }}
    >
      <div style={{ opacity, transform: `translateY(${slide}px)` }}>
        <Scrim emphasis={emphasis}>
          <span
            style={{
              fontFamily: INTER,
              fontWeight: emphasis ? 800 : 700,
              fontSize,
              lineHeight: 1.2,
              letterSpacing: -0.3,
              color: emphasis ? COLORS.accent : COLORS.white,
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
            }}
          >
            {text}
          </span>
        </Scrim>
      </div>
    </AbsoluteFill>
  );
};

export const ClawdLensV2Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Cut footage: trimmed segments played back to back (no audio). */}
      <Series>
        {SEGMENTS.map((s, i) => (
          <Series.Sequence
            key={s.fromSec}
            durationInFrames={SEG_FRAMES[i]}
            premountFor={FPS}
          >
            <Video
              src={staticFile(BASE_VIDEO)}
              trimBefore={sec(s.fromSec)}
              trimAfter={sec(s.toSec)}
              muted
            />
          </Series.Sequence>
        ))}
      </Series>

      {/* Captions on the absolute timeline */}
      {CAPTIONS.map((c) =>
        c.kind === "hero" ? (
          <Sequence
            key={c.from}
            from={c.from}
            durationInFrames={c.durationInFrames}
            premountFor={FPS}
          >
            <HeroBeat text={c.text} beatDuration={c.durationInFrames} fontSize={c.fontSize} />
            <TypingClicks charCount={c.text.length} />
          </Sequence>
        ) : (
          <Sequence
            key={c.from}
            from={c.from}
            durationInFrames={c.durationInFrames}
            premountFor={FPS}
          >
            <InfoBeat
              text={c.text}
              beatDuration={c.durationInFrames}
              fontSize={c.fontSize}
              emphasis={c.emphasis}
            />
          </Sequence>
        ),
      )}

      {/* Reveal ding on the actual `y` keystroke */}
      <Sequence from={Y_PRESS_FRAME} durationInFrames={FPS}>
        <Audio src={staticFile(DING_SFX)} volume={0.9} />
      </Sequence>

      {/* Robot-voice TTS, one clip per caption (no music to duck) */}
      {VOICEOVER.map((vo) => (
        <Sequence key={vo.file} from={vo.from} premountFor={FPS}>
          <Audio src={staticFile(vo.file)} volume={1.1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

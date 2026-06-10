import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { COLORS } from "../colors";
import { INTER } from "../fonts";
import { TypingText } from "./TypingText";

// Source recording (HEVC → transcoded to H.264 for reliable headless decode).
const BASE_VIDEO = "content/devops1-bootcamp/clawdlens.mp4";
const CLICK_SFX = "content/devops1-bootcamp/sfx/click.mp3";
const DING_SFX = "content/devops1-bootcamp/sfx/ding.mp3";

const HOOK = "What happens when you let agentic AI take the wheel?";
const REVEAL = "this happens.";

const CHAR_FRAMES = 2; // frames per character → ~15 cps typing
const CURSOR_BLINK = 16;
const FADE = 8; // fade in/out frames for each beat
const CLICK_EVERY = 2; // keystroke click cadence (every Nth character)
const SUBTITLE_BOTTOM = 300; // lower-third offset — sits in the HUD's dark band

// Beat 1 — the hook question
const HOOK_FROM = 10;
const HOOK_DUR = 150;

// Beat 2 — the reveal
const REVEAL_FROM = HOOK_FROM + HOOK_DUR + 6; // small gap between beats
const REVEAL_DUR = 80;

export const CLAWDLENS_TOTAL_FRAMES = 1654; // matches the 55.1s source clip

// Milestone captions (3rd-person narrator) that translate the dense, sped-up
// agent HUD into a story a scroller can follow. Timed to the HUD/slide phases;
// tunable. Lower-third, fade+slide (typewriter is reserved for the hero hook).
type Subtitle = {
  text: string;
  from: number;
  durationInFrames: number;
  emphasis?: boolean;
};

const SUBTITLES: Subtitle[] = [
  { text: "First, it reads the past lessons for context", from: 258, durationInFrames: 192 },
  { text: "Drafts the full lesson outline", from: 468, durationInFrames: 192 },
  { text: "Then writes and renders every slide", from: 672, durationInFrames: 96 },
  // Synced to the on-screen Git log panel (~26–30s)
  { text: "Commits to git. Ships it.", from: 780, durationInFrames: 120 },
  { text: "Lints its own work — and fixes its own bugs", from: 1080, durationInFrames: 246 },
  { text: "All from one prompt.", from: 1548, durationInFrames: 106, emphasis: true },
];

// Piper (offline) TTS narration, one clip per milestone caption. Durations are
// the measured mp3 lengths in frames; each starts on its caption's `from`.
const VOICE_DUCK = 0.22; // base-recording volume while the voice plays (~-13dB)
const VOICE_RAMP = 8; // frames to ramp the music down/up around each line

const VOICEOVER: { file: string; from: number; durationInFrames: number }[] = [
  { file: "voiceover/clawdlens/01.mp3", from: 258, durationInFrames: 103 }, // reads
  { file: "voiceover/clawdlens/02.mp3", from: 468, durationInFrames: 64 }, // drafts
  { file: "voiceover/clawdlens/03.mp3", from: 672, durationInFrames: 73 }, // writes
  { file: "voiceover/clawdlens/05.mp3", from: 780, durationInFrames: 57 }, // commits (git panel)
  { file: "voiceover/clawdlens/04.mp3", from: 1080, durationInFrames: 89 }, // lints
  { file: "voiceover/clawdlens/06.mp3", from: 1548, durationInFrames: 45 }, // payoff
];

// Duck the recording's own audio under each voiceover line (with a short ramp).
const baseVideoVolume = (f: number): number => {
  let v = 1;
  for (const vo of VOICEOVER) {
    const ducked = interpolate(
      f,
      [
        vo.from - VOICE_RAMP,
        vo.from,
        vo.from + vo.durationInFrames,
        vo.from + vo.durationInFrames + VOICE_RAMP,
      ],
      [1, VOICE_DUCK, VOICE_DUCK, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    v = Math.min(v, ducked);
  }
  return v;
};

/**
 * Plays per-keystroke click SFX while a line types in. Each click is trimmed
 * short so the 1s padded clip never overlaps into a buzz.
 */
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

/**
 * A centered, typed caption on a translucent scrim. Fades in/out across its
 * own beat duration so the underlying recording is unobstructed afterward.
 */
const CaptionBeat: React.FC<{
  text: string;
  beatDuration: number;
  fontSize: number;
}> = ({ text, beatDuration, fontSize }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, FADE, beatDuration - FADE, beatDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          padding: "36px 48px",
          borderRadius: 28,
          background: "rgba(8, 11, 20, 0.74)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: `1px solid ${COLORS.videoBorder}`,
          boxShadow: "0 24px 70px rgba(0,0,0,0.6)",
          textAlign: "center",
        }}
      >
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
      </div>
    </AbsoluteFill>
  );
};

/**
 * Lower-third milestone caption. Fades + slides in/out across its beat so it
 * narrates a phase without permanently obscuring the footage. The final stat
 * beat uses `emphasis` (larger, accent-coloured) as the payoff card.
 */
const SubtitleBeat: React.FC<{
  text: string;
  beatDuration: number;
  emphasis?: boolean;
}> = ({ text, beatDuration, emphasis = false }) => {
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
        paddingBottom: SUBTITLE_BOTTOM,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${slide}px)`,
          maxWidth: 860,
          padding: emphasis ? "22px 40px" : "18px 32px",
          borderRadius: 20,
          background: "rgba(8, 11, 20, 0.82)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: `1px solid ${COLORS.videoBorder}`,
          boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: INTER,
            fontWeight: emphasis ? 800 : 700,
            fontSize: emphasis ? 50 : 40,
            lineHeight: 1.2,
            letterSpacing: -0.3,
            color: emphasis ? COLORS.accent : COLORS.white,
            textShadow: "0 2px 12px rgba(0,0,0,0.6)",
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};

export const ClawdLensVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Video src={staticFile(BASE_VIDEO)} volume={baseVideoVolume} />

      {/* Beat 1 — hook question */}
      <Sequence from={HOOK_FROM} durationInFrames={HOOK_DUR}>
        <CaptionBeat text={HOOK} beatDuration={HOOK_DUR} fontSize={62} />
        <TypingClicks charCount={HOOK.length} />
      </Sequence>

      {/* Beat 2 — the reveal */}
      <Sequence from={REVEAL_FROM} durationInFrames={REVEAL_DUR}>
        <CaptionBeat text={REVEAL} beatDuration={REVEAL_DUR} fontSize={88} />
        <TypingClicks charCount={REVEAL.length} />
        <Sequence from={REVEAL.length * CHAR_FRAMES}>
          <Audio src={staticFile(DING_SFX)} volume={0.9} />
        </Sequence>
      </Sequence>

      {/* Throughout — milestone narrator captions */}
      {SUBTITLES.map((s) => (
        <Sequence key={s.from} from={s.from} durationInFrames={s.durationInFrames}>
          <SubtitleBeat
            text={s.text}
            beatDuration={s.durationInFrames}
            emphasis={s.emphasis}
          />
        </Sequence>
      ))}

      {/* TTS voiceover, one clip per caption (music ducks underneath) */}
      {VOICEOVER.map((vo) => (
        <Sequence key={vo.file} from={vo.from}>
          <Audio src={staticFile(vo.file)} volume={1.1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

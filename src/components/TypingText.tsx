import { interpolate, useCurrentFrame } from "remotion";

const CURSOR = "▌"; // ▌ block cursor

/**
 * Frame-driven typewriter. Reveals `text` one character at a time by string
 * slicing (never per-character opacity) with a blinking cursor. Designed to
 * live inside a <Sequence>, so the frame counter resets to 0 when the beat
 * starts.
 */
export const TypingText: React.FC<{
  text: string;
  charFrames: number;
  cursorBlinkFrames: number;
  cursorColor?: string;
}> = ({ text, charFrames, cursorBlinkFrames, cursorColor = "currentColor" }) => {
  const frame = useCurrentFrame();

  const typedChars = Math.min(
    text.length,
    Math.max(0, Math.floor(frame / charFrames)),
  );
  const typed = text.slice(0, typedChars);

  const cursorOpacity = interpolate(
    frame % cursorBlinkFrames,
    [0, cursorBlinkFrames / 2, cursorBlinkFrames],
    [1, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <span>
      {typed}
      <span style={{ opacity: cursorOpacity, color: cursorColor }}>
        {CURSOR}
      </span>
    </span>
  );
};

import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  Easing,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { COLORS } from "../colors";
import { INTER } from "../fonts";
import { T9Dialer } from "../components/T9Dialer";

// Timeline ~390 frames (13s at 30fps):
//
// Phase 1: Move mode (0-210)
//   0-20:    Entrance
//   25-50:   Hold button 3 → enter move mode
//   55-190:  Drag dialer across phone screen
//   195-215: Hold button 3 again → exit move mode
//
// Phase 2: Resize (225-340)
//   230-248: Hold button 4 → shrink
//   255-273: Hold button 4 → shrink more
//   280-298: Hold button 6 → expand
//   305-323: Hold button 6 → expand more
//
// 340+: Tagline

const STATEMENTS: { text: string; startFrame: number; endFrame: number }[] = [
  { text: "Enter Move Mode", startFrame: 25, endFrame: 54 },
  { text: "Drag Anywhere\non Screen", startFrame: 55, endFrame: 194 },
  { text: "Save Position", startFrame: 195, endFrame: 224 },
  { text: "Shrink", startFrame: 230, endFrame: 279 },
  { text: "Expand", startFrame: 280, endFrame: 339 },
  { text: "Drag. Resize.\nYour launcher,\nyour way.", startFrame: 340, endFrame: 9999 },
];

export const Scene4Customization: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const isInMoveMode = frame >= 50 && frame < 215;

  const dragX = isInMoveMode
    ? interpolate(frame, [55, 100, 150, 190], [0, 100, 100, -60], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.quad),
      })
    : frame >= 215
      ? -60
      : 0;

  const dragY = isInMoveMode
    ? interpolate(frame, [55, 100, 150, 190], [0, -160, -80, -220], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.quad),
      })
    : frame >= 215
      ? -220
      : 0;

  // Snappy resize — tight keyframes
  const smoothScale = interpolate(
    frame,
    [230, 248, 255, 273, 280, 298, 305, 323, 330, 340],
    [1, 0.9, 0.9, 0.8, 0.8, 0.9, 0.9, 1.0, 1.05, 1.0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const getActiveHold = (): { digit: string; frame: number } | null => {
    // Hold 3 to enter move mode
    if (frame >= 25 && frame < 50) return { digit: "3", frame: 25 };
    // Hold 3 to exit move mode
    if (frame >= 195 && frame < 215) return { digit: "3", frame: 195 };
    // Hold 4 to shrink (twice) — snappy 18-frame holds
    if (frame >= 230 && frame < 248) return { digit: "4", frame: 230 };
    if (frame >= 255 && frame < 273) return { digit: "4", frame: 255 };
    // Hold 6 to expand (twice)
    if (frame >= 280 && frame < 298) return { digit: "6", frame: 280 };
    if (frame >= 305 && frame < 323) return { digit: "6", frame: 305 };
    return null;
  };

  const activeHold = getActiveHold();

  const currentStatement = STATEMENTS.find(
    (s) => frame >= s.startFrame && frame < s.endFrame,
  );

  // Animated tilt — tilted left with gentle oscillation
  const tiltY = interpolate(
    frame,
    [0, 3 * fps, 6 * fps, 10 * fps],
    [-12, -9, -14, -10],
    { extrapolateRight: "clamp" },
  );
  const tiltX = interpolate(
    frame,
    [0, 4 * fps, 8 * fps],
    [3, 5, 2],
    { extrapolateRight: "clamp" },
  );

  const phoneWidth = Math.round(830 * (9 / 16));
  const phoneHeight = 830;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.videoBg,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 80,
        padding: "0 190px 0 100px",
      }}
    >
      {/* Right side — Bold statements (now first in flex order) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-end",
          minWidth: 400,
        }}
      >
        {currentStatement && (
          <StatementText
            key={currentStatement.startFrame}
            text={currentStatement.text}
            frame={frame}
            startFrame={currentStatement.startFrame}
            fps={fps}
            isFinal={currentStatement.startFrame === 260}
            isMove={isInMoveMode}
          />
        )}
      </div>

      {/* Right side — Phone with 3D perspective tilt (left) */}
      <div
        style={{
          opacity: interpolate(entrance, [0, 1], [0, 1]),
          transform: `scale(${interpolate(entrance, [0, 1], [0.9, 1])})`,
          perspective: 1200,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: phoneWidth,
            height: phoneHeight,
            borderRadius: 44,
            position: "relative",
            overflow: "hidden",
            border: `1px solid ${COLORS.border}`,
            backgroundColor: "#000000",
            transform: `rotateY(${tiltY}deg) rotateX(${tiltX}deg)`,
            transformStyle: "preserve-3d",
            boxShadow: "30px 30px 80px rgba(0,0,0,0.5), -8px -8px 30px rgba(255,255,255,0.03)",
          }}
        >
          {/* Jinx wallpaper */}
          <Img
            src={staticFile("content/t9-app-dialer/jinx.png")}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: 0,
              left: 0,
              objectFit: "cover",
              objectPosition: "center center",
              transform: "scale(1.0)",
              opacity: 0.5,
            }}
          />

          {/* Status bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.6)",
                fontFamily: INTER,
              }}
            >
              12:00
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div
                style={{
                  width: 22,
                  height: 14,
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.4)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 2,
                    top: 2,
                    bottom: 2,
                    width: "70%",
                    backgroundColor: "rgba(255,255,255,0.5)",
                    borderRadius: 1,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Floating T9 Dialer */}
          <div
            style={{
              position: "absolute",
              bottom: 30,
              left: "50%",
              transform: `translate(calc(-50% + ${dragX}px), ${dragY}px) scale(${smoothScale})`,
              transformOrigin: "center center",
            }}
          >
            <T9Dialer
              theme="dark"
              scale={0.8}
              moveMode={isInMoveMode}
              activeDigit={activeHold?.digit ?? null}
              pressFrame={activeHold?.frame}
            />
          </div>
        </div>
      </div>

    </AbsoluteFill>
  );
};

const StatementText: React.FC<{
  text: string;
  frame: number;
  startFrame: number;
  fps: number;
  isFinal: boolean;
  isMove: boolean;
}> = ({ text, frame, startFrame, fps, isFinal, isMove }) => {
  const localFrame = frame - startFrame;

  const entrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [40, 0]);

  const color = isFinal
    ? COLORS.white
    : isMove
      ? COLORS.moveHighlight
      : COLORS.accent;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: INTER,
          fontSize: isFinal ? 52 : 64,
          fontWeight: 800,
          color,
          lineHeight: 1.15,
          whiteSpace: "pre-line",
          textAlign: "right",
        }}
      >
        {text}
      </div>
    </div>
  );
};

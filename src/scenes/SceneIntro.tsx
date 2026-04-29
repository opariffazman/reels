import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { COLORS } from "../colors";
import { INTER } from "../fonts";

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappier springs — higher stiffness, less delay between elements
  const iconEntrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 220 },
  });

  const titleProgress = spring({
    frame: frame - 8,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  const taglineProgress = spring({
    frame: frame - 16,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // Faster zoom out
  const zoomStart = 2.5 * fps;
  const zoomProgress = interpolate(
    frame,
    [zoomStart, zoomStart + 0.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const zoomScale = interpolate(zoomProgress, [0, 1], [1, 1.4]);
  const zoomOpacity = interpolate(zoomProgress, [0, 0.5, 1], [1, 0.8, 0]);

  const glowPulse = Math.sin(frame * 0.05) * 0.03 + 0.08;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.videoBg,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.accent} 0%, transparent 70%)`,
          opacity: glowPulse,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          transform: `scale(${zoomScale})`,
          opacity: zoomOpacity,
        }}
      >
        <div
          style={{
            transform: `scale(${iconEntrance})`,
          }}
        >
          <Img
            src={staticFile("content/t9-app-dialer/t9-icon.png")}
            style={{
              width: 200,
              height: 200,
              objectFit: "contain",
            }}
          />
        </div>

        <div
          style={{
            opacity: interpolate(titleProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily: INTER,
              fontSize: 76,
              fontWeight: 800,
              color: COLORS.white,
              textAlign: "center",
            }}
          >
            T9 App Dialer
          </div>
        </div>

        <div
          style={{
            opacity: interpolate(taglineProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(taglineProgress, [0, 1], [20, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily: INTER,
              fontSize: 32,
              fontWeight: 400,
              color: COLORS.muted,
              textAlign: "center",
            }}
          >
            A minimalist Android launcher with T9 keypad search
          </div>
        </div>

        <div
          style={{
            width: interpolate(taglineProgress, [0, 1], [0, 120]),
            height: 4,
            backgroundColor: COLORS.accent,
            borderRadius: 2,
            marginTop: 6,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

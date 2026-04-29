import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { mdiEmail, mdiContacts, mdiCog } from "@mdi/js";
import { COLORS } from "../colors";
import { INTER } from "../fonts";
import { T9Dialer } from "../components/T9Dialer";

const DEMO_RESULTS = [
  { icon: mdiEmail, name: "Gmail", iconColor: "#ef4444" },
  { icon: mdiContacts, name: "Contacts", iconColor: "#22c55e" },
  { icon: mdiCog, name: "Settings", iconColor: "#94a3b8" },
];

export const Scene3Themes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const isLight = frame >= 55 && frame < 125;
  const currentTheme = isLight ? "light" : "dark";

  const isHolding2 =
    (frame >= 40 && frame < 55) || (frame >= 110 && frame < 125);

  const themeName = isLight ? "Light Mode" : "Dark Mode";

  const hintProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 200 },
  });

  const labelProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 200 },
  });

  const taglineProgress = spring({
    frame: frame - 130,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.videoBg,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 30,
      }}
    >
      <div
        style={{
          opacity: interpolate(hintProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(hintProgress, [0, 1], [15, 0])}px)`,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: INTER,
            fontSize: 22,
            color: COLORS.muted,
            textTransform: "uppercase",
            letterSpacing: 3,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          Hold{" "}
          <span
            style={{
              backgroundColor: COLORS.border,
              padding: "4px 12px",
              borderRadius: 8,
              fontWeight: 700,
              color: COLORS.white,
            }}
          >
            2
          </span>{" "}
          to toggle theme
        </div>
      </div>

      <div
        style={{
          opacity: interpolate(entrance, [0, 1], [0, 1]),
          transform: `scale(${interpolate(entrance, [0, 1], [0.9, 1])})`,
        }}
      >
        <T9Dialer
          theme={currentTheme}
          scale={1.3}
          activeDigit={isHolding2 ? "2" : null}
          pressFrame={isHolding2 ? frame : undefined}
          results={DEMO_RESULTS}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: interpolate(labelProgress, [0, 1], [0, 1]),
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: isLight ? COLORS.lightBg : COLORS.bg,
            border: `3px solid ${COLORS.accent}`,
          }}
        />
        <div
          style={{
            fontFamily: INTER,
            fontSize: 28,
            fontWeight: 600,
            color: COLORS.white,
          }}
        >
          {themeName}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 70,
          opacity: interpolate(taglineProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(taglineProgress, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: INTER,
            fontSize: 42,
            fontWeight: 700,
            color: COLORS.white,
          }}
        >
          Light & Dark themes
        </div>
      </div>
    </AbsoluteFill>
  );
};

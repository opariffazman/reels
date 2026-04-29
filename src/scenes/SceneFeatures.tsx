import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  mdiMagnify,
  mdiLightningBolt,
  mdiPalette,
  mdiCellphone,
  mdiShieldCheckOutline,
  mdiHeartOutline,
  mdiWeatherNight,
  mdiArrowAll,
  mdiArrowExpandAll,
} from "@mdi/js";
import { COLORS } from "../colors";
import { INTER } from "../fonts";
import { MdiIcon } from "../components/MdiIcon";

interface Feature {
  title: string;
  subtitle: string;
  iconPath: string;
  accentColor: string;
}

const FEATURES: Feature[] = [
  {
    title: "Smart T9 Matching",
    subtitle: "Beginning · Word start · Substring",
    iconPath: mdiMagnify,
    accentColor: "#22c55e",
  },
  {
    title: "Real-time Filtering",
    subtitle: "Results update as you type each digit",
    iconPath: mdiLightningBolt,
    accentColor: "#3b82f6",
  },
  {
    title: "Custom Icon Packs",
    subtitle: "Personalize with your favorite icon set",
    iconPath: mdiPalette,
    accentColor: "#a855f7",
  },
  {
    title: "Light & Dark Themes",
    subtitle: "Switch between light and dark instantly",
    iconPath: mdiWeatherNight,
    accentColor: "#f59e0b",
  },
  {
    title: "Drag to Reposition",
    subtitle: "Place the dialer anywhere on screen",
    iconPath: mdiArrowAll,
    accentColor: "#f97316",
  },
  {
    title: "Resize Container",
    subtitle: "Shrink or expand to fit your screen",
    iconPath: mdiArrowExpandAll,
    accentColor: "#06b6d4",
  },
  {
    title: "Instant App Management",
    subtitle: "View info · Play Store · Uninstall",
    iconPath: mdiCellphone,
    accentColor: "#ef4444",
  },
  {
    title: "100% Kotlin · ~15MB",
    subtitle: "No permissions required · Android 6.0+",
    iconPath: mdiShieldCheckOutline,
    accentColor: "#7F52FF",
  },
  {
    title: "Free · No Ads · Open Source",
    subtitle: "MIT Licensed — forever free",
    iconPath: mdiHeartOutline,
    accentColor: "#22c55e",
  },
];

const FRAMES_PER_FEATURE = 25;
const EXIT_START = FRAMES_PER_FEATURE - 8;

export const SceneFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentIndex = Math.min(
    Math.floor(frame / FRAMES_PER_FEATURE),
    FEATURES.length - 1,
  );
  const localFrame = frame - currentIndex * FRAMES_PER_FEATURE;

  const feature = FEATURES[currentIndex];
  const isLast = currentIndex === FEATURES.length - 1;

  const enterProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  const exitProgress =
    !isLast && localFrame >= EXIT_START
      ? spring({
          frame: localFrame - EXIT_START,
          fps,
          config: { damping: 200 },
        })
      : 0;

  const opacity =
    interpolate(enterProgress, [0, 1], [0, 1]) * (1 - exitProgress);
  const translateY =
    interpolate(enterProgress, [0, 1], [80, 0]) +
    interpolate(exitProgress, [0, 1], [0, -50]);
  const scale =
    interpolate(enterProgress, [0, 1], [0.85, 1]) *
    interpolate(exitProgress, [0, 1], [1, 0.95]);

  const dotsEntrance = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const glowOpacity =
    interpolate(enterProgress, [0, 1], [0, 0.08]) * (1 - exitProgress);

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
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${feature.accentColor} 0%, transparent 70%)`,
          opacity: glowOpacity,
        }}
      />

      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 30,
            backgroundColor: `${feature.accentColor}15`,
            border: `1px solid ${feature.accentColor}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MdiIcon
            path={feature.iconPath}
            size={64}
            color={feature.accentColor}
          />
        </div>

        <div
          style={{
            fontFamily: INTER,
            fontSize: 62,
            fontWeight: 800,
            color: COLORS.white,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {feature.title}
        </div>

        <div
          style={{
            fontFamily: INTER,
            fontSize: 28,
            fontWeight: 400,
            color: feature.accentColor,
            textAlign: "center",
            letterSpacing: 0.5,
          }}
        >
          {feature.subtitle}
        </div>

        <div
          style={{
            width: interpolate(enterProgress, [0, 1], [0, 180]),
            height: 4,
            backgroundColor: feature.accentColor,
            borderRadius: 2,
            marginTop: 10,
            opacity: 1 - exitProgress,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 60,
          display: "flex",
          gap: 14,
          opacity: interpolate(dotsEntrance, [0, 1], [0, 1]),
        }}
      >
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            style={{
              width: i === currentIndex ? 36 : 12,
              height: 12,
              borderRadius: 6,
              backgroundColor:
                i === currentIndex ? f.accentColor : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

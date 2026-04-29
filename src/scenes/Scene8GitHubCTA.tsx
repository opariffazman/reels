import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { mdiGithub, mdiStar } from "@mdi/js";
import { COLORS } from "../colors";
import { INTER, MONO } from "../fonts";
import { MdiIcon } from "../components/MdiIcon";

export const Scene8GitHubCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoEntrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 200 },
  });
  const logoRotation = interpolate(logoEntrance, [0, 1], [-180, 0]);

  const labelProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 },
  });

  const ctaProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 200 },
  });

  const urlProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 200 },
  });

  const starScale = 1 + Math.sin(frame * 0.1) * 0.08;

  const orbitAngle1 = (frame / fps) * 1.5;
  const orbitAngle2 = (frame / fps) * 1.5 + (2 * Math.PI) / 3;
  const orbitAngle3 = (frame / fps) * 1.5 + (4 * Math.PI) / 3;
  const orbitRadius = 180;

  const particles = Array.from({ length: 12 }).map((_, i) => ({
    x: Math.sin(frame * 0.02 + i * 1.2) * (300 + i * 45),
    y: Math.cos(frame * 0.015 + i * 0.8) * (150 + i * 30),
    size: 4 + (i % 4) * 2,
    opacity: 0.15 + (i % 3) * 0.1,
  }));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.videoBg,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${COLORS.videoBorder}40 1px, transparent 1px), linear-gradient(90deg, ${COLORS.videoBorder}40 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: 0.3,
        }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `calc(50% + ${p.x}px)`,
            top: `calc(50% + ${p.y}px)`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: COLORS.accent,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Open Source label */}
      <div
        style={{
          position: "absolute",
          top: 120,
          opacity: interpolate(labelProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(labelProgress, [0, 1], [30, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: INTER,
            fontSize: 24,
            fontWeight: 800,
            color: COLORS.accent,
            letterSpacing: 5,
            textTransform: "uppercase",
            backgroundColor: `${COLORS.accent}15`,
            padding: "12px 30px",
            borderRadius: 30,
            border: `1px solid ${COLORS.accent}40`,
          }}
        >
          100% Open Source · MIT License
        </div>
      </div>

      {/* GitHub logo with orbiting stars */}
      <div style={{ position: "relative" }}>
        {[orbitAngle1, orbitAngle2, orbitAngle3].map((angle, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `calc(50% + ${Math.cos(angle) * orbitRadius}px - 18px)`,
              top: `calc(50% + ${Math.sin(angle) * orbitRadius}px - 18px)`,
              transform: `scale(${starScale})`,
              opacity: 0.8,
            }}
          >
            <MdiIcon path={mdiStar} size={36} color={COLORS.accent} />
          </div>
        ))}

        <div
          style={{
            transform: `scale(${logoEntrance}) rotate(${logoRotation}deg)`,
          }}
        >
          <MdiIcon path={mdiGithub} size={120} color={COLORS.white} />
        </div>
      </div>

      {/* Star us text */}
      <div
        style={{
          marginTop: 44,
          opacity: interpolate(ctaProgress, [0, 1], [0, 1]),
          transform: `scale(${interpolate(ctaProgress, [0, 1], [0.9, starScale])})`,
        }}
      >
        <div
          style={{
            fontFamily: INTER,
            fontSize: 54,
            fontWeight: 800,
            color: COLORS.white,
          }}
        >
          Star us on GitHub
        </div>
      </div>

      {/* URL card */}
      <div
        style={{
          marginTop: 28,
          opacity: interpolate(urlProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(urlProgress, [0, 1], [30, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 28,
            color: COLORS.accent,
            backgroundColor: COLORS.videoSurface,
            padding: "20px 40px",
            borderRadius: 18,
            border: `1px solid ${COLORS.videoBorder}`,
          }}
        >
          github.com/officialdad/t9-app-dialer
        </div>
      </div>
    </AbsoluteFill>
  );
};

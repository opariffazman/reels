import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { mdiEmail } from "@mdi/js";
import { COLORS } from "../colors";
import { INTER, MONO } from "../fonts";
import { T9Dialer } from "../components/T9Dialer";

export const Scene7Nostalgia: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sweepProgress = interpolate(frame, [0.5 * fps, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textProgress = spring({
    frame: frame - 2.2 * fps,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.videoBg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        {/* Phones row */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            position: "relative",
            width: 1100,
            height: 520,
          }}
        >
          {/* Old Nokia side */}
          <div
            style={{
              width: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              filter: "grayscale(100%) sepia(40%)",
              opacity: 0.7,
            }}
          >
            <div
              style={{
                width: 200,
                height: 370,
                backgroundColor: "#555",
                borderRadius: "18px 18px 36px 36px",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 155,
                  height: 108,
                  backgroundColor: "#b8c890",
                  borderRadius: 6,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 16,
                    color: "#2d3a1a",
                    textAlign: "center",
                  }}
                >
                  T9 Word
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 5,
                  width: "100%",
                }}
              >
                {[
                  "1", "2", "3", "4", "5", "6",
                  "7", "8", "9", "*", "0", "#",
                ].map((k) => (
                  <div
                    key={k}
                    style={{
                      backgroundColor: "#444",
                      borderRadius: 6,
                      padding: 7,
                      textAlign: "center",
                      fontFamily: INTER,
                      fontSize: 15,
                      color: "#999",
                    }}
                  >
                    {k}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: `${(1 - sweepProgress) * 100}%`,
              bottom: 0,
              width: 3,
              background: `linear-gradient(to bottom, ${COLORS.accent}, transparent)`,
            }}
          />

          {/* Modern side */}
          <div
            style={{
              width: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ transform: "scale(0.85)" }}>
              <T9Dialer
                theme="dark"
                results={[
                  { icon: mdiEmail, name: "Gmail", iconColor: "#ef4444" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Year labels */}
        <div
          style={{
            width: 1100,
            display: "flex",
            marginTop: 20,
          }}
        >
          <div
            style={{
              width: "50%",
              textAlign: "center",
              fontFamily: INTER,
              fontSize: 24,
              color: COLORS.muted,
              fontWeight: 600,
              filter: "grayscale(100%) sepia(40%)",
            }}
          >
            2003
          </div>
          <div
            style={{
              width: "50%",
              textAlign: "center",
              fontFamily: INTER,
              fontSize: 24,
              color: COLORS.accent,
              fontWeight: 600,
            }}
          >
            2025
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          opacity: interpolate(textProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(textProgress, [0, 1], [30, 0])}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: INTER,
            fontSize: 50,
            fontWeight: 800,
            color: COLORS.white,
          }}
        >
          The T9 you loved.{" "}
          <span style={{ color: COLORS.accent }}>Reimagined.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

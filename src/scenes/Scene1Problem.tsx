import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  mdiCamera,
  mdiCalendar,
  mdiCalculator,
  mdiClockOutline,
  mdiContacts,
  mdiGoogleChrome,
  mdiFolder,
  mdiMapMarker,
  mdiEmail,
  mdiGamepad,
  mdiImage,
  mdiMusic,
  mdiNewspaper,
  mdiNoteText,
  mdiPhone,
  mdiGooglePlay,
  mdiPodcast,
  mdiSecurity,
  mdiCog,
  mdiMessage,
  mdiYoutube,
  mdiGoogleDrive,
  mdiLinkedin,
  mdiBankOutline,
  mdiFood,
  mdiAirplane,
  mdiCar,
  mdiBullseyeArrow,
  mdiFileChart,
  mdiPalette,
  mdiWrench,
  mdiLightbulbOnOutline,
} from "@mdi/js";
import { COLORS } from "../colors";
import { INTER } from "../fonts";
import { MdiIcon } from "../components/MdiIcon";

const APP_LIST = [
  { icon: mdiCamera, name: "Camera", color: "#ef4444" },
  { icon: mdiCalendar, name: "Calendar", color: "#3b82f6" },
  { icon: mdiCalculator, name: "Calculator", color: "#8b5cf6" },
  { icon: mdiClockOutline, name: "Clock", color: "#06b6d4" },
  { icon: mdiContacts, name: "Contacts", color: "#22c55e" },
  { icon: mdiGoogleChrome, name: "Chrome", color: "#f59e0b" },
  { icon: mdiFolder, name: "Files", color: "#64748b" },
  { icon: mdiMapMarker, name: "Maps", color: "#22c55e" },
  { icon: mdiEmail, name: "Gmail", color: "#ef4444" },
  { icon: mdiGamepad, name: "Games", color: "#a855f7" },
  { icon: mdiImage, name: "Gallery", color: "#3b82f6" },
  { icon: mdiMusic, name: "Music", color: "#f97316" },
  { icon: mdiNewspaper, name: "News", color: "#64748b" },
  { icon: mdiNoteText, name: "Notes", color: "#eab308" },
  { icon: mdiPhone, name: "Phone", color: "#22c55e" },
  { icon: mdiGooglePlay, name: "Play Store", color: "#22c55e" },
  { icon: mdiPodcast, name: "Podcasts", color: "#a855f7" },
  { icon: mdiSecurity, name: "Security", color: "#06b6d4" },
  { icon: mdiCog, name: "Settings", color: "#94a3b8" },
  { icon: mdiMessage, name: "Messages", color: "#3b82f6" },
  { icon: mdiYoutube, name: "YouTube", color: "#ef4444" },
  { icon: mdiGoogleDrive, name: "Drive", color: "#eab308" },
  { icon: mdiLinkedin, name: "LinkedIn", color: "#0ea5e9" },
  { icon: mdiBankOutline, name: "Banking", color: "#22c55e" },
  { icon: mdiFood, name: "Food", color: "#f97316" },
  { icon: mdiAirplane, name: "Travel", color: "#06b6d4" },
  { icon: mdiCar, name: "Uber", color: "#94a3b8" },
  { icon: mdiBullseyeArrow, name: "Tasks", color: "#3b82f6" },
  { icon: mdiFileChart, name: "Sheets", color: "#22c55e" },
  { icon: mdiPalette, name: "Photos", color: "#a855f7" },
  { icon: mdiWrench, name: "Tools", color: "#64748b" },
  { icon: mdiLightbulbOnOutline, name: "Tips", color: "#eab308" },
];

export const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneEntrance = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  // Animated tilt — tilted right with gentle oscillation
  const tiltY = interpolate(
    frame,
    [0, 1.5 * fps, 3 * fps, 4.3 * fps],
    [12, 8, 14, 10],
    { extrapolateRight: "clamp" },
  );
  const tiltX = interpolate(
    frame,
    [0, 2 * fps, 4 * fps],
    [3, 5, 2],
    { extrapolateRight: "clamp" },
  );

  const scrollY = interpolate(
    frame,
    [
      0.5 * fps,
      1.2 * fps,
      1.5 * fps,
      2.2 * fps,
      2.5 * fps,
      3.0 * fps,
      3.3 * fps,
    ],
    [0, -280, -280, -560, -560, -280, -280],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );

  const textProgress = spring({
    frame: frame - 2.8 * fps,
    fps,
    config: { damping: 200 },
  });

  const phoneDim = interpolate(frame, [2.8 * fps, 3.2 * fps], [1, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
        padding: "0 100px 0 190px",
      }}
    >
      {/* Left side — Phone with animated 3D perspective */}
      <div
        style={{
          opacity: interpolate(phoneEntrance, [0, 1], [0, phoneDim]),
          transform: `scale(${interpolate(phoneEntrance, [0, 1], [0.85, 1])})`,
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
            backgroundColor: "#111111",
            transform: `rotateY(${tiltY}deg) rotateX(${tiltX}deg)`,
            transformStyle: "preserve-3d",
            boxShadow:
              "-30px 30px 80px rgba(0,0,0,0.5), 8px -8px 30px rgba(255,255,255,0.03)",
          }}
        >
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

          {/* App drawer header */}
          <div
            style={{
              padding: "56px 24px 12px",
              fontFamily: INTER,
              fontSize: 20,
              color: "rgba(255,255,255,0.5)",
              textAlign: "center",
              letterSpacing: 2,
            }}
          >
            ALL APPS
          </div>

          {/* Scrollable app grid */}
          <div
            style={{
              position: "absolute",
              top: 82,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                transform: `translateY(${scrollY}px)`,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
                padding: "12px 22px",
              }}
            >
              {APP_LIST.map((app, i) => (
                <div
                  key={`${app.name}-${i}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "12px 0",
                  }}
                >
                  <div
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 18,
                      backgroundColor: `${app.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MdiIcon path={app.icon} size={40} color={app.color} />
                  </div>
                  <div
                    style={{
                      fontFamily: INTER,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.7)",
                      textAlign: "center",
                      width: 80,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {app.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            style={{
              position: "absolute",
              right: 4,
              top: 90,
              bottom: 16,
              width: 4,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          >
            <div
              style={{
                width: 4,
                height: 60,
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.3)",
                transform: `translateY(${interpolate(-scrollY, [0, 560], [0, 120], { extrapolateRight: "clamp" })}px)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Right side — Statement */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minWidth: 400,
        }}
      >
        <div
          style={{
            opacity: interpolate(textProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(textProgress, [0, 1], [40, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily: INTER,
              fontSize: 64,
              fontWeight: 800,
              color: COLORS.white,
              lineHeight: 1.15,
            }}
          >
            Too many apps.
          </div>
          <div
            style={{
              fontFamily: INTER,
              fontSize: 64,
              fontWeight: 800,
              color: COLORS.muted,
              lineHeight: 1.15,
              marginTop: 12,
            }}
          >
            Too little time.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

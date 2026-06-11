import {
  AbsoluteFill,
  // Sequence, // re-added in Task 4
  // interpolate, // re-added in Task 4
  // spring, // re-added in Task 4
  useCurrentFrame,
  // useVideoConfig, // re-added in Task 4
  // staticFile, // re-added in Task 7 (audio)
} from "remotion";
// import { Audio } from "@remotion/media"; // re-added in Task 7 (audio)
// import { mdiDocker } from "@mdi/js"; // re-added in Task 4
// import { mdiCheckCircle } from "@mdi/js"; // re-added in Task 5
// import { mdiCalendar, mdiMapMarker, mdiWhatsapp, mdiArrowRight } from "@mdi/js"; // re-added in Task 6
// import { INTER, MONO } from "../fonts"; // re-added in Task 4
// import { MdiIcon } from "./MdiIcon"; // re-added in Task 4
// import { TypingText } from "./TypingText"; // re-added in Task 4

export const DOCKERCTA_TOTAL_FRAMES = 900;

// ---- Docker-brand theme tokens (local to this episode) ----
const DOCKER = {
  blue: "#2496ED",
  blueDeep: "#1D63ED",
  navy: "#0a1a3f",
  navyDeep: "#061129",
  white: "#FFFFFF",
  ice: "#CDE8FF", // light-blue accent / captions
  cardFill: "#1E63C9",
  cardEdge: "#54A6FF",
  green: "#22c55e",
  textDim: "#9DC2F0",
} as const;

// ---- Beat timing (frames @ 30fps) — see plan timing contract ----
// const HOOK_FROM = 0; // re-added in Task 4
// const HOOK_DUR = 135; // re-added in Task 4
// const BRAND_FROM = 135; // re-added in Task 5
// const BRAND_DUR = 120; // re-added in Task 5
// const CURR_FROM = 255; // re-added in Task 5
// const CURR_DUR = 405; // re-added in Task 5
// const CTA_FROM = 660; // re-added in Task 6
// const CTA_DUR = 240; // re-added in Task 6

// const HEADER_FROM = 255; // re-added in Task 5
// const CARDS: { label: string; from: number }[] = [ // re-added in Task 5
//   { label: "Docker Basics", from: 309 },
//   { label: "Images & Containers", from: 375 },
//   { label: "Docker Compose", from: 441 },
//   { label: "Troubleshoot & Secure", from: 507 },
//   { label: "Backup & Restore", from: 573 },
// ];

// const DATE_FROM = 660; // re-added in Task 6
// const VENUE_FROM = 735; // re-added in Task 6
// const CTA_REVEAL_FROM = 795; // re-added in Task 6

// Shared typing cadence
// const CHAR_FRAMES = 2; // re-added in Task 4
// const CURSOR_BLINK = 16; // re-added in Task 4

// ---- Animated Docker-blue gradient background ----
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * 0.02) * 6;
  const glow = Math.sin(frame * 0.04) * 0.05 + 0.18;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${155 + drift}deg, ${DOCKER.blue} 0%, ${DOCKER.blueDeep} 42%, ${DOCKER.navy} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 38%, rgba(205,232,255,${glow}) 0%, transparent 55%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const DockerCtaVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: DOCKER.navyDeep }}>
      <Background />
      {/* Beats added in later tasks */}
    </AbsoluteFill>
  );
};

import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  mdiDocker,
  mdiCheckCircle,
  mdiCalendar,
  mdiMapMarker,
  mdiWhatsapp,
  mdiArrowRight,
} from "@mdi/js";
import { INTER, MONO } from "../fonts";
import { MdiIcon } from "./MdiIcon";
import { TypingText } from "./TypingText";

export const DOCKERCTA_TOTAL_FRAMES = 900;

// ---- Docker-brand theme tokens ----
const DOCKER = {
  blue: "#2496ED",
  blueDeep: "#1D63ED",
  navy: "#0a1a3f",
  navyDeep: "#061129",
  white: "#FFFFFF",
  ice: "#CDE8FF",
  cardFill: "#1E63C9",
  cardEdge: "#54A6FF",
  green: "#22c55e",
  textDim: "#9DC2F0",
} as const;

// ---- Beat timing (frames @ 30fps) ----
const HOOK_FROM = 0;
const HOOK_DUR = 135;
const BRAND_FROM = 135;
const BRAND_DUR = 120;
const CURR_FROM = 255;
const CURR_DUR = 405;
const CTA_FROM = 660;
const CTA_DUR = 240;

const HEADER_FROM = 255;
const CARDS: { label: string; from: number }[] = [
  { label: "Docker Basics", from: 309 },
  { label: "Images & Containers", from: 375 },
  { label: "Docker Compose", from: 441 },
  { label: "Troubleshoot & Secure", from: 507 },
  { label: "Backup & Restore", from: 573 },
];

const DATE_FROM = 660;
const VENUE_FROM = 735;
const CTA_REVEAL_FROM = 795;

const CHAR_FRAMES = 2;
const CURSOR_BLINK = 16;

// ---- Audio ----
const MUSIC = "content/docker-cta/bg-music.mp3";
const CLICK_SFX = "content/devops1-bootcamp/sfx/click.mp3";
const DING_SFX = "content/devops1-bootcamp/sfx/ding.mp3";
const WHOOSH_SFX = "content/docker-cta/sfx/whoosh.mp3";
const SWELL_SFX = "content/docker-cta/sfx/swell.mp3";

const MUSIC_BASE = 0.36; // bed level in gaps
const MUSIC_DUCK = 0.14; // bed level under VO
const DUCK_RAMP = 8;

// VO clips 01–09 on the absolute timeline (durationInFrames = measured).
const VOICEOVER: { file: string; from: number; durationInFrames: number }[] = [
  { file: "voiceover/docker-cta/01.mp3", from: 8, durationInFrames: 78 },
  { file: "voiceover/docker-cta/02.mp3", from: 150, durationInFrames: 58 },
  { file: "voiceover/docker-cta/03.mp3", from: 258, durationInFrames: 32 },
  { file: "voiceover/docker-cta/04.mp3", from: 312, durationInFrames: 40 },
  { file: "voiceover/docker-cta/05.mp3", from: 378, durationInFrames: 59 },
  { file: "voiceover/docker-cta/06.mp3", from: 444, durationInFrames: 38 },
  { file: "voiceover/docker-cta/07.mp3", from: 510, durationInFrames: 52 },
  { file: "voiceover/docker-cta/08.mp3", from: 576, durationInFrames: 56 },
  { file: "voiceover/docker-cta/09.mp3", from: 660, durationInFrames: 74 },
];

// Music bed: fade in, hold at base, fade out; ducked under each VO window.
const musicVolume = (f: number): number => {
  const envelope = interpolate(
    f,
    [0, 20, DOCKERCTA_TOTAL_FRAMES - 30, DOCKERCTA_TOTAL_FRAMES],
    [0, MUSIC_BASE, MUSIC_BASE, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  let duck = 1;
  for (const vo of VOICEOVER) {
    const d = interpolate(
      f,
      [
        vo.from - DUCK_RAMP,
        vo.from,
        vo.from + vo.durationInFrames,
        vo.from + vo.durationInFrames + DUCK_RAMP,
      ],
      [1, MUSIC_DUCK / MUSIC_BASE, MUSIC_DUCK / MUSIC_BASE, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    duck = Math.min(duck, d);
  }
  return envelope * duck;
};

// ---- Animated gradient background ----
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

// ---- Beat 1: typewriter hook ----
const HookBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [HOOK_DUR - 16, HOOK_DUR], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: out,
        padding: 80,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 96,
          lineHeight: 1.18,
          letterSpacing: -1,
          color: DOCKER.white,
          textAlign: "center",
          textShadow: "0 6px 30px rgba(0,0,0,0.45)",
        }}
      >
        <TypingText
          text={"Master Docker in 3 days"}
          charFrames={CHAR_FRAMES}
          cursorBlinkFrames={CURSOR_BLINK}
          cursorColor={DOCKER.ice}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---- Docker logo mark ----
const DockerMark: React.FC<{ enter: number }> = ({ enter }) => {
  return (
    <div
      style={{
        position: "relative",
        transform: `scale(${enter})`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${DOCKER.ice} 0%, transparent 65%)`,
          opacity: 0.35,
        }}
      />
      <MdiIcon path={mdiDocker} size={300} color={DOCKER.white} />
    </div>
  );
};

// ---- Beat 2: brand reveal ----
const BrandBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 13, stiffness: 200 } });
  const wordmark = spring({
    frame: frame - 10,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const caption = spring({
    frame: frame - 22,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const out = interpolate(frame, [BRAND_DUR - 16, BRAND_DUR], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 24,
        opacity: out,
      }}
    >
      <DockerMark enter={enter} />
      <div
        style={{
          opacity: wordmark,
          transform: `translateY(${interpolate(wordmark, [0, 1], [24, 0])}px)`,
          fontFamily: INTER,
          fontWeight: 800,
          fontSize: 120,
          letterSpacing: 2,
          color: DOCKER.white,
        }}
      >
        DOCKER
      </div>
      <div
        style={{
          opacity: caption,
          transform: `translateY(${interpolate(caption, [0, 1], [16, 0])}px)`,
          fontFamily: INTER,
          fontWeight: 600,
          fontSize: 46,
          color: DOCKER.ice,
        }}
      >
        for beginners
      </div>
    </AbsoluteFill>
  );
};

// ---- A single corrugated container card ----
const ContainerCard: React.FC<{ label: string; localFrame: number }> = ({
  label,
  localFrame,
}) => {
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 16, stiffness: 180 },
  });
  const x = interpolate(enter, [0, 1], [520, 0]);
  return (
    <div
      style={{
        opacity: enter,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        gap: 28,
        width: 860,
        padding: "30px 38px",
        borderRadius: 22,
        backgroundImage: `repeating-linear-gradient(90deg, ${DOCKER.cardFill} 0px, ${DOCKER.cardFill} 26px, #1A57B0 26px, #1A57B0 30px)`,
        border: `2px solid ${DOCKER.cardEdge}`,
        boxShadow: "0 18px 46px rgba(0,0,0,0.4)",
      }}
    >
      <MdiIcon path={mdiCheckCircle} size={56} color={DOCKER.green} />
      <span
        style={{
          fontFamily: INTER,
          fontWeight: 700,
          fontSize: 50,
          color: DOCKER.white,
          textShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ---- Beat 3: header + stacking cards ----
const CurriculumBeat: React.FC = () => {
  const frame = useCurrentFrame(); // relative to CURR_FROM
  const { fps } = useVideoConfig();
  const headerProg = spring({
    frame: frame - (HEADER_FROM - CURR_FROM),
    fps,
    config: { damping: 18, stiffness: 200 },
  });
  const out = interpolate(frame, [CURR_DUR - 16, CURR_DUR], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 22,
        opacity: out,
        paddingTop: 60,
      }}
    >
      <div
        style={{
          opacity: headerProg,
          transform: `translateY(${interpolate(headerProg, [0, 1], [20, 0])}px)`,
          fontFamily: INTER,
          fontWeight: 800,
          fontSize: 64,
          color: DOCKER.white,
          marginBottom: 18,
        }}
      >
        You will learn:
      </div>
      {CARDS.map((c) => (
        <ContainerCard
          key={c.label}
          label={c.label}
          localFrame={frame - (c.from - CURR_FROM)}
        />
      ))}
    </AbsoluteFill>
  );
};

// ---- Beat 4: CTA close ----
const Line: React.FC<{
  localFrom: number;
  icon: string;
  children: React.ReactNode;
}> = ({ localFrom, icon, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - localFrom,
    fps,
    config: { damping: 18, stiffness: 200 },
  });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily: INTER,
        fontWeight: 700,
        fontSize: 52,
        color: DOCKER.white,
      }}
    >
      <MdiIcon path={icon} size={48} color={DOCKER.ice} />
      <span>{children}</span>
    </div>
  );
};

const CtaBeat: React.FC = () => {
  const frame = useCurrentFrame(); // relative to CTA_FROM
  const { fps } = useVideoConfig();
  const cta = spring({
    frame: frame - (CTA_REVEAL_FROM - CTA_FROM),
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  const pulse = 1 + Math.sin(frame * 0.18) * 0.02;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 30,
        padding: 70,
      }}
    >
      <Line localFrom={DATE_FROM - CTA_FROM} icon={mdiCalendar}>
        27–29 July 2026
      </Line>
      <Line localFrom={VENUE_FROM - CTA_FROM} icon={mdiMapMarker}>
        Taman Melawati, KL
      </Line>

      <div
        style={{
          opacity: cta,
          transform: `scale(${interpolate(cta, [0, 1], [0.8, 1]) * pulse})`,
          marginTop: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "26px 54px",
            borderRadius: 999,
            background: DOCKER.white,
            boxShadow: "0 16px 50px rgba(0,0,0,0.45)",
          }}
        >
          <span
            style={{
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: 58,
              color: DOCKER.blueDeep,
              letterSpacing: 0.5,
            }}
          >
            DAFTAR SEKARANG
          </span>
          <MdiIcon path={mdiArrowRight} size={56} color={DOCKER.blueDeep} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 46,
            color: DOCKER.white,
          }}
        >
          <MdiIcon path={mdiWhatsapp} size={48} color={DOCKER.green} />
          <span>6013 446 4601</span>
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 500,
            fontSize: 32,
            color: DOCKER.textDim,
            marginTop: 6,
          }}
        >
          Taming Tech · HRDcorp Claimable
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CLICK_EVERY = 2;
const TypingClicks: React.FC<{ charCount: number }> = ({ charCount }) => {
  const clicks = [];
  for (let i = 0; i < charCount; i += CLICK_EVERY) {
    clicks.push(
      <Sequence
        key={i}
        from={i * CHAR_FRAMES}
        durationInFrames={CLICK_EVERY * CHAR_FRAMES}
      >
        <Audio src={staticFile(CLICK_SFX)} volume={0.5} />
      </Sequence>,
    );
  }
  return <>{clicks}</>;
};

export const DockerCtaVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: DOCKER.navyDeep }}>
      <Audio src={staticFile(MUSIC)} volume={musicVolume} />
      <Background />
      <Sequence from={HOOK_FROM} durationInFrames={HOOK_DUR}>
        <HookBeat />
      </Sequence>
      <Sequence from={BRAND_FROM} durationInFrames={BRAND_DUR}>
        <BrandBeat />
      </Sequence>
      <Sequence from={CURR_FROM} durationInFrames={CURR_DUR}>
        <CurriculumBeat />
      </Sequence>
      <Sequence from={CTA_FROM} durationInFrames={CTA_DUR}>
        <CtaBeat />
      </Sequence>

      {/* Voiceover (clips 01–09; venue + CTA close are silent by design) */}
      {VOICEOVER.map((vo) => (
        <Sequence key={vo.file} from={vo.from}>
          <Audio src={staticFile(vo.file)} volume={1.1} />
        </Sequence>
      ))}

      {/* SFX accents */}
      <Sequence from={HOOK_FROM}>
        <TypingClicks charCount={"Master Docker in 3 days".length} />
      </Sequence>
      <Sequence from={HOOK_FROM + 23 * CHAR_FRAMES}>
        <Audio src={staticFile(DING_SFX)} volume={0.8} />
      </Sequence>
      <Sequence from={BRAND_FROM}>
        <Audio src={staticFile(WHOOSH_SFX)} volume={0.7} />
      </Sequence>
      {CARDS.map((c) => (
        <Sequence key={`sfx-${c.label}`} from={c.from} durationInFrames={8}>
          <Audio src={staticFile(CLICK_SFX)} volume={0.7} />
        </Sequence>
      ))}
      <Sequence from={CTA_REVEAL_FROM}>
        <Audio src={staticFile(SWELL_SFX)} volume={0.8} />
      </Sequence>
      <Sequence from={CTA_REVEAL_FROM + 6}>
        <Audio src={staticFile(DING_SFX)} volume={0.9} />
      </Sequence>
    </AbsoluteFill>
  );
};

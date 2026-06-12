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
  mdiPackageVariant,
  mdiLaptop,
  mdiServer,
  mdiCloud,
  mdiArrowDown,
} from "@mdi/js";
import { INTER, MONO } from "../fonts";
import { MdiIcon } from "./MdiIcon";
import { TypingText } from "./TypingText";

export const DOCKERCTA_TOTAL_FRAMES = 1200;

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

// Explainer beat ("what is Docker"); everything below shifts +300 vs the 30s cut.
const EXPLAIN_FROM = 255;
const EXPLAIN_DUR = 300;

const CURR_FROM = 555;
const CURR_DUR = 405;
const CTA_FROM = 960;
const CTA_DUR = 240;

const HEADER_FROM = 555;
const CARDS: { label: string; from: number }[] = [
  { label: "Docker Basics", from: 609 },
  { label: "Images & Containers", from: 675 },
  { label: "Docker Compose", from: 741 },
  { label: "Troubleshoot & Secure", from: 807 },
  { label: "Backup & Restore", from: 873 },
];

const DATE_FROM = 960;
const VENUE_FROM = 1035;
const CTA_REVEAL_FROM = 1095;

const CHAR_FRAMES = 2;
const CURSOR_BLINK = 16;
const CORRUGATED_BG = `repeating-linear-gradient(90deg, ${DOCKER.cardFill} 0px, ${DOCKER.cardFill} 26px, #1A57B0 26px, #1A57B0 30px)`;
const EXPLAIN_TITLE = "WHAT IS DOCKER?";
const EXPLAIN_APP_LABEL = "your app + all its deps";
const EXPLAIN_TAGLINE = "runs the SAME everywhere";

// ---- Audio ----
const MUSIC_ENABLED = false; // music bed disabled for now; flip to true to restore
const MUSIC = "content/docker-cta/bg-music.mp3";
const CLICK_SFX = "content/devops1-bootcamp/sfx/click.mp3";
const DING_SFX = "content/devops1-bootcamp/sfx/ding.mp3";
const WHOOSH_SFX = "content/docker-cta/sfx/whoosh.mp3";
const SWELL_SFX = "content/docker-cta/sfx/swell.mp3";
const BLIP_RISE_SFX = "content/docker-cta/sfx/blip-rise.mp3";
const BLIP_LOW_SFX = "content/docker-cta/sfx/blip-low.mp3";
const BLIP_STEPS_SFX = "content/docker-cta/sfx/blip-steps.mp3";
const CONFIRM_SFX = "content/docker-cta/sfx/confirm.mp3";

const MUSIC_BASE = 0.36; // bed level in gaps
const MUSIC_DUCK = 0.14; // bed level under VO
const DUCK_RAMP = 8;

// VO clips 01–09 on the absolute timeline (durationInFrames = measured).
const VOICEOVER: { file: string; from: number; durationInFrames: number }[] = [
  { file: "voiceover/docker-cta/01.mp3", from: 8, durationInFrames: 78 },
  { file: "voiceover/docker-cta/02.mp3", from: 150, durationInFrames: 58 },
  { file: "voiceover/docker-cta/03.mp3", from: 558, durationInFrames: 32 },
  { file: "voiceover/docker-cta/04.mp3", from: 612, durationInFrames: 40 },
  { file: "voiceover/docker-cta/05.mp3", from: 678, durationInFrames: 59 },
  { file: "voiceover/docker-cta/06.mp3", from: 744, durationInFrames: 38 },
  { file: "voiceover/docker-cta/07.mp3", from: 810, durationInFrames: 52 },
  { file: "voiceover/docker-cta/08.mp3", from: 876, durationInFrames: 56 },
  { file: "voiceover/docker-cta/09.mp3", from: 960, durationInFrames: 74 },
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
const DockerMark: React.FC<{ enter: number; size?: number }> = ({
  enter,
  size = 300,
}) => {
  return (
    <div
      style={{
        position: "relative",
        opacity: enter,
        transform: `scale(${enter})`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: size * 1.2,
          height: size * 1.2,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${DOCKER.ice} 0%, transparent 65%)`,
          opacity: 0.35,
        }}
      />
      <MdiIcon path={mdiDocker} size={size} color={DOCKER.white} />
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

// ---- Explainer: down-arrow connector ----
const DownArrow: React.FC<{ localFrom: number }> = ({ localFrom }) => {
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
        transform: `translateY(${interpolate(p, [0, 1], [-12, 0])}px)`,
      }}
    >
      <MdiIcon path={mdiArrowDown} size={56} color={DOCKER.ice} />
    </div>
  );
};

// ---- Explainer: a destination chip (laptop / server / cloud) ----
const DestChip: React.FC<{
  localFrom: number;
  icon: string;
  label: string;
}> = ({ localFrom, icon, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - localFrom,
    fps,
    config: { damping: 14, stiffness: 200 },
  });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px) scale(${interpolate(
          p,
          [0, 1],
          [0.8, 1],
        )})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "24px 26px",
        borderRadius: 20,
        background: DOCKER.cardFill,
        border: `2px solid ${DOCKER.cardEdge}`,
        boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
        minWidth: 188,
      }}
    >
      <MdiIcon path={icon} size={84} color={DOCKER.ice} />
      <span
        style={{
          fontFamily: INTER,
          fontWeight: 700,
          fontSize: 38,
          color: DOCKER.white,
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ---- Explainer beat: "build once, run anywhere" ----
const ExplainerBeat: React.FC = () => {
  const frame = useCurrentFrame(); // relative to EXPLAIN_FROM
  const { fps } = useVideoConfig();

  const card = spring({
    frame: frame - 30,
    fps,
    config: { damping: 16, stiffness: 180 },
  });
  const cardX = interpolate(card, [0, 1], [520, 0]);
  const whale = spring({
    frame: frame - 90,
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  const out = interpolate(frame, [EXPLAIN_DUR - 16, EXPLAIN_DUR], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 18,
        opacity: out,
        padding: 70,
      }}
    >
      {/* title — types in from local frame 0 */}
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 62,
          letterSpacing: -1,
          color: DOCKER.white,
          textAlign: "center",
          marginBottom: 10,
          textShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}
      >
        <TypingText
          text={EXPLAIN_TITLE}
          charFrames={CHAR_FRAMES}
          cursorBlinkFrames={CURSOR_BLINK}
          cursorColor={DOCKER.ice}
        />
      </div>

      {/* app package card */}
      <div
        style={{
          opacity: card,
          transform: `translateX(${cardX}px)`,
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "26px 34px",
          borderRadius: 22,
          backgroundImage: CORRUGATED_BG,
          border: `2px solid ${DOCKER.cardEdge}`,
          boxShadow: "0 18px 46px rgba(0,0,0,0.4)",
        }}
      >
        <MdiIcon path={mdiPackageVariant} size={64} color={DOCKER.ice} />
        <span
          style={{
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 44,
            color: DOCKER.white,
          }}
        >
          {EXPLAIN_APP_LABEL}
        </span>
      </div>

      <DownArrow localFrom={82} />

      {/* docker whale */}
      <DockerMark enter={whale} size={190} />

      <DownArrow localFrom={147} />

      {/* destinations */}
      <div style={{ display: "flex", gap: 26 }}>
        <DestChip localFrom={155} icon={mdiLaptop} label="laptop" />
        <DestChip localFrom={175} icon={mdiServer} label="server" />
        <DestChip localFrom={195} icon={mdiCloud} label="cloud" />
      </div>

      {/* tagline slot — fixed height, always present, so the centered column does
          not reflow/jump when the tagline mounts at local frame 240 */}
      <div
        style={{
          minHeight: 72,
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Sequence from={224} layout="none">
          <div
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 44,
              color: DOCKER.ice,
              textAlign: "center",
            }}
          >
            <TypingText
              text={EXPLAIN_TAGLINE}
              charFrames={CHAR_FRAMES}
              cursorBlinkFrames={CURSOR_BLINK}
              cursorColor={DOCKER.white}
            />
          </div>
        </Sequence>
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
        backgroundImage: CORRUGATED_BG,
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
      {MUSIC_ENABLED && <Audio src={staticFile(MUSIC)} volume={musicVolume} />}
      <Background />
      <Sequence from={HOOK_FROM} durationInFrames={HOOK_DUR}>
        <HookBeat />
      </Sequence>
      <Sequence from={BRAND_FROM} durationInFrames={BRAND_DUR}>
        <BrandBeat />
      </Sequence>
      <Sequence from={EXPLAIN_FROM} durationInFrames={EXPLAIN_DUR}>
        <ExplainerBeat />
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

      {/* Explainer beat SFX — digital blip palette + typewriter clicks (no music bed) */}
      <Sequence from={EXPLAIN_FROM}>
        <TypingClicks charCount={EXPLAIN_TITLE.length} />
      </Sequence>
      <Sequence from={EXPLAIN_FROM + 30}>
        <Audio src={staticFile(BLIP_RISE_SFX)} volume={0.55} />
      </Sequence>
      <Sequence from={EXPLAIN_FROM + 90}>
        <Audio src={staticFile(BLIP_LOW_SFX)} volume={0.6} />
      </Sequence>
      {/* blip-steps.mp3 bakes a 0/667/1333ms stagger — keep in sync with the
          DestChip localFrom values 155/175/195 (20-frame stagger @30fps). */}
      <Sequence from={EXPLAIN_FROM + 155}>
        <Audio src={staticFile(BLIP_STEPS_SFX)} volume={0.5} />
      </Sequence>
      <Sequence from={EXPLAIN_FROM + 224}>
        <TypingClicks charCount={EXPLAIN_TAGLINE.length} />
      </Sequence>
      <Sequence from={EXPLAIN_FROM + 272}>
        <Audio src={staticFile(CONFIRM_SFX)} volume={0.6} />
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

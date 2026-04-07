import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadInterFont } from "@remotion/google-fonts/Inter";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const { fontFamily: monoFont } = loadJetBrainsMono();
const { fontFamily: sansFont } = loadInterFont();

// ─── theme ───────────────────────────────────────────────────
const BG      = "#0d1117";
const SURFACE = "#161b22";
const BORDER  = "#30363d";

// ─── layout (px, canvas = 1080 × 1920) ──────────────────────
const IMG_TOP    = 150;
const IMG_ZONE_H = 1200; // 150 → 1350
const CAPTION_TOP = 1370;
const CAPTION_H   = 470; // 1370 → 1840
const H_PAD = 40;

// ─── scenes ──────────────────────────────────────────────────
const SCENES = [
  {
    id: "json-config",
    step: "01",
    category: "CONFIGURE",
    accent: "#00d4aa",
    sub: "Auto-check for updates.\nGrouped by service, on a schedule.",
    imageFile: "json-config.png",
    brandIcon: "renovate-icon.png",
    isLandscape: false,
    imageAspect: 1201 / 788,
  },
  {
    id: "renovate-pr",
    step: "02",
    category: "DETECT",
    accent: "#7c3aed",
    sub: "Auto-create pull request.\nGrouped updates, one review.",
    imageFile: "renovate-pr.png",
    brandIcon: "github-icon.png",
    isLandscape: false,
    imageAspect: 1105 / 920,
  },
  {
    id: "cicd-pipeline",
    step: "03",
    category: "DEPLOY",
    accent: "#f59e0b",
    sub: "Auto-deploy manifests.\nOnly changed services get updated.",
    imageFile: "cicd-pipeline.png",
    brandIcon: "github-actions-icon.png",
    isLandscape: false,
    imageAspect: 876 / 722,
  },
  {
    id: "k9s-cluster",
    step: "04",
    category: "VERIFY",
    accent: "#22c55e",
    sub: "Auto-run latest pods.\nKubernetes always in sync.",
    imageFile: "k9s-cluster.png",
    brandIcon: "kubernetes-icon.png",
    isLandscape: true,
    imageAspect: 420 / 1672,
  },
] as const;

const FPS = 30;
const TITLE_DURATION = 3 * FPS;
const SCENE_DURATION = 6 * FPS;
const OUTRO_DURATION = 6 * FPS;
const CTA_DURATION   = 4 * FPS;
export const HOMELAB_TOTAL_FRAMES =
  TITLE_DURATION + SCENES.length * SCENE_DURATION + OUTRO_DURATION + CTA_DURATION;

// ─── helpers ─────────────────────────────────────────────────
function fadeInOut(frame: number, total: number, fade = 12) {
  return interpolate(frame, [0, fade, total - fade, total], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
}

// ─── TypewriterText ──────────────────────────────────────────
const TypewriterText: React.FC<{
  text: string;
  startFrame: number;
  charsPerFrame: number;
}> = ({ text, startFrame, charsPerFrame }) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const n = Math.min(text.length, Math.floor(elapsed * charsPerFrame));
  const done = n >= text.length;
  const cursor = !done || Math.floor(frame / 8) % 2 === 0;
  return (
    <span>
      {text.slice(0, n)}
      {cursor && <span style={{ opacity: 0.65, marginLeft: 2 }}>▌</span>}
    </span>
  );
};

// ─── GridLines ───────────────────────────────────────────────
const GridLines: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {[400, 800, 1200, 1600].map((y) => (
      <div key={y} style={{ position: "absolute", top: y, left: 0, right: 0,
        height: 1, backgroundColor: BORDER, opacity: 0.25 }} />
    ))}
    {[270, 540, 810].map((x) => (
      <div key={x} style={{ position: "absolute", left: x, top: 0, bottom: 0,
        width: 1, backgroundColor: BORDER, opacity: 0.25 }} />
    ))}
  </AbsoluteFill>
);

// ─── ArrIcons (scene 04 only) ────────────────────────────────
const ARR_ICON_SIZE = 143;

const ARR_ICONS = [
  { file: "radarr.png",   label: "Radarr",   color: "#f5c518", top: 165,  left: 55,  rotate: -8, delay: 4  },
  { file: "sonarr.png",   label: "Sonarr",   color: "#35c5f4", top: 165,  left: 840, rotate:  6, delay: 8  },
  { file: "prowlarr.png", label: "Prowlarr", color: "#f97316", top: 1020, left: 60,  rotate: -5, delay: 12 },
  { file: "seerr.png",    label: "Seerr",    color: "#e5a00d", top: 1020, left: 820, rotate:  7, delay: 16 },
] as const;

const ArrIcons: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const floatY = (off: number) =>
    interpolate(Math.sin(((frame + off) / fps) * Math.PI), [-1, 1], [-6, 6]);

  return (
    <>
      {ARR_ICONS.map((icon) => {
        const enter = spring({
          frame: frame - icon.delay, fps,
          config: { damping: 18, stiffness: 120 }, durationInFrames: 20,
        });
        return (
          <div key={icon.file} style={{
            position: "absolute",
            top: icon.top + floatY(icon.delay * 5),
            left: icon.left,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            opacity: interpolate(enter, [0, 1], [0, 0.85]),
            transform: `rotate(${icon.rotate}deg) scale(${interpolate(enter, [0, 1], [0.6, 1])})`,
          }}>
            <div style={{
              width: ARR_ICON_SIZE + 20, height: ARR_ICON_SIZE + 20,
              borderRadius: "50%", backgroundColor: `${icon.color}15`,
              position: "absolute", top: -10, left: -10, filter: "blur(10px)",
            }} />
            <Img src={staticFile(`content/homelab-automation/images/${icon.file}`)}
              style={{ width: ARR_ICON_SIZE, height: ARR_ICON_SIZE, objectFit: "contain" }} />
            <div style={{
              fontFamily: monoFont, fontSize: 20, color: icon.color,
              letterSpacing: 2, textTransform: "uppercase",
              textShadow: `0 0 12px ${icon.color}80`,
            }}>{icon.label}</div>
          </div>
        );
      })}
    </>
  );
};

// ─── TitleLine: single animated line for the intro title ─────
const TitleLine: React.FC<{
  children: React.ReactNode;
  delay: number;
}> = ({ children, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 22,
  });

  return (
    <div style={{
      overflow: "hidden",
      // clip-reveal: lines slide up from below
    }}>
      <div style={{
        transform: `translateY(${interpolate(enter, [0, 1], [80, 0])}px)`,
        opacity: interpolate(enter, [0, 1], [0, 1]),
      }}>
        {children}
      </div>
    </div>
  );
};

// ─── TitleCard ───────────────────────────────────────────────
const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = fadeInOut(frame, TITLE_DURATION);

  const tagEnter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 18 });

  return (
    <AbsoluteFill style={{
      backgroundColor: BG, opacity,
      justifyContent: "center", alignItems: "center",
      flexDirection: "column", gap: 28, padding: 80,
    }}>
      <GridLines />

      {/* "DevOps series" tag — types in */}
      <div style={{
        fontFamily: monoFont, fontSize: 24, color: "#00d4aa",
        letterSpacing: 6, textTransform: "uppercase",
        opacity: interpolate(tagEnter, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(tagEnter, [0, 1], [16, 0])}px)`,
      }}>
        <TypewriterText text="DevOps series" startFrame={0} charsPerFrame={0.7} />
      </div>

      {/* title: each line slides up staggered */}
      <div style={{
        fontFamily: sansFont, fontSize: 74, fontWeight: 800,
        textAlign: "center", lineHeight: 1.2,
        display: "flex", flexDirection: "column", gap: 0,
      }}>
        <TitleLine delay={10}>
          <span style={{ color: "#8b949e" }}>How I automate</span>
        </TitleLine>
        <TitleLine delay={18}>
          <span style={{ color: "#ffffff" }}>my{" "}
            <span style={{ color: "#00d4aa" }}>homelab</span>
          </span>
        </TitleLine>
        <TitleLine delay={26}>
          <span style={{ color: "#ffffff" }}>infrastructure</span>
        </TitleLine>
      </div>
    </AbsoluteFill>
  );
};

// ─── ScreenshotScene ─────────────────────────────────────────
const ScreenshotScene: React.FC<{
  scene: (typeof SCENES)[number];
  sceneDuration: number;
}> = ({ scene, sceneDuration }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const opacity     = fadeInOut(frame, sceneDuration, 10);
  const headerEnter = spring({ frame,       fps, config: { damping: 200 }, durationInFrames: 15 });
  const imgEnter    = spring({ frame: frame - 4,  fps, config: { damping: 200 }, durationInFrames: 25 });
  const captionEnter = spring({ frame: frame - 10, fps, config: { damping: 200 }, durationInFrames: 22 });

  const kenBurns = interpolate(frame, [0, sceneDuration], [1, 1.04], {
    easing: Easing.inOut(Easing.quad), extrapolateRight: "clamp",
  });

  // ── fit screenshot ──
  const availW = width - H_PAD * 2;
  const availH = IMG_ZONE_H - 20;
  let imgW: number, imgH: number;
  if (scene.isLandscape) {
    imgW = availW;
    imgH = imgW * scene.imageAspect;
    if (imgH > availH) { imgH = availH; imgW = imgH / scene.imageAspect; }
  } else {
    imgH = availH;
    imgW = imgH / scene.imageAspect;
    if (imgW > availW) { imgW = availW; imgH = imgW * scene.imageAspect; }
  }
  const imgLeft = (width - imgW) / 2;
  const imgTop  = IMG_TOP + (IMG_ZONE_H - imgH) / 2;

  // brand icon size + position (bottom-right corner of screenshot)
  const BADGE_SIZE = 72;
  const BADGE_PAD  = 14;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity }}>
      {/* accent radial glow */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 50% 0%, ${scene.accent}12 0%, transparent 55%)`,
        pointerEvents: "none",
      }} />

      {/* ── compact header ── */}
      <div style={{
        position: "absolute", top: 52, left: H_PAD, right: H_PAD,
        display: "flex", alignItems: "center", gap: 18,
        opacity: interpolate(headerEnter, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(headerEnter, [0, 1], [-14, 0])}px)`,
      }}>
        {/* step pill */}
        <div style={{
          fontFamily: monoFont, fontSize: 24, fontWeight: 700,
          color: scene.accent,
          backgroundColor: `${scene.accent}18`,
          border: `1.5px solid ${scene.accent}55`,
          borderRadius: 8, padding: "4px 16px", letterSpacing: 2, flexShrink: 0,
        }}>
          {scene.step}
        </div>
        {/* category — accent colored, instant */}
        <div style={{
          fontFamily: monoFont, fontSize: 26, letterSpacing: 6,
          color: scene.accent, textTransform: "uppercase", flexShrink: 0,
        }}>
          {scene.category}
        </div>
        <div style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
        {/* progress dots */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {SCENES.map((s) => (
            <div key={s.id} style={{
              width: s.id === scene.id ? 22 : 8, height: 8, borderRadius: 4,
              backgroundColor: s.id === scene.id ? scene.accent : BORDER,
            }} />
          ))}
        </div>
      </div>

      {/* ── arr icons behind screenshot (k9s scene) ── */}
      {scene.isLandscape && <ArrIcons />}

      {/* ── screenshot ── */}
      <div style={{
        position: "absolute",
        top: imgTop, left: imgLeft, width: imgW, height: imgH,
        borderRadius: 14, overflow: "hidden",
        border: `1px solid ${BORDER}`,
        boxShadow: `0 0 48px ${scene.accent}28, 0 20px 60px rgba(0,0,0,0.6)`,
        transform: `scale(${interpolate(imgEnter, [0, 1], [0.94, 1])}) scale(${kenBurns})`,
        opacity: interpolate(imgEnter, [0, 1], [0, 1]),
      }}>
        <Img
          src={staticFile(`content/homelab-automation/images/${scene.imageFile}`)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {/* vignette */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 65%, rgba(13,17,23,0.35) 100%)",
          pointerEvents: "none",
        }} />

        {/* ── brand icon badge: bottom-right corner of screenshot ── */}
        <div style={{
          position: "absolute",
          bottom: BADGE_PAD, right: BADGE_PAD,
          width: BADGE_SIZE, height: BADGE_SIZE,
          borderRadius: 12,
          backgroundColor: "rgba(13,17,23,0.75)",
          border: `1px solid ${BORDER}`,
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 16px ${scene.accent}40`,
        }}>
          <Img
            src={staticFile(`content/homelab-automation/images/${scene.brandIcon}`)}
            style={{ width: BADGE_SIZE - 20, height: BADGE_SIZE - 20, objectFit: "contain" }}
          />
        </div>
      </div>

      {/* ── caption: bottom center, white, typewriter ── */}
      <div style={{
        position: "absolute",
        top: CAPTION_TOP, left: H_PAD, right: H_PAD, height: CAPTION_H,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: interpolate(captionEnter, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(captionEnter, [0, 1], [20, 0])}px)`,
      }}>
        <div style={{
          fontFamily: monoFont, fontSize: 44, lineHeight: 1.65,
          color: "#ffffff", textAlign: "center", whiteSpace: "pre-line",
        }}>
          <TypewriterText text={scene.sub} startFrame={10} charsPerFrame={1.5} />
        </div>
      </div>

      {/* ── bottom progress bar ── */}
      <div style={{
        position: "absolute", bottom: 52, left: H_PAD, right: H_PAD,
        height: 3, backgroundColor: BORDER, borderRadius: 2,
      }}>
        <div style={{
          height: "100%", borderRadius: 2, backgroundColor: scene.accent, opacity: 0.6,
          width: `${(parseInt(scene.step) / SCENES.length) * 100}%`,
        }} />
      </div>
    </AbsoluteFill>
  );
};

// ─── OutroCard ───────────────────────────────────────────────
const OutroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = fadeInOut(frame, OUTRO_DURATION, 12);
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 22 });

  const steps = [
    { label: "Renovate",       desc: "auto-check for updates",     color: "#00d4aa", icon: "renovate-icon.png"        },
    { label: "GitHub PR",      desc: "auto-create pull request",   color: "#7c3aed", icon: "github-icon.png"          },
    { label: "GitHub Actions", desc: "auto-deploy manifests",      color: "#f59e0b", icon: "github-actions-icon.png"  },
    { label: "Kubernetes",     desc: "auto-run latest pods",       color: "#22c55e", icon: "kubernetes-icon.png"      },
  ];

  return (
    <AbsoluteFill style={{
      backgroundColor: BG, opacity,
      justifyContent: "center", alignItems: "center",
      flexDirection: "column", padding: 80, gap: 40,
    }}>
      <GridLines />
      <div style={{
        fontFamily: monoFont, fontSize: 24, color: "#8b949e",
        letterSpacing: 6, textTransform: "uppercase",
        opacity: interpolate(enter, [0, 1], [0, 1]),
      }}>
        the full loop
      </div>

      <div style={{
        width: "100%", display: "flex", flexDirection: "column", gap: 18,
        opacity: interpolate(enter, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(enter, [0, 1], [30, 0])}px)`,
      }}>
        {steps.map((s, i) => (
          <div key={s.label} style={{
            display: "flex", alignItems: "center", gap: 20,
            backgroundColor: SURFACE, border: `1px solid ${BORDER}`,
            borderLeft: `4px solid ${s.color}`,
            borderRadius: 12, padding: "24px 28px",
          }}>
            <div style={{ fontFamily: monoFont, fontSize: 20, color: "#8b949e", width: 28 }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <Img src={staticFile(`content/homelab-automation/images/${s.icon}`)}
              style={{ width: 36, height: 36, objectFit: "contain" }} />
            <div style={{ fontFamily: sansFont, fontWeight: 700, fontSize: 28, color: s.color, width: 220, flexShrink: 0 }}>
              {s.label}
            </div>
            <div style={{ fontFamily: sansFont, fontSize: 28, color: "#8b949e" }}>
              {s.desc}
            </div>
          </div>
        ))}
      </div>

      {/* quote + attribution */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        opacity: interpolate(enter, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(enter, [0, 1], [20, 0])}px)`,
      }}>
        <div style={{
          fontFamily: sansFont, fontWeight: 700, fontSize: 38,
          color: "#00d4aa", textAlign: "center", lineHeight: 1.4,
        }}>
          "Building systems that
          <br />
          run themselves."
        </div>
        <div style={{
          fontFamily: monoFont, fontSize: 26,
          color: "#8b949e", letterSpacing: 2,
        }}>
          — Ariff Azman
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── CTACard ─────────────────────────────────────────────────
const CTA_ICONS = [
  "renovate-icon.png",
  "github-icon.png",
  "github-actions-icon.png",
  "kubernetes-icon.png",
] as const;

const CTACard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = fadeInOut(frame, CTA_DURATION, 10);

  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 20 });

  const iconsEnter = spring({ frame: frame - 8, fps, config: { damping: 200 }, durationInFrames: 20 });

  return (
    <AbsoluteFill style={{
      backgroundColor: BG, opacity,
      justifyContent: "center", alignItems: "center",
      flexDirection: "column", gap: 48, padding: 80,
    }}>
      <GridLines />

      {/* label */}
      <div style={{
        fontFamily: monoFont, fontSize: 24, color: "#8b949e",
        letterSpacing: 6, textTransform: "uppercase",
        opacity: interpolate(enter, [0, 1], [0, 1]),
      }}>
        want to learn more?
      </div>

      {/* main CTA text */}
      <div style={{
        fontFamily: sansFont, fontWeight: 800, fontSize: 68,
        color: "#ffffff", textAlign: "center", lineHeight: 1.2,
        opacity: interpolate(enter, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(enter, [0, 1], [30, 0])}px)`,
      }}>
        Links to all tools
        <br />
        <span style={{ color: "#00d4aa" }}>available below</span>
      </div>

      {/* tech icons row */}
      <div style={{
        display: "flex", gap: 36, alignItems: "center",
        opacity: interpolate(iconsEnter, [0, 1], [0, 0.8]),
        transform: `translateY(${interpolate(iconsEnter, [0, 1], [20, 0])}px)`,
      }}>
        {CTA_ICONS.map((icon) => (
          <div key={icon} style={{
            width: 83, height: 83,
            backgroundColor: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Img
              src={staticFile(`content/homelab-automation/images/${icon}`)}
              style={{ width: 55, height: 55, objectFit: "contain" }}
            />
          </div>
        ))}
      </div>

      {/* multiple bouncing arrows */}
      <div style={{
        display: "flex", gap: 28,
        opacity: interpolate(enter, [0, 1], [0, 1]),
      }}>
        {[0, 8, 16].map((offset) => (
          <div key={offset} style={{
            fontSize: 52, color: "#00d4aa", lineHeight: 1,
            transform: `translateY(${interpolate(
              Math.sin(((frame + offset) / fps) * Math.PI * 2.5),
              [-1, 1], [0, 18],
            )}px)`,
          }}>
            ↓
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── HomelabVideo ────────────────────────────────────────────
export const HomelabVideo: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();
  const FADE_IN  = 1 * fps;  // 1s fade in
  const FADE_OUT = 2 * fps;  // 2s fade out

  return (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    {/* background music */}
    <Audio
      src={staticFile("content/homelab-automation/bg-music.mp3")}
      volume={(f) =>
        interpolate(
          f,
          [0, FADE_IN, durationInFrames - FADE_OUT, durationInFrames],
          [0, 0.4, 0.4, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      }
    />

    <Sequence durationInFrames={TITLE_DURATION}>
      <TitleCard />
    </Sequence>
    {SCENES.map((scene, i) => (
      <Sequence key={scene.id} from={TITLE_DURATION + i * SCENE_DURATION} durationInFrames={SCENE_DURATION}>
        <ScreenshotScene scene={scene} sceneDuration={SCENE_DURATION} />
      </Sequence>
    ))}
    <Sequence from={TITLE_DURATION + SCENES.length * SCENE_DURATION} durationInFrames={OUTRO_DURATION}>
      <OutroCard />
    </Sequence>
    <Sequence from={TITLE_DURATION + SCENES.length * SCENE_DURATION + OUTRO_DURATION} durationInFrames={CTA_DURATION}>
      <CTACard />
    </Sequence>
  </AbsoluteFill>
  );
};

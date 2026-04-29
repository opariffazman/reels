import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  mdiCamera,
  mdiGamepad,
  mdiEmail,
  mdiMapMarker,
  mdiContacts,
  mdiCompass,
  mdiClockOutline,
  mdiCog,
  mdiCellphone,
  mdiCart,
  mdiReddit,
} from "@mdi/js";
import { COLORS } from "../colors";
import { INTER } from "../fonts";
import { T9Dialer, type AppResult } from "../components/T9Dialer";

interface PressEvent {
  digit: string;
  frame: number;
  /** The letter being typed on this key press */
  letter?: string;
}

// Gmail: G(4) M(6) A(2)
const GMAIL_PRESSES: PressEvent[] = [
  { digit: "4", frame: 25, letter: "G" },
  { digit: "6", frame: 50, letter: "M" },
  { digit: "2", frame: 75, letter: "A" },
];
const GMAIL_CLEAR: PressEvent = { digit: "1", frame: 110 };

// Contacts: C(2) O(6) N(6)
const CONTACTS_PRESSES: PressEvent[] = [
  { digit: "2", frame: 135, letter: "C" },
  { digit: "6", frame: 160, letter: "O" },
  { digit: "6", frame: 185, letter: "N" },
];
const CONTACTS_CLEAR: PressEvent = { digit: "1", frame: 220 };

// Settings: S(7) E(3) T(8)
const SETTINGS_PRESSES: PressEvent[] = [
  { digit: "7", frame: 245, letter: "S" },
  { digit: "3", frame: 270, letter: "E" },
  { digit: "8", frame: 295, letter: "T" },
];

const ALL_PRESSES: PressEvent[] = [
  ...GMAIL_PRESSES,
  GMAIL_CLEAR,
  ...CONTACTS_PRESSES,
  CONTACTS_CLEAR,
  ...SETTINGS_PRESSES,
];

const GMAIL_RESULTS: Record<number, AppResult[]> = {
  0: [
    { icon: mdiCamera, name: "Gallery", iconColor: "#3b82f6" },
    { icon: mdiGamepad, name: "Games", iconColor: "#a855f7" },
    { icon: mdiEmail, name: "Gmail", iconColor: "#ef4444" },
  ],
  1: [
    { icon: mdiEmail, name: "Gmail", iconColor: "#ef4444" },
    { icon: mdiMapMarker, name: "Google Maps", iconColor: "#22c55e" },
  ],
  2: [{ icon: mdiEmail, name: "Gmail", iconColor: "#ef4444" }],
};

const CONTACTS_RESULTS: Record<number, AppResult[]> = {
  0: [
    { icon: mdiContacts, name: "Contacts", iconColor: "#22c55e" },
    { icon: mdiCamera, name: "Camera", iconColor: "#ef4444" },
    { icon: mdiClockOutline, name: "Clock", iconColor: "#06b6d4" },
  ],
  1: [
    { icon: mdiContacts, name: "Contacts", iconColor: "#22c55e" },
    { icon: mdiCompass, name: "Compass", iconColor: "#3b82f6" },
  ],
  2: [{ icon: mdiContacts, name: "Contacts", iconColor: "#22c55e" }],
};

const SETTINGS_RESULTS: Record<number, AppResult[]> = {
  0: [
    { icon: mdiCog, name: "Settings", iconColor: "#94a3b8" },
    { icon: mdiCellphone, name: "Samsung", iconColor: "#3b82f6" },
    { icon: mdiCart, name: "Shop", iconColor: "#f59e0b" },
  ],
  1: [
    { icon: mdiReddit, name: "Reddit", iconColor: "#FF4500" },
    { icon: mdiCog, name: "Settings", iconColor: "#94a3b8" },
  ],
  2: [{ icon: mdiCog, name: "Settings", iconColor: "#94a3b8" }],
};

function getSearchState(frame: number) {
  if (frame >= SETTINGS_PRESSES[0].frame) {
    const step = SETTINGS_PRESSES.filter((p) => frame >= p.frame).length - 1;
    return {
      phase: "Settings" as const,
      results: SETTINGS_RESULTS[Math.min(step, 2)] ?? [],
      digits: SETTINGS_PRESSES.filter((p) => frame >= p.frame).map(
        (p) => p.digit,
      ),
      found: step >= 1,
    };
  }
  if (frame >= CONTACTS_CLEAR.frame) {
    return { phase: "cleared" as const, results: [], digits: [], found: false };
  }
  if (frame >= CONTACTS_PRESSES[0].frame) {
    const step = CONTACTS_PRESSES.filter((p) => frame >= p.frame).length - 1;
    return {
      phase: "Contacts" as const,
      results: CONTACTS_RESULTS[Math.min(step, 2)] ?? [],
      digits: CONTACTS_PRESSES.filter((p) => frame >= p.frame).map(
        (p) => p.digit,
      ),
      found: step >= 2,
    };
  }
  if (frame >= GMAIL_CLEAR.frame) {
    return { phase: "cleared" as const, results: [], digits: [], found: false };
  }
  if (frame >= GMAIL_PRESSES[0].frame) {
    const step = GMAIL_PRESSES.filter((p) => frame >= p.frame).length - 1;
    return {
      phase: "Gmail" as const,
      results: GMAIL_RESULTS[Math.min(step, 2)] ?? [],
      digits: GMAIL_PRESSES.filter((p) => frame >= p.frame).map(
        (p) => p.digit,
      ),
      found: step >= 2,
    };
  }
  return { phase: "idle" as const, results: [], digits: [], found: false };
}

export const Scene2KeypadHero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const dialerY = interpolate(entrance, [0, 1], [400, 0]);

  const state = getSearchState(frame);

  const activePress = ALL_PRESSES.find(
    (p) => frame >= p.frame && frame < p.frame + 6,
  );

  // Find the most recent press with a letter to highlight it on the keypad
  // Persists until next press or clear
  const currentHighlight = (() => {
    const allWithLetters = ALL_PRESSES.filter((p) => p.letter && frame >= p.frame);
    if (allWithLetters.length === 0) return null;
    const latest = allWithLetters[allWithLetters.length - 1];
    // Clear resets highlight
    if (latest.digit === "1") return null;
    return latest.letter ?? null;
  })();

  const taglineProgress = spring({
    frame: frame - 320,
    fps,
    config: { damping: 200 },
  });

  const searchLabel =
    state.phase === "Gmail"
      ? "Searching: Gmail"
      : state.phase === "Contacts"
        ? "Searching: Contacts"
        : state.phase === "Settings"
          ? "Searching: Settings"
          : "";

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
          gap: 80,
          alignItems: "center",
          transform: `translateY(${dialerY}px)`,
        }}
      >
        <T9Dialer
          theme="dark"
          scale={1.5}
          activeDigit={activePress?.digit ?? null}
          pressFrame={activePress?.frame}
          results={state.results}
          highlightLetter={currentHighlight}
        />

        <div style={{ width: 450 }}>
          {searchLabel && (
            <div
              style={{
                fontFamily: INTER,
                fontSize: 24,
                color: COLORS.muted,
                marginBottom: 24,
                textTransform: "uppercase",
                letterSpacing: 3,
              }}
            >
              {searchLabel}
            </div>
          )}

          {state.digits.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 30,
              }}
            >
              {state.digits.map((d, i) => (
                <div
                  key={i}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 14,
                    backgroundColor: COLORS.border,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: INTER,
                    fontSize: 32,
                    fontWeight: 700,
                    color: COLORS.accent,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          )}

          {state.found && (
            <div
              style={{
                fontFamily: INTER,
                fontSize: 26,
                color: COLORS.accent,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 28 }}>✓</span>
              {state.phase} found
            </div>
          )}

          {activePress?.digit === "1" && (
            <div
              style={{
                fontFamily: INTER,
                fontSize: 24,
                color: COLORS.keyClear,
              }}
            >
              Cleared
            </div>
          )}

          <div
            style={{
              marginTop: 40,
              opacity: interpolate(taglineProgress, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(taglineProgress, [0, 1], [30, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily: INTER,
                fontSize: 48,
                fontWeight: 800,
                color: COLORS.accent,
              }}
            >
              Type. Find. Launch.
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

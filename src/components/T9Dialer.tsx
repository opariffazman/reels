import React from "react";
import { useCurrentFrame } from "remotion";
import {
  mdiPalette,
  mdiWeatherSunny,
  mdiWeatherNight,
  mdiArrowAll,
  mdiArrowCollapseAll,
  mdiRestart,
  mdiArrowExpandAll,
  mdiInformationOutline,
} from "@mdi/js";
import { COLORS } from "../colors";
import { INTER } from "../fonts";
import { MdiIcon } from "./MdiIcon";

// Matches the real T9 App Dialer layout exactly:
// - MaterialCardView with 16dp corner radius, 1dp border, 0 elevation
// - 3x3 grid (buttons 1-9 only, no 0/*/# )
// - Button 1 = red "CLEAR"
// - Apps container above keypad (120dp, shows up to 3 app icons)
// - Keys 1-6 & 9 have a small hold-action icon on the right side

interface KeyDef {
  digit: string;
  letters: string;
  isClear?: boolean;
  /** MDI path for the hold-action icon shown on the right side */
  holdIcon?: string;
}

const DARK_KEYS: KeyDef[] = [
  { digit: "1", letters: "CLEAR", isClear: true, holdIcon: mdiPalette },
  { digit: "2", letters: "ABC", holdIcon: mdiWeatherNight },
  { digit: "3", letters: "DEF", holdIcon: mdiArrowAll },
  { digit: "4", letters: "GHI", holdIcon: mdiArrowCollapseAll },
  { digit: "5", letters: "JKL", holdIcon: mdiRestart },
  { digit: "6", letters: "MNO", holdIcon: mdiArrowExpandAll },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ", holdIcon: mdiInformationOutline },
];

const LIGHT_KEYS: KeyDef[] = [
  { digit: "1", letters: "CLEAR", isClear: true, holdIcon: mdiPalette },
  { digit: "2", letters: "ABC", holdIcon: mdiWeatherSunny },
  { digit: "3", letters: "DEF", holdIcon: mdiArrowAll },
  { digit: "4", letters: "GHI", holdIcon: mdiArrowCollapseAll },
  { digit: "5", letters: "JKL", holdIcon: mdiRestart },
  { digit: "6", letters: "MNO", holdIcon: mdiArrowExpandAll },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ", holdIcon: mdiInformationOutline },
];

export interface AppResult {
  /** MDI SVG path data string */
  icon: string;
  name: string;
  /** Optional icon color override */
  iconColor?: string;
}

interface T9DialerProps {
  theme?: "dark" | "light";
  scale?: number;
  /** Which digit is currently being pressed (lit up) */
  activeDigit?: string | null;
  /** Frame at which the active digit was pressed (for press animation) */
  pressFrame?: number;
  /** App results to show above the keypad */
  results?: AppResult[];
  /** Whether to show move-mode orange border */
  moveMode?: boolean;
  /** Letter to highlight with a small circle on its key (e.g. "G") */
  highlightLetter?: string | null;
}

export const T9Dialer: React.FC<T9DialerProps> = ({
  theme = "dark",
  scale = 1,
  activeDigit = null,
  pressFrame,
  results = [],
  moveMode = false,
  highlightLetter = null,
}) => {
  const frame = useCurrentFrame();
  const isDark = theme === "dark";

  const bg = isDark ? COLORS.bg : COLORS.lightBg;
  const border = moveMode
    ? COLORS.moveHighlight
    : isDark
      ? COLORS.border
      : COLORS.lightBorder;
  const borderWidth = moveMode ? 3 : 1;
  const keyNumColor = isDark ? COLORS.keyNumber : COLORS.lightKeyNumber;
  const keyAlphaColor = isDark ? COLORS.keyAlphabet : COLORS.lightKeyAlphabet;
  const appTextColor = isDark ? COLORS.appText : COLORS.lightAppText;

  const isPressing =
    activeDigit !== null &&
    pressFrame !== undefined &&
    frame >= pressFrame &&
    frame < pressFrame + 6;

  const keys = isDark ? DARK_KEYS : LIGHT_KEYS;

  return (
    <div
      style={{
        width: 320 * scale,
        backgroundColor: bg,
        borderRadius: 16 * scale,
        padding: 6 * scale,
        border: `${borderWidth}px solid ${border}`,
        boxSizing: "border-box",
      }}
    >
      {/* Apps container - 120dp area above keypad */}
      <div
        style={{
          height: 120 * scale,
          marginTop: 19 * scale,
          marginBottom: 10 * scale,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8 * scale,
        }}
      >
        {results.length === 0 ? (
          <div
            style={{
              fontFamily: INTER,
              fontSize: 14 * scale,
              color: isDark ? COLORS.keyAlphabet : COLORS.lightKeyAlphabet,
            }}
          >
            {/* Empty state */}
          </div>
        ) : (
          results.slice(0, 3).map((app, i) => (
            <div
              key={`${app.name}-${i}`}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6 * scale,
              }}
            >
              {/* App icon */}
              <div
                style={{
                  width: 72 * scale,
                  height: 72 * scale,
                  borderRadius: 16 * scale,
                  backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MdiIcon
                  path={app.icon}
                  size={43 * scale}
                  color={
                    app.iconColor ??
                    (isDark ? COLORS.appText : COLORS.lightAppText)
                  }
                />
              </div>
              {/* App label */}
              <div
                style={{
                  fontFamily: INTER,
                  fontSize: 12 * scale,
                  color: appTextColor,
                  textAlign: "center",
                  maxWidth: 80 * scale,
                  overflow: "hidden",
                  lineHeight: 1.2,
                }}
              >
                {app.name}
              </div>
            </div>
          ))
        )}
      </div>

      {/* T9 Keyboard - 3x3 grid, buttons 1-9 only */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 4 * scale,
        }}
      >
        {keys.map((key) => {
          const isThisKeyActive = activeDigit === key.digit && isPressing;
          const digitColor = key.isClear
            ? COLORS.keyClear
            : isThisKeyActive
              ? bg
              : keyNumColor;
          const letterColor = key.isClear
            ? COLORS.keyClear
            : isThisKeyActive
              ? bg
              : keyAlphaColor;
          // Fix: light theme uses dark ripple, dark theme uses light ripple
          const keyBg = isThisKeyActive
            ? isDark
              ? COLORS.ripple
              : "rgba(0,0,0,0.4)"
            : "transparent";

          return (
            <div
              key={key.digit}
              style={{
                height: 76 * scale,
                borderRadius: 8 * scale,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: keyBg,
                transform: isThisKeyActive ? "scale(0.94)" : "scale(1)",
                position: "relative",
              }}
            >
              {/* Hold-action icon on the right */}
              {key.holdIcon && (
                <div
                  style={{
                    position: "absolute",
                    top: 4 * scale,
                    right: 4 * scale,
                  }}
                >
                  <MdiIcon
                    path={key.holdIcon}
                    size={10 * scale}
                    color={
                      isThisKeyActive
                        ? bg
                        : isDark
                          ? COLORS.keyAlphabet
                          : COLORS.lightKeyAlphabet
                    }
                  />
                </div>
              )}
              <div
                style={{
                  fontFamily: INTER,
                  fontSize: 20 * scale,
                  fontWeight: 700,
                  color: digitColor,
                  lineHeight: 1.2,
                }}
              >
                {key.digit}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: key.isClear ? 0 : 1 * scale,
                  fontFamily: INTER,
                  fontSize: key.isClear ? 10 * scale : 14 * scale,
                  color: letterColor,
                  letterSpacing: key.isClear ? 0 : 1 * scale,
                  fontWeight: key.isClear ? 700 : 400,
                }}
              >
                {key.isClear
                  ? key.letters
                  : key.letters.split("").map((char) => {
                      const isHighlighted =
                        highlightLetter !== null &&
                        char === highlightLetter.toUpperCase();
                      return (
                        <span
                          key={char}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: isHighlighted ? 18 * scale : undefined,
                            height: isHighlighted ? 18 * scale : undefined,
                            borderRadius: isHighlighted
                              ? 9 * scale
                              : undefined,
                            backgroundColor: isHighlighted
                              ? "#22c55e"
                              : undefined,
                            color: isHighlighted
                              ? "#000"
                              : letterColor,
                            fontWeight: isHighlighted ? 700 : 400,
                            fontSize: isHighlighted
                              ? 11 * scale
                              : 14 * scale,
                          }}
                        >
                          {char}
                        </span>
                      );
                    })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

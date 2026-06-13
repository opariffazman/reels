import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";

export type SweepDirection = "down" | "diagonal" | "radial";
type BuildSweepProps = { direction: SweepDirection };

const FEATHER = 9; // soft reveal-edge width, in %
const ACCENT_GLOW = "rgba(34,197,94,0.9)"; // COLORS.accent @ 0.9 alpha

// Build the mask (what's revealed) or glow (bright band at the edge) gradient
// for a given direction and edge position (%). Edge overshoots 100 so that at
// progress = 1 the whole scene is revealed.
const gradient = (
  kind: "mask" | "glow",
  direction: SweepDirection,
  edge: number,
): string => {
  const stops =
    kind === "mask"
      ? `#000 ${edge - FEATHER}%, transparent ${edge}%`
      : `transparent ${edge - FEATHER - 3}%, ${ACCENT_GLOW} ${
          edge - FEATHER / 2
        }%, transparent ${edge}%`;
  if (direction === "radial") {
    return `radial-gradient(circle at 50% 50%, ${stops})`;
  }
  const angle = direction === "diagonal" ? "135deg" : "180deg"; // down = to bottom
  return `linear-gradient(${angle}, ${stops})`;
};

const BuildSweep: React.FC<
  TransitionPresentationComponentProps<BuildSweepProps>
> = ({ presentationProgress, presentationDirection, passedProps, children }) => {
  // Old scene: render as-is; it sits underneath and gets covered.
  if (presentationDirection === "exiting") {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const edge = interpolate(presentationProgress, [0, 1], [0, 100 + FEATHER]);
  const maskImage = gradient("mask", passedProps.direction, edge);
  const glowImage = gradient("glow", passedProps.direction, edge);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ maskImage, WebkitMaskImage: maskImage }}>
        {children}
      </AbsoluteFill>
      {/* Glowing build-head riding the reveal edge */}
      <AbsoluteFill
        style={{
          backgroundImage: glowImage,
          filter: "blur(7px)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export const buildSweep = (
  direction: SweepDirection,
): TransitionPresentation<BuildSweepProps> => ({
  component: BuildSweep,
  props: { direction },
});

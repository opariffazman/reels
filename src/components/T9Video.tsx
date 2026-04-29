import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Audio } from "@remotion/media";
import {
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";
import { Scene1Problem } from "../scenes/Scene1Problem";
import { SceneIntro } from "../scenes/SceneIntro";
import { Scene2KeypadHero } from "../scenes/Scene2KeypadHero";
import { Scene3Themes } from "../scenes/Scene3Themes";
import { Scene4Customization } from "../scenes/Scene4Customization";
import { SceneFeatures } from "../scenes/SceneFeatures";
import { Scene7Nostalgia } from "../scenes/Scene7Nostalgia";
import { Scene8GitHubCTA } from "../scenes/Scene8GitHubCTA";

const TRANSITION_DURATION = 15;

export const MyComposition: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <>
      {/* Background music — place bgm.mp3 in public/ folder */}
      <Audio
        src={staticFile("content/t9-app-dialer/bgm.mp3")}
        volume={(f) => {
          const fadeInEnd = 1 * fps;
          const fadeOutStart = durationInFrames - 2 * fps;
          const maxVolume = 0.4;

          // Fade in over 1s
          if (f < fadeInEnd) {
            return interpolate(f, [0, fadeInEnd], [0, maxVolume], {
              extrapolateRight: "clamp",
            });
          }
          // Fade out over last 2s
          if (f > fadeOutStart) {
            return interpolate(
              f,
              [fadeOutStart, durationInFrames],
              [maxVolume, 0],
              { extrapolateLeft: "clamp" },
            );
          }
          return maxVolume;
        }}
      />

      <TransitionSeries>
        {/* Scene 1: Scrolling app drawer — the problem */}
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene1Problem />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 2: Intro — T9 App Dialer icon + name, zooms into usage */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <SceneIntro />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 3: T9 Demo — Gmail(4,6,2) → clear → Contacts(2,6,6) → clear → Settings(7,3,8) */}
        <TransitionSeries.Sequence durationInFrames={360}>
          <Scene2KeypadHero />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 4: Theme toggle — hold 2, dark→light→dark */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene3Themes />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 5: Customization — hold 3 move, hold 4 shrink, hold 6 expand */}
        <TransitionSeries.Sequence durationInFrames={390}>
          <Scene4Customization />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 6: Feature highlights — 9 features × 25 frames = 225 frames */}
        <TransitionSeries.Sequence durationInFrames={225}>
          <SceneFeatures />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 7: Nostalgia — old Nokia vs modern T9 */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <Scene7Nostalgia />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 8: GitHub CTA */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene8GitHubCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};

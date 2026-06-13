import "./index.css";
import { Composition } from "remotion";
import { HomelabVideo, HOMELAB_TOTAL_FRAMES } from "./components/HomelabVideo";
import { MyComposition as T9Video } from "./components/T9Video";
import {
  ClawdLensVideo,
  CLAWDLENS_TOTAL_FRAMES,
} from "./components/ClawdLensVideo";
import {
  ClawdLensV2Video,
  CLAWDLENSV2_TOTAL_FRAMES,
} from "./components/ClawdLensV2Video";
import {
  DadRevampVideo,
  DADREVAMP_TOTAL_FRAMES,
} from "./components/DadRevampVideo";

const T9_TOTAL_DURATION = 1500;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="homelab-automation"
      component={HomelabVideo}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={HOMELAB_TOTAL_FRAMES}
    />
    <Composition
      id="t9-app-dialer"
      component={T9Video}
      fps={30}
      width={1920}
      height={1080}
      durationInFrames={T9_TOTAL_DURATION}
    />
    <Composition
      id="clawdlens"
      component={ClawdLensVideo}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={CLAWDLENS_TOTAL_FRAMES}
    />
    <Composition
      id="clawdlens-v2"
      component={ClawdLensV2Video}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={CLAWDLENSV2_TOTAL_FRAMES}
    />
    <Composition
      id="dad-revamp"
      component={DadRevampVideo}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={DADREVAMP_TOTAL_FRAMES}
    />
  </>
);

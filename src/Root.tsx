import "./index.css";
import { Composition } from "remotion";
import { HomelabVideo, HOMELAB_TOTAL_FRAMES } from "./components/HomelabVideo";
import { MyComposition as T9Video } from "./components/T9Video";

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
  </>
);

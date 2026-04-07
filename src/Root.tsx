import "./index.css";
import { Composition } from "remotion";
import { HomelabVideo, HOMELAB_TOTAL_FRAMES } from "./components/HomelabVideo";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="homelab-automation"
    component={HomelabVideo}
    fps={30}
    width={1080}
    height={1920}
    durationInFrames={HOMELAB_TOTAL_FRAMES}
  />
);

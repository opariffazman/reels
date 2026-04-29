import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: interFamily } = loadInter("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

const { fontFamily: monoFamily } = loadJetBrainsMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const INTER = interFamily;
export const MONO = monoFamily;

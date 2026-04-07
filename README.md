# opariffazman/reels

Short-form DevOps videos built with [Remotion](https://remotion.dev) — portrait 1080×1920 for social media (LinkedIn, Threads, Instagram).

> *"Building systems that run themselves."*

## Episodes

| # | Title | Composition ID |
|---|-------|---------------|
| 01 | How I automate my homelab infrastructure | `homelab-automation` |

## Getting started

**Install dependencies**

```bash
npm install
```

**Preview in Remotion Studio**

```bash
npm run dev
```

**Render a video**

```bash
npx remotion render homelab-automation out/homelab-automation.mp4 --codec=h264 --crf=18
```

## Adding a new episode

1. Create `src/components/YourEpisode.tsx`
2. Add assets to `public/content/your-episode/`
3. Register the composition in `src/Root.tsx`

## Notes

- Background music is gitignored — source from [YouTube Audio Library](https://studio.youtube.com) and place as `public/content/<episode>/bg-music.mp3`
- Source screenshots are gitignored under `screenshots/`
- Rendered output (`out/`) is gitignored

## Tech stack

- [Remotion](https://remotion.dev) — video as React components
- [Inter](https://fonts.google.com/specimen/Inter) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — typography

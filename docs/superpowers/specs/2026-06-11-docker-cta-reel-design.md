# Docker Training CTA Reel — Design Spec

**Date:** 2026-06-11
**Composition id:** `docker-cta`
**Source brief:** `docker-public.jpg` (Taming Tech poster — "Docker for Beginner" with En. Ariff Azman)

## Goal

A ~30s catchy social-media reel that drives registration for the Docker for Beginner
training (Taming Tech, HRDcorp claimable). Portrait, mute-friendly but with a robotic
AI-narrator voiceover, ending on a WhatsApp registration CTA.

## Locked decisions

| Area | Decision |
|------|----------|
| Aspect ratio | Portrait **1080×1920**, 30 fps, ~900 frames (30s) |
| Concept | **Container Stack hype** — bright Docker-blue gradient, bold Inter, Docker logo mark, glossy container cards that slide in and stack |
| Voice | **English, piper offline** (`en_US-lessac-medium`), terse robotic AI-narrator fragments. Free/offline, no API key. |
| On-screen text | **1:1 with VO** — every narrated caption shows the exact spoken words, revealed in sync. Brand wordmark/logo + static contact block are the only non-narrated elements. |
| Trainer photo | **None** — Docker-brand visual only |
| CTA | **WhatsApp register** — 27–29 July 2026 · Taman Melawati, KL · WhatsApp 6013 446 4601 · Taming Tech · HRDcorp Claimable |
| Docker mark | **`mdiDocker`** via existing `MdiIcon` (real whale+containers logo), not hand-drawn |

## Visual system

- **Background:** Docker-blue gradient `#2496ED → #1D63ED → navy #0a1a3f`, subtle animated drift + soft radial glow.
- **Docker logo:** `mdiDocker` rendered white / light-blue, spring pop-in with glow halo.
- **Container cards:** rounded rectangles with corrugated ridges (CSS `repeating-linear-gradient`) for a shipping-container look; glossy Docker-blue fill; white label; green `mdiCheckCircle`. Slide in from the right and stack vertically.
- **Fonts:** `INTER` (bold headlines/labels) + `MONO` (typed hook / terminal feel). From `src/fonts.ts`.
- **Icons (all confirmed present in installed `@mdi/js`):** `mdiDocker`, `mdiCheckCircle`, `mdiCalendar`, `mdiMapMarker`, `mdiWhatsapp`, `mdiArrowRight`.
- **Local theme tokens** defined in the component (Docker palette), not added to legacy `src/colors.ts`.

## Storyboard & timing (30 fps, 900 frames)

| Beat | Frames | Time | Content |
|------|--------|------|---------|
| 1 — Hook | 0–135 | 0–4.5s | Typewriter hook **"Master Docker in 3 days"** on gradient. |
| 2 — Brand reveal | 135–255 | 4.5–8.5s | `mdiDocker` logo pops in + **DOCKER** wordmark → caption **"for beginners"**. |
| 3 — Curriculum stack | 255–660 | 8.5–22s | Header **"You will learn:"** then 5 container cards slide/stack in, one per VO clip. |
| 4 — CTA close | 660–900 | 22–30s | Date line (VO) → venue line (silent) → **DAFTAR SEKARANG →** + WhatsApp number + Taming Tech · HRDcorp (silent), held to 30s. |

Per-clip frame budget within beats 3–4:
- 03 header: 255–309 · 04 Docker Basics: 309–375 · 05 Images & Containers: 375–441 ·
  06 Docker Compose: 441–507 · 07 Troubleshoot & Secure: 507–573 · 08 Backup & Restore: 573–639 ·
  stack hold: 639–660
- 09 date: 660–735 · 10 venue (silent): 735–795 · 11 CTA (silent): 795–900

## VO ↔ on-screen text (1:1)

Voiceover clips `public/voiceover/docker-cta/01.mp3 … 09.mp3` (9 clips). **Clips 10 & 11 have no VO** —
the venue + CTA land silently on the music/SFX swell.

| Clip | VO (spoken) | On-screen text (synced) | Reveal |
|------|-------------|--------------------------|--------|
| 01 | "Master Docker. In three days." | Master Docker in 3 days | typewriter |
| 02 | "Docker. For beginners." | `mdiDocker` + **DOCKER** → for beginners | logo pop + caption |
| 03 | "You will learn:" | You will learn: | typed header |
| 04 | "Docker basics." | card: Docker Basics | card stacks |
| 05 | "Images and containers." | card: Images & Containers | card stacks |
| 06 | "Docker Compose." | card: Docker Compose | card stacks |
| 07 | "Troubleshoot and secure." | card: Troubleshoot & Secure | card stacks |
| 08 | "Backup and restore." | card: Backup & Restore | card stacks |
| 09 | "Twenty seventh to twenty ninth July." | 27–29 July 2026 | line in |
| 10 | *(silent)* | Taman Melawati, KL | line in |
| 11 | *(silent)* | DAFTAR SEKARANG → + WhatsApp 6013 446 4601 + Taming Tech · HRDcorp Claimable | CTA reveal |

**Reading conventions inside the 1:1 rule (approved):**
1. Numbers shown as digits, spoken as words ("3 days" / "27–29 July" on screen; "three days" / "twenty-seventh to twenty-ninth" spoken).
2. "and" → "&" on cards (same words).
3. No non-spoken decorative captions (dropped "& many more").

## Audio

- **VO:** piper `en_US-lessac-medium`, synth each line → `ffmpeg loudnorm=I=-16:TP=-1.5:LRA=11` → mp3.
  Piper binary is ephemeral (re-download to `/tmp` this session per the clawdlens recipe). Generated mp3s are committed under `public/voiceover/docker-cta/`.
- **Music bed:** reuse a real committed track (probe with `ffmpeg -af volumedetect` first to avoid the silent placeholder trap); duck under VO windows via a `musicVolume(frame)` callback (`envelope × duck`, clawdlens recipe). Music ducks during clips 01–09; returns to base / swells for the silent CTA close (frames 735–900). User can swap the track later.
- **SFX:** reuse `public/content/devops1-bootcamp/sfx/` (`click`, `ding`, `whoosh`, `swell`, `ping`) via `staticFile`. Hook = per-keystroke click + ding; brand = whoosh + swell; each card = click + ding; CTA = swell + ding.

## File changes

**New:**
- `src/components/DockerCtaVideo.tsx` — single-file reel (HomelabVideo pattern). Exports `DockerCtaVideo` + `DOCKERCTA_TOTAL_FRAMES`. Internal sub-components `DockerMark` (`mdiDocker` logo + glow), `ContainerCard`, plus beat sections. Local Docker theme tokens. Reuses `TypingText`, `MdiIcon`.
- `public/content/docker-cta/` — music bed (copied real track) ; SFX referenced from `devops1-bootcamp/sfx` (no duplication) or copied if cleaner.
- `public/voiceover/docker-cta/01.mp3 … 09.mp3` — piper VO.

**Modified:**
- `src/Root.tsx` — register `<Composition id="docker-cta" width={1080} height={1920} fps={30} durationInFrames={DOCKERCTA_TOTAL_FRAMES} />`.

## Verification

1. `npm run lint` (eslint + tsc) — must be clean.
2. `npx remotion still docker-cta out/check-NN.png --frame=N` at each beat boundary (e.g. 60, 200, 320, 450, 600, 720, 860) — visual checkpoints.
3. Audio probe: confirm VO mp3s and music bed are non-silent (`ffmpeg -af volumedetect`); confirm VO sits above ducked music.
4. Render: `npx remotion render docker-cta out/docker-cta.mp4 --codec=h264 --crf=18`.

## Risks & assumptions

- **piper offline, English only, robotic** by design (no good Malay piper voice). VO is ephemeral to synth but committed once generated.
- **`mdiDocker` is monochrome** (single path) — a clean recognizable silhouette in white/light-blue, not the multi-color official logo. Acceptable, on-brand.
- **CTA button stays BM "DAFTAR SEKARANG"** (brand word) — this is a static design element, not a narrated caption, so the 1:1 rule does not apply to it.
- **Silent CTA close (~5.5s, frames 735–900)** is intentional — the offer lands on visuals + music swell.
- Music bed track choice is a placeholder pending probe; user can swap.

## Out of scope

- Bahasa Malaysia voiceover (would require ElevenLabs + API key).
- Trainer photo / headshot.
- Multi-scene-file split (single-file component is sufficient at this complexity).
- Posting/scheduling to social platforms (manual by user).

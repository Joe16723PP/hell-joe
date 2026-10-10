# TuengWa.dev

TuengWa.dev is a short daily stretch, plus an optional bodyweight exercise, in the browser. Open it and today’s stretch is ready: still drawings, the muscle to feel, three steps, and a hold timer. Exercise sits beside it: core bodyweight by default, or muscle builder, for 10, 15, or 20 minutes. Finish, and each streak stays on this browser. There is no account and no video.

A stretch should feel like steady tension. Pain means stop. This is a mobility habit, not medical advice.

## Run locally

The app needs Node 20.9 or newer. `.nvmrc` pins Node 22.

```bash
nvm install && nvm use
npm ci
npm run dev
```

The dev server listens on [http://127.0.0.1:47213](http://127.0.0.1:47213).

Before you commit, run the full check. It type-checks, lints, runs the Vitest tests, and builds:

```bash
npm run check
```

Use `npm run test:watch` while you work on the rules in `src/lib/`.

## What you can do

- Set session length, tight areas, and a rest day once. Change them later from home.
- Start today’s session, switch the length, or swap the preset before you begin.
- Hold, add 15 seconds, finish early, switch sides, or skip a move for one alternate.
- Browse the library by area, position, and whether a stretch needs both sides. Opening one does not replace today.
- Finish into a recap. The week and both streaks stay after a reload.
- Start today’s exercise from the home screen. Core bodyweight is the default. Muscle builder is the other option. Lengths are 10, 15, or 20 minutes.
- Hide the exercise card if you only want the stretch. Sunday is the default rest day for both. A rest day does not break either streak.
- Turn on one reminder for stretch days. It uses the browser’s notifications if you allow them, and it only arrives while the page or the installed app is open. Opening the app later the same day still shows the reminder. Rest day stays quiet.
- Install it on a phone from the browser. After the first visit it keeps working offline, including the illustrations and the hold tick.

- Switch between English and Thai (ภาษาไทย) from the EN / TH toggle in the header. The first visit follows the browser language.

Progress and the language choice are saved in this browser’s localStorage.

## Localization

- UI copy lives in `src/lib/i18n/messages.ts` (`en` and `th`). The Thai dictionary is typed against the English keys, so a missing key fails the type check.
- Thai text for the 24 stretches and 4 presets lives in `src/lib/i18n/catalog-th.ts`. English stays in `src/lib/catalog.ts`.
- Components read copy through `useI18n()` from `src/lib/i18n/provider.tsx`. Dates and weekday names use `Intl` with `en-US` or `th-TH`.

## Illustrations

- Each stretch has a soft 3D render in `public/illustrations/{id}.webp` and a common-mistake render in `public/illustrations/{id}-mistake.webp`. The renders contain no text, so both languages share them.
- The exercise illustrations live in `public/illustrations/exercise/`, named the same way: `{id}.webp` and `{id}-mistake.webp`.
- The Check your form dialog draws arrows, dashed guide lines, and labels on top of the renders. Positions per stretch live in `src/lib/form-cues.ts` as percentages of the square image. Label text comes from the `cue.*` keys in `messages.ts`.

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui, and lucide icons. Fonts: Outfit and Plus Jakarta Sans for Latin text, Prompt and Anuphan for Thai.

# Stretchday

Stretchday is a short daily stretch in the browser. Open it and today’s session is ready: still drawings, the muscle to feel, three steps, and a hold timer. Finish, and the streak stays on this browser. There is no account and no video.

A stretch should feel like steady tension. Pain means stop. This is a mobility habit, not medical advice.

## Run locally

```bash
npm install
npm run dev
```

The dev server listens on [http://127.0.0.1:47213](http://127.0.0.1:47213).

## What you can do

- Set session length, tight areas, and a rest day once. Change them later from home.
- Start today’s session, switch the length, or swap the preset before you begin.
- Hold, add 15 seconds, finish early, switch sides, or skip a move for one alternate.
- Browse the library by area, position, and whether a stretch needs both sides. Opening one does not replace today.
- Finish into a recap. The week and the streak stay after a reload.
- Turn on one reminder for stretch days. It uses the browser’s notifications if you allow them. Rest day stays quiet.

- Switch between English and Thai (ภาษาไทย) from the EN / TH toggle in the header. The first visit follows the browser language.

Progress and the language choice are saved in this browser’s localStorage.

## Localization

- UI copy lives in `src/lib/i18n/messages.ts` (`en` and `th`). The Thai dictionary is typed against the English keys, so a missing key fails the type check.
- Thai text for the 24 stretches and 4 presets lives in `src/lib/i18n/catalog-th.ts`. English stays in `src/lib/catalog.ts`.
- Components read copy through `useI18n()` from `src/lib/i18n/provider.tsx`. Dates and weekday names use `Intl` with `en-US` or `th-TH`.

## Illustrations

- Each stretch has a soft 3D render in `public/illustrations/{id}.webp` and a common-mistake render in `public/illustrations/{id}-mistake.webp`. The renders contain no text, so both languages share them.
- The Check your form dialog draws arrows, dashed guide lines, and labels on top of the renders. Positions per stretch live in `src/lib/form-cues.ts` as percentages of the square image. Label text comes from the `cue.*` keys in `messages.ts`.

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui, and lucide icons. Fonts: Outfit and Plus Jakarta Sans for Latin text, Prompt and Anuphan for Thai.

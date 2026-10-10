# Improvement checklist

Ordered by priority. Each phase should leave the app working and `npm run check` passing (once phase 1 adds it). Scores are from the October 2026 review: 10 means the area needs the most work.

## Phase 1: Tooling and runtime (9/10)

The active Node is 16.13, but Next 16 needs Node 20 or newer. Lint crashes with `structuredClone is not defined`, and the build fails.

- [x] Add `.nvmrc` with `22`.
- [x] Add `"engines": { "node": ">=20.9" }` to `package.json`.
- [x] Switch with `nvm install && nvm use`, then reinstall with `npm ci`.
- [x] Add a `typecheck` script: `tsc --noEmit`.
- [x] Add a `check` script: `npm run typecheck && npm run lint && npm run test && npm run build`.
- [x] Fix any lint errors that show up now that lint runs.
- [x] Make `cn` imports consistent: use either `@/lib/utils` or `cn` everywhere, not both.
- [x] Document `npm run check` in the README under "Run locally".

**Done when:** `npm run check` passes on a clean clone.

## Phase 2: Automated tests (9/10)

There are no tests. The streak and planning rules are pure functions and easy to cover.

- [x] Add Vitest (`vitest`, plus `@vitest/coverage-v8` if wanted) and a `test` script.
- [x] `src/lib/plan.ts`:
  - [x] `currentStreak`: rest days skipped, today not yet done, a gap breaks the streak, the rest day falls on today, the year boundary.
  - [x] `focusFor` / `stretchIndex`: each rest-day setting from 0 to 6, the rotation order, the extra-day fallback with and without tight areas.
  - [x] `weekProgress` and `weekDates`: a week where Sunday is the rest day vs. Monday.
  - [x] `nextStretchDate`: skips the rest day.
  - [x] `isShortPreset` and `sessionMoveIds` for each length.
- [x] `src/lib/exercise.ts`:
  - [x] `doseFor` for every option and length.
  - [x] `afterExerciseWork` / `afterExercisePause`: set to rest, last set to next move, last move to done.
  - [x] `skipExerciseMove` and `replaceExerciseMove`, including the last move and duplicate alternates.
  - [x] `exerciseMoveIds` returns valid IDs for every preset and length.
- [x] Catalog checks: every stretch and exercise ID has a Thai entry, a `{id}.webp`, and a `{id}-mistake.webp`.
- [x] `src/lib/pose-pause.ts` and `src/lib/hold-tick.ts` helpers.

**Done when:** the tests run in `npm run check`, and every rule above has at least one test.

## Phase 3: Timer reliability on phones (7/10)

The hold and rest timers in `move-screen.tsx` and `exercise-screen.tsx` subtract 1 each time `setInterval` fires. Browsers slow down intervals when the screen is locked or the tab is in the background, so a hold can run long.

- [x] Create a shared `useCountdown` hook in `src/lib/` that stores an end time and works out the seconds left with `Date.now()`.
- [x] Recalculate on `visibilitychange` so the timer catches up when the user comes back.
- [x] Replace the stretch hold timer and the 10-second pose pause in `move-screen.tsx` with the hook.
- [x] Replace the exercise hold and rest timers in `exercise-screen.tsx` with the hook.
- [x] Keep the 8-bit tick in sync with the new countdown.
- [x] Request `navigator.wakeLock` while a hold or rest runs, release it on pause or finish, and do nothing where it isn't supported.
- [x] Unit test the countdown with fake timers.

**Done when:** a 30-second hold on a phone finishes after 30 seconds of real time even if the tab was hidden, and the screen stays on during holds.

## Phase 4: Reminders and offline use (7/10)

`src/lib/reminder.tsx` only fires if the tab is open at the exact minute. It covers the stretch only. There is no manifest or service worker.

- [x] Add `src/app/manifest.ts` with the name, icons, `theme_color` `#0e7a67`, and `display: "standalone"`. Check the Next 16 docs in `node_modules/next/dist/docs/` first.
- [x] Add app icons at 192 and 512 px, and remove the unused starter SVGs in `public/` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`).
- [x] Add a service worker that caches the app shell, illustrations, and `tick.wav` for offline use.
- [x] Catch up on a missed reminder: if the app opens after the reminder time and today isn't done, show a reminder in the app.
- [x] Mention the exercise in the reminder text when the exercise card is on.
- [x] Explain in the setup screen that reminders need the browser (or the installed app) to be running.

**Done when:** the app can be installed on a phone, works offline after the first visit, and a missed reminder shows up the next time the app opens.

## Phase 5: State store structure (6/10)

`src/lib/store.tsx` is 727 lines, with the stretch and exercise logic mixed together in one `useMemo`.

- [x] Move `sanitizeSettings`, `parseData`, and the localStorage read and write code into `src/lib/storage.ts`.
- [x] Move the stretch session changes (`completeHold`, `advance`, `skip`, `useAlternate`) into pure functions in `src/lib/stretch-session.ts`, alongside `exercise.ts`.
- [x] Share the "finish the session and build the recap" code between `advance` and `skip`.
- [x] Make "today" update on its own: recheck the date on `visibilitychange` and on a timer that fires at midnight.
- [x] Listen for the `storage` event so two open tabs stay in sync.
- [x] Remove the `eslint-disable` for `exhaustive-deps` once `today` comes from state.
- [x] Add tests for the new pure session functions.

**Done when:** `store.tsx` only wires React to the pure modules, and the app moves to the next day without a reload.

## Phase 6: Thai localization coverage (5/10)

- [x] Line 275 of `src/components/recap-screen.tsx`: show the Thai exercise name from `EXERCISES_TH` when it exists, the same way the stretch recap does (`copy?.name ?? move.name`).
- [x] Search for any other direct `.name` renders of catalog items and route them through the i18n provider.
- [x] Add a test that every `EXERCISES_TH` and Thai catalog entry has a name, steps, and cues.
- [x] Switch to TH and check every screen by hand, including setup, both sessions, both recaps, and the library.

**Done when:** no English catalog text shows up in Thai mode.

## Phase 7: Saved-data validation and errors (5/10)

- [x] In `parseData`, check the shapes of `session`, `exerciseSession`, `recap`, and `exerciseRecap`. Drop any invalid entry instead of passing it through.
- [x] Filter the `finished` and `exerciseFinished` lists down to entries with a valid `date` string.
- [x] Wrap `localStorage.setItem` in `remember` and `dropStaleSession` in a try/catch. Keep the state in memory if saving fails.
- [x] Add an `error.tsx` page so a crashed screen can recover (offer "Start over").
- [x] Test with damaged JSON, missing fields, and data from an older version.

**Done when:** damaged saved data never leaves a blank or crashed screen.

## Phase 8: Polish (lower priority)

Accessibility (3/10):

- [x] Do a keyboard-only pass through setup, a stretch session, and an exercise session.
- [x] Make screen readers announce the countdown sparingly (for example every 10 seconds and at the end), not every second.
- [x] Respect `prefers-reduced-motion` for animations.
- [x] Check color contrast in both themes and languages.

Content and docs (2/10):

- [x] Note in the README that the exercise illustrations live in `public/illustrations/exercise/`.
- [x] Set normal file permissions (`644`) on the new exercise webp files. They are currently `600`.
- [x] Update the metadata description so it mentions the exercise session.

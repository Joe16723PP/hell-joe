"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { LOOSEN_MOVES, type LengthMin, type StretchId } from "@/lib/catalog";
import {
  BRACE_DOSE,
  BRACE_MOVE_IDS,
  afterExercisePause,
  afterExerciseWork,
  doseFor,
  exerciseMoveIds,
  getExercise,
  presetIdFor,
  replaceExerciseMove,
  skipExerciseMove,
  suggestedFamily,
  type ExercisePhase,
  type ExerciseSessionState,
} from "@/lib/exercise";
import {
  currentStreak,
  focusFor,
  isoDate,
  sessionMoveIds,
  startOfToday,
  type ExerciseChoice,
  type ExerciseFamily,
  type ExerciseMinutes,
  type Settings,
} from "@/lib/plan";
import {
  EMPTY_DATA,
  readStorage,
  storageKey,
  writeStorage,
  type ExerciseRecap,
  type FinishedExercise,
  type FinishedStretch,
  type SavedData,
} from "@/lib/storage";
import {
  advance as advanceSession,
  completeHold as completeSessionHold,
  finishedAfter,
  setSide as setSessionSide,
  skip as skipSession,
  replaceMove,
  type StretchRecap,
  type StretchSession,
} from "@/lib/stretch-session";

export type { ExerciseRecap, FinishedExercise as ExerciseFinished, FinishedStretch as FinishedSession };
export type { StretchRecap as Recap, StretchSession as Session } from "@/lib/stretch-session";
export type { Side } from "@/lib/stretch-session";
export type ExerciseSession = ExerciseSessionState;

type Store = {
  ready: boolean;
  settings: Settings;
  planPresetId: string;
  exerciseFamily: ExerciseFamily;
  session: StretchSession | null;
  finished: FinishedStretch[];
  recap: StretchRecap | null;
  lastReminder: string | null;
  exerciseSession: ExerciseSession | null;
  exerciseFinished: FinishedExercise[];
  exerciseRecap: ExerciseRecap | null;
  viewingRest: boolean;
  setViewingRest: (value: boolean) => void;
  saveSetup: (settings: Settings) => void;
  setLength: (length: LengthMin) => void;
  setPreset: (presetId: string) => void;
  startSession: (kind?: "daily" | "loosen") => void;
  startOver: () => void;
  completeHold: () => void;
  setSide: (side: StretchSession["side"]) => void;
  advance: () => void;
  skip: () => void;
  useAlternate: (id: StretchId) => void;
  markReminded: (date: string) => void;
  setExerciseOn: (on: boolean) => void;
  setExerciseOption: (option: ExerciseChoice) => void;
  setExerciseLength: (length: ExerciseMinutes) => void;
  setExerciseFamily: (family: ExerciseFamily) => void;
  acceptExerciseIntro: (choice: {
    on: boolean;
    option: ExerciseChoice;
    length: ExerciseMinutes;
  }) => void;
  startExercise: (kind?: "exercise" | "brace") => void;
  startExerciseOver: () => void;
  countExerciseRep: () => void;
  finishExerciseEffort: () => void;
  advanceExercisePause: () => void;
  skipExercise: () => void;
  useExerciseAlternate: (id: string) => void;
};

const StretchContext = createContext<Store | null>(null);

let snapshot: SavedData = EMPTY_DATA;
let clientReady = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function subscribeHydrated() {
  return () => {};
}

function remember(next: SavedData) {
  snapshot = next;
  writeStorage(window.localStorage, next);
  listeners.forEach((listener) => listener());
}

function update(recipe: (current: SavedData) => SavedData) {
  const next = recipe(snapshot);
  if (next === snapshot) return;
  remember(next);
}

function getSnapshot(): SavedData {
  if (!clientReady) {
    clientReady = true;
    const loaded = readStorage(window.localStorage, isoDate(startOfToday()));
    if (loaded) snapshot = loaded;
  }
  return snapshot;
}

function createExerciseSession(
  todayKey: string,
  settings: Settings,
  family: ExerciseFamily,
  kind: "exercise" | "brace",
): ExerciseSession {
  const brace = kind === "brace";
  const option: ExerciseChoice = brace ? "core" : settings.exerciseOption;
  const length = settings.exerciseLength;
  const dose = brace ? BRACE_DOSE : doseFor(option, length);
  const presetId = brace ? "brace" : presetIdFor(option, family);
  return {
    date: todayKey,
    kind,
    option,
    presetId,
    length,
    moveIds: brace ? [...BRACE_MOVE_IDS] : exerciseMoveIds(presetId, length),
    index: 0,
    setIndex: 0,
    sets: dose.sets,
    repsTarget: dose.reps,
    holdSeconds: dose.hold,
    restSeconds: dose.rest,
    side: "left",
    reps: 0,
    phase: "work" satisfies ExercisePhase,
    completed: [],
    skipped: [],
    status: "active",
  };
}

function buildExerciseRecap(
  session: ExerciseSession,
  finishedDates: string[],
  restDay: number,
  today: Date,
): ExerciseRecap {
  const completed = session.completed
    .map((id) => getExercise(id))
    .filter((move) => move !== undefined)
    .map((move) => ({ id: move.id, name: move.name, pattern: move.pattern }));
  const skipped = session.skipped
    .map((id) => getExercise(id))
    .filter((move) => move !== undefined)
    .map((move) => ({ id: move.id, name: move.name }));
  const patterns = [...new Set(completed.map((move) => move.pattern))];
  const counted = session.kind === "exercise" && completed.length > 0;
  const nextDates = counted ? [...new Set([...finishedDates, session.date])] : finishedDates;
  return {
    date: session.date,
    kind: session.kind,
    option: session.option,
    completed,
    skipped,
    patterns,
    streak: currentStreak(nextDates, restDay, today),
    counted,
  };
}

function settleExercise(current: SavedData, session: ExerciseSession, today: Date): SavedData {
  if (session.status !== "done") return { ...current, exerciseSession: session };
  const recap = buildExerciseRecap(
    session,
    current.exerciseFinished.map((entry) => entry.date),
    current.settings.restDay,
    today,
  );
  const exerciseFinished = recap.counted
    ? [
        ...current.exerciseFinished.filter((entry) => entry.date !== session.date),
        { date: session.date, patterns: recap.patterns, option: session.option },
      ]
    : current.exerciseFinished;
  return { ...current, exerciseSession: session, exerciseRecap: recap, exerciseFinished };
}

function withStretchStep(
  current: SavedData,
  step: ReturnType<typeof advanceSession>,
): SavedData {
  if (step.session === current.session) return current;
  return {
    ...current,
    session: step.session,
    recap: step.recap ?? current.recap,
    finished: finishedAfter(current.finished, step.recap),
  };
}

/** Moves the stored day forward once local midnight has passed, without a reload. */
function useToday(ready: boolean) {
  const [today, setToday] = useState(startOfToday);

  useEffect(() => {
    if (!ready) return;
    let midnightTimer: ReturnType<typeof setTimeout> | null = null;

    const check = () => {
      const next = startOfToday();
      setToday((current) => (isoDate(current) === isoDate(next) ? current : next));
      const delay = next.getTime() + 24 * 60 * 60 * 1000 - Date.now() + 1000;
      midnightTimer = setTimeout(check, Math.max(1000, delay));
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };

    check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      if (midnightTimer !== null) clearTimeout(midnightTimer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ready]);

  return today;
}

/** Applies a change saved by another tab of this app. */
function useOtherTabs() {
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey() || event.storageArea !== window.localStorage) return;
      const next = event.newValue ? readStorage(window.localStorage, isoDate(startOfToday())) : null;
      snapshot = next ?? EMPTY_DATA;
      listeners.forEach((listener) => listener());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
}

export function StretchProvider({ children }: { children: ReactNode }) {
  const data = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_DATA);
  const hydrated = useSyncExternalStore(subscribeHydrated, () => true, () => false);
  const [viewingRest, setViewingRest] = useState(false);
  const ready = hydrated;
  const today = useToday(ready);
  useOtherTabs();

  const todayKey = isoDate(today);
  const suggested = focusFor(today, data.settings).presetId;
  const planPresetId = data.plan?.date === todayKey ? data.plan.presetId : suggested;
  const exerciseFamily =
    data.exercisePlan?.date === todayKey
      ? data.exercisePlan.family
      : suggestedFamily(today, data.settings.restDay);

  const api = useMemo<Store>(() => {
    const liveSession =
      data.session?.date === todayKey && data.session.status === "active" ? data.session : null;
    const liveExercise =
      data.exerciseSession?.date === todayKey && data.exerciseSession.status === "active"
        ? data.exerciseSession
        : null;
    const finishedDates = () => data.finished.map((entry) => entry.date);

    return {
      ready,
      settings: data.settings,
      planPresetId,
      exerciseFamily,
      session: liveSession,
      finished: data.finished,
      recap: data.recap,
      lastReminder: data.lastReminder,
      exerciseSession: liveExercise,
      exerciseFinished: data.exerciseFinished,
      exerciseRecap: data.exerciseRecap,
      viewingRest,
      setViewingRest,
      saveSetup: (settings) => {
        update((current) => ({ ...current, settings }));
      },
      setLength: (length) => {
        if (liveSession) return;
        update((current) => ({ ...current, settings: { ...current.settings, length } }));
      },
      setPreset: (presetId) => {
        if (liveSession) return;
        update((current) => ({ ...current, plan: { date: todayKey, presetId } }));
      },
      startSession: (kind = "daily") => {
        const length = data.settings.length;
        const session: StretchSession = {
          date: todayKey,
          kind,
          presetId: kind === "loosen" ? "loosen" : planPresetId,
          length: kind === "loosen" ? 5 : length,
          moveIds: kind === "loosen" ? [...LOOSEN_MOVES] : sessionMoveIds(planPresetId, length),
          index: 0,
          side: "left",
          sides: {},
          held: [],
          skipped: [],
          status: "active",
        };
        update((current) => ({ ...current, session }));
      },
      startOver: () => {
        update((current) => ({ ...current, session: null }));
      },
      completeHold: () => {
        update((current) => {
          if (!current.session) return current;
          const session = completeSessionHold(current.session);
          return session === current.session ? current : { ...current, session };
        });
      },
      setSide: (side) => {
        update((current) => {
          if (!current.session) return current;
          const session = setSessionSide(current.session, side);
          return session === current.session ? current : { ...current, session };
        });
      },
      advance: () => {
        update((current) => {
          if (!current.session) return current;
          return withStretchStep(
            current,
            advanceSession(current.session, finishedDates(), current.settings, today),
          );
        });
      },
      skip: () => {
        update((current) => {
          if (!current.session) return current;
          return withStretchStep(
            current,
            skipSession(current.session, finishedDates(), current.settings, today),
          );
        });
      },
      useAlternate: (id) => {
        update((current) => {
          if (!current.session) return current;
          const session = replaceMove(current.session, id);
          return session === current.session ? current : { ...current, session };
        });
      },
      markReminded: (date) => {
        update((current) =>
          current.lastReminder === date ? current : { ...current, lastReminder: date },
        );
      },
      setExerciseOn: (on) => {
        update((current) => ({
          ...current,
          settings: { ...current.settings, exerciseOn: on, exerciseIntroSeen: true },
        }));
      },
      setExerciseOption: (option) => {
        if (liveExercise?.kind === "exercise") return;
        update((current) => ({
          ...current,
          settings: { ...current.settings, exerciseOption: option },
        }));
      },
      setExerciseLength: (length) => {
        if (liveExercise?.kind === "exercise") return;
        update((current) => ({
          ...current,
          settings: { ...current.settings, exerciseLength: length },
        }));
      },
      setExerciseFamily: (family) => {
        if (liveExercise?.kind === "exercise") return;
        update((current) => ({ ...current, exercisePlan: { date: todayKey, family } }));
      },
      acceptExerciseIntro: (choice) => {
        update((current) => ({
          ...current,
          settings: {
            ...current.settings,
            exerciseOn: choice.on,
            exerciseOption: choice.option,
            exerciseLength: choice.length,
            exerciseIntroSeen: true,
          },
        }));
      },
      startExercise: (kind = "exercise") => {
        const session = createExerciseSession(todayKey, data.settings, exerciseFamily, kind);
        update((current) => ({ ...current, exerciseSession: session }));
      },
      startExerciseOver: () => {
        update((current) => ({ ...current, exerciseSession: null }));
      },
      countExerciseRep: () => {
        update((current) => {
          const session = current.exerciseSession;
          if (!session || session.status !== "active" || session.phase !== "work") return current;
          const nextReps = session.reps + 1;
          if (nextReps >= session.repsTarget) {
            return settleExercise(current, afterExerciseWork({ ...session, reps: nextReps }), today);
          }
          return { ...current, exerciseSession: { ...session, reps: nextReps } };
        });
      },
      finishExerciseEffort: () => {
        update((current) => {
          const session = current.exerciseSession;
          if (!session || session.status !== "active" || session.phase !== "work") return current;
          return settleExercise(current, afterExerciseWork(session), today);
        });
      },
      advanceExercisePause: () => {
        update((current) => {
          const session = current.exerciseSession;
          if (!session || session.status !== "active" || session.phase === "work") return current;
          return settleExercise(current, afterExercisePause(session), today);
        });
      },
      skipExercise: () => {
        update((current) => {
          const session = current.exerciseSession;
          if (!session || session.status !== "active") return current;
          return settleExercise(current, skipExerciseMove(session), today);
        });
      },
      useExerciseAlternate: (id) => {
        update((current) => {
          const session = current.exerciseSession;
          if (!session || session.status !== "active") return current;
          return { ...current, exerciseSession: replaceExerciseMove(session, id) };
        });
      },
    };
  }, [data, exerciseFamily, planPresetId, ready, today, todayKey, viewingRest]);

  return <StretchContext.Provider value={api}>{children}</StretchContext.Provider>;
}

export function useStretch(): Store {
  const value = useContext(StretchContext);
  if (!value) {
    throw new Error("useStretch must be used within StretchProvider");
  }
  return value;
}

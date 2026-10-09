"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  LOOSEN_MOVES,
  type LengthMin,
  type StretchId,
  getStretch,
} from "@/lib/catalog";
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

const STORAGE_KEY = "tuengwa-v1";
const LEGACY_KEY = "stretchday-v1";

export type Side = "left" | "right";

export type Session = {
  date: string;
  kind: "daily" | "loosen";
  presetId: string;
  length: LengthMin;
  moveIds: string[];
  index: number;
  side: Side;
  sides: Record<string, { left: boolean; right: boolean }>;
  held: string[];
  skipped: string[];
  status: "active" | "done";
};

export type FinishedSession = {
  date: string;
  areas: string[];
};

export type Recap = {
  date: string;
  kind: "daily" | "loosen";
  held: { id: string; name: string; area: string }[];
  skipped: { id: string; name: string }[];
  areas: string[];
  streak: number;
  counted: boolean;
};

export type ExerciseSession = ExerciseSessionState;

export type ExerciseFinished = {
  date: string;
  patterns: string[];
  option: ExerciseChoice;
};

export type ExerciseRecap = {
  date: string;
  kind: "exercise" | "brace";
  option: ExerciseChoice;
  completed: { id: string; name: string; pattern: string }[];
  skipped: { id: string; name: string }[];
  patterns: string[];
  streak: number;
  counted: boolean;
};

type TodayPlan = {
  date: string;
  presetId: string;
};

type ExercisePlan = {
  date: string;
  family: ExerciseFamily;
};

type Data = {
  settings: Settings;
  plan: TodayPlan | null;
  session: Session | null;
  finished: FinishedSession[];
  recap: Recap | null;
  lastReminder: string | null;
  exercisePlan: ExercisePlan | null;
  exerciseSession: ExerciseSession | null;
  exerciseFinished: ExerciseFinished[];
  exerciseRecap: ExerciseRecap | null;
};

type Store = {
  ready: boolean;
  settings: Settings;
  planPresetId: string;
  exerciseFamily: ExerciseFamily;
  session: Session | null;
  finished: FinishedSession[];
  recap: Recap | null;
  lastReminder: string | null;
  exerciseSession: ExerciseSession | null;
  exerciseFinished: ExerciseFinished[];
  exerciseRecap: ExerciseRecap | null;
  viewingRest: boolean;
  setViewingRest: (value: boolean) => void;
  saveSetup: (settings: Settings) => void;
  setLength: (length: LengthMin) => void;
  setPreset: (presetId: string) => void;
  startSession: (kind?: "daily" | "loosen") => void;
  startOver: () => void;
  completeHold: () => void;
  setSide: (side: Side) => void;
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

const DEFAULT_SETTINGS: Settings = {
  setupDone: false,
  length: 10,
  tightAreas: [],
  restDay: 0,
  reminderOn: false,
  reminderTime: "08:00",
  exerciseOn: true,
  exerciseOption: "core",
  exerciseLength: 15,
  exerciseIntroSeen: false,
};

const SERVER_SNAPSHOT: Data = {
  settings: DEFAULT_SETTINGS,
  plan: null,
  session: null,
  finished: [],
  recap: null,
  lastReminder: null,
  exercisePlan: null,
  exerciseSession: null,
  exerciseFinished: [],
  exerciseRecap: null,
};

const StretchContext = createContext<Store | null>(null);

function isExerciseChoice(value: unknown): value is ExerciseChoice {
  return value === "core" || value === "muscle";
}

function isExerciseLength(value: unknown): value is ExerciseMinutes {
  return value === 10 || value === 15 || value === 20;
}

function isFamily(value: unknown): value is ExerciseFamily {
  return value === "front" || value === "side" || value === "all-fours" || value === "bridge";
}

function sanitizeSettings(value: Partial<Settings> | undefined): Settings {
  const length = value?.length === 5 || value?.length === 15 ? value.length : 10;
  const restDay =
    typeof value?.restDay === "number" && value.restDay >= 0 && value.restDay <= 6
      ? value.restDay
      : 0;
  const tightAreas = Array.isArray(value?.tightAreas)
    ? value.tightAreas.filter(
        (item): item is Settings["tightAreas"][number] =>
          item === "neck-shoulders" || item === "back" || item === "hips" || item === "legs",
      )
    : [];
  return {
    setupDone: Boolean(value?.setupDone),
    length,
    tightAreas,
    restDay,
    reminderOn: Boolean(value?.reminderOn),
    reminderTime: value?.reminderTime || "08:00",
    exerciseOn: value?.exerciseOn !== false,
    exerciseOption: isExerciseChoice(value?.exerciseOption) ? value.exerciseOption : "core",
    exerciseLength: isExerciseLength(value?.exerciseLength) ? value.exerciseLength : 15,
    exerciseIntroSeen: Boolean(value?.exerciseIntroSeen),
  };
}

function parseData(raw: string): Data | null {
  try {
    const parsed = JSON.parse(raw) as Partial<Data>;
    if (!parsed.settings) return null;
    const exercisePlan = parsed.exercisePlan;
    return {
      settings: sanitizeSettings(parsed.settings),
      plan:
        parsed.plan && parsed.plan.date && parsed.plan.presetId
          ? { date: parsed.plan.date, presetId: parsed.plan.presetId }
          : null,
      session: parsed.session ?? null,
      finished: Array.isArray(parsed.finished) ? parsed.finished : [],
      recap: parsed.recap ?? null,
      lastReminder: typeof parsed.lastReminder === "string" ? parsed.lastReminder : null,
      exercisePlan:
        exercisePlan && exercisePlan.date && isFamily(exercisePlan.family)
          ? { date: exercisePlan.date, family: exercisePlan.family }
          : null,
      exerciseSession: parsed.exerciseSession ?? null,
      exerciseFinished: Array.isArray(parsed.exerciseFinished) ? parsed.exerciseFinished : [],
      exerciseRecap: parsed.exerciseRecap ?? null,
    };
  } catch {
    return null;
  }
}

function readStorage(): Data | null {
  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current) return parseData(current);
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (!legacy) return null;
    const migrated = parseData(legacy);
    if (!migrated) return null;
    migrated.settings.exerciseIntroSeen = false;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return null;
  }
}

function emptySides() {
  return { left: false, right: false };
}

function dropStaleSession(loaded: Data, today: string) {
  let changed = false;
  if (loaded.session && loaded.session.date !== today && loaded.session.status === "active") {
    loaded.session = null;
    changed = true;
  }
  if (
    loaded.exerciseSession &&
    loaded.exerciseSession.date !== today &&
    loaded.exerciseSession.status === "active"
  ) {
    loaded.exerciseSession = null;
    changed = true;
  }
  if (changed) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
}

let snapshot: Data = SERVER_SNAPSHOT;
let clientReady = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function subscribeHydrated() {
  return () => {};
}

function remember(next: Data) {
  snapshot = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function update(recipe: (current: Data) => Data) {
  const next = recipe(snapshot);
  if (next === snapshot) return;
  remember(next);
}

function getSnapshot(): Data {
  if (!clientReady) {
    clientReady = true;
    const loaded = readStorage();
    if (loaded) {
      dropStaleSession(loaded, isoDate(startOfToday()));
      snapshot = loaded;
    }
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

export function StretchProvider({ children }: { children: ReactNode }) {
  const data = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
  const hydrated = useSyncExternalStore(subscribeHydrated, () => true, () => false);
  const [viewingRest, setViewingRest] = useState(false);
  const ready = hydrated;

  const today = startOfToday();
  const todayKey = isoDate(today);
  const suggested = focusFor(today, data.settings).presetId;
  const planPresetId =
    data.plan && data.plan.date === todayKey ? data.plan.presetId : suggested;
  const exerciseFamily =
    data.exercisePlan && data.exercisePlan.date === todayKey
      ? data.exercisePlan.family
      : suggestedFamily(today, data.settings.restDay);

  const api = useMemo<Store>(() => {
    const liveSession =
      data.session && data.session.date === todayKey && data.session.status === "active"
        ? data.session
        : null;
    const liveExercise =
      data.exerciseSession &&
      data.exerciseSession.date === todayKey &&
      data.exerciseSession.status === "active"
        ? data.exerciseSession
        : null;

    function buildRecap(session: Session, held: string[], skipped: string[]): Recap {
      const heldMoves = held
        .map((id) => getStretch(id))
        .filter((stretch) => stretch !== undefined)
        .map((stretch) => ({
          id: stretch.id,
          name: stretch.name,
          area: stretch.area,
        }));
      const skippedMoves = skipped
        .map((id) => getStretch(id))
        .filter((stretch) => stretch !== undefined)
        .map((stretch) => ({ id: stretch.id, name: stretch.name }));
      const areas = [...new Set(heldMoves.map((move) => move.area))];
      const counted = session.kind === "daily" && heldMoves.length > 0;
      const finishedDates = data.finished.map((entry) => entry.date);
      const nextDates = counted
        ? [...new Set([...finishedDates, session.date])]
        : finishedDates;
      return {
        date: session.date,
        kind: session.kind,
        held: heldMoves,
        skipped: skippedMoves,
        areas,
        streak: currentStreak(nextDates, data.settings.restDay, today),
        counted,
      };
    }

    function buildExerciseRecap(session: ExerciseSession): ExerciseRecap {
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
      const finishedDates = data.exerciseFinished.map((entry) => entry.date);
      const nextDates = counted
        ? [...new Set([...finishedDates, session.date])]
        : finishedDates;
      return {
        date: session.date,
        kind: session.kind,
        option: session.option,
        completed,
        skipped,
        patterns,
        streak: currentStreak(nextDates, data.settings.restDay, today),
        counted,
      };
    }

    function settleExercise(current: Data, session: ExerciseSession): Data {
      if (session.status !== "done") return { ...current, exerciseSession: session };
      const recap = buildExerciseRecap(session);
      const exerciseFinished = recap.counted
        ? [
            ...current.exerciseFinished.filter((entry) => entry.date !== session.date),
            { date: session.date, patterns: recap.patterns, option: session.option },
          ]
        : current.exerciseFinished;
      return { ...current, exerciseSession: session, exerciseRecap: recap, exerciseFinished };
    }

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
        update((current) => ({
          ...current,
          settings: { ...current.settings, length },
        }));
      },
      setPreset: (presetId) => {
        if (liveSession) return;
        update((current) => ({
          ...current,
          plan: { date: todayKey, presetId },
        }));
      },
      startSession: (kind = "daily") => {
        const length = data.settings.length;
        const moveIds =
          kind === "loosen" ? [...LOOSEN_MOVES] : sessionMoveIds(planPresetId, length);
        const session: Session = {
          date: todayKey,
          kind,
          presetId: kind === "loosen" ? "loosen" : planPresetId,
          length: kind === "loosen" ? 5 : length,
          moveIds,
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
          const session = current.session;
          if (!session || session.status !== "active") return current;
          const id = session.moveIds[session.index];
          const stretch = getStretch(id);
          const prev = session.sides[id] ?? emptySides();
          const sides = {
            ...session.sides,
            [id]: stretch?.sided
              ? { ...prev, [session.side]: true }
              : { left: true, right: true },
          };
          return { ...current, session: { ...session, sides } };
        });
      },
      setSide: (side) => {
        update((current) => {
          if (!current.session || current.session.status !== "active") return current;
          return { ...current, session: { ...current.session, side } };
        });
      },
      advance: () => {
        update((current) => {
          const session = current.session;
          if (!session || session.status !== "active") return current;
          const id = session.moveIds[session.index];
          const held = session.held.includes(id) ? session.held : [...session.held, id];
          if (session.index >= session.moveIds.length - 1) {
            const recap = buildRecap(session, held, session.skipped);
            const finished = recap.counted
              ? [
                  ...current.finished.filter((entry) => entry.date !== session.date),
                  { date: session.date, areas: recap.areas },
                ]
              : current.finished;
            return {
              ...current,
              finished,
              recap,
              session: { ...session, held, status: "done" },
            };
          }
          return {
            ...current,
            session: {
              ...session,
              held,
              index: session.index + 1,
              side: "left",
            },
          };
        });
      },
      skip: () => {
        update((current) => {
          const session = current.session;
          if (!session || session.status !== "active") return current;
          const id = session.moveIds[session.index];
          const skipped = session.skipped.includes(id)
            ? session.skipped
            : [...session.skipped, id];
          if (session.index >= session.moveIds.length - 1) {
            const recap = buildRecap(session, session.held, skipped);
            const finished = recap.counted
              ? [
                  ...current.finished.filter((entry) => entry.date !== session.date),
                  { date: session.date, areas: recap.areas },
                ]
              : current.finished;
            return {
              ...current,
              finished,
              recap,
              session: { ...session, skipped, status: "done" },
            };
          }
          return {
            ...current,
            session: {
              ...session,
              skipped,
              index: session.index + 1,
              side: "left",
            },
          };
        });
      },
      useAlternate: (id) => {
        update((current) => {
          const session = current.session;
          if (!session || session.status !== "active") return current;
          const moveIds = [...session.moveIds];
          moveIds[session.index] = id;
          for (let index = session.index + 1; index < moveIds.length; index += 1) {
            if (moveIds[index] === id) {
              moveIds.splice(index, 1);
              break;
            }
          }
          const sides = { ...session.sides };
          delete sides[id];
          return {
            ...current,
            session: { ...session, moveIds, side: "left", sides },
          };
        });
      },
      markReminded: (date) => {
        update((current) => {
          if (current.lastReminder === date) return current;
          return { ...current, lastReminder: date };
        });
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
        update((current) => ({
          ...current,
          exercisePlan: { date: todayKey, family },
        }));
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
            return settleExercise(current, afterExerciseWork({ ...session, reps: nextReps }));
          }
          return { ...current, exerciseSession: { ...session, reps: nextReps } };
        });
      },
      finishExerciseEffort: () => {
        update((current) => {
          const session = current.exerciseSession;
          if (!session || session.status !== "active" || session.phase !== "work") return current;
          return settleExercise(current, afterExerciseWork(session));
        });
      },
      advanceExercisePause: () => {
        update((current) => {
          const session = current.exerciseSession;
          if (!session || session.status !== "active" || session.phase === "work") return current;
          return settleExercise(current, afterExercisePause(session));
        });
      },
      skipExercise: () => {
        update((current) => {
          const session = current.exerciseSession;
          if (!session || session.status !== "active") return current;
          return settleExercise(current, skipExerciseMove(session));
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
    // today is derived from todayKey for the open session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, exerciseFamily, planPresetId, ready, todayKey, viewingRest]);

  return <StretchContext.Provider value={api}>{children}</StretchContext.Provider>;
}

export function useStretch(): Store {
  const value = useContext(StretchContext);
  if (!value) {
    throw new Error("useStretch must be used within StretchProvider");
  }
  return value;
}

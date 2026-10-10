import type { ExerciseSessionState } from "@/lib/exercise";
import type { ExerciseChoice, ExerciseFamily, ExerciseMinutes, Settings } from "@/lib/plan";
import type { StretchRecap, StretchSession } from "@/lib/stretch-session";

const STORAGE_KEY = "tuengwa-v1";
const LEGACY_KEY = "stretchday-v1";

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

export type FinishedStretch = { date: string; areas: string[] };
export type FinishedExercise = { date: string; patterns: string[]; option: ExerciseChoice };

type TodayPlan = { date: string; presetId: string };
type ExercisePlan = { date: string; family: ExerciseFamily };

export type SavedData = {
  settings: Settings;
  plan: TodayPlan | null;
  session: StretchSession | null;
  finished: FinishedStretch[];
  recap: StretchRecap | null;
  lastReminder: string | null;
  exercisePlan: ExercisePlan | null;
  exerciseSession: ExerciseSessionState | null;
  exerciseFinished: FinishedExercise[];
  exerciseRecap: ExerciseRecap | null;
};

export const DEFAULT_SETTINGS: Settings = {
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

export const EMPTY_DATA: SavedData = {
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

const TIGHT = ["neck-shoulders", "back", "hips", "legs"] as const;
const AREAS = ["neck", "shoulders", "chest", "upper-back", "lower-back", "hips", "glutes", "legs"];
const PATTERNS = ["front", "side", "all-fours", "bridge", "push", "legs"];
const FAMILIES = ["front", "side", "all-fours", "bridge"];
const PHASES = ["work", "side-pause", "rest", "move-pause"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isChoice(value: unknown): value is ExerciseChoice {
  return value === "core" || value === "muscle";
}

function isLength(value: unknown): value is ExerciseMinutes {
  return value === 10 || value === 15 || value === 20;
}

function stringList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) return null;
  return value as string[];
}

function namedList(value: unknown, extra: string[] = []): { id: string; name: string }[] | null {
  if (!Array.isArray(value)) return null;
  const result: { id: string; name: string }[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.id !== "string" || typeof item.name !== "string") return null;
    for (const key of extra) {
      if (typeof item[key] !== "string") return null;
    }
    result.push(item as { id: string; name: string });
  }
  return result;
}

export function sanitizeSettings(value: unknown): Settings {
  const raw = isRecord(value) ? value : {};
  const length = raw.length === 5 || raw.length === 15 ? raw.length : 10;
  const restDay =
    typeof raw.restDay === "number" && raw.restDay >= 0 && raw.restDay <= 6 ? raw.restDay : 0;
  const tightAreas = Array.isArray(raw.tightAreas)
    ? raw.tightAreas.filter((item): item is Settings["tightAreas"][number] =>
        (TIGHT as readonly string[]).includes(item as string),
      )
    : [];
  return {
    setupDone: Boolean(raw.setupDone),
    length,
    tightAreas,
    restDay,
    reminderOn: Boolean(raw.reminderOn),
    reminderTime: typeof raw.reminderTime === "string" && raw.reminderTime ? raw.reminderTime : "08:00",
    exerciseOn: raw.exerciseOn !== false,
    exerciseOption: isChoice(raw.exerciseOption) ? raw.exerciseOption : "core",
    exerciseLength: isLength(raw.exerciseLength) ? raw.exerciseLength : 15,
    exerciseIntroSeen: Boolean(raw.exerciseIntroSeen),
  };
}

function session(value: unknown): StretchSession | null {
  if (!isRecord(value)) return null;
  const moveIds = stringList(value.moveIds);
  const held = stringList(value.held);
  const skipped = stringList(value.skipped);
  if (!moveIds || !held || !skipped) return null;
  if (!isDate(value.date) || (value.kind !== "daily" && value.kind !== "loosen")) return null;
  if (typeof value.presetId !== "string") return null;
  if (value.length !== 5 && value.length !== 10 && value.length !== 15) return null;
  if (typeof value.index !== "number" || value.index < 0 || value.index >= moveIds.length) return null;
  if (value.side !== "left" && value.side !== "right") return null;
  if (value.status !== "active" && value.status !== "done") return null;
  if (!isRecord(value.sides)) return null;
  const sides: StretchSession["sides"] = {};
  for (const [id, entry] of Object.entries(value.sides)) {
    if (!isRecord(entry) || typeof entry.left !== "boolean" || typeof entry.right !== "boolean") {
      return null;
    }
    sides[id] = { left: entry.left, right: entry.right };
  }
  return {
    date: value.date,
    kind: value.kind,
    presetId: value.presetId,
    length: value.length,
    moveIds,
    index: value.index,
    side: value.side,
    sides,
    held,
    skipped,
    status: value.status,
  };
}

function exerciseSession(value: unknown): ExerciseSessionState | null {
  if (!isRecord(value)) return null;
  const moveIds = stringList(value.moveIds);
  const completed = stringList(value.completed);
  const skipped = stringList(value.skipped);
  if (!moveIds || moveIds.length === 0 || !completed || !skipped) return null;
  if (!isDate(value.date) || (value.kind !== "exercise" && value.kind !== "brace")) return null;
  if (!isChoice(value.option) || typeof value.presetId !== "string") return null;
  if (!isLength(value.length)) return null;
  const numbers = ["index", "setIndex", "sets", "repsTarget", "holdSeconds", "restSeconds", "reps"];
  if (numbers.some((key) => typeof value[key] !== "number" || (value[key] as number) < 0)) return null;
  if ((value.index as number) >= moveIds.length) return null;
  if (value.side !== "left" && value.side !== "right") return null;
  if (!PHASES.includes(value.phase as string)) return null;
  if (value.status !== "active" && value.status !== "done") return null;
  return value as ExerciseSessionState;
}

function stretchRecap(value: unknown): StretchRecap | null {
  if (!isRecord(value) || !isDate(value.date)) return null;
  if (value.kind !== "daily" && value.kind !== "loosen") return null;
  const held = namedList(value.held, ["area"]);
  const skipped = namedList(value.skipped);
  if (!held || !skipped || !stringList(value.areas)) return null;
  if (typeof value.streak !== "number" || typeof value.counted !== "boolean") return null;
  return value as StretchRecap;
}

function exerciseRecap(value: unknown): ExerciseRecap | null {
  if (!isRecord(value) || !isDate(value.date)) return null;
  if (value.kind !== "exercise" && value.kind !== "brace") return null;
  if (!isChoice(value.option)) return null;
  const completed = namedList(value.completed, ["pattern"]);
  const skipped = namedList(value.skipped);
  if (!completed || !skipped || !stringList(value.patterns)) return null;
  if (typeof value.streak !== "number" || typeof value.counted !== "boolean") return null;
  return value as ExerciseRecap;
}

function finishedStretches(value: unknown): FinishedStretch[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is FinishedStretch =>
      isRecord(entry) &&
      isDate(entry.date) &&
      Array.isArray(entry.areas) &&
      entry.areas.every((area) => typeof area === "string" && (AREAS.includes(area) || area === "")),
  );
}

function finishedExercises(value: unknown): FinishedExercise[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is FinishedExercise =>
      isRecord(entry) &&
      isDate(entry.date) &&
      isChoice(entry.option) &&
      Array.isArray(entry.patterns) &&
      entry.patterns.every((pattern) => typeof pattern === "string" && PATTERNS.includes(pattern)),
  );
}

/** Reads saved JSON. Anything with a broken shape is dropped rather than passed through. */
export function parseData(raw: string): SavedData | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isRecord(parsed.settings)) return null;
    const plan = isRecord(parsed.plan) && isDate(parsed.plan.date) && typeof parsed.plan.presetId === "string"
      ? { date: parsed.plan.date, presetId: parsed.plan.presetId }
      : null;
    const exercisePlan =
      isRecord(parsed.exercisePlan) &&
      isDate(parsed.exercisePlan.date) &&
      FAMILIES.includes(parsed.exercisePlan.family as string)
        ? { date: parsed.exercisePlan.date, family: parsed.exercisePlan.family as ExerciseFamily }
        : null;
    return {
      settings: sanitizeSettings(parsed.settings),
      plan,
      session: session(parsed.session),
      finished: finishedStretches(parsed.finished),
      recap: stretchRecap(parsed.recap),
      lastReminder: typeof parsed.lastReminder === "string" ? parsed.lastReminder : null,
      exercisePlan,
      exerciseSession: exerciseSession(parsed.exerciseSession),
      exerciseFinished: finishedExercises(parsed.exerciseFinished),
      exerciseRecap: exerciseRecap(parsed.exerciseRecap),
    };
  } catch {
    return null;
  }
}

/** A session left open from an earlier day cannot be resumed. */
export function dropStaleSessions(data: SavedData, today: string): SavedData {
  const session = data.session?.date === today || data.session?.status !== "active" ? data.session : null;
  const exerciseSession =
    data.exerciseSession?.date === today || data.exerciseSession?.status !== "active"
      ? data.exerciseSession
      : null;
  if (session === data.session && exerciseSession === data.exerciseSession) return data;
  return { ...data, session, exerciseSession };
}

export function readStorage(storage: Storage, today: string): SavedData | null {
  const current = storage.getItem(STORAGE_KEY);
  if (current) {
    const parsed = parseData(current);
    if (!parsed) return null;
    const fresh = dropStaleSessions(parsed, today);
    if (fresh !== parsed) writeStorage(storage, fresh);
    return fresh;
  }
  const legacy = storage.getItem(LEGACY_KEY);
  if (!legacy) return null;
  const migrated = parseData(legacy);
  if (!migrated) return null;
  const data = dropStaleSessions(
    { ...migrated, settings: { ...migrated.settings, exerciseIntroSeen: false } },
    today,
  );
  writeStorage(storage, data);
  return data;
}

/** Keeps the data in memory when the browser refuses to store it. */
export function writeStorage(storage: Storage, data: SavedData): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function storageKey() {
  return STORAGE_KEY;
}

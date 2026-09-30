import {
  PRESETS,
  type LengthMin,
  type PresetId,
  type TightId,
  areaIdFrom,
  getPreset,
  movesForLength,
} from "@/lib/catalog";

export type Settings = {
  setupDone: boolean;
  length: LengthMin;
  tightAreas: TightId[];
  restDay: number;
  reminderOn: boolean;
  reminderTime: string;
};

export type FocusKey = "neck-shoulders" | "hips" | "back" | "legs" | "full-body" | "rest";

export type Focus = {
  key: FocusKey;
  presetId: PresetId;
  rest: boolean;
};

const ROTATION: { key: FocusKey; presetId: PresetId }[] = [
  { key: "neck-shoulders", presetId: "desk-reset" },
  { key: "hips", presetId: "hips-and-back" },
  { key: "back", presetId: "hips-and-back" },
  { key: "legs", presetId: "after-sitting" },
  { key: "full-body", presetId: "morning-loosen" },
];

export function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function presetForTight(id: TightId): PresetId {
  if (id === "neck-shoulders") return "desk-reset";
  if (id === "legs") return "after-sitting";
  return "hips-and-back";
}

export function weekDates(today: Date): Date[] {
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = addDays(today, mondayOffset);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

export function stretchIndex(date: Date, restDay: number): number {
  const key = isoDate(date);
  let index = 0;
  for (const cursor of weekDates(date)) {
    if (cursor.getDay() === restDay) continue;
    if (isoDate(cursor) === key) return index;
    index += 1;
  }
  return 0;
}

function extraTight(date: Date, tightAreas: TightId[]): TightId | null {
  if (tightAreas.length === 0) return null;
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const weeks = Math.floor(utc / (7 * 24 * 60 * 60 * 1000));
  const index = ((weeks % tightAreas.length) + tightAreas.length) % tightAreas.length;
  return tightAreas[index] ?? null;
}

export function focusFor(
  date: Date,
  settings: Pick<Settings, "restDay" | "tightAreas">,
): Focus {
  if (date.getDay() === settings.restDay) {
    return { key: "rest", presetId: "hips-and-back", rest: true };
  }
  const index = stretchIndex(date, settings.restDay);
  if (index >= ROTATION.length) {
    const tight = extraTight(date, settings.tightAreas);
    if (!tight) {
      return { key: "full-body", presetId: "morning-loosen", rest: false };
    }
    return { key: tight, presetId: presetForTight(tight), rest: false };
  }
  const slot = ROTATION[index] ?? ROTATION[0];
  return { key: slot.key, presetId: slot.presetId, rest: false };
}

export function nextStretchDate(from: Date, restDay: number): Date {
  let cursor = addDays(from, 1);
  for (let step = 0; step < 7; step += 1) {
    if (cursor.getDay() !== restDay) return cursor;
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

export function currentStreak(
  finishedDates: string[],
  restDay: number,
  today: Date,
): number {
  const finished = new Set(finishedDates);
  let cursor = new Date(today);
  if (cursor.getDay() !== restDay && !finished.has(isoDate(cursor))) {
    cursor = addDays(cursor, -1);
  }
  let count = 0;
  for (let step = 0; step < 370; step += 1) {
    if (cursor.getDay() === restDay) {
      cursor = addDays(cursor, -1);
      continue;
    }
    if (finished.has(isoDate(cursor))) {
      count += 1;
      cursor = addDays(cursor, -1);
      continue;
    }
    break;
  }
  return count;
}

export function recentAreas(
  finished: { date: string; areas: string[] }[],
  today: Date,
): string[] {
  const start = isoDate(addDays(today, -6));
  const end = isoDate(today);
  const seen: string[] = [];
  for (const entry of finished) {
    if (entry.date < start || entry.date > end) continue;
    for (const value of entry.areas) {
      const area = areaIdFrom(value) ?? value;
      if (!seen.includes(area)) seen.push(area);
    }
  }
  return seen;
}

export function suggestedPresetId(today: Date, settings: Settings): PresetId {
  return focusFor(today, settings).presetId;
}

export function sessionMoveIds(presetId: string, length: LengthMin): string[] {
  const preset = getPreset(presetId) ?? PRESETS[2];
  return movesForLength(preset.order, length);
}

export function isShortPreset(moveCount: number, length: LengthMin): boolean {
  const expected = length === 5 ? 4 : length === 10 ? 6 : 8;
  return moveCount < expected;
}

export function weekProgress(
  today: Date,
  restDay: number,
  finishedDates: string[],
): { done: number; total: number } {
  const days = weekDates(today).filter((date) => date.getDay() !== restDay);
  const finished = new Set(finishedDates);
  return {
    done: days.filter((date) => finished.has(isoDate(date))).length,
    total: days.length,
  };
}

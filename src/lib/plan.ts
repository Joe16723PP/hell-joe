import {
  PRESETS,
  WEEKDAY_NAMES,
  type LengthMin,
  type PresetId,
  type TightId,
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

export type Focus = {
  label: string;
  presetId: PresetId;
  rest: boolean;
};

const ROTATION: Record<number, { label: string; presetId: PresetId }> = {
  0: { label: "Rest", presetId: "hips-and-back" },
  1: { label: "Neck and shoulders", presetId: "desk-reset" },
  2: { label: "Back", presetId: "hips-and-back" },
  3: { label: "Hips", presetId: "hips-and-back" },
  4: { label: "Legs", presetId: "after-sitting" },
  5: { label: "Full body", presetId: "morning-loosen" },
  6: { label: "Full body", presetId: "morning-loosen" },
};

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

export function weekdayName(day: number): string {
  return WEEKDAY_NAMES[day] ?? "Sunday";
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function presetForTight(id: TightId): PresetId {
  if (id === "neck-shoulders") return "desk-reset";
  if (id === "legs") return "after-sitting";
  return "hips-and-back";
}

export function focusFor(
  date: Date,
  settings: Pick<Settings, "restDay" | "tightAreas">,
): Focus {
  if (date.getDay() === settings.restDay) {
    return { label: "Rest", presetId: "hips-and-back", rest: true };
  }
  if (date.getDay() === 6 && settings.tightAreas.length > 0) {
    const tight = settings.tightAreas[0];
    const label =
      tight === "neck-shoulders"
        ? "Neck and shoulders"
        : tight === "back"
          ? "Back"
          : tight === "hips"
            ? "Hips"
            : "Legs";
    return { label, presetId: presetForTight(tight), rest: false };
  }
  const slot = ROTATION[date.getDay()] ?? ROTATION[3];
  return { label: slot.label, presetId: slot.presetId, rest: false };
}

export function shortFocus(label: string, rest: boolean): string {
  if (rest) return "Rest";
  if (label === "Neck and shoulders") return "Neck";
  if (label === "Full body") return "Full";
  return label;
}

export function weekDates(today: Date): Date[] {
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = addDays(today, mondayOffset);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

export function nextStretchDate(from: Date, restDay: number): Date {
  let cursor = addDays(from, 1);
  for (let step = 0; step < 7; step += 1) {
    if (cursor.getDay() !== restDay) return cursor;
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

export function tomorrowLine(today: Date, settings: Settings): string {
  const next = addDays(today, 1);
  const focus = focusFor(next, settings);
  if (focus.rest) return "Tomorrow: rest day.";
  return `Tomorrow: ${focus.label.toLowerCase()}, about ${settings.length} minutes.`;
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

export function suggestedPresetId(today: Date, settings: Settings): PresetId {
  return focusFor(today, settings).presetId;
}

export function sessionMoveIds(presetId: string, length: LengthMin): string[] {
  const preset = getPreset(presetId) ?? PRESETS[2];
  return movesForLength(preset.order, length);
}

export function lengthNote(moveCount: number, length: LengthMin): string | null {
  const expected = length === 5 ? 4 : length === 10 ? 6 : 8;
  if (moveCount >= expected) return null;
  return "This preset stays shorter. The holds run longer instead of adding moves.";
}

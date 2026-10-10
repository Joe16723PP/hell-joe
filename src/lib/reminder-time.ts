import { isoDate } from "@/lib/plan";

export type ReminderCheck = {
  now: Date;
  today: Date;
  rest: boolean;
  reminderOn: boolean;
  reminderTime: string;
  lastReminder: string | null;
  stretchDone: boolean;
  exerciseOn: boolean;
  exerciseDone: boolean;
};

export type ReminderNotice = {
  date: string;
  exercise: boolean;
};

/**
 * A reminder is due when the app is open at or after the reminder time on a
 * stretch day that is not finished yet, and none has gone out today.
 * The exercise is mentioned only while its card is on and today's exercise is still open.
 */
export function reminderDue(check: ReminderCheck): ReminderNotice | null {
  if (!check.reminderOn || check.rest) return null;
  const [hourText, minuteText] = check.reminderTime.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  const due = new Date(check.today);
  due.setHours(hour, minute, 0, 0);
  if (check.now < due) return null;
  const date = isoDate(check.today);
  if (check.lastReminder === date) return null;
  if (check.stretchDone && (!check.exerciseOn || check.exerciseDone)) return null;
  return { date, exercise: check.exerciseOn && !check.exerciseDone };
}

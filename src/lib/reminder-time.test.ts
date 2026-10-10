import { describe, expect, it } from "vitest";
import { reminderDue, type ReminderCheck } from "@/lib/reminder-time";

const today = new Date(2026, 9, 9);

function check(overrides: Partial<ReminderCheck> = {}): ReminderCheck {
  return {
    now: new Date(2026, 9, 9, 8, 30),
    today,
    rest: false,
    reminderOn: true,
    reminderTime: "08:00",
    lastReminder: null,
    stretchDone: false,
    exerciseOn: true,
    exerciseDone: false,
    ...overrides,
  };
}

describe("reminderDue", () => {
  it("is due after the reminder time when today is not done", () => {
    expect(reminderDue(check())).toEqual({ date: "2026-10-09", exercise: true });
  });

  it("waits until the reminder time", () => {
    expect(reminderDue(check({ now: new Date(2026, 9, 9, 7, 59) }))).toBeNull();
  });

  it("is due at the exact minute", () => {
    expect(reminderDue(check({ now: new Date(2026, 9, 9, 8, 0) }))?.date).toBe("2026-10-09");
  });

  it("stays quiet on a rest day, when reminders are off, or after one went out", () => {
    expect(reminderDue(check({ rest: true }))).toBeNull();
    expect(reminderDue(check({ reminderOn: false }))).toBeNull();
    expect(reminderDue(check({ lastReminder: "2026-10-09" }))).toBeNull();
  });

  it("ignores a reminder time it cannot read", () => {
    expect(reminderDue(check({ reminderTime: "morning" }))).toBeNull();
  });

  it("mentions the exercise only while its card is on and it is not done", () => {
    expect(reminderDue(check({ exerciseOn: false }))).toEqual({
      date: "2026-10-09",
      exercise: false,
    });
    expect(reminderDue(check({ exerciseDone: true }))?.exercise).toBe(false);
  });

  it("stays quiet once both sessions are done", () => {
    expect(reminderDue(check({ stretchDone: true, exerciseDone: true }))).toBeNull();
  });

  it("still reminds when only the exercise is left", () => {
    expect(reminderDue(check({ stretchDone: true }))).toEqual({
      date: "2026-10-09",
      exercise: true,
    });
  });
});

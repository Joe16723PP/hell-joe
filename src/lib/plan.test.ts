import { describe, expect, it } from "vitest";
import { PRESETS, type LengthMin } from "@/lib/catalog";
import {
  currentStreak,
  focusFor,
  isShortPreset,
  isoDate,
  nextStretchDate,
  sessionMoveIds,
  stretchIndex,
  weekDates,
  weekProgress,
} from "@/lib/plan";

// October 2026: Monday the 5th through Sunday the 11th.
const day = (month: number, date: number, year = 2026) => new Date(year, month - 1, date);
const SUNDAY = 0;
const MONDAY = 1;

describe("currentStreak", () => {
  it("skips the rest day without breaking the streak", () => {
    const finished = ["2026-10-06", "2026-10-05", "2026-10-03", "2026-10-02"];
    expect(currentStreak(finished, SUNDAY, day(10, 6))).toBe(4);
  });

  it("counts from yesterday when today is not done yet", () => {
    expect(currentStreak(["2026-10-05", "2026-10-03"], SUNDAY, day(10, 6))).toBe(2);
  });

  it("stops at a missed stretch day", () => {
    const finished = ["2026-10-06", "2026-10-05", "2026-10-02"];
    expect(currentStreak(finished, SUNDAY, day(10, 6))).toBe(2);
  });

  it("keeps the streak when today is the rest day", () => {
    expect(currentStreak(["2026-10-03", "2026-10-02"], SUNDAY, day(10, 4))).toBe(2);
    expect(currentStreak([], SUNDAY, day(10, 4))).toBe(0);
  });

  it("carries across the new year", () => {
    const finished = [
      "2027-01-02",
      "2027-01-01",
      "2026-12-31",
      "2026-12-30",
      "2026-12-29",
      "2026-12-28",
      "2026-12-26",
    ];
    expect(currentStreak(finished, SUNDAY, day(1, 2, 2027))).toBe(7);
  });

  it("returns 0 with nothing finished", () => {
    expect(currentStreak([], SUNDAY, day(10, 6))).toBe(0);
  });
});

describe("weekDates", () => {
  it("starts on Monday", () => {
    expect(weekDates(day(10, 7)).map(isoDate)).toEqual([
      "2026-10-05",
      "2026-10-06",
      "2026-10-07",
      "2026-10-08",
      "2026-10-09",
      "2026-10-10",
      "2026-10-11",
    ]);
  });

  it("puts Sunday at the end of the week that began on Monday", () => {
    expect(isoDate(weekDates(day(10, 11))[0])).toBe("2026-10-05");
  });
});

describe("weekProgress", () => {
  const finished = ["2026-10-05", "2026-10-06", "2026-10-04"];

  it("leaves Sunday out when Sunday is the rest day", () => {
    expect(weekProgress(day(10, 7), SUNDAY, finished)).toEqual({ done: 2, total: 6 });
  });

  it("leaves Monday out when Monday is the rest day", () => {
    expect(weekProgress(day(10, 7), MONDAY, finished)).toEqual({ done: 1, total: 6 });
  });
});

describe("focusFor and stretchIndex", () => {
  const rotation = ["neck-shoulders", "hips", "back", "legs", "full-body"];

  for (let restDay = 0; restDay <= 6; restDay += 1) {
    it(`follows the rotation with rest day ${restDay}`, () => {
      const week = weekDates(day(10, 7));
      const stretchDays = week.filter((date) => date.getDay() !== restDay);
      expect(stretchDays.map((date) => stretchIndex(date, restDay))).toEqual([0, 1, 2, 3, 4, 5]);

      const keys = stretchDays.map((date) => focusFor(date, { restDay, tightAreas: [] }).key);
      expect(keys).toEqual([...rotation, "full-body"]);

      const rest = week.find((date) => date.getDay() === restDay)!;
      expect(focusFor(rest, { restDay, tightAreas: [] })).toMatchObject({ key: "rest", rest: true });
    });
  }

  it("uses a tight area for the extra day", () => {
    const sunday = day(10, 11);
    expect(focusFor(sunday, { restDay: MONDAY, tightAreas: ["legs"] })).toEqual({
      key: "legs",
      presetId: "after-sitting",
      rest: false,
    });
    expect(focusFor(sunday, { restDay: MONDAY, tightAreas: ["neck-shoulders"] }).presetId).toBe(
      "desk-reset",
    );
  });

  it("falls back to the full-body wake-up for the extra day without tight areas", () => {
    expect(focusFor(day(10, 11), { restDay: MONDAY, tightAreas: [] })).toEqual({
      key: "full-body",
      presetId: "morning-loosen",
      rest: false,
    });
  });

  it("rotates through tight areas week by week", () => {
    const settings = { restDay: MONDAY, tightAreas: ["hips", "legs"] as ("hips" | "legs")[] };
    const first = focusFor(day(10, 11), settings).key;
    const second = focusFor(day(10, 18), settings).key;
    expect(new Set([first, second])).toEqual(new Set(["hips", "legs"]));
  });
});

describe("nextStretchDate", () => {
  it("returns tomorrow on a normal day", () => {
    expect(isoDate(nextStretchDate(day(10, 9), SUNDAY))).toBe("2026-10-10");
  });

  it("skips the rest day", () => {
    expect(isoDate(nextStretchDate(day(10, 10), SUNDAY))).toBe("2026-10-12");
  });
});

describe("sessionMoveIds and isShortPreset", () => {
  const expected: Record<LengthMin, number> = { 5: 4, 10: 6, 15: 8 };

  for (const preset of PRESETS) {
    for (const length of [5, 10, 15] as LengthMin[]) {
      it(`${preset.id} at ${length} minutes`, () => {
        const ids = sessionMoveIds(preset.id, length);
        expect(ids).toEqual(preset.order.slice(0, expected[length]));
        expect(isShortPreset(ids.length, length)).toBe(preset.order.length < expected[length]);
      });
    }
  }

  it("falls back to hips and back for an unknown preset", () => {
    expect(sessionMoveIds("nope", 10)).toEqual(sessionMoveIds("hips-and-back", 10));
  });

  it("flags a preset that runs short", () => {
    expect(isShortPreset(3, 5)).toBe(true);
    expect(isShortPreset(4, 5)).toBe(false);
    expect(isShortPreset(5, 10)).toBe(true);
    expect(isShortPreset(7, 15)).toBe(true);
    expect(isShortPreset(8, 15)).toBe(false);
  });
});

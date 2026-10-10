import { describe, expect, it } from "vitest";
import { EMPTY_PROGRESS } from "@/lib/barbell";
import { openSession } from "@/lib/barbell-session";
import { EMPTY_DATA, dropStaleSessions, parseData, readStorage, writeStorage, type SavedData } from "@/lib/storage";

class MemoryStorage implements Storage {
  private items = new Map<string, string>();
  fail = false;

  get length() {
    return this.items.size;
  }

  key(index: number) {
    return [...this.items.keys()][index] ?? null;
  }

  getItem(key: string) {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    if (this.fail) throw new Error("quota");
    this.items.set(key, value);
  }

  removeItem(key: string) {
    this.items.delete(key);
  }

  clear() {
    this.items.clear();
  }
}

function saved(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({ settings: { setupDone: true, length: 10 }, ...overrides });
}

const stretchSession = {
  date: "2026-10-09",
  kind: "daily",
  presetId: "desk-reset",
  length: 10,
  moveIds: ["neck"],
  index: 0,
  side: "left",
  sides: { neck: { left: true, right: false } },
  held: [],
  skipped: [],
  status: "active",
};

const exerciseSession = {
  date: "2026-10-09",
  kind: "exercise",
  option: "core",
  presetId: "front-brace",
  length: 15,
  moveIds: ["heel-tap"],
  index: 0,
  setIndex: 0,
  sets: 2,
  repsTarget: 8,
  holdSeconds: 25,
  restSeconds: 40,
  side: "left",
  reps: 0,
  phase: "work",
  completed: [],
  skipped: [],
  status: "active",
};

describe("parseData", () => {
  it("rejects damaged JSON and data with no settings", () => {
    expect(parseData("{")).toBeNull();
    expect(parseData("null")).toBeNull();
    expect(parseData("[]")).toBeNull();
    expect(parseData(JSON.stringify({ finished: [] }))).toBeNull();
  });

  it("fills in settings that an older version never saved", () => {
    const data = parseData(saved());
    expect(data?.settings).toMatchObject({
      setupDone: true,
      length: 10,
      exerciseOn: true,
      exerciseOption: "core",
      exerciseLength: 15,
      exerciseIntroSeen: false,
      reminderTime: "08:00",
    });
  });

  it("repairs settings values it does not recognise", () => {
    const data = parseData(
      saved({
        settings: {
          setupDone: 1,
          length: 99,
          restDay: 8,
          tightAreas: ["hips", "elbows", 4],
          reminderTime: "",
          exerciseOption: "cardio",
          exerciseLength: 30,
          exerciseOn: false,
        },
      }),
    );
    expect(data?.settings).toMatchObject({
      setupDone: true,
      length: 10,
      restDay: 0,
      tightAreas: ["hips"],
      reminderTime: "08:00",
      exerciseOption: "core",
      exerciseLength: 15,
      exerciseOn: false,
    });
  });

  it("keeps a well formed session and drops a broken one", () => {
    expect(parseData(saved({ session: stretchSession }))?.session).toEqual(stretchSession);
    expect(parseData(saved({ session: { ...stretchSession, index: 5 } }))?.session).toBeNull();
    expect(parseData(saved({ session: { ...stretchSession, side: "both" } }))?.session).toBeNull();
    expect(parseData(saved({ session: { ...stretchSession, date: "today" } }))?.session).toBeNull();
    expect(parseData(saved({ session: { ...stretchSession, held: [1] } }))?.session).toBeNull();
    expect(
      parseData(saved({ session: { ...stretchSession, sides: { neck: { left: 1 } } } }))?.session,
    ).toBeNull();
  });

  it("keeps a well formed exercise session and drops a broken one", () => {
    expect(parseData(saved({ exerciseSession }))?.exerciseSession).toEqual(exerciseSession);
    expect(parseData(saved({ exerciseSession: { ...exerciseSession, phase: "nap" } }))?.exerciseSession).toBeNull();
    expect(parseData(saved({ exerciseSession: { ...exerciseSession, moveIds: [] } }))?.exerciseSession).toBeNull();
    expect(parseData(saved({ exerciseSession: { ...exerciseSession, sets: -1 } }))?.exerciseSession).toBeNull();
  });

  it("keeps a well formed recap and drops one with missing fields", () => {
    const recap = {
      date: "2026-10-09",
      kind: "daily",
      held: [{ id: "neck", name: "Neck side bend", area: "neck" }],
      skipped: [{ id: "cat", name: "Cat" }],
      areas: ["neck"],
      streak: 3,
      counted: true,
    };
    expect(parseData(saved({ recap }))?.recap).toEqual(recap);
    expect(parseData(saved({ recap: { ...recap, held: [{ id: "neck" }] } }))?.recap).toBeNull();
    expect(parseData(saved({ recap: { ...recap, counted: "yes" } }))?.recap).toBeNull();

    const exerciseRecap = {
      date: "2026-10-09",
      kind: "exercise",
      option: "muscle",
      completed: [{ id: "slow-squat", name: "Slow squat", pattern: "legs" }],
      skipped: [],
      patterns: ["legs"],
      streak: 1,
      counted: true,
    };
    expect(parseData(saved({ exerciseRecap }))?.exerciseRecap).toEqual(exerciseRecap);
    expect(parseData(saved({ exerciseRecap: { ...exerciseRecap, option: "cardio" } }))?.exerciseRecap).toBeNull();
  });

  it("keeps only finished entries with a valid date", () => {
    const data = parseData(
      saved({
        finished: [
          { date: "2026-10-08", areas: ["hips"] },
          { date: "yesterday", areas: ["hips"] },
          { areas: ["hips"] },
          "2026-10-07",
          { date: "2026-10-07", areas: ["everywhere"] },
        ],
        exerciseFinished: [
          { date: "2026-10-08", patterns: ["front"], option: "core" },
          { date: "nope", patterns: ["front"], option: "core" },
          { date: "2026-10-07", patterns: ["front"], option: "cardio" },
        ],
      }),
    );
    expect(data?.finished).toEqual([{ date: "2026-10-08", areas: ["hips"] }]);
    expect(data?.exerciseFinished).toEqual([
      { date: "2026-10-08", patterns: ["front"], option: "core" },
    ]);
  });

  it("keeps a barbell session and drops a broken one", () => {
    const { session } = openSession("2026-10-09", "A", EMPTY_PROGRESS);
    expect(parseData(saved({ barbellSession: session }))?.barbellSession?.workout).toBe("A");
    expect(parseData(saved({ barbellSession: { date: "soon" } }))?.barbellSession).toBeNull();
    const data = parseData(saved({ barbellSession: session })) as SavedData;
    expect(dropStaleSessions(data, "2026-10-10").barbellSession).toBeNull();
    expect(dropStaleSessions(data, "2026-10-09").barbellSession?.date).toBe("2026-10-09");
  });

  it("drops plans that are missing a date or a known family", () => {
    const data = parseData(
      saved({
        plan: { date: "soon", presetId: "desk-reset" },
        exercisePlan: { date: "2026-10-09", family: "upside-down" },
      }),
    );
    expect(data?.plan).toBeNull();
    expect(data?.exercisePlan).toBeNull();
  });
});

describe("dropStaleSessions", () => {
  const base = parseData(
    saved({ session: stretchSession, exerciseSession }),
  ) as SavedData;

  it("clears an active session from another day", () => {
    const next = dropStaleSessions(base, "2026-10-10");
    expect(next.session).toBeNull();
    expect(next.exerciseSession).toBeNull();
  });

  it("keeps today's session and a finished session from another day", () => {
    expect(dropStaleSessions(base, "2026-10-09")).toBe(base);
    const done = {
      ...base,
      session: { ...base.session!, date: "2026-10-08", status: "done" as const },
    };
    expect(dropStaleSessions(done, "2026-10-10").session?.status).toBe("done");
  });
});

describe("readStorage and writeStorage", () => {
  it("reads nothing from an empty store", () => {
    expect(readStorage(new MemoryStorage(), "2026-10-09")).toBeNull();
  });

  it("round-trips saved data", () => {
    const storage = new MemoryStorage();
    const data = parseData(saved({ session: stretchSession })) as SavedData;
    expect(writeStorage(storage, data)).toBe(true);
    expect(readStorage(storage, "2026-10-09")).toEqual(data);
  });

  it("migrates the old stretchday key and marks the exercise intro as unseen", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      "stretchday-v1",
      saved({ settings: { setupDone: true, exerciseIntroSeen: true } }),
    );
    const data = readStorage(storage, "2026-10-09");
    expect(data?.settings.exerciseIntroSeen).toBe(false);
    expect(storage.getItem("tuengwa-v1")).toContain("exerciseIntroSeen");
  });

  it("keeps working when the browser refuses to save", () => {
    const storage = new MemoryStorage();
    storage.fail = true;
    expect(writeStorage(storage, EMPTY_DATA)).toBe(false);
    expect(storage.length).toBe(0);
  });

  it("drops a stale session while reading and saves the result", () => {
    const storage = new MemoryStorage();
    writeStorage(storage, parseData(saved({ session: stretchSession })) as SavedData);
    const data = readStorage(storage, "2026-10-10");
    expect(data?.session).toBeNull();
    expect(JSON.parse(storage.getItem("tuengwa-v1") ?? "").session).toBeNull();
  });
});

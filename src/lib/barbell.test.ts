import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  BANNED_LIFTS,
  BARBELL_MOVES,
  EMPTY_PROGRESS,
  LOADED_BARBELL_IDS,
  WORKOUTS,
  getBarbellMove,
  isAllowedMove,
  isLoadedBarbell,
  progressAfter,
  resolveSlots,
  scheduledWorkout,
  suggestNext,
  withPendingApplied,
  type BarbellProgress,
  type BarbellRecord,
  type WorkoutId,
} from "@/lib/barbell";
import {
  advanceCheck,
  confirmSafety,
  confirmWarmup,
  extendRest,
  finishSet,
  markTooHeavy,
  openSession,
  type BarbellSession,
} from "@/lib/barbell-session";
import { BARBELL_TH } from "@/lib/i18n/barbell-th";
import { en } from "@/lib/i18n/messages";

const FIGURES = join(process.cwd(), "public", "illustrations", "exercise");

function arm(session: BarbellSession): BarbellSession {
  return {
    ...session,
    safety: session.safety.map(() => true),
    warmup: session.warmup.map(() => true),
  };
}

function atWork(workout: WorkoutId = "A", date = "2026-01-05"): BarbellSession {
  let { session } = openSession(date, workout, EMPTY_PROGRESS);
  session = confirmSafety(arm(session));
  session = confirmWarmup(session);
  while (session.phase === "checklist") session = advanceCheck(session);
  return session;
}

function perfect(workout: WorkoutId, date: string, progress: BarbellProgress = EMPTY_PROGRESS): BarbellRecord {
  const slots = resolveSlots(workout, progress, date);
  return {
    date,
    workout,
    sleepEnergy: 4,
    warmUpDone: true,
    areaChecked: true,
    pain: false,
    soreOver72: false,
    formSlipped: false,
    coolDownDone: true,
    cue: "bar close",
    win: "smooth",
    effortNote: "",
    blockedLoads: [],
    asked: slots.map((slot) => ({
      moveId: slot.moveId,
      plannedMoveId: slot.plannedMoveId,
      sets: slot.sets,
      sided: slot.sided,
      target: slot.target,
      reason: slot.reason,
    })),
    results: slots.flatMap((slot) => {
      const sides = slot.sided ? (["left", "right"] as const) : (["both"] as const);
      return sides.flatMap((side) =>
        Array.from({ length: slot.sets }, (_, setIndex) => ({
          plannedMoveId: slot.plannedMoveId,
          moveId: slot.moveId,
          setIndex,
          side,
          completed: slot.target,
          reserve: true,
          skipped: false,
          substituted: false,
          easier: false,
        })),
      );
    }),
  };
}

describe("barbell catalog", () => {
  it("allows only the floor deadlift and the bent-over row as loaded lifts", () => {
    expect(BARBELL_MOVES.filter((move) => move.equipment === "barbell").map((move) => move.id)).toEqual([
      ...LOADED_BARBELL_IDS,
    ]);
    for (const id of BANNED_LIFTS) expect(isAllowedMove(id)).toBe(false);
    for (const move of BARBELL_MOVES) expect(isAllowedMove(move.id)).toBe(true);
  });

  it("stores the plan's sets, ranges, and rest", () => {
    expect(WORKOUTS.A.map((recipe) => [recipe.moveId, recipe.sets, recipe.repsMin, recipe.repsMax, recipe.restMin, recipe.restMax])).toEqual([
      ["deadlift", 3, 5, 8, 90, 120],
      ["incline-push-up", 3, 6, 12, 60, 90],
      ["bent-over-row", 3, 8, 12, 90, 120],
      ["bodyweight-squat", 3, 10, 20, 60, 90],
      ["front-plank", 2, 20, 40, 45, 60],
    ]);
    expect(WORKOUTS.B.map((recipe) => [recipe.moveId, recipe.sets, recipe.repsMin, recipe.repsMax, recipe.restMin, recipe.pauseSeconds, recipe.easierMoveId])).toEqual([
      ["romanian-deadlift", 3, 8, 12, 90, 0, null],
      ["reverse-lunge", 3, 6, 10, 60, 0, null],
      ["incline-push-up", 3, 6, 12, 60, 0, "knee-push-up"],
      ["bent-over-row", 3, 6, 10, 90, 1, null],
      ["glute-bridge", 2, 12, 20, 60, 0, null],
      ["side-plank", 2, 15, 30, 45, 0, null],
    ]);
    expect(getBarbellMove("deadlift")?.substitutions.map((item) => item.moveId)).toEqual(["hip-hinge", "glute-bridge"]);
    expect(getBarbellMove("bent-over-row")?.substitutions.map((item) => item.moveId)).toEqual(["ytw-raise"]);
    expect(getBarbellMove("reverse-lunge")?.substitutions.map((item) => item.moveId)).toEqual(["sit-to-stand"]);
  });

  it("keeps the deadlift, row, and push-up coaching in the action checks", () => {
    const deadlift = getBarbellMove("deadlift")!.checks.join(" ");
    expect(deadlift).toContain("middle of your feet");
    expect(deadlift).toContain("hip-width");
    expect(deadlift).toContain("double-overhand");
    expect(deadlift).toContain("Do not lean backward");
    expect(deadlift).toContain("hips back first");
    const row = getBarbellMove("bent-over-row")!;
    expect(row.checks.join(" ")).toContain("30–45°");
    expect(row.pausedCheck).toContain("one full second");
    expect(getBarbellMove("incline-push-up")!.cautions.join(" ")).toContain("do not use the barbell");
    expect(getBarbellMove("reverse-lunge")!.checks.join(" ")).toContain("Do not hold the barbell");
    expect(getBarbellMove("glute-bridge")!.checks.join(" ")).toContain("Do not place the barbell");
  });

  it("has Thai copy and both drawings for every move", () => {
    for (const move of BARBELL_MOVES) {
      const copy = BARBELL_TH[move.id];
      expect(copy.name.trim()).not.toBe("");
      expect(copy.checks).toHaveLength(move.checks.length);
      expect(copy.cautions).toHaveLength(move.cautions.length);
      expect(copy.mistake.trim()).not.toBe("");
      expect(Boolean(copy.pausedCheck)).toBe(Boolean(move.pausedCheck));
      expect(Boolean(copy.harder)).toBe(Boolean(move.harder));
      expect(existsSync(join(FIGURES, `${move.figure}.webp`)), move.figure).toBe(true);
      expect(existsSync(join(FIGURES, `${move.figure}-mistake.webp`)), `${move.figure}-mistake`).toBe(true);
    }
  });

  it("tells people to walk on 2–3 other days", () => {
    expect(en["barbell.habitWalk"]).toContain("2–3");
    expect(en["barbell.habitWalk"]).not.toContain("2–4");
  });
});

describe("barbell week", () => {
  it("alternates A B A then B A B on Monday, Wednesday, and Friday", () => {
    expect(scheduledWorkout(new Date(2026, 0, 5))).toBe("A");
    expect(scheduledWorkout(new Date(2026, 0, 7))).toBe("B");
    expect(scheduledWorkout(new Date(2026, 0, 9))).toBe("A");
    expect(scheduledWorkout(new Date(2026, 0, 12))).toBe("B");
    expect(scheduledWorkout(new Date(2026, 0, 14))).toBe("A");
    expect(scheduledWorkout(new Date(2026, 0, 16))).toBe("B");
    expect(scheduledWorkout(new Date(2026, 0, 6))).toBeNull();
    expect(scheduledWorkout(new Date(2026, 0, 10))).toBeNull();
  });
});

describe("barbell session", () => {
  it("keeps a loaded rep closed until the safety checks and warm-up are done", () => {
    const opened = openSession("2026-01-05", "A", EMPTY_PROGRESS).session;
    expect(confirmSafety(opened).phase).toBe("safety");
    expect(confirmWarmup(opened).phase).toBe("safety");
    const checklist = { ...opened, phase: "checklist" as const, checksDone: 6 };
    expect(advanceCheck(checklist).phase).toBe("checklist");
    expect(atWork().phase).toBe("work");
  });

  it("stores an early finish as done, with reps still in reserve", () => {
    const done = finishSet(atWork(), 3, true);
    expect(done.results[0]).toMatchObject({
      moveId: "deadlift",
      completed: 3,
      reserve: true,
      skipped: false,
    });
    expect(done.phase).toBe("rest");
    expect(done.restSeconds).toBe(90);
    expect(extendRest(done).restSeconds).toBe(120);
    const session = atWork();
    expect(finishSet(session, 0, true)).toBe(session);
  });

  it("switches a heavy bar to the substitute and will not open the loaded set", () => {
    const heavy = markTooHeavy(atWork());
    expect(heavy.phase).toBe("checklist");
    expect(heavy.slots[0].moveId).toBe("hip-hinge");
    expect(isLoadedBarbell(heavy.slots[0].moveId)).toBe(false);
    let session = heavy;
    while (session.phase === "checklist") session = advanceCheck(session);
    expect(session.phase).toBe("work");
    expect(session.slots[0].moveId).toBe("hip-hinge");
    const blocked = advanceCheck({
      ...atWork(),
      phase: "checklist",
      checksDone: 6,
      blockedLoads: ["deadlift"],
    });
    expect(blocked.phase).not.toBe("work");
  });
});

describe("barbell progression", () => {
  const started: BarbellProgress = { ...EMPTY_PROGRESS, startedOn: "2026-01-05" };

  it("suggests one added rep only after the first two weeks", () => {
    expect(suggestNext(perfect("A", "2026-01-07", started), started).kind).toBe("learn");
    const later = progressAfter(started, perfect("A", "2026-01-20", started));
    expect(later.pending).toEqual({ kind: "reps", moveId: "deadlift", to: 6 });
    expect(later.moves.deadlift).toBeUndefined();
    const preview = withPendingApplied(later, "A");
    const committed = progressAfter(later, perfect("A", "2026-01-22", preview));
    expect(committed.moves.deadlift?.reps).toBe(6);
    expect(committed.pending).toEqual({ kind: "reps", moveId: "deadlift", to: 7 });
  });

  it("drops one set for a week when the session should back off", () => {
    const eased = progressAfter(started, { ...perfect("A", "2026-01-20", started), pain: true });
    expect(eased.pending).toEqual({ kind: "deload" });
    expect(eased.deloadUntil).toBe("2026-01-27");
    expect(resolveSlots("A", eased, "2026-01-22")[0].sets).toBe(2);
    expect(resolveSlots("A", eased, "2026-01-28")[0].sets).toBe(3);
  });
});

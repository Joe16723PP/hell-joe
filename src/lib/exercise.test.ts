import { describe, expect, it } from "vitest";
import {
  EXERCISE_PRESETS,
  afterExercisePause,
  afterExerciseWork,
  doseFor,
  exerciseMoveIds,
  getExercise,
  replaceExerciseMove,
  skipExerciseMove,
  type ExerciseSessionState,
} from "@/lib/exercise";
import type { ExerciseMinutes } from "@/lib/plan";

function session(overrides: Partial<ExerciseSessionState> = {}): ExerciseSessionState {
  return {
    date: "2026-10-09",
    kind: "exercise",
    option: "core",
    presetId: "front-brace",
    length: 10,
    moveIds: ["heel-tap", "dead-bug", "kneeling-plank"],
    index: 0,
    setIndex: 0,
    sets: 2,
    repsTarget: 6,
    holdSeconds: 20,
    restSeconds: 30,
    side: "left",
    reps: 6,
    phase: "work",
    completed: [],
    skipped: [],
    status: "active",
    ...overrides,
  };
}

const LENGTHS: ExerciseMinutes[] = [10, 15, 20];

describe("doseFor", () => {
  it.each([
    ["core", 10, { moves: 4, sets: 2, reps: 6, hold: 20, rest: 30 }],
    ["core", 15, { moves: 5, sets: 2, reps: 8, hold: 25, rest: 40 }],
    ["core", 20, { moves: 6, sets: 3, reps: 5, hold: 15, rest: 20 }],
    ["muscle", 10, { moves: 3, sets: 2, reps: 5, hold: 20, rest: 45 }],
    ["muscle", 15, { moves: 4, sets: 3, reps: 5, hold: 20, rest: 40 }],
    ["muscle", 20, { moves: 5, sets: 3, reps: 6, hold: 25, rest: 40 }],
  ] as const)("%s at %i minutes", (option, length, dose) => {
    expect(doseFor(option, length)).toEqual(dose);
  });
});

describe("afterExerciseWork", () => {
  it("rests between sets", () => {
    expect(afterExerciseWork(session())).toMatchObject({ phase: "rest", reps: 0, completed: [] });
  });

  it("pauses for the other side of a sided move", () => {
    const next = afterExerciseWork(session({ index: 1 }));
    expect(next).toMatchObject({ phase: "side-pause", side: "left", reps: 0 });
  });

  it("rests after the right side of a sided move", () => {
    expect(afterExerciseWork(session({ index: 1, side: "right" })).phase).toBe("rest");
  });

  it("moves on after the last set", () => {
    const next = afterExerciseWork(session({ setIndex: 1 }));
    expect(next).toMatchObject({ phase: "move-pause", completed: ["heel-tap"], status: "active" });
  });

  it("finishes after the last set of the last move", () => {
    const next = afterExerciseWork(session({ index: 2, setIndex: 1, completed: ["heel-tap"] }));
    expect(next).toMatchObject({
      status: "done",
      phase: "work",
      completed: ["heel-tap", "kneeling-plank"],
    });
  });

  it("does not list a move twice", () => {
    const next = afterExerciseWork(session({ setIndex: 1, completed: ["heel-tap"] }));
    expect(next.completed).toEqual(["heel-tap"]);
  });
});

describe("afterExercisePause", () => {
  it("switches to the right side", () => {
    expect(afterExercisePause(session({ phase: "side-pause" }))).toMatchObject({
      phase: "work",
      side: "right",
      reps: 0,
    });
  });

  it("starts the next set on the left", () => {
    expect(afterExercisePause(session({ phase: "rest", side: "right" }))).toMatchObject({
      phase: "work",
      setIndex: 1,
      side: "left",
    });
  });

  it("starts the next move from its first set", () => {
    expect(afterExercisePause(session({ phase: "move-pause", setIndex: 1 }))).toMatchObject({
      phase: "work",
      index: 1,
      setIndex: 0,
    });
  });

  it("leaves a working session alone", () => {
    const current = session();
    expect(afterExercisePause(current)).toBe(current);
  });
});

describe("skipExerciseMove", () => {
  it("moves to the next move and records the skip", () => {
    const next = skipExerciseMove(session({ setIndex: 1, side: "right", phase: "rest" }));
    expect(next).toMatchObject({
      index: 1,
      setIndex: 0,
      side: "left",
      phase: "work",
      reps: 0,
      skipped: ["heel-tap"],
      status: "active",
    });
  });

  it("finishes when the last move is skipped", () => {
    const next = skipExerciseMove(session({ index: 2 }));
    expect(next).toMatchObject({ status: "done", skipped: ["kneeling-plank"] });
  });
});

describe("replaceExerciseMove", () => {
  it("swaps the current move and resets its progress", () => {
    const next = replaceExerciseMove(session({ setIndex: 1, side: "right", reps: 3 }), "lying-knee-tuck");
    expect(next).toMatchObject({
      moveIds: ["lying-knee-tuck", "dead-bug", "kneeling-plank"],
      setIndex: 0,
      side: "left",
      reps: 0,
      phase: "work",
    });
  });

  it("drops the alternate from later in the list so it is not done twice", () => {
    const next = replaceExerciseMove(session(), "kneeling-plank");
    expect(next.moveIds).toEqual(["kneeling-plank", "dead-bug"]);
  });

  it("only removes the first later copy", () => {
    const next = replaceExerciseMove(
      session({ moveIds: ["heel-tap", "dead-bug", "dead-bug"] }),
      "dead-bug",
    );
    expect(next.moveIds).toEqual(["dead-bug", "dead-bug"]);
  });

  it("works on the last move", () => {
    const next = replaceExerciseMove(session({ index: 2 }), "bear-hover");
    expect(next.moveIds).toEqual(["heel-tap", "dead-bug", "bear-hover"]);
    expect(next.index).toBe(2);
  });
});

describe("exerciseMoveIds", () => {
  for (const preset of EXERCISE_PRESETS) {
    for (const length of LENGTHS) {
      it(`${preset.id} at ${length} minutes`, () => {
        const ids = exerciseMoveIds(preset.id, length);
        const expected = Math.min(doseFor(preset.option, length).moves, preset.order.length);
        expect(ids).toHaveLength(expected);
        expect(new Set(ids).size).toBe(ids.length);
        for (const id of ids) {
          expect(getExercise(id)?.option, id).toBe(preset.option);
        }
      });
    }
  }

  it("returns nothing for an unknown preset", () => {
    expect(exerciseMoveIds("nope", 10)).toEqual([]);
  });
});

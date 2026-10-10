import { describe, expect, it } from "vitest";
import { PRESETS, STRETCHES } from "@/lib/catalog";
import { EXERCISE_MOVES, EXERCISE_PRESETS } from "@/lib/exercise";
import { PRESETS_TH, STRETCHES_TH, type StretchCopy } from "@/lib/i18n/catalog-th";
import { EXERCISE_PRESETS_TH, EXERCISES_TH } from "@/lib/i18n/exercise-th";

function expectCopy(copy: StretchCopy | undefined, id: string) {
  expect(copy, id).toBeDefined();
  expect(copy!.name.trim(), `${id} name`).not.toBe("");
  expect(copy!.plain.trim(), `${id} plain`).not.toBe("");
  expect(copy!.anatomical.trim(), `${id} anatomical`).not.toBe("");
  expect(copy!.mistake.trim(), `${id} mistake`).not.toBe("");
  expect(copy!.steps, `${id} steps`).toHaveLength(3);
  for (const [index, step] of copy!.steps.entries()) {
    expect(step.trim(), `${id} step ${index + 1}`).not.toBe("");
  }
}

describe("Thai catalog", () => {
  it.each(STRETCHES.map((stretch) => stretch.id))("stretch %s has a name, steps, and cues", (id) => {
    expectCopy(STRETCHES_TH[id], id);
  });

  it.each(EXERCISE_MOVES.map((move) => move.id))("exercise %s has a name, steps, and cues", (id) => {
    expectCopy(EXERCISES_TH[id], id);
  });

  it.each(PRESETS.map((preset) => preset.id))("stretch preset %s is translated", (id) => {
    expect(PRESETS_TH[id]?.name.trim()).not.toBe("");
    expect(PRESETS_TH[id]?.blurb.trim()).not.toBe("");
    expect(PRESETS_TH[id]?.where.trim()).not.toBe("");
  });

  it.each(EXERCISE_PRESETS.map((preset) => preset.id))("exercise preset %s is translated", (id) => {
    expect(EXERCISE_PRESETS_TH[id]?.name.trim()).not.toBe("");
    expect(EXERCISE_PRESETS_TH[id]?.blurb.trim()).not.toBe("");
  });
});

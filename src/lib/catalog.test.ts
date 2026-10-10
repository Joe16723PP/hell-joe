import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LOOSEN_MOVES, PRESETS, STRETCHES, getStretch } from "@/lib/catalog";
import { BRACE_MOVE_IDS, EXERCISE_MOVES, EXERCISE_PRESETS, getExercise } from "@/lib/exercise";
import { FORM_CUES } from "@/lib/form-cues";
import { PRESETS_TH, STRETCHES_TH, type StretchCopy } from "@/lib/i18n/catalog-th";
import { EXERCISE_PRESETS_TH, EXERCISES_TH } from "@/lib/i18n/exercise-th";
import { en, th } from "@/lib/i18n/messages";

const ILLUSTRATIONS = join(process.cwd(), "public", "illustrations");

function expectFullCopy(copy: StretchCopy | undefined, id: string) {
  expect(copy, id).toBeDefined();
  expect(copy!.name.trim(), `${id} name`).not.toBe("");
  expect(copy!.plain.trim(), `${id} plain`).not.toBe("");
  expect(copy!.anatomical.trim(), `${id} anatomical`).not.toBe("");
  expect(copy!.mistake.trim(), `${id} mistake`).not.toBe("");
  expect(copy!.steps, `${id} steps`).toHaveLength(3);
  for (const step of copy!.steps) expect(step.trim(), `${id} step`).not.toBe("");
}

describe("stretch catalog", () => {
  it.each(STRETCHES.map((stretch) => stretch.id))("%s has Thai copy", (id) => {
    expectFullCopy(STRETCHES_TH[id], id);
  });

  it.each(STRETCHES.map((stretch) => stretch.id))("%s has both illustrations", (id) => {
    expect(existsSync(join(ILLUSTRATIONS, `${id}.webp`)), `${id}.webp`).toBe(true);
    expect(existsSync(join(ILLUSTRATIONS, `${id}-mistake.webp`)), `${id}-mistake.webp`).toBe(true);
  });

  it.each(STRETCHES.map((stretch) => stretch.id))("%s has form-check cues in both languages", (id) => {
    const pair = FORM_CUES[id];
    expect(pair, id).toBeDefined();
    for (const cue of [...pair.wrong.cues, ...pair.right.cues]) {
      expect(en[cue.label], cue.label).toBeTruthy();
      expect(th[cue.label], cue.label).toBeTruthy();
    }
  });

  it("only points at stretches that exist", () => {
    const ids = [
      ...PRESETS.flatMap((preset) => preset.order),
      ...LOOSEN_MOVES,
      ...STRETCHES.flatMap((stretch) => (stretch.alternate ? [stretch.alternate] : [])),
    ];
    for (const id of ids) expect(getStretch(id), id).toBeDefined();
  });

  it.each(PRESETS.map((preset) => preset.id))("preset %s has Thai copy", (id) => {
    expect(PRESETS_TH[id]?.name).toBeTruthy();
    expect(PRESETS_TH[id]?.blurb).toBeTruthy();
    expect(PRESETS_TH[id]?.where).toBeTruthy();
  });
});

describe("exercise catalog", () => {
  it.each(EXERCISE_MOVES.map((move) => move.id))("%s has Thai copy", (id) => {
    expectFullCopy(EXERCISES_TH[id], id);
  });

  it.each(EXERCISE_MOVES.map((move) => move.id))("%s has both illustrations", (id) => {
    const dir = join(ILLUSTRATIONS, "exercise");
    expect(existsSync(join(dir, `${id}.webp`)), `${id}.webp`).toBe(true);
    expect(existsSync(join(dir, `${id}-mistake.webp`)), `${id}-mistake.webp`).toBe(true);
  });

  it("only points at exercises that exist", () => {
    const ids = [
      ...EXERCISE_PRESETS.flatMap((preset) => preset.order),
      ...BRACE_MOVE_IDS,
      ...EXERCISE_MOVES.map((move) => move.alternate),
    ];
    for (const id of ids) expect(getExercise(id), id).toBeDefined();
  });

  it.each(EXERCISE_PRESETS.map((preset) => preset.id))("preset %s has Thai copy", (id) => {
    expect(EXERCISE_PRESETS_TH[id]?.name).toBeTruthy();
    expect(EXERCISE_PRESETS_TH[id]?.blurb).toBeTruthy();
  });
});

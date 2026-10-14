import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { STRETCHES } from "@/lib/catalog";
import { BARBELL_MOVES } from "@/lib/barbell";
import { EXERCISE_MOVES } from "@/lib/exercise";
import { getMoveDemoFrames } from "@/lib/move-demo";

const demoMoves = [
  ...STRETCHES.map((move) => ({ kind: "stretch", move })),
  ...EXERCISE_MOVES.map((move) => ({ kind: "exercise", move })),
  ...BARBELL_MOVES.map((move) => ({ kind: "barbell", move })),
];

describe("move demonstration frames", () => {
  it("provides four existing WebP frames for every move set", () => {
    expect(demoMoves).toHaveLength(62);

    for (const { kind, move } of demoMoves) {
      const frames = getMoveDemoFrames(kind as "stretch" | "exercise" | "barbell", move.id);
      expect(frames, `${kind}/${move.id}`).toHaveLength(4);
      for (const frame of frames) {
        expect(frame.endsWith(".webp"), frame).toBe(true);
        expect(existsSync(join(process.cwd(), "public", frame.replace(/^\//, ""))), frame).toBe(true);
      }
    }
  });
});

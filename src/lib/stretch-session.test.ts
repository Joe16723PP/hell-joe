import { describe, expect, it } from "vitest";
import {
  advance,
  buildStretchRecap,
  completeHold,
  finishedAfter,
  setSide,
  skip,
  replaceMove,
  type StretchSession,
} from "@/lib/stretch-session";

const today = new Date(2026, 9, 9);
const settings = { restDay: 0 };

function session(overrides: Partial<StretchSession> = {}): StretchSession {
  return {
    date: "2026-10-09",
    kind: "daily",
    presetId: "desk-reset",
    length: 10,
    moveIds: ["neck", "shoulder", "figure-four"],
    index: 0,
    side: "left",
    sides: {},
    held: [],
    skipped: [],
    status: "active",
    ...overrides,
  };
}

describe("completeHold", () => {
  it("marks only the current side of a sided stretch", () => {
    const next = completeHold(session());
    expect(next.sides.neck).toEqual({ left: true, right: false });
  });

  it("marks both sides of a stretch done together", () => {
    expect(completeHold(session({ moveIds: ["cat"] })).sides.cat).toEqual({
      left: true,
      right: true,
    });
  });

  it("keeps the other side that was already held", () => {
    const next = completeHold(
      session({ side: "right", sides: { neck: { left: true, right: false } } }),
    );
    expect(next.sides.neck).toEqual({ left: true, right: true });
  });

  it("leaves a finished session alone", () => {
    const done = session({ status: "done" });
    expect(completeHold(done)).toBe(done);
  });
});

describe("setSide", () => {
  it("switches side while the session is active", () => {
    expect(setSide(session(), "right").side).toBe("right");
    expect(setSide(session({ status: "done" }), "right").side).toBe("left");
  });
});

describe("advance and skip", () => {
  it("records the hold and moves on", () => {
    const { session: next, recap } = advance(session({ side: "right" }), [], settings, today);
    expect(next).toMatchObject({ index: 1, side: "left", held: ["neck"], status: "active" });
    expect(recap).toBeNull();
  });

  it("does not record the same move twice", () => {
    const { session: next } = advance(session({ held: ["neck"] }), [], settings, today);
    expect(next.held).toEqual(["neck"]);
  });

  it("finishes on the last move and counts a daily session", () => {
    const { session: next, recap } = advance(
      session({ index: 2, held: ["neck"] }),
      ["2026-10-08"],
      settings,
      today,
    );
    expect(next.status).toBe("done");
    expect(recap).toMatchObject({
      counted: true,
      streak: 2,
      areas: ["neck", "glutes"],
      held: [{ id: "neck", name: "Neck side bend" }, { id: "figure-four" }],
    });
    expect(finishedAfter([], recap)).toEqual([{ date: "2026-10-09", areas: ["neck", "glutes"] }]);
  });

  it("shares the recap with skip, which does not count a session with nothing held", () => {
    const { recap } = skip(session({ index: 2 }), ["2026-10-08"], settings, today);
    expect(recap).toMatchObject({ counted: false, streak: 1, held: [], skipped: [{ id: "figure-four" }] });
    expect(finishedAfter([{ date: "2026-10-08", areas: ["hips"] }], recap)).toHaveLength(1);
  });

  it("replaces today's finished entry instead of adding a second one", () => {
    const { recap } = advance(session({ index: 2 }), ["2026-10-09"], settings, today);
    const finished = finishedAfter([{ date: "2026-10-09", areas: ["legs"] }], recap);
    expect(finished).toHaveLength(1);
    expect(finished[0]?.areas).toEqual(["glutes"]);
  });

  it("never counts a loosen session", () => {
    const { recap } = advance(session({ kind: "loosen", index: 2 }), [], settings, today);
    expect(recap?.counted).toBe(false);
  });

  it("leaves a finished session untouched", () => {
    const done = session({ status: "done" });
    expect(advance(done, [], settings, today)).toEqual({ session: done, recap: null });
    expect(skip(done, [], settings, today)).toEqual({ session: done, recap: null });
  });
});

describe("replaceMove", () => {
  it("swaps the current move and drops the later duplicate", () => {
    const next = replaceMove(session({ side: "right" }), "figure-four");
    expect(next.moveIds).toEqual(["figure-four", "shoulder"]);
    expect(next.side).toBe("left");
  });

  it("forgets holds recorded for the move it swaps in", () => {
    const next = replaceMove(
      session({ sides: { shoulder: { left: true, right: true } } }),
      "shoulder",
    );
    expect(next.sides.shoulder).toBeUndefined();
  });

  it("leaves a finished session alone", () => {
    const done = session({ status: "done" });
    expect(replaceMove(done, "cat")).toBe(done);
  });
});

describe("buildStretchRecap", () => {
  it("drops ids that are not in the catalog", () => {
    const recap = buildStretchRecap(session(), ["neck", "nope"], ["ghost"], [], settings, today);
    expect(recap.held.map((move) => move.id)).toEqual(["neck"]);
    expect(recap.skipped).toEqual([]);
  });
});

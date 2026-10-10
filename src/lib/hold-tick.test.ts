import { describe, expect, it } from "vitest";
import { playHoldTick, primeHoldTick, shouldPlayHoldTick } from "@/lib/hold-tick";

describe("shouldPlayHoldTick", () => {
  it("stays quiet when muted or stopped", () => {
    expect(shouldPlayHoldTick({ running: true, audible: false, remaining: 10, starting: false })).toBe(false);
    expect(shouldPlayHoldTick({ running: false, audible: true, remaining: 10, starting: false })).toBe(false);
  });

  it("ticks on start while time is left", () => {
    expect(shouldPlayHoldTick({ running: true, audible: true, remaining: 1, starting: true })).toBe(true);
    expect(shouldPlayHoldTick({ running: true, audible: true, remaining: 0, starting: true })).toBe(false);
  });

  it("skips the tick on the final second", () => {
    expect(shouldPlayHoldTick({ running: true, audible: true, remaining: 2, starting: false })).toBe(true);
    expect(shouldPlayHoldTick({ running: true, audible: true, remaining: 1, starting: false })).toBe(false);
  });
});

describe("tick audio", () => {
  it("does nothing without a browser", () => {
    expect(() => primeHoldTick()).not.toThrow();
    expect(() => playHoldTick()).not.toThrow();
  });
});

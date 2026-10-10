import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCountdown } from "@/lib/countdown";

function setup(seconds = 30) {
  const onSecond = vi.fn();
  const onDone = vi.fn();
  const countdown = createCountdown(seconds, { onSecond, onDone });
  countdown.attach();
  return { countdown, onSecond, onDone };
}

describe("createCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 9, 8, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down by real time and finishes once", () => {
    const { countdown, onSecond, onDone } = setup(3);
    countdown.start();
    expect(countdown.getSnapshot()).toEqual({ remaining: 3, running: true });

    vi.advanceTimersByTime(1000);
    expect(countdown.getSnapshot().remaining).toBe(2);
    expect(onSecond).toHaveBeenLastCalledWith(2, 3);

    vi.advanceTimersByTime(2000);
    expect(countdown.getSnapshot()).toEqual({ remaining: 0, running: false });
    expect(onDone).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("catches up after the tab was hidden and intervals stopped firing", () => {
    const { countdown, onSecond, onDone } = setup(30);
    countdown.start();
    vi.advanceTimersByTime(5000);
    expect(countdown.getSnapshot().remaining).toBe(25);

    // A locked phone can hold back intervals. Move the clock without running them.
    vi.setSystemTime(Date.now() + 22_000);
    countdown.sync();
    expect(countdown.getSnapshot().remaining).toBe(3);
    expect(onSecond).toHaveBeenLastCalledWith(3, 25);

    vi.setSystemTime(Date.now() + 10_000);
    countdown.sync();
    expect(countdown.getSnapshot().remaining).toBe(0);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("holds its place while paused", () => {
    const { countdown, onDone } = setup(10);
    countdown.start();
    vi.advanceTimersByTime(4000);
    countdown.setPaused(true);
    vi.advanceTimersByTime(60_000);
    expect(countdown.getSnapshot()).toEqual({ remaining: 6, running: true });

    countdown.setPaused(false);
    vi.advanceTimersByTime(6000);
    expect(countdown.getSnapshot().remaining).toBe(0);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("stops and starts again from where it was", () => {
    const { countdown } = setup(10);
    countdown.start();
    vi.advanceTimersByTime(3000);
    countdown.stop();
    vi.advanceTimersByTime(10_000);
    expect(countdown.getSnapshot()).toEqual({ remaining: 7, running: false });
    countdown.start();
    vi.advanceTimersByTime(2000);
    expect(countdown.getSnapshot().remaining).toBe(5);
  });

  it("adds time up to a cap", () => {
    const { countdown } = setup(80);
    countdown.add(15, 90);
    expect(countdown.getSnapshot().remaining).toBe(90);
    countdown.start();
    vi.advanceTimersByTime(30_000);
    countdown.add(15, 90);
    expect(countdown.getSnapshot().remaining).toBe(75);
  });

  it("finishes early without a tick for the jump to zero", () => {
    const { countdown, onSecond, onDone } = setup(30);
    countdown.start();
    countdown.finish();
    countdown.finish();
    expect(countdown.getSnapshot()).toEqual({ remaining: 0, running: false });
    expect(onSecond).not.toHaveBeenCalled();
    expect(onDone).toHaveBeenCalledTimes(1);
    countdown.start();
    expect(countdown.getSnapshot().running).toBe(false);
  });

  it("does not run timers until attached", () => {
    const onDone = vi.fn();
    const countdown = createCountdown(2, { onDone });
    countdown.start();
    vi.advanceTimersByTime(5000);
    expect(onDone).not.toHaveBeenCalled();
    countdown.attach();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("resets to a new length", () => {
    const { countdown, onDone } = setup(5);
    countdown.start();
    vi.advanceTimersByTime(5000);
    countdown.reset(8);
    expect(countdown.getSnapshot()).toEqual({ remaining: 8, running: false });
    countdown.start();
    vi.advanceTimersByTime(8000);
    expect(onDone).toHaveBeenCalledTimes(2);
  });
});

import { useEffect, useState, useSyncExternalStore } from "react";

export type CountdownSnapshot = {
  remaining: number;
  running: boolean;
};

export type CountdownHandlers = {
  /** Fires when the whole-second display changes while running. A throttled tab can skip several seconds at once. */
  onSecond?: (remaining: number, previous: number) => void;
  onDone?: () => void;
};

export type Countdown = ReturnType<typeof createCountdown>;

const STEP_MS = 250;

function toSeconds(ms: number) {
  return Math.max(0, Math.ceil(ms / 1000));
}

/**
 * A countdown that stores when it ends instead of counting interval ticks,
 * so it stays right when the browser slows timers on a locked screen.
 */
export function createCountdown(seconds: number, initialHandlers: CountdownHandlers = {}) {
  let handlers = initialHandlers;
  let leftMs = seconds * 1000;
  let endsAt: number | null = null;
  let running = false;
  let paused = false;
  let attached = false;
  let done = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  let snapshot: CountdownSnapshot = { remaining: toSeconds(leftMs), running };
  const listeners = new Set<() => void>();

  function msLeft() {
    return endsAt === null ? leftMs : Math.max(0, endsAt - Date.now());
  }

  function publish() {
    const remaining = toSeconds(msLeft());
    if (snapshot.remaining === remaining && snapshot.running === running) return;
    snapshot = { remaining, running };
    listeners.forEach((listener) => listener());
  }

  function schedule() {
    const ticking = running && !paused;
    if (ticking && endsAt === null) endsAt = Date.now() + leftMs;
    if (!ticking && endsAt !== null) {
      leftMs = msLeft();
      endsAt = null;
    }
    const timed = ticking && attached;
    if (timed && timer === null) timer = setInterval(sync, STEP_MS);
    if (!timed && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function complete() {
    leftMs = 0;
    endsAt = null;
    running = false;
    schedule();
    publish();
    if (done) return;
    done = true;
    handlers.onDone?.();
  }

  function sync() {
    if (!running) return;
    const previous = snapshot.remaining;
    const remaining = toSeconds(msLeft());
    if (remaining !== previous) handlers.onSecond?.(remaining, previous);
    if (remaining === 0) {
      complete();
      return;
    }
    publish();
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    setHandlers(next: CountdownHandlers) {
      handlers = next;
    },
    sync,
    start() {
      if (done || running || msLeft() <= 0) return;
      running = true;
      schedule();
      publish();
    },
    stop() {
      sync();
      running = false;
      schedule();
      publish();
    },
    setPaused(value: boolean) {
      if (paused === value) return;
      sync();
      paused = value;
      schedule();
      publish();
    },
    add(extra: number, capSeconds = Infinity) {
      if (done) return;
      const next = Math.min(capSeconds * 1000, msLeft() + extra * 1000);
      if (endsAt === null) leftMs = next;
      else endsAt = Date.now() + next;
      publish();
    },
    /** Ends now and fires onDone once, without an onSecond for the jump to zero. */
    finish() {
      if (done) return;
      complete();
    },
    reset(nextSeconds: number) {
      running = false;
      done = false;
      endsAt = null;
      leftMs = nextSeconds * 1000;
      schedule();
      publish();
    },
    attach() {
      attached = true;
      schedule();
      sync();
    },
    detach() {
      attached = false;
      schedule();
    },
  };
}

export function useCountdown(
  seconds: number,
  options: CountdownHandlers & { paused?: boolean; autoStart?: boolean } = {},
) {
  const [countdown] = useState(() => createCountdown(seconds));
  const { onSecond, onDone } = options;
  useEffect(() => {
    countdown.setHandlers({ onSecond, onDone });
  });
  const snapshot = useSyncExternalStore(countdown.subscribe, countdown.getSnapshot, countdown.getSnapshot);
  const paused = Boolean(options.paused);
  const autoStart = Boolean(options.autoStart);

  useEffect(() => {
    countdown.attach();
    const catchUp = () => countdown.sync();
    document.addEventListener("visibilitychange", catchUp);
    window.addEventListener("pageshow", catchUp);
    return () => {
      document.removeEventListener("visibilitychange", catchUp);
      window.removeEventListener("pageshow", catchUp);
      countdown.detach();
    };
  }, [countdown]);

  useEffect(() => {
    countdown.setPaused(paused);
  }, [countdown, paused]);

  useEffect(() => {
    if (autoStart) countdown.start();
  }, [autoStart, countdown]);

  return {
    remaining: snapshot.remaining,
    running: snapshot.running,
    active: snapshot.running && !paused,
    start: countdown.start,
    stop: countdown.stop,
    add: countdown.add,
    finish: countdown.finish,
    reset: countdown.reset,
  };
}

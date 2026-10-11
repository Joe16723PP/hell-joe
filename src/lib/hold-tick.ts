import { publicPath } from "@/lib/public-path";

const TICK_SRC = publicPath("/sounds/tick.wav");
const TICK_VOLUME = 0.35;

let tickAudio: HTMLAudioElement | null = null;

export function primeHoldTick() {
  if (typeof window === "undefined") return;
  if (tickAudio) return;
  tickAudio = new Audio(TICK_SRC);
  tickAudio.preload = "auto";
  tickAudio.volume = TICK_VOLUME;
}

export function playHoldTick() {
  if (typeof window === "undefined") return;
  primeHoldTick();
  if (!tickAudio) return;
  tickAudio.volume = TICK_VOLUME;
  try {
    tickAudio.currentTime = 0;
  } catch {
    // The file may not be seekable until the first bytes arrive.
  }
  void tickAudio.play().catch(() => {});
}

export function shouldPlayHoldTick(input: {
  running: boolean;
  audible: boolean;
  remaining: number;
  starting: boolean;
}): boolean {
  if (!input.audible || !input.running) return false;
  if (input.starting) return input.remaining > 0;
  return input.remaining > 1;
}

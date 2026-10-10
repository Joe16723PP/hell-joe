import {
  EMPTY_PROGRESS,
  getBarbellMove,
  isLoadedBarbell,
  resolveSlots,
  slotFromSubstitution,
  withPendingApplied,
  type AskedSlot,
  type BarbellProgress,
  type BarbellRecord,
  type MoveId,
  type ResolvedSlot,
  type SetResult,
  type WorkoutId,
} from "@/lib/barbell";

export const SAFETY_COUNT = 6;
export const WARMUP_COUNT = 7;
export const COOLDOWN_COUNT = 4;

export type BarbellPhase = "safety" | "warmup" | "checklist" | "work" | "rest" | "cooldown" | "log";

export type BarbellSession = {
  date: string;
  workout: WorkoutId;
  phase: BarbellPhase;
  safety: boolean[];
  warmup: boolean[];
  cooldown: boolean[];
  slots: ResolvedSlot[];
  index: number;
  setIndex: number;
  side: "left" | "right";
  checksDone: number;
  reps: number;
  restSeconds: number;
  restExtended: boolean;
  afterRest: "work" | "checklist";
  results: SetResult[];
  blockedLoads: MoveId[];
  painStop: boolean;
  status: "active" | "done";
};

export function checksReady(flags: boolean[], count: number): boolean {
  return flags.length === count && flags.every(Boolean);
}

export function openSession(date: string, workout: WorkoutId, progress: BarbellProgress): {
  session: BarbellSession;
  progress: BarbellProgress;
} {
  const preview = withPendingApplied(progress, workout);
  const slots = resolveSlots(workout, preview, date);
  return {
    progress: { ...progress, startedOn: progress.startedOn ?? date },
    session: {
      date,
      workout,
      phase: "safety",
      safety: Array.from({ length: SAFETY_COUNT }, () => false),
      warmup: Array.from({ length: WARMUP_COUNT }, () => false),
      cooldown: Array.from({ length: COOLDOWN_COUNT }, () => false),
      slots,
      index: 0,
      setIndex: 0,
      side: "left",
      checksDone: 0,
      reps: 0,
      restSeconds: slots[0]?.restMin ?? 60,
      restExtended: false,
      afterRest: "checklist",
      results: [],
      blockedLoads: [],
      painStop: false,
      status: "active",
    },
  };
}

function toggle(flags: boolean[], index: number): boolean[] | null {
  if (index < 0 || index >= flags.length) return null;
  return flags.map((flag, i) => (i === index ? !flag : flag));
}

export function toggleSafety(session: BarbellSession, index: number): BarbellSession {
  if (session.phase !== "safety" || session.status !== "active") return session;
  const safety = toggle(session.safety, index);
  return safety ? { ...session, safety } : session;
}

export function confirmSafety(session: BarbellSession): BarbellSession {
  if (session.phase !== "safety" || !checksReady(session.safety, SAFETY_COUNT)) return session;
  return { ...session, phase: "warmup" };
}

export function toggleWarmup(session: BarbellSession, index: number): BarbellSession {
  if (session.phase !== "warmup" || session.status !== "active") return session;
  const warmup = toggle(session.warmup, index);
  return warmup ? { ...session, warmup } : session;
}

export function confirmWarmup(session: BarbellSession): BarbellSession {
  if (session.phase !== "warmup" || !checksReady(session.warmup, WARMUP_COUNT)) return session;
  return { ...session, phase: "checklist", checksDone: 0 };
}

export function currentSlot(session: BarbellSession): ResolvedSlot | null {
  return session.slots[session.index] ?? null;
}

function loadedBlocked(session: BarbellSession, slot: ResolvedSlot): boolean {
  return isLoadedBarbell(slot.moveId) && session.blockedLoads.includes(slot.plannedMoveId);
}

export function advanceCheck(session: BarbellSession): BarbellSession {
  if (session.phase !== "checklist" || session.status !== "active") return session;
  const slot = currentSlot(session);
  const move = slot ? getBarbellMove(slot.moveId) : undefined;
  if (!slot || !move) return session;
  if (!checksReady(session.warmup, WARMUP_COUNT)) return session;
  if (loadedBlocked(session, slot)) return session;
  const next = session.checksDone + 1;
  if (next < move.checks.length) return { ...session, checksDone: next };
  return { ...session, checksDone: move.checks.length, phase: "work", reps: 0 };
}

export function countRep(session: BarbellSession): BarbellSession {
  const slot = currentSlot(session);
  if (!slot || session.phase !== "work" || session.status !== "active" || slot.hold) return session;
  if (loadedBlocked(session, slot)) return session;
  if (session.reps >= slot.target) return session;
  return { ...session, reps: session.reps + 1 };
}

function resultFor(
  session: BarbellSession,
  slot: ResolvedSlot,
  completed: number,
  reserve: boolean,
  skipped: boolean,
): SetResult {
  return {
    plannedMoveId: slot.plannedMoveId,
    moveId: slot.moveId,
    setIndex: session.setIndex,
    side: slot.sided ? session.side : "both",
    completed,
    reserve,
    skipped,
    substituted: slot.reason === "heavy",
    easier: slot.reason === "easier",
  };
}

function afterSet(session: BarbellSession, slot: ResolvedSlot, result: SetResult): BarbellSession {
  const results = [...session.results, result];
  const base: BarbellSession = { ...session, results, reps: 0 };
  if (!result.skipped && slot.sided && session.side === "left") {
    return { ...base, side: "right", phase: "work" };
  }
  if (!result.skipped && session.setIndex + 1 < slot.sets) {
    return {
      ...base,
      setIndex: session.setIndex + 1,
      side: "left",
      phase: "rest",
      afterRest: "work",
      restSeconds: slot.restMin,
      restExtended: false,
    };
  }
  const nextIndex = session.index + 1;
  if (nextIndex < session.slots.length) {
    return {
      ...base,
      index: nextIndex,
      setIndex: 0,
      side: "left",
      checksDone: 0,
      phase: "rest",
      afterRest: "checklist",
      restSeconds: slot.restMin,
      restExtended: false,
    };
  }
  return { ...base, phase: "cooldown" };
}

export function finishSet(session: BarbellSession, completed: number, reserve: boolean): BarbellSession {
  const slot = currentSlot(session);
  if (!slot || session.phase !== "work" || session.status !== "active") return session;
  if (loadedBlocked(session, slot)) return session;
  if (completed < 1) return session;
  return afterSet(session, slot, resultFor(session, slot, completed, reserve, false));
}

export function skipMove(session: BarbellSession): BarbellSession {
  const slot = currentSlot(session);
  if (!slot || session.status !== "active") return session;
  if (session.phase === "safety" || session.phase === "warmup" || session.phase === "cooldown" || session.phase === "log") {
    return session;
  }
  const results = [
    ...session.results,
    {
      ...resultFor(session, slot, 0, false, true),
      side: "both" as const,
    },
  ];
  const nextIndex = session.index + 1;
  if (nextIndex >= session.slots.length) return { ...session, results, phase: "cooldown" };
  return {
    ...session,
    results,
    index: nextIndex,
    setIndex: 0,
    side: "left",
    checksDone: 0,
    reps: 0,
    phase: "checklist",
  };
}

export function markTooHeavy(session: BarbellSession): BarbellSession {
  const slot = currentSlot(session);
  const move = slot ? getBarbellMove(slot.moveId) : undefined;
  if (!slot || !move || session.status !== "active" || move.substitutions.length === 0) return session;
  if (session.phase !== "checklist" && session.phase !== "work") return session;
  const replacements = move.substitutions.map((sub) => slotFromSubstitution(sub, slot.plannedMoveId));
  const slots = [...session.slots.slice(0, session.index), ...replacements, ...session.slots.slice(session.index + 1)];
  const blockedLoads = session.blockedLoads.includes(slot.plannedMoveId)
    ? session.blockedLoads
    : [...session.blockedLoads, slot.plannedMoveId];
  return {
    ...session,
    slots,
    blockedLoads,
    checksDone: 0,
    reps: 0,
    setIndex: 0,
    side: "left",
    phase: "checklist",
  };
}

export function useEasier(session: BarbellSession): BarbellSession {
  const slot = currentSlot(session);
  if (!slot?.easierMoveId || session.status !== "active") return session;
  if (session.phase !== "checklist" && session.phase !== "work") return session;
  const easier = getBarbellMove(slot.easierMoveId);
  if (!easier) return session;
  const slots = session.slots.map((item, index) =>
    index === session.index
      ? { ...item, moveId: easier.id, sided: easier.sided, hold: easier.hold, easierMoveId: null, reason: "easier" as const }
      : item,
  );
  return { ...session, slots, checksDone: 0, reps: 0, setIndex: 0, side: "left", phase: "checklist" };
}

export function extendRest(session: BarbellSession): BarbellSession {
  const slot = session.slots[Math.max(0, session.index - (session.afterRest === "checklist" ? 1 : 0))] ?? currentSlot(session);
  if (session.phase !== "rest" || session.restExtended || !slot) return session;
  if (slot.restMax <= session.restSeconds) return session;
  return { ...session, restExtended: true, restSeconds: slot.restMax };
}

export function finishRest(session: BarbellSession): BarbellSession {
  if (session.phase !== "rest" || session.status !== "active") return session;
  return { ...session, phase: session.afterRest, reps: 0 };
}

export function stopForPain(session: BarbellSession): BarbellSession {
  if (session.status !== "active" || session.phase === "log") return session;
  return { ...session, painStop: true, phase: "log" };
}

export function toggleCooldown(session: BarbellSession, index: number): BarbellSession {
  if (session.phase !== "cooldown" || session.status !== "active") return session;
  const cooldown = toggle(session.cooldown, index);
  return cooldown ? { ...session, cooldown } : session;
}

export function confirmCooldown(session: BarbellSession): BarbellSession {
  if (session.phase !== "cooldown" || !checksReady(session.cooldown, COOLDOWN_COUNT)) return session;
  return { ...session, phase: "log" };
}

export function askedFrom(session: BarbellSession): AskedSlot[] {
  return session.slots.map((slot) => ({
    moveId: slot.moveId,
    plannedMoveId: slot.plannedMoveId,
    sets: slot.sets,
    sided: slot.sided,
    target: slot.target,
    reason: slot.reason,
  }));
}

export function buildRecord(
  session: BarbellSession,
  input: {
    sleepEnergy: 1 | 2 | 3 | 4 | 5;
    pain: boolean;
    soreOver72: boolean;
    formSlipped: boolean;
    cue: string;
    win: string;
    effortNote: string;
  },
): BarbellRecord {
  return {
    date: session.date,
    workout: session.workout,
    sleepEnergy: input.sleepEnergy,
    warmUpDone: checksReady(session.warmup, WARMUP_COUNT),
    areaChecked: checksReady(session.safety, SAFETY_COUNT),
    pain: input.pain || session.painStop,
    soreOver72: input.soreOver72,
    formSlipped: input.formSlipped,
    results: session.results,
    asked: askedFrom(session),
    coolDownDone: checksReady(session.cooldown, COOLDOWN_COUNT),
    cue: input.cue.trim(),
    win: input.win.trim(),
    effortNote: input.effortNote.trim(),
    blockedLoads: session.blockedLoads,
  };
}

export function finishLog(session: BarbellSession): BarbellSession {
  if (session.phase !== "log") return session;
  return { ...session, status: "done" };
}

function isMoveId(value: unknown): value is MoveId {
  return typeof value === "string" && getBarbellMove(value) !== undefined;
}

function isSlot(value: unknown): value is ResolvedSlot {
  if (!value || typeof value !== "object") return false;
  const slot = value as ResolvedSlot;
  return (
    isMoveId(slot.moveId) &&
    isMoveId(slot.plannedMoveId) &&
    Number.isInteger(slot.sets) &&
    slot.sets > 0 &&
    Number.isInteger(slot.target) &&
    slot.target > 0 &&
    Number.isInteger(slot.repsMax) &&
    Number.isInteger(slot.restMin) &&
    Number.isInteger(slot.restMax) &&
    typeof slot.sided === "boolean" &&
    typeof slot.hold === "boolean" &&
    typeof slot.pauseSeconds === "number" &&
    typeof slot.slower === "boolean" &&
    typeof slot.harder === "boolean" &&
    (slot.easierMoveId === null || isMoveId(slot.easierMoveId)) &&
    (slot.reason === "plan" || slot.reason === "heavy" || slot.reason === "easier")
  );
}

function flags(value: unknown, count: number): boolean[] | null {
  if (!Array.isArray(value) || value.length !== count || value.some((item) => typeof item !== "boolean")) return null;
  return value;
}

export function parseBarbellSession(value: unknown): BarbellSession | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as BarbellSession;
  const phases: BarbellPhase[] = ["safety", "warmup", "checklist", "work", "rest", "cooldown", "log"];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.date)) return null;
  if (raw.workout !== "A" && raw.workout !== "B") return null;
  if (!phases.includes(raw.phase)) return null;
  const safety = flags(raw.safety, SAFETY_COUNT);
  const warmup = flags(raw.warmup, WARMUP_COUNT);
  const cooldown = flags(raw.cooldown, COOLDOWN_COUNT);
  if (!safety || !warmup || !cooldown) return null;
  if (!Array.isArray(raw.slots) || raw.slots.length === 0 || !raw.slots.every(isSlot)) return null;
  if (!Number.isInteger(raw.index) || raw.index < 0 || raw.index >= raw.slots.length) return null;
  if (raw.side !== "left" && raw.side !== "right") return null;
  if (raw.status !== "active" && raw.status !== "done") return null;
  if (!Array.isArray(raw.results) || !Array.isArray(raw.blockedLoads)) return null;
  if (!raw.blockedLoads.every(isMoveId)) return null;
  return raw;
}

export function parseBarbellProgress(value: unknown): BarbellProgress {
  if (!value || typeof value !== "object") return EMPTY_PROGRESS;
  const raw = value as BarbellProgress;
  return {
    startedOn: typeof raw.startedOn === "string" ? raw.startedOn : null,
    deloadUntil: typeof raw.deloadUntil === "string" ? raw.deloadUntil : null,
    moves: raw.moves && typeof raw.moves === "object" ? raw.moves : {},
    pending: raw.pending && typeof raw.pending === "object" ? raw.pending : null,
  };
}

export function parseBarbellRecords(value: unknown): BarbellRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is BarbellRecord =>
      Boolean(entry) &&
      typeof entry === "object" &&
      /^\d{4}-\d{2}-\d{2}$/.test((entry as BarbellRecord).date) &&
      ((entry as BarbellRecord).workout === "A" || (entry as BarbellRecord).workout === "B") &&
      typeof (entry as BarbellRecord).sleepEnergy === "number",
  );
}

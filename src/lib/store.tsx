"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  LOOSEN_MOVES,
  type LengthMin,
  type StretchId,
  getStretch,
} from "@/lib/catalog";
import {
  currentStreak,
  focusFor,
  isoDate,
  sessionMoveIds,
  startOfToday,
  tomorrowLine,
  type Settings,
} from "@/lib/plan";

const STORAGE_KEY = "stretchday-v1";

export type Side = "left" | "right";

export type Session = {
  date: string;
  kind: "daily" | "loosen";
  presetId: string;
  length: LengthMin;
  moveIds: string[];
  index: number;
  side: Side;
  sides: Record<string, { left: boolean; right: boolean }>;
  held: string[];
  skipped: string[];
  status: "active" | "done";
};

export type FinishedSession = {
  date: string;
  areas: string[];
};

export type Recap = {
  date: string;
  kind: "daily" | "loosen";
  held: { id: string; name: string; area: string }[];
  skipped: { id: string; name: string }[];
  areas: string[];
  streak: number;
  tomorrow: string;
  counted: boolean;
};

type TodayPlan = {
  date: string;
  presetId: string;
};

type Data = {
  settings: Settings;
  plan: TodayPlan | null;
  session: Session | null;
  finished: FinishedSession[];
  recap: Recap | null;
  lastReminder: string | null;
};

type Store = {
  ready: boolean;
  settings: Settings;
  planPresetId: string;
  session: Session | null;
  finished: FinishedSession[];
  recap: Recap | null;
  lastReminder: string | null;
  viewingRest: boolean;
  setViewingRest: (value: boolean) => void;
  saveSetup: (settings: Settings) => void;
  setLength: (length: LengthMin) => void;
  setPreset: (presetId: string) => void;
  startSession: (kind?: "daily" | "loosen") => void;
  startOver: () => void;
  completeHold: () => void;
  setSide: (side: Side) => void;
  advance: () => void;
  skip: () => void;
  useAlternate: (id: StretchId) => void;
  markReminded: (date: string) => void;
};

const DEFAULT_SETTINGS: Settings = {
  setupDone: false,
  length: 10,
  tightAreas: [],
  restDay: 0,
  reminderOn: false,
  reminderTime: "08:00",
};

const SERVER_SNAPSHOT: Data = {
  settings: DEFAULT_SETTINGS,
  plan: null,
  session: null,
  finished: [],
  recap: null,
  lastReminder: null,
};

const StretchContext = createContext<Store | null>(null);

function sanitizeSettings(value: Partial<Settings> | undefined): Settings {
  const length = value?.length === 5 || value?.length === 15 ? value.length : 10;
  const restDay =
    typeof value?.restDay === "number" && value.restDay >= 0 && value.restDay <= 6
      ? value.restDay
      : 0;
  const tightAreas = Array.isArray(value?.tightAreas)
    ? value.tightAreas.filter(
        (item): item is Settings["tightAreas"][number] =>
          item === "neck-shoulders" || item === "back" || item === "hips" || item === "legs",
      )
    : [];
  return {
    setupDone: Boolean(value?.setupDone),
    length,
    tightAreas,
    restDay,
    reminderOn: Boolean(value?.reminderOn),
    reminderTime: value?.reminderTime || "08:00",
  };
}

function readStorage(): Data | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Data>;
    if (!parsed.settings) return null;
    return {
      settings: sanitizeSettings(parsed.settings),
      plan:
        parsed.plan && parsed.plan.date && parsed.plan.presetId
          ? { date: parsed.plan.date, presetId: parsed.plan.presetId }
          : null,
      session: parsed.session ?? null,
      finished: Array.isArray(parsed.finished) ? parsed.finished : [],
      recap: parsed.recap ?? null,
      lastReminder: typeof parsed.lastReminder === "string" ? parsed.lastReminder : null,
    };
  } catch {
    return null;
  }
}

function emptySides() {
  return { left: false, right: false };
}

let snapshot: Data = SERVER_SNAPSHOT;
let clientReady = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function subscribeHydrated() {
  return () => {};
}

function remember(next: Data) {
  snapshot = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function update(recipe: (current: Data) => Data) {
  const next = recipe(snapshot);
  if (next === snapshot) return;
  remember(next);
}

function getSnapshot(): Data {
  if (!clientReady) {
    clientReady = true;
    const loaded = readStorage();
    if (loaded) {
      const today = isoDate(startOfToday());
      if (
        loaded.session &&
        loaded.session.date !== today &&
        loaded.session.status === "active"
      ) {
        loaded.session = null;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
      }
      snapshot = loaded;
    }
  }
  return snapshot;
}

export function StretchProvider({ children }: { children: ReactNode }) {
  const data = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
  const hydrated = useSyncExternalStore(subscribeHydrated, () => true, () => false);
  const [viewingRest, setViewingRest] = useState(false);
  const ready = hydrated;

  const today = startOfToday();
  const todayKey = isoDate(today);
  const suggested = focusFor(today, data.settings).presetId;
  const planPresetId =
    data.plan && data.plan.date === todayKey ? data.plan.presetId : suggested;

  const api = useMemo<Store>(() => {
    const liveSession =
      data.session && data.session.date === todayKey && data.session.status === "active"
        ? data.session
        : null;

    function buildRecap(session: Session, held: string[], skipped: string[]): Recap {
      const heldMoves = held
        .map((id) => getStretch(id))
        .filter((stretch) => stretch !== undefined)
        .map((stretch) => ({
          id: stretch.id,
          name: stretch.name,
          area: stretch.areaLabel,
        }));
      const skippedMoves = skipped
        .map((id) => getStretch(id))
        .filter((stretch) => stretch !== undefined)
        .map((stretch) => ({ id: stretch.id, name: stretch.name }));
      const areas = [...new Set(heldMoves.map((move) => move.area))];
      const counted = session.kind === "daily" && heldMoves.length > 0;
      const finishedDates = data.finished.map((entry) => entry.date);
      const nextDates = counted
        ? [...new Set([...finishedDates, session.date])]
        : finishedDates;
      return {
        date: session.date,
        kind: session.kind,
        held: heldMoves,
        skipped: skippedMoves,
        areas,
        streak: currentStreak(nextDates, data.settings.restDay, today),
        tomorrow: tomorrowLine(today, data.settings),
        counted,
      };
    }

    return {
      ready,
      settings: data.settings,
      planPresetId,
      session: liveSession,
      finished: data.finished,
      recap: data.recap,
      lastReminder: data.lastReminder,
      viewingRest,
      setViewingRest,
      saveSetup: (settings) => {
        update((current) => ({ ...current, settings }));
      },
      setLength: (length) => {
        if (liveSession) return;
        update((current) => ({
          ...current,
          settings: { ...current.settings, length },
        }));
      },
      setPreset: (presetId) => {
        if (liveSession) return;
        update((current) => ({
          ...current,
          plan: { date: todayKey, presetId },
        }));
      },
      startSession: (kind = "daily") => {
        const length = data.settings.length;
        const moveIds =
          kind === "loosen" ? [...LOOSEN_MOVES] : sessionMoveIds(planPresetId, length);
        const session: Session = {
          date: todayKey,
          kind,
          presetId: kind === "loosen" ? "loosen" : planPresetId,
          length: kind === "loosen" ? 5 : length,
          moveIds,
          index: 0,
          side: "left",
          sides: {},
          held: [],
          skipped: [],
          status: "active",
        };
        update((current) => ({ ...current, session }));
      },
      startOver: () => {
        update((current) => ({ ...current, session: null }));
      },
      completeHold: () => {
        update((current) => {
          const session = current.session;
          if (!session || session.status !== "active") return current;
          const id = session.moveIds[session.index];
          const stretch = getStretch(id);
          const prev = session.sides[id] ?? emptySides();
          const sides = {
            ...session.sides,
            [id]: stretch?.sided
              ? { ...prev, [session.side]: true }
              : { left: true, right: true },
          };
          return { ...current, session: { ...session, sides } };
        });
      },
      setSide: (side) => {
        update((current) => {
          if (!current.session || current.session.status !== "active") return current;
          return { ...current, session: { ...current.session, side } };
        });
      },
      advance: () => {
        update((current) => {
          const session = current.session;
          if (!session || session.status !== "active") return current;
          const id = session.moveIds[session.index];
          const held = session.held.includes(id) ? session.held : [...session.held, id];
          if (session.index >= session.moveIds.length - 1) {
            const recap = buildRecap(session, held, session.skipped);
            const finished = recap.counted
              ? [
                  ...current.finished.filter((entry) => entry.date !== session.date),
                  { date: session.date, areas: recap.areas },
                ]
              : current.finished;
            return {
              ...current,
              finished,
              recap,
              session: { ...session, held, status: "done" },
            };
          }
          return {
            ...current,
            session: {
              ...session,
              held,
              index: session.index + 1,
              side: "left",
            },
          };
        });
      },
      skip: () => {
        update((current) => {
          const session = current.session;
          if (!session || session.status !== "active") return current;
          const id = session.moveIds[session.index];
          const skipped = session.skipped.includes(id)
            ? session.skipped
            : [...session.skipped, id];
          if (session.index >= session.moveIds.length - 1) {
            const recap = buildRecap(session, session.held, skipped);
            const finished = recap.counted
              ? [
                  ...current.finished.filter((entry) => entry.date !== session.date),
                  { date: session.date, areas: recap.areas },
                ]
              : current.finished;
            return {
              ...current,
              finished,
              recap,
              session: { ...session, skipped, status: "done" },
            };
          }
          return {
            ...current,
            session: {
              ...session,
              skipped,
              index: session.index + 1,
              side: "left",
            },
          };
        });
      },
      useAlternate: (id) => {
        update((current) => {
          const session = current.session;
          if (!session || session.status !== "active") return current;
          const moveIds = [...session.moveIds];
          moveIds[session.index] = id;
          for (let index = session.index + 1; index < moveIds.length; index += 1) {
            if (moveIds[index] === id) {
              moveIds.splice(index, 1);
              break;
            }
          }
          const sides = { ...session.sides };
          delete sides[id];
          return {
            ...current,
            session: { ...session, moveIds, side: "left", sides },
          };
        });
      },
      markReminded: (date) => {
        update((current) => {
          if (current.lastReminder === date) return current;
          return { ...current, lastReminder: date };
        });
      },
    };
    // today is derived from todayKey for the open session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, planPresetId, ready, todayKey, viewingRest]);

  return <StretchContext.Provider value={api}>{children}</StretchContext.Provider>;
}

export function useStretch(): Store {
  const value = useContext(StretchContext);
  if (!value) {
    throw new Error("useStretch must be used within StretchProvider");
  }
  return value;
}

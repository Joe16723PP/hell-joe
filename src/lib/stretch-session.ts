import { getStretch, type LengthMin, type StretchId } from "@/lib/catalog";
import { currentStreak, type Settings } from "@/lib/plan";

export type Side = "left" | "right";

export type StretchSession = {
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

export type StretchRecap = {
  date: string;
  kind: "daily" | "loosen";
  held: { id: string; name: string; area: string }[];
  skipped: { id: string; name: string }[];
  areas: string[];
  streak: number;
  counted: boolean;
};

export type FinishedStretch = {
  date: string;
  areas: string[];
};

function emptySides() {
  return { left: false, right: false };
}

function withId(list: string[], id: string) {
  return list.includes(id) ? list : [...list, id];
}

export function completeHold(session: StretchSession): StretchSession {
  if (session.status !== "active") return session;
  const id = session.moveIds[session.index] ?? "";
  const stretch = getStretch(id);
  const prev = session.sides[id] ?? emptySides();
  const sides = {
    ...session.sides,
    [id]: stretch?.sided ? { ...prev, [session.side]: true } : { left: true, right: true },
  };
  return { ...session, sides };
}

export function setSide(session: StretchSession, side: Side): StretchSession {
  if (session.status !== "active") return session;
  return { ...session, side };
}

function named(ids: string[]) {
  return ids
    .map((id) => getStretch(id))
    .filter((stretch) => stretch !== undefined)
    .map((stretch) => ({ id: stretch.id, name: stretch.name }));
}

export function buildStretchRecap(
  session: StretchSession,
  held: string[],
  skipped: string[],
  finishedDates: string[],
  settings: Pick<Settings, "restDay">,
  today: Date,
): StretchRecap {
  const heldMoves = named(held).map((move) => ({
    ...move,
    area: getStretch(move.id)?.area ?? "",
  }));
  const areas = [...new Set(heldMoves.map((move) => move.area))];
  const counted = session.kind === "daily" && heldMoves.length > 0;
  const nextDates = counted ? [...new Set([...finishedDates, session.date])] : finishedDates;
  return {
    date: session.date,
    kind: session.kind,
    held: heldMoves,
    skipped: named(skipped),
    areas,
    streak: currentStreak(nextDates, settings.restDay, today),
    counted,
  };
}

/** Marks the current move and either moves on or finishes the session. */
function step(
  session: StretchSession,
  list: "held" | "skipped",
  finishedDates: string[],
  settings: Pick<Settings, "restDay">,
  today: Date,
): { session: StretchSession; recap: StretchRecap | null } {
  if (session.status !== "active") return { session, recap: null };
  const id = session.moveIds[session.index] ?? "";
  const next = { ...session, [list]: withId(session[list], id) };
  if (session.index < session.moveIds.length - 1) {
    return {
      session: { ...next, index: session.index + 1, side: "left" },
      recap: null,
    };
  }
  const recap = buildStretchRecap(next, next.held, next.skipped, finishedDates, settings, today);
  return { session: { ...next, status: "done" }, recap };
}

export function advance(
  session: StretchSession,
  finishedDates: string[],
  settings: Pick<Settings, "restDay">,
  today: Date,
) {
  return step(session, "held", finishedDates, settings, today);
}

export function skip(
  session: StretchSession,
  finishedDates: string[],
  settings: Pick<Settings, "restDay">,
  today: Date,
) {
  return step(session, "skipped", finishedDates, settings, today);
}

export function replaceMove(session: StretchSession, id: StretchId): StretchSession {
  if (session.status !== "active") return session;
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
  return { ...session, moveIds, side: "left", sides };
}

/** Adds today's session to the finished list when the recap counts toward the streak. */
export function finishedAfter(finished: FinishedStretch[], recap: StretchRecap | null): FinishedStretch[] {
  if (!recap?.counted) return finished;
  return [
    ...finished.filter((entry) => entry.date !== recap.date),
    { date: recap.date, areas: recap.areas },
  ];
}

"use client";

import { useRouter } from "next/navigation";
import { Check, Dumbbell, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBarbellMove, upcomingSession, type Suggestion } from "@/lib/barbell";
import { useI18n } from "@/lib/i18n/provider";
import { isoDate, startOfToday } from "@/lib/plan";
import { useStretch } from "@/lib/store";

const HABITS = [
  "barbell.habitProtein",
  "barbell.habitWalk",
  "barbell.habitSleep",
  "barbell.habitPace",
  "barbell.habitRest",
] as const;

export function BarbellCard() {
  const router = useRouter();
  const i18n = useI18n();
  const { t } = i18n;
  const { barbellSession, barbellRecords, barbellProgress, startBarbell } = useStretch();
  const today = startOfToday();
  const todayKey = isoDate(today);
  const plan = upcomingSession(today);
  const letter = t(plan.workout === "A" ? "barbell.workoutA" : "barbell.workoutB");
  const active = barbellSession?.status === "active";
  const done = !active && barbellRecords.some((record) => record.date === todayKey);
  const moveCount = active ? barbellSession.slots.length : plan.workout === "A" ? 5 : 6;

  function begin() {
    if (!active) startBarbell();
    router.push("/barbell");
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Dumbbell className="size-4" aria-hidden />
            {t("barbell.kicker")}
          </p>
          <h2 className="mt-1 text-2xl font-semibold">{t("barbell.title")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("barbell.body")}</p>
        </div>
        <p className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
          {t("barbell.duration")}
        </p>
      </div>
      <p className="mt-4 font-medium">
        {plan.scheduledToday
          ? t("barbell.today", { workout: letter })
          : t("barbell.next", { day: i18n.weekday(plan.date.getDay()), workout: letter })}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{t("barbell.week")}</p>
      <p className="mt-3 text-sm leading-relaxed">{progressText(t, barbellProgress.pending, (id) => {
        const move = getBarbellMove(id);
        return move ? i18n.barbell(move).name : id;
      })}</p>
      <div className="mt-4">
        <h3 className="text-sm font-semibold">{t("barbell.habitsTitle")}</h3>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
          {HABITS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {done ? (
          <p className="inline-flex items-center gap-2 font-semibold text-primary">
            <Check className="size-4" aria-hidden />
            {t("barbell.doneToday")}
          </p>
        ) : (
          <Button type="button" size="lg" className="h-12 rounded-2xl px-5 font-semibold" onClick={begin}>
            <Play className="size-4 fill-current" aria-hidden />
            {active
              ? t("barbell.resume", { current: barbellSession.index + 1, total: moveCount })
              : t("barbell.practice", { workout: letter })}
          </Button>
        )}
      </div>
    </section>
  );
}

function progressText(
  t: ReturnType<typeof useI18n>["t"],
  step: Suggestion | null,
  nameFor: (id: string) => string,
) {
  if (!step || step.kind === "learn") return t("barbell.progressLearn");
  if (step.kind === "hold") return t("barbell.progressHold");
  if (step.kind === "deload") return t("barbell.progressDeload");
  const name = nameFor(step.moveId);
  if (step.kind === "reps") return t("barbell.progressReps", { name, count: step.to });
  if (step.kind === "tempo") return t("barbell.progressTempo", { name });
  if (step.kind === "set") return t("barbell.progressSet", { name });
  return t("barbell.progressVariation", { name });
}

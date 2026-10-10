"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Clock,
  Flame,
  Layers,
  Moon,
  Play,
  RotateCcw,
  Settings2,
  Shuffle,
  Sparkles,
} from "lucide-react";
import { ExerciseCard, ExerciseIntro, RestBrace, doseLine } from "@/components/exercise-home";
import { StretchFigure } from "@/components/stretch-figure";
import { SetupScreen } from "@/components/setup-screen";
import { WeekStrip } from "@/components/week-strip";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PRESETS,
  type LengthMin,
  type StretchId,
  getPreset,
  getStretch,
  holdSecondsForLength,
} from "@/lib/catalog";
import { exerciseMoveIds, presetIdFor } from "@/lib/exercise";
import { useI18n } from "@/lib/i18n/provider";
import {
  currentStreak,
  focusFor,
  isShortPreset,
  isoDate,
  nextStretchDate,
  recentAreas,
  sessionMoveIds,
  startOfToday,
  weekDates,
  weekProgress,
} from "@/lib/plan";
import { useStretch } from "@/lib/store";
import { cn } from "@/lib/utils";

export function HomeScreen() {
  const { ready, settings } = useStretch();
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);

  if (!ready) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8" aria-busy>
        <p className="sr-only">{t("home.loading")}</p>
        <div className="h-5 w-48 animate-pulse rounded-full bg-muted" />
        <div className="mt-5 h-72 animate-pulse rounded-[2rem] bg-muted" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="h-48 animate-pulse rounded-3xl bg-muted" />
          <div className="h-48 animate-pulse rounded-3xl bg-muted" />
        </div>
      </main>
    );
  }

  if (!settings.setupDone || editing) {
    return (
      <SetupScreen
        onDone={() => setEditing(false)}
        onCancel={settings.setupDone ? () => setEditing(false) : undefined}
      />
    );
  }

  if (!settings.exerciseIntroSeen) return <ExerciseIntro />;

  return <TodayHome onEditSetup={() => setEditing(true)} />;
}

function greetingKey(hour: number) {
  if (hour < 12) return "greeting.morning" as const;
  if (hour < 18) return "greeting.afternoon" as const;
  return "greeting.evening" as const;
}

function TodayHome({ onEditSetup }: { onEditSetup: () => void }) {
  const router = useRouter();
  const i18n = useI18n();
  const { t } = i18n;
  const {
    settings,
    planPresetId,
    session,
    finished,
    recap,
    viewingRest,
    setViewingRest,
    setLength,
    setPreset,
    startSession,
    startOver,
    exerciseFamily,
    exerciseSession,
    exerciseFinished,
    setExerciseOn,
    startExercise,
  } = useStretch();
  const today = startOfToday();
  const todayKey = isoDate(today);
  const actual = focusFor(today, settings);
  const showRest = actual.rest || viewingRest;
  const preset = getPreset(planPresetId) ?? PRESETS[2];
  const presetCopy = i18n.preset(preset);
  const inProgress = session?.kind === "daily";
  const moveIds = inProgress ? session.moveIds : sessionMoveIds(preset.id, settings.length);
  const seconds = holdSecondsForLength(inProgress ? session.length : settings.length);
  const hero = getStretch(moveIds[0] ?? "hip-flexor");
  const finishedDates = finished.map((entry) => entry.date);
  const streak = currentStreak(finishedDates, settings.restDay, today);
  const exerciseDates = exerciseFinished.map((entry) => entry.date);
  const exerciseStreak = currentStreak(exerciseDates, settings.restDay, today);
  const exerciseInProgress = exerciseSession?.kind === "exercise";
  const exerciseDone = exerciseDates.includes(todayKey) && !exerciseInProgress;
  const exercisePresetId = presetIdFor(settings.exerciseOption, exerciseFamily);
  const exerciseIds = exerciseInProgress
    ? exerciseSession.moveIds
    : exerciseMoveIds(exercisePresetId, settings.exerciseLength);
  const hasFinished = finished.length > 0;
  const doneToday = finishedDates.includes(todayKey) && !inProgress;
  const weekAreas = recentAreas(finished, today);
  const week = weekProgress(today, settings.restDay, finishedDates);
  const restPreview = viewingRest && !actual.rest;
  const restDate = weekDates(today).find((date) => date.getDay() === settings.restDay) ?? today;
  const nextStretch = nextStretchDate(showRest ? restDate : today, settings.restDay);
  const nextFocus = focusFor(nextStretch, settings);

  function begin(kind: "daily" | "loosen" = "daily") {
    if (session?.kind === kind) {
      router.push("/session");
      return;
    }
    startSession(kind);
    router.push("/session");
  }

  function beginExercise(kind: "exercise" | "brace" = "exercise") {
    if (kind === "exercise" && exerciseDone) {
      router.push("/recap/exercise");
      return;
    }
    if (exerciseSession?.kind === kind) {
      router.push("/exercise");
      return;
    }
    startExercise(kind);
    router.push("/exercise");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{i18n.longDate(today)}</p>
          <p className="mt-0.5 font-heading text-2xl font-semibold sm:text-3xl">
            {t(greetingKey(new Date().getHours()))}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StreakPill label={t("home.streak")} value={i18n.days(streak)} lit={streak > 0} />
          {settings.exerciseOn && (
            <StreakPill
              label={t("home.exerciseStreak")}
              value={i18n.days(exerciseStreak)}
              lit={exerciseStreak > 0}
            />
          )}
        </div>
      </div>

      {showRest ? (
        <>
          <RestHome
            preview={restPreview}
            restName={i18n.weekday(settings.restDay)}
            nextLabel={`${i18n.weekday(nextStretch.getDay())} · ${i18n.focus(nextFocus.key)}`}
            streak={streak}
            hasFinished={hasFinished}
            loosenActive={session?.kind === "loosen"}
            onStart={() => begin("loosen")}
            onBack={restPreview ? () => setViewingRest(false) : undefined}
          />
          {settings.exerciseOn && (
            <div className="mt-6">
              <RestBrace active={exerciseSession?.kind === "brace"} onStart={() => beginExercise("brace")} />
            </div>
          )}
        </>
      ) : (
        <>
          <section className="relative mt-5 overflow-hidden rounded-[2rem] hero-gradient text-white shadow-xl shadow-primary/20">
            <div className="grid items-center gap-4 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:p-10">
              <div className="relative z-10">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
                  <Sparkles className="size-4 text-sun" aria-hidden />
                  {t("home.todayFocus")}
                </p>
                <h1 className="mt-4 text-5xl leading-[1.05] font-semibold text-balance sm:text-6xl">
                  {i18n.focus(actual.key)}
                </h1>
                <ul className="mt-5 flex flex-wrap gap-2 text-sm font-medium">
                  <HeroChip icon={<Clock className="size-4" aria-hidden />}>
                    {i18n.minutes(inProgress ? session.length : settings.length)}
                  </HeroChip>
                  <HeroChip icon={<Layers className="size-4" aria-hidden />}>
                    {i18n.moves(moveIds.length)}
                  </HeroChip>
                  <HeroChip>{presetCopy.name}</HeroChip>
                </ul>

                {doneToday && (
                  <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white/15 p-4 backdrop-blur">
                    <span className="grid size-9 shrink-0 animate-pop place-items-center rounded-full bg-sun text-[#5a3100]">
                      <Check className="size-5" strokeWidth={3} aria-hidden />
                    </span>
                    <div>
                      <p className="font-semibold">{t("home.doneTitle")}</p>
                      <p className="text-sm text-white/85">{t("home.doneBody")}</p>
                      {recap && recap.date === todayKey && (
                        <Link
                          href="/recap"
                          className="mt-1 inline-flex min-h-9 items-center gap-1 text-sm font-semibold underline underline-offset-4"
                        >
                          {t("home.seeRecap")}
                          <ArrowRight className="size-4" aria-hidden />
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => begin("daily")}
                    className="h-14 rounded-2xl bg-white px-7 text-lg font-semibold whitespace-normal text-primary shadow-lg shadow-black/10 hover:bg-white/90"
                  >
                    <Play className="size-5 fill-current" aria-hidden />
                    {inProgress
                      ? t("home.resume", {
                          current: session.index + 1,
                          total: session.moveIds.length,
                        })
                      : doneToday
                        ? t("home.again")
                        : t("home.start")}
                  </Button>
                  {inProgress && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      onClick={startOver}
                      className="h-14 rounded-2xl text-white hover:bg-white/15 hover:text-white"
                    >
                      <RotateCcw className="size-4" aria-hidden />
                      {t("home.startOver")}
                    </Button>
                  )}
                  {settings.exerciseOn && (
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      onClick={() => beginExercise("exercise")}
                      className="h-14 rounded-2xl border-white/40 bg-white/10 px-7 text-lg font-semibold whitespace-normal text-white hover:bg-white/20 hover:text-white"
                    >
                      <Play className="size-5 fill-current" aria-hidden />
                      {exerciseInProgress
                        ? t("home.exerciseResume", {
                            current: exerciseSession.index + 1,
                            total: exerciseSession.moveIds.length,
                          })
                        : exerciseDone
                          ? t("home.exerciseDone")
                          : t("home.exerciseStart")}
                    </Button>
                  )}
                </div>
                {settings.exerciseOn && !exerciseDone && !exerciseInProgress && (
                  <p className="mt-3 text-sm text-white/85">
                    {doseLine(t, settings.exerciseOption, settings.exerciseLength, exerciseIds)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setViewingRest(true)}
                  className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-white/85 underline-offset-4 hover:underline"
                >
                  <Moon className="size-4" aria-hidden />
                  {t("home.seeRest", { day: i18n.weekday(settings.restDay) })}
                </button>
              </div>

              <figure className="relative mx-auto w-full max-w-xs sm:max-w-sm">
                <div className="absolute inset-4 animate-breathe rounded-full bg-white/40 blur-2xl" aria-hidden />
                <div className="relative stage rounded-full p-4 shadow-2xl shadow-black/20 ring-8 ring-white/15">
                  {hero && <StretchFigure id={hero.id} priority sizes="384px" />}
                </div>
                {hero && (
                  <figcaption className="mt-3 text-center text-sm text-white/85">
                    {t("home.firstMove")} · <span className="font-semibold text-white">{i18n.stretch(hero).name}</span>
                  </figcaption>
                )}
              </figure>
            </div>
          </section>

          {settings.exerciseOn && (
            <div className="mt-6">
              <ExerciseCard family={exerciseFamily} session={exerciseInProgress ? exerciseSession : null} doneToday={exerciseDone} />
            </div>
          )}

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
              <div className="flex items-baseline justify-between gap-3 px-1">
                <h2 className="text-2xl font-semibold">{t("home.plan")}</h2>
                <p className="text-sm text-muted-foreground">{i18n.moves(moveIds.length)}</p>
              </div>
              {isShortPreset(moveIds.length, settings.length) && (
                <p className="mt-2 px-1 text-sm text-muted-foreground">{t("home.lengthNote")}</p>
              )}
              <ol className="mt-4 space-y-2">
                {moveIds.map((id, index) => {
                  const stretch = getStretch(id as StretchId);
                  if (!stretch) return null;
                  const copy = i18n.stretch(stretch);
                  const done = inProgress && index < session.index;
                  const current = inProgress && index === session.index;
                  return (
                    <li
                      key={`${id}-${index}`}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl p-2 pr-3 transition-colors",
                        current ? "bg-secondary" : "hover:bg-muted/60",
                      )}
                    >
                      <div className="relative w-14 shrink-0 overflow-hidden rounded-xl stage sm:w-16">
                        <StretchFigure id={stretch.id} sizes="96px" />
                        <span
                          className={cn(
                            "absolute top-1 left-1 grid size-5 place-items-center rounded-full text-[0.7rem] font-bold",
                            done ? "bg-primary text-white" : "bg-white text-primary shadow-sm",
                          )}
                        >
                          {done ? <Check className="size-3" strokeWidth={3} aria-hidden /> : index + 1}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{copy.name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {copy.areaLabel} · {copy.positionLabel}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground/75">
                        {stretch.sided
                          ? t("common.secSide", { count: seconds })
                          : t("common.sec", { count: seconds })}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>

            <div className="flex flex-col gap-6">
              <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  {t("home.length")}
                </h2>
                <div
                  className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1"
                  role="group"
                  aria-label={t("home.lengthGroup")}
                >
                  {([5, 10, 15] as LengthMin[]).map((value) => {
                    const active = settings.length === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={active}
                        disabled={inProgress}
                        onClick={() => setLength(value)}
                        className={cn(
                          "min-h-12 rounded-xl text-base font-semibold transition-all disabled:opacity-50",
                          active ? "bg-card text-primary shadow-sm" : "text-foreground/70 hover:text-foreground",
                        )}
                      >
                        {t("common.min", { count: value })}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                      {t("home.preset")}
                    </h2>
                    <p className="mt-1 font-heading text-2xl font-semibold">{presetCopy.name}</p>
                  </div>
                </div>
                <p className="mt-1 text-base leading-relaxed text-foreground/80">{presetCopy.blurb}</p>
                <div className="mt-4">
                  {inProgress ? (
                    <p className="text-sm text-muted-foreground">{t("home.inProgressLocked")}</p>
                  ) : (
                    <PresetSwap currentId={preset.id} onSelect={setPreset} />
                  )}
                </div>
              </section>
            </div>
          </div>
        </>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <WeekStrip
            today={today}
            restDay={settings.restDay}
            tightAreas={settings.tightAreas}
            finishedDates={finishedDates}
            exerciseDates={exerciseDates}
            selected={showRest ? "rest" : "today"}
            onSelectToday={() => setViewingRest(false)}
            onSelectRest={() => setViewingRest(true)}
          />
        </div>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-semibold">{t("home.thisWeek")}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatTile
              icon={<Flame className="size-5" aria-hidden />}
              tone="coral"
              label={t("home.streak")}
              value={i18n.days(streak)}
            />
            <StatTile
              icon={<CalendarCheck className="size-5" aria-hidden />}
              tone="teal"
              label={t("home.weekDays")}
              value={t("home.weekDone", { done: week.done, total: week.total })}
            >
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(week.done / Math.max(1, week.total)) * 100}%` }}
                />
              </div>
            </StatTile>
          </div>
          {hasFinished ? (
            <>
              {weekAreas.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground">{t("home.areas7")}</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {weekAreas.map((area) => (
                      <li key={area} className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                        {i18n.area(area)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("home.streakRule")}</p>
            </>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("home.noSessions")}</p>
          )}
          {recap && recap.date === todayKey && !doneToday && (
            <Link href="/recap" className="mt-3 inline-flex min-h-11 items-center gap-1 font-semibold text-primary">
              {t("home.seeRecap")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </section>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{t("common.disclaimer")}</p>
        <div className="flex flex-wrap gap-2">
          {!settings.exerciseOn && (
            <Button type="button" variant="outline" onClick={() => setExerciseOn(true)} className="rounded-full">
              {t("home.exerciseShow")}
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onEditSetup} className="rounded-full">
            <Settings2 className="size-4" aria-hidden />
            {t("home.editSetup")}
          </Button>
        </div>
      </div>
    </main>
  );
}

function HeroChip({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
      {icon}
      {children}
    </li>
  );
}

function StreakPill({ label, value, lit }: { label: string; value: string; lit: boolean }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm",
        lit ? "border-coral/30 bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground",
      )}
    >
      <Flame className={cn("size-5", lit && "fill-coral text-coral")} aria-hidden />
      <span className="text-sm font-semibold">
        {label} {value}
      </span>
    </div>
  );
}

function StatTile({
  icon,
  tone,
  label,
  value,
  children,
}: {
  icon: React.ReactNode;
  tone: "coral" | "teal";
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl p-4", tone === "coral" ? "bg-accent" : "bg-secondary")}>
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl bg-white",
          tone === "coral" ? "text-coral" : "text-primary",
        )}
      >
        {icon}
      </span>
      <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="font-heading text-2xl font-semibold">{value}</p>
      {children}
    </div>
  );
}

function RestHome({
  preview,
  restName,
  nextLabel,
  streak,
  hasFinished,
  loosenActive,
  onStart,
  onBack,
}: {
  preview: boolean;
  restName: string;
  nextLabel: string;
  streak: number;
  hasFinished: boolean;
  loosenActive: boolean;
  onStart: () => void;
  onBack?: () => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  return (
    <section className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1e3a5f] via-[#2b4c7e] to-[#5a4f99] p-6 text-white shadow-xl shadow-[#2b4c7e]/25 sm:p-8">
        <Moon className="absolute -top-6 -right-6 size-40 text-white/10" aria-hidden />
        {preview && (
          <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium">{t("rest.preview")}</p>
        )}
        <h1 className="mt-3 text-5xl leading-none font-semibold sm:text-6xl">{t("rest.title")}</h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">
          {t("rest.body", { day: restName })}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
          <Flame className="size-4 text-sun" aria-hidden />
          {hasFinished ? t("rest.streakKept", { days: i18n.days(streak) }) : t("rest.noStreak")}
        </p>
        <div className="mt-6 rounded-2xl bg-white/10 p-4">
          <p className="text-sm text-white/75">{t("rest.next")}</p>
          <p className="font-heading text-xl font-semibold">{nextLabel}</p>
        </div>
        {onBack && (
          <Button
            type="button"
            size="lg"
            onClick={onBack}
            className="mt-6 h-12 rounded-2xl bg-white px-6 font-semibold text-[#2b4c7e] hover:bg-white/90"
          >
            {t("rest.back")}
          </Button>
        )}
      </div>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="inline-flex rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
          {t("rest.optional")}
        </p>
        <h2 className="mt-3 text-3xl font-semibold">{t("rest.loosenTitle")}</h2>
        <p className="mt-2 text-base leading-relaxed text-foreground/80">{t("rest.loosenBody")}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(["neck", "shoulder", "cat"] as StretchId[]).map((id) => (
            <div key={id} className="overflow-hidden rounded-2xl stage">
              <StretchFigure id={id} sizes="200px" />
            </div>
          ))}
        </div>
        <Button type="button" size="lg" className="mt-5 h-12 rounded-2xl px-6" onClick={onStart}>
          <Play className="size-4 fill-current" aria-hidden />
          {loosenActive ? t("rest.resumeLoosen") : t("rest.startLoosen")}
        </Button>
      </div>
    </section>
  );
}

function PresetSwap({
  currentId,
  onSelect,
}: {
  currentId: string;
  onSelect: (id: string) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full rounded-2xl sm:w-auto")}
      >
        <Shuffle className="size-4" aria-hidden />
        {t("home.swapPreset")}
      </DialogTrigger>
      <DialogContent className="rounded-3xl p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-semibold">{t("home.swapTitle")}</DialogTitle>
          <DialogDescription>{t("home.swapDesc")}</DialogDescription>
        </DialogHeader>
        <ul className="grid gap-2">
          {PRESETS.map((preset) => {
            const selected = preset.id === currentId;
            const copy = i18n.preset(preset);
            return (
              <li key={preset.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    onSelect(preset.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                    selected ? "border-primary bg-secondary" : "border-border bg-background hover:bg-muted",
                  )}
                >
                  <div className="w-14 shrink-0 overflow-hidden rounded-xl stage">
                    <StretchFigure id={preset.order[0]} sizes="96px" />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-lg font-semibold">{copy.name}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                      {copy.where} · {copy.blurb}
                    </span>
                  </span>
                  {selected && <Check className="size-5 shrink-0 text-primary" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

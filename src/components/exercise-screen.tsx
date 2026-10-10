"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Check, Flag, HeartPulse, Play, Plus, ScanEye, SkipForward, X } from "lucide-react";
import { ExerciseFigure } from "@/components/stretch-figure";
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
  afterExercisePause,
  afterExerciseWork,
  alternateExercise,
  doseFor,
  getExercise,
  skipExerciseMove,
  type ExerciseMove,
  type ExerciseSessionState,
} from "@/lib/exercise";
import { useCountdown } from "@/lib/countdown";
import { splitMistake } from "@/lib/form-cues";
import { playHoldTick, primeHoldTick, shouldPlayHoldTick } from "@/lib/hold-tick";
import { useI18n } from "@/lib/i18n/provider";
import { POSE_PAUSE_SECONDS } from "@/lib/pose-pause";
import { useStretch, type ExerciseSession } from "@/lib/store";
import { useWakeLock } from "@/lib/wake-lock";
import { cn } from "@/lib/utils";

export function ExerciseSessionScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const {
    ready,
    exerciseSession,
    countExerciseRep,
    finishExerciseEffort,
    advanceExercisePause,
    skipExercise,
    useExerciseAlternate,
  } = useStretch();

  if (!ready) return <Skeleton label={t("exercise.loading")} />;
  if (!exerciseSession) {
    return (
      <Empty
        title={t("exercise.noSessionTitle")}
        body={t("exercise.noSessionBody")}
        href="/"
        cta={t("common.backToToday")}
      />
    );
  }

  return (
    <ExerciseRunner
      session={exerciseSession}
      note={exerciseSession.kind === "brace" ? t("move.loosenNote") : null}
      backHref="/"
      backLabel={t("move.leave")}
      onCount={() => {
        const next =
          exerciseSession.reps + 1 >= exerciseSession.repsTarget
            ? afterExerciseWork({ ...exerciseSession, reps: exerciseSession.reps + 1 })
            : null;
        countExerciseRep();
        if (next?.status === "done") router.push("/recap/exercise");
      }}
      onFinish={() => {
        const next = afterExerciseWork(exerciseSession);
        finishExerciseEffort();
        if (next.status === "done") router.push("/recap/exercise");
      }}
      onPause={() => advanceExercisePause()}
      onSkip={() => {
        const next = skipExerciseMove(exerciseSession);
        skipExercise();
        if (next.status === "done") router.push("/recap/exercise");
      }}
      onAlternate={useExerciseAlternate}
    />
  );
}

export function ExerciseLibraryMove({ id }: { id: string }) {
  const { t } = useI18n();
  const { settings } = useStretch();
  const move = getExercise(id);
  const dose = doseFor(move?.option ?? "core", settings.exerciseLength);
  const [session, setSession] = useState<ExerciseSessionState | null>(null);

  if (!move) {
    return (
      <Empty
        title={t("move.libMissingTitle")}
        href="/library"
        cta={t("move.backLibrary")}
      />
    );
  }

  const live =
    session ??
    ({
      date: "",
      kind: "exercise",
      option: move.option,
      presetId: "library",
      length: settings.exerciseLength,
      moveIds: [move.id],
      index: 0,
      setIndex: 0,
      sets: dose.sets,
      repsTarget: dose.reps,
      holdSeconds: dose.hold,
      restSeconds: dose.rest,
      side: "left",
      reps: 0,
      phase: "work",
      completed: [],
      skipped: [],
      status: "active",
    } satisfies ExerciseSessionState);

  if (live.status === "done") {
    return (
      <Empty title={t("exercise.libDone")} href="/library" cta={t("move.backLibrary")} />
    );
  }

  return (
    <ExerciseRunner
      session={live}
      note={t("exercise.libNote")}
      backHref="/library"
      backLabel={t("move.backLibrary")}
      onCount={() => {
        setSession((current) => {
          const base = current ?? live;
          const nextReps = base.reps + 1;
          if (nextReps >= base.repsTarget) return afterExerciseWork({ ...base, reps: nextReps });
          return { ...base, reps: nextReps };
        });
      }}
      onFinish={() => setSession((current) => afterExerciseWork(current ?? live))}
      onPause={() => setSession((current) => afterExercisePause(current ?? live))}
      onSkip={() => setSession((current) => skipExerciseMove(current ?? live))}
      onAlternate={(nextId) =>
        setSession((current) => {
          const base = current ?? live;
          return { ...base, moveIds: [nextId], reps: 0, side: "left", setIndex: 0, phase: "work" };
        })
      }
    />
  );
}

function ExerciseRunner({
  session,
  note,
  backHref,
  backLabel,
  onCount,
  onFinish,
  onPause,
  onSkip,
  onAlternate,
}: {
  session: ExerciseSession;
  note: string | null;
  backHref: string;
  backLabel: string;
  onCount: () => void;
  onFinish: () => void;
  onPause: () => void;
  onSkip: () => void;
  onAlternate: (id: string) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const id = session.moveIds[session.index] ?? "";
  const move = getExercise(id);
  const [formOpen, setFormOpen] = useState(false);
  const [skipOpen, setSkipOpen] = useState(false);
  const [holdRunning, setHoldRunning] = useState(false);
  const frozen = formOpen || skipOpen;

  if (!move) {
    return <Empty title={t("move.missing")} href="/" cta={t("common.backToToday")} />;
  }

  const copy = i18n.exercise(move);
  const alternate = alternateExercise(move.id, session.moveIds);
  const pausing = session.phase !== "work";
  const pinMobile = pausing || holdRunning || session.reps > 0;
  const pace =
    move.effort === "hold"
      ? t("exercise.holdFor", { count: session.holdSeconds })
      : session.option === "muscle"
        ? t("exercise.paceMuscle")
        : t("exercise.paceCore");

  return (
    <main
      className={cn(
        "mx-auto w-full max-w-6xl px-4 py-4 md:px-8 md:py-8 md:pb-10",
        pinMobile ? "pb-52" : "pb-8",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-primary">
          {t("move.kicker", { current: session.index + 1, total: session.moveIds.length })}
          {" · "}
          {t("exercise.setOf", { current: session.setIndex + 1, total: session.sets })}
        </p>
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-foreground/75 hover:bg-muted"
        >
          <X className="size-4" aria-hidden />
          {backLabel}
        </Link>
      </div>

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-border stage p-2 shadow-sm sm:p-4 lg:sticky lg:top-24">
          {move.sided && (
            <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
              <ArrowLeftRight className="size-4 text-primary" aria-hidden />
              {session.side === "left" ? t("move.leftSide") : t("move.rightSide")}
            </span>
          )}
          <ExerciseFigure id={move.id} priority className="mx-auto max-w-md" />
        </div>

        <div>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
              {copy.optionLabel}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">{copy.patternLabel}</span>
          </div>
          <h1 className="mt-3 text-4xl leading-tight font-semibold text-balance sm:text-5xl">{copy.name}</h1>
          <p className="mt-3 text-base leading-relaxed text-foreground/80">{pace}</p>
          <div className="mt-4 rounded-2xl bg-accent p-3">
            <p className="text-xs font-semibold tracking-wide text-accent-foreground/80 uppercase">
              {t("move.feelIt")}
            </p>
            <p className="font-semibold text-accent-foreground">
              {copy.plain} <span className="font-normal opacity-80">· {copy.anatomical}</span>
            </p>
          </div>
          {note && <p className="mt-3 text-sm text-muted-foreground">{note}</p>}
          {copy.setup && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-primary">{t("move.startHere")}. </span>
              {copy.setup}
            </p>
          )}
          <ol className="mt-5 space-y-3">
            {copy.steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-base leading-relaxed">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-muted p-3 text-sm leading-relaxed">
            <HeartPulse className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden />
            {t("exercise.pain")}
          </p>

          <div
            className={cn(
              pinMobile
                ? "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_-12px_rgb(14_122_103/0.25)] backdrop-blur-xl md:static md:z-auto md:mt-4 md:border-0 md:bg-transparent md:p-0 md:shadow-none"
                : "mt-5 md:mt-4",
            )}
          >
            {pausing ? (
              <Countdown
                key={`${session.phase}-${session.index}-${session.setIndex}-${session.side}`}
                seconds={session.phase === "rest" ? session.restSeconds : POSE_PAUSE_SECONDS}
                frozen={frozen}
                label={(left) => pauseLabel(t, session, left)}
                onDone={onPause}
              />
            ) : move.effort === "reps" ? (
              <RepControls
                done={session.reps}
                total={session.repsTarget}
                onCount={onCount}
                onFinish={onFinish}
              />
            ) : (
              <HoldControls
                key={`${move.id}-${session.side}-${session.setIndex}`}
                seconds={session.holdSeconds}
                frozen={frozen}
                onFinish={onFinish}
                onRunningChange={setHoldRunning}
              />
            )}
            <div className="mt-2 flex gap-2">
              <FormDialog move={move} open={formOpen} onOpenChange={setFormOpen} />
              <SkipDialog
                move={move}
                alternate={alternate}
                open={skipOpen}
                onOpenChange={setSkipOpen}
                onSkip={onSkip}
                onAlternate={onAlternate}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function pauseLabel(
  t: (key: "exercise.sideIn" | "exercise.restIn" | "exercise.nextIn" | "move.rightSide" | "move.leftSide", vars?: { side: string; count: number }) => string,
  session: ExerciseSession,
  left: number,
) {
  if (session.phase === "side-pause") {
    const side = session.side === "left" ? t("move.rightSide") : t("move.leftSide");
    return t("exercise.sideIn", { side, count: left });
  }
  if (session.phase === "rest") return t("exercise.restIn", { count: left, side: "" });
  return t("exercise.nextIn", { count: left, side: "" });
}

function RepControls({
  done,
  total,
  onCount,
  onFinish,
}: {
  done: number;
  total: number;
  onCount: () => void;
  onFinish: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-border bg-card p-4 shadow-sm">
      <p className="min-w-16 font-heading text-3xl font-semibold tabular-nums">
        {t("exercise.repsOf", { done, total })}
      </p>
      <Button type="button" size="lg" className="h-12 rounded-2xl font-semibold" onClick={onCount}>
        <Plus className="size-4" aria-hidden />
        {t("exercise.countRep")}
      </Button>
      <Button type="button" size="lg" variant="outline" className="h-12 rounded-2xl font-semibold" onClick={onFinish}>
        <Check className="size-4" aria-hidden />
        {t("exercise.doneEarly")}
      </Button>
    </div>
  );
}

function HoldControls({
  seconds,
  frozen,
  onFinish,
  onRunningChange,
}: {
  seconds: number;
  frozen: boolean;
  onFinish: () => void;
  onRunningChange: (running: boolean) => void;
}) {
  const { t } = useI18n();
  const hold = useCountdown(seconds, {
    paused: frozen,
    onSecond: (_, previous) => {
      if (shouldPlayHoldTick({ running: true, audible: true, remaining: previous, starting: false })) {
        playHoldTick();
      }
    },
    onDone: onFinish,
  });
  useWakeLock(hold.active);
  const { remaining, running } = hold;

  useEffect(() => {
    onRunningChange(running);
    return () => onRunningChange(false);
  }, [onRunningChange, running]);

  useEffect(() => {
    primeHoldTick();
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm">
      <p className="font-heading text-4xl font-semibold tabular-nums" aria-hidden>{remaining}</p>
      <CountdownStatus text={spokenCountdown(remaining)} />
      {!running ? (
        <Button
          type="button"
          size="lg"
          className="h-12 rounded-2xl font-semibold"
          onClick={() => {
            if (shouldPlayHoldTick({ running: true, audible: true, remaining, starting: true })) playHoldTick();
            hold.start();
          }}
        >
          <Play className="size-4 fill-current" aria-hidden />
          {t("move.startHold")}
        </Button>
      ) : (
        <Button type="button" size="lg" className="h-12 rounded-2xl font-semibold" onClick={hold.finish}>
          <Check className="size-4" aria-hidden />
          {t("move.finishEarly")}
        </Button>
      )}
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="h-12 rounded-2xl font-semibold"
        aria-label={t("move.add15Label")}
        onClick={() => hold.add(15, 90)}
      >
        <Plus className="size-4" aria-hidden />
        {t("move.add15")}
      </Button>
    </div>
  );
}

function Countdown({
  seconds,
  frozen,
  label,
  onDone,
}: {
  seconds: number;
  frozen: boolean;
  label: (left: number) => string;
  onDone: () => void;
}) {
  const { t } = useI18n();
  const countdown = useCountdown(seconds, {
    paused: frozen,
    autoStart: true,
    onSecond: (remaining) => {
      if (remaining === 0) playHoldTick();
    },
    onDone,
  });
  useWakeLock(countdown.active);
  const left = countdown.remaining;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div>
        <p className="font-heading text-4xl font-semibold tabular-nums text-coral" aria-hidden>{left}</p>
        <CountdownStatus text={spokenCountdown(left)} />
        <p className="text-sm font-semibold text-coral">{label(left)}</p>
      </div>
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="h-12 rounded-2xl font-semibold"
        onClick={countdown.finish}
      >
        <SkipForward className="size-4" aria-hidden />
        {t("exercise.skipRest")}
      </Button>
    </div>
  );
}

function FormDialog({
  move,
  open,
  onOpenChange,
}: {
  move: ExerciseMove;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const copy = i18n.exercise(move);
  const parts = splitMistake(copy.mistake);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 flex-1 rounded-2xl font-semibold")}>
        <ScanEye className="size-4" aria-hidden />
        {t("form.button")}
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[2rem] p-5 sm:max-w-4xl sm:p-7">
        <DialogHeader>
          <DialogTitle className="font-heading text-3xl font-semibold">{t("form.title")}</DialogTitle>
          <DialogDescription className="text-base">
            <span className="font-semibold text-foreground">{copy.name}</span> · {t("form.intro")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <figure className="overflow-hidden rounded-3xl border border-[#f6c2b5] bg-[#fff3ef] p-3">
            <ExerciseFigure id={move.id} variant="mistake" sizes="360px" />
            <figcaption className="mt-2 text-sm font-semibold text-[#8f2a17]">
              {t("form.wrong")}
              {parts.wrong ? ` · ${parts.wrong}` : ""}
            </figcaption>
          </figure>
          <figure className="overflow-hidden rounded-3xl border border-[#b5e5cb] bg-[#eefaf3] p-3">
            <ExerciseFigure id={move.id} sizes="360px" />
            <figcaption className="mt-2 text-sm font-semibold text-[#145c3d]">
              {t("form.right")}
              {parts.fix ? ` · ${parts.fix}` : ""}
            </figcaption>
          </figure>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SkipDialog({
  move,
  alternate,
  open,
  onOpenChange,
  onSkip,
  onAlternate,
}: {
  move: ExerciseMove;
  alternate: ExerciseMove | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSkip: () => void;
  onAlternate: (id: string) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const area = i18n.exercise(move).patternLabel;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-12 flex-1 rounded-2xl font-semibold")}>
        <SkipForward className="size-4" aria-hidden />
        {t("skip.button")}
      </DialogTrigger>
      <DialogContent className="rounded-3xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-semibold">{t("skip.title")}</DialogTitle>
          <DialogDescription className="text-base">
            {t("exercise.pain")} {alternate ? t("skip.alt", { area }) : t("skip.noAlt", { area })}
          </DialogDescription>
        </DialogHeader>
        {alternate && (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
            <div className="w-20 shrink-0 overflow-hidden rounded-xl stage">
              <ExerciseFigure id={alternate.id} sizes="96px" />
            </div>
            <div>
              <p className="font-semibold">{i18n.exercise(alternate).name}</p>
              <p className="text-sm text-muted-foreground">{i18n.exercise(alternate).plain}</p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {alternate && (
            <Button
              type="button"
              size="lg"
              className="h-12 rounded-2xl font-semibold"
              onClick={() => {
                onOpenChange(false);
                onAlternate(alternate.id);
              }}
            >
              {t("skip.use")}
            </Button>
          )}
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12 rounded-2xl font-semibold"
            onClick={() => {
              onOpenChange(false);
              onSkip();
            }}
          >
            {t("skip.moveOn")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Spoken every 10 seconds and at the end, so a screen reader is not interrupted each second. */
function spokenCountdown(value: number) {
  return value % 10 === 0 ? String(value) : null;
}

function CountdownStatus({ text }: { text: string | null }) {
  return (
    <span className="sr-only" aria-live="polite">
      {text ?? ""}
    </span>
  );
}

function Skeleton({ label }: { label: string }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6" aria-busy>
      <p className="sr-only">{label}</p>
      <div className="h-72 animate-pulse rounded-[2rem] bg-muted" />
    </main>
  );
}

function Empty({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body?: string;
  href: string;
  cta: string;
}) {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-secondary text-primary">
        <Flag className="size-7" aria-hidden />
      </div>
      <h1 className="mt-5 text-4xl font-semibold">{title}</h1>
      {body && <p className="mt-3 text-lg leading-relaxed text-foreground/80">{body}</p>}
      <Link href={href} className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex h-12 rounded-2xl px-6")}>
        {cta}
      </Link>
    </main>
  );
}

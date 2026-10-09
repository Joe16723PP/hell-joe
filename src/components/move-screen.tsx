"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  ArrowRight,
  Check,
  Flag,
  Footprints,
  HeartPulse,
  Play,
  Plus,
  ScanEye,
  SkipForward,
  X,
} from "lucide-react";
import { FormCompare } from "@/components/form-check";
import { StretchFigure } from "@/components/stretch-figure";
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
  alternateFor,
  holdSecondsForLength,
  type Stretch,
  type StretchId,
  getStretch,
} from "@/lib/catalog";
import { playHoldTick, primeHoldTick, shouldPlayHoldTick } from "@/lib/hold-tick";
import { useI18n } from "@/lib/i18n/provider";
import {
  POSE_PAUSE_SECONDS,
  poseIsComplete,
  shouldPauseForNextPose,
  stepPosePause,
} from "@/lib/pose-pause";
import { useStretch, type Side } from "@/lib/store";
import { cn } from "cn";

export function SessionMove() {
  const router = useRouter();
  const { t } = useI18n();
  const { ready, session, completeHold, setSide, advance, skip, useAlternate } = useStretch();

  if (!ready) {
    return <MoveSkeleton label={t("move.loading")} />;
  }

  if (!session) {
    return (
      <EmptyState
        title={t("move.noSessionTitle")}
        body={t("move.noSessionBody")}
        href="/"
        cta={t("common.backToToday")}
      />
    );
  }

  const id = session.moveIds[session.index];
  const stretch = getStretch(id);
  if (!stretch) {
    return <EmptyState title={t("move.missing")} href="/" cta={t("common.backToToday")} />;
  }

  const sides = session.sides[stretch.id] ?? { left: false, right: false };
  const alternate = alternateFor(stretch.id, session.moveIds);
  const seconds = session.kind === "loosen" ? 30 : holdSecondsForLength(session.length);
  const last = session.index === session.moveIds.length - 1;
  const counter = { current: session.index + 1, total: session.moveIds.length };

  return (
    <MoveView
      stretch={stretch}
      seconds={seconds}
      side={session.side}
      sides={sides}
      mirror={stretch.sided && session.side === "right"}
      kicker={t(session.kind === "loosen" ? "move.kickerLoosen" : "move.kicker", counter)}
      progress={{ index: session.index, total: session.moveIds.length }}
      note={session.kind === "loosen" ? t("move.loosenNote") : null}
      backHref="/"
      backLabel={t("move.leave")}
      nextLabel={last ? t("move.finish") : t("move.next")}
      tick
      onCompleteHold={completeHold}
      onSetSide={setSide}
      onNext={() => {
        advance();
        if (last) router.push("/recap");
      }}
      onSkip={() => {
        skip();
        if (last) router.push("/recap");
      }}
      alternate={alternate}
      onAlternate={useAlternate}
    />
  );
}

export function LibraryMove({ stretchId }: { stretchId: string }) {
  const { t } = useI18n();
  const stretch = getStretch(stretchId);
  const [side, setSide] = useState<Side>("left");
  const [sides, setSides] = useState({ left: false, right: false });

  if (!stretch) {
    return (
      <EmptyState
        title={t("move.libMissingTitle")}
        href="/library"
        cta={t("move.backLibrary")}
      />
    );
  }

  return (
    <MoveView
      stretch={stretch}
      seconds={stretch.seconds}
      side={side}
      sides={sides}
      mirror={stretch.sided && side === "right"}
      kicker={t("move.fromLibrary")}
      progress={null}
      note={t("move.libraryNote")}
      backHref="/library"
      backLabel={t("move.backLibrary")}
      nextLabel={t("move.held")}
      tick={false}
      onCompleteHold={() => {
        setSides((current) =>
          stretch.sided
            ? { ...current, [side]: true }
            : { left: true, right: true },
        );
      }}
      onSetSide={setSide}
      onNext={null}
      onSkip={null}
      alternate={null}
      onAlternate={null}
    />
  );
}

function MoveSkeleton({ label }: { label: string }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-8" aria-busy>
      <p className="sr-only">{label}</p>
      <div className="h-2 animate-pulse rounded-full bg-muted" />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="aspect-[9/10] animate-pulse rounded-[2rem] bg-muted" />
        <div className="space-y-3">
          <div className="h-10 w-2/3 animate-pulse rounded-xl bg-muted" />
          <div className="h-40 animate-pulse rounded-3xl bg-muted" />
        </div>
      </div>
    </main>
  );
}

function EmptyState({
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

function MoveView({
  stretch,
  seconds,
  side,
  sides,
  mirror,
  kicker,
  progress,
  note,
  backHref,
  backLabel,
  nextLabel,
  tick,
  onCompleteHold,
  onSetSide,
  onNext,
  onSkip,
  alternate,
  onAlternate,
}: {
  stretch: Stretch;
  seconds: number;
  side: Side;
  sides: { left: boolean; right: boolean };
  mirror: boolean;
  kicker: string;
  progress: { index: number; total: number } | null;
  note: string | null;
  backHref: string;
  backLabel: string;
  nextLabel: string;
  tick: boolean;
  onCompleteHold: () => void;
  onSetSide: (side: Side) => void;
  onNext: (() => void) | null;
  onSkip: (() => void) | null;
  alternate: Stretch | null;
  onAlternate: ((id: StretchId) => void) | null;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const copy = i18n.stretch(stretch);
  const bothDone = poseIsComplete({
    sided: stretch.sided,
    left: sides.left,
    right: sides.right,
  });
  const sideDone = stretch.sided ? sides[side] : sides.left;
  const otherSide: Side = side === "left" ? "right" : "left";
  const needsOther = stretch.sided && sideDone && !sides[otherSide];
  const [formOpen, setFormOpen] = useState(false);
  const [skipOpen, setSkipOpen] = useState(false);
  const frozen = formOpen || skipOpen;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-4 pb-44 md:px-8 md:py-8 md:pb-10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-primary">{kicker}</p>
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-foreground/75 hover:bg-muted"
        >
          <X className="size-4" aria-hidden />
          {backLabel}
        </Link>
      </div>
      {progress && (
        <div
          className="mt-2 flex gap-1.5"
          role="progressbar"
          aria-label={t("move.progress")}
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.index}
        >
          {Array.from({ length: progress.total }, (_, index) => (
            <span
              key={index}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                index < progress.index
                  ? "bg-primary"
                  : index === progress.index
                    ? "bg-gradient-to-r from-primary to-[#5eead4]"
                    : "bg-muted",
              )}
            />
          ))}
        </div>
      )}

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="lg:sticky lg:top-24">
          <div className="relative overflow-hidden rounded-[2rem] border border-border stage p-2 shadow-sm sm:p-4">
            {stretch.sided && (
              <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
                <ArrowLeftRight className="size-4 text-primary" aria-hidden />
                {side === "left" ? t("move.leftSide") : t("move.rightSide")}
              </span>
            )}
            <StretchFigure id={stretch.id} mirror={mirror} priority className="mx-auto max-w-md" />
          </div>
          {copy.setup && (
            <figure className="mt-3 flex items-center gap-3 rounded-3xl border border-border bg-card p-3 shadow-sm">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
                <Footprints className="size-6" aria-hidden />
              </div>
              <figcaption className="text-sm leading-relaxed sm:text-base">
                <span className="block font-semibold text-primary">{t("move.startHere")}</span>
                {copy.setup}
              </figcaption>
            </figure>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
              {copy.areaLabel}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground/75">
              {copy.positionLabel}
            </span>
          </div>
          <h1 className="mt-3 text-4xl leading-tight font-semibold text-balance sm:text-5xl">{copy.name}</h1>

          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-accent p-3">
            <span className="relative grid size-10 shrink-0 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-coral/25 [animation-duration:2.4s]" aria-hidden />
              <span className="size-4 rounded-full bg-coral ring-4 ring-coral/25" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-accent-foreground/80 uppercase">
                {t("move.feelIt")}
              </p>
              <p className="font-semibold text-accent-foreground">
                {copy.plain} <span className="font-normal opacity-80">· {copy.anatomical}</span>
              </p>
            </div>
          </div>
          {note && <p className="mt-3 text-sm text-muted-foreground">{note}</p>}

          <section className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{t("move.steps")}</h2>
            <ol className="mt-3 space-y-3">
              {copy.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-base leading-relaxed sm:text-lg">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-muted p-3 text-sm leading-relaxed">
              <HeartPulse className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden />
              {t("common.painStop")}
            </p>
          </section>

          <SideStatus stretch={stretch} side={side} sides={sides} onSetSide={onSetSide} />

          <HoldControls
            seconds={seconds}
            resetKey={`${stretch.id}-${side}`}
            sideDone={sideDone}
            bothDone={bothDone}
            needsOther={needsOther}
            otherSide={otherSide}
            nextLabel={nextLabel}
            tick={tick}
            onCompleteHold={onCompleteHold}
            onSwitch={() => onSetSide(otherSide)}
            onNext={onNext}
            frozen={frozen}
          />

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <FormDialog stretch={stretch} onOpenChange={setFormOpen} />
            {onSkip && (
              <SkipDialog
                stretch={stretch}
                alternate={alternate}
                onSkip={onSkip}
                onAlternate={onAlternate}
                onOpenChange={setSkipOpen}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function SideStatus({
  stretch,
  side,
  sides,
  onSetSide,
}: {
  stretch: Stretch;
  side: Side;
  sides: { left: boolean; right: boolean };
  onSetSide: (side: Side) => void;
}) {
  const { t } = useI18n();
  if (!stretch.sided) {
    return (
      <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm font-semibold">
        <ArrowLeftRight className="size-4 text-primary" aria-hidden />
        {t("common.bothTogether")}
      </p>
    );
  }
  const untouched = !sides.left && !sides.right;
  return (
    <div className="mt-5">
      <div className="flex gap-2">
        {(["left", "right"] as Side[]).map((item) => {
          const done = sides[item];
          const current = item === side;
          return (
            <span
              key={item}
              className={cn(
                "inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 px-3 text-sm font-semibold sm:flex-none sm:px-5",
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : current
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground",
              )}
              aria-current={current ? "step" : undefined}
            >
              {done && <Check className="size-4" strokeWidth={3} aria-hidden />}
              {item === "left" ? t("move.left") : t("move.right")}
            </span>
          );
        })}
      </div>
      {untouched && side === "left" && (
        <button
          type="button"
          className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
          onClick={() => onSetSide("right")}
        >
          {t("move.startRight")}
        </button>
      )}
    </div>
  );
}

function HoldRing({
  value,
  total,
  size,
  tone,
  children,
}: {
  value: number;
  total: number;
  size: number;
  tone: "primary" | "coral" | "done";
  children: ReactNode;
}) {
  const stroke = size > 100 ? 12 : 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0;
  const color = tone === "coral" ? "var(--coral)" : "var(--primary)";
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - (tone === "done" ? 1 : fraction))}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

function HoldControls({
  seconds,
  resetKey,
  sideDone,
  bothDone,
  needsOther,
  otherSide,
  nextLabel,
  tick,
  onCompleteHold,
  onSwitch,
  onNext,
  frozen,
}: {
  seconds: number;
  resetKey: string;
  sideDone: boolean;
  bothDone: boolean;
  needsOther: boolean;
  otherSide: Side;
  nextLabel: string;
  tick: boolean;
  onCompleteHold: () => void;
  onSwitch: () => void;
  onNext: (() => void) | null;
  frozen: boolean;
}) {
  const { t } = useI18n();
  const [remaining, setRemaining] = useState(seconds);
  const [total, setTotal] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(resetKey);
  const doneRef = useRef(false);
  const remainingRef = useRef(remaining);
  const onNextRef = useRef(onNext);
  const advancedRef = useRef(false);
  const pauseIntervalRef = useRef<number | null>(null);
  const pauseLeftRef = useRef<number | null>(null);
  const canAdvance = onNext !== null;
  const pausing = shouldPauseForNextPose({ poseComplete: bothDone, canAdvance });
  const pauseToken = pausing ? resetKey : "";
  const [pauseTokenState, setPauseTokenState] = useState(pauseToken);
  const [pauseLeft, setPauseLeft] = useState<number | null>(pausing ? POSE_PAUSE_SECONDS : null);

  if (pauseTokenState !== pauseToken) {
    setPauseTokenState(pauseToken);
    setPauseLeft(pausing ? POSE_PAUSE_SECONDS : null);
  }

  if (timerKey !== resetKey) {
    setTimerKey(resetKey);
    setRemaining(seconds);
    setTotal(seconds);
    setRunning(false);
  }

  useEffect(() => {
    doneRef.current = false;
    advancedRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  useEffect(() => {
    pauseLeftRef.current = pauseLeft;
  }, [pauseLeft]);

  useEffect(() => {
    if (!pausing || frozen) return;
    let left = pauseLeftRef.current ?? POSE_PAUSE_SECONDS;
    let cancelled = false;
    const id = window.setInterval(() => {
      if (cancelled) return;
      const step = stepPosePause(left);
      left = step.secondsLeft;
      setPauseLeft(left);
      if (!step.advance) return;
      window.clearInterval(id);
      if (pauseIntervalRef.current === id) pauseIntervalRef.current = null;
      if (advancedRef.current) return;
      advancedRef.current = true;
      onNextRef.current?.();
    }, 1000);
    pauseIntervalRef.current = id;
    return () => {
      cancelled = true;
      window.clearInterval(id);
      if (pauseIntervalRef.current === id) pauseIntervalRef.current = null;
    };
  }, [frozen, pausing, resetKey]);

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  useEffect(() => {
    if (!tick) return;
    primeHoldTick();
  }, [tick]);

  useEffect(() => {
    if (!running || !tick || frozen) return;
    const id = window.setInterval(() => {
      if (
        shouldPlayHoldTick({
          running: true,
          audible: tick,
          remaining: remainingRef.current,
          starting: false,
        })
      ) {
        playHoldTick();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [frozen, running, tick]);

  useEffect(() => {
    if (!running || frozen) return;
    const id = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.setTimeout(() => {
            setRunning(false);
            if (!doneRef.current) {
              doneRef.current = true;
              onCompleteHold();
            }
          }, 0);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [frozen, onCompleteHold, running]);

  function finishEarly() {
    setRunning(false);
    setRemaining(0);
    if (!doneRef.current) {
      doneRef.current = true;
      onCompleteHold();
    }
  }

  function startHold() {
    if (
      shouldPlayHoldTick({
        running: true,
        audible: tick,
        remaining,
        starting: true,
      })
    ) {
      playHoldTick();
    }
    setRunning(true);
  }

  function addFifteen() {
    const next = Math.min(90, remaining + 15);
    setRemaining((current) => Math.min(90, current + 15));
    setTotal((current) => Math.max(current, next));
  }

  function goNext() {
    if (!onNext || advancedRef.current) return;
    advancedRef.current = true;
    if (pauseIntervalRef.current !== null) {
      window.clearInterval(pauseIntervalRef.current);
      pauseIntervalRef.current = null;
    }
    onNext();
  }

  const pauseShown = pausing ? (pauseLeft ?? POSE_PAUSE_SECONDS) : null;
  const tone = pauseShown !== null ? "coral" : sideDone ? "done" : "primary";
  const ringValue = pauseShown !== null ? pauseShown : remaining;
  const ringTotal = pauseShown !== null ? POSE_PAUSE_SECONDS : total;
  const caption = running ? t("move.ringHolding") : sideDone ? t("move.ringDone") : t("move.ringReady");
  const pauseLabel = pauseShown !== null ? t("move.nextIn", { count: pauseShown }) : null;

  const actions = (compact: boolean) => (
    <div className={cn("flex flex-wrap gap-2", compact && "justify-end")}>
      {!sideDone && !running && (
        <Button type="button" size="lg" className="h-12 rounded-2xl px-5 font-semibold" onClick={startHold}>
          <Play className="size-4 fill-current" aria-hidden />
          {t("move.startHold")}
        </Button>
      )}
      {running && (
        <Button type="button" size="lg" className="h-12 rounded-2xl px-5 font-semibold" onClick={finishEarly}>
          <Check className="size-4" strokeWidth={3} aria-hidden />
          {t("move.finishEarly")}
        </Button>
      )}
      {!sideDone && (
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="h-12 rounded-2xl px-4 font-semibold"
          aria-label={t("move.add15Label")}
          onClick={addFifteen}
        >
          <Plus className="size-4" aria-hidden />
          {t("move.add15")}
        </Button>
      )}
      {needsOther && (
        <Button type="button" size="lg" className="h-12 rounded-2xl px-5 font-semibold whitespace-normal" onClick={onSwitch}>
          <ArrowLeftRight className="size-4" aria-hidden />
          {otherSide === "left" ? t("move.switchLeft") : t("move.switchRight")}
        </Button>
      )}
      {bothDone && onNext && (
        <Button type="button" size="lg" className="h-12 rounded-2xl px-5 font-semibold" onClick={goNext}>
          {nextLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      )}
      {bothDone && !onNext && (
        <p className="self-center text-sm font-medium text-primary">{t("move.libDone")}</p>
      )}
    </div>
  );

  return (
    <>
      <div className="mt-5 hidden items-center gap-6 rounded-3xl border border-border bg-card p-5 shadow-sm md:flex">
        <HoldRing value={ringValue} total={ringTotal} size={148} tone={tone}>
          <div aria-live="polite">
            <p className="font-heading text-4xl font-semibold tabular-nums">
              {pauseShown !== null ? pauseShown : formatHold(remaining)}
            </p>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {pauseShown !== null ? t("move.next") : caption}
            </p>
          </div>
        </HoldRing>
        <div className="min-w-0 flex-1">
          {pauseLabel && <p className="mb-3 font-heading text-xl font-semibold text-coral">{pauseLabel}</p>}
          {actions(false)}
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_-12px_rgb(14_122_103/0.25)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <HoldRing value={ringValue} total={ringTotal} size={68} tone={tone}>
            <p className="font-heading text-base font-semibold tabular-nums" aria-hidden>
              {pauseShown !== null ? pauseShown : formatHold(remaining)}
            </p>
          </HoldRing>
          <div className="min-w-0 flex-1">
            {pauseLabel && (
              <p className="mb-1.5 text-right text-sm font-semibold text-coral" aria-live="polite">
                {pauseLabel}
              </p>
            )}
            {actions(true)}
          </div>
        </div>
      </div>
    </>
  );
}

function FormDialog({
  stretch,
  onOpenChange,
}: {
  stretch: Stretch;
  onOpenChange: (open: boolean) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const copy = i18n.stretch(stretch);
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 rounded-2xl font-semibold")}>
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
        <FormCompare stretch={stretch} />
      </DialogContent>
    </Dialog>
  );
}

function SkipDialog({
  stretch,
  alternate,
  onSkip,
  onAlternate,
  onOpenChange,
}: {
  stretch: Stretch;
  alternate: Stretch | null;
  onSkip: () => void;
  onAlternate: ((id: StretchId) => void) | null;
  onOpenChange?: (open: boolean) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const [open, setOpen] = useState(false);
  const areaLabel = i18n.area(stretch.area);
  const areaLower = i18n.locale === "en" ? areaLabel.toLowerCase() : areaLabel;
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        onOpenChange?.(next);
      }}
    >
      <DialogTrigger className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-12 rounded-2xl font-semibold text-foreground/75")}>
        <SkipForward className="size-4" aria-hidden />
        {t("skip.button")}
      </DialogTrigger>
      <DialogContent className="rounded-3xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-semibold">{t("skip.title")}</DialogTitle>
          <DialogDescription className="text-base">
            {t("skip.body")}{" "}
            {alternate ? t("skip.alt", { area: areaLower }) : t("skip.noAlt", { area: areaLower })}
          </DialogDescription>
        </DialogHeader>
        {alternate && (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
            <div className="w-20 shrink-0 overflow-hidden rounded-xl stage">
              <StretchFigure id={alternate.id} sizes="96px" />
            </div>
            <div>
              <p className="font-semibold">{i18n.stretch(alternate).name}</p>
              <p className="text-sm text-muted-foreground">{i18n.stretch(alternate).plain}</p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {alternate && onAlternate && (
            <Button
              type="button"
              size="lg"
              className="h-12 rounded-2xl font-semibold"
              onClick={() => {
                onAlternate(alternate.id);
                setOpen(false);
              }}
            >
              {t("skip.use")}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 rounded-2xl font-semibold"
            onClick={() => {
              setOpen(false);
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

function formatHold(total: number) {
  const safe = Math.max(0, total);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

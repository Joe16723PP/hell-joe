"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  positionLabel,
  type Stretch,
  type StretchId,
  getStretch,
} from "@/lib/catalog";
import { playHoldTick, primeHoldTick, shouldPlayHoldTick } from "@/lib/hold-tick";
import {
  POSE_PAUSE_SECONDS,
  poseIsComplete,
  posePauseLabel,
  shouldPauseForNextPose,
  stepPosePause,
} from "@/lib/pose-pause";
import { useStretch, type Side } from "@/lib/store";
import { cn } from "cn";

export function SessionMove() {
  const router = useRouter();
  const { ready, session, completeHold, setSide, advance, skip, useAlternate } = useStretch();

  if (!ready) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-lg">Opening the move…</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-heading text-4xl">No session in progress</h1>
        <p className="mt-3 text-lg leading-relaxed">
          Today’s session is on the home screen. An unfinished session does not count.
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex")}>
          Back to today
        </Link>
      </main>
    );
  }

  const id = session.moveIds[session.index];
  const stretch = getStretch(id);
  if (!stretch) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-heading text-4xl">That move is missing</h1>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex")}>
          Back to today
        </Link>
      </main>
    );
  }

  const sides = session.sides[stretch.id] ?? { left: false, right: false };
  const alternate = alternateFor(stretch.id, session.moveIds);
  const seconds = session.kind === "loosen" ? 30 : holdSecondsForLength(session.length);
  const last = session.index === session.moveIds.length - 1;

  return (
    <MoveView
      stretch={stretch}
      seconds={seconds}
      side={session.side}
      sides={sides}
      mirror={stretch.sided && session.side === "right"}
      kicker={
        session.kind === "loosen"
          ? `Easy loosen · ${session.index + 1} of ${session.moveIds.length}`
          : `Move ${session.index + 1} of ${session.moveIds.length}`
      }
      note={
        session.kind === "loosen"
          ? "Optional. Doing this does not count as a streak day."
          : null
      }
      backHref="/"
      backLabel="Leave for later"
      nextLabel={last ? "Finish session" : "Next move"}
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
  const stretch = getStretch(stretchId);
  const [side, setSide] = useState<Side>("left");
  const [sides, setSides] = useState({ left: false, right: false });

  if (!stretch) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-heading text-4xl">That stretch is not in this set</h1>
        <p className="mt-3 text-lg">That one is not in the library.</p>
        <Link href="/library" className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex")}>
          Back to the library
        </Link>
      </main>
    );
  }

  return (
    <MoveView
      stretch={stretch}
      seconds={stretch.seconds}
      side={side}
      sides={sides}
      mirror={stretch.sided && side === "right"}
      kicker="From the library"
      note="This does not replace today’s session."
      backHref="/library"
      backLabel="Back to the library"
      nextLabel="Held"
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

function MoveView({
  stretch,
  seconds,
  side,
  sides,
  mirror,
  kicker,
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
  const bothDone = poseIsComplete({
    sided: stretch.sided,
    left: sides.left,
    right: sides.right,
  });
  const sideDone = stretch.sided ? sides[side] : sides.left;
  const otherSide: Side = side === "left" ? "right" : "left";
  const needsOther = stretch.sided && sideDone && !sides[otherSide];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-4 pb-36 md:px-8 md:py-8 md:pb-10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm tracking-[0.14em] text-muted-foreground uppercase">{kicker}</p>
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center text-base underline decoration-border underline-offset-4"
        >
          {backLabel}
        </Link>
      </div>

      <div className="mt-4 grid items-start gap-6 lg:grid-cols-2">
        <div>
          <div className="rounded-[1.75rem] border border-border bg-[#f7f1e6] p-2 sm:p-4">
            <StretchFigure id={stretch.id} mirror={mirror} className="mx-auto max-w-md" />
          </div>
          {stretch.setup && (
            <figure className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <div className="w-24 shrink-0 sm:w-28">
                <StretchFigure id={stretch.id} variant="setup" />
              </div>
              <figcaption className="text-sm leading-relaxed sm:text-base">
                <span className="block font-medium">Start here</span>
                {stretch.setup}
              </figcaption>
            </figure>
          )}
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            {stretch.areaLabel} · {positionLabel(stretch.position)}
          </p>
          <h1 className="mt-1 font-heading text-4xl leading-tight text-balance sm:text-5xl">
            {stretch.name}
          </h1>
          <p className="mt-4 flex flex-wrap items-baseline gap-x-2 text-lg">
            <span className="inline-block size-2.5 translate-y-px rounded-full bg-[#c45c3e]" aria-hidden />
            <span className="font-medium">{stretch.plain}</span>
            <span className="text-muted-foreground">· {stretch.anatomical}</span>
          </p>
          {note && <p className="mt-3 text-base text-muted-foreground">{note}</p>}

          <ol className="mt-6 space-y-3">
            {stretch.steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-base leading-relaxed sm:text-lg">
                <span className="font-heading text-xl text-primary">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <p className="mt-5 text-base">Pain means stop. A stretch should feel like steady tension.</p>

          <SideStatus
            stretch={stretch}
            side={side}
            sides={sides}
            onSetSide={onSetSide}
          />

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
          />

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <FormDialog stretch={stretch} />
            {onSkip && (
              <SkipDialog
                stretch={stretch}
                alternate={alternate}
                onSkip={onSkip}
                onAlternate={onAlternate}
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
  if (!stretch.sided) {
    return <p className="mt-6 text-base font-medium">Both sides together</p>;
  }
  const untouched = !sides.left && !sides.right;
  return (
    <div className="mt-6">
      <p className="text-base font-medium">
        {side === "left" ? "Left side" : "Right side"}
        {sides[side] ? " · held" : ""}
      </p>
      <p className="text-sm text-muted-foreground">
        {sides.left ? "Left done" : "Left to do"}
        {" · "}
        {sides.right ? "Right done" : "Right to do"}
      </p>
      {untouched && side === "left" && (
        <button
          type="button"
          className="mt-1 inline-flex min-h-11 items-center text-base underline decoration-border underline-offset-4"
          onClick={() => onSetSide("right")}
        >
          Start with the right side
        </button>
      )}
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
}) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(resetKey);
  const doneRef = useRef(false);
  const remainingRef = useRef(remaining);
  const onNextRef = useRef(onNext);
  const advancedRef = useRef(false);
  const pauseIntervalRef = useRef<number | null>(null);
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
    if (!pausing) return;
    let left = POSE_PAUSE_SECONDS;
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
  }, [pausing, resetKey]);

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  useEffect(() => {
    if (!tick) return;
    primeHoldTick();
  }, [tick]);

  useEffect(() => {
    if (!running || !tick) return;
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
  }, [running, tick]);

  useEffect(() => {
    if (!running) return;
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
  }, [onCompleteHold, running]);

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
  const clock = pauseShown !== null ? (
    <p className="font-heading text-4xl leading-tight text-balance" aria-live="polite">
      {posePauseLabel(pauseShown)}
    </p>
  ) : (
    <p className="font-heading text-6xl tabular-nums leading-none" aria-live="polite">
      {formatHold(remaining)}
    </p>
  );

  const actions = (
    <div className="flex flex-wrap gap-2">
      {!sideDone && !running && (
        <Button type="button" size="lg" onClick={startHold}>
          Start hold
        </Button>
      )}
      {running && (
        <Button type="button" size="lg" onClick={finishEarly}>
          Finish early
        </Button>
      )}
      {!sideDone && (
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={() => setRemaining((current) => Math.min(90, current + 15))}
        >
          Add 15 seconds
        </Button>
      )}
      {needsOther && (
        <Button type="button" size="lg" className="whitespace-normal" onClick={onSwitch}>
          Switch to the {otherSide} side
        </Button>
      )}
      {bothDone && onNext && (
        <Button type="button" size="lg" onClick={goNext}>
          {nextLabel}
        </Button>
      )}
      {bothDone && !onNext && (
        <p className="self-center text-base">Hold done. Today’s session is unchanged.</p>
      )}
    </div>
  );

  return (
    <>
      <div className="mt-6 hidden md:block">
        {clock}
        <div className="mt-4">{actions}</div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          {pauseShown !== null ? (
            <p className="font-heading text-xl leading-tight text-balance" aria-live="polite">
              {posePauseLabel(pauseShown)}
            </p>
          ) : (
            <p className="font-heading text-4xl tabular-nums" aria-hidden>
              {formatHold(remaining)}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">{actions}</div>
        </div>
      </div>
    </>
  );
}

function FormDialog({ stretch }: { stretch: Stretch }) {
  return (
    <Dialog>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
        Check your form
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Check your form</DialogTitle>
          <DialogDescription>{stretch.mistake}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <figure className="rounded-2xl bg-[#f7f1e6] p-2">
            <StretchFigure id={stretch.id} variant="mistake" />
            <figcaption className="px-1 pb-1 text-center text-sm">Usual mistake</figcaption>
          </figure>
          <figure className="rounded-2xl bg-[#f7f1e6] p-2">
            <StretchFigure id={stretch.id} variant="hold" />
            <figcaption className="px-1 pb-1 text-center text-sm">Aim for this</figcaption>
          </figure>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SkipDialog({
  stretch,
  alternate,
  onSkip,
  onAlternate,
}: {
  stretch: Stretch;
  alternate: Stretch | null;
  onSkip: () => void;
  onAlternate: ((id: StretchId) => void) | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
        Skip this move
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Skip this move</DialogTitle>
          <DialogDescription>
            If it hurts, stop. Pain is not part of the stretch.
            {alternate
              ? ` Here is another one for the ${stretch.areaLabel.toLowerCase()}.`
              : ` This set has no second stretch for the ${stretch.areaLabel.toLowerCase()}.`}
          </DialogDescription>
        </DialogHeader>
        {alternate && (
          <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <div className="w-20 shrink-0">
              <StretchFigure id={alternate.id} />
            </div>
            <p className="text-base">{alternate.name}</p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {alternate && onAlternate && (
            <Button
              type="button"
              onClick={() => {
                onAlternate(alternate.id);
                setOpen(false);
              }}
            >
              Use this instead
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOpen(false);
              onSkip();
            }}
          >
            Move on
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

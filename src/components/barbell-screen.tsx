"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, HeartPulse, X } from "lucide-react";
import { ExerciseFigure } from "@/components/stretch-figure";
import { MoveDemo } from "@/components/move-demo";
import { getMoveDemoFrames } from "@/lib/move-demo";
import { Button } from "@/components/ui/button";
import { displayedChecks, getBarbellMove } from "@/lib/barbell";
import type { BarbellSession } from "@/lib/barbell-session";
import { useCountdown } from "@/lib/countdown";
import { useI18n } from "@/lib/i18n/provider";
import { useStretch } from "@/lib/store";
import { cn } from "@/lib/utils";

const SAFETY = [
  "barbell.safety1",
  "barbell.safety2",
  "barbell.safety3",
  "barbell.safety4",
  "barbell.safety5",
  "barbell.safety6",
] as const;

const WARMUP = [
  "barbell.warmup1",
  "barbell.warmup2",
  "barbell.warmup3",
  "barbell.warmup4",
  "barbell.warmup5",
  "barbell.warmup6",
  "barbell.warmup7",
] as const;

const COOLDOWN = ["barbell.cooldown1", "barbell.cooldown2", "barbell.cooldown3", "barbell.cooldown4"] as const;

const EXCLUDED = ["barbell.excluded1", "barbell.excluded2", "barbell.excluded3", "barbell.excluded4"] as const;

export function BarbellScreen() {
  const store = useStretch();
  const { t } = useI18n();
  if (!store.ready) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10" aria-busy>
        <p className="sr-only">{t("home.loading")}</p>
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
      </main>
    );
  }
  const session = store.barbellSession;
  if (!session) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <h1 className="text-4xl font-semibold">{t("barbell.title")}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{t("barbell.medical")}</p>
        <Button type="button" size="lg" className="mt-6 h-12 rounded-2xl" onClick={store.startBarbell}>
          {t("barbell.continue")}
        </Button>
      </main>
    );
  }
  if (session.status === "done") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <h1 className="text-4xl font-semibold">{t("barbell.savedTitle")}</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">{t("barbell.savedBody")}</p>
        <Link href="/" className="mt-6 inline-flex min-h-11 items-center font-semibold text-primary">
          {t("barbell.backHome")}
        </Link>
      </main>
    );
  }
  if (session.phase === "safety") {
    return (
      <FlagList
        title={t("barbell.safetyTitle")}
        body={t("barbell.safetyBody")}
        note={t("barbell.medical")}
        items={SAFETY.map((key) => t(key))}
        flags={session.safety}
        onToggle={store.toggleBarbellSafety}
        onContinue={store.confirmBarbellSafety}
        extraTitle={t("barbell.excludedTitle")}
        extra={EXCLUDED.map((key) => t(key))}
      />
    );
  }
  if (session.phase === "warmup") {
    return (
      <FlagList
        title={t("barbell.warmupTitle")}
        body={t("barbell.warmupBody")}
        items={WARMUP.map((key) => t(key))}
        flags={session.warmup}
        onToggle={store.toggleBarbellWarmup}
        onContinue={store.confirmBarbellWarmup}
      />
    );
  }
  if (session.phase === "cooldown") {
    return (
      <FlagList
        title={t("barbell.cooldownTitle")}
        body={t("barbell.medical")}
        items={COOLDOWN.map((key) => t(key))}
        flags={session.cooldown}
        onToggle={store.toggleBarbellCooldown}
        onContinue={store.confirmBarbellCooldown}
      />
    );
  }
  if (session.phase === "log") return <Log session={session} />;
  if (session.phase === "rest") return <Rest session={session} />;
  return <Move session={session} />;
}

function FlagList({
  title,
  body,
  note,
  items,
  flags,
  onToggle,
  onContinue,
  extraTitle,
  extra,
}: {
  title: string;
  body: string;
  note?: string;
  items: string[];
  flags: boolean[];
  onToggle: (index: number) => void;
  onContinue: () => void;
  extraTitle?: string;
  extra?: string[];
}) {
  const { t } = useI18n();
  const ready = flags.every(Boolean);
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 pb-28 md:px-8 md:py-10">
      <TopBar />
      <h1 className="mt-4 text-4xl font-semibold">{title}</h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">{body}</p>
      {note && <p className="mt-3 text-sm leading-relaxed">{note}</p>}
      <ul className="mt-5 space-y-2">
        {items.map((item, index) => (
          <li key={item}>
            <button
              type="button"
              aria-pressed={flags[index]}
              onClick={() => onToggle(index)}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left",
                flags[index] ? "border-primary bg-secondary" : "border-border bg-card",
              )}
            >
              <Mark on={flags[index]} />
              <span className="pt-0.5 leading-relaxed">{item}</span>
            </button>
          </li>
        ))}
      </ul>
      {extra && extraTitle && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{extraTitle}</h2>
          <ul className="mt-2 space-y-1 text-sm leading-relaxed">
            {extra.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
      <div className="mt-6">
        <Button type="button" size="lg" className="h-12 rounded-2xl" disabled={!ready} onClick={onContinue}>
          {t("barbell.continue")}
        </Button>
      </div>
    </main>
  );
}

function Move({ session }: { session: BarbellSession }) {
  const i18n = useI18n();
  const { t } = i18n;
  const store = useStretch();
  const slot = session.slots[session.index];
  const move = getBarbellMove(slot.moveId);
  if (!move) return null;
  const copy = i18n.barbell(move);
  const lines = displayedChecks(move, slot.pauseSeconds, copy);
  const visible = session.phase === "checklist" ? lines.slice(0, session.checksDone + 1) : lines;
  const letter = t(session.workout === "A" ? "barbell.workoutA" : "barbell.workoutB");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-4 pb-52 md:px-8 md:py-8 md:pb-10">
      <TopBar />
      <p className="mt-3 text-sm font-semibold text-primary">
        {letter}
        {" · "}
        {t("move.kicker", { current: session.index + 1, total: session.slots.length })}
        {" · "}
        {t("barbell.setOf", { current: session.setIndex + 1, total: slot.sets })}
      </p>
      <div className="mt-5 grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-[2rem] border border-border stage p-2 shadow-sm sm:p-4">
            <ExerciseFigure id={move.figure} altName={copy.name} priority className="mx-auto max-w-md" />
          </div>
          <MoveDemo name={copy.name} frames={getMoveDemoFrames("barbell", move.id)} />
        </div>
        <div>
          <h1 className="text-4xl font-semibold text-balance">{copy.name}</h1>
          {slot.sided && (
            <p className="mt-2 text-sm font-semibold text-primary">
              {session.side === "left" ? t("move.leftSide") : t("move.rightSide")}
              {" · "}
              {t("barbell.perSide")}
            </p>
          )}
          <div className="mt-4 rounded-2xl bg-accent p-3">
            <p className="text-xs font-semibold tracking-wide text-accent-foreground/80 uppercase">{t("move.feelIt")}</p>
            <p className="font-semibold text-accent-foreground">
              {copy.plain} <span className="font-normal opacity-80">· {copy.anatomical}</span>
            </p>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {slot.hold
              ? t("barbell.rangeHold", { min: slot.target, max: slot.repsMax })
              : t("barbell.rangeReps", { min: slot.target, max: slot.repsMax })}
            {" · "}
            {t("barbell.restRange", { min: slot.restMin, max: slot.restMax })}
          </p>
          {slot.slower && <p className="mt-2 text-sm font-medium">{t("barbell.slower")}</p>}
          {slot.harder && copy.harder && <p className="mt-2 text-sm font-medium">{copy.harder}</p>}
          <section className="mt-5">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{t("barbell.checks")}</h2>
            <ol className="mt-3 space-y-2">
              {visible.map((line, index) => {
                const current = session.phase === "checklist" && index === session.checksDone;
                const checked = index < session.checksDone;
                return (
                  <li key={line}>
                    {current ? (
                      <button
                        type="button"
                        onClick={store.advanceBarbellCheck}
                        className="flex w-full items-start gap-3 rounded-2xl border border-primary bg-card px-3 py-3 text-left"
                      >
                        <Mark on={false} />
                        <span className="leading-relaxed">{line}</span>
                      </button>
                    ) : (
                      <div className="flex items-start gap-3 px-3 py-2">
                        <Mark on={checked || session.phase !== "checklist"} />
                        <span className="leading-relaxed">{line}</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
          <section className="mt-5">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{t("barbell.cautions")}</h2>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
              {copy.cautions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-3 flex items-start gap-2 rounded-2xl bg-muted p-3 text-sm leading-relaxed">
              <HeartPulse className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden />
              {t("barbell.painLine")}
            </p>
            <figure className="mt-3 overflow-hidden rounded-2xl border border-border">
              <ExerciseFigure id={move.figure} altName={copy.name} variant="mistake" />
              <figcaption className="px-3 py-2 text-sm leading-relaxed">{copy.mistake}</figcaption>
            </figure>
          </section>
          {session.phase === "work" &&
            (slot.hold ? (
              <HoldWork target={slot.target} onFinish={store.finishBarbellSet} />
            ) : (
              <RepWork session={session} />
            ))}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {move.substitute && move.substitutions.length > 0 && (
              <Button type="button" variant="outline" className="rounded-2xl" onClick={store.markBarbellHeavy}>
                {t(move.substitute === "heavy" ? "barbell.tooHeavy" : "barbell.hurts")}
              </Button>
            )}
            {slot.easierMoveId && (
              <Button type="button" variant="outline" className="rounded-2xl" onClick={store.useBarbellEasier}>
                {t("barbell.easierPush")}
              </Button>
            )}
            <Button type="button" variant="ghost" className="rounded-2xl" onClick={store.skipBarbellMove}>
              {t("barbell.skip")}
            </Button>
            <Button type="button" variant="ghost" className="rounded-2xl text-destructive" onClick={store.stopBarbellForPain}>
              {t("barbell.stopPain")}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

function RepWork({ session }: { session: BarbellSession }) {
  const { t } = useI18n();
  const { countBarbellRep, finishBarbellSet } = useStretch();
  const slot = session.slots[session.index];
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-3xl border border-border bg-card p-4 shadow-sm">
      <p className="min-w-16 font-heading text-3xl font-semibold tabular-nums">
        {t("exercise.repsOf", { done: session.reps, total: slot.target })}
      </p>
      <Button type="button" size="lg" className="h-12 rounded-2xl" onClick={countBarbellRep} disabled={session.reps >= slot.target}>
        {t("exercise.countRep")}
      </Button>
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="h-12 rounded-2xl"
        disabled={session.reps < 1}
        onClick={() => finishBarbellSet(session.reps, true)}
      >
        {t("barbell.repsLeft")}
      </Button>
      <Button
        type="button"
        size="lg"
        variant="ghost"
        className="h-12 rounded-2xl"
        disabled={session.reps < 1}
        onClick={() => finishBarbellSet(session.reps, false)}
      >
        {t("barbell.myLimit")}
      </Button>
    </div>
  );
}

function HoldWork({
  target,
  onFinish,
}: {
  target: number;
  onFinish: (completed: number, reserve: boolean) => void;
}) {
  const { t } = useI18n();
  const [finished, setFinished] = useState(false);
  const countdown = useCountdown(target, { autoStart: true, onDone: () => setFinished(true) });
  const elapsed = Math.max(0, target - countdown.remaining);
  return (
    <div className="mt-4 rounded-3xl border border-border bg-card p-4 shadow-sm">
      <p className="font-heading text-3xl font-semibold tabular-nums">{t("barbell.holdTarget", { count: countdown.remaining })}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl"
          disabled={!finished && elapsed < 1}
          onClick={() => onFinish(finished ? target : elapsed, true)}
        >
          {t("barbell.repsLeft")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="rounded-2xl"
          disabled={!finished && elapsed < 1}
          onClick={() => onFinish(finished ? target : elapsed, false)}
        >
          {t("barbell.myLimit")}
        </Button>
      </div>
    </div>
  );
}

function Rest({ session }: { session: BarbellSession }) {
  const restSlot =
    session.afterRest === "checklist" ? session.slots[session.index - 1] : session.slots[session.index];
  return (
    <RestTimer
      key={`${session.index}-${session.setIndex}-${session.afterRest}`}
      seconds={session.restSeconds}
      max={restSlot?.restMax ?? session.restSeconds}
      extended={session.restExtended}
    />
  );
}

function RestTimer({ seconds, max, extended }: { seconds: number; max: number; extended: boolean }) {
  const { t } = useI18n();
  const { extendBarbellRest, finishBarbellRest } = useStretch();
  const countdown = useCountdown(seconds, { autoStart: true, onDone: finishBarbellRest });
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{t("barbell.restFor", { count: countdown.remaining })}</p>
      <p className="mt-3 font-heading text-7xl font-semibold tabular-nums">{countdown.remaining}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {!extended && max > seconds && (
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={() => {
              countdown.add(max - seconds);
              extendBarbellRest();
            }}
          >
            {t("barbell.restLonger")}
          </Button>
        )}
        <Button type="button" variant="ghost" className="rounded-2xl" onClick={finishBarbellRest}>
          {t("exercise.skipRest")}
        </Button>
      </div>
    </main>
  );
}

function Log({ session }: { session: BarbellSession }) {
  const { t } = useI18n();
  const { saveBarbellLog } = useStretch();
  const [sleep, setSleep] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [pain, setPain] = useState<boolean | null>(session.painStop ? true : null);
  const [sore, setSore] = useState(false);
  const [form, setForm] = useState(false);
  const [effort, setEffort] = useState("");
  const [cue, setCue] = useState("");
  const [win, setWin] = useState("");
  const ready = sleep !== null && pain !== null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <TopBar />
      <h1 className="mt-4 text-4xl font-semibold">{t("barbell.logTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t(session.workout === "A" ? "barbell.workoutA" : "barbell.workoutB")}
      </p>
      <fieldset className="mt-6">
        <legend className="font-semibold">{t("barbell.sleep")}</legend>
        <div className="mt-2 flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={sleep === value}
              onClick={() => setSleep(value)}
              className={cn(
                "grid size-11 place-items-center rounded-full border font-semibold",
                sleep === value ? "border-primary bg-primary text-primary-foreground" : "border-border",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-5">
        <legend className="font-semibold">{t("barbell.painQuestion")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant={pain === false ? "default" : "outline"} className="rounded-2xl" onClick={() => setPain(false)} disabled={session.painStop}>
            {t("barbell.painNo")}
          </Button>
          <Button type="button" variant={pain === true ? "default" : "outline"} className="rounded-2xl" onClick={() => setPain(true)}>
            {t("barbell.painYes")}
          </Button>
        </div>
      </fieldset>
      <label className="mt-4 flex items-start gap-3 text-sm leading-relaxed">
        <input type="checkbox" checked={sore} onChange={(event) => setSore(event.target.checked)} />
        {t("barbell.sore")}
      </label>
      <label className="mt-3 flex items-start gap-3 text-sm leading-relaxed">
        <input type="checkbox" checked={form} onChange={(event) => setForm(event.target.checked)} />
        {t("barbell.form")}
      </label>
      <Label text={t("barbell.effort")}>
        <textarea value={effort} onChange={(event) => setEffort(event.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-card px-3 py-2" rows={2} />
      </Label>
      <Label text={t("barbell.cue")}>
        <textarea value={cue} onChange={(event) => setCue(event.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-card px-3 py-2" rows={2} />
      </Label>
      <Label text={t("barbell.win")}>
        <textarea value={win} onChange={(event) => setWin(event.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-card px-3 py-2" rows={2} />
      </Label>
      <Button
        type="button"
        size="lg"
        className="mt-6 h-12 rounded-2xl"
        disabled={!ready}
        onClick={() => {
          if (sleep === null || pain === null) return;
          saveBarbellLog({
            sleepEnergy: sleep,
            pain,
            soreOver72: sore,
            formSlipped: form,
            effortNote: effort,
            cue,
            win,
          });
        }}
      >
        {t("barbell.save")}
      </Button>
    </main>
  );
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block">
      <span className="font-semibold">{text}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function TopBar() {
  const { t } = useI18n();
  const { startBarbellOver } = useStretch();
  return (
    <div className="flex items-center justify-between gap-3">
      <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-foreground/75 hover:bg-muted">
        <X className="size-4" aria-hidden />
        {t("barbell.backHome")}
      </Link>
      <button type="button" onClick={startBarbellOver} className="min-h-11 rounded-full px-3 text-sm font-medium text-foreground/75 hover:bg-muted">
        {t("barbell.startOver")}
      </button>
    </div>
  );
}

function Mark({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full",
        on ? "bg-primary text-primary-foreground" : "border border-border bg-muted",
      )}
      aria-hidden
    >
      {on ? <Check className="size-4" strokeWidth={3} /> : null}
    </span>
  );
}

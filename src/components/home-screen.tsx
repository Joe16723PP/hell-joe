"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  positionLabel,
} from "@/lib/catalog";
import {
  currentStreak,
  focusFor,
  formatLongDate,
  isoDate,
  lengthNote,
  nextStretchDate,
  recentAreas,
  sessionMoveIds,
  weekDates,
  startOfToday,
  weekdayName,
} from "@/lib/plan";
import { useStretch } from "@/lib/store";
import { cn } from "cn";

export function HomeScreen() {
  const { ready, settings } = useStretch();
  const [editing, setEditing] = useState(false);

  if (!ready) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-lg">Opening today’s session…</p>
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

  return <TodayHome onEditSetup={() => setEditing(true)} />;
}

function TodayHome({ onEditSetup }: { onEditSetup: () => void }) {
  const router = useRouter();
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
  } = useStretch();
  const today = startOfToday();
  const todayKey = isoDate(today);
  const actual = focusFor(today, settings);
  const showRest = actual.rest || viewingRest;
  const preset = getPreset(planPresetId) ?? PRESETS[2];
  const moveIds = session?.kind === "daily" ? session.moveIds : sessionMoveIds(preset.id, settings.length);
  const seconds = holdSecondsForLength(session?.kind === "daily" ? session.length : settings.length);
  const hero = getStretch(moveIds[0] ?? "hip-flexor");
  const streak = currentStreak(
    finished.map((entry) => entry.date),
    settings.restDay,
    today,
  );
  const hasFinished = finished.length > 0;
  const weekAreas = recentAreas(finished, today);
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

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <p className="text-sm tracking-[0.16em] text-muted-foreground uppercase">
        {formatLongDate(today)}
      </p>

      {showRest ? (
        <RestHome
          preview={restPreview}
          restName={weekdayName(settings.restDay)}
          nextLabel={`${weekdayName(nextStretch.getDay())} · ${nextFocus.label.toLowerCase()}`}
          streak={streak}
          hasFinished={hasFinished}
          loosenActive={session?.kind === "loosen"}
          onStart={() => begin("loosen")}
          onBack={restPreview ? () => setViewingRest(false) : undefined}
        />
      ) : (
        <section className="mt-3">
          <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <h1 className="font-heading text-5xl leading-none text-balance sm:text-6xl">
                {actual.label}
              </h1>
              <p className="mt-4 text-lg text-foreground/80">
                {settings.length} minutes · {moveIds.length}{" "}
                {moveIds.length === 1 ? "move" : "moves"}
              </p>
              <button
                type="button"
                onClick={() => setViewingRest(true)}
                className="mt-3 inline-flex min-h-11 items-center text-base text-primary"
              >
                See {weekdayName(settings.restDay)}, your rest day
              </button>
              {lengthNote(moveIds.length, settings.length) && (
                <p className="mt-2 max-w-md text-base text-muted-foreground">
                  {lengthNote(moveIds.length, settings.length)}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <figure className="rounded-[1.75rem] border border-border bg-[#f7f1e6] p-3 sm:p-5">
              {hero && <StretchFigure id={hero.id} className="mx-auto max-w-md" />}
              <figcaption className="px-2 pb-2 text-base text-muted-foreground">
                First move · {hero?.name}
              </figcaption>
            </figure>

            <div className="flex flex-col gap-6">
              <div className="rounded-[1.75rem] border border-border bg-card p-5">
                <p className="text-sm tracking-[0.14em] text-muted-foreground uppercase">
                  Preset
                </p>
                <h2 className="mt-1 font-heading text-3xl">{preset.name}</h2>
                <p className="mt-2 text-base leading-relaxed text-foreground/80">
                  {preset.blurb}
                </p>
                <div className="mt-4">
                  {session?.kind === "daily" ? (
                    <p className="text-sm text-muted-foreground">
                      A session is in progress. Start over to swap the preset.
                    </p>
                  ) : (
                    <PresetSwap
                      currentId={preset.id}
                      onSelect={setPreset}
                    />
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm tracking-[0.14em] text-muted-foreground uppercase">
                  Length
                </p>
                <div
                  className="mt-3 grid grid-cols-3 gap-2"
                  role="group"
                  aria-label="Session length"
                >
                  {([5, 10, 15] as LengthMin[]).map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={settings.length === value ? "default" : "outline"}
                      aria-pressed={settings.length === value}
                      disabled={Boolean(session?.kind === "daily")}
                      onClick={() => setLength(value)}
                    >
                      {value} min
                    </Button>
                  ))}
                </div>
              </div>

              <ol className="divide-y divide-border rounded-[1.75rem] border border-border bg-card">
                {moveIds.map((id, index) => {
                  const stretch = getStretch(id as StretchId);
                  if (!stretch) return null;
                  const sideNote = stretch.sided ? `${seconds} sec a side` : `${seconds} sec`;
                  return (
                    <li key={`${id}-${index}`} className="flex items-baseline justify-between gap-3 px-4 py-3">
                      <span className="text-base">
                        <span className="mr-2 font-heading text-primary">{index + 1}</span>
                        {stretch.name}
                      </span>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        {positionLabel(stretch.position)} · {sideNote}
                      </span>
                    </li>
                  );
                })}
              </ol>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" size="lg" className="whitespace-normal sm:min-w-48" onClick={() => begin("daily")}>
                  {session?.kind === "daily"
                    ? `Resume · move ${session.index + 1} of ${session.moveIds.length}`
                    : "Start"}
                </Button>
                {session?.kind === "daily" && (
                  <Button type="button" variant="outline" size="lg" onClick={startOver}>
                    Start over
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <WeekStrip
        today={today}
        restDay={settings.restDay}
        tightAreas={settings.tightAreas}
        finishedDates={finished.map((entry) => entry.date)}
        selected={showRest ? "rest" : "today"}
        onSelectToday={() => setViewingRest(false)}
        onSelectRest={() => setViewingRest(true)}
      />

      <section className="mt-8 rounded-[1.75rem] border border-border bg-card p-5">
        <h2 className="font-heading text-2xl">This week</h2>
        {hasFinished ? (
          <>
            <p className="mt-2 text-base leading-relaxed">
              Streak: {streak} {streak === 1 ? "day" : "days"}. Rest day does not break
              it. A missed stretch day does.
            </p>
            {weekAreas.length > 0 && (
              <p className="mt-2 text-base leading-relaxed">
                Areas these seven days: {weekAreas.join(", ")}.
              </p>
            )}
          </>
        ) : (
          <p className="mt-2 max-w-xl text-base leading-relaxed">
            No sessions yet. Finish today’s session and the streak starts. A missed
            stretch day resets it. Your rest day does not.
          </p>
        )}
        {recap && recap.date === todayKey && (
          <Link href="/recap" className="mt-3 inline-flex min-h-11 items-center text-base text-primary">
            See today’s recap
          </Link>
        )}
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Stretchday is a mobility habit, not medical advice. It does not diagnose
          tightness or prescribe care.
        </p>
        <button
          type="button"
          onClick={onEditSetup}
          className="inline-flex min-h-11 items-center text-left text-base text-foreground/80 underline decoration-border underline-offset-4"
        >
          Change length, tight areas, or rest day
        </button>
      </div>
    </main>
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
  return (
    <section className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div>
        {preview && (
          <p className="text-sm tracking-[0.14em] text-primary uppercase">Preview</p>
        )}
        <h1 className="font-heading text-5xl leading-none sm:text-6xl">Rest day</h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-foreground/80">
          {restName} stays off. The streak holds whether you move or not.
          {hasFinished
            ? ` Streak: ${streak} ${streak === 1 ? "day" : "days"}, kept.`
            : " No sessions yet, so there is no streak to keep."}
        </p>
        <p className="mt-4 text-base">
          Next stretch day is {nextLabel}.
        </p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-4 inline-flex min-h-11 items-center text-base underline decoration-border underline-offset-4"
          >
            Back to today
          </button>
        )}
      </div>
      <div className="rounded-[1.75rem] border border-border bg-card p-5">
        <p className="text-sm tracking-[0.14em] text-muted-foreground uppercase">
          Optional
        </p>
        <h2 className="mt-1 font-heading text-3xl">3-minute easy loosen</h2>
        <p className="mt-2 text-base leading-relaxed text-foreground/80">
          Three gentle moves: neck, shoulders, and a rounded back. Doing this does
          not turn the day into a streak day. Skipping it does not break the streak.
        </p>
        <Button type="button" size="lg" className="mt-5" onClick={onStart}>
          {loosenActive ? "Resume the loosen" : "Start the loosen"}
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
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
      >
        Swap preset
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Swap today’s preset</DialogTitle>
          <DialogDescription>
            Four presets. Pick one for today. You are not building a routine from scratch.
          </DialogDescription>
        </DialogHeader>
        <ul className="grid gap-2">
          {PRESETS.map((preset) => {
            const selected = preset.id === currentId;
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
                    "w-full rounded-xl border px-4 py-3 text-left",
                    selected ? "border-primary bg-[#f7f1e6]" : "border-border bg-background",
                  )}
                >
                  <span className="block font-heading text-xl">{preset.name}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {preset.where}. {preset.blurb}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Dumbbell, Play, Shuffle } from "lucide-react";
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
  EXERCISE_PRESETS,
  doseFor,
  exerciseMoveIds,
  getExercise,
  getExercisePreset,
  presetIdFor,
  sessionMix,
} from "@/lib/exercise";
import { useI18n } from "@/lib/i18n/provider";
import {
  type ExerciseChoice,
  type ExerciseFamily,
  type ExerciseMinutes,
} from "@/lib/plan";
import { useStretch, type ExerciseSession } from "@/lib/store";
import { cn } from "@/lib/utils";

const FAMILIES: ExerciseFamily[] = ["front", "side", "all-fours", "bridge"];
const LENGTHS: ExerciseMinutes[] = [10, 15, 20];

export function ExerciseIntro() {
  const { settings, acceptExerciseIntro } = useStretch();
  const { t } = useI18n();
  const [option, setOption] = useState<ExerciseChoice>(settings.exerciseOption);
  const [length, setLength] = useState<ExerciseMinutes>(settings.exerciseLength);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-12">
      <div className="rounded-[2rem] hero-gradient p-6 text-white shadow-xl shadow-primary/20 sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
          <Dumbbell className="size-4" aria-hidden />
          {t("exercise.optionCore")}
        </p>
        <h1 className="mt-4 text-4xl leading-tight font-semibold sm:text-5xl">{t("exercise.introTitle")}</h1>
        <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/85">{t("exercise.introBody")}</p>
      </div>
      <div className="mt-6 space-y-4">
        <OptionToggle option={option} onChange={setOption} />
        <LengthToggle length={length} onChange={setLength} disabled={false} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            size="lg"
            className="h-14 rounded-2xl px-8 text-lg font-semibold"
            onClick={() => acceptExerciseIntro({ on: true, option, length })}
          >
            {t("exercise.introGo")}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-14 rounded-2xl"
            onClick={() => acceptExerciseIntro({ on: false, option: "core", length: 15 })}
          >
            {t("exercise.introHide")}
          </Button>
        </div>
      </div>
    </main>
  );
}

export function ExerciseCard({
  family,
  session,
  doneToday,
}: {
  family: ExerciseFamily;
  session: ExerciseSession | null;
  doneToday: boolean;
}) {
  const router = useRouter();
  const i18n = useI18n();
  const { t } = i18n;
  const {
    settings,
    setExerciseOption,
    setExerciseLength,
    setExerciseFamily,
    setExerciseOn,
    startExercise,
    startExerciseOver,
  } = useStretch();
  const inProgress = session?.kind === "exercise";
  const option = inProgress ? session.option : settings.exerciseOption;
  const length = inProgress ? session.length : settings.exerciseLength;
  const presetId = inProgress ? session.presetId : presetIdFor(option, family);
  const preset = getExercisePreset(presetId) ?? EXERCISE_PRESETS[0];
  const presetCopy = i18n.exercisePreset(preset);
  const moveIds = inProgress ? session.moveIds : exerciseMoveIds(preset.id, length);
  const dose = doseFor(option, length);
  const mix = sessionMix(moveIds);
  const sided = moveIds.some((id) => getExercise(id)?.sided && getExercise(id)?.effort === "reps");

  function begin() {
    if (inProgress) {
      router.push("/exercise");
      return;
    }
    startExercise("exercise");
    router.push("/exercise");
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">{t("home.exerciseKicker")}</p>
          <h2 className="mt-1 font-heading text-3xl font-semibold">{presetCopy.name}</h2>
          <p className="mt-1 text-base text-foreground/80">{presetCopy.blurb}</p>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {i18n.minutes(length)} · {i18n.moves(moveIds.length)}
        </p>
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground/80">
        {mix === "mixed"
          ? t("home.exerciseDoseMixed", dose)
          : mix === "holds"
            ? t("home.exerciseDoseHolds", dose)
            : sided
              ? t("home.exerciseDoseRepsSide", dose)
              : t("home.exerciseDoseReps", dose)}
      </p>

      {!inProgress && !doneToday && (
        <div className="mt-4 space-y-4">
          <OptionToggle option={option} onChange={setExerciseOption} />
          <LengthToggle length={length} onChange={setExerciseLength} disabled={false} />
          <FamilySwap current={family} onSelect={setExerciseFamily} />
        </div>
      )}
      {inProgress && <p className="mt-3 text-sm text-muted-foreground">{t("home.inProgressLocked")}</p>}

      <ol className="mt-4 space-y-2">
        {moveIds.map((id, index) => {
          const move = getExercise(id);
          if (!move) return null;
          const copy = i18n.exercise(move);
          const current = inProgress && index === session.index;
          return (
            <li key={`${id}-${index}`} className={cn("flex items-center gap-3 rounded-2xl p-2", current && "bg-secondary")}>
              <div className="w-14 shrink-0 overflow-hidden rounded-xl stage">
                <ExerciseFigure id={id} sizes="96px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{copy.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {move.effort === "hold"
                    ? t("exercise.holdFor", { count: dose.hold })
                    : copy.patternLabel}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {doneToday ? (
          <Link href="/recap/exercise" className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-2xl px-5")}>
            {t("home.exerciseSeeRecap")}
          </Link>
        ) : (
          <Button type="button" size="lg" className="h-12 rounded-2xl px-5 font-semibold" onClick={begin}>
            <Play className="size-4 fill-current" aria-hidden />
            {inProgress
              ? t("home.exerciseResume", {
                  current: session.index + 1,
                  total: session.moveIds.length,
                })
              : t("home.exerciseStart")}
          </Button>
        )}
        {inProgress && (
          <Button type="button" variant="ghost" size="lg" className="h-12 rounded-2xl" onClick={startExerciseOver}>
            {t("home.startOver")}
          </Button>
        )}
        <Button type="button" variant="outline" size="lg" className="h-12 rounded-2xl" onClick={() => setExerciseOn(false)}>
          {t("home.exerciseHide")}
        </Button>
      </div>
    </section>
  );
}

export function doseLine(
  t: ReturnType<typeof useI18n>["t"],
  option: ExerciseChoice,
  length: ExerciseMinutes,
  moveIds: string[],
) {
  const dose = doseFor(option, length);
  const mix = sessionMix(moveIds);
  const sided = moveIds.some((id) => {
    const move = getExercise(id);
    return move?.effort === "reps" && move.sided;
  });
  if (mix === "mixed") return t("home.exerciseDoseMixed", dose);
  if (mix === "holds") return t("home.exerciseDoseHolds", dose);
  return sided ? t("home.exerciseDoseRepsSide", dose) : t("home.exerciseDoseReps", dose);
}

export function RestBrace({ active, onStart }: { active: boolean; onStart: () => void }) {
  const { t } = useI18n();
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <p className="inline-flex rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
        {t("rest.optional")}
      </p>
      <h2 className="mt-3 text-3xl font-semibold">{t("rest.braceTitle")}</h2>
      <p className="mt-2 text-base leading-relaxed text-foreground/80">{t("rest.braceBody")}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {(["heel-tap", "kneeling-plank"] as const).map((id) => (
          <div key={id} className="overflow-hidden rounded-2xl stage">
            <ExerciseFigure id={id} sizes="200px" />
          </div>
        ))}
      </div>
      <Button type="button" size="lg" className="mt-5 h-12 rounded-2xl px-6" onClick={onStart}>
        <Play className="size-4 fill-current" aria-hidden />
        {active ? t("rest.resumeBrace") : t("rest.startBrace")}
      </Button>
    </div>
  );
}

function OptionToggle({
  option,
  onChange,
}: {
  option: ExerciseChoice;
  onChange: (option: ExerciseChoice) => void;
}) {
  const { t } = useI18n();
  const choices: ExerciseChoice[] = ["core", "muscle"];
  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1" role="group" aria-label={t("exercise.optionGroup")}>
      {choices.map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={option === value}
          onClick={() => onChange(value)}
          className={cn(
            "min-h-12 rounded-xl px-2 text-sm font-semibold",
            option === value ? "bg-card text-primary shadow-sm" : "text-foreground/70",
          )}
        >
          {t(value === "core" ? "exercise.optionCore" : "exercise.optionMuscle")}
        </button>
      ))}
    </div>
  );
}

function LengthToggle({
  length,
  onChange,
  disabled,
}: {
  length: ExerciseMinutes;
  onChange: (length: ExerciseMinutes) => void;
  disabled: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1" role="group" aria-label={t("exercise.lengthGroup")}>
      {LENGTHS.map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={length === value}
          disabled={disabled}
          onClick={() => onChange(value)}
          className={cn(
            "min-h-12 rounded-xl text-base font-semibold disabled:opacity-50",
            length === value ? "bg-card text-primary shadow-sm" : "text-foreground/70",
          )}
        >
          {t("common.min", { count: value })}
        </button>
      ))}
    </div>
  );
}

function FamilySwap({
  current,
  onSelect,
}: {
  current: ExerciseFamily;
  onSelect: (family: ExerciseFamily) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const [open, setOpen] = useState(false);
  const { settings } = useStretch();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-2xl")}>
        <Shuffle className="size-4" aria-hidden />
        {t("exercise.changeRoutine")}
      </DialogTrigger>
      <DialogContent className="rounded-3xl p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-semibold">{t("exercise.swapTitle")}</DialogTitle>
          <DialogDescription>{t("exercise.swapDesc")}</DialogDescription>
        </DialogHeader>
        <ul className="grid gap-2">
          {FAMILIES.map((family) => {
            const preset = getExercisePreset(presetIdFor(settings.exerciseOption, family));
            if (!preset) return null;
            const selected = family === current;
            const copy = i18n.exercisePreset(preset);
            const hero = preset.order[0];
            return (
              <li key={family}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    onSelect(family);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left",
                    selected ? "border-primary bg-secondary" : "border-border hover:bg-muted",
                  )}
                >
                  {hero && (
                    <div className="w-14 shrink-0 overflow-hidden rounded-xl stage">
                      <ExerciseFigure id={hero} sizes="96px" />
                    </div>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-lg font-semibold">{copy.name}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{copy.blurb}</span>
                  </span>
                  {selected && <Check className="size-5 text-primary" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

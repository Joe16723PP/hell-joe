"use client";

import { Check, Moon } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { focusFor, isoDate, weekDates, type Settings } from "@/lib/plan";
import { cn } from "cn";

export function WeekStrip({
  today,
  restDay,
  tightAreas,
  finishedDates,
  exerciseDates = [],
  selected,
  onSelectToday,
  onSelectRest,
}: {
  today: Date;
  restDay: number;
  tightAreas: Settings["tightAreas"];
  finishedDates: string[];
  exerciseDates?: string[];
  selected: "today" | "rest";
  onSelectToday?: () => void;
  onSelectRest?: () => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const days = weekDates(today);
  const todayKey = isoDate(today);
  const interactive = Boolean(onSelectToday && onSelectRest);
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-2xl font-semibold">{t("week.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {interactive ? t("week.tapRest", { day: i18n.weekday(restDay) }) : t("week.marked")}
        </p>
      </div>
      <ol className="mt-4 grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((date) => {
          const key = isoDate(date);
          const isToday = key === todayKey;
          const isRest = date.getDay() === restDay;
          const done = finishedDates.includes(key);
          const exercised = exerciseDates.includes(key);
          const past = key < todayKey;
          const pressed = isRest ? selected === "rest" : isToday && selected === "today";
          const focus = focusFor(date, { restDay, tightAreas });
          const label = [
            i18n.weekday(date.getDay()),
            isToday && t("week.today"),
            isRest && t("week.rest"),
            done && t("week.finished"),
            exercised && t("week.exercise"),
          ]
            .filter(Boolean)
            .join(", ");
          const inner = (
            <>
              <span className={cn("text-xs font-medium", isToday ? "text-primary" : "text-muted-foreground")}>
                {i18n.weekday(date.getDay(), "short")}
              </span>
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-full font-heading text-base font-semibold transition-all sm:size-12 sm:text-lg",
                  done
                    ? "animate-pop bg-primary text-white shadow-md shadow-primary/30"
                    : isRest
                      ? "bg-[#e8ebf7] text-[#3d4f8a]"
                      : isToday
                        ? "bg-card text-foreground ring-2 ring-coral ring-offset-2 ring-offset-card"
                        : past
                          ? "bg-muted text-muted-foreground"
                          : "bg-muted/60 text-foreground/80",
                  pressed && !done && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                )}
              >
                {done ? (
                  <Check className="size-5" strokeWidth={3} aria-hidden />
                ) : isRest ? (
                  <Moon className="size-4" aria-hidden />
                ) : (
                  date.getDate()
                )}
              </span>
              <span className="hidden max-w-full truncate text-[0.7rem] text-muted-foreground sm:block">
                {i18n.focusShort(focus.key)}
              </span>
              {exercised && (
                <span className="size-1.5 rounded-full bg-coral" title={t("week.exercise")} />
              )}
            </>
          );
          if (interactive && (isToday || isRest)) {
            return (
              <li key={key}>
                <button
                  type="button"
                  aria-label={label}
                  aria-pressed={pressed}
                  onClick={isRest ? onSelectRest : onSelectToday}
                  className="flex min-h-20 w-full flex-col items-center justify-start gap-1.5 rounded-2xl py-1 hover:bg-muted/60"
                >
                  {inner}
                </button>
              </li>
            );
          }
          return (
            <li key={key}>
              <div
                className="flex min-h-20 flex-col items-center justify-start gap-1.5 py-1"
                aria-label={label}
                title={i18n.focusShort(focus.key)}
              >
                {inner}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

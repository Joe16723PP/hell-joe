"use client";

import {
  focusFor,
  isoDate,
  shortFocus,
  weekDates,
  weekdayName,
  type Settings,
} from "@/lib/plan";
import { cn } from "cn";

export function WeekStrip({
  today,
  restDay,
  tightAreas,
  finishedDates,
  selected,
  onSelectToday,
  onSelectRest,
}: {
  today: Date;
  restDay: number;
  tightAreas: Settings["tightAreas"];
  finishedDates: string[];
  selected: "today" | "rest";
  onSelectToday?: () => void;
  onSelectRest?: () => void;
}) {
  const days = weekDates(today);
  const todayKey = isoDate(today);
  const interactive = Boolean(onSelectToday && onSelectRest);
  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-2xl">Week</h2>
        <p className="text-sm text-muted-foreground">
          {interactive
            ? `Tap ${weekdayName(restDay)} for the rest day.`
            : "Finished stretch days stay marked."}
        </p>
      </div>
      <ol className="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((date) => {
          const key = isoDate(date);
          const isToday = key === todayKey;
          const isRest = date.getDay() === restDay;
          const done = finishedDates.includes(key);
          const pressed = isRest ? selected === "rest" : isToday && selected === "today";
          const label = `${weekdayName(date.getDay())}${isToday ? ", today" : ""}${isRest ? ", rest day" : ""}${done ? ", finished" : ""}`;
          const inner = (
            <>
              <span className="text-xs sm:text-sm">{weekdayName(date.getDay()).slice(0, 3)}</span>
              <span className="font-heading text-lg sm:text-xl">{date.getDate()}</span>
              <span
                className={cn(
                  "mt-1 h-1.5 w-1.5 rounded-full",
                  done ? "bg-primary" : isRest ? "border border-primary" : "bg-transparent",
                )}
                aria-hidden
              />
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
                  className={cn(
                    "flex min-h-16 w-full flex-col items-center justify-center rounded-xl border text-center",
                    pressed ? "border-primary bg-card" : "border-border bg-card/60",
                  )}
                >
                  {inner}
                </button>
              </li>
            );
          }
          return (
            <li key={key}>
              <div
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center rounded-xl border text-center",
                  isToday ? "border-primary bg-card" : "border-transparent text-muted-foreground",
                )}
                title={shortFocus(
                  focusFor(date, { restDay, tightAreas }).label,
                  isRest,
                )}
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

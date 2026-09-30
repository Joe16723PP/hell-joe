"use client";

import Link from "next/link";
import { ArrowRight, Check, Flame, Layers, Moon, SkipForward, Sunrise } from "lucide-react";
import { StretchFigure } from "@/components/stretch-figure";
import { WeekStrip } from "@/components/week-strip";
import { buttonVariants } from "@/components/ui/button";
import { getStretch } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n/provider";
import { addDays, focusFor, startOfToday } from "@/lib/plan";
import { useStretch } from "@/lib/store";
import { cn } from "cn";

const CONFETTI = [
  { left: "8%", top: "18%", color: "bg-sun", size: "size-3", rotate: "rotate-12" },
  { left: "20%", top: "72%", color: "bg-white/70", size: "size-2", rotate: "" },
  { left: "82%", top: "22%", color: "bg-coral", size: "size-3", rotate: "-rotate-12" },
  { left: "90%", top: "64%", color: "bg-sun", size: "size-2", rotate: "rotate-45" },
  { left: "68%", top: "84%", color: "bg-white/60", size: "size-2.5", rotate: "" },
  { left: "36%", top: "10%", color: "bg-[#5eead4]", size: "size-2", rotate: "rotate-45" },
];

export function RecapScreen() {
  const i18n = useI18n();
  const { t } = i18n;
  const { ready, recap, settings, finished } = useStretch();

  if (!ready) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10" aria-busy>
        <p className="sr-only">{t("recap.loading")}</p>
        <div className="h-64 animate-pulse rounded-[2rem] bg-muted" />
      </main>
    );
  }

  if (!recap) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-secondary text-primary">
          <Sunrise className="size-7" aria-hidden />
        </div>
        <h1 className="mt-5 text-4xl font-semibold">{t("recap.emptyTitle")}</h1>
        <p className="mt-3 text-lg leading-relaxed text-foreground/80">{t("recap.emptyBody")}</p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex h-12 rounded-2xl px-6")}>
          {t("common.backToToday")}
        </Link>
      </main>
    );
  }

  const today = startOfToday();
  const loosen = recap.kind === "loosen";
  const heldCount = recap.held.length;
  const skippedCount = recap.skipped.length;
  const tomorrow = focusFor(addDays(today, 1), settings);
  const celebrate = !loosen && recap.counted;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <section
        className={cn(
          "relative overflow-hidden rounded-[2rem] p-6 text-center text-white shadow-xl sm:p-10",
          loosen
            ? "bg-gradient-to-br from-[#1e3a5f] via-[#2b4c7e] to-[#5a4f99] shadow-[#2b4c7e]/25"
            : celebrate
              ? "hero-gradient shadow-primary/25"
              : "bg-gradient-to-br from-[#4b5f5a] to-[#6b807a] shadow-black/10",
        )}
      >
        {celebrate && CONFETTI.map((piece, index) => (
          <span
            key={index}
            className={cn("absolute animate-pop rounded-sm", piece.color, piece.size, piece.rotate)}
            style={{ left: piece.left, top: piece.top, animationDelay: `${150 + index * 70}ms` }}
            aria-hidden
          />
        ))}
        <div className="relative mx-auto grid size-20 animate-pop place-items-center rounded-full bg-white text-primary shadow-lg">
          {loosen ? (
            <Moon className="size-9 text-[#2b4c7e]" aria-hidden />
          ) : celebrate ? (
            <Check className="size-10" strokeWidth={3} aria-hidden />
          ) : (
            <SkipForward className="size-9 text-[#4b5f5a]" aria-hidden />
          )}
        </div>
        <p className="relative mt-5 text-sm font-semibold tracking-wide text-white/80 uppercase">
          {loosen ? t("recap.kickerLoosen") : t("recap.kicker")}
        </p>
        <h1 className="relative mt-2 text-4xl leading-tight font-semibold text-balance sm:text-5xl">
          {loosen ? t("recap.titleLoosen") : t("recap.title")}
        </h1>
        <p className="relative mx-auto mt-3 max-w-md text-lg leading-relaxed text-white/85">
          {loosen ? t("recap.loosenBody") : recap.counted ? t("recap.countedBody") : t("recap.noHolds")}
        </p>
      </section>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat icon={<Layers className="size-5" aria-hidden />} label={t("recap.statMoves")} value={String(heldCount)} />
        <Stat icon={<SkipForward className="size-5" aria-hidden />} label={t("recap.statSkipped")} value={String(skippedCount)} />
        <Stat
          icon={<Flame className="size-5 fill-coral text-coral" aria-hidden />}
          label={t("recap.statStreak")}
          value={i18n.days(recap.streak)}
          highlight
        />
      </div>

      <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-xl font-semibold">{t("recap.areas")}</h2>
        {recap.areas.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {recap.areas.map((area) => (
              <li
                key={area}
                className="inline-flex min-h-10 items-center rounded-full bg-secondary px-4 font-semibold text-secondary-foreground"
              >
                {i18n.area(area)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-base text-muted-foreground">{t("recap.noAreas")}</p>
        )}

        {recap.held.length > 0 && (
          <>
            <h2 className="mt-6 text-xl font-semibold">{t("recap.moves")}</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {recap.held.map((move) => {
                const stretch = getStretch(move.id);
                const copy = stretch ? i18n.stretch(stretch) : null;
                return (
                  <li key={move.id} className="flex items-center gap-3 rounded-2xl bg-muted/60 p-2">
                    {stretch && (
                      <div className="w-12 shrink-0 overflow-hidden rounded-xl stage">
                        <StretchFigure id={stretch.id} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{copy?.name ?? move.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{i18n.area(move.area)}</p>
                    </div>
                    <Check className="ml-auto size-5 shrink-0 text-primary" strokeWidth={3} aria-hidden />
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      <div className="mt-4 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <WeekStrip
          today={today}
          restDay={settings.restDay}
          tightAreas={settings.tightAreas}
          finishedDates={finished.map((entry) => entry.date)}
          selected={focusFor(today, settings).rest ? "rest" : "today"}
        />
      </div>

      <div className="mt-4 flex flex-col gap-4 rounded-3xl bg-accent p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-coral">
            {tomorrow.rest ? <Moon className="size-5" aria-hidden /> : <Sunrise className="size-5" aria-hidden />}
          </span>
          <div>
            <p className="text-sm font-semibold text-accent-foreground/80">{t("recap.tomorrow")}</p>
            <p className="font-heading text-lg font-semibold text-accent-foreground">
              {tomorrow.rest
                ? t("recap.tomorrowRest")
                : t("recap.tomorrowFocus", {
                    focus: i18n.focus(tomorrow.key),
                    minutes: i18n.minutes(settings.length),
                  })}
            </p>
          </div>
        </div>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-2xl px-6 font-semibold")}>
          {t("common.backToToday")}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border p-4 text-center shadow-sm",
        highlight ? "border-coral/30 bg-accent" : "border-border bg-card",
      )}
    >
      <span className="mx-auto grid size-9 place-items-center rounded-xl bg-white text-primary shadow-sm">{icon}</span>
      <p className="mt-2 font-heading text-2xl font-semibold">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

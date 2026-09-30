"use client";

import Link from "next/link";
import { WeekStrip } from "@/components/week-strip";
import { buttonVariants } from "@/components/ui/button";
import { focusFor, startOfToday } from "@/lib/plan";
import { useStretch } from "@/lib/store";
import { cn } from "cn";

export function RecapScreen() {
  const { ready, recap, settings, finished } = useStretch();

  if (!ready) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-lg">Opening the recap…</p>
      </main>
    );
  }

  if (!recap) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-heading text-5xl leading-none">No sessions yet</h1>
        <p className="mt-4 text-lg leading-relaxed">
          Finish today’s session and the recap will land here. The streak starts with
          that first one.
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex")}>
          Back to today
        </Link>
      </main>
    );
  }

  const heldCount = recap.held.length;
  const skippedCount = recap.skipped.length;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-14">
      <p className="text-sm tracking-[0.16em] text-muted-foreground uppercase">
        {recap.kind === "loosen" ? "Easy loosen" : "Session"}
      </p>
      <h1 className="mt-3 font-heading text-5xl leading-none text-balance sm:text-6xl">
        {recap.kind === "loosen" ? "That was the easy loosen." : "That’s the session."}
      </h1>

      {recap.kind === "loosen" ? (
        <p className="mt-5 text-lg leading-relaxed">
          It does not count as a streak day. Skipping it would not have broken the
          streak either.
        </p>
      ) : recap.counted ? (
        <p className="mt-5 text-lg leading-relaxed">
          {heldCount} {heldCount === 1 ? "move" : "moves"} finished
          {skippedCount > 0
            ? ` · ${skippedCount} skipped`
            : ""}
          . Streak: {recap.streak} {recap.streak === 1 ? "day" : "days"}.
        </p>
      ) : (
        <p className="mt-5 text-lg leading-relaxed">
          No holds finished, so the streak stays as it was.
        </p>
      )}

      <section className="mt-8">
        <h2 className="font-heading text-2xl">Areas covered</h2>
        {recap.areas.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {recap.areas.map((area) => (
              <li
                key={area}
                className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-4"
              >
                {area}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-base text-muted-foreground">No areas held.</p>
        )}
      </section>

      {recap.held.length > 0 && (
        <section className="mt-8">
          <h2 className="font-heading text-2xl">Moves</h2>
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
            {recap.held.map((move) => (
              <li key={move.id} className="px-4 py-3 text-base">
                {move.name}
                <span className="text-muted-foreground"> · {move.area}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <WeekStrip
        today={startOfToday()}
        restDay={settings.restDay}
        tightAreas={settings.tightAreas}
        finishedDates={finished.map((entry) => entry.date)}
        selected={focusFor(startOfToday(), settings).rest ? "rest" : "today"}
      />

      <p className="mt-8 text-lg">{recap.tomorrow}</p>

      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex")}>
        Back to today
      </Link>
    </main>
  );
}

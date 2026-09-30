"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StretchFigure } from "@/components/stretch-figure";
import { Button } from "@/components/ui/button";
import {
  AREAS,
  POSITIONS,
  STRETCHES,
  positionLabel,
  type AreaId,
  type PositionId,
} from "@/lib/catalog";
import { cn } from "cn";

export function LibraryScreen() {
  const [area, setArea] = useState<AreaId | "all">("all");
  const [position, setPosition] = useState<PositionId | "all">("all");
  const [sides, setSides] = useState<"all" | "sided" | "together">("all");

  const visible = useMemo(
    () =>
      STRETCHES.filter((stretch) => {
        if (area !== "all" && stretch.area !== area) return false;
        if (position !== "all" && stretch.position !== position) return false;
        if (sides === "sided" && !stretch.sided) return false;
        if (sides === "together" && stretch.sided) return false;
        return true;
      }),
    [area, position, sides],
  );

  const total = STRETCHES.length;
  const filtered = area !== "all" || position !== "all" || sides !== "all";

  function clearFilters() {
    setArea("all");
    setPosition("all");
    setSides("all");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <p className="text-sm tracking-[0.16em] text-muted-foreground uppercase">Catalog</p>
      <h1 className="mt-2 font-heading text-5xl leading-none sm:text-6xl">Library</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/80">
        Twenty-four stretches for the neck, shoulders, chest, back, hips, glutes,
        and legs. Open any one on its own. Doing it here does not replace today’s
        session.
      </p>

      <div className="mt-8 space-y-4">
        <fieldset>
          <legend className="text-sm tracking-[0.14em] text-muted-foreground uppercase">
            Area
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <FilterChip
              pressed={area === "all"}
              onClick={() => setArea("all")}
              label="All areas"
            />
            {AREAS.map((item) => (
              <FilterChip
                key={item.id}
                pressed={area === item.id}
                onClick={() => setArea(item.id)}
                label={item.label}
              />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm tracking-[0.14em] text-muted-foreground uppercase">
            Position
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <FilterChip
              pressed={position === "all"}
              onClick={() => setPosition("all")}
              label="All positions"
            />
            {POSITIONS.map((item) => (
              <FilterChip
                key={item.id}
                pressed={position === item.id}
                onClick={() => setPosition(item.id)}
                label={item.label}
              />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm tracking-[0.14em] text-muted-foreground uppercase">
            Sides
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <FilterChip pressed={sides === "all"} onClick={() => setSides("all")} label="All" />
            <FilterChip
              pressed={sides === "sided"}
              onClick={() => setSides("sided")}
              label="Left and right"
            />
            <FilterChip
              pressed={sides === "together"}
              onClick={() => setSides("together")}
              label="Both sides together"
            />
          </div>
        </fieldset>
      </div>

      <p className="mt-6 text-base text-muted-foreground">
        {visible.length === total
          ? `${total} stretches.`
          : visible.length === 1
            ? `1 of ${total}.`
            : `${visible.length} of ${total}.`}
      </p>

      {visible.length === 0 ? (
        <div className="mt-4 rounded-[1.75rem] border border-border bg-card px-5 py-10">
          <h2 className="font-heading text-3xl">Nothing in the library matches that.</h2>
          <p className="mt-2 max-w-md text-base leading-relaxed text-foreground/80">
            Those filters leave the shelf empty. Clear them to see all {total} stretches.
          </p>
          <Button type="button" size="lg" className="mt-5" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {visible.map((stretch) => (
            <li key={stretch.id}>
              <Link
                href={`/library/${stretch.id}`}
                className="flex min-h-32 items-center gap-3 rounded-[1.5rem] border border-border bg-card p-3 transition-colors hover:bg-[#f7f1e6] sm:gap-4 sm:p-4"
              >
                <div className="w-24 shrink-0 sm:w-28">
                  <StretchFigure id={stretch.id} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-heading text-2xl leading-tight">{stretch.name}</h2>
                  <p className="mt-1 text-base text-foreground/80">
                    {stretch.plain}
                    <span className="text-muted-foreground"> · {stretch.anatomical}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stretch.areaLabel} · {positionLabel(stretch.position)} ·{" "}
                    {stretch.sided ? `${stretch.seconds} sec a side` : `${stretch.seconds} sec`}
                    {stretch.sided ? " · Left and right" : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {filtered && visible.length > 0 && (
        <button
          type="button"
          className="mt-4 inline-flex min-h-11 items-center text-base underline decoration-border underline-offset-4"
          onClick={clearFilters}
        >
          Clear filters
        </button>
      )}
    </main>
  );
}

function FilterChip({
  pressed,
  onClick,
  label,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center rounded-full border px-4 text-base",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground",
      )}
    >
      {label}
    </button>
  );
}

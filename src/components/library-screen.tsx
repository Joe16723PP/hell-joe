"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, ChevronRight, SearchX, Timer } from "lucide-react";
import { StretchFigure } from "@/components/stretch-figure";
import { Button } from "@/components/ui/button";
import { AREAS, POSITIONS, STRETCHES, type AreaId, type PositionId } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "cn";

export function LibraryScreen() {
  const i18n = useI18n();
  const { t } = i18n;
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
      <p className="text-sm font-semibold text-primary">{t("library.kicker")}</p>
      <h1 className="mt-1 text-5xl leading-none font-semibold sm:text-6xl">{t("library.title")}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/80">{t("library.intro")}</p>

      <div className="mt-6 space-y-4 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <FilterGroup legend={t("library.area")}>
          <FilterChip pressed={area === "all"} onClick={() => setArea("all")} label={t("library.allAreas")} />
          {AREAS.map((item) => (
            <FilterChip
              key={item.id}
              pressed={area === item.id}
              onClick={() => setArea(item.id)}
              label={i18n.area(item.id)}
            />
          ))}
        </FilterGroup>
        <FilterGroup legend={t("library.position")}>
          <FilterChip
            pressed={position === "all"}
            onClick={() => setPosition("all")}
            label={t("library.allPositions")}
          />
          {POSITIONS.map((item) => (
            <FilterChip
              key={item.id}
              pressed={position === item.id}
              onClick={() => setPosition(item.id)}
              label={i18n.position(item.id)}
            />
          ))}
        </FilterGroup>
        <FilterGroup legend={t("library.sides")}>
          <FilterChip pressed={sides === "all"} onClick={() => setSides("all")} label={t("library.all")} />
          <FilterChip
            pressed={sides === "sided"}
            onClick={() => setSides("sided")}
            label={t("common.leftRight")}
          />
          <FilterChip
            pressed={sides === "together"}
            onClick={() => setSides("together")}
            label={t("common.bothTogether")}
          />
        </FilterGroup>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-base font-medium text-muted-foreground" aria-live="polite">
          {visible.length === total
            ? t("library.count", { total })
            : t("library.countOf", { count: visible.length, total })}
        </p>
        {filtered && visible.length > 0 && (
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline"
            onClick={clearFilters}
          >
            {t("library.clear")}
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <SearchX className="size-6" aria-hidden />
          </div>
          <h2 className="mt-4 text-2xl font-semibold">{t("library.emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-foreground/80">
            {t("library.emptyBody", { total })}
          </p>
          <Button type="button" size="lg" className="mt-5 h-12 rounded-2xl px-6" onClick={clearFilters}>
            {t("library.clear")}
          </Button>
        </div>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((stretch) => {
            const copy = i18n.stretch(stretch);
            return (
              <li key={stretch.id}>
                <Link
                  href={`/library/${stretch.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="relative stage pt-2">
                    <StretchFigure id={stretch.id} sizes="(min-width: 1024px) 240px, (min-width: 640px) 45vw, 90vw" className="mx-auto h-52 w-auto" />
                    <span className="absolute top-3 left-3 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-secondary-foreground shadow-sm backdrop-blur">
                      {copy.areaLabel}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-xl leading-tight font-semibold">{copy.name}</h2>
                      <ChevronRight className="mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </div>
                    <p className="mt-1 text-sm text-foreground/80">
                      {copy.plain}
                      <span className="text-muted-foreground"> · {copy.anatomical}</span>
                    </p>
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-3 text-xs font-semibold">
                      <span className="rounded-full bg-muted px-2.5 py-1">{copy.positionLabel}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                        <Timer className="size-3.5" aria-hidden />
                        {stretch.sided
                          ? t("common.secSide", { count: stretch.seconds })
                          : t("common.sec", { count: stretch.seconds })}
                      </span>
                      {stretch.sided && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
                          <ArrowLeftRight className="size-3.5" aria-hidden />
                          {t("common.leftRight")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

function FilterGroup({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{legend}</legend>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">{children}</div>
    </fieldset>
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
        "inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
        pressed
          ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
          : "border-border bg-background text-foreground/80 hover:border-primary/40",
      )}
    >
      {label}
    </button>
  );
}

"use client";

import Image from "next/image";
import { getStretch, type StretchId } from "@/lib/catalog";
import { getExercise } from "@/lib/exercise";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export type FigureVariant = "hold" | "mistake";

export function figureSrc(id: StretchId, variant: FigureVariant = "hold") {
  return `/illustrations/${id}${variant === "mistake" ? "-mistake" : ""}.webp`;
}

export function ExerciseFigure({
  id,
  altName,
  variant = "hold",
  priority = false,
  sizes = "(min-width: 1024px) 480px, 90vw",
  className,
}: {
  id: string;
  altName?: string;
  variant?: FigureVariant;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const i18n = useI18n();
  const move = getExercise(id);
  const title = altName ?? (move ? i18n.exercise(move).name : id);
  const name = i18n.t(variant === "mistake" ? "figure.exerciseMistake" : "figure.exerciseHold", {
    name: title,
  });
  return (
    <Image
      src={`/illustrations/exercise/${id}${variant === "mistake" ? "-mistake" : ""}.webp`}
      alt={name}
      width={720}
      height={720}
      sizes={sizes}
      priority={priority}
      draggable={false}
      className={cn(
        "block aspect-square h-auto w-full object-contain mix-blend-multiply select-none",
        className,
      )}
    />
  );
}

export function StretchFigure({
  id,
  variant = "hold",
  mirror = false,
  priority = false,
  sizes = "(min-width: 1024px) 480px, 90vw",
  className,
}: {
  id: StretchId;
  variant?: FigureVariant;
  mirror?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const i18n = useI18n();
  const stretch = getStretch(id);
  const name = stretch ? i18n.stretch(stretch).name : id;
  const label = i18n.t(variant === "mistake" ? "figure.mistake" : "figure.hold", { name });
  return (
    <Image
      src={figureSrc(id, variant)}
      alt={label}
      width={720}
      height={720}
      sizes={sizes}
      priority={priority}
      draggable={false}
      // The renders sit on an off-white backdrop; multiply lets the card tint show through.
      className={cn(
        "block aspect-square h-auto w-full object-contain mix-blend-multiply select-none",
        mirror && "-scale-x-100",
        className,
      )}
    />
  );
}

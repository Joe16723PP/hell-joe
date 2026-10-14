"use client";

import Image from "next/image";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import type { DemoFrames } from "@/lib/move-demo";
import { publicPath } from "@/lib/public-path";

export function MoveDemo({ name, frames }: { name: string; frames: DemoFrames }) {
  const { t } = useI18n();
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setPlaying(false);
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const timer = window.setTimeout(() => {
      if (frame >= frames.length - 1) setPlaying(false);
      else setFrame((current) => current + 1);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [frame, frames.length, playing, reducedMotion]);

  function control() {
    if (reducedMotion) {
      setFrame((current) => (current >= frames.length - 1 ? 0 : current + 1));
      return;
    }
    if (playing) {
      setPlaying(false);
      return;
    }
    if (frame >= frames.length - 1) setFrame(0);
    setPlaying(true);
  }

  const label = reducedMotion
    ? t("demo.nextFrame")
    : playing
      ? t("demo.pause")
      : frame >= frames.length - 1
        ? t("demo.replay")
        : t("demo.play");

  return (
    <section className="mt-5 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">{t("demo.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("demo.frameCount", { count: frames.length })}</p>
        </div>
        <Button type="button" variant="outline" className="min-h-11 rounded-2xl" onClick={control}>
          {reducedMotion ? (
            <SkipForward className="size-4" aria-hidden />
          ) : playing ? (
            <Pause className="size-4" aria-hidden />
          ) : frame >= frames.length - 1 ? (
            <RotateCcw className="size-4" aria-hidden />
          ) : (
            <Play className="size-4 fill-current" aria-hidden />
          )}
          {label}
        </Button>
      </div>
      <figure className="mt-3 overflow-hidden rounded-2xl bg-[#f7f7f4]">
        <Image
          key={frames[frame]}
          src={publicPath(frames[frame])}
          alt={t("demo.frameAlt", { name, current: frame + 1, total: frames.length })}
          width={512}
          height={512}
          sizes="(min-width: 1024px) 420px, 90vw"
          className="mx-auto aspect-square w-full max-w-sm object-contain"
        />
      </figure>
    </section>
  );
}

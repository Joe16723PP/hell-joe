"use client";

import { useLayoutEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { StretchFigure } from "@/components/stretch-figure";
import type { Stretch } from "@/lib/catalog";
import { FORM_CUES, splitMistake, type FormCard, type Pt } from "@/lib/form-cues";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "cn";

type Tone = "wrong" | "right";

const TONE = {
  wrong: {
    stroke: "#e8492f",
    card: "border-[#f6c2b5] bg-[#fff3ef]",
    badge: "bg-[#ef5a3c] text-white shadow-[#ef5a3c]/30",
    pill: "bg-[#fde1d8] text-[#b9321a]",
    label: "bg-[#ffe3db]/95 text-[#b9321a] ring-[#f6c2b5]",
    caption: "text-[#8f2a17]",
  },
  right: {
    stroke: "#1f9a67",
    card: "border-[#b5e5cb] bg-[#eefaf3]",
    badge: "bg-[#1f8a5b] text-white shadow-[#1f8a5b]/30",
    pill: "bg-[#d3f1e1] text-[#17704a]",
    label: "bg-[#d9f4e5]/95 text-[#17704a] ring-[#b5e5cb]",
    caption: "text-[#145c3d]",
  },
} as const;

function curve(points: Pt[]) {
  const [a, b, c] = points;
  if (points.length === 2) return `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`;
  return `M${a[0]} ${a[1]} Q${b[0]} ${b[1]} ${c[0]} ${c[1]}`;
}

function Arrow({ from, to, bend = 0, color }: { from: Pt; to: Pt; bend?: number; color: string }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  const control: Pt = [
    (from[0] + to[0]) / 2 - (dy / length) * bend,
    (from[1] + to[1]) / 2 + (dx / length) * bend,
  ];
  const tx = to[0] - control[0];
  const ty = to[1] - control[1];
  const tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl;
  const uy = ty / tl;
  const head = 3.4;
  const wing = 2.2;
  const base: Pt = [to[0] - ux * head, to[1] - uy * head];
  const left: Pt = [base[0] - uy * wing, base[1] + ux * wing];
  const right: Pt = [base[0] + uy * wing, base[1] - ux * wing];
  return (
    <g>
      <path
        d={`M${from[0]} ${from[1]} Q${control[0]} ${control[1]} ${base[0]} ${base[1]}`}
        fill="none"
        stroke={color}
        strokeWidth={1.1}
        strokeLinecap="round"
      />
      <path d={`M${to[0]} ${to[1]} L${left[0]} ${left[1]} L${right[0]} ${right[1]} Z`} fill={color} />
    </g>
  );
}

function Overlay({ card, tone, idPrefix }: { card: FormCard; tone: Tone; idPrefix: string }) {
  const { t } = useI18n();
  const color = TONE[tone].stroke;
  const glow = `${idPrefix}-glow`;
  return (
    <>
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 size-full"
        aria-hidden
      >
        <defs>
          <radialGradient id={glow}>
            <stop offset="0%" stopColor={color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </radialGradient>
        </defs>
        {card.spot && <circle cx={card.spot[0]} cy={card.spot[1]} r={8} fill={`url(#${glow})`} />}
        {card.guides?.map((points, index) => (
          <path
            key={index}
            d={curve(points)}
            fill="none"
            stroke={color}
            strokeWidth={0.9}
            strokeDasharray="2.4 1.8"
            strokeLinecap="round"
          />
        ))}
        {card.cues.map(
          (cue) => cue.arrow && <Arrow key={cue.label} {...cue.arrow} color={color} />,
        )}
      </svg>
      {card.cues.map((cue) => (
        <CueLabel key={cue.label} at={cue.at} className={TONE[tone].label}>
          {t(cue.label)}
        </CueLabel>
      ))}
    </>
  );
}

/** Centers on its anchor, then nudges inward so longer Thai labels never cross the card edge. */
function CueLabel({ at, className, children }: { at: Pt; className: string; children: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const measure = () => {
      const width = box.clientWidth;
      const own = el.offsetWidth;
      const left = (at[0] / 100) * width - own / 2;
      const inset = 4;
      const clamped = Math.min(Math.max(left, inset), width - own - inset);
      el.style.setProperty("--shift", `${clamped - left}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(el);
    return () => observer.disconnect();
  }, [at, children]);

  return (
    <span
      ref={ref}
      className={cn(
        "absolute w-max max-w-[46%] rounded-xl px-2 py-1 text-center text-[0.7rem] leading-tight font-semibold shadow-sm ring-1 sm:px-2.5 sm:text-xs",
        className,
      )}
      style={{
        left: `${at[0]}%`,
        top: `${at[1]}%`,
        transform: "translate(calc(-50% + var(--shift, 0px)), -50%)",
      }}
    >
      {children}
    </span>
  );
}

function CompareCard({
  stretch,
  tone,
  caption,
}: {
  stretch: Stretch;
  tone: Tone;
  caption: string;
}) {
  const { t } = useI18n();
  const style = TONE[tone];
  const card = FORM_CUES[stretch.id][tone];
  const Icon = tone === "wrong" ? X : Check;
  return (
    <figure className={cn("flex flex-col overflow-hidden rounded-3xl border-2 shadow-[0_10px_30px_-18px_rgb(18_48_42/0.45)]", style.card)}>
      <div className="flex items-center gap-2.5 px-4 pt-4">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-full shadow-md", style.badge)}>
          <Icon className="size-5" strokeWidth={3.2} aria-hidden />
        </span>
        <span className={cn("rounded-full px-3 py-1 font-heading text-base font-semibold", style.pill)}>
          {tone === "wrong" ? t("form.wrong") : t("form.right")}
        </span>
      </div>
      <div className="relative mx-2 mt-1 aspect-square">
        <StretchFigure
          id={stretch.id}
          variant={tone === "wrong" ? "mistake" : "hold"}
          sizes="(min-width: 768px) 420px, 92vw"
        />
        <Overlay card={card} tone={tone} idPrefix={`${stretch.id}-${tone}`} />
      </div>
      {caption && (
        <figcaption className={cn("px-4 pb-4 text-sm leading-relaxed font-medium", style.caption)}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function FormCompare({ stretch }: { stretch: Stretch }) {
  const i18n = useI18n();
  const { wrong, fix } = splitMistake(i18n.stretch(stretch).mistake);
  return (
    <div className="grid gap-3 md:grid-cols-2 md:gap-4">
      <CompareCard stretch={stretch} tone="wrong" caption={wrong} />
      <CompareCard stretch={stretch} tone="right" caption={fix} />
    </div>
  );
}

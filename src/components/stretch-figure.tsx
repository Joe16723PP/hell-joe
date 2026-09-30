import type { ReactNode } from "react";
import { getStretch, type StretchId } from "@/lib/catalog";
import { cn } from "cn";

export type FigureVariant = "hold" | "setup" | "mistake";

const INK = "#2a2118";
const MUSCLE = "#c45c3e";
const PAPER = "#f7f1e6";

type Pt = [number, number];

function pathBetween(a: Pt, b: Pt, bend = 0) {
  const midX = (a[0] + b[0]) / 2 + bend;
  const midY = (a[1] + b[1]) / 2;
  return `M ${a[0]} ${a[1]} Q ${midX} ${midY} ${b[0]} ${b[1]}`;
}

function Line({
  a,
  b,
  bend = 0,
  width = 8,
}: {
  a: Pt;
  b: Pt;
  bend?: number;
  width?: number;
}) {
  return (
    <path
      d={pathBetween(a, b, bend)}
      fill="none"
      stroke={INK}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Muscle({ a, b, bend = 0 }: { a: Pt; b: Pt; bend?: number }) {
  return (
    <path
      d={pathBetween(a, b, bend)}
      fill="none"
      stroke={MUSCLE}
      strokeWidth={18}
      strokeLinecap="round"
    />
  );
}

function Head({
  x,
  y,
  face = "right",
  tilt = 0,
}: {
  x: number;
  y: number;
  face?: "left" | "right" | "front";
  tilt?: number;
}) {
  const nose =
    face === "right"
      ? `M ${x + 8} ${y} q 12 2 8 12`
      : face === "left"
        ? `M ${x - 8} ${y} q -12 2 -8 12`
        : `M ${x} ${y + 2} v 11`;
  return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <circle cx={x} cy={y} r={27} fill={PAPER} stroke={INK} strokeWidth={7} />
      <path d={nose} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

function Torso({ d }: { d: string }) {
  return (
    <path d={d} fill={PAPER} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
  );
}

function Chair({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round">
      <path d={`M ${x} ${y} h 132`} />
      <path d={`M ${x + 8} ${y} v -96`} />
      <path d={`M ${x + 18} ${y} v 72`} />
      <path d={`M ${x + 112} ${y} v 72`} />
    </g>
  );
}

function Foot({ at, dir = 1 }: { at: Pt; dir?: number }) {
  return <Line a={at} b={[at[0] + 34 * dir, at[1] + 8]} width={7} />;
}

function Ground() {
  return (
    <g>
      <ellipse cx="180" cy="408" rx="108" ry="9" fill="#e7dccb" />
      <path
        d="M48 404 H312"
        fill="none"
        stroke={INK}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.28}
      />
    </g>
  );
}

function HipFlexor({ variant }: { variant: FigureVariant }) {
  const mistake = variant === "mistake";
  const hip: Pt = mistake ? [176, 268] : [188, 252];
  const knee: Pt = [132, 360];
  const torso = mistake
    ? "M150 286 C186 246 236 196 228 140 C206 128 188 148 184 176 C176 214 156 252 146 292 Z"
    : "M164 262 C156 214 166 164 186 132 C208 124 226 146 220 186 C214 224 204 258 186 268 Z";
  return (
    <g>
      <Foot at={[96, 366]} dir={-1} />
      <Line a={knee} b={[108, 368]} />
      <Line a={hip} b={[258, 312]} bend={8} />
      <Line a={[258, 312]} b={[318, 372]} />
      <Foot at={[318, 372]} />
      <Torso d={torso} />
      <Line a={mistake ? [214, 156] : [204, 150]} b={[252, 304]} bend={16} />
      <Head
        x={mistake ? 236 : 202}
        y={mistake ? 112 : 96}
        tilt={mistake ? -18 : 0}
        face="right"
      />
      {variant === "hold" && <Muscle a={[178, 246]} b={[138, 348]} bend={-8} />}
      <Line a={hip} b={knee} bend={-6} />
    </g>
  );
}

function FigureFour({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  const torso = mistake
    ? "M150 168 C146 210 154 250 168 286 C210 294 236 270 228 230 C222 190 196 160 176 150 Z"
    : "M168 150 C160 196 166 236 176 276 C214 280 232 250 226 210 C220 174 200 148 180 146 Z";
  return (
    <g>
      <Chair x={78} y={292} />
      <Line a={[168, 286]} b={[156, 360]} />
      <Foot at={[150, 360]} dir={-1} />
      {!setup && (
        <>
          <Line a={[186, 278]} b={[248, 300]} bend={mistake ? 20 : -6} />
          <Line a={[248, 300]} b={[176, 318]} bend={mistake ? 8 : -18} />
        </>
      )}
      {setup && (
        <>
          <Line a={[160, 286]} b={[150, 360]} />
          <Foot at={[146, 360]} />
          <Line a={[198, 286]} b={[214, 360]} />
          <Foot at={[208, 360]} />
        </>
      )}
      <Torso d={torso} />
      <Head x={mistake ? 188 : 196} y={mistake ? 128 : 112} tilt={mistake ? 12 : 0} face="right" />
      {variant === "hold" && <Muscle a={[196, 250]} b={[236, 292]} bend={-10} />}
    </g>
  );
}

function Hamstring({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  const torso = setup
    ? "M132 250 C124 196 132 150 154 118 C176 110 196 128 190 168 C184 206 176 240 158 256 Z"
    : mistake
      ? "M138 268 C170 240 210 230 236 210 C228 188 196 196 168 214 C150 228 132 248 124 276 Z"
      : "M124 262 C156 214 196 176 228 150 C214 136 188 148 164 186 C146 214 130 242 122 268 Z";
  return (
    <g>
      <Chair x={48} y={286} />
      <Line a={[150, 286]} b={[168, 360]} />
      <Foot at={[160, 360]} />
      <Line a={[168, 278]} b={[250, 332]} bend={6} />
      <Line a={[250, 332]} b={[318, 378]} />
      <Foot at={[312, 374]} />
      <Torso d={torso} />
      {!setup && (
        <Line
          a={mistake ? [214, 196] : [210, 162]}
          b={[268, 318]}
          bend={mistake ? 10 : 6}
        />
      )}
      <Head
        x={setup ? 168 : mistake ? 228 : 214}
        y={setup ? 92 : mistake ? 176 : 128}
        tilt={setup ? 0 : mistake ? 28 : -12}
        face="right"
      />
      {variant === "hold" && <Muscle a={[176, 286]} b={[308, 368]} bend={-12} />}
    </g>
  );
}

function Cat({ variant }: { variant: FigureVariant }) {
  const mistake = variant === "mistake";
  const back = mistake
    ? "M92 292 C120 300 150 286 176 292 C210 300 236 286 262 300 C270 246 230 250 196 246 C150 240 112 248 88 270 Z"
    : "M96 268 C130 214 168 176 214 168 C250 164 286 196 292 246 C270 236 236 214 196 220 C156 226 120 246 96 268 Z";
  return (
    <g>
      <Line a={[108, 286]} b={[108, 360]} />
      <Foot at={[96, 352]} dir={-1} />
      <Line a={[286, 286]} b={[300, 360]} />
      <Foot at={[292, 356]} />
      <Torso d={back} />
      <Line a={mistake ? [96, 300] : [108, 250]} b={mistake ? [70, 336] : [78, 286]} />
      <Head
        x={mistake ? 64 : 72}
        y={mistake ? 318 : 268}
        tilt={mistake ? 30 : 16}
        face="left"
      />
      {variant === "hold" && (
        <path
          d="M124 232 Q186 188 258 228"
          fill="none"
          stroke={MUSCLE}
          strokeWidth={16}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

function Chest({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  const shoulderY = mistake ? 118 : 150;
  return (
    <g>
      <Line a={[176, 268]} b={[168, 340]} />
      <Line a={[168, 340]} b={[164, 392]} />
      <Foot at={[156, 388]} />
      <Line a={[196, 268]} b={[206, 340]} />
      <Line a={[206, 340]} b={[214, 392]} />
      <Foot at={[206, 388]} />
      <Torso
        d={
          mistake
            ? "M158 250 C150 196 168 140 196 112 C220 124 232 160 226 204 C220 240 208 262 184 268 Z"
            : "M160 262 C152 210 162 168 184 140 C208 132 228 156 224 198 C218 236 206 264 184 270 Z"
        }
      />
      {setup ? (
        <>
          <Line a={[176, 156]} b={[150, 230]} />
          <Line a={[206, 156]} b={[228, 236]} />
        </>
      ) : (
        <>
          <Line a={[mistake ? 188 : 176, shoulderY]} b={[142, mistake ? 150 : 196]} bend={-8} />
          <Line a={[142, mistake ? 150 : 196]} b={[168, 236]} bend={10} />
        </>
      )}
      <Head x={mistake ? 210 : 198} y={mistake ? 86 : 102} tilt={mistake ? -8 : 0} face="right" />
      {variant === "hold" && (
        <path
          d="M186 168 C206 160 222 176 218 198 C200 206 184 196 186 178 Z"
          fill={MUSCLE}
        />
      )}
    </g>
  );
}

function Neck({ variant }: { variant: FigureVariant }) {
  const mistake = variant === "mistake";
  const tilt = 22;
  return (
    <g>
      <Chair x={96} y={318} />
      <Torso d="M156 176 C150 220 156 268 170 312 C214 316 236 286 228 240 C220 198 204 170 180 168 Z" />
      <Line a={[168, 188]} b={mistake ? [154, 150] : [148, 196]} />
      <Line a={[214, 186]} b={[236, 210]} />
      <Head x={198} y={132} tilt={tilt} face="front" />
      {variant === "hold" && <Muscle a={[176, 150]} b={[162, 186]} bend={-6} />}
    </g>
  );
}

function Shoulder({ variant }: { variant: FigureVariant }) {
  const mistake = variant === "mistake";
  const elbow: Pt = mistake ? [250, 132] : [262, 188];
  return (
    <g>
      <Chair x={92} y={324} />
      <Torso d="M150 184 C146 230 154 280 170 324 C220 328 242 292 232 246 C224 206 204 176 176 176 Z" />
      <Line a={[168, 196]} b={elbow} bend={mistake ? -8 : 4} />
      <Line a={[236, mistake ? 150 : 184]} b={[elbow[0] - 8, elbow[1] + 6]} />
      <Head x={196} y={132} face="front" />
      {variant === "hold" && <Muscle a={[164, 188]} b={[214, 184]} bend={-8} />}
    </g>
  );
}

function Quad({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  const knee: Pt = mistake ? [262, 292] : [236, 300];
  return (
    <g>
      {(setup || variant === "hold" || mistake) && (
        <path
          d="M52 96 V404"
          fill="none"
          stroke={INK}
          strokeWidth={6}
          strokeLinecap="round"
        />
      )}
      <Line a={[176, 250]} b={[170, 330]} />
      <Line a={[170, 330]} b={[166, 392]} />
      <Foot at={[156, 388]} />
      {!setup && (
        <>
          <Line a={[186, 246]} b={knee} bend={mistake ? 16 : 8} />
          <Line a={knee} b={mistake ? [214, 214] : [196, 214]} bend={-8} />
        </>
      )}
      {setup && (
        <>
          <Line a={[196, 250]} b={[206, 330]} />
          <Line a={[206, 330]} b={[210, 392]} />
          <Foot at={[202, 388]} />
        </>
      )}
      <Torso
        d={
          mistake
            ? "M156 268 C170 220 214 176 236 140 C214 128 190 150 184 186 C174 220 158 248 148 276 Z"
            : "M158 262 C150 214 160 168 182 140 C206 132 224 154 218 196 C212 232 200 262 180 270 Z"
        }
      />
      <Line
        a={setup ? [170, 156] : mistake ? [214, 156] : [200, 156]}
        b={setup ? [64, 188] : mistake ? [214, 214] : [198, 214]}
        bend={setup ? -6 : 8}
      />
      <Head
        x={mistake ? 228 : 196}
        y={mistake ? 108 : 104}
        tilt={mistake ? -16 : 0}
        face="right"
      />
      {variant === "hold" && <Muscle a={[188, 236]} b={[232, 292]} bend={10} />}
    </g>
  );
}

const POSES: Record<StretchId, (variant: FigureVariant) => ReactNode> = {
  "hip-flexor": (variant) => <HipFlexor variant={variant} />,
  "figure-four": (variant) => <FigureFour variant={variant} />,
  hamstring: (variant) => <Hamstring variant={variant} />,
  cat: (variant) => <Cat variant={variant} />,
  chest: (variant) => <Chest variant={variant} />,
  neck: (variant) => <Neck variant={variant} />,
  shoulder: (variant) => <Shoulder variant={variant} />,
  quad: (variant) => <Quad variant={variant} />,
};

export function StretchFigure({
  id,
  variant = "hold",
  mirror = false,
  className,
}: {
  id: StretchId;
  variant?: FigureVariant;
  mirror?: boolean;
  className?: string;
}) {
  const stretch = getStretch(id);
  const name = stretch?.name ?? "Stretch";
  const label =
    variant === "mistake"
      ? `${name}, the usual mistake`
      : variant === "setup"
        ? `${name}, the start`
        : `${name}, the hold`;
  return (
    <svg
      viewBox="0 0 360 440"
      role="img"
      aria-label={label}
      className={cn("h-auto w-full", className)}
    >
      <Ground />
      <g transform={mirror ? "translate(360 0) scale(-1 1)" : undefined}>
        {POSES[id](variant)}
      </g>
    </svg>
  );
}

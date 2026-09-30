export type FigureVariant = "hold" | "setup" | "mistake";

export const INK = "#2a2118";
export const MUSCLE = "#c45c3e";
export const PAPER = "#f7f1e6";

export type Pt = [number, number];

export function pathBetween(a: Pt, b: Pt, bend = 0) {
  const midX = (a[0] + b[0]) / 2 + bend;
  const midY = (a[1] + b[1]) / 2;
  return `M ${a[0]} ${a[1]} Q ${midX} ${midY} ${b[0]} ${b[1]}`;
}

export function Line({
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

export function Muscle({ a, b, bend = 0 }: { a: Pt; b: Pt; bend?: number }) {
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

export function Head({
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

export function Torso({ d }: { d: string }) {
  return (
    <path d={d} fill={PAPER} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
  );
}

export function Chair({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round">
      <path d={`M ${x} ${y} h 132`} />
      <path d={`M ${x + 8} ${y} v -96`} />
      <path d={`M ${x + 18} ${y} v 72`} />
      <path d={`M ${x + 112} ${y} v 72`} />
    </g>
  );
}

export function Foot({ at, dir = 1 }: { at: Pt; dir?: number }) {
  return <Line a={at} b={[at[0] + 34 * dir, at[1] + 8]} width={7} />;
}

export function Ground() {
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

export function Wall({ x = 48 }: { x?: number }) {
  return (
    <path
      d={`M ${x} 72 V 404`}
      fill="none"
      stroke={INK}
      strokeWidth={7}
      strokeLinecap="round"
    />
  );
}

export function Door({ x = 56, width = 200 }: { x?: number; width?: number }) {
  const right = x + width;
  return (
    <g fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round">
      <path d={`M ${x} 64 V 404`} />
      <path d={`M ${right} 64 V 404`} />
      <path d={`M ${x} 64 H ${right}`} />
    </g>
  );
}

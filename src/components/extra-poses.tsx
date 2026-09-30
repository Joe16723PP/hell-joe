import type { ReactNode } from "react";
import type { StretchId } from "@/lib/catalog";
import {
  Chair,
  Door,
  Foot,
  Head,
  Line,
  MUSCLE,
  Muscle,
  Torso,
  Wall,
  type FigureVariant,
  type Pt,
} from "@/components/figure-parts";

function ChinTuck({ variant }: { variant: FigureVariant }) {
  const mistake = variant === "mistake";
  const headX = mistake ? 228 : 186;
  const headY = mistake ? 112 : 104;
  return (
    <g>
      <Chair x={96} y={318} />
      <Torso d="M156 176 C150 220 156 268 170 312 C214 316 236 286 228 240 C220 198 204 170 180 168 Z" />
      <Head x={headX} y={headY} face="right" tilt={mistake ? 14 : -4} />
      {variant === "hold" && <Muscle a={[198, 128]} b={[214, 176]} bend={6} />}
    </g>
  );
}

function NeckTurn({ variant }: { variant: FigureVariant }) {
  const mistake = variant === "mistake";
  return (
    <g>
      <Chair x={96} y={318} />
      <Torso d="M156 176 C150 220 156 268 170 312 C214 316 236 286 228 240 C220 198 204 170 180 168 Z" />
      <Line a={[168, 188]} b={mistake ? [148, 146] : [146, 214]} />
      <Line a={[214, 186]} b={[244, 228]} />
      <Head
        x={mistake ? 214 : 188}
        y={124}
        face={mistake ? "right" : "left"}
        tilt={mistake ? -8 : 6}
      />
      {variant === "hold" && <Muscle a={[206, 136]} b={[224, 184]} bend={8} />}
    </g>
  );
}

function ShoulderReach({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  const shoulder: Pt = mistake ? [196, 132] : [184, 158];
  return (
    <g>
      <Line a={[176, 258]} b={[166, 332]} />
      <Line a={[166, 332]} b={[160, 392]} />
      <Foot at={[150, 388]} />
      <Line a={[198, 258]} b={[210, 332]} />
      <Line a={[210, 332]} b={[218, 392]} />
      <Foot at={[210, 388]} />
      <Torso
        d={
          mistake
            ? "M150 262 C172 210 214 156 240 128 C214 114 186 142 180 184 C166 214 150 242 142 270 Z"
            : "M158 262 C150 214 160 168 182 140 C206 132 226 154 220 196 C214 232 202 262 180 270 Z"
        }
      />
      {setup ? (
        <>
          <Line a={[172, 164]} b={[146, 240]} />
          <Line a={[208, 164]} b={[234, 244]} />
        </>
      ) : (
        <>
          <Line a={shoulder} b={[128, 214]} bend={-16} />
          <Line a={[128, 214]} b={[158, 252]} bend={10} />
        </>
      )}
      <Head
        x={mistake ? 230 : 196}
        y={mistake ? 96 : 104}
        tilt={mistake ? -16 : 0}
        face="right"
      />
      {variant === "hold" && (
        <path
          d="M186 168 C208 158 226 176 220 198 C200 208 184 196 186 176 Z"
          fill={MUSCLE}
        />
      )}
    </g>
  );
}

function ShoulderSide({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  const elbow: Pt = mistake ? [214, 148] : [226, 248];
  return (
    <g>
      <Line a={[268, 236]} b={[324, 268]} />
      <Line a={[324, 268]} b={[336, 318]} />
      <Torso d="M124 196 C170 176 236 178 286 206 C292 246 250 268 196 264 C142 260 112 236 124 196 Z" />
      <Head x={86} y={198} face="left" tilt={mistake ? -16 : 0} />
      <Line a={[150, 250]} b={[168, 292]} width={7} />
      {setup ? (
        <Line a={[168, 196]} b={[236, 168]} />
      ) : (
        <>
          <Line a={[176, 198]} b={elbow} bend={mistake ? -12 : 8} />
          <Line a={elbow} b={mistake ? [268, 132] : [286, 286]} />
        </>
      )}
      {variant === "hold" && <Muscle a={[156, 188]} b={[214, 204]} bend={-14} />}
    </g>
  );
}

function Doorway({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  return (
    <g>
      <Door x={48} width={210} />
      <Line a={[150, 268]} b={[142, 340]} />
      <Line a={[142, 340]} b={[136, 392]} />
      <Foot at={[126, 388]} />
      <Line a={[176, 268]} b={[188, 340]} />
      <Line a={[188, 340]} b={[198, 392]} />
      <Foot at={[190, 388]} />
      <Torso
        d={
          mistake
            ? "M132 260 C148 200 196 140 230 118 C208 108 176 140 168 186 C156 220 138 246 126 268 Z"
            : "M136 266 C128 214 140 168 164 142 C190 132 214 156 206 198 C198 234 184 264 164 272 Z"
        }
      />
      {setup ? (
        <>
          <Line a={[156, 168]} b={[132, 236]} />
          <Line a={[186, 168]} b={[214, 240]} />
        </>
      ) : (
        <>
          <Line a={mistake ? [196, 132] : [188, 156]} b={[248, mistake ? 118 : 150]} />
          <Line a={[248, mistake ? 118 : 150]} b={[258, 214]} />
        </>
      )}
      <Head
        x={mistake ? 214 : 178}
        y={mistake ? 92 : 108}
        tilt={mistake ? -18 : -6}
        face="right"
      />
      {variant === "hold" && (
        <path
          d="M170 164 C192 154 210 172 204 196 C186 204 168 190 170 172 Z"
          fill={MUSCLE}
        />
      )}
    </g>
  );
}

function Thread({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  if (setup) {
    return (
      <g>
        <Line a={[118, 268]} b={[112, 360]} />
        <Foot at={[98, 352]} dir={-1} />
        <Line a={[250, 270]} b={[268, 360]} />
        <Foot at={[260, 356]} />
        <Torso d="M116 248 C160 232 214 232 258 256 C262 214 220 190 176 196 C130 202 112 222 116 250 Z" />
        <Line a={[132, 236]} b={[78, 292]} />
        <Line a={[228, 236]} b={[292, 286]} />
        <Head x={72} y={246} face="left" />
      </g>
    );
  }
  return (
    <g>
      <Line a={[214, 292]} b={[220, 360]} />
      <Foot at={[208, 356]} />
      <Line a={[292, 286]} b={[308, 360]} />
      <Foot at={[300, 356]} />
      <Torso
        d={
          mistake
            ? "M118 292 C160 300 214 286 262 304 C270 250 228 246 184 248 C140 250 108 268 114 296 Z"
            : "M132 286 C176 236 224 220 278 242 C286 208 246 190 196 206 C152 220 122 250 132 286 Z"
        }
      />
      <Line
        a={mistake ? [150, 268] : [168, 246]}
        b={[64, mistake ? 236 : 318]}
        bend={mistake ? -10 : 6}
      />
      <Head
        x={mistake ? 58 : 78}
        y={mistake ? 214 : 292}
        face="left"
        tilt={mistake ? -24 : 12}
      />
      {variant === "hold" && (
        <path
          d="M156 236 Q206 204 258 232"
          fill="none"
          stroke={MUSCLE}
          strokeWidth={16}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

function Hug({ variant }: { variant: FigureVariant }) {
  const mistake = variant === "mistake";
  const torso = mistake
    ? "M146 196 C150 240 168 286 188 318 C230 310 248 270 236 228 C228 190 196 168 168 176 Z"
    : "M158 168 C150 214 160 262 176 312 C222 316 244 280 232 232 C222 188 200 160 176 162 Z";
  return (
    <g>
      <Chair x={88} y={318} />
      <Torso d={torso} />
      <Line a={mistake ? [176, 196] : [176, 176]} b={[236, 210]} bend={12} />
      <Line a={[236, 210]} b={[168, 236]} bend={-8} />
      <Line a={[168, 188]} b={[214, 168]} bend={-8} />
      <Head
        x={mistake ? 196 : 188}
        y={mistake ? 132 : 112}
        tilt={mistake ? 22 : 0}
        face="right"
      />
      {variant === "hold" && (
        <path
          d="M168 176 Q150 210 176 248"
          fill="none"
          stroke={MUSCLE}
          strokeWidth={16}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

function KneesChest({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  if (setup) {
    return (
      <g>
        <Torso d="M78 250 C140 232 230 232 300 252 C308 286 250 300 180 298 C110 296 72 278 78 250 Z" />
        <Head x={58} y={246} face="left" />
        <Line a={[286, 268]} b={[332, 300]} />
        <Line a={[332, 300]} b={[348, 332]} />
        <Foot at={[340, 328]} />
      </g>
    );
  }
  const knee: Pt = [236, mistake ? 150 : 176];
  return (
    <g>
      <Torso d="M86 268 C150 248 220 250 270 272 C276 304 230 318 168 314 C108 310 78 292 86 268 Z" />
      <Head x={mistake ? 70 : 64} y={mistake ? 214 : 258} face="left" tilt={mistake ? -20 : 0} />
      <Line a={[250, 280]} b={knee} bend={-6} />
      <Line a={knee} b={[196, mistake ? 168 : 210]} bend={8} />
      <Line a={[150, 250]} b={[210, 190]} width={7} />
      {variant === "hold" && <Muscle a={[196, 292]} b={[258, 300]} bend={10} />}
    </g>
  );
}

function ChildPose({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  if (setup) {
    return (
      <g>
        <Line a={[120, 268]} b={[114, 360]} />
        <Foot at={[100, 352]} dir={-1} />
        <Line a={[248, 270]} b={[266, 360]} />
        <Foot at={[258, 356]} />
        <Torso d="M118 250 C160 232 214 232 256 258 C260 216 220 192 176 198 C132 204 114 224 118 252 Z" />
        <Line a={[132, 236]} b={[80, 292]} />
        <Line a={[226, 236]} b={[290, 284]} />
        <Head x={74} y={246} face="left" />
      </g>
    );
  }
  if (mistake) {
    return (
      <g>
        <Line a={[176, 300]} b={[150, 368]} />
        <Foot at={[140, 364]} dir={-1} />
        <Line a={[210, 300]} b={[248, 368]} />
        <Foot at={[240, 364]} />
        <Torso d="M168 286 C200 210 250 196 286 230 C270 250 220 246 186 268 C160 280 148 276 164 292 Z" />
        <Line a={[250, 214]} b={[300, 250]} />
        <Head x={292} y={236} face="right" tilt={20} />
        <Line a={[168, 250]} b={[120, 300]} />
      </g>
    );
  }
  return (
    <g>
      <Line a={[168, 332]} b={[132, 372]} />
      <Foot at={[122, 368]} dir={-1} />
      <Line a={[214, 340]} b={[250, 376]} />
      <Foot at={[242, 372]} />
      <Torso d="M196 318 C230 300 250 320 236 352 C190 368 130 348 112 322 C100 292 150 286 190 312 Z" />
      <Line a={[150, 300]} b={[72, 332]} />
      <Head x={96} y={308} face="left" tilt={16} />
      <Muscle a={[140, 308]} b={[210, 330]} bend={-12} />
    </g>
  );
}

function Twist({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  return (
    <g>
      <Chair x={78} y={318} />
      <Torso
        d={
          setup
            ? "M156 168 C148 214 156 268 172 316 C218 318 240 286 230 236 C220 190 200 162 176 164 Z"
            : mistake
              ? "M150 176 C146 220 160 270 180 316 C226 308 250 260 232 214 C214 176 184 156 160 166 Z"
              : "M164 160 C150 206 156 262 174 316 C226 312 252 260 228 210 C210 170 188 150 170 156 Z"
        }
      />
      {setup ? (
        <>
          <Line a={[168, 186]} b={[142, 240]} />
          <Line a={[206, 186]} b={[236, 236]} />
        </>
      ) : (
        <>
          <Line a={mistake ? [188, 150] : [176, 176]} b={mistake ? [150, 128] : [118, 196]} />
          <Line a={[210, 196]} b={[248, 268]} bend={mistake ? -4 : 8} />
        </>
      )}
      <Head
        x={setup ? 190 : mistake ? 210 : 198}
        y={setup ? 118 : mistake ? 112 : 116}
        face={setup ? "right" : "front"}
        tilt={mistake ? -12 : setup ? 0 : 8}
      />
      {variant === "hold" && <Muscle a={[176, 210]} b={[214, 268]} bend={12} />}
    </g>
  );
}

function Lunge({ variant }: { variant: FigureVariant }) {
  const mistake = variant === "mistake";
  const hip: Pt = mistake ? [168, 248] : [176, 228];
  const torso = mistake
    ? "M150 250 C176 196 226 140 248 108 C220 96 190 128 184 170 C172 206 154 232 144 258 Z"
    : "M158 236 C150 186 162 142 184 112 C208 104 228 128 220 170 C212 206 200 234 180 244 Z";
  return (
    <g>
      <Foot at={[108, 368]} dir={-1} />
      <Line a={[136, 360]} b={[112, 372]} />
      <Line a={hip} b={[136, 360]} bend={-4} />
      <Line a={[198, 248]} b={[262, 300]} />
      <Line a={[262, 300]} b={[300, 372]} />
      <Foot at={[292, 368]} />
      <Torso d={torso} />
      <Line a={mistake ? [214, 140] : [196, 150]} b={[246, 292]} bend={8} />
      <Line a={mistake ? [200, 148] : [186, 156]} b={[250, 286]} bend={-6} />
      <Head
        x={mistake ? 236 : 198}
        y={mistake ? 84 : 84}
        tilt={mistake ? -20 : 0}
        face="right"
      />
      {variant === "hold" && <Muscle a={[170, 220]} b={[140, 348]} bend={-10} />}
    </g>
  );
}

function Butterfly({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  if (setup) {
    return (
      <g>
        <Line a={[150, 300]} b={[120, 360]} />
        <Line a={[120, 360]} b={[150, 392]} />
        <Foot at={[142, 388]} />
        <Line a={[190, 300]} b={[230, 360]} />
        <Line a={[230, 360]} b={[250, 392]} />
        <Foot at={[242, 388]} />
        <Torso d="M156 168 C148 214 156 268 172 308 C220 312 244 276 230 226 C218 182 198 160 174 164 Z" />
        <Head x={190} y={118} face="front" />
      </g>
    );
  }
  return (
    <g>
      <Line a={[176, 292]} b={mistake ? [96, 300] : [92, 268]} bend={mistake ? 8 : -8} />
      <Line a={mistake ? [96, 300] : [92, 268]} b={[168, 332]} bend={12} />
      <Line a={[196, 292]} b={mistake ? [286, 304] : [292, 270]} bend={mistake ? -8 : 8} />
      <Line a={mistake ? [286, 304] : [292, 270]} b={[204, 332]} bend={-12} />
      <Torso
        d={
          mistake
            ? "M150 210 C156 250 176 292 196 324 C230 312 248 270 236 230 C220 196 186 186 164 200 Z"
            : "M158 160 C150 206 158 260 176 308 C222 312 246 274 232 224 C218 176 196 152 174 156 Z"
        }
      />
      <Head x={mistake ? 196 : 188} y={mistake ? 168 : 112} face="front" tilt={mistake ? 16 : 0} />
      {variant === "hold" && (
        <>
          <Muscle a={[176, 286]} b={[112, 276]} bend={-8} />
          <Muscle a={[200, 286]} b={[268, 278]} bend={8} />
        </>
      )}
    </g>
  );
}

function SupineGlute({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  return (
    <g>
      <Torso d="M78 276 C140 256 230 258 292 280 C300 314 240 328 170 324 C100 320 70 300 78 276 Z" />
      <Head x={mistake ? 62 : 56} y={mistake ? 230 : 268} face="left" tilt={mistake ? -18 : 0} />
      {setup ? (
        <>
          <Line a={[250, 292]} b={[292, 250]} />
          <Line a={[292, 250]} b={[330, 300]} />
          <Foot at={[322, 296]} />
          <Line a={[230, 300]} b={[250, 250]} />
          <Line a={[250, 250]} b={[286, 292]} />
        </>
      ) : (
        <>
          <Line a={[236, 296]} b={[286, 236]} />
          <Line a={[286, 236]} b={[324, 292]} />
          <Foot at={[316, 288]} />
          <Line a={[220, 286]} b={[300, 250]} bend={mistake ? 16 : -4} />
          <Line a={[300, 250]} b={[248, 268]} bend={-10} />
        </>
      )}
      {variant === "hold" && <Muscle a={[228, 278]} b={[292, 252]} bend={-12} />}
    </g>
  );
}

function StandHam({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  return (
    <g>
      <Chair x={196} y={300} />
      <Line a={[150, 250]} b={[138, 330]} />
      <Line a={[138, 330]} b={[132, 392]} />
      <Foot at={[122, 388]} />
      {!setup && (
        <>
          <Line a={[176, 246]} b={[250, 286]} bend={6} />
          <Foot at={[286, 292]} />
        </>
      )}
      {setup && (
        <>
          <Line a={[176, 250]} b={[188, 330]} />
          <Line a={[188, 330]} b={[196, 392]} />
          <Foot at={[188, 388]} />
        </>
      )}
      <Torso
        d={
          setup
            ? "M140 250 C132 200 144 150 168 118 C192 110 212 132 204 174 C196 210 184 242 164 256 Z"
            : mistake
              ? "M132 268 C168 246 214 236 250 220 C236 200 196 206 164 228 C146 242 128 256 122 276 Z"
              : "M128 258 C156 214 196 176 232 148 C216 134 188 148 162 186 C144 214 130 240 124 264 Z"
        }
      />
      {!setup && (
        <Line
          a={mistake ? [214, 214] : [210, 164]}
          b={[168, 300]}
          bend={mistake ? 8 : 4}
        />
      )}
      <Head
        x={setup ? 178 : mistake ? 236 : 214}
        y={setup ? 92 : mistake ? 188 : 124}
        tilt={setup ? 0 : mistake ? 26 : -14}
        face="right"
      />
      {variant === "hold" && <Muscle a={[184, 250]} b={[292, 292]} bend={-8} />}
    </g>
  );
}

function SideQuad({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  return (
    <g>
      <Torso
        d={
          mistake
            ? "M96 250 C150 220 230 214 292 236 C300 272 246 286 180 284 C114 282 88 270 96 250 Z"
            : "M100 236 C156 214 236 214 300 240 C306 276 250 292 180 288 C112 284 90 262 100 236 Z"
        }
      />
      <Head x={72} y={mistake ? 214 : 228} face="left" tilt={mistake ? -12 : 0} />
      <Line a={[286, 268]} b={[336, 300]} />
      <Line a={[336, 300]} b={[348, 340]} />
      {setup ? (
        <Line a={[300, 250]} b={[346, 236]} />
      ) : (
        <>
          <Line a={[250, 236]} b={mistake ? [300, 168] : [268, 168]} bend={mistake ? 10 : 6} />
          <Line a={mistake ? [300, 168] : [268, 168]} b={mistake ? [250, 150] : [214, 188]} bend={-8} />
          <Line a={[196, 200]} b={mistake ? [268, 156] : [220, 176]} width={7} />
        </>
      )}
      {variant === "hold" && <Muscle a={[236, 228]} b={[292, 176]} bend={10} />}
    </g>
  );
}

function Calf({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  const heel: Pt = mistake ? [286, 332] : [300, 372];
  return (
    <g>
      <Wall x={46} />
      <Line a={[150, 250]} b={[132, 330]} />
      <Line a={[132, 330]} b={[124, 384]} />
      <Foot at={[114, 380]} />
      {!setup && (
        <>
          <Line a={[176, 246]} b={[250, 300]} bend={mistake ? -8 : 4} />
          <Line a={[250, 300]} b={heel} />
          {!mistake && <Foot at={[292, 368]} />}
        </>
      )}
      {setup && (
        <>
          <Line a={[176, 250]} b={[188, 330]} />
          <Line a={[188, 330]} b={[196, 388]} />
          <Foot at={[188, 384]} />
        </>
      )}
      <Torso d="M142 252 C134 204 146 156 170 124 C194 116 214 138 206 180 C198 214 186 246 166 258 Z" />
      <Line a={[164, 156]} b={[62, 168]} bend={-4} />
      <Line a={[176, 168]} b={[64, 196]} />
      <Head x={184} y={96} face="left" />
      {variant === "hold" && <Muscle a={[236, 292]} b={[292, 360]} bend={12} />}
    </g>
  );
}

export const EXTRA_POSES = {
  "chin-tuck": (variant: FigureVariant) => <ChinTuck variant={variant} />,
  "neck-turn": (variant: FigureVariant) => <NeckTurn variant={variant} />,
  "shoulder-reach": (variant: FigureVariant) => <ShoulderReach variant={variant} />,
  "shoulder-side": (variant: FigureVariant) => <ShoulderSide variant={variant} />,
  doorway: (variant: FigureVariant) => <Doorway variant={variant} />,
  thread: (variant: FigureVariant) => <Thread variant={variant} />,
  hug: (variant: FigureVariant) => <Hug variant={variant} />,
  "knees-chest": (variant: FigureVariant) => <KneesChest variant={variant} />,
  child: (variant: FigureVariant) => <ChildPose variant={variant} />,
  twist: (variant: FigureVariant) => <Twist variant={variant} />,
  lunge: (variant: FigureVariant) => <Lunge variant={variant} />,
  butterfly: (variant: FigureVariant) => <Butterfly variant={variant} />,
  "supine-glute": (variant: FigureVariant) => <SupineGlute variant={variant} />,
  "stand-ham": (variant: FigureVariant) => <StandHam variant={variant} />,
  "side-quad": (variant: FigureVariant) => <SideQuad variant={variant} />,
  calf: (variant: FigureVariant) => <Calf variant={variant} />,
} satisfies Partial<Record<StretchId, (variant: FigureVariant) => ReactNode>>;

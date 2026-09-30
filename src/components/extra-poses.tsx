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
      <Door x={64} width={188} />
      <Line a={[146, 268]} b={[136, 338]} />
      <Line a={[136, 338]} b={[128, 392]} />
      <Foot at={[118, 388]} />
      <Line a={[172, 268]} b={[186, 338]} />
      <Line a={[186, 338]} b={[198, 392]} />
      <Foot at={[190, 388]} />
      <Torso
        d={
          mistake
            ? "M128 262 C146 198 196 142 228 114 C204 104 174 138 168 184 C156 218 136 246 122 268 Z"
            : "M132 266 C124 214 136 168 160 140 C186 130 210 154 202 196 C194 232 180 264 160 272 Z"
        }
      />
      {setup ? (
        <>
          <Line a={[152, 168]} b={[128, 236]} />
          <Line a={[184, 168]} b={[214, 238]} />
        </>
      ) : (
        <>
          <Line a={mistake ? [198, 136] : [184, 158]} b={[246, mistake ? 112 : 148]} />
          <Line a={[246, mistake ? 112 : 148]} b={[248, 214]} />
        </>
      )}
      <Head
        x={mistake ? 214 : 172}
        y={mistake ? 90 : 108}
        tilt={mistake ? -18 : -4}
        face="right"
      />
      {variant === "hold" && (
        <path
          d="M166 162 C188 152 206 170 200 194 C182 202 164 188 166 170 Z"
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
        <Line a={[188, 286]} b={[164, 364]} />
        <Foot at={[154, 360]} dir={-1} />
        <Line a={[220, 286]} b={[258, 364]} />
        <Foot at={[250, 360]} />
        <Torso d="M176 276 C214 196 268 184 304 224 C286 246 232 242 196 266 C170 278 158 272 172 286 Z" />
        <Line a={[268, 204]} b={[326, 236]} />
        <Head x={318} y={220} face="right" tilt={16} />
      </g>
    );
  }
  return (
    <g>
      <Line a={[228, 318]} b={[196, 372]} />
      <Foot at={[186, 368]} dir={-1} />
      <Line a={[246, 328]} b={[286, 376]} />
      <Foot at={[278, 372]} />
      <Torso d="M108 292 C156 268 214 270 236 304 C242 336 196 352 146 346 C104 340 92 320 108 292 Z" />
      <Line a={[132, 292]} b={[46, 314]} />
      <Head x={84} y={304} face="left" tilt={14} />
      <Muscle a={[124, 286]} b={[214, 292]} bend={-6} />
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
        <Torso d="M156 168 C148 214 156 268 172 308 C220 312 244 276 230 226 C218 182 198 160 174 164 Z" />
        <Head x={190} y={112} face="front" />
        <Line a={[168, 308]} b={[150, 368]} />
        <Line a={[150, 368]} b={[186, 392]} />
        <Foot at={[178, 388]} />
        <Line a={[196, 308]} b={[228, 368]} />
        <Line a={[228, 368]} b={[258, 392]} />
        <Foot at={[250, 388]} />
      </g>
    );
  }
  const kneeL: Pt = mistake ? [86, 292] : [78, 268];
  const kneeR: Pt = mistake ? [292, 292] : [300, 268];
  return (
    <g>
      <Torso
        d={
          mistake
            ? "M148 196 C154 242 176 296 198 332 C234 318 252 272 238 226 C220 186 184 172 160 186 Z"
            : "M156 156 C148 204 156 258 174 312 C222 316 246 274 230 220 C216 170 194 146 172 152 Z"
        }
      />
      <Head x={mistake ? 198 : 186} y={mistake ? 156 : 108} face="front" tilt={mistake ? 18 : 0} />
      <Line a={[172, 304]} b={kneeL} />
      <Line a={kneeL} b={[176, 348]} />
      <Line a={[198, 304]} b={kneeR} />
      <Line a={kneeR} b={[194, 348]} />
      {variant === "hold" && (
        <>
          <Muscle a={[174, 300]} b={[102, 272]} bend={-4} />
          <Muscle a={[196, 300]} b={[272, 272]} bend={4} />
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
      <Torso d="M86 278 C146 258 228 260 286 282 C294 316 236 330 168 326 C104 322 78 304 86 278 Z" />
      <Head x={58} y={mistake ? 228 : 270} face="left" tilt={mistake ? -16 : 0} />
      {setup ? (
        <>
          <Line a={[210, 300]} b={[246, 236]} />
          <Line a={[246, 236]} b={[286, 308]} />
          <Foot at={[278, 304]} />
          <Line a={[236, 302]} b={[278, 248]} />
          <Line a={[278, 248]} b={[318, 310]} />
          <Foot at={[310, 306]} />
        </>
      ) : (
        <>
          <Line a={[236, 298]} b={[292, 228]} />
          <Line a={[292, 228]} b={[336, 300]} />
          <Foot at={[328, 296]} />
          <Line a={[206, 290]} b={[284, 232]} bend={-6} />
          <Line a={[284, 232]} b={[236, 268]} />
        </>
      )}
      {variant === "hold" && <Muscle a={[214, 284]} b={[278, 238]} bend={-8} />}
    </g>
  );
}

function StandHam({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  return (
    <g>
      <Chair x={188} y={292} />
      <Line a={[132, 250]} b={[122, 332]} />
      <Line a={[122, 332]} b={[116, 392]} />
      <Foot at={[106, 388]} />
      {setup ? (
        <>
          <Line a={[158, 250]} b={[172, 332]} />
          <Line a={[172, 332]} b={[180, 392]} />
          <Foot at={[172, 388]} />
        </>
      ) : (
        <>
          <Line a={[156, 246]} b={[236, 278]} />
          <Foot at={[268, 276]} />
        </>
      )}
      <Torso
        d={
          setup
            ? "M124 250 C116 198 128 148 152 116 C176 108 196 130 188 172 C180 208 168 242 148 256 Z"
            : mistake
              ? "M118 272 C156 248 206 236 246 214 C230 196 190 204 156 226 C136 242 114 258 108 278 Z"
              : "M116 256 C148 206 190 164 228 136 C212 122 184 136 156 176 C136 206 120 236 112 262 Z"
        }
      />
      <Head
        x={setup ? 164 : mistake ? 232 : 208}
        y={setup ? 90 : mistake ? 184 : 112}
        tilt={setup ? 0 : mistake ? 24 : -12}
        face="right"
      />
      {variant === "hold" && <Muscle a={[164, 248]} b={[260, 280]} bend={-6} />}
    </g>
  );
}

function SideQuad({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  const knee: Pt = mistake ? [292, 156] : [286, 176];
  return (
    <g>
      <Torso d="M102 230 C158 208 240 210 304 234 C310 268 252 286 180 282 C112 278 92 256 102 230 Z" />
      <Head x={74} y={mistake ? 200 : 224} face="left" tilt={mistake ? -14 : 0} />
      <Line a={[292, 260]} b={[348, 286]} />
      {setup ? (
        <Line a={[300, 242]} b={[352, 228]} />
      ) : (
        <>
          <Line a={[248, 232]} b={knee} />
          <Line a={knee} b={mistake ? [236, 140] : [220, 196]} />
          <Line a={[190, 214]} b={mistake ? [248, 146] : [224, 190]} width={7} />
        </>
      )}
      {variant === "hold" && <Muscle a={[240, 226]} b={[280, 182]} bend={8} />}
    </g>
  );
}

function Calf({ variant }: { variant: FigureVariant }) {
  const setup = variant === "setup";
  const mistake = variant === "mistake";
  return (
    <g>
      <Wall x={44} />
      <Torso d="M128 156 C120 206 132 256 152 292 C178 298 198 262 188 212 C178 170 158 148 138 152 Z" />
      <Head x={148} y={108} face="left" />
      <Line a={[138, 176]} b={[52, 168]} />
      <Line a={[146, 196]} b={[54, 206]} />
      <Line a={[156, 284]} b={[132, 342]} />
      <Line a={[132, 342]} b={[120, 392]} />
      <Foot at={[110, 388]} />
      {setup ? (
        <>
          <Line a={[176, 284]} b={[190, 342]} />
          <Line a={[190, 342]} b={[198, 392]} />
          <Foot at={[190, 388]} />
        </>
      ) : (
        <>
          <Line a={[172, 276]} b={[248, 328]} />
          <Line a={[248, 328]} b={mistake ? [286, 300] : [292, 386]} />
          {!mistake && <Foot at={[284, 382]} />}
        </>
      )}
      {variant === "hold" && <Muscle a={[236, 320]} b={[286, 372]} bend={10} />}
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

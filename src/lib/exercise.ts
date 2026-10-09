import { stretchIndex, type ExerciseChoice, type ExerciseFamily, type ExerciseMinutes } from "@/lib/plan";

export type ExercisePattern = "front" | "side" | "all-fours" | "bridge" | "push" | "legs";
export type ExercisePosition = "floor" | "all-fours" | "side" | "standing";
export type ExerciseEffort = "reps" | "hold";
export type ExerciseId =
  | "heel-tap"
  | "dead-bug"
  | "lying-knee-tuck"
  | "kneeling-plank"
  | "bear-hover"
  | "shoulder-tap"
  | "knee-side-plank"
  | "knee-side-plank-lift"
  | "side-lying-knee-lift"
  | "bird-dog"
  | "bird-dog-hold"
  | "glute-bridge"
  | "glute-bridge-hold"
  | "long-lever-dead-bug"
  | "slow-leg-lower"
  | "hollow-hold"
  | "slow-crunch"
  | "slow-bicycle"
  | "full-forearm-plank"
  | "full-side-plank"
  | "slow-push-up"
  | "slow-squat"
  | "slow-reverse-lunge"
  | "single-leg-glute-bridge"
  | "slow-hip-hinge";

export type ExercisePresetId =
  | "front-brace"
  | "side-brace"
  | "all-fours"
  | "bridge-brace"
  | "slow-front"
  | "slow-side"
  | "slow-all-fours"
  | "slow-legs";

export type ExerciseMove = {
  id: ExerciseId;
  name: string;
  option: ExerciseChoice;
  pattern: ExercisePattern;
  position: ExercisePosition;
  sided: boolean;
  effort: ExerciseEffort;
  plain: string;
  anatomical: string;
  setup: string | null;
  steps: [string, string, string];
  mistake: string;
  alternate: ExerciseId;
};

export type ExercisePreset = {
  id: ExercisePresetId;
  option: ExerciseChoice;
  family: ExerciseFamily;
  name: string;
  blurb: string;
  order: ExerciseId[];
};

export type Dose = {
  moves: number;
  sets: number;
  reps: number;
  hold: number;
  rest: number;
};

export type ExercisePhase = "work" | "side-pause" | "rest" | "move-pause";

export type ExerciseSessionState = {
  date: string;
  kind: "exercise" | "brace";
  option: ExerciseChoice;
  presetId: string;
  length: ExerciseMinutes;
  moveIds: string[];
  index: number;
  setIndex: number;
  sets: number;
  repsTarget: number;
  holdSeconds: number;
  restSeconds: number;
  side: "left" | "right";
  reps: number;
  phase: ExercisePhase;
  completed: string[];
  skipped: string[];
  status: "active" | "done";
};

const FAMILIES: ExerciseFamily[] = ["front", "side", "all-fours", "bridge"];

const PRESET_FOR: Record<ExerciseChoice, Record<ExerciseFamily, ExercisePresetId>> = {
  core: {
    front: "front-brace",
    side: "side-brace",
    "all-fours": "all-fours",
    bridge: "bridge-brace",
  },
  muscle: {
    front: "slow-front",
    side: "slow-side",
    "all-fours": "slow-all-fours",
    bridge: "slow-legs",
  },
};

export const EXERCISE_MOVES: ExerciseMove[] = [
  {
    id: "heel-tap",
    name: "Heel tap",
    option: "core",
    pattern: "front",
    position: "floor",
    sided: false,
    effort: "reps",
    plain: "Deep stomach",
    anatomical: "Transverse abdominis",
    setup: null,
    steps: [
      "Lie on your back, knees bent, feet on the floor. Press your lower back down lightly.",
      "Reach one heel forward, then the other, without letting your back lift.",
      "Keep the reach small and steady. You should still be able to speak a short sentence.",
    ],
    mistake: "Your lower back peels off the floor. Keep the reach shorter so your back stays quiet.",
    alternate: "dead-bug",
  },
  {
    id: "dead-bug",
    name: "Dead bug",
    option: "core",
    pattern: "front",
    position: "floor",
    sided: true,
    effort: "reps",
    plain: "Deep stomach",
    anatomical: "Transverse abdominis",
    setup: "Lie on your back with your arms toward the ceiling and your knees over your hips.",
    steps: [
      "Lie on your back, arms up, knees bent over your hips. Press your lower back down lightly.",
      "Reach the opposite arm and leg away, then bring them back.",
      "Move slowly. Your back stays on the floor the whole time.",
    ],
    mistake: "Your lower back arches as the leg reaches away. Shorten the reach and keep your back down.",
    alternate: "lying-knee-tuck",
  },
  {
    id: "lying-knee-tuck",
    name: "Lying knee tuck",
    option: "core",
    pattern: "front",
    position: "floor",
    sided: false,
    effort: "reps",
    plain: "Deep stomach",
    anatomical: "Transverse abdominis",
    setup: null,
    steps: [
      "Lie on your back with your knees bent and your shins lifted.",
      "Draw both knees in a little, then let them drift back out.",
      "Keep your lower back down and the movement small.",
    ],
    mistake: "Your knees yank in and your neck lifts. Keep your head down and the tuck gentle.",
    alternate: "heel-tap",
  },
  {
    id: "kneeling-plank",
    name: "Kneeling plank",
    option: "core",
    pattern: "front",
    position: "all-fours",
    sided: false,
    effort: "hold",
    plain: "Deep stomach",
    anatomical: "Transverse abdominis",
    setup: null,
    steps: [
      "Place your forearms and knees on the floor. Knees stay under your hips.",
      "Make one line from your head to your knees. Tuck your hips slightly.",
      "Breathe and hold. Your back stays flat, not sagging or piked.",
    ],
    mistake: "Your hips sag or pike up. Bring them back in line with your shoulders.",
    alternate: "bear-hover",
  },
  {
    id: "bear-hover",
    name: "Bear hover",
    option: "core",
    pattern: "all-fours",
    position: "all-fours",
    sided: false,
    effort: "hold",
    plain: "Deep stomach",
    anatomical: "Transverse abdominis",
    setup: null,
    steps: [
      "Set your hands under your shoulders and your toes on the floor, knees bent.",
      "Lift your knees just off the floor. Keep your back flat.",
      "Breathe and hold. Knees stay bent and off the floor.",
    ],
    mistake: "Your hips pike up toward the ceiling. Lower them until your back is flat and your knees stay just off the floor.",
    alternate: "kneeling-plank",
  },
  {
    id: "shoulder-tap",
    name: "Shoulder tap",
    option: "core",
    pattern: "front",
    position: "all-fours",
    sided: true,
    effort: "reps",
    plain: "Deep stomach",
    anatomical: "Transverse abdominis",
    setup: null,
    steps: [
      "Set up in a high plank, hands under your shoulders, legs straight.",
      "Lift one hand and tap the opposite shoulder, then put it back.",
      "Keep your hips steady. Move one side, then the other.",
    ],
    mistake: "Your hips rock from side to side. Slow down and keep your hips quiet.",
    alternate: "bird-dog",
  },
  {
    id: "knee-side-plank",
    name: "Knee side plank",
    option: "core",
    pattern: "side",
    position: "side",
    sided: true,
    effort: "hold",
    plain: "Side of the waist",
    anatomical: "Obliques",
    setup: null,
    steps: [
      "Lie on one side. Put your forearm on the floor and bend both knees.",
      "Lift your hips so your body is a line from knees to head.",
      "Breathe and hold. The bottom hip stays up.",
    ],
    mistake: "Your bottom hip drops toward the floor. Lift it until you are in one line.",
    alternate: "side-lying-knee-lift",
  },
  {
    id: "knee-side-plank-lift",
    name: "Knee side plank with a knee lift",
    option: "core",
    pattern: "side",
    position: "side",
    sided: true,
    effort: "reps",
    plain: "Side of the waist",
    anatomical: "Obliques",
    setup: "Set up in a knee side plank before the top knee lifts.",
    steps: [
      "Hold a knee side plank, hips lifted.",
      "Lift the top knee a little, then lower it.",
      "Your hips stay up while the knee moves.",
    ],
    mistake: "Your hips drop as the knee lifts. Keep the hip lifted and make the lift smaller.",
    alternate: "knee-side-plank",
  },
  {
    id: "side-lying-knee-lift",
    name: "Side-lying knee lift",
    option: "core",
    pattern: "side",
    position: "side",
    sided: true,
    effort: "reps",
    plain: "Side of the waist",
    anatomical: "Obliques",
    setup: null,
    steps: [
      "Lie on one side, head supported, knees bent and stacked.",
      "Keep your heels together and lift the top knee.",
      "Lower it with control. Your hips stay stacked.",
    ],
    mistake: "You roll backward as the knee lifts. Stay on your side and lift only as far as you can stay stacked.",
    alternate: "knee-side-plank",
  },
  {
    id: "bird-dog",
    name: "Bird dog",
    option: "core",
    pattern: "all-fours",
    position: "all-fours",
    sided: true,
    effort: "reps",
    plain: "Deep stomach",
    anatomical: "Transverse abdominis",
    setup: null,
    steps: [
      "Start on your hands and knees, back flat.",
      "Reach the opposite arm and leg out, then bring them back.",
      "Move slowly. Your hips stay level.",
    ],
    mistake: "Your hips twist and your lower back arches. Reach only as far as your hips stay square.",
    alternate: "bird-dog-hold",
  },
  {
    id: "bird-dog-hold",
    name: "Bird dog hold",
    option: "core",
    pattern: "all-fours",
    position: "all-fours",
    sided: true,
    effort: "hold",
    plain: "Deep stomach",
    anatomical: "Transverse abdominis",
    setup: null,
    steps: [
      "Start on your hands and knees, back flat.",
      "Reach the opposite arm and leg out until they are about level.",
      "Breathe and hold. Your hips stay square.",
    ],
    mistake: "The lifted leg swings higher than your hip and your back arches. Keep the leg about hip height.",
    alternate: "bird-dog",
  },
  {
    id: "glute-bridge",
    name: "Glute bridge",
    option: "core",
    pattern: "bridge",
    position: "floor",
    sided: false,
    effort: "reps",
    plain: "Glutes",
    anatomical: "Gluteus maximus",
    setup: null,
    steps: [
      "Lie on your back, knees bent, feet flat.",
      "Press through your heels and lift your hips until your body is a line.",
      "Lower slowly. Squeeze your glutes at the top, and keep your ribs down.",
    ],
    mistake: "Your ribs flare and your lower back pinches. Stop a little lower so the work stays in your glutes.",
    alternate: "glute-bridge-hold",
  },
  {
    id: "glute-bridge-hold",
    name: "Glute bridge hold",
    option: "core",
    pattern: "bridge",
    position: "floor",
    sided: false,
    effort: "hold",
    plain: "Glutes",
    anatomical: "Gluteus maximus",
    setup: null,
    steps: [
      "Lie on your back, knees bent, feet flat.",
      "Lift your hips until your body is a line from shoulders to knees.",
      "Breathe and hold. Your glutes do the work, and your ribs stay down.",
    ],
    mistake: "You push higher until your lower back pinches. Hold where your glutes work and your back feels easy.",
    alternate: "glute-bridge",
  },
  {
    id: "long-lever-dead-bug",
    name: "Long-lever dead bug",
    option: "muscle",
    pattern: "front",
    position: "floor",
    sided: true,
    effort: "reps",
    plain: "Deep stomach",
    anatomical: "Transverse abdominis",
    setup: "Lie on your back with your arms and legs reaching up.",
    steps: [
      "Lie on your back. Reach your arms up and straighten your legs toward the ceiling.",
      "Lower the opposite arm and leg toward the floor, slowly, then come back.",
      "Take about three seconds down, pause, and three seconds up. Your back stays down.",
    ],
    mistake: "Your lower back arches to chase a longer reach. Stop higher so your back stays on the floor.",
    alternate: "slow-leg-lower",
  },
  {
    id: "slow-leg-lower",
    name: "Slow leg lower",
    option: "muscle",
    pattern: "front",
    position: "floor",
    sided: true,
    effort: "reps",
    plain: "Deep stomach",
    anatomical: "Transverse abdominis",
    setup: null,
    steps: [
      "Lie on your back and hold one knee in. The other leg reaches up.",
      "Lower the long leg slowly, then bring it back up.",
      "Take about three seconds each way. Your lower back stays down.",
    ],
    mistake: "The long leg drops and your back lifts. Lower only as far as your back stays quiet.",
    alternate: "hollow-hold",
  },
  {
    id: "hollow-hold",
    name: "Hollow hold",
    option: "muscle",
    pattern: "front",
    position: "floor",
    sided: false,
    effort: "hold",
    plain: "Deep stomach",
    anatomical: "Transverse abdominis",
    setup: null,
    steps: [
      "Lie on your back and press your lower back into the floor.",
      "Lift your head and shoulders a little, and hover your legs.",
      "Breathe and hold. If your back lifts, bend your knees more.",
    ],
    mistake: "Your lower back arches and your neck strains. Bend your knees and keep your back down.",
    alternate: "slow-crunch",
  },
  {
    id: "slow-crunch",
    name: "Slow crunch",
    option: "muscle",
    pattern: "front",
    position: "floor",
    sided: false,
    effort: "reps",
    plain: "Belly",
    anatomical: "Rectus abdominis",
    setup: null,
    steps: [
      "Lie on your back, knees bent, hands lightly at your head.",
      "Curl your ribs toward your hips, then lower slowly.",
      "Take about three seconds up and three seconds down. Your neck stays easy.",
    ],
    mistake: "You pull your head forward with your hands. Let your hands rest and curl from your ribs.",
    alternate: "slow-bicycle",
  },
  {
    id: "slow-bicycle",
    name: "Slow bicycle",
    option: "muscle",
    pattern: "side",
    position: "floor",
    sided: true,
    effort: "reps",
    plain: "Side of the waist",
    anatomical: "Obliques",
    setup: null,
    steps: [
      "Lie on your back, hands lightly at your head, knees bent.",
      "Bring one knee in as the opposite ribs turn toward it.",
      "Switch sides slowly. About three seconds each way. Your lower back stays down.",
    ],
    mistake: "You yank your elbow across and your back arches. Turn from your ribs and keep the pace slow.",
    alternate: "hollow-hold",
  },
  {
    id: "full-forearm-plank",
    name: "Forearm plank",
    option: "muscle",
    pattern: "front",
    position: "floor",
    sided: false,
    effort: "hold",
    plain: "Deep stomach",
    anatomical: "Transverse abdominis",
    setup: null,
    steps: [
      "Set your forearms on the floor, elbows under your shoulders, legs straight.",
      "Make one line from your head to your heels.",
      "Breathe and hold. Your hips stay level, and you stop with a little effort left.",
    ],
    mistake: "Your hips sag or pike. Bring them back into one straight line.",
    alternate: "full-side-plank",
  },
  {
    id: "full-side-plank",
    name: "Side plank",
    option: "muscle",
    pattern: "side",
    position: "side",
    sided: true,
    effort: "hold",
    plain: "Side of the waist",
    anatomical: "Obliques",
    setup: null,
    steps: [
      "Lie on one side, forearm down, legs straight and stacked.",
      "Lift your hips into one line.",
      "Breathe and hold. If it is too much, drop the bottom knee.",
    ],
    mistake: "Your hips drop and you roll forward. Lift the hip and stay on your side.",
    alternate: "full-forearm-plank",
  },
  {
    id: "slow-push-up",
    name: "Slow push-up",
    option: "muscle",
    pattern: "push",
    position: "all-fours",
    sided: false,
    effort: "reps",
    plain: "Chest",
    anatomical: "Pectorals",
    setup: "Start on your knees if a full push-up is more than you can lower slowly.",
    steps: [
      "Set your hands under your shoulders in a high plank, or on your knees.",
      "Lower your chest slowly, pause, then press back up.",
      "Take about three seconds down and three seconds up. Your body stays in one line.",
    ],
    mistake: "Your hips sag and you drop fast. Slow down and keep one line from head to knees or heels.",
    alternate: "full-forearm-plank",
  },
  {
    id: "slow-squat",
    name: "Slow squat",
    option: "muscle",
    pattern: "legs",
    position: "standing",
    sided: false,
    effort: "reps",
    plain: "Front of the thigh",
    anatomical: "Quadriceps",
    setup: null,
    steps: [
      "Stand with your feet about hip width, and a chair behind you if you want it.",
      "Sit your hips back and bend your knees, then stand back up.",
      "Take about three seconds down, pause, and three seconds up. Your heels stay down.",
    ],
    mistake: "Your knees cave in and your heels lift. Keep your knees over your toes and your heels down.",
    alternate: "slow-reverse-lunge",
  },
  {
    id: "slow-reverse-lunge",
    name: "Slow reverse lunge",
    option: "muscle",
    pattern: "legs",
    position: "standing",
    sided: true,
    effort: "reps",
    plain: "Front of the thigh",
    anatomical: "Quadriceps",
    setup: null,
    steps: [
      "Stand tall, feet under your hips.",
      "Step one foot back and lower slowly, then return.",
      "Take about three seconds down and three seconds up. Your front knee stays over your foot.",
    ],
    mistake: "Your front knee dives in and your torso tips. Stay tall and keep the knee over the middle of your foot.",
    alternate: "slow-squat",
  },
  {
    id: "single-leg-glute-bridge",
    name: "Single-leg glute bridge",
    option: "muscle",
    pattern: "bridge",
    position: "floor",
    sided: true,
    effort: "reps",
    plain: "Glutes",
    anatomical: "Gluteus maximus",
    setup: null,
    steps: [
      "Lie on your back, one foot flat, the other leg reaching up or hovering.",
      "Press through the standing heel and lift your hips slowly.",
      "Lower with control. Your hips stay level.",
    ],
    mistake: "Your hips twist and your lower back takes over. Lift only as high as your hips stay even.",
    alternate: "slow-hip-hinge",
  },
  {
    id: "slow-hip-hinge",
    name: "Slow hip hinge",
    option: "muscle",
    pattern: "legs",
    position: "standing",
    sided: false,
    effort: "reps",
    plain: "Back of the thigh",
    anatomical: "Hamstrings",
    setup: null,
    steps: [
      "Stand tall, feet under your hips, knees softly bent.",
      "Send your hips back until you feel the back of your thighs, then stand up.",
      "Take about three seconds down and three seconds up. Your back stays long.",
    ],
    mistake: "Your back rounds and your knees lock. Soften your knees and fold from your hips.",
    alternate: "slow-squat",
  },
];

export const EXERCISE_PRESETS: ExercisePreset[] = [
  {
    id: "front-brace",
    option: "core",
    family: "front",
    name: "Front brace",
    blurb: "Steady work for the front of your trunk.",
    order: ["heel-tap", "dead-bug", "lying-knee-tuck", "kneeling-plank", "bear-hover", "shoulder-tap"],
  },
  {
    id: "side-brace",
    option: "core",
    family: "side",
    name: "Side brace",
    blurb: "Steady work for the sides of your waist.",
    order: ["knee-side-plank", "side-lying-knee-lift", "dead-bug", "bird-dog", "knee-side-plank-lift", "shoulder-tap"],
  },
  {
    id: "all-fours",
    option: "core",
    family: "all-fours",
    name: "All fours",
    blurb: "Hands-and-knees work that keeps your trunk steady.",
    order: ["bird-dog", "bear-hover", "shoulder-tap", "kneeling-plank", "bird-dog-hold", "dead-bug"],
  },
  {
    id: "bridge-brace",
    option: "core",
    family: "bridge",
    name: "Bridge brace",
    blurb: "Glutes and a quiet trunk.",
    order: ["glute-bridge", "glute-bridge-hold", "dead-bug", "bird-dog", "kneeling-plank", "heel-tap"],
  },
  {
    id: "slow-front",
    option: "muscle",
    family: "front",
    name: "Slow front",
    blurb: "Slow, full reps for the front of your trunk.",
    order: ["long-lever-dead-bug", "slow-leg-lower", "hollow-hold", "slow-crunch", "full-forearm-plank"],
  },
  {
    id: "slow-side",
    option: "muscle",
    family: "side",
    name: "Slow side",
    blurb: "Slow work for the sides of your waist.",
    order: ["full-side-plank", "slow-bicycle", "long-lever-dead-bug", "hollow-hold", "full-forearm-plank"],
  },
  {
    id: "slow-all-fours",
    option: "muscle",
    family: "all-fours",
    name: "Slow all fours",
    blurb: "A slow plank, a slow push-up, and a long dead bug.",
    order: ["slow-push-up", "full-forearm-plank", "long-lever-dead-bug", "full-side-plank", "hollow-hold"],
  },
  {
    id: "slow-legs",
    option: "muscle",
    family: "bridge",
    name: "Slow legs",
    blurb: "Slow squats, lunges, and hinges. No weights.",
    order: ["slow-squat", "slow-reverse-lunge", "single-leg-glute-bridge", "slow-hip-hinge", "hollow-hold"],
  },
];

export const BRACE_MOVE_IDS: ExerciseId[] = ["heel-tap", "kneeling-plank"];

export const BRACE_DOSE: Dose = { moves: 2, sets: 2, reps: 6, hold: 20, rest: 15 };

const moveMap = new Map(EXERCISE_MOVES.map((move) => [move.id, move]));
const presetMap = new Map(EXERCISE_PRESETS.map((preset) => [preset.id, preset]));

export function getExercise(id: string): ExerciseMove | undefined {
  return moveMap.get(id as ExerciseId);
}

export function getExercisePreset(id: string): ExercisePreset | undefined {
  return presetMap.get(id as ExercisePresetId);
}

export function doseFor(option: ExerciseChoice, length: ExerciseMinutes): Dose {
  if (option === "core") {
    if (length === 10) return { moves: 4, sets: 2, reps: 6, hold: 20, rest: 30 };
    if (length === 15) return { moves: 5, sets: 2, reps: 8, hold: 25, rest: 40 };
    return { moves: 6, sets: 3, reps: 5, hold: 15, rest: 20 };
  }
  if (length === 10) return { moves: 3, sets: 2, reps: 5, hold: 20, rest: 45 };
  if (length === 15) return { moves: 4, sets: 3, reps: 5, hold: 20, rest: 40 };
  return { moves: 5, sets: 3, reps: 6, hold: 25, rest: 40 };
}

export function presetIdFor(option: ExerciseChoice, family: ExerciseFamily): ExercisePresetId {
  return PRESET_FOR[option][family];
}

export function familyForPreset(id: string): ExerciseFamily {
  return getExercisePreset(id)?.family ?? "front";
}

export function suggestedFamily(date: Date, restDay: number): ExerciseFamily {
  const index = stretchIndex(date, restDay);
  return FAMILIES[index % FAMILIES.length] ?? "front";
}

export function exerciseMoveIds(presetId: string, length: ExerciseMinutes): string[] {
  const preset = getExercisePreset(presetId);
  if (!preset) return [];
  const count = doseFor(preset.option, length).moves;
  return preset.order.slice(0, Math.min(count, preset.order.length));
}

export function sessionMix(moveIds: readonly string[]): "reps" | "holds" | "mixed" {
  let reps = false;
  let holds = false;
  for (const id of moveIds) {
    const effort = getExercise(id)?.effort;
    if (effort === "reps") reps = true;
    if (effort === "hold") holds = true;
  }
  if (reps && holds) return "mixed";
  if (holds) return "holds";
  return "reps";
}

export function alternateExercise(id: string, used: readonly string[]): ExerciseMove | null {
  const move = getExercise(id);
  if (!move) return null;
  const preferred = getExercise(move.alternate);
  if (preferred && !used.includes(preferred.id)) return preferred;
  const unused = EXERCISE_MOVES.find(
    (item) => item.pattern === move.pattern && item.id !== move.id && !used.includes(item.id),
  );
  return unused ?? preferred ?? null;
}

export function recentPatterns(
  finished: { date: string; patterns: string[] }[],
  today: Date,
): string[] {
  const start = new Date(today);
  start.setDate(start.getDate() - 6);
  const startKey = [
    start.getFullYear(),
    String(start.getMonth() + 1).padStart(2, "0"),
    String(start.getDate()).padStart(2, "0"),
  ].join("-");
  const endKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  const seen: string[] = [];
  for (const entry of finished) {
    if (entry.date < startKey || entry.date > endKey) continue;
    for (const pattern of entry.patterns) {
      if (!seen.includes(pattern)) seen.push(pattern);
    }
  }
  return seen;
}

function withId(list: string[], id: string) {
  return list.includes(id) ? list : [...list, id];
}

export function afterExerciseWork(session: ExerciseSessionState): ExerciseSessionState {
  const id = session.moveIds[session.index] ?? "";
  const move = getExercise(id);
  const sided = Boolean(move?.sided);
  if (sided && session.side === "left") {
    return { ...session, phase: "side-pause", reps: 0 };
  }
  if (session.setIndex < session.sets - 1) {
    return { ...session, phase: "rest", reps: 0 };
  }
  const completed = withId(session.completed, id);
  if (session.index >= session.moveIds.length - 1) {
    return { ...session, completed, phase: "work", status: "done" };
  }
  return { ...session, completed, phase: "move-pause", reps: 0 };
}

export function afterExercisePause(session: ExerciseSessionState): ExerciseSessionState {
  if (session.phase === "side-pause") {
    return { ...session, phase: "work", side: "right", reps: 0 };
  }
  if (session.phase === "rest") {
    return {
      ...session,
      phase: "work",
      setIndex: session.setIndex + 1,
      side: "left",
      reps: 0,
    };
  }
  if (session.phase === "move-pause") {
    return {
      ...session,
      phase: "work",
      index: session.index + 1,
      setIndex: 0,
      side: "left",
      reps: 0,
    };
  }
  return session;
}

export function skipExerciseMove(session: ExerciseSessionState): ExerciseSessionState {
  const id = session.moveIds[session.index] ?? "";
  const skipped = withId(session.skipped, id);
  if (session.index >= session.moveIds.length - 1) {
    return { ...session, skipped, phase: "work", status: "done" };
  }
  return {
    ...session,
    skipped,
    index: session.index + 1,
    setIndex: 0,
    side: "left",
    reps: 0,
    phase: "work",
  };
}

export function replaceExerciseMove(session: ExerciseSessionState, id: string): ExerciseSessionState {
  const moveIds = [...session.moveIds];
  moveIds[session.index] = id;
  for (let index = session.index + 1; index < moveIds.length; index += 1) {
    if (moveIds[index] === id) {
      moveIds.splice(index, 1);
      break;
    }
  }
  return { ...session, moveIds, setIndex: 0, side: "left", reps: 0, phase: "work" };
}

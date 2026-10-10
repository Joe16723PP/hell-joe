import { addDays, isoDate } from "@/lib/plan";

export const LOADED_BARBELL_IDS = ["deadlift", "romanian-deadlift", "bent-over-row"] as const;

export const BANNED_LIFTS = [
  "back-squat",
  "front-squat",
  "bench-press",
  "floor-press",
  "overhead-press",
  "good-morning",
  "clean",
  "snatch",
  "rack",
  "unrack",
] as const;

export type WorkoutId = "A" | "B";
export type MoveId =
  | "deadlift"
  | "romanian-deadlift"
  | "bent-over-row"
  | "incline-push-up"
  | "knee-push-up"
  | "bodyweight-squat"
  | "reverse-lunge"
  | "front-plank"
  | "glute-bridge"
  | "side-plank"
  | "hip-hinge"
  | "ytw-raise"
  | "sit-to-stand";

export type Substitution = {
  moveId: MoveId;
  sets: number;
  repsMin: number;
  repsMax: number;
  restMin: number;
  restMax: number;
  hold: boolean;
};

export type BarbellMove = {
  id: MoveId;
  name: string;
  plain: string;
  anatomical: string;
  equipment: "barbell" | "bodyweight";
  figure: string;
  sided: boolean;
  hold: boolean;
  pauseAt: number | null;
  checks: string[];
  pausedCheck: string | null;
  cautions: string[];
  mistake: string;
  harder: string | null;
  substitutions: Substitution[];
  substitute: "heavy" | "hurts" | null;
};

export type Recipe = {
  moveId: MoveId;
  sets: number;
  maxSets: number;
  repsMin: number;
  repsMax: number;
  restMin: number;
  restMax: number;
  sided: boolean;
  hold: boolean;
  pauseSeconds: number;
  easierMoveId: MoveId | null;
};

export type ResolvedSlot = {
  moveId: MoveId;
  plannedMoveId: MoveId;
  sets: number;
  target: number;
  repsMax: number;
  restMin: number;
  restMax: number;
  sided: boolean;
  hold: boolean;
  pauseSeconds: number;
  slower: boolean;
  harder: boolean;
  easierMoveId: MoveId | null;
  reason: "plan" | "heavy" | "easier";
};

export type Suggestion =
  | { kind: "learn" }
  | { kind: "hold" }
  | { kind: "deload" }
  | { kind: "reps"; moveId: MoveId; to: number }
  | { kind: "tempo"; moveId: MoveId }
  | { kind: "set"; moveId: MoveId }
  | { kind: "variation"; moveId: MoveId };

export type MoveTune = {
  reps?: number;
  slower?: boolean;
  extraSet?: boolean;
  harder?: boolean;
};

export type BarbellProgress = {
  startedOn: string | null;
  deloadUntil: string | null;
  moves: Partial<Record<MoveId, MoveTune>>;
  pending: Suggestion | null;
};

export type AskedSlot = {
  moveId: MoveId;
  plannedMoveId: MoveId;
  sets: number;
  sided: boolean;
  target: number;
  reason: ResolvedSlot["reason"];
};

export type SetResult = {
  plannedMoveId: MoveId;
  moveId: MoveId;
  setIndex: number;
  side: "left" | "right" | "both";
  completed: number;
  reserve: boolean;
  skipped: boolean;
  substituted: boolean;
  easier: boolean;
};

export type BarbellRecord = {
  date: string;
  workout: WorkoutId;
  sleepEnergy: 1 | 2 | 3 | 4 | 5;
  warmUpDone: boolean;
  areaChecked: boolean;
  pain: boolean;
  soreOver72: boolean;
  formSlipped: boolean;
  results: SetResult[];
  asked: AskedSlot[];
  coolDownDone: boolean;
  cue: string;
  win: string;
  effortNote: string;
  blockedLoads: MoveId[];
};

const HINGE_AND_BRIDGE: Substitution[] = [
  { moveId: "hip-hinge", sets: 3, repsMin: 10, repsMax: 12, restMin: 60, restMax: 90, hold: false },
  { moveId: "glute-bridge", sets: 3, repsMin: 12, repsMax: 20, restMin: 60, restMax: 90, hold: false },
];

export const BARBELL_MOVES: BarbellMove[] = [
  {
    id: "deadlift",
    name: "Barbell deadlift",
    plain: "Hips, glutes, and hamstrings",
    anatomical: "Gluteus maximus, hamstrings, upper back",
    equipment: "barbell",
    figure: "deadlift",
    sided: false,
    hold: false,
    pauseAt: null,
    harder: null,
    substitute: "heavy",
    substitutions: HINGE_AND_BRIDGE,
    checks: [
      "Put the fixed bar on a flat floor. Stand with your feet about hip-width apart and the bar over the middle of your feet.",
      "Bend at the hips and knees. Take a double-overhand grip just outside your legs.",
      "Draw your shoulders gently down and back. Keep your neck neutral and look at the floor a few feet ahead.",
      "Brace your midsection and pull the slack out of the bar before it leaves the floor.",
      "Push the floor away so your hips and shoulders rise together. Keep the bar close to your shins and thighs.",
      "Stand tall and squeeze your glutes gently. Do not lean backward.",
      "Send your hips back first, then bend your knees once the bar reaches them. Set it down quietly and reset every rep.",
    ],
    pausedCheck: null,
    cautions: [
      "Keep your back neutral. Do not round it to reach lower.",
      "Do not jerk the bar, bounce it, or twist while you hold it.",
      "Stop if your back feels sharp, pinchy, or unstable.",
      "If 20 kg forces a rounded back, switch to the hip-hinge drill and glute bridges. Do not pull the heavy rep.",
    ],
    mistake: "The back rounds to reach the bar. Raise your chest and use the unloaded hinge until the back stays long.",
  },
  {
    id: "romanian-deadlift",
    name: "Barbell Romanian deadlift",
    plain: "Hamstrings and glutes",
    anatomical: "Hamstrings, gluteus maximus",
    equipment: "barbell",
    figure: "romanian-deadlift",
    sided: false,
    hold: false,
    pauseAt: null,
    harder: null,
    substitute: "heavy",
    substitutions: HINGE_AND_BRIDGE,
    checks: [
      "Deadlift the bar from the floor to standing, using the deadlift checklist.",
      "Stand with your feet hip-width apart, the bar against your thighs, and your knees softly bent.",
      "Push your hips straight back so the bar slides close down your thighs.",
      "Keep your back neutral. Stop when your hamstrings limit you, before your lower back rounds. The bar does not have to reach the floor.",
      "Drive your hips forward to stand tall and squeeze your glutes gently. Do not lean back.",
      "After the last rep, lower the bar with the deadlift pattern. If you cannot stand cleanly, bend your knees once the bar reaches them and set it down.",
    ],
    pausedCheck: null,
    cautions: [
      "This is a hip hinge. Your hips move back and your knees stay only slightly bent.",
      "A shorter controlled range is the right range.",
      "If you only feel your lower back, reduce the depth or switch to glute bridges and the hinge drill.",
    ],
    mistake: "The knees bend into a squat and the back rounds. Keep the knees soft and move only from the hips.",
  },
  {
    id: "bent-over-row",
    name: "Barbell bent-over row",
    plain: "Upper back and lats",
    anatomical: "Latissimus dorsi, rear shoulders",
    equipment: "barbell",
    figure: "bent-over-row",
    sided: false,
    hold: false,
    pauseAt: 4,
    harder: null,
    substitute: "heavy",
    substitutions: [
      { moveId: "ytw-raise", sets: 3, repsMin: 6, repsMax: 6, restMin: 60, restMax: 90, hold: false },
    ],
    checks: [
      "Deadlift the bar to standing, using the deadlift checklist.",
      "Push your hips back until your torso is about 30–45° forward. Keep your back long and your neck neutral.",
      "Let the bar hang close to your thighs with straight arms and a double-overhand grip.",
      "Pull the bar toward your lower ribs by driving your elbows back.",
      "Pause briefly and squeeze your shoulder blades gently. Do not shrug toward your ears.",
      "Lower the bar slowly until your arms are straight, without moving your torso.",
      "Stand tall, then lower the bar with the deadlift pattern. If you cannot stand cleanly, bend your knees and set the bar down.",
    ],
    pausedCheck: "Hold the bar at your torso for one full second. If the pause makes you swing, end the set.",
    cautions: [
      "Do not swing your torso or heave the bar.",
      "Do not crane your neck to look in a mirror.",
      "If the hinge hurts your lower back, switch to prone Y-T-W raises or skip the row.",
    ],
    mistake: "The torso swings and the back rounds to heave the bar. Shorten the reps and keep the torso quiet.",
  },
  {
    id: "incline-push-up",
    name: "Incline push-up",
    plain: "Chest, shoulders, and triceps",
    anatomical: "Pectorals, deltoids, triceps",
    equipment: "bodyweight",
    figure: "incline-push-up",
    sided: false,
    hold: false,
    pauseAt: null,
    harder: "Use a slightly lower secure surface than last time.",
    substitute: null,
    substitutions: [],
    checks: [
      "Place your hands about shoulder-width apart on a stable countertop or a heavy table fixed against a wall.",
      "Walk your feet back so your body makes one straight line from head to heels.",
      "Brace your stomach and squeeze your glutes lightly. Do not let your hips sag or pike up.",
      "Lower your chest toward the surface with your elbows about 30–45° from your body.",
      "Press through your palms to the start without shrugging your shoulders.",
    ],
    pausedCheck: null,
    cautions: [
      "Choose a higher surface if your lower back sags or your shoulders feel strained.",
      "Do not use a chair that can slide or tip, and do not use the barbell as the hand support.",
      "Stop for wrist, shoulder, or chest pain.",
    ],
    mistake: "The hips sag and the shoulders shrug. Raise the surface until your body stays in one line.",
  },
  {
    id: "knee-push-up",
    name: "Knee push-up",
    plain: "Chest, shoulders, and triceps",
    anatomical: "Pectorals, deltoids, triceps",
    equipment: "bodyweight",
    figure: "knee-push-up",
    sided: false,
    hold: false,
    pauseAt: null,
    harder: null,
    substitute: null,
    substitutions: [],
    checks: [
      "Kneel on a padded mat with your hands under your shoulders.",
      "Make one straight line from your knees through your hips to your head. Do not bend at the waist.",
      "Brace, then lower your chest with your elbows about 30–45° from your body.",
      "Press back up without shrugging.",
    ],
    pausedCheck: null,
    cautions: [
      "Do not use the barbell as the hand support.",
      "Stop for wrist, shoulder, or chest pain.",
    ],
    mistake: "The hips bend and the waist folds. Keep one line from your knees to your head.",
  },
  {
    id: "bodyweight-squat",
    name: "Bodyweight squat",
    plain: "Thighs and glutes",
    anatomical: "Quadriceps, gluteus maximus",
    equipment: "bodyweight",
    figure: "slow-squat",
    sided: false,
    hold: false,
    pauseAt: null,
    harder: "Pause for one second at the bottom.",
    substitute: null,
    substitutions: [],
    checks: [
      "Stand with your feet about shoulder-width apart. Turn your toes out only as far as feels natural.",
      "Sit your hips down and slightly back. Let your knees travel in the same direction as your toes.",
      "Keep your whole foot on the floor and your chest comfortably tall.",
      "Go only as deep as you can stay balanced and pain-free.",
      "Press through the mid-foot to stand tall without snapping your knees backward.",
    ],
    pausedCheck: null,
    cautions: [
      "A light hand on a wall is fine. Do not pull on it.",
      "A chair behind you can mark the depth. Do not drop onto it.",
      "Stop for knee, hip, or back pain.",
    ],
    mistake: "The heels lift and the knees cave in. Stay over the whole foot and track the knees with the toes.",
  },
  {
    id: "reverse-lunge",
    name: "Supported reverse lunge",
    plain: "Thighs, glutes, and balance",
    anatomical: "Quadriceps, gluteus maximus",
    equipment: "bodyweight",
    figure: "slow-reverse-lunge",
    sided: true,
    hold: false,
    pauseAt: null,
    harder: "Use a lighter fingertip touch on the wall than last time.",
    substitute: "hurts",
    substitutions: [
      { moveId: "sit-to-stand", sets: 3, repsMin: 8, repsMax: 15, restMin: 60, restMax: 90, hold: false },
    ],
    checks: [
      "Stand beside a wall, counter, or doorframe. Keep one or two fingertips on it for balance.",
      "Step one foot back far enough that both knees can bend comfortably.",
      "Lower under control until the rear knee is close to the floor or you reach a pain-free depth.",
      "Keep the front foot planted and the front knee tracking in line with the toes.",
      "Push through the front foot to stand, then repeat that side.",
      "Stay on body weight only. Do not hold the barbell.",
    ],
    pausedCheck: null,
    cautions: [
      "Shorten the range or use more support if your balance is uncertain.",
      "If reverse lunges hurt, switch to sit-to-stand from a stable chair.",
    ],
    mistake: "The front knee dives in and the torso tips. Stay tall and keep the knee over the middle of the foot.",
  },
  {
    id: "front-plank",
    name: "Front plank",
    plain: "Trunk and shoulders",
    anatomical: "Abdominals, shoulders",
    equipment: "bodyweight",
    figure: "full-forearm-plank",
    sided: false,
    hold: true,
    pauseAt: null,
    harder: null,
    substitute: null,
    substitutions: [],
    checks: [
      "Place your forearms on the floor with your elbows under your shoulders, then step your feet back.",
      "Make a straight line from head to heels. Tighten your stomach and glutes gently.",
      "Breathe quietly. Keep your neck neutral and your eyes on the floor.",
      "Stop before your hips sag, your shoulders pinch, or you hold your breath.",
    ],
    pausedCheck: null,
    cautions: [
      "Use your knees if the full plank makes your lower back dip.",
      "A clean shorter hold is better than a shaky longer one.",
    ],
    mistake: "The hips sag or pike. Bring them back into one straight line and shorten the hold.",
  },
  {
    id: "glute-bridge",
    name: "Bodyweight glute bridge",
    plain: "Glutes and hamstrings",
    anatomical: "Gluteus maximus, hamstrings",
    equipment: "bodyweight",
    figure: "glute-bridge",
    sided: false,
    hold: false,
    pauseAt: null,
    harder: null,
    substitute: null,
    substitutions: [],
    checks: [
      "Lie on the floor with your knees bent and your feet about hip-width apart, close enough to reach with your fingertips.",
      "Brace lightly and press through your heels to lift your hips.",
      "Stop when your body makes a comfortable line from shoulders to knees. Keep your ribs down.",
      "Squeeze your glutes for one second, then lower with control.",
      "Do not place the barbell across your hips.",
    ],
    pausedCheck: null,
    cautions: [
      "Do not push through low-back pain or overarch at the top.",
      "Move your feet slightly closer or farther to find a comfortable spot.",
    ],
    mistake: "The ribs flare and the lower back pinches. Stop a little lower so the work stays in the glutes.",
  },
  {
    id: "side-plank",
    name: "Side plank",
    plain: "Side trunk and shoulder",
    anatomical: "Obliques, shoulder",
    equipment: "bodyweight",
    figure: "full-side-plank",
    sided: true,
    hold: true,
    pauseAt: null,
    harder: null,
    substitute: null,
    substitutions: [],
    checks: [
      "Lie on one side with your elbow under your shoulder. Bend your knees for the easier version, or straighten your legs for the harder one.",
      "Lift your hips until your body makes a straight line from shoulder to knee or foot.",
      "Keep breathing. Do not let your shoulder collapse toward your ear.",
      "Lower with control, then repeat on the other side.",
    ],
    pausedCheck: null,
    cautions: [
      "Use the bent-knee version first if your balance or shoulder is limited.",
      "Stop for shoulder or side-body pain.",
    ],
    mistake: "The hips drop and the shoulder shrugs. Lift only as high as you can stay in one line.",
  },
  {
    id: "hip-hinge",
    name: "Hip hinge drill",
    plain: "Hamstrings and glutes",
    anatomical: "Hamstrings, gluteus maximus",
    equipment: "bodyweight",
    figure: "slow-hip-hinge",
    sided: false,
    hold: false,
    pauseAt: null,
    harder: null,
    substitute: null,
    substitutions: [],
    checks: [
      "Stand tall with your hands on the front of your thighs.",
      "Push your hips back, soften your knees, and keep your spine long.",
      "Stand by driving your hips forward.",
      "Practice this with no barbell.",
    ],
    pausedCheck: null,
    cautions: ["Stop if your lower back pinches. Shorten the hinge."],
    mistake: "The back rounds and the knees lock. Soften the knees and fold from the hips.",
  },
  {
    id: "ytw-raise",
    name: "Prone Y-T-W raise",
    plain: "Upper back",
    anatomical: "Rear shoulders, upper back",
    equipment: "bodyweight",
    figure: "ytw-raise",
    sided: false,
    hold: false,
    pauseAt: null,
    harder: null,
    substitute: null,
    substitutions: [],
    checks: [
      "Lie face down with your forehead on your hands or a towel.",
      "Lift your arms into a Y, then lower them.",
      "Lift your arms into a T, then lower them.",
      "Lift your arms into a W, then lower them.",
      "Keep each lift small and your neck quiet.",
    ],
    pausedCheck: null,
    cautions: [
      "Do not crane your neck or heave your chest off the floor.",
      "Skip the row today if this also bothers your back.",
    ],
    mistake: "The chest heaves and the neck cranes. Keep the forehead down and make the lift smaller.",
  },
  {
    id: "sit-to-stand",
    name: "Sit to stand",
    plain: "Thighs and glutes",
    anatomical: "Quadriceps, gluteus maximus",
    equipment: "bodyweight",
    figure: "sit-to-stand",
    sided: false,
    hold: false,
    pauseAt: null,
    harder: null,
    substitute: null,
    substitutions: [],
    checks: [
      "Sit on a stable chair with your feet flat.",
      "Lean your chest slightly forward and stand through the mid-foot.",
      "Sit back down with control. Do not drop onto the chair.",
      "Stay on body weight only. Do not hold the barbell.",
    ],
    pausedCheck: null,
    cautions: [
      "Use a higher seat if your knees complain.",
      "Stop for knee or back pain.",
    ],
    mistake: "You drop into the chair and your knees cave in. Sit down slowly and keep the knees over the feet.",
  },
];

const MOVE_BY_ID = new Map(BARBELL_MOVES.map((move) => [move.id, move]));

export function getBarbellMove(id: string): BarbellMove | undefined {
  return MOVE_BY_ID.get(id as MoveId);
}

export function isLoadedBarbell(id: string): boolean {
  return (LOADED_BARBELL_IDS as readonly string[]).includes(id);
}

export function isAllowedMove(id: string): boolean {
  return getBarbellMove(id) !== undefined && !(BANNED_LIFTS as readonly string[]).includes(id);
}

export const WORKOUTS: Record<WorkoutId, Recipe[]> = {
  A: [
    { moveId: "deadlift", sets: 3, maxSets: 3, repsMin: 5, repsMax: 8, restMin: 90, restMax: 120, sided: false, hold: false, pauseSeconds: 0, easierMoveId: null },
    { moveId: "incline-push-up", sets: 3, maxSets: 3, repsMin: 6, repsMax: 12, restMin: 60, restMax: 90, sided: false, hold: false, pauseSeconds: 0, easierMoveId: null },
    { moveId: "bent-over-row", sets: 3, maxSets: 3, repsMin: 8, repsMax: 12, restMin: 90, restMax: 120, sided: false, hold: false, pauseSeconds: 0, easierMoveId: null },
    { moveId: "bodyweight-squat", sets: 3, maxSets: 3, repsMin: 10, repsMax: 20, restMin: 60, restMax: 90, sided: false, hold: false, pauseSeconds: 0, easierMoveId: null },
    { moveId: "front-plank", sets: 2, maxSets: 3, repsMin: 20, repsMax: 40, restMin: 45, restMax: 60, sided: false, hold: true, pauseSeconds: 0, easierMoveId: null },
  ],
  B: [
    { moveId: "romanian-deadlift", sets: 3, maxSets: 3, repsMin: 8, repsMax: 12, restMin: 90, restMax: 120, sided: false, hold: false, pauseSeconds: 0, easierMoveId: null },
    { moveId: "reverse-lunge", sets: 3, maxSets: 3, repsMin: 6, repsMax: 10, restMin: 60, restMax: 90, sided: true, hold: false, pauseSeconds: 0, easierMoveId: null },
    { moveId: "incline-push-up", sets: 3, maxSets: 3, repsMin: 6, repsMax: 12, restMin: 60, restMax: 90, sided: false, hold: false, pauseSeconds: 0, easierMoveId: "knee-push-up" },
    { moveId: "bent-over-row", sets: 3, maxSets: 3, repsMin: 6, repsMax: 10, restMin: 90, restMax: 120, sided: false, hold: false, pauseSeconds: 1, easierMoveId: null },
    { moveId: "glute-bridge", sets: 2, maxSets: 3, repsMin: 12, repsMax: 20, restMin: 60, restMax: 90, sided: false, hold: false, pauseSeconds: 0, easierMoveId: null },
    { moveId: "side-plank", sets: 2, maxSets: 3, repsMin: 15, repsMax: 30, restMin: 45, restMax: 60, sided: true, hold: true, pauseSeconds: 0, easierMoveId: null },
  ],
};

export const EMPTY_PROGRESS: BarbellProgress = {
  startedOn: null,
  deloadUntil: null,
  moves: {},
  pending: null,
};

const WEEK_ONE = new Date(2026, 0, 5);

function mondayOf(date: Date): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay();
  const delta = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + delta);
  return copy;
}

function weeksSinceWeekOne(monday: Date): number {
  const ms = monday.getTime() - WEEK_ONE.getTime();
  return Math.round(ms / (7 * 24 * 60 * 60 * 1000));
}

/** Monday, Wednesday, and Friday. Week 1 is A, B, A. Week 2 is B, A, B. */
export function scheduledWorkout(date: Date): WorkoutId | null {
  const day = date.getDay();
  const slot = day === 1 ? 0 : day === 3 ? 1 : day === 5 ? 2 : -1;
  if (slot < 0) return null;
  const weeks = weeksSinceWeekOne(mondayOf(date));
  const pattern: WorkoutId[] = ((weeks % 2) + 2) % 2 === 0 ? ["A", "B", "A"] : ["B", "A", "B"];
  return pattern[slot];
}

export function upcomingSession(date: Date): { date: Date; workout: WorkoutId; scheduledToday: boolean } {
  for (let i = 0; i < 7; i += 1) {
    const day = addDays(date, i);
    const workout = scheduledWorkout(day);
    if (workout) return { date: day, workout, scheduledToday: i === 0 };
  }
  return { date, workout: "A", scheduledToday: false };
}

export function displayedChecks(
  move: BarbellMove,
  pauseSeconds: number,
  copy?: { checks: readonly string[]; pausedCheck: string | null },
): string[] {
  const checks = [...(copy?.checks ?? move.checks)];
  const pausedCheck = copy ? copy.pausedCheck : move.pausedCheck;
  if (pauseSeconds > 0 && move.pauseAt !== null && pausedCheck) checks[move.pauseAt] = pausedCheck;
  return checks;
}

function parseIso(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function daysBetween(earlier: string, later: string): number {
  return Math.round((parseIso(later).getTime() - parseIso(earlier).getTime()) / 86400000);
}

export function deloadActive(progress: BarbellProgress, date: string): boolean {
  return progress.deloadUntil !== null && progress.deloadUntil >= date;
}

function recipeFor(moveId: MoveId, workout: WorkoutId): Recipe | undefined {
  return WORKOUTS[workout].find((recipe) => recipe.moveId === moveId);
}

export function resolveSlots(workout: WorkoutId, progress: BarbellProgress, date: string): ResolvedSlot[] {
  const deload = deloadActive(progress, date);
  return WORKOUTS[workout].map((recipe) => {
    const tune = progress.moves[recipe.moveId] ?? {};
    const stored = tune.reps ?? recipe.repsMin;
    const target = Math.min(recipe.repsMax, Math.max(recipe.repsMin, stored));
    let sets = tune.extraSet ? recipe.maxSets : recipe.sets;
    if (deload) sets = Math.max(1, sets - 1);
    return {
      moveId: recipe.moveId,
      plannedMoveId: recipe.moveId,
      sets,
      target,
      repsMax: recipe.repsMax,
      restMin: recipe.restMin,
      restMax: recipe.restMax,
      sided: recipe.sided,
      hold: recipe.hold,
      pauseSeconds: recipe.pauseSeconds,
      slower: Boolean(tune.slower),
      harder: Boolean(tune.harder) && getBarbellMove(recipe.moveId)?.harder !== null,
      easierMoveId: recipe.easierMoveId,
      reason: "plan" as const,
    };
  });
}

function isConcrete(step: Suggestion | null): step is Extract<Suggestion, { moveId: MoveId }> {
  return step !== null && step.kind !== "learn" && step.kind !== "hold" && step.kind !== "deload";
}

/** Applies a pending step onto a copy of progress when this workout contains that move. */
export function withPendingApplied(progress: BarbellProgress, workout: WorkoutId): BarbellProgress {
  const pending = progress.pending;
  if (!pending) return progress;
  if (pending.kind === "deload") return { ...progress, pending: null };
  if (!isConcrete(pending)) return { ...progress, pending: null };
  if (!recipeFor(pending.moveId, workout)) return progress;
  const tune: MoveTune = { ...progress.moves[pending.moveId] };
  if (pending.kind === "reps") tune.reps = pending.to;
  if (pending.kind === "tempo") tune.slower = true;
  if (pending.kind === "set") tune.extraSet = true;
  if (pending.kind === "variation") tune.harder = true;
  return {
    ...progress,
    pending: null,
    moves: { ...progress.moves, [pending.moveId]: tune },
  };
}

function shouldDeload(record: BarbellRecord): boolean {
  return record.pain || record.formSlipped || record.soreOver72 || record.sleepEnergy <= 2;
}

function resultsFor(record: BarbellRecord, plannedMoveId: MoveId): SetResult[] {
  return record.results.filter((result) => result.plannedMoveId === plannedMoveId);
}

function mastered(record: BarbellRecord, asked: AskedSlot): boolean {
  if (asked.reason !== "plan") return false;
  const results = resultsFor(record, asked.plannedMoveId).filter((result) => result.moveId === asked.moveId);
  const needed = asked.sets * (asked.sided ? 2 : 1);
  if (results.length < needed) return false;
  return results.every(
    (result) =>
      !result.skipped &&
      !result.substituted &&
      !result.easier &&
      result.reserve &&
      result.completed >= asked.target,
  );
}

function nextStepFor(recipe: Recipe, tune: MoveTune): Suggestion | null {
  const target = Math.min(recipe.repsMax, Math.max(recipe.repsMin, tune.reps ?? recipe.repsMin));
  if (target < recipe.repsMax) {
    const step = recipe.hold ? 5 : 1;
    return { kind: "reps", moveId: recipe.moveId, to: Math.min(recipe.repsMax, target + step) };
  }
  if (!recipe.hold && !tune.slower) return { kind: "tempo", moveId: recipe.moveId };
  if (recipe.maxSets > recipe.sets && !tune.extraSet && !isLoadedBarbell(recipe.moveId)) {
    return { kind: "set", moveId: recipe.moveId };
  }
  if (!tune.harder && getBarbellMove(recipe.moveId)?.harder) return { kind: "variation", moveId: recipe.moveId };
  return null;
}

export function suggestNext(record: BarbellRecord, progress: BarbellProgress): Suggestion {
  if (shouldDeload(record)) return { kind: "deload" };
  if (progress.startedOn && daysBetween(progress.startedOn, record.date) < 14) return { kind: "learn" };
  if (deloadActive(progress, record.date)) return { kind: "hold" };
  if (record.blockedLoads.length > 0) return { kind: "hold" };
  const workoutOk = record.asked.filter((slot) => slot.reason === "plan").every((slot) => mastered(record, slot));
  if (!workoutOk) return { kind: "hold" };
  for (const recipe of WORKOUTS[record.workout]) {
    const step = nextStepFor(recipe, progress.moves[recipe.moveId] ?? {});
    if (step) return step;
  }
  return { kind: "hold" };
}

export function progressAfter(progress: BarbellProgress, record: BarbellRecord): BarbellProgress {
  const startedOn = progress.startedOn ?? record.date;
  if (shouldDeload(record)) {
    const until = isoDate(addDays(parseIso(record.date), 7));
    return { ...progress, startedOn, pending: { kind: "deload" }, deloadUntil: until };
  }
  const used = withPendingApplied(progress, record.workout);
  const pendingMove = isConcrete(progress.pending) ? progress.pending.moveId : null;
  const committed =
    pendingMove !== null &&
    record.asked.some(
      (slot) => slot.plannedMoveId === pendingMove && slot.reason === "plan" && mastered(record, slot),
    );
  const base: BarbellProgress = committed ? { ...used, startedOn } : { ...progress, startedOn };
  return { ...base, pending: suggestNext(record, base) };
}

export function slotFromSubstitution(sub: Substitution, plannedMoveId: MoveId): ResolvedSlot {
  return {
    moveId: sub.moveId,
    plannedMoveId,
    sets: sub.sets,
    target: sub.repsMin,
    repsMax: sub.repsMax,
    restMin: sub.restMin,
    restMax: sub.restMax,
    sided: Boolean(getBarbellMove(sub.moveId)?.sided),
    hold: sub.hold,
    pauseSeconds: 0,
    slower: false,
    harder: false,
    easierMoveId: null,
    reason: "heavy",
  };
}

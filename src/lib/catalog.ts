export type AreaId =
  | "neck"
  | "shoulders"
  | "chest"
  | "upper-back"
  | "lower-back"
  | "hips"
  | "glutes"
  | "legs";
export type PositionId = "chair" | "floor" | "standing";
export type StretchId =
  | "hip-flexor"
  | "lunge"
  | "butterfly"
  | "figure-four"
  | "supine-glute"
  | "hamstring"
  | "stand-ham"
  | "quad"
  | "side-quad"
  | "calf"
  | "cat"
  | "thread"
  | "hug"
  | "knees-chest"
  | "child"
  | "twist"
  | "chest"
  | "doorway"
  | "neck"
  | "chin-tuck"
  | "neck-turn"
  | "shoulder"
  | "shoulder-reach"
  | "shoulder-side";
export type PresetId =
  | "desk-reset"
  | "morning-loosen"
  | "hips-and-back"
  | "after-sitting";
export type TightId = "neck-shoulders" | "back" | "hips" | "legs";
export type LengthMin = 5 | 10 | 15;

export type Stretch = {
  id: StretchId;
  name: string;
  area: AreaId;
  areaLabel: string;
  plain: string;
  anatomical: string;
  position: PositionId;
  sided: boolean;
  seconds: number;
  setup: string | null;
  steps: [string, string, string];
  mistake: string;
  alternate: StretchId | null;
};

export type Preset = {
  id: PresetId;
  name: string;
  blurb: string;
  where: string;
  order: StretchId[];
};

export const AREAS: { id: AreaId; label: string }[] = [
  { id: "neck", label: "Neck" },
  { id: "shoulders", label: "Shoulders" },
  { id: "chest", label: "Chest" },
  { id: "upper-back", label: "Upper back" },
  { id: "lower-back", label: "Lower back" },
  { id: "hips", label: "Hips" },
  { id: "glutes", label: "Glutes" },
  { id: "legs", label: "Legs" },
];

export const POSITIONS: { id: PositionId; label: string }[] = [
  { id: "chair", label: "Chair" },
  { id: "floor", label: "Floor" },
  { id: "standing", label: "Standing" },
];

export const TIGHT_OPTIONS: { id: TightId; label: string }[] = [
  { id: "neck-shoulders", label: "Neck and shoulders" },
  { id: "back", label: "Back" },
  { id: "hips", label: "Hips" },
  { id: "legs", label: "Legs" },
];

export const STRETCHES: Stretch[] = [
  {
    id: "neck",
    name: "Neck side bend",
    area: "neck",
    areaLabel: "Neck",
    plain: "Side of the neck",
    anatomical: "Upper trapezius",
    position: "chair",
    sided: true,
    seconds: 30,
    setup: null,
    steps: [
      "Sit tall. Drop both shoulders away from the ears.",
      "Tilt one ear toward that shoulder, only until the opposite side of the neck feels a steady pull.",
      "Breathe and hold. The opposite hand stays in the lap. Do not pull the head.",
    ],
    mistake:
      "The shoulder lifts to meet the ear. Keep that shoulder heavy so the neck can lengthen.",
    alternate: "neck-turn",
  },
  {
    id: "chin-tuck",
    name: "Chin tuck",
    area: "neck",
    areaLabel: "Neck",
    plain: "Front of the neck",
    anatomical: "Deep neck flexors",
    position: "chair",
    sided: false,
    seconds: 30,
    setup: null,
    steps: [
      "Sit tall and look straight ahead. Let the shoulders rest.",
      "Draw the chin straight back, as if you were making a soft double chin. The eyes stay level.",
      "Breathe and hold. The front of the neck should feel a small, steady effort.",
    ],
    mistake:
      "The chin tips down and the head nods. Keep the eyes level and slide the chin back.",
    alternate: "neck",
  },
  {
    id: "neck-turn",
    name: "Neck turn",
    area: "neck",
    areaLabel: "Neck",
    plain: "Side of the neck",
    anatomical: "Sternocleidomastoid",
    position: "chair",
    sided: true,
    seconds: 30,
    setup: null,
    steps: [
      "Sit tall, both shoulders heavy, and look forward.",
      "Turn the head until you look over one shoulder. Stop at a steady pull on the opposite side.",
      "Breathe and hold. The chin stays level. Do not pull with a hand.",
    ],
    mistake:
      "The shoulder lifts and the chin juts. Keep the shoulder down and the chin level as you turn.",
    alternate: "chin-tuck",
  },
  {
    id: "shoulder",
    name: "Cross-body shoulder",
    area: "shoulders",
    areaLabel: "Shoulders",
    plain: "Back of the shoulder",
    anatomical: "Posterior deltoid",
    position: "chair",
    sided: true,
    seconds: 30,
    setup: null,
    steps: [
      "Sit tall. Bring one arm across the chest at about shoulder height.",
      "The other hand rests above the elbow and gives a light hug. Keep the shoulder down.",
      "Breathe and hold. The stretch should sit on the back of the shoulder, not the neck.",
    ],
    mistake:
      "The elbow rides up and the shoulder shrugs. Keep the elbow near shoulder height and the shoulder dropped.",
    alternate: "shoulder-reach",
  },
  {
    id: "shoulder-reach",
    name: "Behind-back reach",
    area: "shoulders",
    areaLabel: "Shoulders",
    plain: "Front of the shoulder",
    anatomical: "Anterior deltoid",
    position: "standing",
    sided: true,
    seconds: 30,
    setup: "Stand tall with both arms at your sides before one arm goes behind you.",
    steps: [
      "Stand tall beside a wall if you want a hand for balance.",
      "Reach one arm behind the waist, palm out. Let that shoulder blade slide down the back.",
      "Breathe and hold. A small chest lift is enough. Do not force the hand upward.",
    ],
    mistake:
      "The shoulder shrugs and the ribs flare. Drop the shoulder blade and keep the ribs soft.",
    alternate: "shoulder-side",
  },
  {
    id: "shoulder-side",
    name: "Side-lying shoulder",
    area: "shoulders",
    areaLabel: "Shoulders",
    plain: "Back of the shoulder",
    anatomical: "Posterior deltoid",
    position: "floor",
    sided: true,
    seconds: 35,
    setup: "Lie on your side with the head supported and both arms in front of the chest.",
    steps: [
      "Lie on one side. Rest the head on the bottom arm or a folded towel.",
      "Bring the top arm across the chest and let the hand rest on the floor in front. Keep the shoulder down.",
      "Breathe and hold. The stretch sits on the back of the top shoulder.",
    ],
    mistake:
      "The elbow lifts toward the ear and the neck tightens. Keep the elbow near chest height and the neck long.",
    alternate: "shoulder",
  },
  {
    id: "chest",
    name: "Standing chest opener",
    area: "chest",
    areaLabel: "Chest",
    plain: "Front of the chest",
    anatomical: "Pectorals",
    position: "standing",
    sided: false,
    seconds: 30,
    setup: "Stand tall with the arms at your sides before you clasp the hands.",
    steps: [
      "Stand tall. Clasp the hands behind the back, or hold a towel if they do not meet.",
      "Draw the shoulders down, then lift the chest. Keep the hands low.",
      "Breathe and hold. Soften the knees.",
    ],
    mistake:
      "The shoulders shrug toward the ears. Drop the shoulders and let the stretch sit on the front of the chest.",
    alternate: "doorway",
  },
  {
    id: "doorway",
    name: "Doorway chest stretch",
    area: "chest",
    areaLabel: "Chest",
    plain: "Front of the chest",
    anatomical: "Pectorals",
    position: "standing",
    sided: true,
    seconds: 35,
    setup: "Stand in the doorway with the arm still down before the forearm goes on the frame.",
    steps: [
      "Stand in a doorway. Set one forearm on the frame, elbow near shoulder height.",
      "Step the same-side foot forward a little and turn the chest gently away until the front of that shoulder opens.",
      "Breathe and hold. The shoulder stays down, away from the ear.",
    ],
    mistake:
      "The shoulder hikes and the low back arches. Drop the shoulder and keep the ribs stacked over the hips.",
    alternate: "chest",
  },
  {
    id: "cat",
    name: "Cat stretch",
    area: "upper-back",
    areaLabel: "Upper back",
    plain: "Upper back",
    anatomical: "Thoracic extensors",
    position: "floor",
    sided: false,
    seconds: 30,
    setup: null,
    steps: [
      "Come to hands and knees. Wrists under shoulders, knees under hips.",
      "Round the upper back toward the ceiling and let the head hang softly.",
      "Breathe into the space between the shoulder blades and hold.",
    ],
    mistake:
      "The shoulders collapse and the neck pinches. Keep the shoulders over the wrists and the neck long, even as the back rounds.",
    alternate: "thread",
  },
  {
    id: "thread",
    name: "Thread the needle",
    area: "upper-back",
    areaLabel: "Upper back",
    plain: "Between the shoulder blades",
    anatomical: "Rhomboids",
    position: "floor",
    sided: true,
    seconds: 35,
    setup: "Start on hands and knees, wrists under shoulders, before one arm threads under.",
    steps: [
      "From hands and knees, reach one arm under the body, palm up.",
      "Let that shoulder and the side of the head rest toward the floor. The other hand stays planted.",
      "Breathe and hold. The stretch sits between the shoulder blades, not in the neck.",
    ],
    mistake:
      "The neck cranks to the side and the supporting shoulder collapses. Rest the head and keep the planted shoulder over the wrist.",
    alternate: "hug",
  },
  {
    id: "hug",
    name: "Seated back hug",
    area: "upper-back",
    areaLabel: "Upper back",
    plain: "Between the shoulder blades",
    anatomical: "Rhomboids",
    position: "chair",
    sided: false,
    seconds: 30,
    setup: null,
    steps: [
      "Sit tall toward the front of the chair, feet on the floor.",
      "Hug both arms across the chest, hands on the opposite shoulders. Round the upper back a little.",
      "Breathe into the space between the shoulder blades and hold.",
    ],
    mistake:
      "The chin drops and the neck takes the round. Keep the neck long and let the upper back do the rounding.",
    alternate: "cat",
  },
  {
    id: "knees-chest",
    name: "Knees to chest",
    area: "lower-back",
    areaLabel: "Lower back",
    plain: "Lower back",
    anatomical: "Erector spinae",
    position: "floor",
    sided: false,
    seconds: 40,
    setup: "Lie on your back with both legs long before the knees come in.",
    steps: [
      "Lie on your back. Bring both knees toward the chest.",
      "Hold the shins or the backs of the thighs. Let the lower back soften toward the floor.",
      "Breathe and hold. The head stays down. The pull is gentle.",
    ],
    mistake:
      "The head and shoulders lift off the floor to yank the knees. Keep the head down and hold the legs where they already are.",
    alternate: "child",
  },
  {
    id: "child",
    name: "Child's pose",
    area: "lower-back",
    areaLabel: "Lower back",
    plain: "Lower back",
    anatomical: "Erector spinae",
    position: "floor",
    sided: false,
    seconds: 40,
    setup: "Start on hands and knees before you sit the hips back.",
    steps: [
      "From hands and knees, sit the hips toward the heels.",
      "Fold the chest toward the thighs and reach the arms forward. Rest the forehead down.",
      "Breathe into the lower back and hold. Widen the knees if the belly needs room.",
    ],
    mistake:
      "The hips stay high and the neck crams into the floor. Sit the hips back and rest the forehead, don’t press it.",
    alternate: "knees-chest",
  },
  {
    id: "twist",
    name: "Seated twist",
    area: "lower-back",
    areaLabel: "Lower back",
    plain: "Lower back",
    anatomical: "Lumbar rotators",
    position: "chair",
    sided: true,
    seconds: 30,
    setup: "Sit tall with both feet on the floor before you turn.",
    steps: [
      "Sit tall, both feet flat. Hold the side of the chair or the opposite knee.",
      "Turn the ribs first, then the head, only until the lower back feels a steady twist.",
      "Breathe and hold. Grow tall on the inhale. Do not force the range.",
    ],
    mistake:
      "The shoulder lifts and the neck twists alone. Keep the shoulder down and start the turn from the ribs.",
    alternate: "knees-chest",
  },
  {
    id: "hip-flexor",
    name: "Half-kneeling hip flexor",
    area: "hips",
    areaLabel: "Hips",
    plain: "Front of the hip",
    anatomical: "Hip flexors",
    position: "floor",
    sided: true,
    seconds: 40,
    setup: null,
    steps: [
      "Kneel on one knee. Step the other foot forward until both knees sit near a right angle.",
      "Tuck the pelvis so the front of the back hip lengthens. Keep the ribs down.",
      "Breathe and hold. The knee on the floor should feel supported, not pinched.",
    ],
    mistake:
      "The lower back arches and the ribs flare. Drop the ribs and tuck the pelvis so the stretch stays on the front of the hip.",
    alternate: "lunge",
  },
  {
    id: "lunge",
    name: "Low lunge",
    area: "hips",
    areaLabel: "Hips",
    plain: "Front of the hip",
    anatomical: "Hip flexors",
    position: "floor",
    sided: true,
    seconds: 40,
    setup: null,
    steps: [
      "Kneel, then step one foot forward. Both hands rest lightly on that thigh.",
      "Stay tall through the chest and shift the hips forward a little, until the back hip feels a steady pull.",
      "Breathe and hold. Soften the front knee. The back knee stays comfortable.",
    ],
    mistake:
      "The ribs thrust forward and the lower back pinches. Stack the ribs over the hips and let the stretch stay in front of the back hip.",
    alternate: "butterfly",
  },
  {
    id: "butterfly",
    name: "Seated butterfly",
    area: "hips",
    areaLabel: "Hips",
    plain: "Inner thighs",
    anatomical: "Adductors",
    position: "floor",
    sided: false,
    seconds: 40,
    setup: "Sit on the floor with the knees bent and the feet in front of you.",
    steps: [
      "Sit tall. Bring the soles of the feet together and let the knees fall out to the sides.",
      "Hold the ankles or the shins. Stay long through the spine. A small hinge is optional.",
      "Breathe and hold. The knees rest where they rest. Do not press them down.",
    ],
    mistake:
      "The back rounds and the hands pull the feet in hard. Stay tall and let the knees rest.",
    alternate: "hip-flexor",
  },
  {
    id: "figure-four",
    name: "Seated figure-four",
    area: "glutes",
    areaLabel: "Glutes",
    plain: "Outer hip",
    anatomical: "Glutes",
    position: "chair",
    sided: true,
    seconds: 40,
    setup: "Sit tall first, both feet on the floor, before you cross the ankle.",
    steps: [
      "Sit toward the front of the chair, one foot flat. Cross the other ankle over that knee.",
      "Let the crossed knee rest where it rests. Stay tall through the chest.",
      "Breathe and hold. A small hinge forward is optional if you want more.",
    ],
    mistake:
      "The knee is pushed down and the back rounds. Let the knee rest, and stay tall through the chest.",
    alternate: "supine-glute",
  },
  {
    id: "supine-glute",
    name: "Supine figure-four",
    area: "glutes",
    areaLabel: "Glutes",
    plain: "Outer hip",
    anatomical: "Glutes",
    position: "floor",
    sided: true,
    seconds: 40,
    setup: "Lie on your back with both feet on the floor before you cross one ankle.",
    steps: [
      "Lie on your back, both knees bent, feet on the floor.",
      "Cross one ankle over the opposite knee. Let that knee fall open. The head stays down.",
      "Breathe and hold. A light hand on the thigh is optional. Do not push the knee.",
    ],
    mistake:
      "The head lifts and the knee is forced toward the floor. Keep the head down and let the knee rest.",
    alternate: "figure-four",
  },
  {
    id: "hamstring",
    name: "Chair hamstring hinge",
    area: "legs",
    areaLabel: "Legs",
    plain: "Back of the thigh",
    anatomical: "Hamstrings",
    position: "chair",
    sided: true,
    seconds: 40,
    setup: "Sit tall on the front of the chair, one heel forward, knee softly bent.",
    steps: [
      "Sit on the front edge of a chair. Extend one heel forward with the knee soft.",
      "Hinge from the hips with a long spine until the back of the thigh feels steady tension.",
      "Breathe and hold. Do not pull yourself down with the hands.",
    ],
    mistake:
      "The lower back rounds and the head drops. Keep the spine long and hinge from the hips.",
    alternate: "stand-ham",
  },
  {
    id: "stand-ham",
    name: "Standing hamstring",
    area: "legs",
    areaLabel: "Legs",
    plain: "Back of the thigh",
    anatomical: "Hamstrings",
    position: "standing",
    sided: true,
    seconds: 40,
    setup: "Stand tall beside a chair or step, both feet down, before one heel goes up.",
    steps: [
      "Place one heel on a chair or step. The standing knee stays soft.",
      "Hinge from the hips with a long spine until the back of the raised thigh feels steady tension.",
      "Breathe and hold. The foot can stay relaxed. Do not lock the knee.",
    ],
    mistake:
      "The back rounds and the raised knee locks. Soften that knee and hinge from the hips with a long spine.",
    alternate: "hamstring",
  },
  {
    id: "quad",
    name: "Standing quad stretch",
    area: "legs",
    areaLabel: "Legs",
    plain: "Front of the thigh",
    anatomical: "Quadriceps",
    position: "standing",
    sided: true,
    seconds: 35,
    setup: "Stand tall beside a wall or the back of a chair, both feet down.",
    steps: [
      "Stand on one leg. Hold a wall or chair if you need the balance.",
      "Bend the other knee and hold the ankle behind you. Point that knee toward the floor.",
      "Breathe and hold. Stay tall through the front of the hip.",
    ],
    mistake:
      "The knee flares out and the lower back arches. Bring the knee toward the standing leg and drop the ribs.",
    alternate: "side-quad",
  },
  {
    id: "side-quad",
    name: "Side-lying quad",
    area: "legs",
    areaLabel: "Legs",
    plain: "Front of the thigh",
    anatomical: "Quadriceps",
    position: "floor",
    sided: true,
    seconds: 35,
    setup: "Lie on your side with both legs long before the top knee bends.",
    steps: [
      "Lie on one side. Bend the bottom knee a little if you want a steadier base.",
      "Bend the top knee and hold the ankle behind you. Keep that knee pointing forward, not out.",
      "Breathe and hold. The front of the thigh and hip should feel the stretch, not the lower back.",
    ],
    mistake:
      "The lower back arches and the knee swings forward. Bring the knee back in line and drop the ribs.",
    alternate: "quad",
  },
  {
    id: "calf",
    name: "Wall calf stretch",
    area: "legs",
    areaLabel: "Legs",
    plain: "Back of the calf",
    anatomical: "Gastrocnemius",
    position: "standing",
    sided: true,
    seconds: 35,
    setup: "Stand facing a wall with both feet together before one leg steps back.",
    steps: [
      "Face a wall and put both hands on it. Step one foot back, heel down.",
      "Bend the front knee and keep the back heel heavy until the calf feels steady tension.",
      "Breathe and hold. The back toes point toward the wall.",
    ],
    mistake:
      "The back heel lifts and the foot turns out. Keep the heel down and the toes aimed forward.",
    alternate: "hamstring",
  },
];

export const PRESETS: Preset[] = [
  {
    id: "desk-reset",
    name: "Desk reset",
    blurb: "Chair only. Neck, shoulders, hips, and a hamstring hinge.",
    where: "Chair",
    order: [
      "neck",
      "shoulder",
      "figure-four",
      "hamstring",
      "chin-tuck",
      "neck-turn",
      "hug",
      "twist",
    ],
  },
  {
    id: "morning-loosen",
    name: "Morning loosen",
    blurb: "A gentle pass through the whole body. Floor, chair, and standing.",
    where: "Mixed",
    order: [
      "neck",
      "chest",
      "cat",
      "hip-flexor",
      "hamstring",
      "quad",
      "shoulder",
      "figure-four",
    ],
  },
  {
    id: "hips-and-back",
    name: "Hips and back",
    blurb: "Hips first, then a rounded upper back and the back of the thigh.",
    where: "Floor and chair",
    order: [
      "hip-flexor",
      "figure-four",
      "cat",
      "hamstring",
      "quad",
      "chest",
      "knees-chest",
      "child",
    ],
  },
  {
    id: "after-sitting",
    name: "After sitting",
    blurb: "Hips, chest, and hamstrings after a long time in the chair.",
    where: "Floor, chair, and standing",
    order: [
      "hip-flexor",
      "hamstring",
      "chest",
      "figure-four",
      "quad",
      "shoulder",
      "calf",
      "stand-ham",
    ],
  },
];

export const LOOSEN_MOVES: StretchId[] = ["neck", "shoulder", "cat"];

const stretchMap = new Map(STRETCHES.map((stretch) => [stretch.id, stretch]));
const presetMap = new Map(PRESETS.map((preset) => [preset.id, preset]));

export function getStretch(id: string): Stretch | undefined {
  return stretchMap.get(id as StretchId);
}

export function getPreset(id: string): Preset | undefined {
  return presetMap.get(id as PresetId);
}

export function alternateFor(id: string, used: readonly string[]): Stretch | null {
  const stretch = getStretch(id);
  if (!stretch) return null;
  const preferred = stretch.alternate ? getStretch(stretch.alternate) : undefined;
  if (preferred && !used.includes(preferred.id)) return preferred;
  const unused = STRETCHES.find(
    (item) => item.area === stretch.area && item.id !== stretch.id && !used.includes(item.id),
  );
  if (unused) return unused;
  if (preferred && preferred.id !== stretch.id) return preferred;
  return STRETCHES.find((item) => item.area === stretch.area && item.id !== stretch.id) ?? null;
}

export function holdSecondsForLength(length: LengthMin): number {
  if (length === 5) return 30;
  if (length === 15) return 45;
  return 40;
}

export function movesForLength(order: StretchId[], length: LengthMin): StretchId[] {
  const count = length === 5 ? 4 : length === 10 ? 6 : 8;
  return order.slice(0, Math.min(count, order.length));
}

const AREA_BY_LABEL = new Map<string, AreaId>(
  AREAS.map((item) => [item.label.toLowerCase(), item.id]),
);

/** Accepts an area id, or an English label saved by earlier versions. */
export function areaIdFrom(value: string): AreaId | null {
  if (AREAS.some((item) => item.id === value)) return value as AreaId;
  return AREA_BY_LABEL.get(value.toLowerCase()) ?? null;
}

export type AreaId = "neck" | "shoulders" | "chest" | "back" | "hips" | "legs";
export type PositionId = "chair" | "floor" | "standing";
export type StretchId =
  | "hip-flexor"
  | "figure-four"
  | "hamstring"
  | "cat"
  | "chest"
  | "neck"
  | "shoulder"
  | "quad";
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
  { id: "back", label: "Back" },
  { id: "hips", label: "Hips" },
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

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const STRETCHES: Stretch[] = [
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
    alternate: "figure-four",
  },
  {
    id: "figure-four",
    name: "Seated figure-four",
    area: "hips",
    areaLabel: "Hips",
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
    alternate: "hip-flexor",
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
    alternate: "quad",
  },
  {
    id: "cat",
    name: "Cat stretch",
    area: "back",
    areaLabel: "Back",
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
    alternate: null,
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
    alternate: null,
  },
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
    alternate: null,
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
    alternate: null,
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
    alternate: "hamstring",
  },
];

export const PRESETS: Preset[] = [
  {
    id: "desk-reset",
    name: "Desk reset",
    blurb: "Chair only. Neck, shoulders, hips, and a hamstring hinge.",
    where: "Chair",
    order: ["neck", "shoulder", "figure-four", "hamstring"],
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
      "neck",
      "shoulder",
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
      "cat",
      "neck",
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

export function positionLabel(position: PositionId): string {
  return POSITIONS.find((item) => item.id === position)?.label ?? position;
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

import type { StretchId } from "@/lib/catalog";
import type { MessageKey } from "@/lib/i18n/messages";

/** Percent of the square illustration, [x, y] from the top left. */
export type Pt = [number, number];

export type CueKey = Extract<MessageKey, `cue.${string}`>;

export type Cue = {
  label: CueKey;
  at: Pt;
  arrow?: { from: Pt; to: Pt; bend?: number };
};

export type FormCard = {
  cues: Cue[];
  /** Dashed guide lines. Two points draw a line, three draw a curve through the middle control point. */
  guides?: Pt[][];
  /** A soft glow over the spot that goes wrong. */
  spot?: Pt;
};

export type FormPair = { wrong: FormCard; right: FormCard };

export const FORM_CUES: Record<StretchId, FormPair> = {
  neck: {
    wrong: {
      spot: [58, 26],
      cues: [{ label: "cue.shoulderLifts", at: [80, 44], arrow: { from: [72, 36], to: [62, 28] } }],
    },
    right: {
      guides: [[[42, 9], [36, 17], [39, 27]]],
      cues: [{ label: "cue.shoulderDown", at: [80, 42], arrow: { from: [67, 17], to: [67, 30] } }],
    },
  },
  "chin-tuck": {
    wrong: {
      spot: [50, 17],
      cues: [{ label: "cue.chinDrops", at: [76, 12], arrow: { from: [64, 8], to: [55, 19], bend: -3 } }],
    },
    right: {
      guides: [[[39, 4], [39, 48]]],
      cues: [{ label: "cue.chinBack", at: [76, 22], arrow: { from: [64, 17], to: [53, 17] } }],
    },
  },
  "neck-turn": {
    wrong: {
      spot: [52, 20],
      cues: [
        { label: "cue.chinJuts", at: [80, 12], arrow: { from: [70, 15], to: [57, 19] } },
        { label: "cue.shouldersLift", at: [18, 42], arrow: { from: [26, 36], to: [33, 26] } },
      ],
    },
    right: {
      guides: [[[36, 19], [66, 19]]],
      cues: [
        { label: "cue.chinLevel", at: [80, 12] },
        { label: "cue.shouldersDown", at: [18, 42], arrow: { from: [28, 20], to: [32, 30] } },
      ],
    },
  },
  shoulder: {
    wrong: {
      spot: [42, 22],
      cues: [{ label: "cue.elbowHigh", at: [18, 42], arrow: { from: [24, 36], to: [36, 25] } }],
    },
    right: {
      guides: [[[12, 29], [68, 29]]],
      cues: [{ label: "cue.elbowShoulder", at: [22, 44] }],
    },
  },
  "shoulder-reach": {
    wrong: {
      spot: [37, 24],
      cues: [
        { label: "cue.shoulderLifts", at: [18, 10], arrow: { from: [28, 30], to: [31, 19] } },
        { label: "cue.ribsFlare", at: [76, 44], arrow: { from: [68, 42], to: [57, 38] } },
      ],
    },
    right: {
      cues: [
        { label: "cue.shoulderDown", at: [80, 12], arrow: { from: [66, 14], to: [64, 26] } },
        { label: "cue.ribsDown", at: [78, 44], arrow: { from: [70, 42], to: [58, 38] } },
      ],
    },
  },
  "shoulder-side": {
    wrong: {
      spot: [30, 30],
      cues: [{ label: "cue.elbowHigh", at: [56, 16], arrow: { from: [46, 20], to: [34, 18] } }],
    },
    right: {
      cues: [{ label: "cue.elbowChest", at: [44, 34], arrow: { from: [42, 40], to: [39, 51] } }],
    },
  },
  chest: {
    wrong: {
      spot: [47, 22],
      cues: [{ label: "cue.shouldersLift", at: [76, 22], arrow: { from: [67, 22], to: [54, 21] } }],
    },
    right: {
      guides: [[[46, 5], [46, 62]]],
      cues: [{ label: "cue.chestTall", at: [76, 24], arrow: { from: [67, 26], to: [55, 28] } }],
    },
  },
  doorway: {
    wrong: {
      spot: [37, 24],
      cues: [
        { label: "cue.shoulderLifts", at: [70, 14], arrow: { from: [58, 16], to: [42, 22] } },
        { label: "cue.backArches", at: [76, 50], arrow: { from: [67, 50], to: [55, 48] } },
      ],
    },
    right: {
      guides: [[[54, 26], [54, 60]]],
      cues: [
        { label: "cue.shoulderDown", at: [70, 14], arrow: { from: [44, 14], to: [40, 25] } },
        { label: "cue.ribsStacked", at: [78, 44] },
      ],
    },
  },
  cat: {
    wrong: {
      spot: [60, 44],
      cues: [
        { label: "cue.shouldersSink", at: [48, 26], arrow: { from: [56, 30], to: [59, 41] } },
        { label: "cue.neckPinches", at: [84, 26], arrow: { from: [82, 31], to: [77, 38] } },
      ],
    },
    right: {
      guides: [[[18, 50], [38, 30], [64, 44]], [[64, 48], [64, 74]]],
      cues: [
        { label: "cue.upperBackRounds", at: [34, 24] },
        { label: "cue.shouldersOverWrists", at: [76, 88] },
      ],
    },
  },
  thread: {
    wrong: {
      spot: [80, 68],
      cues: [
        { label: "cue.neckCranks", at: [84, 48], arrow: { from: [84, 54], to: [82, 63] } },
        { label: "cue.shouldersSink", at: [52, 36], arrow: { from: [58, 42], to: [66, 54] } },
      ],
    },
    right: {
      cues: [{ label: "cue.headRests", at: [84, 48], arrow: { from: [84, 54], to: [82, 64] } }],
    },
  },
  hug: {
    wrong: {
      spot: [48, 22],
      cues: [{ label: "cue.chinDrops", at: [76, 12], arrow: { from: [66, 14], to: [55, 20] } }],
    },
    right: {
      guides: [[[35, 26], [29, 37], [33, 48]]],
      cues: [
        { label: "cue.neckLong", at: [76, 12], arrow: { from: [66, 14], to: [56, 17] } },
        { label: "cue.upperBackRounds", at: [16, 24] },
      ],
    },
  },
  "knees-chest": {
    wrong: {
      spot: [22, 52],
      cues: [{ label: "cue.headLifts", at: [22, 24], arrow: { from: [14, 46], to: [14, 34] } }],
    },
    right: {
      cues: [{ label: "cue.headDown", at: [22, 34], arrow: { from: [20, 41], to: [18, 53] } }],
    },
  },
  child: {
    wrong: {
      spot: [26, 66],
      cues: [
        { label: "cue.hipsHigh", at: [76, 24], arrow: { from: [72, 46], to: [72, 34] } },
        { label: "cue.neckPinches", at: [22, 46], arrow: { from: [24, 52], to: [27, 61] } },
      ],
    },
    right: {
      cues: [
        { label: "cue.hipsBack", at: [76, 34], arrow: { from: [72, 40], to: [68, 51] } },
        { label: "cue.foreheadRests", at: [20, 46], arrow: { from: [22, 52], to: [24, 61] } },
      ],
    },
  },
  twist: {
    wrong: {
      spot: [34, 25],
      cues: [
        { label: "cue.neckAlone", at: [78, 12], arrow: { from: [67, 12], to: [57, 12] } },
        { label: "cue.shoulderLifts", at: [16, 40], arrow: { from: [24, 34], to: [30, 26] } },
      ],
    },
    right: {
      cues: [
        { label: "cue.turnFromRibs", at: [80, 30], arrow: { from: [66, 46], to: [60, 30], bend: 5 } },
      ],
    },
  },
  "hip-flexor": {
    wrong: {
      spot: [40, 50],
      cues: [
        { label: "cue.backArches", at: [18, 44], arrow: { from: [26, 46], to: [37, 50] } },
        { label: "cue.ribsFlare", at: [76, 30], arrow: { from: [67, 32], to: [55, 38] } },
      ],
    },
    right: {
      guides: [[[44, 14], [44, 62]]],
      cues: [
        { label: "cue.pelvisTucked", at: [18, 58], arrow: { from: [27, 58], to: [38, 60] } },
        { label: "cue.ribsDown", at: [76, 32], arrow: { from: [67, 34], to: [55, 40] } },
      ],
    },
  },
  lunge: {
    wrong: {
      spot: [40, 52],
      cues: [
        { label: "cue.ribsFlare", at: [78, 34], arrow: { from: [69, 36], to: [57, 40] } },
        { label: "cue.backArches", at: [18, 44], arrow: { from: [26, 48], to: [37, 52] } },
      ],
    },
    right: {
      guides: [[[46, 14], [46, 62]]],
      cues: [{ label: "cue.ribsStacked", at: [78, 30], arrow: { from: [69, 32], to: [57, 38] } }],
    },
  },
  butterfly: {
    wrong: {
      spot: [56, 72],
      cues: [
        { label: "cue.backRounds", at: [18, 26], arrow: { from: [25, 30], to: [38, 38] } },
        { label: "cue.pullingHard", at: [82, 52], arrow: { from: [76, 58], to: [63, 70] } },
      ],
    },
    right: {
      guides: [[[46, 14], [46, 66]]],
      cues: [
        { label: "cue.spineLong", at: [20, 26] },
        { label: "cue.kneesRest", at: [84, 48], arrow: { from: [84, 54], to: [79, 62] } },
      ],
    },
  },
  "figure-four": {
    wrong: {
      spot: [70, 52],
      guides: [[[31, 20], [25, 35], [30, 52]]],
      cues: [
        { label: "cue.backRounds", at: [14, 24] },
        { label: "cue.kneePushed", at: [84, 30], arrow: { from: [72, 36], to: [72, 48] } },
      ],
    },
    right: {
      guides: [[[29, 8], [29, 58]]],
      cues: [
        { label: "cue.chestTall", at: [76, 20], arrow: { from: [66, 24], to: [53, 30] } },
        { label: "cue.kneeRests", at: [84, 44], arrow: { from: [80, 50], to: [74, 55] } },
      ],
    },
  },
  "supine-glute": {
    wrong: {
      spot: [50, 48],
      cues: [
        { label: "cue.headLifts", at: [16, 40], arrow: { from: [12, 58], to: [12, 48] } },
        { label: "cue.kneePushed", at: [64, 26], arrow: { from: [57, 32], to: [52, 45] } },
      ],
    },
    right: {
      cues: [
        { label: "cue.headDown", at: [16, 44], arrow: { from: [17, 50], to: [15, 60] } },
        { label: "cue.kneeRests", at: [62, 30], arrow: { from: [58, 36], to: [52, 47] } },
      ],
    },
  },
  hamstring: {
    wrong: {
      guides: [[[28, 52], [42, 34], [64, 40]]],
      cues: [
        { label: "cue.backRounds", at: [36, 22] },
        { label: "cue.headDrops", at: [84, 30], arrow: { from: [80, 35], to: [72, 42] } },
      ],
    },
    right: {
      guides: [[[32, 56], [42, 14]]],
      cues: [
        { label: "cue.spineLong", at: [18, 24] },
        { label: "cue.hingeHips", at: [18, 64], arrow: { from: [24, 60], to: [32, 57] } },
      ],
    },
  },
  "stand-ham": {
    wrong: {
      spot: [60, 53],
      guides: [[[28, 40], [40, 24], [58, 26]]],
      cues: [
        { label: "cue.backRounds", at: [20, 14] },
        { label: "cue.kneeLocks", at: [44, 72], arrow: { from: [50, 67], to: [58, 57] } },
      ],
    },
    right: {
      guides: [[[30, 42], [50, 20]]],
      cues: [
        { label: "cue.spineLong", at: [20, 14] },
        { label: "cue.kneeSoft", at: [44, 72], arrow: { from: [50, 67], to: [58, 57] } },
      ],
    },
  },
  quad: {
    wrong: {
      spot: [42, 54],
      cues: [
        { label: "cue.kneeDrifts", at: [18, 68], arrow: { from: [24, 63], to: [37, 55] } },
        { label: "cue.backArches", at: [16, 30], arrow: { from: [22, 34], to: [32, 40] } },
      ],
    },
    right: {
      guides: [[[39, 42], [39, 90]]],
      cues: [
        { label: "cue.kneeDown", at: [18, 68], arrow: { from: [25, 64], to: [35, 58] } },
        { label: "cue.ribsDown", at: [16, 30], arrow: { from: [23, 33], to: [33, 38] } },
      ],
    },
  },
  "side-quad": {
    wrong: {
      spot: [51, 38],
      cues: [
        { label: "cue.kneeDrifts", at: [62, 18], arrow: { from: [59, 24], to: [53, 35] } },
        { label: "cue.backArches", at: [28, 36], arrow: { from: [30, 42], to: [34, 51] } },
      ],
    },
    right: {
      guides: [[[18, 58], [72, 58]]],
      cues: [{ label: "cue.kneeInLine", at: [64, 36], arrow: { from: [62, 42], to: [58, 54] } }],
    },
  },
  calf: {
    wrong: {
      spot: [21, 78],
      cues: [{ label: "cue.heelLifts", at: [18, 60], arrow: { from: [19, 66], to: [20, 75] } }],
    },
    right: {
      guides: [[[20, 82], [50, 40]]],
      cues: [{ label: "cue.heelDown", at: [18, 60], arrow: { from: [19, 66], to: [20, 77] } }],
    },
  },
};

/** Splits the catalog mistake copy into what goes wrong and how to fix it. */
export function splitMistake(text: string): { wrong: string; fix: string } {
  const thai = text.indexOf(" ให้");
  if (thai > 0) return { wrong: text.slice(0, thai), fix: text.slice(thai + 1) };
  const stop = text.indexOf(". ");
  if (stop > 0) return { wrong: text.slice(0, stop + 1), fix: text.slice(stop + 2) };
  return { wrong: text, fix: "" };
}

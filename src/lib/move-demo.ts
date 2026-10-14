export type DemoFrames = readonly [string, string, string] | readonly [string, string, string, string];

export type DemoMoveKind = "stretch" | "exercise" | "barbell";

const barbellExerciseAliases: Record<string, string> = {
  "bodyweight-squat": "slow-squat",
  "reverse-lunge": "slow-reverse-lunge",
  "front-plank": "full-forearm-plank",
  "glute-bridge": "glute-bridge",
  "side-plank": "full-side-plank",
  "hip-hinge": "slow-hip-hinge",
};

export function getMoveDemoFrames(kind: DemoMoveKind, id: string): DemoFrames {
  const alias = kind === "barbell" ? barbellExerciseAliases[id] : undefined;
  const assetKind = alias ? "exercise" : kind;
  const assetId = alias ?? id;

  return [1, 2, 3, 4].map((frame) =>
    `/illustrations/demos/${assetKind}/${assetId}-${frame}.webp`,
  ) as [string, string, string, string];
}

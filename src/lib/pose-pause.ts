export const POSE_PAUSE_SECONDS = 10;

export function poseIsComplete(input: {
  sided: boolean;
  left: boolean;
  right: boolean;
}): boolean {
  if (input.sided) return input.left && input.right;
  return input.left;
}

export function shouldPauseForNextPose(input: {
  poseComplete: boolean;
  canAdvance: boolean;
}): boolean {
  return input.poseComplete && input.canAdvance;
}

export function stepPosePause(secondsLeft: number): { secondsLeft: number; advance: boolean } {
  if (secondsLeft <= 1) return { secondsLeft: 1, advance: true };
  return { secondsLeft: secondsLeft - 1, advance: false };
}

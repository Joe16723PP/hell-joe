import { describe, expect, it } from "vitest";
import { poseIsComplete, shouldPauseForNextPose } from "@/lib/pose-pause";

describe("poseIsComplete", () => {
  it("needs both sides for a sided stretch", () => {
    expect(poseIsComplete({ sided: true, left: true, right: false })).toBe(false);
    expect(poseIsComplete({ sided: true, left: false, right: true })).toBe(false);
    expect(poseIsComplete({ sided: true, left: true, right: true })).toBe(true);
  });

  it("needs one hold for a two-sided stretch", () => {
    expect(poseIsComplete({ sided: false, left: true, right: false })).toBe(true);
    expect(poseIsComplete({ sided: false, left: false, right: false })).toBe(false);
  });
});

describe("shouldPauseForNextPose", () => {
  it("pauses only when the pose is done and there is a next step", () => {
    expect(shouldPauseForNextPose({ poseComplete: true, canAdvance: true })).toBe(true);
    expect(shouldPauseForNextPose({ poseComplete: true, canAdvance: false })).toBe(false);
    expect(shouldPauseForNextPose({ poseComplete: false, canAdvance: true })).toBe(false);
  });
});
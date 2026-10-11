"use client";

import { publicPath } from "@/lib/public-path";

export default function imageLoader({ src }: { src: string; width: number; quality?: number }) {
  return publicPath(src);
}

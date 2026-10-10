import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TuengWa.dev",
    short_name: "TuengWa",
    description:
      "A short daily stretch, plus an optional bodyweight exercise, with still drawings and a hold timer.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4f7f1",
    theme_color: "#0e7a67",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

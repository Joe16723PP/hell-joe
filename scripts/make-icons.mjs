// Renders the app icons from the header logo mark. Run with `node scripts/make-icons.mjs`.
import { mkdir, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";

const GLYPH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.5" r="2" fill="white" stroke="none"/><path d="M5 9.5c2.5 1 4.5 1.3 7 1.3s4.5-.3 7-1.3"/><path d="M12 11v4.5l-3.5 5"/><path d="M12 15.5l3.5 5"/></svg>`;

function icon(size) {
  const glyph = Math.round(size * 0.5);
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 100% 0%, rgba(255,178,63,0.45), transparent 60%), radial-gradient(circle at 0% 100%, rgba(94,234,212,0.35), transparent 60%), linear-gradient(135deg, #0b5f51 0%, #0e7a67 55%, #13957b 100%)",
      },
    },
    h("img", {
      width: glyph,
      height: glyph,
      src: `data:image/svg+xml;base64,${Buffer.from(GLYPH).toString("base64")}`,
    }),
  );
}

async function render(size, path) {
  const response = new ImageResponse(icon(size), { width: size, height: size });
  await writeFile(path, Buffer.from(await response.arrayBuffer()));
  console.log(`wrote ${path}`);
}

await mkdir("public/icons", { recursive: true });
await render(192, "public/icons/icon-192.png");
await render(512, "public/icons/icon-512.png");
await render(180, "src/app/apple-icon.png");

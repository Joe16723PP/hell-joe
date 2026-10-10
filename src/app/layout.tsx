import type { Metadata, Viewport } from "next";
import { Anuphan, Outfit, Plus_Jakarta_Sans, Prompt } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { I18nProvider } from "@/lib/i18n/provider";
import { StretchProvider } from "@/lib/store";
import "./globals.css";

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const bodyTh = Anuphan({
  subsets: ["thai"],
  variable: "--font-body-th",
});

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

const displayTh = Prompt({
  subsets: ["thai"],
  weight: ["500", "600"],
  variable: "--font-display-th",
});

export const metadata: Metadata = {
  title: "TuengWa.dev",
  description:
    "A short daily stretch, plus an optional bodyweight exercise, with still drawings and a hold timer.",
};

export const viewport: Viewport = {
  themeColor: "#0e7a67",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${body.variable} ${bodyTh.variable} ${display.variable} ${displayTh.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <I18nProvider>
          <StretchProvider>
            <AppShell>{children}</AppShell>
          </StretchProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

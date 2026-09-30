import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { StretchProvider } from "@/lib/store";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Stretchday",
  description:
    "A short daily stretch. Still pictures, the muscle to feel, and the usual mistake.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <StretchProvider>
          <AppShell>{children}</AppShell>
        </StretchProvider>
      </body>
    </html>
  );
}

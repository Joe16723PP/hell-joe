"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LibraryBig, Sun } from "lucide-react";
import { LanguageSwitch } from "@/components/language-switch";
import { useI18n } from "@/lib/i18n/provider";
import { useOffline } from "@/lib/offline";
import { useStretchReminder } from "@/lib/reminder";
import { useStretch } from "@/lib/store";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", key: "nav.today", icon: Sun },
  { href: "/library", key: "nav.library", icon: LibraryBig },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { ready, settings } = useStretch();
  const reminder = useStretchReminder();
  useOffline();
  const onMove =
    pathname.startsWith("/session") ||
    pathname.startsWith("/exercise") ||
    pathname.startsWith("/barbell") ||
    /^\/library\/.+/.test(pathname);
  const showNav = ready && settings.setupDone && !onMove;

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-heading text-2xl font-semibold tracking-tight">
              {t("app.name")}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {showNav && (
              <nav className="hidden items-center gap-1 md:flex" aria-label={t("nav.primary")}>
                {LINKS.map((link) => {
                  const active = isActive(pathname, link.href);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-base font-medium transition-colors",
                        active
                          ? "bg-secondary text-secondary-foreground"
                          : "text-foreground/75 hover:bg-muted",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="size-4" aria-hidden />
                      {t(link.key)}
                    </Link>
                  );
                })}
              </nav>
            )}
            <LanguageSwitch />
          </div>
        </div>
      </header>
      {reminder && (
        <p
          role="status"
          className="mx-auto w-full max-w-6xl px-4 pt-3 text-sm font-medium text-primary md:px-8"
        >
          {reminder}
        </p>
      )}
      <div className={cn("flex-1", showNav && "pb-24 md:pb-0")}>{children}</div>
      {showNav && (
        <nav
          className="fixed inset-x-3 bottom-3 z-40 rounded-3xl border border-border bg-card/90 shadow-lg shadow-primary/10 backdrop-blur-xl md:hidden"
          aria-label={t("nav.primary")}
        >
          <ul className="grid grid-cols-2 p-1.5">
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-sm font-medium transition-colors",
                      active ? "bg-secondary text-secondary-foreground" : "text-foreground/70",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="size-5" aria-hidden />
                    {t(link.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}

function LogoMark() {
  return (
    <span
      className="grid size-9 place-items-center rounded-xl hero-gradient text-white shadow-md shadow-primary/25"
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4.5" r="2" fill="currentColor" stroke="none" />
        <path d="M5 9.5c2.5 1 4.5 1.3 7 1.3s4.5-.3 7-1.3" />
        <path d="M12 11v4.5l-3.5 5" />
        <path d="M12 15.5l3.5 5" />
      </svg>
    </span>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return (
      pathname === "/" ||
      pathname.startsWith("/recap") ||
      pathname === "/session" ||
      pathname === "/exercise" ||
      pathname.startsWith("/barbell")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

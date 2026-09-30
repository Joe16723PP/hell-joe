"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStretch } from "@/lib/store";
import { cn } from "cn";

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/library", label: "Library" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { ready, settings } = useStretch();
  const onMove =
    pathname.startsWith("/session") || /^\/library\/.+/.test(pathname);
  const showNav = ready && settings.setupDone && !onMove;

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          <Link
            href="/"
            className="font-heading text-[1.7rem] leading-none tracking-tight"
          >
            Stretchday
          </Link>
          {showNav && (
            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-lg px-4 text-base",
                    isActive(pathname, link.href)
                      ? "text-primary"
                      : "text-foreground/80 hover:bg-muted",
                  )}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
      <div className={cn("flex-1", showNav && "pb-20 md:pb-0")}>{children}</div>
      {showNav && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
          aria-label="Primary"
        >
          <ul className="mx-auto grid max-w-lg grid-cols-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex min-h-16 items-center justify-center text-base",
                    isActive(pathname, link.href) ? "text-primary" : "text-foreground/75",
                  )}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname === "/recap" || pathname === "/session";
  return pathname === href || pathname.startsWith(`${href}/`);
}

"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { LOCALES } from "@/lib/i18n/messages";
import { cn } from "cn";

export function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className="flex items-center gap-0.5 rounded-full border border-border bg-card p-1 shadow-sm"
    >
      <Languages className="mx-1.5 size-4 text-muted-foreground" aria-hidden />
      {LOCALES.map((item) => {
        const active = item.id === locale;
        return (
          <button
            key={item.id}
            type="button"
            lang={item.id}
            aria-pressed={active}
            aria-label={item.label}
            onClick={() => setLocale(item.id)}
            className={cn(
              "min-h-9 min-w-10 rounded-full px-2.5 text-sm font-semibold transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted",
            )}
          >
            {item.short}
          </button>
        );
      })}
    </div>
  );
}

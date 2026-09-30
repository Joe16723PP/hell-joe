"use client";

import { useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { BellRing, Check, Clock, Moon, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TIGHT_OPTIONS, type LengthMin, type TightId } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n/provider";
import type { Settings } from "@/lib/plan";
import { useStretch } from "@/lib/store";
import { cn } from "cn";

function subscribePermission() {
  return () => {};
}

function readNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

const LENGTHS: { value: LengthMin; moves: number }[] = [
  { value: 5, moves: 4 },
  { value: 10, moves: 6 },
  { value: 15, moves: 8 },
];

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function SetupScreen({
  onDone,
  onCancel,
}: {
  onDone: () => void;
  onCancel?: () => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const { settings, saveSetup } = useStretch();
  const [length, setLength] = useState<LengthMin>(settings.length);
  const [tightAreas, setTightAreas] = useState<TightId[]>(settings.tightAreas);
  const [restDay, setRestDay] = useState(settings.restDay);
  const [reminderOn, setReminderOn] = useState(settings.reminderOn);
  const [reminderTime, setReminderTime] = useState(settings.reminderTime || "08:00");
  const [permissionOverride, setPermissionOverride] = useState<
    NotificationPermission | "unsupported" | null
  >(null);
  const browserPermission = useSyncExternalStore(
    subscribePermission,
    readNotificationPermission,
    () => "default" as const,
  );
  const permission = permissionOverride ?? browserPermission;

  async function toggleReminder(next: boolean) {
    setReminderOn(next);
    if (!next || typeof Notification === "undefined") return;
    if (Notification.permission === "granted" || Notification.permission === "denied") {
      setPermissionOverride(Notification.permission);
      return;
    }
    const result = await Notification.requestPermission();
    setPermissionOverride(result);
  }

  function toggleTight(id: TightId) {
    setTightAreas((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: Settings = {
      setupDone: true,
      length,
      tightAreas,
      restDay,
      reminderOn,
      reminderTime: reminderTime || "08:00",
    };
    saveSetup(next);
    onDone();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-12">
      <div className="relative overflow-hidden rounded-[2rem] hero-gradient p-6 text-white shadow-xl shadow-primary/20 sm:p-8">
        <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
          {onCancel ? t("setup.kickerEdit") : t("setup.kicker")}
        </p>
        <h1 className="mt-4 max-w-xl text-4xl leading-tight font-semibold text-balance sm:text-5xl">
          {t("setup.title")}
        </h1>
        <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/85">{t("setup.intro")}</p>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <SetupCard step={1} icon={<Clock className="size-5" aria-hidden />} title={t("setup.lengthTitle")} hint={t("setup.lengthHint")}>
          <div className="grid gap-2 sm:grid-cols-3">
            {LENGTHS.map((option) => {
              const selected = length === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setLength(option.value)}
                  className={choiceClass(selected)}
                >
                  <span className="font-heading text-3xl font-semibold">{option.value}</span>
                  <span className="block text-sm opacity-85">
                    {t("setup.minutesUnit")} · {t("setup.lengthDetail", { count: option.moves })}
                  </span>
                </button>
              );
            })}
          </div>
        </SetupCard>

        <SetupCard step={2} icon={<Target className="size-5" aria-hidden />} title={t("setup.tightTitle")} hint={t("setup.tightHint")}>
          <div className="grid gap-2 sm:grid-cols-2">
            {TIGHT_OPTIONS.map((option) => {
              const selected = tightAreas.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleTight(option.id)}
                  className={cn(choiceClass(selected), "flex items-center justify-between gap-2 font-semibold")}
                >
                  {i18n.tight(option.id)}
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full border-2",
                      selected ? "border-white bg-white text-primary" : "border-border",
                    )}
                    aria-hidden
                  >
                    {selected && <Check className="size-4" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        </SetupCard>

        <SetupCard
          step={3}
          icon={<Moon className="size-5" aria-hidden />}
          title={t("setup.restTitle")}
          hint={t("setup.restHint", { day: i18n.weekday(restDay) })}
        >
          <div className="grid grid-cols-7 gap-1.5">
            {WEEK_ORDER.map((index) => (
              <button
                key={index}
                type="button"
                aria-pressed={restDay === index}
                aria-label={i18n.weekday(index)}
                onClick={() => setRestDay(index)}
                className={cn(choiceClass(restDay === index), "min-h-12 px-0 text-center text-sm font-semibold")}
              >
                {i18n.weekday(index, "short")}
              </button>
            ))}
          </div>
        </SetupCard>

        <SetupCard icon={<BellRing className="size-5" aria-hidden />} title={t("setup.reminderTitle")}>
          <label className="flex items-start gap-3 text-base">
            <input
              type="checkbox"
              checked={reminderOn}
              onChange={(event) => {
                void toggleReminder(event.target.checked);
              }}
              className="mt-1 size-5 shrink-0 accent-[#0e7a67]"
            />
            <span>{t("setup.reminderLabel")}</span>
          </label>
          {reminderOn && permission === "denied" && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("setup.blocked")}</p>
          )}
          {reminderOn && permission === "unsupported" && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("setup.unsupported")}</p>
          )}
          <div className="mt-4 max-w-xs">
            <label htmlFor="reminder-time" className="text-sm font-medium text-muted-foreground">
              {t("setup.time")}
            </label>
            <Input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(event) => setReminderTime(event.target.value)}
              disabled={!reminderOn}
              className="mt-1 h-12 rounded-xl bg-background text-base"
            />
          </div>
        </SetupCard>

        <p className="px-1 text-sm leading-relaxed text-muted-foreground">{t("common.disclaimer")}</p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" size="lg" className="h-14 rounded-2xl px-8 text-lg font-semibold sm:min-w-64">
            {t("setup.submit")}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" size="lg" className="h-14 rounded-2xl" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
          )}
        </div>
      </form>
    </main>
  );
}

function SetupCard({
  step,
  icon,
  title,
  hint,
  children,
}: {
  step?: number;
  icon: ReactNode;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-heading text-xl font-semibold" aria-hidden>
            {step ? <span className="mr-2 text-primary/60">{step}</span> : null}
            {title}
          </p>
          {hint && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </fieldset>
  );
}

function choiceClass(selected: boolean) {
  return cn(
    "min-h-12 rounded-2xl border-2 px-4 py-3 text-left text-base transition-all",
    selected
      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
      : "border-border bg-background text-foreground hover:border-primary/40",
  );
}

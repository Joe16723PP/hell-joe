"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TIGHT_OPTIONS, WEEKDAY_NAMES, type LengthMin, type TightId } from "@/lib/catalog";
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

const LENGTHS: { value: LengthMin; detail: string }[] = [
  { value: 5, detail: "about 4 moves" },
  { value: 10, detail: "about 6 moves" },
  { value: 15, detail: "about 8 moves" },
];

export function SetupScreen({
  onDone,
  onCancel,
}: {
  onDone: () => void;
  onCancel?: () => void;
}) {
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
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-14">
      <p className="text-sm tracking-[0.16em] text-muted-foreground uppercase">
        First time
      </p>
      <h1 className="mt-3 max-w-xl font-heading text-4xl leading-tight text-balance sm:text-5xl">
        About ten minutes. No equipment.
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-foreground/80">
        A chair is enough for the short routine. A stretch should feel like steady
        tension. Pain means stop.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-10">
        <fieldset>
          <legend className="font-heading text-2xl">How long</legend>
          <p className="mt-1 text-base text-muted-foreground">
            10 minutes is the default. You can change it each day before you start.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {LENGTHS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={length === option.value}
                onClick={() => setLength(option.value)}
                className={choiceClass(length === option.value)}
              >
                <span className="font-heading text-2xl">{option.value}</span>
                <span className="block text-sm">minutes · {option.detail}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-heading text-2xl">What feels tight</legend>
          <p className="mt-1 text-base text-muted-foreground">
            Optional. Skip this and the week stays on the default rotation. Named
            areas show up more often. The other days still rotate.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {TIGHT_OPTIONS.map((option) => {
              const selected = tightAreas.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleTight(option.id)}
                  className={choiceClass(selected)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-heading text-2xl">Rest day</legend>
          <p className="mt-1 text-base text-muted-foreground">
            {WEEKDAY_NAMES[restDay]} until you move it. The streak stays intact that
            day, and no reminder is sent.
          </p>
          <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {WEEKDAY_NAMES.map((name, index) => (
              <button
                key={name}
                type="button"
                aria-pressed={restDay === index}
                onClick={() => setRestDay(index)}
                className={cn(choiceClass(restDay === index), "px-2 text-sm")}
              >
                {name.slice(0, 3)}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-border bg-card p-4">
          <legend className="px-1 font-heading text-2xl">Reminder</legend>
          <label className="mt-3 flex items-start gap-3 text-base">
            <input
              type="checkbox"
              checked={reminderOn}
              onChange={(event) => {
                void toggleReminder(event.target.checked);
              }}
              className="mt-1 size-5 accent-[#8f3d2c]"
            />
            <span>
              Remind me on stretch days, once, at the time below. Rest day sends
              nothing. The browser asks before it can notify you.
            </span>
          </label>
          {reminderOn && permission === "denied" && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Notifications are blocked in this browser. The home screen is the reminder.
            </p>
          )}
          {reminderOn && permission === "unsupported" && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This browser does not offer notifications. The home screen is the reminder.
            </p>
          )}
          <div className="mt-4 max-w-xs">
            <label htmlFor="reminder-time" className="text-sm text-muted-foreground">
              Time
            </label>
            <Input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(event) => setReminderTime(event.target.value)}
              disabled={!reminderOn}
              className="mt-1 h-12 bg-background text-base"
            />
          </div>
        </fieldset>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Stretchday is a mobility habit, not medical advice. It does not diagnose
          tightness or prescribe care.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" size="lg" className="sm:min-w-56">
            Show today&apos;s session
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </main>
  );
}

function choiceClass(selected: boolean) {
  return cn(
    "min-h-12 rounded-xl border px-4 py-3 text-left text-base transition-colors",
    selected
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card text-foreground hover:bg-muted",
  );
}

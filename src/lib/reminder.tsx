"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { focusFor, isoDate, startOfToday } from "@/lib/plan";
import { reminderDue } from "@/lib/reminder-time";
import { useStretch } from "@/lib/store";

export function useStretchReminder() {
  const { ready, settings, lastReminder, finished, exerciseFinished, markReminded } = useStretch();
  const { t, minutes } = useI18n();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !settings.setupDone || !settings.reminderOn) return;

    const tick = () => {
      const today = startOfToday();
      const due = reminderDue({
        now: new Date(),
        today,
        rest: focusFor(today, settings).rest,
        reminderOn: settings.reminderOn,
        reminderTime: settings.reminderTime,
        lastReminder,
        stretchDone: finished.some((entry) => entry.date === isoDate(today)),
        exerciseOn: settings.exerciseOn,
        exerciseDone: exerciseFinished.some((entry) => entry.date === isoDate(today)),
      });
      if (!due) return;

      const body = t(due.exercise ? "reminder.bodyWithExercise" : "reminder.body", {
        minutes: minutes(settings.length),
      });
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification(t("app.name"), { body });
        } catch {
          // The page can still show the reminder itself.
        }
      }
      setNotice(body);
      markReminded(due.date);
    };

    tick();
    const id = window.setInterval(tick, 15000);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [exerciseFinished, finished, lastReminder, markReminded, minutes, ready, settings, t]);

  return notice;
}

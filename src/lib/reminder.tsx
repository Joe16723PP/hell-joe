"use client";

import { useEffect } from "react";
import { focusFor, isoDate, startOfToday } from "@/lib/plan";
import { useStretch } from "@/lib/store";

export function useStretchReminder() {
  const { ready, settings, lastReminder, markReminded } = useStretch();

  useEffect(() => {
    if (!ready || !settings.setupDone || !settings.reminderOn) return;
    if (typeof Notification === "undefined") return;

    const tick = () => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const today = startOfToday();
      if (focusFor(today, settings).rest) return;
      const [hourText, minuteText] = settings.reminderTime.split(":");
      const hour = Number(hourText);
      const minute = Number(minuteText);
      if (!Number.isFinite(hour) || !Number.isFinite(minute)) return;
      if (now.getHours() !== hour || now.getMinutes() !== minute) return;
      const key = isoDate(today);
      if (lastReminder === key) return;
      try {
        new Notification("Stretchday", {
          body: `Today's stretch is ready. About ${settings.length} minutes.`,
        });
      } catch {
        return;
      }
      markReminded(key);
    };

    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, [lastReminder, markReminded, ready, settings]);
}

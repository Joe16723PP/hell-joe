"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  areaIdFrom,
  type PositionId,
  type Preset,
  type PresetId,
  type Stretch,
  type TightId,
} from "@/lib/catalog";
import { type ExerciseMove, type ExercisePreset } from "@/lib/exercise";
import { PRESETS_TH, STRETCHES_TH, type PresetCopy, type StretchCopy } from "@/lib/i18n/catalog-th";
import { EXERCISE_PRESETS_TH, EXERCISES_TH } from "@/lib/i18n/exercise-th";
import { MESSAGES, en, type Locale, type MessageKey } from "@/lib/i18n/messages";
import type { FocusKey } from "@/lib/plan";

const STORAGE_KEY = "stretchday-locale";

type Vars = Record<string, string | number>;

export type I18n = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Vars) => string;
  weekday: (day: number, style?: "long" | "short") => string;
  longDate: (date: Date) => string;
  stretch: (stretch: Stretch) => StretchCopy & { areaLabel: string; positionLabel: string };
  preset: (preset: Preset) => PresetCopy;
  exercise: (move: ExerciseMove) => StretchCopy & {
    patternLabel: string;
    positionLabel: string;
    optionLabel: string;
  };
  exercisePreset: (preset: ExercisePreset) => { name: string; blurb: string };
  area: (idOrLabel: string) => string;
  position: (id: PositionId) => string;
  tight: (id: TightId) => string;
  focus: (key: FocusKey) => string;
  focusShort: (key: FocusKey) => string;
  minutes: (count: number) => string;
  moves: (count: number) => string;
  days: (count: number) => string;
};

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "th";
}

function readLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // localStorage can be unavailable in private modes.
  }
  return window.navigator.language?.toLowerCase().startsWith("th") ? "th" : "en";
}

function writeLocale(locale: Locale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Fall through: the choice still applies for this visit.
  }
  memo = locale;
  listeners.forEach((listener) => listener());
}

let memo: Locale | null = null;

function getSnapshot(): Locale {
  if (memo === null) memo = readLocale();
  return memo;
}

function format(template: string, vars?: Vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

function buildI18n(locale: Locale, setLocale: (locale: Locale) => void): I18n {
  const dict = MESSAGES[locale];
  const dateLocale = locale === "th" ? "th-TH" : "en-US";

  const t = (key: MessageKey, vars?: Vars) => {
    const count = vars?.count;
    if (count === 1) {
      const one = dict[`${key}_one` as MessageKey];
      if (one) return format(one, vars);
    }
    return format(dict[key] ?? en[key] ?? key, vars);
  };

  const longFmt = new Intl.DateTimeFormat(dateLocale, { weekday: "long" });
  const shortFmt = new Intl.DateTimeFormat(dateLocale, { weekday: "short" });
  const dateFmt = new Intl.DateTimeFormat(dateLocale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const area = (idOrLabel: string) => {
    const id = areaIdFrom(idOrLabel);
    return id ? t(`area.${id}` as MessageKey) : idOrLabel;
  };
  const position = (id: PositionId) => t(`position.${id}` as MessageKey);

  return {
    locale,
    setLocale,
    t,
    weekday: (day, style = "long") => {
      // 4 Jan 2026 is a Sunday, so day 0..6 maps onto Sunday..Saturday.
      const date = new Date(2026, 0, 4 + day);
      return (style === "long" ? longFmt : shortFmt).format(date);
    },
    longDate: (date) => dateFmt.format(date),
    stretch: (stretch) => {
      const copy: StretchCopy =
        locale === "th"
          ? STRETCHES_TH[stretch.id]
          : {
              name: stretch.name,
              plain: stretch.plain,
              anatomical: stretch.anatomical,
              setup: stretch.setup,
              steps: stretch.steps,
              mistake: stretch.mistake,
            };
      return { ...copy, areaLabel: area(stretch.area), positionLabel: position(stretch.position) };
    },
    preset: (preset) =>
      locale === "th"
        ? PRESETS_TH[preset.id as PresetId]
        : { name: preset.name, blurb: preset.blurb, where: preset.where },
    exercise: (move) => {
      const copy: StretchCopy =
        locale === "th"
          ? EXERCISES_TH[move.id]
          : {
              name: move.name,
              plain: move.plain,
              anatomical: move.anatomical,
              setup: move.setup,
              steps: move.steps,
              mistake: move.mistake,
            };
      return {
        ...copy,
        patternLabel: t(`pattern.${move.pattern}` as MessageKey),
        positionLabel: t(`position.${move.position}` as MessageKey),
        optionLabel: t(move.option === "core" ? "exercise.optionCore" : "exercise.optionMuscle"),
      };
    },
    exercisePreset: (preset) =>
      locale === "th"
        ? EXERCISE_PRESETS_TH[preset.id]
        : { name: preset.name, blurb: preset.blurb },
    area,
    position,
    tight: (id) => t(`tight.${id}` as MessageKey),
    focus: (key) => t(`focus.${key}` as MessageKey),
    focusShort: (key) => t(`focusShort.${key}` as MessageKey),
    minutes: (count) => t("common.minutes", { count }),
    moves: (count) => t("common.moves", { count }),
    days: (count) => t("common.days", { count }),
  };
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, () => "en" as Locale);
  const setLocale = useCallback((next: Locale) => writeLocale(next), []);
  const value = useMemo(() => buildI18n(locale, setLocale), [locale, setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used within I18nProvider");
  return value;
}

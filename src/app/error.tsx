"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-secondary text-primary">
        <Flag className="size-7" aria-hidden />
      </div>
      <h1 className="mt-5 text-4xl font-semibold">{t("error.title")}</h1>
      <p className="mt-3 text-lg leading-relaxed text-foreground/80">{t("error.body")}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" size="lg" className="h-12 rounded-2xl px-6 font-semibold" onClick={() => retry()}>
          {t("error.tryAgain")}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="h-12 rounded-2xl px-6 font-semibold"
          onClick={() => {
            retry();
            router.push("/");
          }}
        >
          {t("error.startOver")}
        </Button>
      </div>
    </main>
  );
}

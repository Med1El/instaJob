"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function TriggerScrapeButton() {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function trigger() {
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/admin/trigger-scrape", { method: "POST" });
    const json = await res.json();

    if (res.ok) {
      setMessage(t("scrapeTriggered"));
      router.refresh();
    } else {
      setMessage(`Erreur: ${json.error ?? "unknown"}`);
    }

    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span className="text-sm text-green-600 font-medium">{message}</span>
      )}
      <button
        onClick={trigger}
        disabled={loading}
        className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Lancement...
          </>
        ) : (
          <>▶ {t("triggerScrape")}</>
        )}
      </button>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import TriggerScrapeButton from "@/components/admin/TriggerScrapeButton";

export default async function AdminScrapePage() {
  const t = await getTranslations("admin");
  const supabase = await createClient();

  const { data: runs } = await supabase
    .from("scrape_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(10);

  const statusColors: Record<string, string> = {
    complete: "bg-green-100 text-green-700",
    running: "bg-blue-100 text-blue-700",
    error: "bg-red-100 text-red-700",
  };

  function duration(run: { started_at: string; finished_at: string | null }) {
    if (!run.finished_at) return "—";
    const ms = new Date(run.finished_at).getTime() - new Date(run.started_at).getTime();
    const secs = Math.round(ms / 1000);
    if (secs < 60) return `${secs}s`;
    return `${Math.round(secs / 60)}m ${secs % 60}s`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("scrapeRuns")}</h1>
        <TriggerScrapeButton />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-start font-medium text-gray-600">Démarré le</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">{t("triggeredBy")}</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">{t("status")}</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">{t("postsFound")}</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">{t("postsNew")}</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">{t("duration")}</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">Erreur</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(runs ?? []).map((run) => (
              <tr key={run.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {new Date(run.started_at).toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-500">
                    {run.triggered_by === "cron" ? t("cron") : t("manual")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[run.status] ?? ""}`}>
                    {run.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{run.posts_found ?? "—"}</td>
                <td className="px-4 py-3 text-gray-700">{run.posts_new ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{duration(run)}</td>
                <td className="px-4 py-3 text-red-500 text-xs max-w-[200px] truncate" title={run.error_message ?? ""}>
                  {run.error_message ?? "—"}
                </td>
              </tr>
            ))}
            {(runs ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Aucun scraping effectué pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

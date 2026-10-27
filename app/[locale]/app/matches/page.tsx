import { createClient } from "@/lib/supabase/server";
import { getTranslations, getLocale } from "next-intl/server";
import JobCard from "@/components/JobCard";
import type { Database } from "@/lib/supabase/types";

type JobPost = Database["public"]["Tables"]["job_posts"]["Row"];

interface SearchParams {
  q?: string;
  from?: string;
  to?: string;
  deadline_from?: string;
  deadline_to?: string;
  page?: string;
}

const PAGE_SIZE = 20;

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations("matches");
  const locale = await getLocale();
  const sp = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const page = parseInt(sp.page ?? "1", 10);
  const offset = (page - 1) * PAGE_SIZE;

  // Build query — join user_matches → job_posts
  // Users can ONLY filter by: keyword (title/body), publication date, deadline
  // No specialty/diploma/exp/region/city filters exposed
  let query = supabase
    .from("user_matches")
    .select(
      `
      matched_at,
      job_posts (
        id, url, title, organization,
        deadline, exam_date, published_at, positions_count, competition_code
      )
    `,
      { count: "exact" }
    )
    .eq("user_id", user.id)
    .order("matched_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (sp.from) {
    query = query.gte("job_posts.published_at", sp.from);
  }
  if (sp.to) {
    query = query.lte("job_posts.published_at", sp.to);
  }
  if (sp.deadline_from) {
    query = query.gte("job_posts.deadline", sp.deadline_from);
  }
  if (sp.deadline_to) {
    query = query.lte("job_posts.deadline", sp.deadline_to);
  }

  const { data: matches, count } = await query;

  // Apply keyword search client-side after fetch (Supabase free tier doesn't have
  // full-text search through joins easily; for scale use pg_trgm or a search table)
  const keyword = sp.q?.toLowerCase() ?? "";
  const filtered = keyword
    ? (matches ?? []).filter((m) => {
        const post = m.job_posts as { title: string } | null;
        return post?.title?.toLowerCase().includes(keyword);
      })
    : (matches ?? []);

  const now = new Date();
  const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        {count !== null && (
          <span className="text-sm text-gray-500">{count} résultats</span>
        )}
      </div>

      {/* Filters form */}
      <form method="GET" className="bg-white rounded-xl border border-gray-200 p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {t("searchPlaceholder")}
          </label>
          <input
            name="q"
            type="text"
            defaultValue={sp.q}
            placeholder={t("searchPlaceholder")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {t("filterByDate")} ({t("from")})
          </label>
          <input
            name="from"
            type="date"
            defaultValue={sp.from}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {t("filterByDeadline")} ({t("to")})
          </label>
          <input
            name="deadline_to"
            type="date"
            defaultValue={sp.deadline_to}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="lg:col-span-4 flex gap-2">
          <button
            type="submit"
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            {t("filter") ?? "Filtrer"}
          </button>
          <a
            href="?"
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Réinitialiser
          </a>
        </div>
      </form>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📭</div>
          <p>{t("noMatches")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => {
            const post = m.job_posts as Record<string, unknown> | null;
            if (!post) return null;
            const isNew = new Date(m.matched_at) > cutoff24h;
            return (
              <JobCard
                key={post.id}
                post={post as unknown as Parameters<typeof JobCard>[0]["post"]}
                isNew={isNew}
                locale={locale as "ar" | "fr" | "en"}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?${new URLSearchParams({ ...sp, page: String(p) })}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                p === page
                  ? "bg-blue-700 text-white border-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

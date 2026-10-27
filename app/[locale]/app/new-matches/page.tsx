import { createClient } from "@/lib/supabase/server";
import { getTranslations, getLocale } from "next-intl/server";
import JobCard from "@/components/JobCard";
import type { Database } from "@/lib/supabase/types";

type JobPost = Database["public"]["Tables"]["job_posts"]["Row"];

export default async function NewMatchesPage() {
  const t = await getTranslations("newMatches");
  const locale = await getLocale();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Compute 24h window at query time — no cron needed
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: matches } = await supabase
    .from("user_matches")
    .select(
      `
      matched_at,
      job_posts (
        id, url, title, organization,
        deadline, exam_date, published_at, positions_count, competition_code
      )
    `
    )
    .eq("user_id", user.id)
    .gte("matched_at", cutoff)
    .order("matched_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-500 text-sm mt-1">{t("subtitle")}</p>
      </div>

      {!matches || matches.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🕐</div>
          <p>{t("empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((m) => {
            const post = m.job_posts as Record<string, unknown> | null;
            if (!post) return null;
            return (
              <JobCard
                key={post.id as string}
                post={post as unknown as Parameters<typeof JobCard>[0]["post"]}
                isNew={true}
                locale={locale as "ar" | "fr" | "en"}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

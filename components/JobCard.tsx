import { useTranslations } from "next-intl";

interface JobPost {
  id: string;
  url: string;
  title: string;
  organization: string | null;
  deadline: string | null;
  exam_date: string | null;
  published_at: string | null;
  positions_count: number | null;
  competition_code: string | null;
}

interface JobCardProps {
  post: JobPost;
  isNew: boolean;
  locale: "ar" | "fr" | "en";
}

export default function JobCard({ post, isNew, locale }: JobCardProps) {
  const t = useTranslations("matches");

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(
      locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-GB"
    );
  }

  const isDeadlineSoon =
    post.deadline &&
    new Date(post.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 &&
    new Date(post.deadline).getTime() > Date.now();

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <div className="p-4 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex gap-1.5 flex-wrap">
            {isNew && (
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {t("newBadge")}
              </span>
            )}
            {isDeadlineSoon && (
              <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                ⚡ Urgent
              </span>
            )}
          </div>
          {post.positions_count && (
            <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
              {post.positions_count} {t("positions")}
            </span>
          )}
        </div>

        <h2 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-3">
          {post.title}
        </h2>

        {post.organization && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{post.organization}</p>
        )}

        <div className="space-y-1">
          {post.deadline && (
            <div className={`flex items-center gap-1.5 text-xs ${isDeadlineSoon ? "text-orange-600 font-medium" : "text-gray-500"}`}>
              <span>⏰</span>
              <span>{t("deadline")} : {formatDate(post.deadline)}</span>
            </div>
          )}
          {post.exam_date && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>📅</span>
              <span>{t("examDate")} : {formatDate(post.exam_date)}</span>
            </div>
          )}
          {post.published_at && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span>📋</span>
              <span>{t("publishedAt")} : {formatDate(post.published_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-3">
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
        >
          {t("viewDetails")} →
        </a>
      </div>
    </div>
  );
}

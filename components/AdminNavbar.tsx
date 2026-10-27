"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

export default function AdminNavbar() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            <span className="font-bold text-white me-4">{tCommon("appName")} Admin</span>
            <Link
              href="/admin/users"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              {t("users")}
            </Link>
            <Link
              href="/admin/scrape"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              {t("scrapeRuns")}
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white font-medium"
          >
            {tCommon("logout")}
          </button>
        </div>
      </div>
    </nav>
  );
}

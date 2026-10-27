import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function PendingPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⏳</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{t("pendingTitle")}</h1>
        <p className="text-gray-500 leading-relaxed mb-8">{t("pendingDesc")}</p>
        <Link
          href="/auth/login"
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          {t("login")}
        </Link>
      </div>
    </div>
  );
}

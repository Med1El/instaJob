import { useTranslations } from "next-intl";

export default function InactivePage() {
  const t = useTranslations("auth");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{t("inactiveTitle")}</h1>
        <p className="text-gray-500 leading-relaxed">{t("inactiveDesc")}</p>
      </div>
    </div>
  );
}

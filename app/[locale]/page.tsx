import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { SPECIALTIES } from "@/lib/categories";

export default function LandingPage() {
  const t = useTranslations("landing");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-700">{tCommon("appName")}</span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/auth/login"
              className="text-sm text-gray-600 hover:text-blue-700 font-medium"
            >
              {tAuth("login")}
            </Link>
            <Link
              href="/auth/signup"
              className="bg-blue-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium"
            >
              {t("cta")}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {t("hero")}
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            {t("heroSub")}
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-blue-700 text-lg font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            {t("cta")}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t("features")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: t("feature1Title"), desc: t("feature1Desc"), icon: "🤖" },
              { title: t("feature2Title"), desc: t("feature2Desc"), icon: "🔔" },
              { title: t("feature3Title"), desc: t("feature3Desc"), icon: "🆓" },
            ].map((f) => (
              <div
                key={f.title}
                className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            {t("categories")}
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {SPECIALTIES.filter((s) => !("isAll" in s)).map((s) => (
              <span
                key={s.id}
                className="bg-blue-100 text-blue-800 text-sm px-3 py-1.5 rounded-full font-medium"
              >
                {s.label.fr}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 text-center text-sm">
        <p>© {new Date().getFullYear()} ConcourNow — Tous droits réservés</p>
      </footer>
    </div>
  );
}

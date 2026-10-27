"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  SPECIALTIES,
  DIPLOMAS,
  EXPERIENCE_RANGES,
  REGIONS,
  CITIES,
} from "@/lib/categories";

export default function ProfileSetupPage() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "ar" | "fr" | "en";
  const router = useRouter();
  const supabase = createClient();

  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  const [diplomaId, setDiplomaId] = useState<number | null>(null);
  const [expRangeIds, setExpRangeIds] = useState<number[]>([]);
  const [regionId, setRegionId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter cities by selected region
  const filteredCities = regionId !== null
    ? CITIES.filter((c) => c.regionId === regionId || ("isAll" in c))
    : CITIES;

  function toggleExp(id: number) {
    setExpRangeIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (specialtyId === null || diplomaId === null || expRangeIds.length === 0 || regionId === null || cityId === null) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        specialty_id: specialtyId,
        diploma_id: diplomaId,
        exp_range_ids: expRangeIds,
        region_id: regionId,
        city_id: cityId,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/app/matches");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("title")}</h1>
          <p className="text-gray-500 text-sm mb-8">{t("subtitle")}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Specialty */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("specialty")}
              </label>
              <select
                value={specialtyId ?? ""}
                onChange={(e) => setSpecialtyId(Number(e.target.value))}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>{t("selectSpecialty")}</option>
                {SPECIALTIES.filter((s) => !("isAll" in s)).map((s) => (
                  <option key={s.id} value={s.id}>{s.label[locale]}</option>
                ))}
              </select>
            </div>

            {/* Diploma */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("diploma")}
              </label>
              <div className="space-y-2">
                {DIPLOMAS.filter((d) => !("isAll" in d)).map((d) => (
                  <label key={d.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="diploma"
                      value={d.id}
                      checked={diplomaId === d.id}
                      onChange={() => setDiplomaId(d.id)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-blue-600">
                      {d.label[locale]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience ranges (multiple) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("experience")}
              </label>
              <p className="text-xs text-gray-400 mb-2">{t("selectExperience")}</p>
              <div className="space-y-2">
                {EXPERIENCE_RANGES.filter((e) => !("isAll" in e)).map((e) => (
                  <label key={e.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={expRangeIds.includes(e.id)}
                      onChange={() => toggleExp(e.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-blue-600">
                      {e.label[locale]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("region")}
              </label>
              <select
                value={regionId ?? ""}
                onChange={(e) => {
                  setRegionId(Number(e.target.value));
                  setCityId(null); // reset city on region change
                }}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>{t("selectRegion")}</option>
                {REGIONS.filter((r) => !("isAll" in r)).map((r) => (
                  <option key={r.id} value={r.id}>{r.label[locale]}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("city")}
              </label>
              <select
                value={cityId ?? ""}
                onChange={(e) => setCityId(Number(e.target.value))}
                required
                disabled={regionId === null}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="" disabled>{t("selectCity")}</option>
                {filteredCities.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? tCommon("loading") : tCommon("save")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

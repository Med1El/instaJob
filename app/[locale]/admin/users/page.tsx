import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { SPECIALTIES, DIPLOMAS, EXPERIENCE_RANGES, REGIONS, CITIES } from "@/lib/categories";
import UserStatusToggle from "@/components/admin/UserStatusToggle";

interface SearchParams {
  status?: string;
  specialty?: string;
  diploma?: string;
  region?: string;
  city?: string;
  page?: string;
}

const PAGE_SIZE = 30;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations("admin");
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1", 10);
  const offset = (page - 1) * PAGE_SIZE;

  // Use service role to bypass RLS for admin queries
  const supabase = await createClient();

  let query = supabase
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  // Admin-only filters — these parameters only exist in admin routes
  if (sp.status) query = query.eq("status", sp.status);
  if (sp.specialty !== undefined && sp.specialty !== "") {
    query = query.eq("specialty_id", parseInt(sp.specialty));
  }
  if (sp.diploma !== undefined && sp.diploma !== "") {
    query = query.eq("diploma_id", parseInt(sp.diploma));
  }
  if (sp.region !== undefined && sp.region !== "") {
    query = query.eq("region_id", parseInt(sp.region));
  }
  if (sp.city !== undefined && sp.city !== "") {
    query = query.eq("city_id", parseInt(sp.city));
  }

  const { data: users, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function getSpecialtyLabel(id: number | null) {
    if (id === null) return "—";
    return SPECIALTIES.find((s) => s.id === id)?.label.fr ?? id;
  }
  function getDiplomaLabel(id: number | null) {
    if (id === null) return "—";
    return DIPLOMAS.find((d) => d.id === id)?.label.fr ?? id;
  }
  function getRegionLabel(id: number | null) {
    if (id === null) return "—";
    return REGIONS.find((r) => r.id === id)?.label.fr ?? id;
  }
  function getCityLabel(id: number | null) {
    if (id === null) return "—";
    return CITIES.find((c) => c.id === id)?.label ?? id;
  }
  function getExpLabels(ids: number[] | null) {
    if (!ids || ids.length === 0) return "—";
    return ids
      .map((id) => EXPERIENCE_RANGES.find((e) => e.id === id)?.label.fr ?? id)
      .join(", ");
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    inactive: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("users")}</h1>
        <span className="text-sm text-gray-500">{count} {t("userCount")}</span>
      </div>

      {/* Filters — admin only, these never appear on user-facing pages */}
      <form method="GET" className="bg-white rounded-xl border border-gray-200 p-4 mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <select name="status" defaultValue={sp.status ?? ""} className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">{t("status")}: {t("all") ?? "Tous"}</option>
          <option value="pending">{t("pending")}</option>
          <option value="active">{t("active")}</option>
          <option value="inactive">{t("inactive")}</option>
        </select>

        <select name="specialty" defaultValue={sp.specialty ?? ""} className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">Spécialité: Toutes</option>
          {SPECIALTIES.filter((s) => !("isAll" in s)).map((s) => (
            <option key={s.id} value={s.id}>{s.label.fr}</option>
          ))}
        </select>

        <select name="diploma" defaultValue={sp.diploma ?? ""} className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">Diplôme: Tous</option>
          {DIPLOMAS.filter((d) => !("isAll" in d)).map((d) => (
            <option key={d.id} value={d.id}>{d.label.fr}</option>
          ))}
        </select>

        <select name="region" defaultValue={sp.region ?? ""} className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">Région: Toutes</option>
          {REGIONS.filter((r) => !("isAll" in r)).map((r) => (
            <option key={r.id} value={r.id}>{r.label.fr}</option>
          ))}
        </select>

        <select name="city" defaultValue={sp.city ?? ""} className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">Ville: Toutes</option>
          {CITIES.filter((c) => !("isAll" in c)).map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <button type="submit" className="bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
            Filtrer
          </button>
          <a href="?" className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Réinitialiser
          </a>
        </div>
      </form>

      {/* User table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-start font-medium text-gray-600">Nom</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">Spécialité</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">Diplôme</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">Expérience</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">Région</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">Ville</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">{t("status")}</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">Inscrit le</th>
              <th className="px-4 py-3 text-start font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(users ?? []).map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3 text-gray-500">{getSpecialtyLabel(user.specialty_id)}</td>
                <td className="px-4 py-3 text-gray-500">{getDiplomaLabel(user.diploma_id)}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate" title={getExpLabels(user.exp_range_ids) as string}>
                  {getExpLabels(user.exp_range_ids)}
                </td>
                <td className="px-4 py-3 text-gray-500">{getRegionLabel(user.region_id)}</td>
                <td className="px-4 py-3 text-gray-500">{getCityLabel(user.city_id)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[user.status] ?? ""}`}>
                    {t(user.status as "active" | "pending" | "inactive")}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(user.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <UserStatusToggle userId={user.id} currentStatus={user.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
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

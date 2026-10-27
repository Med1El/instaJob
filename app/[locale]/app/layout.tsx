import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import AppNavbar from "@/components/AppNavbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const locale = await getLocale();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  // Check profile completeness — if no specialty set yet, redirect to profile setup
  const { data: profile } = await supabase
    .from("users")
    .select("specialty_id, diploma_id, exp_range_ids, region_id, city_id")
    .eq("id", user.id)
    .single();

  const profileComplete =
    profile?.specialty_id !== null &&
    profile?.diploma_id !== null &&
    profile?.exp_range_ids &&
    profile.exp_range_ids.length > 0 &&
    profile?.region_id !== null &&
    profile?.city_id !== null;

  if (!profileComplete) {
    redirect(`/${locale}/app/profile-setup`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function AdminIndexPage() {
  const locale = await getLocale();
  redirect(`/${locale}/admin/users`);
}

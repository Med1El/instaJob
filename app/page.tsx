// Root redirect — next-intl middleware handles locale detection and redirect.
// This page should never be rendered directly.
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/ar");
}

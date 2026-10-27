"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

interface Props {
  userId: string;
  currentStatus: string;
}

export default function UserStatusToggle({ userId, currentStatus }: Props) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function toggle() {
    setLoading(true);
    const newStatus = status === "active" ? "inactive" : "active";

    const res = await fetch("/api/admin/user-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status: newStatus }),
    });

    if (res.ok) {
      setStatus(newStatus);
      router.refresh();
    }
    setLoading(false);
  }

  if (status === "pending") {
    return (
      <button
        onClick={async () => {
          setLoading(true);
          const res = await fetch("/api/admin/user-status", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, status: "active" }),
          });
          if (res.ok) {
            setStatus("active");
            router.refresh();
          }
          setLoading(false);
        }}
        disabled={loading}
        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {loading ? "..." : tCommon("activate")}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
        status === "active"
          ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
          : "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"
      }`}
    >
      {loading
        ? "..."
        : status === "active"
        ? tCommon("deactivate")
        : tCommon("activate")}
    </button>
  );
}

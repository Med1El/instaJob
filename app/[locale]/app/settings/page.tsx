"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const supabase = createClient();

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("users")
        .select("notification_prefs")
        .eq("id", user.id)
        .single();

      if (data?.notification_prefs) {
        setEmailEnabled(data.notification_prefs.email ?? true);
        setPushEnabled(data.notification_prefs.push ?? false);
      }
    }
    load();
  }, []);

  async function savePrefs(email: boolean, push: boolean) {
    if (!userId) return;
    setSaving(true);
    setMessage(null);

    await supabase
      .from("users")
      .update({ notification_prefs: { email, push } })
      .eq("id", userId);

    setMessage(t("saved"));
    setSaving(false);
  }

  async function handlePushToggle() {
    if (!("Notification" in window)) {
      setPushError("Push notifications not supported in this browser.");
      return;
    }

    if (pushEnabled) {
      // Disable push — remove subscription from DB
      await supabase.from("push_subscriptions").delete().eq("user_id", userId!);
      setPushEnabled(false);
      await savePrefs(emailEnabled, false);
      return;
    }

    // Enable push — request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setPushError(t("pushPermissionDenied"));
      return;
    }

    setPushError(null);

    // Register push subscription
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });

    const subJson = sub.toJSON();
    await supabase.from("push_subscriptions").upsert({
      user_id: userId!,
      subscription: subJson,
    });

    setPushEnabled(true);
    await savePrefs(emailEnabled, true);
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("title")}</h1>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {/* Email toggle */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-gray-800">{t("emailNotifications")}</p>
            <p className="text-sm text-gray-500 mt-0.5">{t("emailNotificationsDesc")}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={async (e) => {
                setEmailEnabled(e.target.checked);
                await savePrefs(e.target.checked, pushEnabled);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Push toggle */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div>
              <p className="font-medium text-gray-800">{t("pushNotifications")}</p>
              <p className="text-sm text-gray-500 mt-0.5">{t("pushNotificationsDesc")}</p>
            </div>
            <button
              onClick={handlePushToggle}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pushEnabled
                  ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                  : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
              }`}
            >
              {pushEnabled ? t("pushDisable") : t("pushEnable")}
            </button>
          </div>
          {pushError && (
            <p className="text-sm text-red-600">{pushError}</p>
          )}
        </div>
      </div>

      {message && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          {message}
        </div>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

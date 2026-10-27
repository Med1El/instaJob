import webpush from "web-push";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://concournow.vercel.app";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? "mailto:admin@concournow.ma",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  locale: "ar" | "fr" | "en" = "fr",
  count: number = 1
) {
  const titles = {
    ar: "كونكورناو — مطابقات جديدة",
    fr: "ConcourNow — Nouvelles correspondances",
    en: "ConcourNow — New matches",
  };
  const bodies = {
    ar: `لديك ${count} مطابقات جديدة. انقر للاطلاع عليها.`,
    fr: `Vous avez ${count} nouvelles correspondances. Cliquez pour les voir.`,
    en: `You have ${count} new matches. Click to view them.`,
  };

  const payload = JSON.stringify({
    title: titles[locale],
    body: bodies[locale],
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    url: `${APP_URL}/${locale}/app/new-matches`,
  });

  await webpush.sendNotification(subscription as webpush.PushSubscription, payload);
}

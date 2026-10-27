import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@concournow.ma";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://concournow.vercel.app";

interface SendNewMatchesEmailParams {
  to: string;
  name: string;
  count: number;
  locale?: "ar" | "fr" | "en";
}

const translations = {
  ar: {
    subject: (count: number) => `لديك ${count} مطابقات جديدة في كونكورناو`,
    greeting: (name: string) => `مرحبا ${name}،`,
    body: (count: number) =>
      `لديك ${count} مطابقات جديدة لمناسبة ملفك الشخصي في موقع كونكورناو.`,
    cta: "عرض المطابقات الجديدة",
    footer: "إذا لم ترغب في استقبال هذه الرسائل، يمكنك تعطيل الإشعارات من إعدادات حسابك.",
  },
  fr: {
    subject: (count: number) =>
      `Vous avez ${count} nouvelles correspondances sur ConcourNow`,
    greeting: (name: string) => `Bonjour ${name},`,
    body: (count: number) =>
      `Vous avez ${count} nouvelles correspondances pour votre profil sur ConcourNow.`,
    cta: "Voir les nouvelles correspondances",
    footer:
      "Si vous ne souhaitez plus recevoir ces emails, désactivez les notifications dans vos paramètres.",
  },
  en: {
    subject: (count: number) =>
      `You have ${count} new matches on ConcourNow`,
    greeting: (name: string) => `Hello ${name},`,
    body: (count: number) =>
      `You have ${count} new job matches for your profile on ConcourNow.`,
    cta: "View new matches",
    footer:
      "If you no longer want to receive these emails, disable notifications in your settings.",
  },
};

export async function sendNewMatchesEmail({
  to,
  name,
  count,
  locale = "fr",
}: SendNewMatchesEmailParams) {
  const t = translations[locale];
  const url = `${APP_URL}/${locale}/app/new-matches`;

  const html = `
<!DOCTYPE html>
<html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t.subject(count)}</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f4f4f5; margin:0; padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:40px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <tr>
      <td style="background:#1d4ed8; padding:24px; text-align:center;">
        <h1 style="color:#fff; margin:0; font-size:24px;">ConcourNow</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 24px;">
        <p style="font-size:16px; color:#111;">${t.greeting(name)}</p>
        <p style="font-size:16px; color:#374151;">${t.body(count)}</p>
        <div style="text-align:center; margin:32px 0;">
          <a href="${url}" style="background:#1d4ed8; color:#fff; padding:14px 28px; border-radius:6px; text-decoration:none; font-size:16px; font-weight:600;">
            ${t.cta}
          </a>
        </div>
        <p style="font-size:13px; color:#9ca3af;">${t.footer}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 24px; border-top:1px solid #e5e7eb; text-align:center;">
        <p style="font-size:12px; color:#9ca3af; margin:0;">© ${new Date().getFullYear()} ConcourNow</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: t.subject(count),
    html,
  });
}

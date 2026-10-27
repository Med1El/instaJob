/**
 * ConcourNow Scraper
 * Runs as a standalone Node.js script via GitHub Actions.
 *
 * Usage:
 *   node scripts/scraper.mjs
 *   FIRST_RUN=true node scripts/scraper.mjs   (force 5 pages)
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   AI_PROVIDER, GEMINI_API_KEY / DEEPSEEK_API_KEY,
 *   RESEND_API_KEY, RESEND_FROM_EMAIL,
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT,
 *   NEXT_PUBLIC_APP_URL
 */

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { Resend } from "resend";

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = "https://www.emploi-public.ma/ar/قائمة-المباريات";
const DETAIL_BASE = "https://www.emploi-public.ma";
const MAX_FIRST_RUN_PAGES = 5;
const DUP_STOP_THRESHOLD = 3; // stop pagination if this many URLs on the page are already in DB
const PAGE_DELAY_MS = 2000; // polite delay between requests

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://concournow.vercel.app";

// ── AI helpers ────────────────────────────────────────────────────────────────

const SPECIALTIES_PROMPT = "0:Informatique/Réseaux, 1:Génie Civil, 2:Génie Électrique, 3:Génie Industriel, 4:Génie Mécanique, 5:Architecture, 6:Médecine/Santé, 7:Droit, 8:Économie/Gestion, 9:Finance/Comptabilité, 10:Littérature/Langues, 11:Sciences Éducation, 12:Sociologie/Psychologie, 13:Agronomie, 14:Autres, 20:Toutes";
const DIPLOMAS_PROMPT = "0:Bac+2, 1:Licence/Bac+3, 2:Master/Ingénieur/Bac+5, 3:Doctorat, 4:Tous";
const EXP_PROMPT = "0:Sans expérience, 1:0-2ans, 2:2-5ans, 3:5-10ans, 4:10+ans, 5:Tous";
const REGIONS_PROMPT = "0:Tanger-Tétouan-AlHoceïma, 1:Oriental, 2:Fès-Meknès, 3:Rabat-Salé-Kénitra, 4:BéniMellal-Khénifra, 5:Casablanca-Settat, 6:Marrakech-Safi, 7:Drâa-Tafilalet, 8:Souss-Massa, 9:Guelmim-OuedNoun, 10:Laâyoune-SakiaElHamra, 11:Dakhla-OuedEdDahab, 12:ToutesRégions";
const CITIES_PROMPT = "0:Casablanca, 1:Rabat, 2:Fès, 3:Marrakech, 4:Agadir, 5:Tanger, 6:Meknès, 7:Oujda, 8:Kénitra, 9:Tétouan, 10:Salé, 11:Nador, 12:BéniMellal, 13:Khénifra, 14:Khouribga, 15:Taza, 16:AlHoceïma, 17:Larache, 18:KsarElKébir, 19:Chefchaouen, 20:Asilah, 21:Ifrane, 22:Azrou, 23:Khémisset, 24:Skhirat, 25:Temara, 26:Mohammedia, 27:SidiKacem, 28:SoukElArbaa, 29:Inzegane, 30:Guelmim, 31:Tan-Tan, 32:Tiznit, 33:Tata, 34:Assa-Zag, 35:Laâyoune, 36:Boujdour, 37:Smara, 38:Dakhla, 39:Aousserd, 40:Settat, 41:Berrechid, 42:ElJadida, 43:Safi, 44:Essaouira, 45:Youssoufia, 46:Taroudant, 47:Ouarzazate, 48:Zagora, 49:Errachidia, 50:Midelt, 51:Tinghir, 52:Rich, 53:Figuig, 54:Berkane, 55:Taourirt, 56:Jerrada, 57:Bouarfa, 58:Ouezzane, 59:ToutesVilles";

const AI_PROMPT_TEMPLATE = `Tu es un analyseur d'offres d'emploi public marocain.
Analyse le texte de l'offre ci-dessous et détermine si elle convient pour chaque catégorie.

Réponds UNIQUEMENT avec une chaîne compressée au format strict (5 parties séparées par |) :
SPECIALTIES|DIPLOMAS|EXPERIENCE|REGIONS|CITIES

Règles :
- Si TOUS les éléments d'un groupe correspondent (ou si l'offre ne précise aucune restriction pour ce groupe), utilise uniquement le numéro "All" du groupe suivi de y (ex: 20y pour toutes spécialités, 4y pour tous diplômes, 5y pour toutes expériences, 12y pour toutes régions, 59y pour toutes villes).
- Sinon liste chaque ID pertinent du groupe suivi de y ou n.
- Pas d'espaces, pas de sauts de ligne. Exactement 5 parties séparées par |.

CATÉGORIES :
Spécialités: {SPECIALTIES}
Diplômes: {DIPLOMAS}
Expérience: {EXP}
Régions: {REGIONS}
Villes: {CITIES}

TEXTE DE L'OFFRE :
{TEXT}`;

async function callGemini(prompt) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

async function callDeepSeek(prompt) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 256,
      temperature: 0,
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function analyzeWithAI(jobText) {
  const prompt = AI_PROMPT_TEMPLATE
    .replace("{SPECIALTIES}", SPECIALTIES_PROMPT)
    .replace("{DIPLOMAS}", DIPLOMAS_PROMPT)
    .replace("{EXP}", EXP_PROMPT)
    .replace("{REGIONS}", REGIONS_PROMPT)
    .replace("{CITIES}", CITIES_PROMPT)
    .replace("{TEXT}", jobText.slice(0, 8000));

  const provider = process.env.AI_PROVIDER ?? "gemini";
  const raw = provider === "deepseek" ? await callDeepSeek(prompt) : await callGemini(prompt);
  return { raw, provider };
}

// ── Parser ─────────────────────────────────────────────────────────────────────

const ALL_IDS = {
  specialties: { allId: 20, specific: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14] },
  diplomas: { allId: 4, specific: [0,1,2,3] },
  exp: { allId: 5, specific: [0,1,2,3,4] },
  regions: { allId: 12, specific: [0,1,2,3,4,5,6,7,8,9,10,11] },
  cities: { allId: 59, specific: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58] },
};

function parsePart(part, specificIds, allId) {
  const trimmed = part.trim();
  if (new RegExp(`^${allId}y$`).test(trimmed)) {
    return [...specificIds, allId];
  }
  const matches = [];
  const tokenRegex = /(\d+)([yn])/g;
  let m;
  while ((m = tokenRegex.exec(trimmed)) !== null) {
    if (m[2] === "y") matches.push(parseInt(m[1], 10));
  }
  return matches;
}

function parseAiOutput(raw) {
  const cleaned = raw.replace(/```.*?```/gs, "").trim();
  const parts = cleaned.split("|");
  if (parts.length !== 5) throw new Error(`Invalid AI output (expected 5 parts): ${raw}`);

  const [specPart, dipPart, expPart, regPart, citPart] = parts;
  return {
    specialty_matches: parsePart(specPart, ALL_IDS.specialties.specific, ALL_IDS.specialties.allId),
    diploma_matches: parsePart(dipPart, ALL_IDS.diplomas.specific, ALL_IDS.diplomas.allId),
    exp_matches: parsePart(expPart, ALL_IDS.exp.specific, ALL_IDS.exp.allId),
    region_matches: parsePart(regPart, ALL_IDS.regions.specific, ALL_IDS.regions.allId),
    city_matches: parsePart(citPart, ALL_IDS.cities.specific, ALL_IDS.cities.allId),
  };
}

// ── Match Engine ───────────────────────────────────────────────────────────────

function userMatchesPost(user, analysis) {
  const spec = analysis.specialty_matches.includes(user.specialty_id) ||
               analysis.specialty_matches.includes(ALL_IDS.specialties.allId);
  const dip = analysis.diploma_matches.includes(user.diploma_id) ||
              analysis.diploma_matches.includes(ALL_IDS.diplomas.allId);
  const exp = (user.exp_range_ids ?? []).some(id => analysis.exp_matches.includes(id)) ||
              analysis.exp_matches.includes(ALL_IDS.exp.allId);
  const reg = analysis.region_matches.includes(user.region_id) ||
              analysis.region_matches.includes(ALL_IDS.regions.allId);
  const cit = analysis.city_matches.includes(user.city_id) ||
              analysis.city_matches.includes(ALL_IDS.cities.allId);
  return spec && dip && exp && reg && cit;
}

// ── Scraper ────────────────────────────────────────────────────────────────────

async function extractJobUrls(page) {
  return await page.evaluate(() => {
    const links = document.querySelectorAll(".s-item a[href]");
    return Array.from(links).map(a => a.getAttribute("href")).filter(Boolean);
  });
}

async function extractJobDetail(page, url) {
  await page.goto(`https://www.emploi-public.ma${url}`, {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  return await page.evaluate(() => {
    function getText(selector) {
      const el = document.querySelector(selector);
      return el ? el.textContent.trim() : null;
    }

    // Extract title from page title or h1
    const title = getText("h1") ?? getText(".s-banner h2") ?? document.title;

    // Sidebar details
    const sidebarItems = document.querySelectorAll(".s-content-box h3.h4");
    const sidebarData = {};
    sidebarItems.forEach(item => {
      const span = item.querySelector("span");
      if (span) {
        const label = span.textContent.trim();
        const value = item.textContent.replace(label, "").trim();
        sidebarData[label] = value;
      }
    });

    // Main content list items
    const listItems = document.querySelectorAll(".s-content-box.full ul li");
    const mainData = {};
    listItems.forEach(item => {
      const span = item.querySelector("span");
      const strong = item.querySelector("strong");
      if (span && strong) {
        const label = span.textContent.trim();
        const value = strong.textContent.trim();
        mainData[label] = value;
      }
    });

    // Full body text for AI analysis
    const bodyEl = document.querySelector(".s-content");
    const bodyText = bodyEl ? bodyEl.innerText : document.body.innerText;

    // Extract key fields
    const organization = sidebarData["الإدارة المنظمة"] ?? null;
    const deadline = sidebarData["آخر أجل لإيداع الترشيحات"] ?? null;
    const examDate = sidebarData["تاريخ إجراء المباراة"] ?? null;
    const publishedAt = sidebarData["تاريخ النشر"] ?? null;
    const specialty = mainData["تخصص :"] ?? null;
    const grade = mainData["الدرجة :"] ?? null;
    const positionsText = mainData["عدد المناصب :"] ?? null;
    const competitionCode = mainData["رمز المباراة :"] ?? null;

    function parseArabicDate(str) {
      if (!str) return null;
      const months = {
        "يناير": "01", "فبراير": "02", "مارس": "03", "أبريل": "04",
        "ماي": "05", "يونيو": "06", "يوليوز": "07", "غشت": "08",
        "شتنبر": "09", "أكتوبر": "10", "نونبر": "11", "دجنبر": "12",
      };
      const match = str.match(/(\d+)\s+(\S+)\s+(\d{4})/);
      if (!match) return null;
      const [, day, monthAr, year] = match;
      const month = months[monthAr];
      if (!month) return null;
      return `${year}-${month}-${day.padStart(2, "0")}`;
    }

    return {
      title: title.replace(/مباراة لتوظيف\s*/i, "").trim() || title,
      organization,
      deadline: parseArabicDate(deadline),
      exam_date: parseArabicDate(examDate),
      published_at: parseArabicDate(publishedAt),
      positions_count: positionsText ? parseInt(positionsText, 10) || null : null,
      competition_code: competitionCode?.trim() ?? null,
      body_text: bodyText.slice(0, 15000),
    };
  });
}

// ── Notifications ──────────────────────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY);

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? "mailto:admin@concournow.ma",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendNotifications(newPostIds) {
  if (newPostIds.length === 0) return;

  console.log(`[Notify] Sending notifications for ${newPostIds.length} new posts...`);

  // Find users with matches in this run (notified=false)
  const { data: matches } = await supabase
    .from("user_matches")
    .select("user_id, job_post_id")
    .in("job_post_id", newPostIds)
    .eq("notified", false);

  if (!matches || matches.length === 0) return;

  // Group by user
  const byUser = {};
  for (const m of matches) {
    if (!byUser[m.user_id]) byUser[m.user_id] = 0;
    byUser[m.user_id]++;
  }

  const userIds = Object.keys(byUser);
  const { data: users } = await supabase
    .from("users")
    .select("id, email, name, notification_prefs")
    .in("id", userIds)
    .eq("status", "active");

  if (!users) return;

  const notifiedUserIds = [];

  for (const user of users) {
    const count = byUser[user.id] ?? 0;
    const prefs = user.notification_prefs ?? { email: true, push: false };
    const locale = "fr"; // TODO: store locale preference per user

    // Email notification
    if (prefs.email && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? "noreply@concournow.ma",
          to: user.email,
          subject: `Vous avez ${count} nouvelles correspondances sur ConcourNow`,
          html: buildEmailHtml(user.name, count, locale),
        });
        console.log(`[Email] Sent to ${user.email} (${count} matches)`);
      } catch (err) {
        console.error(`[Email] Failed for ${user.email}:`, err.message);
      }
    }

    // Push notification
    if (prefs.push) {
      const { data: pushSubs } = await supabase
        .from("push_subscriptions")
        .select("subscription")
        .eq("user_id", user.id);

      for (const ps of (pushSubs ?? [])) {
        try {
          const payload = JSON.stringify({
            title: "ConcourNow — Nouvelles correspondances",
            body: `Vous avez ${count} nouvelles correspondances. Cliquez pour les voir.`,
            icon: "/icons/icon-192x192.png",
            badge: "/icons/badge-72x72.png",
            url: `${APP_URL}/${locale}/app/new-matches`,
          });
          await webpush.sendNotification(ps.subscription, payload);
          console.log(`[Push] Sent to user ${user.id}`);
        } catch (err) {
          console.error(`[Push] Failed for user ${user.id}:`, err.message);
          // If subscription is expired/invalid, remove it
          if (err.statusCode === 410) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("user_id", user.id);
          }
        }
      }
    }

    notifiedUserIds.push(user.id);
  }

  // Mark as notified
  if (newPostIds.length > 0) {
    await supabase
      .from("user_matches")
      .update({ notified: true })
      .in("job_post_id", newPostIds)
      .in("user_id", notifiedUserIds);
  }
}

function buildEmailHtml(name, count, locale) {
  const url = `${APP_URL}/${locale}/app/new-matches`;
  return `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f5;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
    <tr><td style="background:#1d4ed8;padding:24px;text-align:center;"><h1 style="color:#fff;margin:0;font-size:24px;">ConcourNow</h1></td></tr>
    <tr><td style="padding:32px 24px;">
      <p style="font-size:16px;color:#111;">Bonjour ${name},</p>
      <p style="font-size:16px;color:#374151;">Vous avez <strong>${count}</strong> nouvelles correspondances pour votre profil sur ConcourNow.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${url}" style="background:#1d4ed8;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:600;">Voir les nouvelles correspondances</a>
      </div>
      <p style="font-size:13px;color:#9ca3af;">Si vous ne souhaitez plus recevoir ces emails, désactivez les notifications dans vos paramètres.</p>
    </td></tr>
    <tr><td style="padding:16px 24px;border-top:1px solid #e5e7eb;text-align:center;"><p style="font-size:12px;color:#9ca3af;margin:0;">© ${new Date().getFullYear()} ConcourNow</p></td></tr>
  </table>
</body></html>`;
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log("[Scraper] Starting ConcourNow scraper...");

  // Determine if this is the first run
  const { count: existingCount } = await supabase
    .from("job_posts")
    .select("*", { count: "exact", head: true });

  const isFirstRun = process.env.FIRST_RUN === "true" || existingCount === 0;
  const maxPages = isFirstRun ? MAX_FIRST_RUN_PAGES : 999;
  const triggeredBy = process.env.TRIGGERED_BY === "manual" ? "manual" : "cron";

  console.log(`[Scraper] Mode: ${isFirstRun ? "FIRST RUN" : "incremental"}, max pages: ${isFirstRun ? maxPages : "until 3 dups"}`);

  // Create scrape_run record
  const { data: runRecord } = await supabase
    .from("scrape_runs")
    .insert({ triggered_by: triggeredBy, status: "running" })
    .select()
    .single();

  const runId = runRecord?.id;

  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (compatible; ConcourNowBot/1.0; +https://concournow.ma)",
    locale: "ar-MA",
  });
  const page = await context.newPage();

  let totalFound = 0;
  let totalNew = 0;
  const newPostIds = [];

  try {
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `${BASE_URL}?page=${pageNum}`;
      console.log(`[Scraper] Loading page ${pageNum}: ${url}`);

      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

      // Wait for job cards to render
      await page.waitForSelector(".s-item", { timeout: 15000 }).catch(() => {
        console.warn(`[Scraper] No .s-item found on page ${pageNum}, may be last page`);
      });

      const hrefs = await extractJobUrls(page);

      if (hrefs.length === 0) {
        console.log(`[Scraper] No URLs found on page ${pageNum}, stopping.`);
        break;
      }

      console.log(`[Scraper] Found ${hrefs.length} URLs on page ${pageNum}`);
      totalFound += hrefs.length;

      // Check which URLs are already in DB
      const { data: existing } = await supabase
        .from("job_posts")
        .select("url")
        .in("url", hrefs.map(h => `${DETAIL_BASE}${h}`));

      const existingUrls = new Set((existing ?? []).map(r => r.url));

      let dupCount = 0;
      let shouldStop = false;

      for (const href of hrefs) {
        const fullUrl = `${DETAIL_BASE}${href}`;

        if (existingUrls.has(fullUrl)) {
          dupCount++;
          console.log(`[Scraper] DUP (${dupCount}/${DUP_STOP_THRESHOLD}): ${fullUrl}`);
          if (!isFirstRun && dupCount >= DUP_STOP_THRESHOLD) {
            console.log(`[Scraper] Hit ${DUP_STOP_THRESHOLD} duplicates on page ${pageNum}, stopping pagination.`);
            shouldStop = true;
            break;
          }
          continue;
        }

        // Scrape the detail page
        console.log(`[Scraper] NEW: ${fullUrl}`);

        let detail;
        try {
          detail = await extractJobDetail(page, href);
          await page.waitForTimeout(PAGE_DELAY_MS);
        } catch (err) {
          console.error(`[Scraper] Failed to scrape ${fullUrl}:`, err.message);
          continue;
        }

        // Save job post
        const { data: postData, error: postError } = await supabase
          .from("job_posts")
          .insert({
            url: fullUrl,
            title: detail.title,
            organization: detail.organization,
            body_text: detail.body_text,
            deadline: detail.deadline,
            exam_date: detail.exam_date,
            published_at: detail.published_at,
            positions_count: detail.positions_count,
            competition_code: detail.competition_code,
            source_page: pageNum,
          })
          .select()
          .single();

        if (postError) {
          console.error(`[Scraper] DB insert failed for ${fullUrl}:`, postError.message);
          continue;
        }

        const postId = postData.id;
        totalNew++;

        // AI analysis
        let analysis;
        try {
          const { raw, provider } = await analyzeWithAI(detail.body_text);
          const parsed = parseAiOutput(raw);

          await supabase.from("ai_analyses").insert({
            job_post_id: postId,
            raw_output: raw,
            specialty_matches: parsed.specialty_matches,
            diploma_matches: parsed.diploma_matches,
            exp_matches: parsed.exp_matches,
            region_matches: parsed.region_matches,
            city_matches: parsed.city_matches,
            ai_provider: provider,
          });

          analysis = parsed;
          console.log(`[AI] Analyzed ${postId}: ${raw}`);
        } catch (err) {
          console.error(`[AI] Analysis failed for ${postId}:`, err.message);
          continue;
        }

        // Match engine
        const { data: activeUsers } = await supabase
          .from("users")
          .select("id, specialty_id, diploma_id, exp_range_ids, region_id, city_id")
          .eq("status", "active")
          .not("specialty_id", "is", null)
          .not("diploma_id", "is", null)
          .not("region_id", "is", null)
          .not("city_id", "is", null);

        const matchInserts = [];
        for (const user of (activeUsers ?? [])) {
          if (userMatchesPost(user, analysis)) {
            matchInserts.push({
              user_id: user.id,
              job_post_id: postId,
              notified: false,
            });
          }
        }

        if (matchInserts.length > 0) {
          await supabase
            .from("user_matches")
            .upsert(matchInserts, { onConflict: "user_id,job_post_id", ignoreDuplicates: true });
          console.log(`[Match] ${matchInserts.length} users matched post ${postId}`);
          newPostIds.push(postId);
        }
      }

      if (shouldStop) break;

      // Small delay between pages
      await new Promise(r => setTimeout(r, PAGE_DELAY_MS));
    }

    // Update scrape run
    await supabase
      .from("scrape_runs")
      .update({
        finished_at: new Date().toISOString(),
        posts_found: totalFound,
        posts_new: totalNew,
        status: "complete",
      })
      .eq("id", runId);

    console.log(`[Scraper] Done. Found: ${totalFound}, New: ${totalNew}`);

    // Send notifications
    await sendNotifications(newPostIds);

  } catch (err) {
    console.error("[Scraper] Fatal error:", err);
    await supabase
      .from("scrape_runs")
      .update({
        finished_at: new Date().toISOString(),
        status: "error",
        error_message: err.message,
        posts_found: totalFound,
        posts_new: totalNew,
      })
      .eq("id", runId);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);

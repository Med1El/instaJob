// ============================================================
// CATEGORIES — single source of truth, hardcoded per spec
// IDs must never be reused once assigned.
// To add items: append before the "All" entry.
// "All" entries use the next round number (20, 4, 5, 12, 59)
// to leave room for future additions.
// ============================================================

export const SPECIALTIES = [
  { id: 0, label: { ar: "إعلاميات وشبكات", fr: "Informatique et Réseaux", en: "IT & Networks" } },
  { id: 1, label: { ar: "هندسة مدنية", fr: "Génie Civil", en: "Civil Engineering" } },
  { id: 2, label: { ar: "هندسة كهربائية", fr: "Génie Électrique", en: "Electrical Engineering" } },
  { id: 3, label: { ar: "هندسة صناعية", fr: "Génie Industriel", en: "Industrial Engineering" } },
  { id: 4, label: { ar: "هندسة ميكانيكية", fr: "Génie Mécanique", en: "Mechanical Engineering" } },
  { id: 5, label: { ar: "هندسة معمارية وتعمير", fr: "Architecture et Urbanisme", en: "Architecture & Urban Planning" } },
  { id: 6, label: { ar: "طب وعلوم الصحة", fr: "Médecine / Sciences de la Santé", en: "Medicine / Health Sciences" } },
  { id: 7, label: { ar: "قانون وعلوم قانونية", fr: "Droit / Sciences Juridiques", en: "Law / Legal Sciences" } },
  { id: 8, label: { ar: "اقتصاد وتدبير", fr: "Économie / Gestion", en: "Economics / Management" } },
  { id: 9, label: { ar: "مالية ومحاسبة", fr: "Finance / Comptabilité", en: "Finance / Accounting" } },
  { id: 10, label: { ar: "آداب ولغات", fr: "Littérature / Langues", en: "Literature / Languages" } },
  { id: 11, label: { ar: "علوم التربية والتعليم", fr: "Sciences de l'Éducation", en: "Education Sciences" } },
  { id: 12, label: { ar: "علم الاجتماع وعلم النفس", fr: "Sociologie / Psychologie", en: "Sociology / Psychology" } },
  { id: 13, label: { ar: "فلاحة وبيئة", fr: "Agronomie / Environnement", en: "Agronomy / Environment" } },
  { id: 14, label: { ar: "أخرى / غير محدد", fr: "Autres / Non spécifié", en: "Other / Unspecified" } },
  // IDs 15–19 reserved for future specialties
  { id: 20, label: { ar: "جميع التخصصات", fr: "Toutes spécialités", en: "All Specialties" }, isAll: true },
] as const;

export const DIPLOMAS = [
  { id: 0, label: { ar: "بكالوريا+2 (تقني)", fr: "Bac+2 (Technicien)", en: "Bac+2 (Technician)" } },
  { id: 1, label: { ar: "إجازة / بكالوريا+3", fr: "Licence / Bac+3", en: "Bachelor / Bac+3" } },
  { id: 2, label: { ar: "ماستر / مهندس دولة / بكالوريا+5", fr: "Master / Ingénieur d'État / Bac+5", en: "Master / State Engineer / Bac+5" } },
  { id: 3, label: { ar: "دكتوراه / بكالوريا+8", fr: "Doctorat / Bac+8", en: "Doctorate / Bac+8" } },
  { id: 4, label: { ar: "جميع المستويات", fr: "Tous niveaux", en: "All Levels" }, isAll: true },
] as const;

export const EXPERIENCE_RANGES = [
  { id: 0, label: { ar: "بدون خبرة (0 سنة)", fr: "Sans expérience (0 an)", en: "No experience (0 years)" } },
  { id: 1, label: { ar: "0 إلى 2 سنوات", fr: "0–2 ans", en: "0–2 years" } },
  { id: 2, label: { ar: "2 إلى 5 سنوات", fr: "2–5 ans", en: "2–5 years" } },
  { id: 3, label: { ar: "5 إلى 10 سنوات", fr: "5–10 ans", en: "5–10 years" } },
  { id: 4, label: { ar: "أكثر من 10 سنوات", fr: "10+ ans", en: "10+ years" } },
  { id: 5, label: { ar: "جميع سنوات الخبرة", fr: "Toutes expériences", en: "All Experience Levels" }, isAll: true },
] as const;

export const REGIONS = [
  { id: 0, label: { ar: "طنجة-تطوان-الحسيمة", fr: "Tanger-Tétouan-Al Hoceïma", en: "Tanger-Tetouan-Al Hoceima" } },
  { id: 1, label: { ar: "الشرق", fr: "Oriental", en: "Oriental" } },
  { id: 2, label: { ar: "فاس-مكناس", fr: "Fès-Meknès", en: "Fez-Meknes" } },
  { id: 3, label: { ar: "الرباط-سلا-القنيطرة", fr: "Rabat-Salé-Kénitra", en: "Rabat-Sale-Kenitra" } },
  { id: 4, label: { ar: "بني ملال-خنيفرة", fr: "Béni Mellal-Khénifra", en: "Beni Mellal-Khenifra" } },
  { id: 5, label: { ar: "الدار البيضاء-سطات", fr: "Casablanca-Settat", en: "Casablanca-Settat" } },
  { id: 6, label: { ar: "مراكش-آسفي", fr: "Marrakech-Safi", en: "Marrakech-Safi" } },
  { id: 7, label: { ar: "درعة-تافيلالت", fr: "Drâa-Tafilalet", en: "Draa-Tafilalet" } },
  { id: 8, label: { ar: "سوس-ماسة", fr: "Souss-Massa", en: "Souss-Massa" } },
  { id: 9, label: { ar: "كلميم-واد نون", fr: "Guelmim-Oued Noun", en: "Guelmim-Oued Noun" } },
  { id: 10, label: { ar: "العيون-الساقية الحمراء", fr: "Laâyoune-Sakia El Hamra", en: "Laayoune-Sakia El Hamra" } },
  { id: 11, label: { ar: "الداخلة-وادي الذهب", fr: "Dakhla-Oued Ed-Dahab", en: "Dakhla-Oued Ed-Dahab" } },
  { id: 12, label: { ar: "جميع الجهات", fr: "Toutes régions", en: "All Regions" }, isAll: true },
] as const;

export const CITIES = [
  { id: 0, label: "Casablanca / الدار البيضاء", regionId: 5 },
  { id: 1, label: "Rabat / الرباط", regionId: 3 },
  { id: 2, label: "Fès / فاس", regionId: 2 },
  { id: 3, label: "Marrakech / مراكش", regionId: 6 },
  { id: 4, label: "Agadir / أكادير", regionId: 8 },
  { id: 5, label: "Tanger / طنجة", regionId: 0 },
  { id: 6, label: "Meknès / مكناس", regionId: 2 },
  { id: 7, label: "Oujda / وجدة", regionId: 1 },
  { id: 8, label: "Kénitra / القنيطرة", regionId: 3 },
  { id: 9, label: "Tétouan / تطوان", regionId: 0 },
  { id: 10, label: "Salé / سلا", regionId: 3 },
  { id: 11, label: "Nador / الناظور", regionId: 1 },
  { id: 12, label: "Béni Mellal / بني ملال", regionId: 4 },
  { id: 13, label: "Khénifra / خنيفرة", regionId: 4 },
  { id: 14, label: "Khouribga / خريبكة", regionId: 4 },
  { id: 15, label: "Taza / تازة", regionId: 2 },
  { id: 16, label: "Al Hoceïma / الحسيمة", regionId: 0 },
  { id: 17, label: "Larache / العرائش", regionId: 0 },
  { id: 18, label: "Ksar El Kébir / القصر الكبير", regionId: 0 },
  { id: 19, label: "Chefchaouen / شفشاون", regionId: 0 },
  { id: 20, label: "Asilah / أصيلة", regionId: 0 },
  { id: 21, label: "Ifrane / إفران", regionId: 2 },
  { id: 22, label: "Azrou / أزرو", regionId: 2 },
  { id: 23, label: "Khémisset / الخميسات", regionId: 3 },
  { id: 24, label: "Skhirat / الصخيرات", regionId: 3 },
  { id: 25, label: "Temara / تمارة", regionId: 3 },
  { id: 26, label: "Mohammedia / المحمدية", regionId: 5 },
  { id: 27, label: "Sidi Kacem / سيدي قاسم", regionId: 3 },
  { id: 28, label: "Souk El Arbaa / سوق الأربعاء", regionId: 3 },
  { id: 29, label: "Inzegane / إنزكان", regionId: 8 },
  { id: 30, label: "Guelmim / كلميم", regionId: 9 },
  { id: 31, label: "Tan-Tan / طانطان", regionId: 9 },
  { id: 32, label: "Tiznit / تيزنيت", regionId: 8 },
  { id: 33, label: "Tata / تاتا", regionId: 8 },
  { id: 34, label: "Assa-Zag / اسا الزاك", regionId: 9 },
  { id: 35, label: "Laâyoune / العيون", regionId: 10 },
  { id: 36, label: "Boujdour / بوجدور", regionId: 10 },
  { id: 37, label: "Smara / السمارة", regionId: 10 },
  { id: 38, label: "Dakhla / الداخلة", regionId: 11 },
  { id: 39, label: "Aousserd / أوسرد", regionId: 11 },
  { id: 40, label: "Settat / سطات", regionId: 5 },
  { id: 41, label: "Berrechid / برشيد", regionId: 5 },
  { id: 42, label: "El Jadida / الجديدة", regionId: 5 },
  { id: 43, label: "Safi / آسفي", regionId: 6 },
  { id: 44, label: "Essaouira / الصويرة", regionId: 6 },
  { id: 45, label: "Youssoufia / اليوسفية", regionId: 6 },
  { id: 46, label: "Taroudant / تارودانت", regionId: 8 },
  { id: 47, label: "Ouarzazate / ورزازات", regionId: 7 },
  { id: 48, label: "Zagora / زاكورة", regionId: 7 },
  { id: 49, label: "Errachidia / الراشيدية", regionId: 7 },
  { id: 50, label: "Midelt / ميدلت", regionId: 7 },
  { id: 51, label: "Tinghir / تنغير", regionId: 7 },
  { id: 52, label: "Rich / الريش", regionId: 7 },
  { id: 53, label: "Figuig / فجيج", regionId: 1 },
  { id: 54, label: "Berkane / بركان", regionId: 1 },
  { id: 55, label: "Taourirt / تاوريرت", regionId: 1 },
  { id: 56, label: "Jerrada / جرادة", regionId: 1 },
  { id: 57, label: "Bouarfa / بوعرفة", regionId: 1 },
  { id: 58, label: "Ouezzane / وزان", regionId: 0 },
  // ID 59 = All Cities
  { id: 59, label: "جميع المدن / Toutes les villes / All Cities", regionId: -1, isAll: true },
] as const;

// ── Helper types ──────────────────────────────────────────
export type SpecialtyId = (typeof SPECIALTIES)[number]["id"];
export type DiplomaId = (typeof DIPLOMAS)[number]["id"];
export type ExperienceId = (typeof EXPERIENCE_RANGES)[number]["id"];
export type RegionId = (typeof REGIONS)[number]["id"];
export type CityId = (typeof CITIES)[number]["id"];

// "All" sentinel IDs
export const ALL_SPECIALTY_ID = 20;
export const ALL_DIPLOMA_ID = 4;
export const ALL_EXPERIENCE_ID = 5;
export const ALL_REGION_ID = 12;
export const ALL_CITY_ID = 59;

// Non-all specialty IDs (0–14)
export const SPECIFIC_SPECIALTY_IDS = SPECIALTIES
  .filter((s) => !("isAll" in s))
  .map((s) => s.id);

export const SPECIFIC_DIPLOMA_IDS = DIPLOMAS
  .filter((d) => !("isAll" in d))
  .map((d) => d.id);

export const SPECIFIC_EXPERIENCE_IDS = EXPERIENCE_RANGES
  .filter((e) => !("isAll" in e))
  .map((e) => e.id);

export const SPECIFIC_REGION_IDS = REGIONS
  .filter((r) => !("isAll" in r))
  .map((r) => r.id);

export const SPECIFIC_CITY_IDS = CITIES
  .filter((c) => !("isAll" in c))
  .map((c) => c.id);

// ── AI Prompt helpers ─────────────────────────────────────

/** Build the compact category list string for the AI prompt */
export function buildAiCategoryList(): string {
  const spec = SPECIALTIES.map((s) => `${s.id}:${s.label.fr}`).join(", ");
  const dip = DIPLOMAS.map((d) => `${d.id}:${d.label.fr}`).join(", ");
  const exp = EXPERIENCE_RANGES.map((e) => `${e.id}:${e.label.fr}`).join(", ");
  const reg = REGIONS.map((r) => `${r.id}:${r.label.fr}`).join(", ");
  const cit = CITIES.map((c) => `${c.id}:${c.label}`).join(", ");
  return `SPECIALTIES: ${spec}\nDIPLOMAS: ${dip}\nEXPERIENCE: ${exp}\nREGIONS: ${reg}\nCITIES: ${cit}`;
}

// ── AI Output Parser ──────────────────────────────────────

export interface ParsedAnalysis {
  specialtyMatches: number[];
  diplomaMatches: number[];
  expMatches: number[];
  regionMatches: number[];
  cityMatches: number[];
}

/**
 * Parse the AI compressed output string.
 * Format: SPECIALTIES_PART|DIPLOMAS_PART|EXPERIENCE_PART|REGIONS_PART|CITIES_PART
 *
 * Each part is either:
 *   - A single "All" shortcut: e.g. "20y" (means all IDs in that group match)
 *   - A list of "IDy" or "IDn" tokens: e.g. "0y1n2y3n..."
 */
export function parseAiOutput(raw: string): ParsedAnalysis {
  const parts = raw.trim().split("|");
  if (parts.length !== 5) {
    throw new Error(`Invalid AI output format (expected 5 parts): ${raw}`);
  }

  const [specPart, dipPart, expPart, regPart, citPart] = parts;

  return {
    specialtyMatches: parsePart(specPart, SPECIFIC_SPECIALTY_IDS, ALL_SPECIALTY_ID),
    diplomaMatches: parsePart(dipPart, SPECIFIC_DIPLOMA_IDS, ALL_DIPLOMA_ID),
    expMatches: parsePart(expPart, SPECIFIC_EXPERIENCE_IDS, ALL_EXPERIENCE_ID),
    regionMatches: parsePart(regPart, SPECIFIC_REGION_IDS, ALL_REGION_ID),
    cityMatches: parsePart(citPart, SPECIFIC_CITY_IDS, ALL_CITY_ID),
  };
}

function parsePart(part: string, specificIds: readonly number[], allId: number): number[] {
  // Check for "All" shortcut
  const allShortcut = new RegExp(`^${allId}y$`);
  if (allShortcut.test(part.trim())) {
    // Return all specific IDs + the All ID
    return [...specificIds, allId];
  }

  // Parse individual tokens: e.g. "0y1n2y3n"
  const matches: number[] = [];
  const tokenRegex = /(\d+)([yn])/g;
  let m: RegExpExecArray | null;
  while ((m = tokenRegex.exec(part)) !== null) {
    const id = parseInt(m[1], 10);
    const match = m[2] === "y";
    if (match) matches.push(id);
  }
  return matches;
}

// ── Match Engine ──────────────────────────────────────────

export interface UserProfile {
  specialtyId: number;
  diplomaId: number;
  expRangeIds: number[];
  regionId: number;
  cityId: number;
}

/**
 * Returns true if the user's profile matches the AI analysis for a job post.
 * All 5 criteria must match.
 */
export function doesUserMatchPost(profile: UserProfile, analysis: ParsedAnalysis): boolean {
  const specialtyMatch =
    analysis.specialtyMatches.includes(profile.specialtyId) ||
    analysis.specialtyMatches.includes(ALL_SPECIALTY_ID);

  const diplomaMatch =
    analysis.diplomaMatches.includes(profile.diplomaId) ||
    analysis.diplomaMatches.includes(ALL_DIPLOMA_ID);

  const expMatch =
    profile.expRangeIds.some((eid) => analysis.expMatches.includes(eid)) ||
    analysis.expMatches.includes(ALL_EXPERIENCE_ID);

  const regionMatch =
    analysis.regionMatches.includes(profile.regionId) ||
    analysis.regionMatches.includes(ALL_REGION_ID);

  const cityMatch =
    analysis.cityMatches.includes(profile.cityId) ||
    analysis.cityMatches.includes(ALL_CITY_ID);

  return specialtyMatch && diplomaMatch && expMatch && regionMatch && cityMatch;
}

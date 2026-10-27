import {
  buildAiCategoryList,
  parseAiOutput,
  type ParsedAnalysis,
} from "@/lib/categories";

const PROMPT_TEMPLATE = `Tu es un analyseur d'offres d'emploi public marocain.
Analyse le texte de l'offre ci-dessous et détermine si elle convient pour chaque catégorie.

Réponds UNIQUEMENT avec une chaîne compressée au format strict :
SPECIALTIES|DIPLOMAS|EXPERIENCE|REGIONS|CITIES

Règles :
- Si TOUS les éléments d'un groupe correspondent (ou si l'offre ne précise aucune restriction pour ce groupe), utilise uniquement le numéro "All" du groupe suivi de y (ex: 20y pour toutes spécialités, 4y pour tous diplômes, 5y pour toutes expériences, 12y pour toutes régions, 59y pour toutes villes).
- Sinon liste chaque ID pertinent du groupe suivi de y ou n.
- Pas d'espaces, pas de sauts de ligne dans la réponse.
- La réponse doit contenir exactement 5 parties séparées par |.

CATÉGORIES DISPONIBLES :
{{CATEGORIES}}

TEXTE DE L'OFFRE :
{{JOB_TEXT}}`;

export async function analyzeJobPost(jobText: string): Promise<{
  rawOutput: string;
  parsed: ParsedAnalysis;
  provider: string;
}> {
  const provider = process.env.AI_PROVIDER ?? "gemini";
  const categories = buildAiCategoryList();
  const prompt = PROMPT_TEMPLATE.replace("{{CATEGORIES}}", categories).replace(
    "{{JOB_TEXT}}",
    jobText.slice(0, 8000) // cap to avoid token limits on free tiers
  );

  let rawOutput: string;

  if (provider === "deepseek") {
    rawOutput = await callDeepSeek(prompt);
  } else {
    rawOutput = await callGemini(prompt);
  }

  // Clean up in case the model adds extra whitespace or markdown
  rawOutput = rawOutput.trim().replace(/```[\s\S]*?```/g, "").trim();

  const parsed = parseAiOutput(rawOutput);
  return { rawOutput, parsed, provider };
}

async function callGemini(prompt: string): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function callDeepSeek(prompt: string): Promise<string> {
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

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content as string;
}

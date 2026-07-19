import axios from "axios";
import fs from "fs";
import path from "path";

// pdf-parse does not ship useful TypeScript declarations in this workspace.
// Using require keeps the runtime behavior intact without blocking ts-node.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse") as (dataBuffer: Buffer) => Promise<{ text: string }>;

type AtsAnalysisInput = {
  resumeText: string;
  resumeFilePath?: string;
  jobTitle: string;
  jobDescription?: string;
  requiredSkills?: string[];
  companyName?: string;
};

export type AtsAnalysisResult = {
  score: number;
  verdict: "strong_match" | "match" | "maybe" | "no_match";
  summary: string;
  strengths: string[];
  gaps: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  scoreBreakdown: {
    skillMatch: number;
    experienceRelevance: number;
    educationFit: number;
  };
  confidence: "high" | "medium" | "low";
  whyRejected: string[];
  recommendation: string;
  source: "gemini" | "fallback";
};

export type ResumePreviewInput = {
  resumeText?: string;
  resumeFilePath?: string;
};

const GEMINI_MODEL = "gemini-2.0-flash";

function clampScore(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function dedupe(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function clampUnit(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function resolveLocalResumePath(filePath?: string) {
  if (!filePath) return null;

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return null;
  }

  const normalized = filePath.replace(/\\/g, "/");
  if (normalized.startsWith("/uploads/") || normalized.startsWith("uploads/")) {
    const relativePath = normalized.startsWith("/") ? normalized.slice(1) : normalized;
    return path.join(process.cwd(), relativePath);
  }

  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  return null;
}

async function loadResumeTextFromPdf(filePath?: string) {
  const absolutePath = resolveLocalResumePath(filePath);
  if (!absolutePath) return "";

  try {
    const fileBuffer = await fs.promises.readFile(absolutePath);
    const parsed = await pdfParse(fileBuffer);
    return typeof parsed.text === "string" ? parsed.text.trim() : "";
  } catch {
    return "";
  }
}

async function generateSkillsPreviewFromGemini(resumeText: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "";

  const prompt = [
    "You are helping format a resume preview for a campus recruitment dashboard.",
    "Extract the most relevant skills, tools, and technologies from the resume text.",
    "Return ONLY valid JSON with exactly these keys: skills (string array), summary (string).",
    "Keep skills concise and deduplicated. The summary should be one short sentence.",
    `Resume text: ${resumeText}`,
  ].join("\n\n");

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 256,
        },
      },
      {
        timeout: 20000,
      }
    );

    const responseText =
      response.data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("\n") || "";

    const payload = extractJsonPayload(responseText);
    if (!payload) return "";

    const parsed = JSON.parse(payload) as { skills?: unknown; summary?: unknown };
    const skills = normalizeArray(parsed.skills).slice(0, 8);
    const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";

    const lines: string[] = [];
    if (skills.length) lines.push(`Skills: ${skills.join(", ")}`);
    if (summary) lines.push(`Summary: ${summary}`);

    return lines.join("\n").trim();
  } catch {
    return "";
  }
}

export async function buildResumePreview(input: ResumePreviewInput): Promise<string> {
  const effectiveResumeText = normalizeWhitespace(
    input.resumeText?.trim() || (await loadResumeTextFromPdf(input.resumeFilePath))
  );

  if (!effectiveResumeText) return "";

  if (effectiveResumeText.length <= 220) {
    return effectiveResumeText;
  }

  const skillsPreview = await generateSkillsPreviewFromGemini(effectiveResumeText);
  if (skillsPreview) return skillsPreview;

  return effectiveResumeText.slice(0, 220).trim();
}

function buildFallbackAnalysis(input: AtsAnalysisInput): AtsAnalysisResult {
  const resumeText = input.resumeText.toLowerCase();
  const keywords = dedupe([
    input.jobTitle,
    ...(input.requiredSkills || []),
    ...(input.jobDescription || "").split(/[^a-zA-Z0-9#+.-]+/),
  ]).filter((keyword) => keyword.length > 2);

  const matchedKeywords = keywords.filter((keyword) => resumeText.includes(keyword.toLowerCase()));
  const skillCoverage = keywords.length > 0 ? matchedKeywords.length / keywords.length : 0;

  const resumeLength = input.resumeText.trim().length;
  const experienceRelevance = clampUnit(Math.min(resumeLength / 1800, 1) * 0.7 + skillCoverage * 0.3);
  const educationSignals = ["cgpa", "gpa", "b.e", "btech", "bachelor", "degree", "college"];
  const educationMatches = educationSignals.filter((keyword) => resumeText.includes(keyword)).length;
  const educationFit = clampUnit(educationMatches / educationSignals.length);

  const weightedScore = skillCoverage * 50 + experienceRelevance * 30 + educationFit * 20;
  const score = clampScore(weightedScore);

  let verdict: AtsAnalysisResult["verdict"] = "maybe";
  if (score >= 85) verdict = "strong_match";
  else if (score >= 70) verdict = "match";
  else if (score < 50) verdict = "no_match";

  const missingKeywords = keywords.filter((keyword) => !matchedKeywords.includes(keyword));
  const confidence: AtsAnalysisResult["confidence"] =
    score >= 80 ? "high" : score >= 55 ? "medium" : "low";
  const whyRejected =
    verdict === "no_match"
      ? [
          missingKeywords.length
            ? `Missing required skills: ${missingKeywords.slice(0, 5).join(", ")}`
            : "Low evidence of role-relevant skills.",
          educationFit < 0.25
            ? "Resume has weak education-fit signals for screening criteria."
            : "Education requirements not clearly demonstrated.",
        ]
      : [];

  return {
    score,
    verdict,
    summary: `Fallback ATS scan for ${input.companyName || "the company"} matched ${matchedKeywords.length} of ${keywords.length} keywords from the role description and resume text.`,
    strengths: matchedKeywords.slice(0, 5),
    gaps: missingKeywords.slice(0, 5),
    matchedKeywords: matchedKeywords.slice(0, 10),
    missingKeywords: missingKeywords.slice(0, 10),
    scoreBreakdown: {
      skillMatch: clampScore(skillCoverage * 100),
      experienceRelevance: clampScore(experienceRelevance * 100),
      educationFit: clampScore(educationFit * 100),
    },
    confidence,
    whyRejected,
    recommendation:
      verdict === "strong_match" || verdict === "match"
        ? "Shortlist this candidate for the next interview round."
        : "Review manually before shortlisting.",
    source: "fallback",
  };
}

function extractJsonPayload(text: string): string | null {
  const trimmed = text.trim();
  const codeBlockMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
  if (codeBlockMatch?.[1]) return codeBlockMatch[1].trim();

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return null;
}

function normalizeArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return dedupe(
    values
      .map((value) => (typeof value === "string" ? value : ""))
      .filter(Boolean)
  );
}

function normalizeGeminiResult(rawText: string, fallback: AtsAnalysisResult): AtsAnalysisResult {
  const payload = extractJsonPayload(rawText);
  if (!payload) return fallback;

  try {
    const parsed = JSON.parse(payload) as Partial<AtsAnalysisResult>;
    const score = clampScore(typeof parsed.score === "number" ? parsed.score : fallback.score);
    const verdict =
      parsed.verdict === "strong_match" ||
      parsed.verdict === "match" ||
      parsed.verdict === "maybe" ||
      parsed.verdict === "no_match"
        ? parsed.verdict
        : fallback.verdict;

    return {
      score,
      verdict,
      summary: typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary.trim() : fallback.summary,
      strengths: normalizeArray(parsed.strengths),
      gaps: normalizeArray(parsed.gaps),
      matchedKeywords: normalizeArray(parsed.matchedKeywords),
      recommendation:
        typeof parsed.recommendation === "string" && parsed.recommendation.trim()
          ? parsed.recommendation.trim()
          : fallback.recommendation,
      missingKeywords: normalizeArray(parsed.missingKeywords).slice(0, 10),
      scoreBreakdown: {
        skillMatch: clampScore((parsed.scoreBreakdown as any)?.skillMatch ?? fallback.scoreBreakdown.skillMatch),
        experienceRelevance: clampScore((parsed.scoreBreakdown as any)?.experienceRelevance ?? fallback.scoreBreakdown.experienceRelevance),
        educationFit: clampScore((parsed.scoreBreakdown as any)?.educationFit ?? fallback.scoreBreakdown.educationFit),
      },
      confidence:
        parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
          ? parsed.confidence
          : fallback.confidence,
      whyRejected: normalizeArray(parsed.whyRejected).slice(0, 5),
      source: "gemini",
    };
  } catch {
    return fallback;
  }
}

export const analyzeResumeForAts = async (
  input: AtsAnalysisInput
): Promise<AtsAnalysisResult> => {
  const effectiveResumeText = normalizeWhitespace(
    input.resumeText.trim() || (await loadResumeTextFromPdf(input.resumeFilePath))
  );
  const fallback = buildFallbackAnalysis({
    ...input,
    resumeText: effectiveResumeText || input.resumeText,
  });
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return fallback;
  }

  const prompt = [
    `You are an ATS engine for a campus recruitment platform.`,
    `Evaluate this resume for the role: ${input.jobTitle}.`,
    input.companyName ? `Company: ${input.companyName}.` : "",
    input.jobDescription ? `Job description: ${input.jobDescription}` : "",
    input.requiredSkills?.length ? `Required skills: ${input.requiredSkills.join(", ")}.` : "",
    `Resume text: ${effectiveResumeText || input.resumeText}`,
    `Return ONLY valid JSON with exactly these keys: score (0-100 number), verdict (one of strong_match, match, maybe, no_match), summary (string), strengths (string array), gaps (string array), matchedKeywords (string array), missingKeywords (string array), scoreBreakdown (object with skillMatch, experienceRelevance, educationFit as 0-100), confidence (high|medium|low), whyRejected (string array), recommendation (string).`,
    `Be strict and prioritize clear fit for the role.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 512,
        },
      },
      {
        timeout: 20000,
      }
    );

    const responseText =
      response.data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("\n") || "";

    return normalizeGeminiResult(responseText, fallback);
  } catch {
    return fallback;
  }
};

export type ResumeFeedbackResult = {
  summary: string;
  formattingTips: string[];
  skillEnhancements: string[];
  projectSuggestions: string[];
  layoutAdvice: string[];
};

export const generateResumeFeedback = async (resumeText: string): Promise<ResumeFeedbackResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallback: ResumeFeedbackResult = {
    summary: "Your resume contains standard academic and project descriptions.",
    formattingTips: [
      "Ensure headings are prominent and distinct from body copy.",
      "Use clear bullet points for readability rather than paragraphs."
    ],
    skillEnhancements: [
      "Group your skills by categories (e.g. Languages, Libraries, Tools) to make it scannable.",
      "Add context to skills by listing where you applied them."
    ],
    projectSuggestions: [
      "Quantify your results using metrics (e.g., 'improved performance by 20%').",
      "Mention the design patterns or databases you selected and why."
    ],
    layoutAdvice: [
      "Limit your resume to one single page.",
      "Use standard, clear margins and uniform whitespace distribution."
    ]
  };

  if (!apiKey) {
    return fallback;
  }

  const prompt = [
    `You are an expert resume reviewer and career coach.`,
    `Review this resume text and provide specific, constructive suggestions for improvement.`,
    `Resume text: ${resumeText}`,
    `Return ONLY valid JSON with exactly these keys: summary (string), formattingTips (string array), skillEnhancements (string array), projectSuggestions (string array), layoutAdvice (string array).`
  ].join("\n\n");

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        }
      },
      { timeout: 20000 }
    );

    const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const payload = extractJsonPayload(responseText);
    if (!payload) return fallback;

    const parsed = JSON.parse(payload) as Partial<ResumeFeedbackResult>;
    return {
      summary: parsed.summary || fallback.summary,
      formattingTips: normalizeArray(parsed.formattingTips).length ? normalizeArray(parsed.formattingTips) : fallback.formattingTips,
      skillEnhancements: normalizeArray(parsed.skillEnhancements).length ? normalizeArray(parsed.skillEnhancements) : fallback.skillEnhancements,
      projectSuggestions: normalizeArray(parsed.projectSuggestions).length ? normalizeArray(parsed.projectSuggestions) : fallback.projectSuggestions,
      layoutAdvice: normalizeArray(parsed.layoutAdvice).length ? normalizeArray(parsed.layoutAdvice) : fallback.layoutAdvice,
    };
  } catch {
    return fallback;
  }
};

export type OfferEmailResult = {
  subject: string;
  body: string;
};

export const generateOfferEmail = async (
  studentName: string,
  companyName: string,
  roleName: string,
  salary: number
): Promise<OfferEmailResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallback: OfferEmailResult = {
    subject: `Job Offer - ${roleName} at ${companyName}`,
    body: `Dear ${studentName},\n\nWe are pleased to offer you the position of ${roleName} at ${companyName}. We were highly impressed by your qualifications during our placement process.\n\nPosition Details:\n- Role: ${roleName}\n- Annual CTC: INR ${salary.toLocaleString()}\n\nPlease review these details and respond through the UniNest Portal to accept or reject the offer.\n\nBest regards,\nRecruitment Team\n${companyName}`
  };

  if (!apiKey) {
    return fallback;
  }

  const prompt = [
    `You are a Human Resources Director.`,
    `Draft a professional, warm, and formal job offer letter/email.`,
    `Candidate: ${studentName}`,
    `Company: ${companyName}`,
    `Role: ${roleName}`,
    `Salary: INR ${salary.toLocaleString()}`,
    `Return ONLY valid JSON with exactly these keys: subject (string), body (string).`
  ].join("\n\n");

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 512,
        }
      },
      { timeout: 20000 }
    );

    const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const payload = extractJsonPayload(responseText);
    if (!payload) return fallback;

    const parsed = JSON.parse(payload) as Partial<OfferEmailResult>;
    return {
      subject: parsed.subject || fallback.subject,
      body: parsed.body || fallback.body,
    };
  } catch {
    return fallback;
  }
};
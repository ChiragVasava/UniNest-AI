import prisma from '../config/database';

/**
 * Very small, local heuristic for resume matching.
 * Returns a match score (0-100) based on keyword frequency in `extractedText`.
 */
export const matchResumeByKeywords = async (
  resumeId: string,
  keywords: string[] = ['Node.js', 'PostgreSQL', 'REST', 'JavaScript']
) => {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) throw new Error('Resume not found');

  const text = (resume.extractedText || '').toLowerCase();
  if (!text) return { score: 0, matchedKeywords: [] };

  const matched: string[] = [];
  let hits = 0;
  for (const kw of keywords) {
    const k = kw.toLowerCase();
    if (text.includes(k)) {
      matched.push(kw);
      hits += 1;
    }
  }

  const score = Math.min(100, Math.round((hits / Math.max(1, keywords.length)) * 100));

  return { score, matchedKeywords: matched };
};

export default { matchResumeByKeywords };

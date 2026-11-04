import { faqKnowledge } from "../data/faqKnowledge.js";

// ---------------------------------------------------------------------------
// Synonym mapping: normalised surface form → canonical token(s)
// ---------------------------------------------------------------------------
const SYNONYMS = {
  "may tien": "may tien co khi",
  "phay": "may phay",
  "cnc": "may phay cnc",
  "khoan": "may khoan ban",
  "bao gia": "gia",
  "bao nhieu tien": "gia",
  "mat tien": "chi phi",
  "phi": "chi phi",
  "giao nhan": "giao hang",
  "ship": "giao hang",
  "van chuyen": "giao hang",
  "bao tri": "bao hanh",
  "sua chua": "bao hanh",
  "dat hen": "dat lich tu van",
  "hen gap": "dat lich tu van",
  "gap tu van": "dat lich tu van",
  "tu van mien phi": "dat lich tu van",
  "xem may": "thong so ky thuat",
  "catalogue": "thong so ky thuat",
  "catalog": "thong so ky thuat",
  "san pham": "danh muc san pham",
  "hang hoa": "danh muc san pham",
  "co hang": "con hang",
  "het hang": "con hang",
  "in stock": "con hang",
  "so luong": "mua nhieu may",
  "mua nhieu": "mua nhieu may",
  "mua si": "chinh sach mua si",
  "gia si": "chinh sach mua si",
  "chiet khau": "chinh sach mua si",
};

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

/** Remove diacritics, lower-case, keep only a-z0-9 and spaces. */
export function normalizeText(value = "") {
  let text = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  // Apply synonym mapping (longest match first to avoid partial replacements)
  const sortedSynonyms = Object.keys(SYNONYMS).sort(
    (a, b) => b.length - a.length
  );
  for (const surface of sortedSynonyms) {
    const regex = new RegExp(`\\b${surface}\\b`, "g");
    text = text.replace(regex, SYNONYMS[surface]);
  }

  return text.replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Bigram helpers
// ---------------------------------------------------------------------------

function tokenize(text) {
  return text.split(" ").filter((t) => t.length > 1);
}

function getBigrams(tokens) {
  const bigrams = new Set();
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.add(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

/**
 * Compute a 0-1 score based on token overlap between two normalised strings.
 * Uses Dice coefficient on bigrams when both strings are long enough,
 * otherwise falls back to unigram Jaccard similarity.
 */
function overlapScore(a, b) {
  const tokensA = tokenize(a);
  const tokensB = tokenize(b);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  if (tokensA.length >= 2 && tokensB.length >= 2) {
    const bigramsA = getBigrams(tokensA);
    const bigramsB = getBigrams(tokensB);
    let shared = 0;
    for (const bg of bigramsA) {
      if (bigramsB.has(bg)) shared++;
    }
    return (2 * shared) / (bigramsA.size + bigramsB.size);
  }

  // Unigram Jaccard
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

// ---------------------------------------------------------------------------
// Main FAQ matcher
// ---------------------------------------------------------------------------

/** Minimum score (0-100) required to return a match. Can be overridden in tests. */
export const MATCH_THRESHOLD = 40;

/**
 * Match a user message against the FAQ knowledge base.
 *
 * Scoring tiers (0-100):
 *   100 — exact normalised match
 *    80 — pattern is a contiguous substring of the message
 *    65 — bigram/token overlap >= 0.65 with a pattern
 *    40+ — term-hit ratio >= 0.72 (legacy behaviour, kept for compatibility)
 *
 * @param {string} message
 * @param {number} [threshold=MATCH_THRESHOLD]
 * @returns {object|null} Best matching FAQ entry or null
 */
export function matchFaq(message, threshold = MATCH_THRESHOLD) {
  const normalizedMessage = normalizeText(message);
  if (!normalizedMessage) return null;

  let best = null;
  let bestScore = 0;

  for (const faq of faqKnowledge) {
    let score = 0;

    const patterns = [
  ...(Array.isArray(faq.patterns) ? faq.patterns : []),
  faq.question,
  faq.topic,
  ...(Array.isArray(faq.tags) ? faq.tags : []),
].filter(Boolean);

for (const pattern of patterns) {
      const normalizedPattern = normalizeText(pattern);

      // Tier 1: exact match
      if (normalizedMessage === normalizedPattern) {
        score = Math.max(score, 100);
        break; // can't do better
      }

      // Tier 2: substring containment
      if (` ${normalizedMessage} `.includes(` ${normalizedPattern} `)) {
        score = Math.max(score, 80);
        continue;
      }

      // Tier 3: bigram / token overlap
      const overlap = overlapScore(normalizedMessage, normalizedPattern);
      if (overlap >= 0.65) {
        score = Math.max(score, Math.round(40 + overlap * 40)); // 66-80
        continue;
      }

      // Tier 4 (legacy): term-hit ratio
      const terms = normalizedPattern.split(" ").filter((t) => t.length > 2);
      if (terms.length) {
        const matchedTerms = terms.filter((t) =>
          normalizedMessage.includes(t)
        ).length;
        const ratio = matchedTerms / terms.length;
        if (ratio >= 0.72) {
          score = Math.max(score, Math.round(40 + ratio));
        }
      }
    }

    if (score > bestScore) {
      best = faq;
      bestScore = score;
    }
  }

  return bestScore >= threshold ? best : null;
}

// ---------------------------------------------------------------------------
// Consultation / booking intent detection
// ---------------------------------------------------------------------------

const CONSULTATION_TERMS = [
  // Vietnamese booking / consultation terms
  "tu van", "dat lich", "lich hen", "lich tu van", "dich vu", "chi phi", "gia",
  "thoi gian", "ho so", "lien he", "nhan vien", "chuyen gia", "quy trinh",
  "ho tro", "dat hen", "hen gap", "gap tu van", "bao gia", "phi",
  "xem may", "mua may", "mua nhieu", "can mua", "muon mua",
  "muon duoc tu van", "can tu van", "can ho tro", "can biet them",
  "tu van mien phi", "gap nhan vien",
  // English synonyms
  "appointment", "consultation", "booking", "service", "price", "cost",
  "fee", "schedule", "order", "purchase", "buy",
];

/**
 * Returns true if the message appears to be a booking- or consultation-related
 * inquiry that the chatbot cannot directly answer from the FAQ.
 *
 * @param {string} message
 * @returns {boolean}
 */
export function isConsultationQuestion(message) {
  const normalizedMessage = ` ${normalizeText(message)} `;
  return CONSULTATION_TERMS.some((term) =>
    normalizedMessage.includes(` ${normalizeText(term)} `)
  );
}

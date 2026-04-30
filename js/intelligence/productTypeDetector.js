import {
  PRODUCT_TYPE_RULES,
  normalizeCategory,
  getDefaultTypeForCategory,
  getRulesForType
} from './productTypeRules.js?v=202604300937';

const norm = t => String(t || '')
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '');

function scoreMatch(hay, kw) {
  const k = norm(kw).trim();
  if (!k) return 0;

  if (hay === k) return k.includes(' ') ? 7 : 6;
  if (hay.includes(k)) return k.includes(' ') ? 4 : 3;

  return 0;
}

function scoreRule(rule, nameText, descText) {
  let score = 0;
  const evidence = [];

  for (const kw of rule.keywords || []) {
    const nameScore = scoreMatch(nameText, kw) * 2;
    const descScore = scoreMatch(descText, kw);
    const total = nameScore + descScore;

    if (total > 0) {
      score += total;
      evidence.push(kw);
    }
  }

  return { score, evidence };
}

function scanAllCategories(nameText, descText) {
  const candidates = [];

  for (const [category, set] of Object.entries(PRODUCT_TYPE_RULES)) {
    for (const [productType, rule] of Object.entries(set)) {
      const scored = scoreRule(rule, nameText, descText);
      candidates.push({
        category,
        productType,
        rule,
        score: scored.score,
        evidence: scored.evidence
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

function confidenceFromScore(score, overridden = false) {
  const base = score ? 0.48 + score / 18 : 0.34;
  const adjusted = overridden ? base - 0.03 : base;
  return Number(Math.max(0.28, Math.min(0.98, adjusted)).toFixed(2));
}

export function detectProductType({ category, name = '', description = '' }) {
  const requestedCategory = normalizeCategory(category);
  const nameText = norm(name);
  const descText = norm(description);

  const candidates = scanAllCategories(nameText, descText);
  const bestOverall = candidates[0];
  const bestRequested = candidates.find(c => c.category === requestedCategory && c.score > 0);

  let finalCategory = requestedCategory;
  let finalType = getDefaultTypeForCategory(requestedCategory);
  let finalScore = 0;
  let evidence = [];
  let categoryOverridden = false;
  let categoryOverrideReason = '';

  const strongOverallSignal = bestOverall && bestOverall.score >= 4;
  const requestedHasSignal = !!bestRequested;

  if (requestedHasSignal) {
    finalCategory = bestRequested.category;
    finalType = bestRequested.productType;
    finalScore = bestRequested.score;
    evidence = bestRequested.evidence;

    if (
      strongOverallSignal &&
      bestOverall.category !== requestedCategory &&
      bestOverall.score >= bestRequested.score + 3
    ) {
      finalCategory = bestOverall.category;
      finalType = bestOverall.productType;
      finalScore = bestOverall.score;
      evidence = bestOverall.evidence;
      categoryOverridden = true;
      categoryOverrideReason = `Product keywords matched ${bestOverall.category}/${bestOverall.productType} stronger than selected ${requestedCategory}.`;
    }
  } else if (strongOverallSignal) {
    finalCategory = bestOverall.category;
    finalType = bestOverall.productType;
    finalScore = bestOverall.score;
    evidence = bestOverall.evidence;
    categoryOverridden = finalCategory !== requestedCategory;
    categoryOverrideReason = categoryOverridden
      ? `Selected category ${requestedCategory} had no product keyword match; product name/description matched ${finalCategory}/${finalType}.`
      : '';
  }

  const rules = getRulesForType(finalCategory, finalType);

  return {
    requestedCategory,
    category: finalCategory,
    categoryOverridden,
    categoryOverrideReason,
    productType: finalType,
    parentType: rules.parentType,
    subtype: finalType,
    label: rules.label,
    confidence: confidenceFromScore(finalScore, categoryOverridden),
    evidence: [...new Set(evidence)].slice(0, 6),
    rules
  };
}

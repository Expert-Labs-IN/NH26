const Expense = require('../models/Expense');
const { loadFraudConfig } = require('./fraudConfigManager');

const LEVEL_LABELS = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  critical: 'Critical Risk'
};

const CATEGORY_KEYWORDS = {
  Travel: ['flight', 'airline', 'hotel', 'cab', 'taxi', 'uber', 'ola', 'train', 'bus', 'travel'],
  Food: ['restaurant', 'cafe', 'meal', 'lunch', 'dinner', 'breakfast', 'catering', 'food'],
  Software: ['license', 'software', 'subscription', 'saas', 'cloud', 'app', 'tool'],
  Supplies: ['stationery', 'office', 'supplies', 'paper', 'printer', 'ink', 'notebook'],
  Other: []
};

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'your', 'you', 'our', 'was', 'were', 'are',
  'have', 'has', 'had', 'into', 'onto', 'after', 'before', 'about', 'just', 'then', 'than', 'over',
  'under', 'very', 'expense', 'payment', 'invoice', 'bill', 'receipt'
]);

function escapeRegex(string) {
  return String(string || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeDescriptionForMatching(description) {
  return String(description || '')
    .replace(/\[OCR Data\]:[\s\S]*/i, '')
    .trim();
}

function getReceiptText(description, ocrText) {
  if (String(ocrText || '').trim()) return String(ocrText).trim();

  const desc = String(description || '');
  const markerMatch = desc.match(/\[OCR Data\]:([\s\S]*)/i);
  return markerMatch ? markerMatch[1].trim() : '';
}

function parseCurrencyCandidates(text) {
  if (!text) return [];
  const matches = text.match(/\d{1,3}(?:,\d{3})*(?:\.\d{2})|\d+\.\d{2}/g) || [];
  return matches
    .map((raw) => Number(raw.replace(/,/g, '')))
    .filter((value) => Number.isFinite(value) && value > 0 && value < 1000000);
}

function tokenizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function calculateTokenOverlap(referenceTokens, sampleTokens) {
  if (referenceTokens.length === 0) return 1;
  const sampleSet = new Set(sampleTokens);
  const matched = referenceTokens.filter((token) => sampleSet.has(token)).length;
  return matched / referenceTokens.length;
}

function hasCategoryKeywordMismatch(category, receiptText) {
  if (!receiptText) return false;
  const normalized = receiptText.toLowerCase();
  const selectedKeywords = CATEGORY_KEYWORDS[category] || [];
  if (selectedKeywords.length === 0) return false;

  const selectedMatches = selectedKeywords.filter((keyword) => normalized.includes(keyword)).length;
  if (selectedMatches > 0) return false;

  const otherCategories = Object.keys(CATEGORY_KEYWORDS).filter((key) => key !== category);
  const otherMatches = otherCategories.some((otherCategory) =>
    CATEGORY_KEYWORDS[otherCategory].some((keyword) => normalized.includes(keyword))
  );

  return otherMatches;
}

function isRoundNumber(amount, rule) {
  if (amount < rule.minAmount) return false;
  if (amount >= rule.largeAmount) return amount % rule.largeStep === 0;
  return amount % rule.normalStep === 0;
}

function isWithinLateNightWindow(hour, startHour, endHour) {
  if (startHour === endHour) return hour === startHour;
  if (startHour < endHour) return hour >= startHour && hour < endHour;
  return hour >= startHour || hour < endHour;
}

function determineRiskLevel(score, levels) {
  if (score >= levels.criticalMin) return 'critical';
  if (score >= levels.highMin) return 'high';
  if (score >= levels.mediumMin) return 'medium';
  return 'low';
}

function pushFlag(flags, scoreParts, points, message) {
  flags.push(message);
  scoreParts.push(points);
}

async function analyzeFraud(expenseData) {
  const config = loadFraudConfig();
  const rules = config.rules;
  const levels = config.levels;
  const amount = Number(expenseData.amount || 0);
  const category = String(expenseData.category || '');
  const description = String(expenseData.description || '');
  const employeeId = expenseData.employeeId;
  const ocrText = String(expenseData.ocrText || '');
  const now = new Date();

  const flags = [];
  const scoreParts = [];
  const receiptText = getReceiptText(description, ocrText);
  const normalizedDescription = normalizeDescriptionForMatching(description);
  const combinedText = `${normalizedDescription} ${receiptText}`.toLowerCase();

  if (rules.highAmount.enabled && amount > rules.highAmount.threshold) {
    pushFlag(
      flags,
      scoreParts,
      rules.highAmount.points,
      `Amount exceeds high-value threshold ($${rules.highAmount.threshold.toLocaleString()})`
    );
  }

  if (rules.roundNumber.enabled && isRoundNumber(amount, rules.roundNumber)) {
    pushFlag(flags, scoreParts, rules.roundNumber.points, 'Suspiciously round amount');
  }

  if (rules.weekend.enabled) {
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      pushFlag(flags, scoreParts, rules.weekend.points, 'Submitted on weekend');
    }
  }

  if (rules.lateNight.enabled) {
    const hour = now.getHours();
    if (isWithinLateNightWindow(hour, rules.lateNight.startHour, rules.lateNight.endHour)) {
      pushFlag(
        flags,
        scoreParts,
        rules.lateNight.points,
        `Submitted during unusual hours (${rules.lateNight.startHour}:00-${rules.lateNight.endHour}:00)`
      );
    }
  }

  if (rules.duplicateDescription.enabled && normalizedDescription) {
    try {
      const duplicates = await Expense.countDocuments({
        employeeId,
        description: { $regex: new RegExp(`^${escapeRegex(normalizedDescription)}$`, 'i') }
      });
      if (duplicates > 0) {
        pushFlag(flags, scoreParts, rules.duplicateDescription.points, 'Duplicate description found from same employee');
      }
    } catch (error) {
      // Ignore this rule if database query fails.
    }
  }

  if (
    rules.categoryMismatch.enabled &&
    rules.categoryMismatch.categories.includes(category) &&
    amount > rules.categoryMismatch.threshold
  ) {
    pushFlag(
      flags,
      scoreParts,
      rules.categoryMismatch.points,
      `High amount for ${category} category (>$${rules.categoryMismatch.threshold})`
    );
  }

  if (rules.rapidSubmission.enabled) {
    try {
      const startWindow = new Date(now.getTime() - rules.rapidSubmission.hours * 60 * 60 * 1000);
      const recentCount = await Expense.countDocuments({
        employeeId,
        createdAt: { $gte: startWindow }
      });
      if (recentCount >= rules.rapidSubmission.count) {
        pushFlag(
          flags,
          scoreParts,
          rules.rapidSubmission.points,
          `Rapid submissions (${rules.rapidSubmission.count}+ in ${rules.rapidSubmission.hours}h)`
        );
      }
    } catch (error) {
      // Ignore this rule if database query fails.
    }
  }

  if (rules.amountSpike.enabled) {
    try {
      const avgResult = await Expense.aggregate([
        { $match: { employeeId } },
        { $group: { _id: null, avgAmount: { $avg: '$amount' } } }
      ]);

      if (avgResult.length > 0 && avgResult[0].avgAmount > 0) {
        const employeeAverage = avgResult[0].avgAmount;
        if (amount > employeeAverage * rules.amountSpike.multiplier) {
          pushFlag(
            flags,
            scoreParts,
            rules.amountSpike.points,
            `Amount exceeds employee average by ${rules.amountSpike.multiplier}x`
          );
        }
      }
    } catch (error) {
      // Ignore this rule if database query fails.
    }
  }

  if (rules.thresholdGaming.enabled && amount >= rules.thresholdGaming.min && amount <= rules.thresholdGaming.max) {
    pushFlag(
      flags,
      scoreParts,
      rules.thresholdGaming.points,
      `Amount just below auto-approval threshold ($${rules.thresholdGaming.min}-${rules.thresholdGaming.max})`
    );
  }

  if (rules.missingReceiptText.enabled && amount >= rules.missingReceiptText.minAmount && !receiptText) {
    pushFlag(
      flags,
      scoreParts,
      rules.missingReceiptText.points,
      `Missing OCR receipt text for amount >= $${rules.missingReceiptText.minAmount}`
    );
  }

  if (rules.receiptAmountMismatch.enabled && receiptText) {
    const candidates = parseCurrencyCandidates(receiptText);
    if (candidates.length > 0) {
      const closest = candidates.reduce((best, current) => {
        if (!best) return current;
        return Math.abs(current - amount) < Math.abs(best - amount) ? current : best;
      }, null);

      if (closest !== null) {
        const diff = Math.abs(closest - amount);
        if (diff > rules.receiptAmountMismatch.tolerance) {
          pushFlag(
            flags,
            scoreParts,
            rules.receiptAmountMismatch.points,
            `Receipt amount mismatch detected (difference: $${diff.toFixed(2)})`
          );
        }
      }
    }
  }

  if (rules.receiptDetailsMismatch.enabled && receiptText) {
    const descriptionTokens = tokenizeText(normalizedDescription);
    const receiptTokens = tokenizeText(receiptText);
    const overlap = calculateTokenOverlap(descriptionTokens, receiptTokens);
    if (
      amount >= rules.receiptDetailsMismatch.minAmount &&
      descriptionTokens.length >= rules.receiptDetailsMismatch.minDescriptionWords &&
      overlap < rules.receiptDetailsMismatch.minOverlap
    ) {
      pushFlag(
        flags,
        scoreParts,
        rules.receiptDetailsMismatch.points,
        `Receipt details do not match description (overlap ${Math.round(overlap * 100)}%)`
      );
    }
  }

  if (rules.categoryReceiptMismatch.enabled && receiptText && hasCategoryKeywordMismatch(category, receiptText)) {
    pushFlag(
      flags,
      scoreParts,
      rules.categoryReceiptMismatch.points,
      `Receipt text appears inconsistent with selected category (${category})`
    );
  }

  if (rules.suspiciousKeywords.enabled && rules.suspiciousKeywords.keywords.length > 0) {
    const foundKeywords = rules.suspiciousKeywords.keywords.filter((keyword) => combinedText.includes(keyword));
    if (foundKeywords.length > 0) {
      pushFlag(
        flags,
        scoreParts,
        rules.suspiciousKeywords.points,
        `Suspicious keyword match: ${foundKeywords.slice(0, 3).join(', ')}`
      );
    }
  }

  const score = Math.min(scoreParts.reduce((sum, points) => sum + points, 0), 100);
  const level = determineRiskLevel(score, levels);

  return {
    score,
    level,
    label: LEVEL_LABELS[level],
    flags
  };
}

module.exports = { analyzeFraud };

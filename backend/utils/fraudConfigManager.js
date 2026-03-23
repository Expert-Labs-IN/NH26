const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'data', 'fraud_config.json');

const DEFAULT_FRAUD_CONFIG = {
  version: '1.0.0',
  updatedAt: new Date().toISOString(),
  levels: {
    mediumMin: 26,
    highMin: 51,
    criticalMin: 76
  },
  rules: {
    highAmount: {
      enabled: true,
      threshold: 5000,
      points: 30
    },
    roundNumber: {
      enabled: true,
      points: 15,
      minAmount: 100,
      largeAmount: 1000,
      normalStep: 100,
      largeStep: 500
    },
    weekend: {
      enabled: true,
      points: 10
    },
    lateNight: {
      enabled: true,
      startHour: 0,
      endHour: 5,
      points: 10
    },
    duplicateDescription: {
      enabled: true,
      points: 25
    },
    categoryMismatch: {
      enabled: true,
      categories: ['Food', 'Supplies'],
      threshold: 500,
      points: 20
    },
    rapidSubmission: {
      enabled: true,
      count: 3,
      hours: 24,
      points: 20
    },
    amountSpike: {
      enabled: true,
      multiplier: 3,
      points: 25
    },
    thresholdGaming: {
      enabled: true,
      min: 95,
      max: 99.99,
      points: 15
    },
    missingReceiptText: {
      enabled: true,
      minAmount: 300,
      points: 15
    },
    receiptAmountMismatch: {
      enabled: true,
      tolerance: 5,
      points: 30
    },
    receiptDetailsMismatch: {
      enabled: true,
      minAmount: 250,
      minDescriptionWords: 3,
      minOverlap: 0.2,
      points: 20
    },
    categoryReceiptMismatch: {
      enabled: true,
      points: 18
    },
    suspiciousKeywords: {
      enabled: true,
      keywords: ['cash', 'gift card', 'personal', 'reimburse me', 'crypto', 'bitcoin'],
      points: 12
    }
  }
};

const ensureDataDir = () => {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const isNumberField = (value) => typeof value === 'number' && Number.isFinite(value);

const coerceRuleShape = (config) => {
  const normalized = {
    ...DEFAULT_FRAUD_CONFIG,
    ...config,
    levels: {
      ...DEFAULT_FRAUD_CONFIG.levels,
      ...(config?.levels || {})
    },
    rules: {}
  };

  for (const ruleKey of Object.keys(DEFAULT_FRAUD_CONFIG.rules)) {
    normalized.rules[ruleKey] = {
      ...DEFAULT_FRAUD_CONFIG.rules[ruleKey],
      ...(config?.rules?.[ruleKey] || {})
    };
  }

  return normalized;
};

const sanitizeConfig = (config) => {
  const normalized = coerceRuleShape(config);

  if (!isNumberField(normalized.levels.mediumMin) || normalized.levels.mediumMin < 0) {
    normalized.levels.mediumMin = DEFAULT_FRAUD_CONFIG.levels.mediumMin;
  }
  if (!isNumberField(normalized.levels.highMin) || normalized.levels.highMin < normalized.levels.mediumMin) {
    normalized.levels.highMin = Math.max(DEFAULT_FRAUD_CONFIG.levels.highMin, normalized.levels.mediumMin + 1);
  }
  if (!isNumberField(normalized.levels.criticalMin) || normalized.levels.criticalMin < normalized.levels.highMin) {
    normalized.levels.criticalMin = Math.max(DEFAULT_FRAUD_CONFIG.levels.criticalMin, normalized.levels.highMin + 1);
  }

  const sanitizeRule = (ruleKey, fallback) => {
    const rule = normalized.rules[ruleKey];
    for (const [field, value] of Object.entries(fallback)) {
      if (typeof value === 'boolean') {
        if (typeof rule[field] !== 'boolean') rule[field] = value;
      } else if (typeof value === 'number') {
        if (!isNumberField(rule[field]) || rule[field] < 0) {
          rule[field] = value;
        }
      }
    }
  };

  sanitizeRule('highAmount', DEFAULT_FRAUD_CONFIG.rules.highAmount);
  sanitizeRule('roundNumber', DEFAULT_FRAUD_CONFIG.rules.roundNumber);
  sanitizeRule('weekend', DEFAULT_FRAUD_CONFIG.rules.weekend);
  sanitizeRule('lateNight', DEFAULT_FRAUD_CONFIG.rules.lateNight);
  sanitizeRule('duplicateDescription', DEFAULT_FRAUD_CONFIG.rules.duplicateDescription);
  sanitizeRule('categoryMismatch', DEFAULT_FRAUD_CONFIG.rules.categoryMismatch);
  sanitizeRule('rapidSubmission', DEFAULT_FRAUD_CONFIG.rules.rapidSubmission);
  sanitizeRule('amountSpike', DEFAULT_FRAUD_CONFIG.rules.amountSpike);
  sanitizeRule('thresholdGaming', DEFAULT_FRAUD_CONFIG.rules.thresholdGaming);
  sanitizeRule('missingReceiptText', DEFAULT_FRAUD_CONFIG.rules.missingReceiptText);
  sanitizeRule('receiptAmountMismatch', DEFAULT_FRAUD_CONFIG.rules.receiptAmountMismatch);
  sanitizeRule('receiptDetailsMismatch', DEFAULT_FRAUD_CONFIG.rules.receiptDetailsMismatch);
  sanitizeRule('categoryReceiptMismatch', DEFAULT_FRAUD_CONFIG.rules.categoryReceiptMismatch);
  sanitizeRule('suspiciousKeywords', DEFAULT_FRAUD_CONFIG.rules.suspiciousKeywords);

  if (!Array.isArray(normalized.rules.categoryMismatch.categories) || normalized.rules.categoryMismatch.categories.length === 0) {
    normalized.rules.categoryMismatch.categories = [...DEFAULT_FRAUD_CONFIG.rules.categoryMismatch.categories];
  }
  if (!Array.isArray(normalized.rules.suspiciousKeywords.keywords)) {
    normalized.rules.suspiciousKeywords.keywords = [...DEFAULT_FRAUD_CONFIG.rules.suspiciousKeywords.keywords];
  } else {
    normalized.rules.suspiciousKeywords.keywords = normalized.rules.suspiciousKeywords.keywords
      .map((keyword) => String(keyword || '').trim().toLowerCase())
      .filter(Boolean);
    if (normalized.rules.suspiciousKeywords.keywords.length === 0) {
      normalized.rules.suspiciousKeywords.keywords = [...DEFAULT_FRAUD_CONFIG.rules.suspiciousKeywords.keywords];
    }
  }

  if (normalized.rules.thresholdGaming.min > normalized.rules.thresholdGaming.max) {
    const temp = normalized.rules.thresholdGaming.min;
    normalized.rules.thresholdGaming.min = normalized.rules.thresholdGaming.max;
    normalized.rules.thresholdGaming.max = temp;
  }

  if (normalized.rules.lateNight.startHour > normalized.rules.lateNight.endHour) {
    const temp = normalized.rules.lateNight.startHour;
    normalized.rules.lateNight.startHour = normalized.rules.lateNight.endHour;
    normalized.rules.lateNight.endHour = temp;
  }

  if (
    !isNumberField(normalized.rules.receiptDetailsMismatch.minOverlap) ||
    normalized.rules.receiptDetailsMismatch.minOverlap < 0 ||
    normalized.rules.receiptDetailsMismatch.minOverlap > 1
  ) {
    normalized.rules.receiptDetailsMismatch.minOverlap = DEFAULT_FRAUD_CONFIG.rules.receiptDetailsMismatch.minOverlap;
  }

  normalized.updatedAt = new Date().toISOString();
  return normalized;
};

const saveFraudConfig = (config) => {
  ensureDataDir();
  const sanitized = sanitizeConfig(config);
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(sanitized, null, 2));
  return sanitized;
};

const loadFraudConfig = () => {
  ensureDataDir();
  if (!fs.existsSync(CONFIG_PATH)) {
    return saveFraudConfig(DEFAULT_FRAUD_CONFIG);
  }

  try {
    const fileContent = fs.readFileSync(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(fileContent);
    return sanitizeConfig(parsed);
  } catch (error) {
    return saveFraudConfig(DEFAULT_FRAUD_CONFIG);
  }
};

const updateFraudConfig = (partialConfig = {}) => {
  const currentConfig = loadFraudConfig();
  const merged = {
    ...currentConfig,
    ...partialConfig,
    levels: {
      ...currentConfig.levels,
      ...(partialConfig.levels || {})
    },
    rules: {}
  };

  for (const key of Object.keys(DEFAULT_FRAUD_CONFIG.rules)) {
    merged.rules[key] = {
      ...currentConfig.rules[key],
      ...(partialConfig.rules?.[key] || {})
    };
  }

  return saveFraudConfig(merged);
};

module.exports = {
  DEFAULT_FRAUD_CONFIG,
  loadFraudConfig,
  saveFraudConfig,
  updateFraudConfig
};

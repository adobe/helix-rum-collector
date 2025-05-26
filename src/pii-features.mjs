/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * Feature extraction functions for PII detection
 * Based on BigQuery ML model v1.1.1.2
 */

export function calculateEntropy(str) {
  if (!str || str.length === 0) return 0;

  const freq = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }

  let entropy = 0;
  const len = str.length;
  Object.keys(freq).forEach((char) => {
    const p = freq[char] / len;
    entropy -= p * Math.log2(p);
  });

  return entropy;
}

export function calculateIndexOfCoincidence(str) {
  if (!str || str.length <= 1) return 0;

  const freq = {};
  let total = 0;
  for (const char of str.toLowerCase()) {
    freq[char] = (freq[char] || 0) + 1;
    total++;
  }

  let sum = 0;
  Object.values(freq).forEach((count) => {
    sum += count * (count - 1);
  });

  const n = total;
  const ioc = sum / (n * (n - 1));

  return Math.min(ioc / 0.067, 1.0);
}

export function getCharacterRatios(str) {
  if (!str || str.length === 0) {
    return {
      letter_ratio: 0,
      digit_ratio: 0,
      special_ratio: 0,
      uppercase_ratio: 0,
      vowel_ratio: 0,
    };
  }

  let letters = 0;
  let digits = 0;
  let special = 0;
  let uppercase = 0;
  let vowels = 0;
  const vowelSet = new Set(['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']);

  for (const char of str) {
    if (/[a-zA-Z]/.test(char)) {
      letters += 1;
      if (/[A-Z]/.test(char)) uppercase += 1;
      if (vowelSet.has(char)) vowels += 1;
    } else if (/[0-9]/.test(char)) {
      digits += 1;
    } else {
      special += 1;
    }
  }

  const len = str.length;
  return {
    letter_ratio: letters / len,
    digit_ratio: digits / len,
    special_ratio: special / len,
    uppercase_ratio: letters > 0 ? uppercase / letters : 0,
    vowel_ratio: letters > 0 ? vowels / letters : 0,
  };
}

export function getNumberPositions(str) {
  if (!str || str.length === 0) {
    return {
      has_number_start: false,
      has_number_middle: false,
      has_number_end: false,
      consecutive_digits_max: 0,
    };
  }

  const has_number_start = /^[0-9]/.test(str);
  const has_number_end = /[0-9]$/.test(str);
  const has_number_middle = /[^0-9][0-9][^0-9]/.test(str);

  let maxConsecutive = 0;
  let currentConsecutive = 0;
  for (const char of str) {
    if (/[0-9]/.test(char)) {
      currentConsecutive += 1;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 0;
    }
  }

  return {
    has_number_start,
    has_number_middle,
    has_number_end,
    consecutive_digits_max: maxConsecutive,
  };
}

export function getPatternFeatures(str) {
  if (!str || str.length === 0) {
    return {
      has_uuid_pattern: false,
      has_hex_pattern: false,
      has_base64_pattern: false,
      has_email_pattern: false,
      segment_count: 0,
      avg_segment_length: 0,
    };
  }

  const has_uuid_pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const hexChars = str.match(/[0-9a-f]/gi) || [];
  const has_hex_pattern = hexChars.length / str.length > 0.8;

  const has_base64_pattern = /^[A-Za-z0-9+/_-]+={0,2}$/.test(str) && str.length % 4 === 0;

  const has_email_pattern = /@|%40/.test(str);

  const segments = str.split(/[-_.]/);
  const segment_count = segments.length;
  const avg_segment_length = segments.reduce((sum, seg) => sum + seg.length, 0) / segment_count;

  return {
    has_uuid_pattern,
    has_hex_pattern,
    has_base64_pattern,
    has_email_pattern,
    segment_count,
    avg_segment_length,
  };
}

export function getBigramFeatures(str) {
  if (!str || str.length < 2) {
    return {
      num_bigrams: 0,
      digit_bigrams: 0,
      letter_bigrams: 0,
      mixed_bigrams: 0,
      special_bigrams: 0,
    };
  }

  let normalized = '';
  for (const char of str.toLowerCase()) {
    if (/[a-z0-9]/.test(char)) {
      normalized += char;
    } else if (char === '-' || char === '_') {
      normalized += char;
    } else {
      normalized += '%';
    }
  }

  let digitBigrams = 0;
  let letterBigrams = 0;
  let mixedBigrams = 0;
  let specialBigrams = 0;

  for (let i = 0; i < normalized.length - 1; i += 1) {
    const char1 = normalized[i];
    const char2 = normalized[i + 1];

    const isDigit1 = /[0-9]/.test(char1);
    const isDigit2 = /[0-9]/.test(char2);
    const isLetter1 = /[a-z]/.test(char1);
    const isLetter2 = /[a-z]/.test(char2);
    const isSpecial1 = !isDigit1 && !isLetter1;
    const isSpecial2 = !isDigit2 && !isLetter2;

    if (isDigit1 && isDigit2) {
      digitBigrams += 1;
    } else if (isLetter1 && isLetter2) {
      letterBigrams += 1;
    } else if (isSpecial1 || isSpecial2) {
      specialBigrams += 1;
    } else {
      mixedBigrams += 1;
    }
  }

  return {
    num_bigrams: normalized.length - 1,
    digit_bigrams: digitBigrams,
    letter_bigrams: letterBigrams,
    mixed_bigrams: mixedBigrams,
    special_bigrams: specialBigrams,
  };
}

/**
 * Extract all features from a URL segment
 * Returns feature vector matching BigQuery ML model v1.1.1.2
 */
export function extractFeatures(segment) {
  const { length } = segment;
  const entropy = calculateEntropy(segment);
  const ioc = calculateIndexOfCoincidence(segment);

  const charRatios = getCharacterRatios(segment);
  const numberPos = getNumberPositions(segment);
  const patterns = getPatternFeatures(segment);
  const bigrams = getBigramFeatures(segment);

  // Return features in the same order as the SQL model
  return {
    length,
    entropy,
    ioc,
    letter_ratio: charRatios.letter_ratio,
    digit_ratio: charRatios.digit_ratio,
    special_ratio: charRatios.special_ratio,
    uppercase_ratio: charRatios.uppercase_ratio,
    vowel_ratio: charRatios.vowel_ratio,
    has_number_start: numberPos.has_number_start ? 1 : 0,
    has_number_middle: numberPos.has_number_middle ? 1 : 0,
    has_number_end: numberPos.has_number_end ? 1 : 0,
    consecutive_digits_max: numberPos.consecutive_digits_max,
    has_uuid_pattern: patterns.has_uuid_pattern ? 1 : 0,
    has_hex_pattern: patterns.has_hex_pattern ? 1 : 0,
    has_base64_pattern: patterns.has_base64_pattern ? 1 : 0,
    has_email_pattern: patterns.has_email_pattern ? 1 : 0,
    segment_count: patterns.segment_count,
    avg_segment_length: patterns.avg_segment_length,
    num_bigrams: bigrams.num_bigrams,
    digit_bigrams: bigrams.digit_bigrams,
    letter_bigrams: bigrams.letter_bigrams,
    mixed_bigrams: bigrams.mixed_bigrams,
    special_bigrams: bigrams.special_bigrams,
    // Derived features
    digit_bigram_ratio: bigrams.num_bigrams > 0
      ? bigrams.digit_bigrams / bigrams.num_bigrams
      : 0,
    letter_bigram_ratio: bigrams.num_bigrams > 0
      ? bigrams.letter_bigrams / bigrams.num_bigrams
      : 0,
    mixed_bigram_ratio: bigrams.num_bigrams > 0
      ? bigrams.mixed_bigrams / bigrams.num_bigrams
      : 0,
    special_bigram_ratio: bigrams.num_bigrams > 0
      ? bigrams.special_bigrams / bigrams.num_bigrams
      : 0,
    normalized_entropy: length > 0
      ? entropy / Math.log2(length)
      : 0,
    complexity_score: (
      entropy * 0.3
      + charRatios.digit_ratio * 0.2
      + (1 - charRatios.letter_ratio) * 0.2
      + (numberPos.consecutive_digits_max > 3 ? 0.3 : 0)
    ),
  };
}

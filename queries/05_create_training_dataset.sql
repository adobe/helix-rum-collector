-- Create a comprehensive training dataset with all features
-- This combines real URL segments and synthetic PII with extracted features

-- Include all UDFs
CREATE TEMP FUNCTION calculateEntropy(str STRING) RETURNS FLOAT64
LANGUAGE js AS """
  if (!str || str.length === 0) return 0;
  
  const freq = {};
  for (let char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  let entropy = 0;
  const len = str.length;
  for (let char in freq) {
    const p = freq[char] / len;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
""";

CREATE TEMP FUNCTION calculateIndexOfCoincidence(str STRING) RETURNS FLOAT64
LANGUAGE js AS """
  if (!str || str.length <= 1) return 0;
  
  const freq = {};
  let total = 0;
  for (let char of str.toLowerCase()) {
    freq[char] = (freq[char] || 0) + 1;
    total++;
  }
  
  let sum = 0;
  for (let char in freq) {
    const count = freq[char];
    sum += count * (count - 1);
  }
  
  const n = total;
  const ioc = sum / (n * (n - 1));
  
  return Math.min(ioc / 0.067, 1.0);
""";

CREATE TEMP FUNCTION getCharacterRatios(str STRING) 
RETURNS STRUCT<
  letter_ratio FLOAT64,
  digit_ratio FLOAT64,
  special_ratio FLOAT64,
  uppercase_ratio FLOAT64,
  vowel_ratio FLOAT64
>
LANGUAGE js AS """
  if (!str || str.length === 0) {
    return {
      letter_ratio: 0,
      digit_ratio: 0,
      special_ratio: 0,
      uppercase_ratio: 0,
      vowel_ratio: 0
    };
  }
  
  let letters = 0, digits = 0, special = 0, uppercase = 0, vowels = 0;
  const vowelSet = new Set(['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']);
  
  for (let char of str) {
    if (/[a-zA-Z]/.test(char)) {
      letters++;
      if (/[A-Z]/.test(char)) uppercase++;
      if (vowelSet.has(char)) vowels++;
    } else if (/[0-9]/.test(char)) {
      digits++;
    } else {
      special++;
    }
  }
  
  const len = str.length;
  return {
    letter_ratio: letters / len,
    digit_ratio: digits / len,
    special_ratio: special / len,
    uppercase_ratio: letters > 0 ? uppercase / letters : 0,
    vowel_ratio: letters > 0 ? vowels / letters : 0
  };
""";

CREATE TEMP FUNCTION getNumberPositions(str STRING)
RETURNS STRUCT<
  has_number_start BOOL,
  has_number_middle BOOL,
  has_number_end BOOL,
  consecutive_digits_max INT64
>
LANGUAGE js AS """
  if (!str || str.length === 0) {
    return {
      has_number_start: false,
      has_number_middle: false,
      has_number_end: false,
      consecutive_digits_max: 0
    };
  }
  
  const has_number_start = /^[0-9]/.test(str);
  const has_number_end = /[0-9]$/.test(str);
  const has_number_middle = /[^0-9][0-9][^0-9]/.test(str);
  
  let maxConsecutive = 0;
  let currentConsecutive = 0;
  for (let char of str) {
    if (/[0-9]/.test(char)) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 0;
    }
  }
  
  return {
    has_number_start: has_number_start,
    has_number_middle: has_number_middle,
    has_number_end: has_number_end,
    consecutive_digits_max: maxConsecutive
  };
""";

CREATE TEMP FUNCTION getPatternFeatures(str STRING)
RETURNS STRUCT<
  has_uuid_pattern BOOL,
  has_hex_pattern BOOL,
  has_base64_pattern BOOL,
  has_email_pattern BOOL,
  segment_count INT64,
  avg_segment_length FLOAT64
>
LANGUAGE js AS """
  if (!str || str.length === 0) {
    return {
      has_uuid_pattern: false,
      has_hex_pattern: false,
      has_base64_pattern: false,
      has_email_pattern: false,
      segment_count: 0,
      avg_segment_length: 0
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
    has_uuid_pattern: has_uuid_pattern,
    has_hex_pattern: has_hex_pattern,
    has_base64_pattern: has_base64_pattern,
    has_email_pattern: has_email_pattern,
    segment_count: segment_count,
    avg_segment_length: avg_segment_length
  };
""";

CREATE TEMP FUNCTION getBigramFeatures(str STRING) 
RETURNS STRUCT<
  num_bigrams INT64,
  digit_bigrams INT64,
  letter_bigrams INT64,
  mixed_bigrams INT64,
  special_bigrams INT64
>
LANGUAGE js AS """
  if (!str || str.length < 2) {
    return {
      num_bigrams: 0,
      digit_bigrams: 0,
      letter_bigrams: 0,
      mixed_bigrams: 0,
      special_bigrams: 0
    };
  }
  
  let normalized = '';
  for (let char of str.toLowerCase()) {
    if (/[a-z0-9]/.test(char)) {
      normalized += char;
    } else if (char === '-' || char === '_') {
      normalized += char;
    } else {
      normalized += '%';
    }
  }
  
  let digit_bigrams = 0, letter_bigrams = 0, mixed_bigrams = 0, special_bigrams = 0;
  
  for (let i = 0; i < normalized.length - 1; i++) {
    const char1 = normalized[i];
    const char2 = normalized[i + 1];
    
    const isDigit1 = /[0-9]/.test(char1);
    const isDigit2 = /[0-9]/.test(char2);
    const isLetter1 = /[a-z]/.test(char1);
    const isLetter2 = /[a-z]/.test(char2);
    const isSpecial1 = !isDigit1 && !isLetter1;
    const isSpecial2 = !isDigit2 && !isLetter2;
    
    if (isDigit1 && isDigit2) {
      digit_bigrams++;
    } else if (isLetter1 && isLetter2) {
      letter_bigrams++;
    } else if (isSpecial1 || isSpecial2) {
      special_bigrams++;
    } else {
      mixed_bigrams++;
    }
  }
  
  return {
    num_bigrams: normalized.length - 1,
    digit_bigrams: digit_bigrams,
    letter_bigrams: letter_bigrams,
    mixed_bigrams: mixed_bigrams,
    special_bigrams: special_bigrams
  };
""";

-- Create training dataset
WITH all_segments AS (
  -- Real URL segments (sample for testing, in production use full dataset)
  SELECT segment, 0 AS is_pii, 'real' AS source
  FROM (
    SELECT 'content' AS segment UNION ALL
    SELECT 'about' UNION ALL
    SELECT 'search' UNION ALL
    SELECT 'careers' UNION ALL
    SELECT 'contact' UNION ALL
    SELECT 'support' UNION ALL
    SELECT 'login' UNION ALL
    SELECT 'events' UNION ALL
    SELECT 'tools' UNION ALL
    SELECT 'legal' UNION ALL
    SELECT 'models' UNION ALL
    SELECT 'company' UNION ALL
    SELECT 'forms' UNION ALL
    SELECT 'offers' UNION ALL
    SELECT 'global' UNION ALL
    SELECT 'product' UNION ALL
    SELECT 'privacy' UNION ALL
    SELECT 'service' UNION ALL
    SELECT 'policy' UNION ALL
    SELECT 'terms' UNION ALL
    SELECT 'resources' UNION ALL
    SELECT 'download' UNION ALL
    SELECT 'pricing' UNION ALL
    SELECT 'features' UNION ALL
    SELECT 'solutions'
  )
  
  UNION ALL
  
  -- Synthetic PII segments
  SELECT segment, 1 AS is_pii, 'synthetic' AS source
  FROM (
    SELECT '5785da909b0ace1743ed59576886d00c' AS segment UNION ALL
    SELECT 'xZ7i5U' UNION ALL
    SELECT '787ec83d0adaeb0f' UNION ALL
    SELECT 'DELAES' UNION ALL
    SELECT '4293837452' UNION ALL
    SELECT 'info420%40gmail.com' UNION ALL
    SELECT 'C4190833' UNION ALL
    SELECT '1de96bd8-74fd-47c7-925d-a2c74b487472' UNION ALL
    SELECT 'f80b340aa19de601a8e19429b5d06d49' UNION ALL
    SELECT 'o6uYS6C' UNION ALL
    SELECT '315061d15cda0d6e' UNION ALL
    SELECT 'S268HB' UNION ALL
    SELECT '954-762-7979' UNION ALL
    SELECT 'info941%40gmail.com' UNION ALL
    SELECT 'BO6DDVCD' UNION ALL
    SELECT 'be4cc539-5a33-44df-8777-7e2294a3da7d' UNION ALL
    SELECT '1d10f1f32fa725081603eae3de48f7ba' UNION ALL
    SELECT 'S0ofC' UNION ALL
    SELECT '6HX7IJ1OTGIQH7NG6FCE' UNION ALL
    SELECT 'user123%40example.net' UNION ALL
    SELECT '+15551234567' UNION ALL
    SELECT 'ABC123' UNION ALL
    SELECT 'session_9f86d081' UNION ALL
    SELECT 'token_a1b2c3d4' UNION ALL
    SELECT 'key_xyz789'
  )
)

SELECT
  segment,
  is_pii,
  source,
  LENGTH(segment) AS length,
  
  -- Entropy and complexity
  calculateEntropy(segment) AS entropy,
  calculateIndexOfCoincidence(segment) AS ioc,
  
  -- Character ratios
  getCharacterRatios(segment).letter_ratio AS letter_ratio,
  getCharacterRatios(segment).digit_ratio AS digit_ratio,
  getCharacterRatios(segment).special_ratio AS special_ratio,
  getCharacterRatios(segment).uppercase_ratio AS uppercase_ratio,
  getCharacterRatios(segment).vowel_ratio AS vowel_ratio,
  
  -- Number positions
  getNumberPositions(segment).has_number_start AS has_number_start,
  getNumberPositions(segment).has_number_middle AS has_number_middle,
  getNumberPositions(segment).has_number_end AS has_number_end,
  getNumberPositions(segment).consecutive_digits_max AS consecutive_digits_max,
  
  -- Pattern features
  getPatternFeatures(segment).has_uuid_pattern AS has_uuid_pattern,
  getPatternFeatures(segment).has_hex_pattern AS has_hex_pattern,
  getPatternFeatures(segment).has_base64_pattern AS has_base64_pattern,
  getPatternFeatures(segment).has_email_pattern AS has_email_pattern,
  getPatternFeatures(segment).segment_count AS segment_count,
  getPatternFeatures(segment).avg_segment_length AS avg_segment_length,
  
  -- Bigram features
  getBigramFeatures(segment).num_bigrams AS num_bigrams,
  getBigramFeatures(segment).digit_bigrams AS digit_bigrams,
  getBigramFeatures(segment).letter_bigrams AS letter_bigrams,
  getBigramFeatures(segment).mixed_bigrams AS mixed_bigrams,
  getBigramFeatures(segment).special_bigrams AS special_bigrams

FROM all_segments
ORDER BY is_pii, segment
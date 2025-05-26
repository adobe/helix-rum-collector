-- Model v1.1.3 - v1.1 with full bigram vector features
-- This uses the same base features as v1.1 but adds individual bigram frequencies

-- First create the bigram vector UDF
CREATE TEMP FUNCTION getBigramVector(input STRING)
RETURNS STRUCT<
  -- Top discriminative numeric bigrams from analysis
  b_79 INT64, b_42 INT64, b_95 INT64, b_47 INT64, b_60 INT64,
  b_31 INT64, b_53 INT64, b_73 INT64, b_84 INT64, b_17 INT64,
  b_23 INT64, b_65 INT64, b_12 INT64, b_89 INT64, b_36 INT64,
  b_00 INT64, b_11 INT64, b_22 INT64, b_33 INT64, b_44 INT64,
  b_55 INT64, b_66 INT64, b_77 INT64, b_88 INT64, b_99 INT64,
  -- Top discriminative hex bigrams (mixed alphanumeric)
  b_3e INT64, b_7e INT64, b_5d INT64, b_9b INT64, b_a3 INT64,
  b_e4 INT64, b_d1 INT64, b_b0 INT64, b_0g INT64, b_2c INT64,
  b_f6 INT64, b_1c INT64, b_8a INT64, b_c9 INT64, b_4f INT64,
  -- Top discriminative letter bigrams (natural language)
  b_ar INT64, b_en INT64, b_nt INT64, b_te INT64, b_or INT64,
  b_er INT64, b_in INT64, b_on INT64, b_at INT64, b_nd INT64,
  b_to INT64, b_ed INT64, b_es INT64, b_st INT64, b_an INT64,
  b_re INT64, b_he INT64, b_ng INT64, b_al INT64, b_it INT64,
  -- Special character bigrams
  b_40 INT64, b_2d INT64, b_5f INT64, b_2e INT64, b_2f INT64
>
LANGUAGE js AS """
  if (!input || input.length < 2) {
    return {
      b_79: 0, b_42: 0, b_95: 0, b_47: 0, b_60: 0,
      b_31: 0, b_53: 0, b_73: 0, b_84: 0, b_17: 0,
      b_23: 0, b_65: 0, b_12: 0, b_89: 0, b_36: 0,
      b_00: 0, b_11: 0, b_22: 0, b_33: 0, b_44: 0,
      b_55: 0, b_66: 0, b_77: 0, b_88: 0, b_99: 0,
      b_3e: 0, b_7e: 0, b_5d: 0, b_9b: 0, b_a3: 0,
      b_e4: 0, b_d1: 0, b_b0: 0, b_0g: 0, b_2c: 0,
      b_f6: 0, b_1c: 0, b_8a: 0, b_c9: 0, b_4f: 0,
      b_ar: 0, b_en: 0, b_nt: 0, b_te: 0, b_or: 0,
      b_er: 0, b_in: 0, b_on: 0, b_at: 0, b_nd: 0,
      b_to: 0, b_ed: 0, b_es: 0, b_st: 0, b_an: 0,
      b_re: 0, b_he: 0, b_ng: 0, b_al: 0, b_it: 0,
      b_40: 0, b_2d: 0, b_5f: 0, b_2e: 0, b_2f: 0
    };
  }
  
  // Normalize the input
  let normalized = '';
  for (let char of input.toLowerCase()) {
    if (/[a-z0-9]/.test(char)) {
      normalized += char;
    } else if (char === '-') {
      normalized += '-';
    } else if (char === '_') {
      normalized += '_';
    } else {
      normalized += '%';
    }
  }
  
  // Count bigrams
  const counts = {};
  for (let i = 0; i < normalized.length - 1; i++) {
    const bigram = normalized.substring(i, i + 2);
    counts[bigram] = (counts[bigram] || 0) + 1;
  }
  
  // Map to result structure
  return {
    b_79: counts['79'] || 0, b_42: counts['42'] || 0, b_95: counts['95'] || 0,
    b_47: counts['47'] || 0, b_60: counts['60'] || 0,
    b_31: counts['31'] || 0, b_53: counts['53'] || 0, b_73: counts['73'] || 0,
    b_84: counts['84'] || 0, b_17: counts['17'] || 0,
    b_23: counts['23'] || 0, b_65: counts['65'] || 0, b_12: counts['12'] || 0,
    b_89: counts['89'] || 0, b_36: counts['36'] || 0,
    b_00: counts['00'] || 0, b_11: counts['11'] || 0, b_22: counts['22'] || 0,
    b_33: counts['33'] || 0, b_44: counts['44'] || 0,
    b_55: counts['55'] || 0, b_66: counts['66'] || 0, b_77: counts['77'] || 0,
    b_88: counts['88'] || 0, b_99: counts['99'] || 0,
    b_3e: counts['3e'] || 0, b_7e: counts['7e'] || 0, b_5d: counts['5d'] || 0,
    b_9b: counts['9b'] || 0, b_a3: counts['a3'] || 0,
    b_e4: counts['e4'] || 0, b_d1: counts['d1'] || 0, b_b0: counts['b0'] || 0,
    b_0g: counts['0g'] || 0, b_2c: counts['2c'] || 0,
    b_f6: counts['f6'] || 0, b_1c: counts['1c'] || 0, b_8a: counts['8a'] || 0,
    b_c9: counts['c9'] || 0, b_4f: counts['4f'] || 0,
    b_ar: counts['ar'] || 0, b_en: counts['en'] || 0, b_nt: counts['nt'] || 0,
    b_te: counts['te'] || 0, b_or: counts['or'] || 0,
    b_er: counts['er'] || 0, b_in: counts['in'] || 0, b_on: counts['on'] || 0,
    b_at: counts['at'] || 0, b_nd: counts['nd'] || 0,
    b_to: counts['to'] || 0, b_ed: counts['ed'] || 0, b_es: counts['es'] || 0,
    b_st: counts['st'] || 0, b_an: counts['an'] || 0,
    b_re: counts['re'] || 0, b_he: counts['he'] || 0, b_ng: counts['ng'] || 0,
    b_al: counts['al'] || 0, b_it: counts['it'] || 0,
    b_40: counts['%40'] || 0, b_2d: counts['%-'] || 0, b_5f: counts['%_'] || 0,
    b_2e: counts['%.'] || 0, b_2f: counts['%/'] || 0
  };
""";

-- Create all other UDFs (same as v1.1)
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

-- Generate synthetic PII functions (same as v1.1)
CREATE TEMP FUNCTION generateUUID() RETURNS STRING
LANGUAGE js AS """
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
""";

CREATE TEMP FUNCTION generateCompactUUID() RETURNS STRING
LANGUAGE js AS """
  var uuid = '';
  for (var i = 0; i < 32; i++) {
    uuid += Math.floor(Math.random() * 16).toString(16);
  }
  return uuid;
""";

CREATE TEMP FUNCTION generateBase64ID(length INT64) RETURNS STRING
LANGUAGE js AS """
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  var result = '';
  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
""";

CREATE TEMP FUNCTION generateSessionID() RETURNS STRING
LANGUAGE js AS """
  var formats = [
    () => {
      var hex = '';
      for (var i = 0; i < 16; i++) {
        hex += Math.floor(Math.random() * 16).toString(16);
      }
      return hex;
    },
    () => {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      var result = '';
      for (var i = 0; i < 24; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },
    () => {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      var result = '';
      for (var i = 0; i < 20; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
  ];
  return formats[Math.floor(Math.random() * formats.length)]();
""";

CREATE TEMP FUNCTION generatePNR() RETURNS STRING
LANGUAGE js AS """
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var pnr = '';
  for (var i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
""";

-- Create or replace the model v1.1.3
CREATE OR REPLACE MODEL `helix-225321.pii_detection.url_segment_classifier_v1_1_3`
OPTIONS(
  model_type='LOGISTIC_REG',
  input_label_cols=['is_pii'],
  auto_class_weights=TRUE,
  data_split_method='RANDOM',
  data_split_eval_fraction=0.2,
  l1_reg=0.1,
  l2_reg=0.1
) AS

-- Training data with query string handling (same dataset as v1.1)
WITH real_segments AS (
  -- Extract real URL segments with query strings properly stripped
  SELECT DISTINCT
    cleaned_segment AS segment,
    0 AS is_pii,
    'real' AS source
  FROM (
    WITH urls AS (
      SELECT DISTINCT
        hostname,
        url
      FROM helix_rum.cluster_all
      WHERE time > '2025-05-22'
        AND time < '2025-05-23'  -- Same 1-day range as v1.1
    ),
    segments_array AS (
      SELECT DISTINCT
        hostname,
        SPLIT(url, '/') AS segments
      FROM urls
    ),
    raw_segments AS (
      SELECT DISTINCT
        hostname,
        segment AS raw_segment,
        -- Clean the segment by removing query string
        CASE 
          WHEN STRPOS(segment, '?') > 0 THEN SUBSTR(segment, 1, STRPOS(segment, '?') - 1)
          ELSE segment
        END AS cleaned_segment
      FROM segments_array
      INNER JOIN UNNEST(segments_array.segments) AS segment
      WITH OFFSET
      WHERE offset > 2  -- Skip protocol and domain
    )
    SELECT DISTINCT
      cleaned_segment
    FROM raw_segments
    WHERE LENGTH(cleaned_segment) >= 5
      AND LENGTH(cleaned_segment) <= 50
      -- Filter out obvious IDs on the cleaned segment
      AND NOT REGEXP_CONTAINS(cleaned_segment, r'^[0-9a-f]{32}$')
      AND NOT REGEXP_CONTAINS(cleaned_segment, r'^[0-9]{10,}$')
      AND NOT REGEXP_CONTAINS(cleaned_segment, r'@')
  )
  LIMIT 50000  -- Same size as v1.1
),

synthetic_pii AS (
  -- Generate 50,000 synthetic PII samples (same as v1.1)
  SELECT 
    CASE 
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 0 THEN generateUUID()
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 1 THEN generateCompactUUID()
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 2 THEN generateBase64ID(CAST(5 + RAND() * 20 AS INT64))
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 3 THEN generateSessionID()
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 4 THEN generatePNR()
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 5 THEN 
        CONCAT(
          CAST(CAST(RAND() * 900 + 100 AS INT64) AS STRING), '-',
          CAST(CAST(RAND() * 900 + 100 AS INT64) AS STRING), '-',
          CAST(CAST(RAND() * 9000 + 1000 AS INT64) AS STRING)
        )
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 6 THEN 
        CONCAT(
          'user', CAST(CAST(RAND() * 10000 AS INT64) AS STRING),
          '%40',
          CASE CAST(FLOOR(RAND() * 4) AS INT64)
            WHEN 0 THEN 'gmail'
            WHEN 1 THEN 'yahoo'
            WHEN 2 THEN 'outlook'
            ELSE 'company'
          END,
          '.com'
        )
      ELSE CONCAT('C', CAST(CAST(RAND() * 90000000 + 10000000 AS INT64) AS STRING))
    END AS segment,
    1 AS is_pii,
    'synthetic' AS source
  FROM UNNEST(GENERATE_ARRAY(1, 50000)) AS num
),

all_segments AS (
  SELECT * FROM real_segments
  UNION ALL
  SELECT * FROM synthetic_pii
),

feature_extraction AS (
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
    CAST(getNumberPositions(segment).has_number_start AS INT64) AS has_number_start,
    CAST(getNumberPositions(segment).has_number_middle AS INT64) AS has_number_middle,
    CAST(getNumberPositions(segment).has_number_end AS INT64) AS has_number_end,
    getNumberPositions(segment).consecutive_digits_max AS consecutive_digits_max,
    
    -- Pattern features
    CAST(getPatternFeatures(segment).has_uuid_pattern AS INT64) AS has_uuid_pattern,
    CAST(getPatternFeatures(segment).has_hex_pattern AS INT64) AS has_hex_pattern,
    CAST(getPatternFeatures(segment).has_base64_pattern AS INT64) AS has_base64_pattern,
    CAST(getPatternFeatures(segment).has_email_pattern AS INT64) AS has_email_pattern,
    getPatternFeatures(segment).segment_count AS segment_count,
    getPatternFeatures(segment).avg_segment_length AS avg_segment_length,
    
    -- Bigram features
    getBigramFeatures(segment).num_bigrams AS num_bigrams,
    getBigramFeatures(segment).digit_bigrams AS digit_bigrams,
    getBigramFeatures(segment).letter_bigrams AS letter_bigrams,
    getBigramFeatures(segment).mixed_bigrams AS mixed_bigrams,
    getBigramFeatures(segment).special_bigrams AS special_bigrams,
    
    -- Full bigram vector
    getBigramVector(segment) AS bigram_vector
    
  FROM all_segments
  WHERE segment IS NOT NULL
    AND LENGTH(segment) >= 5
    AND LENGTH(segment) <= 50
)

SELECT
  is_pii,
  
  -- All numeric features for the model (same as v1.1)
  length,
  entropy,
  ioc,
  letter_ratio,
  digit_ratio,
  special_ratio,
  uppercase_ratio,
  vowel_ratio,
  has_number_start,
  has_number_middle,
  has_number_end,
  consecutive_digits_max,
  has_uuid_pattern,
  has_hex_pattern,
  has_base64_pattern,
  has_email_pattern,
  segment_count,
  avg_segment_length,
  num_bigrams,
  digit_bigrams,
  letter_bigrams,
  mixed_bigrams,
  special_bigrams,
  
  -- Derived features (same as v1.1)
  CASE WHEN num_bigrams > 0 
    THEN digit_bigrams / num_bigrams 
    ELSE 0 
  END AS digit_bigram_ratio,
  
  CASE WHEN num_bigrams > 0 
    THEN letter_bigrams / num_bigrams 
    ELSE 0 
  END AS letter_bigram_ratio,
  
  CASE WHEN num_bigrams > 0 
    THEN mixed_bigrams / num_bigrams 
    ELSE 0 
  END AS mixed_bigram_ratio,
  
  CASE WHEN num_bigrams > 0 
    THEN special_bigrams / num_bigrams 
    ELSE 0 
  END AS special_bigram_ratio,
  
  -- Entropy normalized by length
  CASE WHEN length > 0 
    THEN entropy / LOG(length, 2)
    ELSE 0 
  END AS normalized_entropy,
  
  -- Complexity score combining multiple factors
  (
    entropy * 0.3 +
    digit_ratio * 0.2 +
    (1 - letter_ratio) * 0.2 +
    CASE WHEN consecutive_digits_max > 3 THEN 0.3 ELSE 0 END
  ) AS complexity_score,
  
  -- Individual bigram frequencies as features
  bigram_vector.b_79, bigram_vector.b_42, bigram_vector.b_95,
  bigram_vector.b_47, bigram_vector.b_60,
  bigram_vector.b_31, bigram_vector.b_53, bigram_vector.b_73,
  bigram_vector.b_84, bigram_vector.b_17,
  bigram_vector.b_23, bigram_vector.b_65, bigram_vector.b_12,
  bigram_vector.b_89, bigram_vector.b_36,
  bigram_vector.b_00, bigram_vector.b_11, bigram_vector.b_22,
  bigram_vector.b_33, bigram_vector.b_44,
  bigram_vector.b_55, bigram_vector.b_66, bigram_vector.b_77,
  bigram_vector.b_88, bigram_vector.b_99,
  bigram_vector.b_3e, bigram_vector.b_7e, bigram_vector.b_5d,
  bigram_vector.b_9b, bigram_vector.b_a3,
  bigram_vector.b_e4, bigram_vector.b_d1, bigram_vector.b_b0,
  bigram_vector.b_0g, bigram_vector.b_2c,
  bigram_vector.b_f6, bigram_vector.b_1c, bigram_vector.b_8a,
  bigram_vector.b_c9, bigram_vector.b_4f,
  bigram_vector.b_ar, bigram_vector.b_en, bigram_vector.b_nt,
  bigram_vector.b_te, bigram_vector.b_or,
  bigram_vector.b_er, bigram_vector.b_in, bigram_vector.b_on,
  bigram_vector.b_at, bigram_vector.b_nd,
  bigram_vector.b_to, bigram_vector.b_ed, bigram_vector.b_es,
  bigram_vector.b_st, bigram_vector.b_an,
  bigram_vector.b_re, bigram_vector.b_he, bigram_vector.b_ng,
  bigram_vector.b_al, bigram_vector.b_it,
  bigram_vector.b_40, bigram_vector.b_2d, bigram_vector.b_5f,
  bigram_vector.b_2e, bigram_vector.b_2f

FROM feature_extraction;
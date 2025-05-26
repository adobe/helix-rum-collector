-- Model v1.1.1.3 - Boosted Trees with 250k balanced dataset
-- Testing intermediate dataset size to find optimal balance

-- [UDF definitions identical to v1.1.1.2, omitted for brevity]
-- Copy all UDF definitions from v1.1.1.2

-- Create all necessary UDFs for feature extraction (same as v1.1.1)
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

-- Generate synthetic PII functions (same as v1.1.1)
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

-- Create or replace the model v1.1.1.3 with Boosted Trees and 250k dataset
CREATE OR REPLACE MODEL `helix-225321.pii_detection.url_segment_classifier_v1_1_1_3`
OPTIONS(
  model_type='BOOSTED_TREE_CLASSIFIER',
  input_label_cols=['is_pii'],
  auto_class_weights=TRUE,
  data_split_method='RANDOM',
  data_split_eval_fraction=0.2,
  num_parallel_tree=50,
  max_tree_depth=10,
  subsample=0.85,
  min_tree_child_weight=1,
  colsample_bytree=0.8,
  colsample_bylevel=0.8,
  l1_reg=0.1,
  l2_reg=0.1,
  early_stop=TRUE,
  min_rel_progress=0.01,
  max_iterations=50
) AS

-- Training data with balanced synthetic generation (250k target)
WITH real_segments_raw AS (
  -- Extract real URL segments from a 5-day window
  SELECT DISTINCT
    cleaned_segment AS segment
  FROM (
    WITH urls AS (
      SELECT DISTINCT
        hostname,
        url
      FROM helix_rum.cluster_all
      WHERE time >= '2025-05-18'
        AND time < '2025-05-23'  -- 5-day window
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
  LIMIT 250000  -- Target 250k real segments
),

-- Count actual number of real segments
real_count AS (
  SELECT COUNT(*) AS num_real
  FROM real_segments_raw
),

real_segments AS (
  SELECT 
    segment,
    0 AS is_pii,
    'real' AS source
  FROM real_segments_raw
),

-- Generate synthetic PII matching the count of real segments
synthetic_pii AS (
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
  FROM UNNEST(GENERATE_ARRAY(1, (SELECT num_real FROM real_count))) AS num
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
    getBigramFeatures(segment).special_bigrams AS special_bigrams
    
  FROM all_segments
  WHERE segment IS NOT NULL
    AND LENGTH(segment) >= 5
    AND LENGTH(segment) <= 50
)

SELECT
  is_pii,
  
  -- All numeric features for the model (same as v1.1.1)
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
  
  -- Derived features (same as v1.1.1)
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
  ) AS complexity_score

FROM feature_extraction;
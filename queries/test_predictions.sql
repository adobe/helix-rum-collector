-- Test predictions on various URL segments

-- Include feature extraction UDFs (abbreviated for testing)
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

WITH test_samples AS (
  -- Normal URL segments
  SELECT 'about' AS segment, 'Normal URL' AS expected_type UNION ALL
  SELECT 'contact', 'Normal URL' UNION ALL
  SELECT 'privacy', 'Normal URL' UNION ALL
  SELECT 'search', 'Normal URL' UNION ALL
  SELECT 'login', 'Normal URL' UNION ALL
  SELECT 'products', 'Normal URL' UNION ALL
  SELECT 'services', 'Normal URL' UNION ALL
  SELECT 'documentation', 'Normal URL' UNION ALL
  
  -- PII segments
  SELECT '5785da909b0ace1743ed59576886d00c', 'PII - Hex ID' UNION ALL
  SELECT 'user123@example.com', 'PII - Email' UNION ALL
  SELECT 'user456%40gmail.com', 'PII - Email (encoded)' UNION ALL
  SELECT 'ABC123', 'PII - ID' UNION ALL
  SELECT '954-762-7979', 'PII - Phone' UNION ALL
  SELECT 'session_9f86d081', 'PII - Session ID' UNION ALL
  SELECT 'C4190833', 'PII - Customer ID' UNION ALL
  SELECT 'xZ7i5U', 'PII - Base64-like' UNION ALL
  SELECT '1de96bd8-74fd-47c7-925d-a2c74b487472', 'PII - UUID' UNION ALL
  SELECT 'DELAES', 'PII - PNR' UNION ALL
  
  -- Edge cases
  SELECT 'api-key', 'Normal URL' UNION ALL
  SELECT 'user-profile', 'Normal URL' UNION ALL
  SELECT '2023-report', 'Normal URL' UNION ALL
  SELECT 'v2.0.1', 'Normal URL' UNION ALL
  SELECT 'page-404', 'Normal URL'
),

predictions AS (
  SELECT
    ts.segment,
    ts.expected_type,
    p.predicted_is_pii,
    ROUND(p.predicted_is_pii_probs[OFFSET(1)].prob, 4) AS pii_probability
  FROM
    ML.PREDICT(MODEL `helix-225321.pii_detection.url_segment_classifier`,
      (
        SELECT
          segment,
          LENGTH(segment) AS length,
          calculateEntropy(segment) AS entropy,
          calculateIndexOfCoincidence(segment) AS ioc,
          getCharacterRatios(segment).letter_ratio AS letter_ratio,
          getCharacterRatios(segment).digit_ratio AS digit_ratio,
          getCharacterRatios(segment).special_ratio AS special_ratio,
          getCharacterRatios(segment).uppercase_ratio AS uppercase_ratio,
          getCharacterRatios(segment).vowel_ratio AS vowel_ratio,
          CAST(getNumberPositions(segment).has_number_start AS INT64) AS has_number_start,
          CAST(getNumberPositions(segment).has_number_middle AS INT64) AS has_number_middle,
          CAST(getNumberPositions(segment).has_number_end AS INT64) AS has_number_end,
          getNumberPositions(segment).consecutive_digits_max AS consecutive_digits_max,
          CAST(getPatternFeatures(segment).has_uuid_pattern AS INT64) AS has_uuid_pattern,
          CAST(getPatternFeatures(segment).has_hex_pattern AS INT64) AS has_hex_pattern,
          CAST(getPatternFeatures(segment).has_base64_pattern AS INT64) AS has_base64_pattern,
          CAST(getPatternFeatures(segment).has_email_pattern AS INT64) AS has_email_pattern,
          getPatternFeatures(segment).segment_count AS segment_count,
          getPatternFeatures(segment).avg_segment_length AS avg_segment_length,
          getBigramFeatures(segment).num_bigrams AS num_bigrams,
          getBigramFeatures(segment).digit_bigrams AS digit_bigrams,
          getBigramFeatures(segment).letter_bigrams AS letter_bigrams,
          getBigramFeatures(segment).mixed_bigrams AS mixed_bigrams,
          getBigramFeatures(segment).special_bigrams AS special_bigrams,
          CASE WHEN getBigramFeatures(segment).num_bigrams > 0 
            THEN getBigramFeatures(segment).digit_bigrams / getBigramFeatures(segment).num_bigrams 
            ELSE 0 
          END AS digit_bigram_ratio,
          CASE WHEN getBigramFeatures(segment).num_bigrams > 0 
            THEN getBigramFeatures(segment).letter_bigrams / getBigramFeatures(segment).num_bigrams 
            ELSE 0 
          END AS letter_bigram_ratio,
          CASE WHEN getBigramFeatures(segment).num_bigrams > 0 
            THEN getBigramFeatures(segment).mixed_bigrams / getBigramFeatures(segment).num_bigrams 
            ELSE 0 
          END AS mixed_bigram_ratio,
          CASE WHEN getBigramFeatures(segment).num_bigrams > 0 
            THEN getBigramFeatures(segment).special_bigrams / getBigramFeatures(segment).num_bigrams 
            ELSE 0 
          END AS special_bigram_ratio,
          CASE WHEN LENGTH(segment) > 0 
            THEN calculateEntropy(segment) / LOG(LENGTH(segment), 2)
            ELSE 0 
          END AS normalized_entropy,
          (
            calculateEntropy(segment) * 0.3 +
            getCharacterRatios(segment).digit_ratio * 0.2 +
            (1 - getCharacterRatios(segment).letter_ratio) * 0.2 +
            CASE WHEN getNumberPositions(segment).consecutive_digits_max > 3 THEN 0.3 ELSE 0 END
          ) AS complexity_score
        FROM test_samples
      )
    ) p
  JOIN test_samples ts ON p.segment = ts.segment
)

SELECT
  segment,
  expected_type,
  CASE 
    WHEN predicted_is_pii = 1 THEN 'PII Detected'
    ELSE 'Normal URL Segment'
  END AS prediction,
  pii_probability,
  CASE 
    WHEN (expected_type LIKE 'PII%' AND predicted_is_pii = 1) OR 
         (expected_type = 'Normal URL' AND predicted_is_pii = 0) 
    THEN '✓ Correct'
    ELSE '✗ Wrong'
  END AS result
FROM predictions
ORDER BY 
  CASE WHEN expected_type LIKE 'PII%' THEN 0 ELSE 1 END,
  pii_probability DESC
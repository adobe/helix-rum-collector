-- Improved PII Detection Model v3 with query string handling
-- Fixes: Strip query strings from URL segments before processing

-- Include all feature extraction UDFs from v2
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
  has_ip_pattern BOOL,
  has_mac_pattern BOOL,
  has_jwt_pattern BOOL,
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
      has_ip_pattern: false,
      has_mac_pattern: false,
      has_jwt_pattern: false,
      segment_count: 0,
      avg_segment_length: 0
    };
  }
  
  const has_uuid_pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  
  const hexChars = str.match(/[0-9a-f]/gi) || [];
  const has_hex_pattern = hexChars.length / str.length > 0.8;
  
  const has_base64_pattern = /^[A-Za-z0-9+/_-]+={0,2}$/.test(str) && str.length % 4 === 0;
  
  const has_email_pattern = /@|%40/.test(str);
  
  // IP pattern (simplified)
  const has_ip_pattern = /^[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}$/.test(str) ||
                         /^[0-9a-f:]+$/i.test(str) && str.includes(':');
  
  // MAC address pattern
  const has_mac_pattern = /^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i.test(str);
  
  // JWT pattern (three base64 parts separated by dots)
  const has_jwt_pattern = /^[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$/.test(str);
  
  const segments = str.split(/[-_.]/);
  const segment_count = segments.length;
  const avg_segment_length = segments.reduce((sum, seg) => sum + seg.length, 0) / segment_count;
  
  return {
    has_uuid_pattern: has_uuid_pattern,
    has_hex_pattern: has_hex_pattern,
    has_base64_pattern: has_base64_pattern,
    has_email_pattern: has_email_pattern,
    has_ip_pattern: has_ip_pattern,
    has_mac_pattern: has_mac_pattern,
    has_jwt_pattern: has_jwt_pattern,
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

CREATE TEMP FUNCTION getLinguisticFeatures(str STRING)
RETURNS STRUCT<
  consonant_cluster_ratio FLOAT64,
  max_consonant_cluster INT64,
  has_double_letters BOOL,
  pronounceability_score FLOAT64,
  letter_frequency_score FLOAT64
>
LANGUAGE js AS """
  if (!str || str.length === 0) {
    return {
      consonant_cluster_ratio: 0,
      max_consonant_cluster: 0,
      has_double_letters: false,
      pronounceability_score: 0,
      letter_frequency_score: 0
    };
  }
  
  const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'y']);
  const lowerStr = str.toLowerCase();
  
  // Consonant clusters
  let consonantClusters = 0;
  let maxCluster = 0;
  let currentCluster = 0;
  
  for (let i = 0; i < lowerStr.length; i++) {
    if (/[a-z]/.test(lowerStr[i]) && !vowels.has(lowerStr[i])) {
      currentCluster++;
      maxCluster = Math.max(maxCluster, currentCluster);
    } else {
      if (currentCluster >= 2) consonantClusters++;
      currentCluster = 0;
    }
  }
  if (currentCluster >= 2) consonantClusters++;
  
  // Double letters
  let hasDouble = false;
  for (let i = 0; i < lowerStr.length - 1; i++) {
    if (lowerStr[i] === lowerStr[i + 1] && /[a-z]/.test(lowerStr[i])) {
      hasDouble = true;
      break;
    }
  }
  
  // Pronounceability score (simplified - ratio of vowels to consonants)
  let vowelCount = 0;
  let consonantCount = 0;
  for (let char of lowerStr) {
    if (/[a-z]/.test(char)) {
      if (vowels.has(char)) vowelCount++;
      else consonantCount++;
    }
  }
  
  const pronounceability = consonantCount > 0 ? 
    Math.min(vowelCount / consonantCount, 1.0) : 1.0;
  
  // Letter frequency score (English letter frequencies)
  const englishFreq = {
    'e': 0.127, 't': 0.091, 'a': 0.082, 'o': 0.075, 'i': 0.070,
    'n': 0.067, 's': 0.063, 'h': 0.061, 'r': 0.060, 'd': 0.043,
    'l': 0.040, 'c': 0.028, 'u': 0.028, 'm': 0.024, 'w': 0.024,
    'f': 0.022, 'g': 0.020, 'y': 0.020, 'p': 0.019, 'b': 0.015,
    'v': 0.010, 'k': 0.008, 'j': 0.002, 'x': 0.002, 'q': 0.001, 'z': 0.001
  };
  
  let freqScore = 0;
  let letterCount = 0;
  for (let char of lowerStr) {
    if (/[a-z]/.test(char)) {
      freqScore += englishFreq[char] || 0.001;
      letterCount++;
    }
  }
  
  return {
    consonant_cluster_ratio: lowerStr.length > 0 ? consonantClusters / lowerStr.length : 0,
    max_consonant_cluster: maxCluster,
    has_double_letters: hasDouble,
    pronounceability_score: pronounceability,
    letter_frequency_score: letterCount > 0 ? freqScore / letterCount : 0
  };
""";

-- Enhanced PII generation functions (same as v2)
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
  // More realistic PNR generation
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var vowels = 'AEIOU';
  var consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
  
  var pnr = '';
  // Ensure mix of characters to avoid real words
  for (var i = 0; i < 6; i++) {
    if (i % 2 === 0 && Math.random() > 0.3) {
      // Higher chance of consonants in even positions
      pnr += consonants.charAt(Math.floor(Math.random() * consonants.length));
    } else if (Math.random() > 0.5) {
      // Mix in numbers
      pnr += Math.floor(Math.random() * 10).toString();
    } else {
      pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return pnr;
""";

CREATE TEMP FUNCTION generateAPIKey() RETURNS STRING
LANGUAGE js AS """
  var formats = [
    // AWS style
    () => 'AKIA' + Math.random().toString(36).substring(2, 18).toUpperCase(),
    // Generic hex
    () => {
      var hex = '';
      for (var i = 0; i < 32; i++) {
        hex += Math.floor(Math.random() * 16).toString(16);
      }
      return hex;
    },
    // Base64 style
    () => {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      var result = '';
      for (var i = 0; i < 40; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
  ];
  return formats[Math.floor(Math.random() * formats.length)]();
""";

CREATE TEMP FUNCTION generateTrackingID() RETURNS STRING
LANGUAGE js AS """
  var formats = [
    // FedEx style (12 digits)
    () => Math.floor(Math.random() * 900000000000 + 100000000000).toString(),
    // UPS style (1Z + 16 chars)
    () => '1Z' + Math.random().toString(36).substring(2, 18).toUpperCase(),
    // USPS style (20-22 digits)
    () => Math.floor(Math.random() * 90000000000000000000 + 10000000000000000000).toString(),
    // DHL style
    () => Math.floor(Math.random() * 9000000000 + 1000000000).toString()
  ];
  return formats[Math.floor(Math.random() * formats.length)]();
""";

CREATE TEMP FUNCTION generateIPAddress() RETURNS STRING
LANGUAGE js AS """
  if (Math.random() > 0.8) {
    // IPv6 (simplified)
    var parts = [];
    for (var i = 0; i < 8; i++) {
      parts.push(Math.floor(Math.random() * 65536).toString(16));
    }
    return parts.join(':');
  } else {
    // IPv4
    return Math.floor(Math.random() * 256) + '.' +
           Math.floor(Math.random() * 256) + '.' +
           Math.floor(Math.random() * 256) + '.' +
           Math.floor(Math.random() * 256);
  }
""";

CREATE TEMP FUNCTION generateCryptoAddress() RETURNS STRING
LANGUAGE js AS """
  var formats = [
    // Bitcoin style (26-35 chars)
    () => {
      var chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      var prefix = ['1', '3', 'bc1'][Math.floor(Math.random() * 3)];
      var result = prefix;
      for (var i = 0; i < 33 - prefix.length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },
    // Ethereum style (0x + 40 hex)
    () => {
      var hex = '0x';
      for (var i = 0; i < 40; i++) {
        hex += Math.floor(Math.random() * 16).toString(16);
      }
      return hex;
    }
  ];
  return formats[Math.floor(Math.random() * formats.length)]();
""";

-- Create the improved model v3 with cleaned data
CREATE OR REPLACE MODEL `helix-225321.pii_detection.url_segment_classifier_v3`
OPTIONS(
  model_type='LOGISTIC_REG',
  input_label_cols=['is_pii'],
  auto_class_weights=TRUE,
  data_split_method='RANDOM',
  data_split_eval_fraction=0.2,
  l1_reg=0.1,
  l2_reg=0.1
) AS

-- Training data with proper query string handling
WITH real_segments AS (
  -- Extract real URL segments with query strings stripped
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
      WHERE time >= '2025-05-13'  -- 10 days of data
        AND time < '2025-05-23'
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
      AND NOT REGEXP_CONTAINS(cleaned_segment, r'^[0-9a-f]{32,}$')
      AND NOT REGEXP_CONTAINS(cleaned_segment, r'^[0-9]{10,}$')
      AND NOT REGEXP_CONTAINS(cleaned_segment, r'@')
      -- Additional filters for common PII patterns
      AND NOT REGEXP_CONTAINS(cleaned_segment, r'^[0-9]{3}-[0-9]{2}-[0-9]{4}$')  -- SSN
      AND NOT REGEXP_CONTAINS(cleaned_segment, r'^[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}$')  -- IP
      -- Also exclude common file extensions that might have been split
      AND NOT REGEXP_CONTAINS(cleaned_segment, r'\\.(html|htm|php|jsp|aspx|pdf|jpg|png|gif|css|js|json|xml)$')
  )
  LIMIT 500000  -- 10x larger
),

synthetic_pii AS (
  -- Generate 500,000 synthetic PII samples with more variety
  SELECT 
    CASE 
      WHEN MOD(ROW_NUMBER() OVER(), 16) = 0 THEN generateUUID()
      WHEN MOD(ROW_NUMBER() OVER(), 16) = 1 THEN generateCompactUUID()
      WHEN MOD(ROW_NUMBER() OVER(), 16) = 2 THEN generateBase64ID(CAST(5 + RAND() * 35 AS INT64))
      WHEN MOD(ROW_NUMBER() OVER(), 16) = 3 THEN generateSessionID()
      WHEN MOD(ROW_NUMBER() OVER(), 16) = 4 THEN generatePNR()
      WHEN MOD(ROW_NUMBER() OVER(), 16) = 5 THEN 
        CONCAT(
          CAST(CAST(RAND() * 900 + 100 AS INT64) AS STRING), '-',
          CAST(CAST(RAND() * 900 + 100 AS INT64) AS STRING), '-',
          CAST(CAST(RAND() * 9000 + 1000 AS INT64) AS STRING)
        )
      WHEN MOD(ROW_NUMBER() OVER(), 16) = 6 THEN 
        CONCAT(
          'user', CAST(CAST(RAND() * 100000 AS INT64) AS STRING),
          '%40',
          CASE CAST(FLOOR(RAND() * 6) AS INT64)
            WHEN 0 THEN 'gmail'
            WHEN 1 THEN 'yahoo'
            WHEN 2 THEN 'outlook'
            WHEN 3 THEN 'company'
            WHEN 4 THEN 'hotmail'
            ELSE 'example'
          END,
          '.com'
        )
      WHEN MOD(ROW_NUMBER() OVER(), 16) = 7 THEN CONCAT('C', CAST(CAST(RAND() * 900000000 + 100000000 AS INT64) AS STRING))
      WHEN MOD(ROW_NUMBER() OVER(), 16) = 8 THEN generateAPIKey()
      WHEN MOD(ROW_NUMBER() OVER(), 16) = 9 THEN generateTrackingID()
      WHEN MOD(ROW_NUMBER() OVER(), 16) = 10 THEN generateIPAddress()
      WHEN MOD(ROW_NUMBER() OVER(), 16) = 11 THEN generateCryptoAddress()
      WHEN MOD(ROW_NUMBER() OVER(), 16) = 12 THEN 
        -- SSN pattern
        CONCAT(
          CAST(CAST(RAND() * 900 + 100 AS INT64) AS STRING), '-',
          CAST(CAST(RAND() * 90 + 10 AS INT64) AS STRING), '-',
          CAST(CAST(RAND() * 9000 + 1000 AS INT64) AS STRING)
        )
      WHEN MOD(ROW_NUMBER() OVER(), 16) = 13 THEN
        -- Credit card last 4
        CONCAT('****', CAST(CAST(RAND() * 9000 + 1000 AS INT64) AS STRING))
      WHEN MOD(ROW_NUMBER() OVER(), 16) = 14 THEN
        -- Order ID pattern
        CONCAT('ORD-', CAST(CAST(RAND() * 9000000 + 1000000 AS INT64) AS STRING))
      ELSE 
        -- Hash-like pattern
        SUBSTR(TO_HEX(MD5(CAST(RAND() AS STRING))), 1, CAST(10 + RAND() * 22 AS INT64))
    END AS segment,
    1 AS is_pii,
    'synthetic' AS source
  FROM UNNEST(GENERATE_ARRAY(1, 500000)) AS num
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
    CAST(getPatternFeatures(segment).has_ip_pattern AS INT64) AS has_ip_pattern,
    CAST(getPatternFeatures(segment).has_mac_pattern AS INT64) AS has_mac_pattern,
    CAST(getPatternFeatures(segment).has_jwt_pattern AS INT64) AS has_jwt_pattern,
    getPatternFeatures(segment).segment_count AS segment_count,
    getPatternFeatures(segment).avg_segment_length AS avg_segment_length,
    
    -- Bigram features
    getBigramFeatures(segment).num_bigrams AS num_bigrams,
    getBigramFeatures(segment).digit_bigrams AS digit_bigrams,
    getBigramFeatures(segment).letter_bigrams AS letter_bigrams,
    getBigramFeatures(segment).mixed_bigrams AS mixed_bigrams,
    getBigramFeatures(segment).special_bigrams AS special_bigrams,
    
    -- Linguistic features
    getLinguisticFeatures(segment).consonant_cluster_ratio AS consonant_cluster_ratio,
    getLinguisticFeatures(segment).max_consonant_cluster AS max_consonant_cluster,
    CAST(getLinguisticFeatures(segment).has_double_letters AS INT64) AS has_double_letters,
    getLinguisticFeatures(segment).pronounceability_score AS pronounceability_score,
    getLinguisticFeatures(segment).letter_frequency_score AS letter_frequency_score
    
  FROM all_segments
  WHERE segment IS NOT NULL
    AND LENGTH(segment) >= 5
    AND LENGTH(segment) <= 50
)

SELECT
  is_pii,
  
  -- All numeric features for the model
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
  has_ip_pattern,
  has_mac_pattern,
  has_jwt_pattern,
  segment_count,
  avg_segment_length,
  num_bigrams,
  digit_bigrams,
  letter_bigrams,
  mixed_bigrams,
  special_bigrams,
  consonant_cluster_ratio,
  max_consonant_cluster,
  has_double_letters,
  pronounceability_score,
  letter_frequency_score,
  
  -- Derived features
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
  
  -- PNR-specific score
  CASE 
    WHEN length = 6 AND uppercase_ratio = 1.0 THEN
      (1 - pronounceability_score) * 0.4 +
      (1 - letter_frequency_score) * 0.3 +
      consonant_cluster_ratio * 0.3
    ELSE 0
  END AS pnr_likelihood_score

FROM feature_extraction;
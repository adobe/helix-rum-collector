-- Bigram analysis to identify patterns in real vs PII segments
-- This will help us understand which bigrams are more common in each category

-- First, let's include the UDF for bigram extraction
CREATE TEMP FUNCTION getBigramVector(str STRING) RETURNS ARRAY<STRUCT<bigram STRING, count INT64>>
LANGUAGE js AS """
  if (!str || str.length < 2) return [];
  
  // Normalize string: lowercase letters, numbers, dash, underscore, % for special
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
  
  // Count bigrams
  const bigramCounts = {};
  for (let i = 0; i < normalized.length - 1; i++) {
    const bigram = normalized.substr(i, 2);
    bigramCounts[bigram] = (bigramCounts[bigram] || 0) + 1;
  }
  
  // Convert to array
  const result = [];
  for (let bigram in bigramCounts) {
    result.push({bigram: bigram, count: bigramCounts[bigram]});
  }
  
  return result;
""";

-- Create temporary tables from our CSV data
CREATE TEMP TABLE real_segments AS (
  -- In production, this would read from the CSV or directly from the source table
  SELECT 
    'content' AS segment UNION ALL
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
    SELECT 'terms'
);

CREATE TEMP TABLE synthetic_segments AS (
  -- Sample synthetic PII data
  SELECT 
    '5785da909b0ace1743ed59576886d00c' AS segment UNION ALL
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
    SELECT 'user123%40example.net'
);

-- Extract bigrams from real segments
WITH real_bigrams AS (
  SELECT 
    bigram_data.bigram,
    SUM(bigram_data.count) AS real_count,
    COUNT(DISTINCT segment) AS real_segments_with_bigram
  FROM real_segments,
  UNNEST(getBigramVector(segment)) AS bigram_data
  GROUP BY bigram
),

-- Extract bigrams from synthetic PII
synthetic_bigrams AS (
  SELECT 
    bigram_data.bigram,
    SUM(bigram_data.count) AS synthetic_count,
    COUNT(DISTINCT segment) AS synthetic_segments_with_bigram
  FROM synthetic_segments,
  UNNEST(getBigramVector(segment)) AS bigram_data
  GROUP BY bigram
),

-- Combine and analyze
combined_bigrams AS (
  SELECT 
    COALESCE(r.bigram, s.bigram) AS bigram,
    COALESCE(r.real_count, 0) AS real_count,
    COALESCE(r.real_segments_with_bigram, 0) AS real_segments_count,
    COALESCE(s.synthetic_count, 0) AS synthetic_count,
    COALESCE(s.synthetic_segments_with_bigram, 0) AS synthetic_segments_count,
    -- Calculate relative frequencies
    CASE 
      WHEN COALESCE(r.real_count, 0) + COALESCE(s.synthetic_count, 0) > 0
      THEN COALESCE(r.real_count, 0) / (COALESCE(r.real_count, 0) + COALESCE(s.synthetic_count, 0))
      ELSE 0
    END AS real_ratio,
    CASE 
      WHEN COALESCE(r.real_count, 0) + COALESCE(s.synthetic_count, 0) > 0
      THEN COALESCE(s.synthetic_count, 0) / (COALESCE(r.real_count, 0) + COALESCE(s.synthetic_count, 0))
      ELSE 0
    END AS synthetic_ratio
  FROM real_bigrams r
  FULL OUTER JOIN synthetic_bigrams s ON r.bigram = s.bigram
)

-- Select top bigrams that distinguish between real and synthetic
SELECT 
  bigram,
  real_count,
  synthetic_count,
  ROUND(real_ratio, 3) AS real_ratio,
  ROUND(synthetic_ratio, 3) AS synthetic_ratio,
  -- Create a discriminative score (higher = more indicative of category)
  CASE 
    WHEN real_ratio > 0.8 THEN 'Strong Real Indicator'
    WHEN synthetic_ratio > 0.8 THEN 'Strong PII Indicator'
    WHEN real_ratio > 0.6 THEN 'Real Indicator'
    WHEN synthetic_ratio > 0.6 THEN 'PII Indicator'
    ELSE 'Neutral'
  END AS indicator_type
FROM combined_bigrams
WHERE real_count + synthetic_count >= 2  -- Filter out rare bigrams
ORDER BY ABS(real_ratio - 0.5) DESC  -- Order by how discriminative the bigram is
LIMIT 50
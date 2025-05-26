-- Compare all v1.1.x model variants with a common test set
WITH test_data AS (
  -- Create a fresh test set
  WITH real_segments AS (
    SELECT DISTINCT
      cleaned_segment AS segment,
      0 AS is_pii
    FROM (
      WITH urls AS (
        SELECT DISTINCT url
        FROM helix_rum.cluster_all
        WHERE time >= '2025-05-23 12:00:00'
          AND time < '2025-05-23 13:00:00'
        LIMIT 100000
      ),
      segments_array AS (
        SELECT DISTINCT
          SPLIT(url, '/') AS segments
        FROM urls
      ),
      raw_segments AS (
        SELECT DISTINCT
          segment AS raw_segment,
          CASE 
            WHEN STRPOS(segment, '?') > 0 THEN SUBSTR(segment, 1, STRPOS(segment, '?') - 1)
            ELSE segment
          END AS cleaned_segment
        FROM segments_array
        INNER JOIN UNNEST(segments_array.segments) AS segment
        WITH OFFSET
        WHERE offset > 2
      )
      SELECT DISTINCT cleaned_segment
      FROM raw_segments
      WHERE LENGTH(cleaned_segment) >= 5
        AND LENGTH(cleaned_segment) <= 50
        AND NOT REGEXP_CONTAINS(cleaned_segment, r'^[0-9a-f]{32}$')
        AND NOT REGEXP_CONTAINS(cleaned_segment, r'^[0-9]{10,}$')
        AND NOT REGEXP_CONTAINS(cleaned_segment, r'@')
    )
    LIMIT 5000
  ),
  
  synthetic_pii AS (
    SELECT 
      CASE 
        WHEN MOD(ROW_NUMBER() OVER(), 8) = 0 THEN 
          -- UUID
          CONCAT(
            LOWER(SUBSTR(TO_HEX(MD5(CAST(RAND() AS STRING))), 1, 8)), '-',
            LOWER(SUBSTR(TO_HEX(MD5(CAST(RAND() * 2 AS STRING))), 1, 4)), '-',
            '4', LOWER(SUBSTR(TO_HEX(MD5(CAST(RAND() * 3 AS STRING))), 1, 3)), '-',
            LOWER(SUBSTR(TO_HEX(MD5(CAST(RAND() * 4 AS STRING))), 1, 4)), '-',
            LOWER(SUBSTR(TO_HEX(MD5(CAST(RAND() * 5 AS STRING))), 1, 12))
          )
        WHEN MOD(ROW_NUMBER() OVER(), 8) = 1 THEN 
          -- Compact UUID
          LOWER(SUBSTR(CONCAT(TO_HEX(MD5(CAST(RAND() AS STRING))), TO_HEX(MD5(CAST(RAND() * 2 AS STRING)))), 1, 32))
        WHEN MOD(ROW_NUMBER() OVER(), 8) = 2 THEN 
          -- Base64 ID
          CONCAT(
            SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', 
                   CAST(FLOOR(RAND() * 64) + 1 AS INT64), 1),
            SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', 
                   CAST(FLOOR(RAND() * 64) + 1 AS INT64), 1),
            SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', 
                   CAST(FLOOR(RAND() * 64) + 1 AS INT64), 1),
            SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', 
                   CAST(FLOOR(RAND() * 64) + 1 AS INT64), 1),
            SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', 
                   CAST(FLOOR(RAND() * 64) + 1 AS INT64), 1),
            SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', 
                   CAST(FLOOR(RAND() * 64) + 1 AS INT64), 1),
            SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', 
                   CAST(FLOOR(RAND() * 64) + 1 AS INT64), 1),
            SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', 
                   CAST(FLOOR(RAND() * 64) + 1 AS INT64), 1)
          )
        WHEN MOD(ROW_NUMBER() OVER(), 8) = 3 THEN 
          -- Session ID
          LOWER(SUBSTR(TO_HEX(MD5(CAST(RAND() AS STRING))), 1, 16))
        WHEN MOD(ROW_NUMBER() OVER(), 8) = 4 THEN 
          -- PNR
          CONCAT(
            SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', CAST(FLOOR(RAND() * 36) + 1 AS INT64), 1),
            SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', CAST(FLOOR(RAND() * 36) + 1 AS INT64), 1),
            SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', CAST(FLOOR(RAND() * 36) + 1 AS INT64), 1),
            SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', CAST(FLOOR(RAND() * 36) + 1 AS INT64), 1),
            SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', CAST(FLOOR(RAND() * 36) + 1 AS INT64), 1),
            SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', CAST(FLOOR(RAND() * 36) + 1 AS INT64), 1)
          )
        WHEN MOD(ROW_NUMBER() OVER(), 8) = 5 THEN 
          -- Phone number
          CONCAT(
            CAST(CAST(RAND() * 900 + 100 AS INT64) AS STRING), '-',
            CAST(CAST(RAND() * 900 + 100 AS INT64) AS STRING), '-',
            CAST(CAST(RAND() * 9000 + 1000 AS INT64) AS STRING)
          )
        WHEN MOD(ROW_NUMBER() OVER(), 8) = 6 THEN 
          -- Email
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
        ELSE 
          -- Customer ID
          CONCAT('C', CAST(CAST(RAND() * 90000000 + 10000000 AS INT64) AS STRING))
      END AS segment,
      1 AS is_pii
    FROM UNNEST(GENERATE_ARRAY(1, 5000)) AS num
  )
  
  SELECT * FROM real_segments
  UNION ALL
  SELECT * FROM synthetic_pii
),

predictions AS (
  SELECT 
    segment,
    is_pii,
    
    -- v1.1 (logistic regression)
    CASE 
      WHEN v1_1.predicted_is_pii_probs[OFFSET(0)].label = 1 
      THEN v1_1.predicted_is_pii_probs[OFFSET(0)].prob
      ELSE v1_1.predicted_is_pii_probs[OFFSET(1)].prob
    END AS v1_1_pii_prob,
    
    -- v1.1.1 (boosted trees)
    CASE 
      WHEN v1_1_1.predicted_is_pii = 1 THEN 1.0 ELSE 0.0
    END AS v1_1_1_pii_prob,
    
    -- v1.1.2 (DNN)
    CASE 
      WHEN v1_1_2.predicted_is_pii_probs[OFFSET(0)].label = 1 
      THEN v1_1_2.predicted_is_pii_probs[OFFSET(0)].prob
      ELSE v1_1_2.predicted_is_pii_probs[OFFSET(1)].prob
    END AS v1_1_2_pii_prob,
    
    -- v1.1.3 (bigram vector)
    CASE 
      WHEN v1_1_3.predicted_is_pii_probs[OFFSET(0)].label = 1 
      THEN v1_1_3.predicted_is_pii_probs[OFFSET(0)].prob
      ELSE v1_1_3.predicted_is_pii_probs[OFFSET(1)].prob
    END AS v1_1_3_pii_prob
    
  FROM test_data
  
  LEFT JOIN ML.PREDICT(MODEL `helix-225321.pii_detection.url_segment_classifier_v1_1`,
    (SELECT segment FROM test_data)) AS v1_1
  ON test_data.segment = v1_1.segment
  
  LEFT JOIN ML.PREDICT(MODEL `helix-225321.pii_detection.url_segment_classifier_v1_1_1`,
    (SELECT segment FROM test_data)) AS v1_1_1
  ON test_data.segment = v1_1_1.segment
  
  LEFT JOIN ML.PREDICT(MODEL `helix-225321.pii_detection.url_segment_classifier_v1_1_2`,
    (SELECT segment FROM test_data)) AS v1_1_2
  ON test_data.segment = v1_1_2.segment
  
  LEFT JOIN ML.PREDICT(MODEL `helix-225321.pii_detection.url_segment_classifier_v1_1_3`,
    (SELECT segment FROM test_data)) AS v1_1_3
  ON test_data.segment = v1_1_3.segment
),

metrics AS (
  SELECT
    model_version,
    
    -- True Positives, False Positives, False Negatives, True Negatives
    SUM(CASE WHEN is_pii = 1 AND predicted_pii = 1 THEN 1 ELSE 0 END) AS true_positives,
    SUM(CASE WHEN is_pii = 0 AND predicted_pii = 1 THEN 1 ELSE 0 END) AS false_positives,
    SUM(CASE WHEN is_pii = 1 AND predicted_pii = 0 THEN 1 ELSE 0 END) AS false_negatives,
    SUM(CASE WHEN is_pii = 0 AND predicted_pii = 0 THEN 1 ELSE 0 END) AS true_negatives,
    
    COUNT(*) AS total_predictions
    
  FROM (
    SELECT 'v1.1 (logistic)' AS model_version, is_pii, CAST(v1_1_pii_prob > 0.5 AS INT64) AS predicted_pii FROM predictions
    UNION ALL
    SELECT 'v1.1.1 (boosted trees)' AS model_version, is_pii, CAST(v1_1_1_pii_prob > 0.5 AS INT64) AS predicted_pii FROM predictions
    UNION ALL
    SELECT 'v1.1.2 (DNN)' AS model_version, is_pii, CAST(v1_1_2_pii_prob > 0.5 AS INT64) AS predicted_pii FROM predictions
    UNION ALL
    SELECT 'v1.1.3 (bigram vector)' AS model_version, is_pii, CAST(v1_1_3_pii_prob > 0.5 AS INT64) AS predicted_pii FROM predictions
  )
  GROUP BY model_version
)

SELECT
  model_version,
  
  -- Precision: TP / (TP + FP)
  SAFE_DIVIDE(true_positives, true_positives + false_positives) AS precision,
  
  -- Recall: TP / (TP + FN)  
  SAFE_DIVIDE(true_positives, true_positives + false_negatives) AS recall,
  
  -- Accuracy: (TP + TN) / Total
  SAFE_DIVIDE(true_positives + true_negatives, total_predictions) AS accuracy,
  
  -- F1 Score: 2 * (Precision * Recall) / (Precision + Recall)
  SAFE_DIVIDE(
    2 * SAFE_DIVIDE(true_positives, true_positives + false_positives) * 
        SAFE_DIVIDE(true_positives, true_positives + false_negatives),
    SAFE_DIVIDE(true_positives, true_positives + false_positives) + 
    SAFE_DIVIDE(true_positives, true_positives + false_negatives)
  ) AS f1_score,
  
  -- Raw counts for analysis
  CONCAT(true_positives, '/', true_positives + false_negatives) AS pii_detected,
  
  -- Efficiency: (True Negatives) / (Total Non-PII)
  SAFE_DIVIDE(true_negatives, true_negatives + false_positives) AS specificity

FROM metrics
ORDER BY f1_score DESC;
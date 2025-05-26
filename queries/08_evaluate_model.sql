-- Evaluate the trained PII detection model
-- Run this after the model training completes

-- 1. Get overall model performance metrics
SELECT
  *
FROM
  ML.EVALUATE(MODEL `helix-225321.pii_detection.url_segment_classifier`);

-- 2. Get feature importance rankings
SELECT
  processed_input AS feature_name,
  ABS(weight) AS absolute_weight,
  weight,
  CASE 
    WHEN weight > 0 THEN 'Positive (indicates PII)'
    ELSE 'Negative (indicates normal URL)'
  END AS weight_direction
FROM
  ML.FEATURE_INFO(MODEL `helix-225321.pii_detection.url_segment_classifier`)
ORDER BY
  ABS(weight) DESC;

-- 3. Get confusion matrix details
SELECT
  *
FROM
  ML.CONFUSION_MATRIX(MODEL `helix-225321.pii_detection.url_segment_classifier`);

-- 4. Test predictions on sample data
WITH test_samples AS (
  SELECT 'about' AS segment UNION ALL
  SELECT 'contact' UNION ALL
  SELECT 'privacy' UNION ALL
  SELECT 'search' UNION ALL
  SELECT 'login' UNION ALL
  SELECT '5785da909b0ace1743ed59576886d00c' UNION ALL
  SELECT 'user123@example.com' UNION ALL
  SELECT 'ABC123' UNION ALL
  SELECT '954-762-7979' UNION ALL
  SELECT 'session_9f86d081' UNION ALL
  SELECT 'C4190833' UNION ALL
  SELECT 'xZ7i5U'
)
SELECT
  segment,
  predicted_is_pii,
  ROUND(predicted_is_pii_probs[OFFSET(1)].prob, 4) AS pii_probability,
  CASE 
    WHEN predicted_is_pii = 1 THEN 'PII Detected'
    ELSE 'Normal URL Segment'
  END AS classification
FROM
  ML.PREDICT(MODEL `helix-225321.pii_detection.url_segment_classifier`,
    (SELECT segment FROM test_samples))
ORDER BY
  pii_probability DESC;
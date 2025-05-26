-- Evaluate the trained PII detection model
-- Run this after the model training completes

-- 1. Get overall model performance metrics
SELECT
  *
FROM
  ML.EVALUATE(MODEL `helix-225321.pii_detection.url_segment_classifier`);

-- 2. Get feature importance rankings
SELECT
  *
FROM
  ML.WEIGHTS(MODEL `helix-225321.pii_detection.url_segment_classifier`)
ORDER BY
  ABS(weight) DESC;
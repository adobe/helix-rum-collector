-- Evaluate v1.1.1 Boosted Trees model with test data
-- First, let's check the model schema
SELECT
  table_name,
  column_name,
  data_type
FROM `helix-225321.pii_detection.INFORMATION_SCHEMA.COLUMNS`
WHERE table_name = 'url_segment_classifier_v1_1_1'
ORDER BY ordinal_position;
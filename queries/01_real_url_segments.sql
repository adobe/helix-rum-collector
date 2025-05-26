-- Query to extract real URL segments from helix_rum.cluster_all
-- Filters for segments between 5-7 characters in length
-- Excludes protocol and domain parts

WITH urls AS (
  SELECT DISTINCT
    hostname,
    url
  FROM helix_rum.cluster_all
  WHERE time > '2025-05-22'
),
segments_array AS (
  SELECT DISTINCT
    hostname,
    SPLIT(url, '/') AS segments
  FROM urls
),
segments AS (
  SELECT DISTINCT
    hostname,
    segment
  FROM segments_array
  INNER JOIN UNNEST(segments_array.segments) AS segment
  WITH OFFSET
  WHERE LENGTH(segment) >= 5
  AND LENGTH(segment) <= 7
  AND offset > 2 -- remove https://domain.com prefix from url
)
SELECT
  segment,
  COUNT(DISTINCT hostname) AS hostname_count
FROM segments
GROUP BY segment
ORDER BY hostname_count DESC
LIMIT 10000
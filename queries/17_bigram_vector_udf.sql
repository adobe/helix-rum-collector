-- JavaScript UDF to compute bigram frequency vector for the top 100 most informative bigrams
CREATE OR REPLACE FUNCTION `helix-225321.helix_rum.getBigramVector`(input STRING)
RETURNS STRUCT<
  -- Numeric bigrams (high PII signal)
  `00` INT64, `01` INT64, `02` INT64, `03` INT64, `04` INT64, `05` INT64, `06` INT64, `07` INT64, `08` INT64, `09` INT64,
  `10` INT64, `11` INT64, `12` INT64, `13` INT64, `14` INT64, `15` INT64, `16` INT64, `17` INT64, `18` INT64, `19` INT64,
  `20` INT64, `21` INT64, `22` INT64, `23` INT64, `24` INT64, `25` INT64, `26` INT64, `27` INT64, `28` INT64, `29` INT64,
  `30` INT64, `31` INT64, `32` INT64, `33` INT64, `34` INT64, `35` INT64, `36` INT64, `37` INT64, `38` INT64, `39` INT64,
  `40` INT64, `41` INT64, `42` INT64, `43` INT64, `44` INT64, `45` INT64, `46` INT64, `47` INT64, `48` INT64, `49` INT64,
  `50` INT64, `51` INT64, `52` INT64, `53` INT64, `54` INT64, `55` INT64, `56` INT64, `57` INT64, `58` INT64, `59` INT64,
  `60` INT64, `61` INT64, `62` INT64, `63` INT64, `64` INT64, `65` INT64, `66` INT64, `67` INT64, `68` INT64, `69` INT64,
  `70` INT64, `71` INT64, `72` INT64, `73` INT64, `74` INT64, `75` INT64, `76` INT64, `77` INT64, `78` INT64, `79` INT64,
  `80` INT64, `81` INT64, `82` INT64, `83` INT64, `84` INT64, `85` INT64, `86` INT64, `87` INT64, `88` INT64, `89` INT64,
  `90` INT64, `91` INT64, `92` INT64, `93` INT64, `94` INT64, `95` INT64, `96` INT64, `97` INT64, `98` INT64, `99` INT64
>
LANGUAGE js AS r"""
function getBigramVector(input) {
  if (!input) return null;
  
  // Normalize: lowercase and replace special chars with %
  const normalized = input.toLowerCase().replace(/[^a-z0-9\-_]/g, '%');
  
  // Initialize result object with all numeric bigrams set to 0
  const result = {};
  
  // Initialize all numeric bigrams (00-99) to 0
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      result[`${i}${j}`] = 0;
    }
  }
  
  // Count bigrams in the normalized string
  for (let i = 0; i < normalized.length - 1; i++) {
    const bigram = normalized.substring(i, i + 2);
    
    // Only count if it's a numeric bigram (00-99)
    if (/^\d\d$/.test(bigram)) {
      result[bigram] = (result[bigram] || 0) + 1;
    }
  }
  
  return result;
}

return getBigramVector(input);
""";

-- Example usage:
-- SELECT 
--   url,
--   getBigramVector(url) as bigram_vector
-- FROM `helix-225321.helix_rum.rum_events`
-- WHERE date = '2024-01-01'
-- LIMIT 10;

-- To extract specific bigram counts:
-- SELECT 
--   url,
--   getBigramVector(url).`42` as bigram_42_count,
--   getBigramVector(url).`79` as bigram_79_count,
--   getBigramVector(url).`95` as bigram_95_count
-- FROM `helix-225321.helix_rum.rum_events`
-- WHERE date = '2024-01-01'
-- LIMIT 100;
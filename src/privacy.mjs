/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Helper function to calculate Shannon entropy
function shannonEntropy(input) {
  const freq = {};
  for (const ch of input) freq[ch] = (freq[ch] || 0) + 1;
  const len = input.length;
  return Object.values(freq)
    .reduce((sum, n) => {
      const p = n / len;
      return sum - p * Math.log2(p);
    }, 0);
}

const withInputValidation = (fn) => (str, replaceWith) => {
  if (!str || typeof str.replace !== 'function') return str;
  return fn(str, replaceWith);
};

const filters = {
  jwt: withInputValidation((str, replaceWith) => str.replace(/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, replaceWith)),

  uuid: withInputValidation((str, replaceWith) => str.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, replaceWith)),

  email: withInputValidation((str, replaceWith) => str.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replaceWith)),

  pnr: withInputValidation((str, replaceWith) => {
    // Split the path into segments, preserving empty segments for slashes
    const segments = str.split('/');

    // Process each segment
    const processedSegments = segments.map((segment, index) => {
      // Skip empty segments (these represent slashes)
      if (!segment) return segment;

      // Check if segment matches PNR pattern (5-7 alphanumeric characters)
      const pnrMatch = segment.match(/^([A-Z0-9]{5,7})$/);

      const previousSegment = index > 0 ? segments[index - 1] : null;
      if (previousSegment === 'trip' && pnrMatch) {
        return replaceWith;
      }
      if (pnrMatch) {
        const pnr = pnrMatch[0];
        const entropy = shannonEntropy(pnr);
        // Calculate linguistic signals
        // 1. Check vowel ratio to identify pronounceable words like "GAMERS" and "CIRCLE"
        const vowels = (pnr.match(/[AEIOU]/g) || []).length;
        const letters = (pnr.match(/[A-Z]/g) || []).length;
        const vowelRatio = letters > 0 ? vowels / letters : 0;

        // 2. Check for numbers in the middle (common in PNRs but not in words)
        const hasMiddleNumbers = /[A-Z][0-9]+[A-Z]/.test(pnr);

        // 3. Base threshold we'll adjust
        let entropyThreshold = 2.2;

        // Adjust threshold based on signals
        // Higher vowel ratio → increase threshold (less likely to mask)
        if (vowelRatio >= 0.3) {
          entropyThreshold += 0.5; // Looks more like an English word, substantial increase
        }

        // Numbers in middle → decrease threshold (more likely to mask)
        if (hasMiddleNumbers) {
          entropyThreshold -= 0.3; // Looks more like a PNR
        }

        // Apply the dynamically adjusted threshold
        if (entropy >= entropyThreshold) {
          return replaceWith;
        }
      }
      return segment;
    });

    // Reconstruct the path with proper slashes
    return processedSegments.join('/');
  }),
};

export function cleanPath(path, withFilters = Object.keys(filters)) {
  if (!path) return path;

  return withFilters
    .filter(([key]) => typeof filters[key] === 'function')
    .reduce(
      (result, key) => filters[key](result, `<${key}>`),
      path,
    );
}

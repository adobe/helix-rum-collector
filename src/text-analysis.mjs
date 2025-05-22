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
import { bigramFreqs } from './path-bigrams.js';

/**
 * Calculate Shannon entropy of a string
 * Higher values indicate more randomness/unpredictability
 * @param {string} input - Input string to analyze
 * @returns {number} - Entropy score
 */
export function shannonEntropy(input) {
  const freq = {};
  for (const ch of input) freq[ch] = (freq[ch] || 0) + 1;
  const len = input.length;
  return Object.values(freq)
    .reduce((sum, n) => {
      const p = n / len;
      return sum - p * Math.log2(p);
    }, 0);
}

const A_CODE = 'a'.charCodeAt(0);

/**
 * Calculate bigram score of a string
 * Higher values indicate more natural language patterns
 * @param {string} text - Input text to analyze
 * @returns {number} - Bigram score
 */
export function bigramScore(text) {
  const letters = text.toLowerCase().replace(/[^a-z]/g, '');
  if (letters.length < 2) return 0;

  let sum = 0;
  for (let i = 0; i < letters.length - 1; i += 1) {
    const a = letters.charCodeAt(i) - A_CODE;
    const b = letters.charCodeAt(i + 1) - A_CODE;
    sum += bigramFreqs[a * 26 + b];
  }
  return sum; // sums probabilities, not counts
}

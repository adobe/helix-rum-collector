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
import { bigramFreqs } from './path-bigrams.mjs';
import { trigramFreqs } from './path-trigrams.mjs';
import { quadgramFreqs } from './path-quadgrams.mjs';
import { richTrigramFreqs } from './rich-path-trigrams.mjs';

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

/**
 * Trigram score – sum of probabilities from trigram frequency table
 * @param {string} text
 * @returns {number}
 */
export function trigramScore(text) {
  const letters = text.toLowerCase().replace(/[^a-z]/g, '');
  if (letters.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < letters.length - 2; i += 1) {
    const a = letters.charCodeAt(i) - A_CODE;
    const b = letters.charCodeAt(i + 1) - A_CODE;
    const c = letters.charCodeAt(i + 2) - A_CODE;
    sum += trigramFreqs[(a * 26 + b) * 26 + c];
  }
  return sum;
}

/**
 * Quadgram score – sum of probabilities from quadgram frequency table
 * @param {string} text
 * @returns {number}
 */
export function quadgramScore(text) {
  const letters = text.toLowerCase().replace(/[^a-z]/g, '');
  if (letters.length < 4) return 0;
  let sum = 0;
  for (let i = 0; i < letters.length - 3; i += 1) {
    const a = letters.charCodeAt(i) - A_CODE;
    const b = letters.charCodeAt(i + 1) - A_CODE;
    const c = letters.charCodeAt(i + 2) - A_CODE;
    const d = letters.charCodeAt(i + 3) - A_CODE;
    sum += quadgramFreqs[((a * 26 + b) * 26 + c) * 26 + d];
  }
  return sum;
}

/**
 * Rich-trigram score – same as trigramScore but uses a 57-symbol alphabet
 * (a-z, A-Z, . _ - : %). Characters outside that set are mapped to the
 * placeholder symbol %. The score is the sum of probabilities from the
 * pre-computed rich trigram frequency table.
 * @param {string} text
 * @returns {number}
 */
export function richTrigramScore(text) {
  const RICH_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ._-:%';
  const RICH_SIZE = RICH_ALPHABET.length; // 57

  const richIdx = (ch) => {
    const idx = RICH_ALPHABET.indexOf(ch);
    return idx === -1 ? RICH_SIZE - 1 : idx;
  };

  if (text.length < 3) return 0;

  // Use the text as-is (case sensitive), but map unknown chars to %
  let sum = 0;
  for (let i = 0; i < text.length - 2; i += 1) {
    const a = richIdx(text[i]);
    const b = richIdx(text[i + 1]);
    const c = richIdx(text[i + 2]);
    sum += richTrigramFreqs[(a * RICH_SIZE + b) * RICH_SIZE + c];
  }
  return sum;
}

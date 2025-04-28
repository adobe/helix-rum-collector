#!/usr/bin/env node
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
import { isOptelPath } from '../src/utils.mjs';

const WEIGHTS = [
  1969, // index 0
  -50, // index 1
  18, // index 2
  43, // index 3
  11, // index 4
  -5, // index 5
  6, // index 6
  9, // index 7
  14, // index 8
  42, // index 9
  29, // index 10
  39, // index 11
  32, // index 12
  -40, // index 13
  -38, // index 14
  -15, // index 15
  -14, // index 16
  -10, // index 17
  4, // index 18
  -48, // index 19
  -12, // index 20
];

/**
 * Generate hash collisions using a bottom-up approach.
 * Starts with random characters and builds strings that collide.
 * @param {string} [baseString='rum'] - Optional seed to guide collision generation
 * @param {number} [minLength=3] - Minimum length of generated string
 * @param {number} [maxLength=12] - Maximum length of generated string
 * @return {string} A string that collides with the same hash function
 */
function generateCollision(
  baseString = 'rum',
  minLength = 3,
  maxLength = 20,
) {
  const LOWERCASE_MIN = 97; // 'a'
  const LOWERCASE_MAX = 122; // 'z'

  // Known patterns that should never be returned directly
  const knownPatterns = ['rum', 'optel', 'operationaltelemetry'];

  // Function to check if a string is one of our known patterns
  const isKnownPattern = (str) => knownPatterns.includes(str);

  // If baseString is a valid collision, use it as a seed for modification
  if (isOptelPath(baseString)) {
    // We'll always make at least one change to avoid returning the original
    const chars = [...baseString].map((c) => c.charCodeAt(0));
    if (chars.length >= 2) {
      // Try a series of modifications to find a novel collision
      for (let attempt = 0; attempt < 50; attempt += 1) {
        // Choose two random positions
        const pos1 = Math.floor(Math.random() * chars.length);
        let pos2 = Math.floor(Math.random() * chars.length);
        while (pos2 === pos1) {
          pos2 = Math.floor(Math.random() * chars.length);
        }

        // Get weights for these positions
        const weight1 = pos1 < WEIGHTS.length ? WEIGHTS[pos1] : 1;
        const weight2 = pos2 < WEIGHTS.length ? WEIGHTS[pos2] : 1;

        // Save original characters
        const origChar1 = chars[pos1];
        const origChar2 = chars[pos2];

        // Try a new character at pos1
        const range = LOWERCASE_MAX - LOWERCASE_MIN + 1;
        const newChar1 = Math.floor(Math.random() * range) + LOWERCASE_MIN;

        // Calculate compensating character at pos2
        const delta = (newChar1 - origChar1);
        const adjustment = Math.round((weight1 * delta) / weight2);
        const newChar2 = origChar2 - adjustment;

        if (newChar2 >= LOWERCASE_MIN && newChar2 <= LOWERCASE_MAX) {
          chars[pos1] = newChar1;
          chars[pos2] = newChar2;

          const result = String.fromCharCode(...chars);
          if (isOptelPath(result) && !isKnownPattern(result)) {
            return result; // Found a valid novel collision
          }

          // Revert changes if it didn't work
          chars[pos1] = origChar1;
          chars[pos2] = origChar2;
        }
      }
    }
  }

  // Create several candidate strings to try
  const candidates = [];

  // Create random candidates until we have at least one valid novel collision
  while (candidates.length === 0) {
    // Try multiple candidate strings
    for (let candidateIdx = 0; candidateIdx < 5; candidateIdx += 1) {
      // Decide whether to start with a random string or modify a known pattern
      const useKnownPatternBase = Math.random() < 0.7; // 70% chance to use known pattern

      let chars;
      if (useKnownPatternBase) {
        // Start with one of our known patterns
        const pattern = knownPatterns[Math.floor(Math.random() * knownPatterns.length)];
        chars = [...pattern].map((c) => c.charCodeAt(0));

        // Ensure we make at least one change
        const changePos = Math.floor(Math.random() * chars.length);
        const range = LOWERCASE_MAX - LOWERCASE_MIN + 1;
        const newChar = Math.floor(Math.random() * range) + LOWERCASE_MIN;
        if (newChar !== chars[changePos]) {
          chars[changePos] = newChar;
        } else {
          chars[changePos] = ((newChar + 1 - LOWERCASE_MIN) % range) + LOWERCASE_MIN;
        }
      } else {
        // Generate a completely random string
        const strLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        chars = [];
        for (let i = 0; i < strLength; i += 1) {
          const range = LOWERCASE_MAX - LOWERCASE_MIN + 1;
          const randomChar = Math.floor(Math.random() * range) + LOWERCASE_MIN;
          chars.push(randomChar);
        }
      }

      // Try to modify this candidate to find a valid collision
      let attempts = 0;
      const maxAttempts = 2000;

      while (attempts < maxAttempts) {
        attempts += 1;

        // Pick two positions to adjust
        const pos1 = Math.floor(Math.random() * chars.length);
        let pos2 = Math.floor(Math.random() * chars.length);
        while (pos2 === pos1) {
          pos2 = Math.floor(Math.random() * chars.length);
        }

        // Get weights for these positions
        const weight1 = pos1 < WEIGHTS.length ? WEIGHTS[pos1] : 1;
        const weight2 = pos2 < WEIGHTS.length ? WEIGHTS[pos2] : 1;

        // Save original characters
        const origChar1 = chars[pos1];
        const origChar2 = chars[pos2];

        // Try a new character at pos1
        const range = LOWERCASE_MAX - LOWERCASE_MIN + 1;
        const newChar1 = Math.floor(Math.random() * range) + LOWERCASE_MIN;

        // Calculate compensating character at pos2
        const delta = (newChar1 - origChar1);
        const adjustment = Math.round((weight1 * delta) / weight2);
        const newChar2 = origChar2 - adjustment;

        if (newChar2 >= LOWERCASE_MIN && newChar2 <= LOWERCASE_MAX) {
          chars[pos1] = newChar1;
          chars[pos2] = newChar2;

          const result = String.fromCharCode(...chars);
          if (isOptelPath(result) && !isKnownPattern(result)) {
            candidates.push(result); // Found a valid, novel collision
            break;
          }

          // Revert changes if didn't work
          chars[pos1] = origChar1;
          chars[pos2] = origChar2;
        }
      }
    }
  }

  // Return a random valid novel collision
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// Update the output to use the new algorithm
for (let i = 0; i < 10; i += 1) {
  const collision = generateCollision();
  console.log(collision, isOptelPath(collision));
}

// Generate collisions until we find one that doesn't start with a specified prefix
function findNonPrefixCollision(prefix = 'operational') {
  let attempts = 0;
  let collision;

  console.log(`Searching for a collision that does not start with "${prefix}"...`);

  do {
    attempts += 1;
    collision = generateCollision();

    if (attempts % 100 === 0) {
      console.log(`Attempted ${attempts} collisions so far...`);
    }
  } while (collision.startsWith(prefix));
  console.log(collision, isOptelPath(collision));

  return collision;
}

// Run the function to find a non-operational collision
findNonPrefixCollision('op');
findNonPrefixCollision('o');

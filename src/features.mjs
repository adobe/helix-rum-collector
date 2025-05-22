/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
export const digitRatio = (str) => {
  if (!str) return 0;
  const digits = (str.match(/[0-9]/g) || []).length;
  return digits / str.length;
};

// Index of Coincidence: ∑ fᵢ(fᵢ-1) / (N(N-1))
// Lower values → more random text.
export const indexOfCoincidence = (str) => {
  const counts = [...str].reduce((acc, ch) => {
    acc[ch] = (acc[ch] || 0) + 1;
    return acc;
  }, {});
  const N = str.length;
  if (N < 2) return 0;
  const numerator = Object.values(counts)
    .map((f) => f * (f - 1))
    .reduce((a, b) => a + b, 0);
  return numerator / (N * (N - 1));
};

// PNR candidates: 5-7 alphanumeric uppercase.
export const PNR_PATTERN = /^[A-Z0-9]{5,7}$/;

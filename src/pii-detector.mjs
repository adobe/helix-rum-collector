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

import { extractFeatures } from './pii-features.mjs';
import { model } from './xgboost-model.mjs';

/**
 * Traverse XGBoost tree and return the leaf value
 */
function traverseTree(tree, features) {
  if ('leaf' in tree) {
    return tree.leaf;
  }
  
  const featureValue = features[tree.feature];
  if (featureValue < tree.threshold) {
    return traverseTree(tree.yes, features);
  } else {
    return traverseTree(tree.no, features);
  }
}

/**
 * Score a segment using the XGBoost model
 * @param {string} segment - URL segment to score
 * @returns {number} Probability score between 0 and 1
 */
export function scorePII(segment) {
  if (!segment || typeof segment !== 'string' || segment.length < 5) {
    return 0;
  }

  const features = extractFeatures(segment);
  
  // Sum predictions from all trees
  let sum = 0;
  for (const tree of model.trees) {
    sum += traverseTree(tree, features);
  }
  
  // Convert to probability using sigmoid function
  const probability = 1 / (1 + Math.exp(-sum));
  return probability;
}

/**
 * Detect if a segment is PII
 * @param {string} segment - URL segment to check
 * @param {number} threshold - Probability threshold (default 0.5)
 * @returns {Object} Detection result with isPII flag and probability
 */
export function detectPII(segment, threshold = 0.5) {
  const probability = scorePII(segment);
  return {
    isPII: probability >= threshold,
    probability: probability
  };
}
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

import {
  shannonEntropy,
  bigramScore,
  trigramScore,
  quadgramScore,
  richTrigramScore,
} from '../src/text-analysis.mjs';
import { commonWords, quasiPNRs } from '../test/commonWords.mjs';
import { indexOfCoincidence, PNR_PATTERN } from '../src/features.mjs';

const scoringAlgorithms = {
  threshold: (text, params) => {
    if (!PNR_PATTERN.test(text)) return false;
    // Calculate Shannon entropy - measures randomness
    const entropy = shannonEntropy(text);
    const bgScore = bigramScore(text);
    const { entropyThreshold, bigramThreshold } = params;
    return entropy >= entropyThreshold || bgScore <= bigramThreshold;
  },

  /*   dual: (text, params) => {
    if (!PNR_PATTERN.test(text)) return false;
    const entropy = shannonEntropy(text);
    const bgScore = bigramScore(text);
    const ratio = digitRatio(text);
    const {
      entropyThreshold,
      bigramThreshold,
      digitRatioMin,
      digitRatioMax,
    } = params;
    const entropyOrBigram = entropy >= entropyThreshold || bgScore <= bigramThreshold;
    const withinRatio = ratio >= digitRatioMin && ratio <= digitRatioMax;
    return entropyOrBigram && withinRatio;
  }, */

  ioc: (text, params) => {
    if (!PNR_PATTERN.test(text)) return false;
    const ioc = indexOfCoincidence(text);
    return ioc <= params.iocThreshold;
  },

  thresholdIocBigram: (text, params) => {
    if (!PNR_PATTERN.test(text)) return false;
    const ioc = indexOfCoincidence(text);
    const bg = bigramScore(text);
    const { iocThreshold, bigramThreshold } = params;
    return ioc <= iocThreshold || bg <= bigramThreshold;
  },

  thresholdIocEntropy: (text, params) => {
    if (!PNR_PATTERN.test(text)) return false;
    const ioc = indexOfCoincidence(text);
    const entropy = shannonEntropy(text);
    const { iocThreshold, entropyThreshold } = params;
    return ioc <= iocThreshold || entropy >= entropyThreshold;
  },

  linear: (text, params) => {
    if (!PNR_PATTERN.test(text)) return false;
    const ioc = indexOfCoincidence(text);
    const bg = bigramScore(text);
    const ent = shannonEntropy(text);
    const {
      weightIoc, weightBigram, bias, weightEntropy = 0,
    } = params;
    const score = weightIoc * ioc + weightBigram * bg + weightEntropy * ent + bias;
    return score > 0;
  },

  trigram: (text, params) => {
    if (!PNR_PATTERN.test(text)) return false;
    const tri = trigramScore(text);
    return tri <= params.trigramThreshold;
  },

  hybrid: (text, params) => {
    if (!PNR_PATTERN.test(text)) return false;
    const entropy = shannonEntropy(text);
    const bg = bigramScore(text);
    const tri = trigramScore(text);
    const { entropyThreshold, bigramThreshold, trigramThreshold } = params;
    return (
      entropy >= entropyThreshold
      || bg <= bigramThreshold
      || tri <= trigramThreshold
    );
  },

  trigramEntropy: (text, params) => {
    if (!PNR_PATTERN.test(text)) return false;
    const tri = trigramScore(text);
    const ent = shannonEntropy(text);
    const { trigramThreshold, entropyThreshold } = params;
    return tri <= trigramThreshold || ent >= entropyThreshold;
  },

  linearTE: (text, params) => {
    if (!PNR_PATTERN.test(text)) return false;
    const tri = trigramScore(text);
    const ent = shannonEntropy(text);
    const { weightTrigram, weightEntropy, bias } = params;
    const score = weightTrigram * (-tri) + weightEntropy * ent + bias;
    return score > 0;
  },

  trigramIoc: (text, params) => {
    if (!PNR_PATTERN.test(text)) return false;
    const tri = trigramScore(text);
    const ioc = indexOfCoincidence(text);
    const { trigramThreshold, iocThreshold } = params;
    return tri <= trigramThreshold || ioc <= iocThreshold;
  },

  bigramOnly: (text, params) => {
    if (!PNR_PATTERN.test(text)) return false;
    return bigramScore(text) <= params.bigramThreshold;
  },

  quadgram: (text, params) => {
    if (!PNR_PATTERN.test(text)) return false;
    return quadgramScore(text) <= params.quadgramThreshold;
  },

  richTrigram: (text, params) => {
    if (!PNR_PATTERN.test(text)) return false;
    const rtri = richTrigramScore(text);
    return rtri <= params.richTrigramThreshold;
  },
};

// Build parameter ranges from argv or defaults
const defaultSpaces = {
  threshold: {
    entropyThreshold: { min: 1.0, max: 4.0, step: 0.05 },
    bigramThreshold: { min: 0.0001, max: 0.05, step: 0.0001 },
  },
  dual: {
    entropyThreshold: { min: 1.0, max: 4.0, step: 0.1 },
    bigramThreshold: { min: 0.0001, max: 0.05, step: 0.0005 },
    digitRatioMin: { min: 0.0, max: 0.5, step: 0.05 },
    digitRatioMax: { min: 0.5, max: 1.0, step: 0.05 },
  },
  ioc: {
    iocThreshold: { min: 0.01, max: 0.2, step: 0.002 },
  },
  thresholdIocBigram: {
    iocThreshold: { min: 0.01, max: 0.2, step: 0.002 },
    bigramThreshold: { min: 0.0001, max: 0.05, step: 0.0001 },
  },
  thresholdIocEntropy: {
    iocThreshold: { min: 0.01, max: 0.2, step: 0.002 },
    entropyThreshold: { min: 1.0, max: 4.0, step: 0.05 },
  },
  linear: {
    weightIoc: { min: -5, max: 5, step: 0.5 },
    weightBigram: { min: -5, max: 5, step: 0.5 },
    weightEntropy: { min: -5, max: 5, step: 0.5 },
    bias: { min: -2, max: 2, step: 0.2 },
  },
  trigram: {
    trigramThreshold: { min: 0.0, max: 0.02, step: 0.0002 },
  },
  hybrid: {
    entropyThreshold: { min: 1.0, max: 4.0, step: 0.05 },
    bigramThreshold: { min: 0.0001, max: 0.05, step: 0.0005 },
    trigramThreshold: { min: 0.0, max: 0.02, step: 0.0002 },
  },
  trigramEntropy: {
    trigramThreshold: { min: 0.0, max: 0.02, step: 0.0002 },
    entropyThreshold: { min: 1.0, max: 4.0, step: 0.05 },
  },
  linearTE: {
    weightTrigram: { min: -5, max: -0.5, step: 0.5 },
    weightEntropy: { min: 0.0, max: 5, step: 0.5 },
    bias: { min: -2, max: 2, step: 0.2 },
  },
  trigramIoc: {
    trigramThreshold: { min: 0.0, max: 0.02, step: 0.0002 },
    iocThreshold: { min: 0.01, max: 0.2, step: 0.002 },
  },
  bigramOnly: {
    bigramThreshold: { min: 0.0001, max: 0.05, step: 0.0005 },
  },
  quadgram: {
    quadgramThreshold: { min: 0.0, max: 0.01, step: 0.0001 },
  },
  richTrigram: {
    richTrigramThreshold: { min: 0.0, max: 0.02, step: 0.0001 },
  },
};

const buildParamRanges = (algo, argv) => {
  const base = defaultSpaces[algo] || {};
  // override with CLI values
  Object.keys(argv).forEach((key) => {
    const match = key.match(/^(\w+)(Min|Max|Step)$/);
    if (match) {
      const [, name, part] = match;
      const lcPart = part.toLowerCase();
      base[name] = base[name] || {};
      base[name][lcPart] = parseFloat(argv[key]);
    }
  });
  return base;
};

// Evaluate a single parameter set, returning error metrics
const evaluate = (algorithmFn, params) => {
  const falsePositives = commonWords
    .filter((word) => algorithmFn(word.toUpperCase(), params))
    .length;
  const falseNegatives = quasiPNRs.filter((pnr) => !algorithmFn(pnr, params)).length;

  const falsePositiveRate = falsePositives / commonWords.length;
  const falseNegativeRate = falseNegatives / quasiPNRs.length;
  const totalErrorRate = falsePositiveRate + falseNegativeRate * 2;

  return { falsePositiveRate, falseNegativeRate, totalErrorRate };
};

// Quantize helper to honour step when producing random values
const quantize = (val, range) => {
  const { min, step } = range;
  return step ? Math.round((val - min) / step) * step + min : val;
};

// Optimise parameters via random (Bayesian-style) search
const optimise = (algorithmName, paramRanges, iterations) => {
  const algorithmFn = scoringAlgorithms[algorithmName];
  if (!algorithmFn) {
    throw new Error(`Unknown algorithm "${algorithmName}"`);
  }

  const paramNames = Object.keys(paramRanges);

  const total = iterations;
  const barLen = 30;
  let processed = 0;
  let best = { totalErrorRate: Infinity };

  while (processed < iterations) {
    const params = {};
    paramNames.forEach((name) => {
      const { min, max } = paramRanges[name];
      const raw = min + Math.random() * (max - min);
      params[name] = quantize(raw, paramRanges[name]);
    });

    const metrics = evaluate(algorithmFn, params);
    if (metrics.totalErrorRate < best.totalErrorRate) {
      best = { ...params, ...metrics };
    }

    processed += 1;
    if (processed === total || processed % Math.ceil(total * 0.02) === 0) {
      const pct = processed / total;
      const filled = Math.floor(pct * barLen);
      const bar = `${'█'.repeat(filled)}${' '.repeat(barLen - filled)}`;
      process.stderr.write(`\r${algorithmName.padEnd(24)}[${bar}] ${(pct * 100).toFixed(1)}%`);
    }
  }

  process.stderr.write('\n');
  return best;
};

// Parse CLI arguments (very lightweight parser)
const argv = process.argv.slice(2).reduce((acc, arg) => {
  const [, key, value] = arg.match(/^--([^=]+)=?(.*)$/) || [];
  if (key) acc[key] = value === '' ? true : value;
  return acc;
}, {});

const algorithm = argv.algorithm || 'all';

const disabled = ['ioc', 'thresholdIocBigram', 'thresholdIocEntropy', 'linear', 'linearTE'];
const algoList = algorithm === 'all'
  ? Object.keys(scoringAlgorithms).filter((a) => !disabled.includes(a))
  : [algorithm];

const iterations = parseInt(argv.iterations, 10) || 2000;

const results = algoList.map((algo) => {
  const ranges = buildParamRanges(algo, argv);
  const best = optimise(algo, ranges, iterations);

  const formatted = {
    algorithm: algo,
    falsePositiveRate: `${(best.falsePositiveRate * 100).toFixed(2)}%`,
    falseNegativeRate: `${(best.falseNegativeRate * 100).toFixed(2)}%`,
    totalErrorRate: best.totalErrorRate.toFixed(4),
  };

  // When only one algorithm was requested, include the tuned parameters
  if (algoList.length === 1) {
    return { ...formatted, ...best };
  }

  return formatted;
});

/* eslint-disable no-console */
console.table(results);
/* eslint-enable no-console */

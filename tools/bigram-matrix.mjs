#!/usr/bin/env node
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

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const A_CODE = 'a'.charCodeAt(0);
const azIdx = (c) => c.charCodeAt(0) - A_CODE;
const zeros = () => Array.from({ length: 26 }, () => Array(26).fill(0));
const zeros3D = () => Array.from(
  { length: 26 },
  () => Array.from({ length: 26 }, () => Array(26).fill(0)),
);
const zeros4D = () => Array.from(
  { length: 26 },
  () => Array.from(
    { length: 26 },
    () => Array.from({ length: 26 }, () => Array(26).fill(0)),
  ),
);

/* ---------- rich alphabet utilities ---------- */
const RICH_ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
  + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  + '._-:%';
const RICH_SIZE = RICH_ALPHABET.length; // 57

const zerosRich3D = () => Array
  .from({ length: RICH_SIZE }, () => Array
    .from({ length: RICH_SIZE }, () => Array(RICH_SIZE).fill(0)));

const richIdx = (ch) => {
  const idx = RICH_ALPHABET.indexOf(ch);
  return idx === -1 ? RICH_ALPHABET.length - 1 : idx; // map unknown to '%'
};

const normaliseRich3D = (M) => {
  const total = M.flat(2).reduce((s, x) => s + x, 0);
  return total === 0 ? M : M.map((p) => p.map((r) => r.map((x) => x / total)));
};

const flattenRich3D = (M) => M.flat(2);

/* ---------- tally absolute counts ---------- */
function buildCountMatrix(csv) {
  const M = zeros();

  csv.trim().split(/\r?\n/).forEach((line) => {
    if (!line.trim()) return;
    const [wRaw, fRaw] = line.split(',');
    if (!wRaw || !fRaw) return;

    const word = wRaw.trim().toLowerCase().replace(/[^a-z]/g, '');
    const freq = parseInt(fRaw.trim(), 10) || 0;
    if (word.length < 2 || freq === 0) return;

    for (let i = 0; i < word.length - 1; i += 1) {
      const a = azIdx(word[i]);
      const b = azIdx(word[i + 1]);
      if (a >= 0 && a < 26 && b >= 0 && b < 26) M[a][b] += freq;
    }
  });

  return M;
}

/* ---------- tally trigram counts ---------- */
function buildTrigramCountMatrix(csv) {
  const T = zeros3D();
  csv.trim().split(/\r?\n/).forEach((line) => {
    if (!line.trim()) return;
    const [wRaw, fRaw] = line.split(',');
    if (!wRaw || !fRaw) return;
    const word = wRaw.trim().toLowerCase().replace(/[^a-z]/g, '');
    const freq = parseInt(fRaw.trim(), 10) || 0;
    if (word.length < 3 || freq === 0) return;
    for (let i = 0; i < word.length - 2; i += 1) {
      const a = azIdx(word[i]);
      const b = azIdx(word[i + 1]);
      const c = azIdx(word[i + 2]);
      if (a >= 0 && a < 26 && b >= 0 && b < 26 && c >= 0 && c < 26) {
        T[a][b][c] += freq;
      }
    }
  });
  return T;
}

/* ---------- tally quadgram counts ---------- */
function buildQuadgramCountMatrix(csv) {
  const Q = zeros4D();
  csv.trim().split(/\r?\n/).forEach((line) => {
    if (!line.trim()) return;
    const [wRaw, fRaw] = line.split(',');
    if (!wRaw || !fRaw) return;
    const word = wRaw.trim().toLowerCase().replace(/[^a-z]/g, '');
    const freq = parseInt(fRaw.trim(), 10) || 0;
    if (word.length < 4 || freq === 0) return;
    for (let i = 0; i < word.length - 3; i += 1) {
      const a = azIdx(word[i]);
      const b = azIdx(word[i + 1]);
      const c = azIdx(word[i + 2]);
      const d = azIdx(word[i + 3]);
      if (
        a >= 0 && a < 26
        && b >= 0 && b < 26
        && c >= 0 && c < 26
        && d >= 0 && d < 26
      ) {
        Q[a][b][c][d] += freq;
      }
    }
  });
  return Q;
}

/* ---------- turn counts into probabilities ---------- */
function normalise2D(M) {
  const total = M.flat().reduce((s, x) => s + x, 0);
  if (total === 0) return M; // edge-case: empty corpus
  return M.map((row) => row.map((x) => x / total));
}

function normalise3D(T) {
  const total = T.flat(2).reduce((s, x) => s + x, 0);
  if (total === 0) return T;
  return T.map((plane) => plane.map((row) => row.map((x) => x / total)));
}

function normalise4D(Q) {
  const total = Q.flat(3).reduce((s, x) => s + x, 0);
  if (total === 0) return Q;
  return Q.map((p) => p.map((r) => r.map((c) => c.map((x) => x / total))));
}

/* ---------- flatten helpers ---------- */
const flatten = (M) => M.flat();
const flatten3D = (T) => T.flat(2);
const flatten4D = (Q) => Q.flat(3);

/* ---------- CLI entry ---------- */
if (import.meta.url === `file://${process.argv[1]}`) {
  /* eslint-disable no-use-before-define */
  const csv = fs.readFileSync(0, 'utf8');
  const rel = normalise2D(buildCountMatrix(csv));
  const flat = flatten(rel);

  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const header = () => `/*
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

`;

  // ---------- write bigram file ----------
  const bigramPath = path.resolve(dirname, '../src/path-bigrams.mjs');

  let output = header();
  output += 'export const bigramFreqs = [\n';
  let lineCount = 0;
  flat.forEach((v, i) => {
    // Format with 8 decimal places
    const entry = `${v.toFixed(8)},`;

    // Start a new line every 6 entries to keep lines under 100 chars
    if (lineCount === 0) {
      output += '  ';
    }

    output += entry;
    lineCount += 1;

    if (lineCount >= 6 && i < flat.length - 1) {
      output += '\n';
      lineCount = 0;
    } else if (i < flat.length - 1) {
      output += ' ';
    }
  });
  if (lineCount > 0) {
    output += '\n';
  }
  output += '];\n';

  fs.writeFileSync(bigramPath, output, 'utf8');
  console.log(`Bigram frequencies written to ${bigramPath}`);

  const triRel = normalise3D(buildTrigramCountMatrix(csv));
  const triFlat = flatten3D(triRel);

  const trigramPath = path.resolve(dirname, '../src/path-trigrams.mjs');
  let triOut = header();
  triOut += 'export const trigramFreqs = [\n';
  let triLineCount = 0;
  triFlat.forEach((v, i) => {
    const entry = `${v.toFixed(8)},`;
    if (triLineCount === 0) triOut += '  ';
    triOut += entry;
    triLineCount += 1;
    if (triLineCount >= 6 && i < triFlat.length - 1) {
      triOut += '\n';
      triLineCount = 0;
    } else if (i < triFlat.length - 1) {
      triOut += ' ';
    }
  });
  if (triLineCount > 0) triOut += '\n';
  triOut += '];\n';
  fs.writeFileSync(trigramPath, triOut, 'utf8');
  console.log(`Trigram frequencies written to ${trigramPath}`);

  /* logging */
  const nanCount = triFlat.filter((v) => Number.isNaN(v)).length;
  console.error(`Trigram vector length: ${triFlat.length}. NaNs: ${nanCount}`);

  const quadRel = normalise4D(buildQuadgramCountMatrix(csv));
  const quadFlat = flatten4D(quadRel);

  const quadgramPath = path.resolve(dirname, '../src/path-quadgrams.mjs');
  let quadOut = header();
  quadOut += 'export const quadgramFreqs = [\n';
  let quadLineCount = 0;
  quadFlat.forEach((v, i) => {
    const entry = `${v.toFixed(8)},`;
    if (quadLineCount === 0) quadOut += '  ';
    quadOut += entry;
    quadLineCount += 1;
    if (quadLineCount >= 6 && i < quadFlat.length - 1) {
      quadOut += '\n';
      quadLineCount = 0;
    } else if (i < quadFlat.length - 1) {
      quadOut += ' ';
    }
  });
  if (quadLineCount > 0) quadOut += '\n';
  quadOut += '];\n';
  fs.writeFileSync(quadgramPath, quadOut, 'utf8');
  console.log(`Quadgram frequencies written to ${quadgramPath}`);

  /* logging */
  const nanCountQuad = quadFlat.filter((v) => Number.isNaN(v)).length;
  console.error(`Quadgram vector length: ${quadFlat.length}. NaNs: ${nanCountQuad}`);

  const richRel = normaliseRich3D(buildRichTrigramCountMatrix(csv));
  const richFlat = flattenRich3D(richRel);

  const richPath = path.resolve(dirname, '../src/rich-path-trigrams.mjs');
  let richOut = header();
  richOut += 'export const richTrigramFreqs = [\n';
  let richLine = 0;
  richFlat.forEach((v, i) => {
    const entry = `${v.toFixed(8)},`;
    if (richLine === 0) richOut += '  ';
    richOut += entry;
    richLine += 1;
    if (richLine >= 6 && i < richFlat.length - 1) {
      richOut += '\n';
      richLine = 0;
    } else if (i < richFlat.length - 1) {
      richOut += ' ';
    }
  });
  if (richLine > 0) richOut += '\n';
  richOut += '];\n';
  fs.writeFileSync(richPath, richOut, 'utf8');
  console.log(`Rich trigram frequencies written to ${richPath}`);
  console.error(`Rich trigram length ${richFlat.length}. NaNs ${richFlat.filter(Number.isNaN).length}`);
  /* eslint-enable no-use-before-define */
}

function buildRichTrigramCountMatrix(csv) {
  const R = zerosRich3D();
  csv.trim().split(/\r?\n/).forEach((line) => {
    if (!line.trim()) return;
    let segment;
    let count;
    if (line.trim().startsWith('{')) {
      try {
        const j = JSON.parse(line);
        segment = j.segment;
        count = j.hostname_count;
      } catch {
        return;
      }
    } else {
      [segment, count] = line.split(',');
    }
    if (!segment || !count) return;
    const freq = parseInt(count, 10) || 0;
    if (segment.length < 3 || freq === 0) return;
    for (let i = 0; i < segment.length - 2; i += 1) {
      const a = richIdx(segment[i]);
      const b = richIdx(segment[i + 1]);
      const c = richIdx(segment[i + 2]);
      R[a][b][c] += freq;
    }
  });
  return R;
}
export {
  buildCountMatrix, normalise2D, flatten, buildTrigramCountMatrix, flatten3D,
  buildQuadgramCountMatrix, normalise4D, flatten4D,
  buildRichTrigramCountMatrix, normaliseRich3D, flattenRich3D,
};

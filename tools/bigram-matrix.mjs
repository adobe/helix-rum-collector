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

/* ---------- turn counts into probabilities ---------- */
function normalise(M) {
  const total = M.flat().reduce((s, x) => s + x, 0);
  if (total === 0) return M; // edge-case: empty corpus
  return M.map((row) => row.map((x) => x / total));
}

/* ---------- flatten to 1-D row-major array ---------- */
const flatten = (M) => M.flat();

/* ---------- CLI entry ---------- */
if (import.meta.url === `file://${process.argv[1]}`) {
  const csv = fs.readFileSync(0, 'utf8');
  const rel = normalise(buildCountMatrix(csv));
  const flat = flatten(rel);

  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const outputPath = path.resolve(dirname, '../src/path-bigrams.js');

  let output = '/*\n';
  output += ' * Copyright 2024 Adobe. All rights reserved.\n';
  output += ' * This file is licensed to you under the Apache License, Version 2.0 (the "License");\n';
  output += ' * you may not use this file except in compliance with the License. You may obtain a copy\n';
  output += ' * of the License at http://www.apache.org/licenses/LICENSE-2.0\n';
  output += ' *\n';
  output += ' * Unless required by applicable law or agreed to in writing, software distributed under\n';
  output += ' * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS\n';
  output += ' * OF ANY KIND, either express or implied. See the License for the specific language\n';
  output += ' * governing permissions and limitations under the License.\n';
  output += ' */\n\n';

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

  fs.writeFileSync(outputPath, output, 'utf8');
  console.log(`Bigram frequencies written to ${outputPath}`);
}

export { buildCountMatrix, normalise, flatten };

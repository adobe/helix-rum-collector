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

/* eslint-env mocha */
import assert from 'assert';
import { it, describe } from 'node:test';
import { cleanPath } from '../src/privacy.mjs';
import { commonWords, quasiPNRs } from './commonWords.mjs';

describe('Privacy Functions', () => {
  describe('cleanPath', () => {
    it('handles null and undefined paths', () => {
      assert.strictEqual(cleanPath(null), null);
      assert.strictEqual(cleanPath(undefined), undefined);
    });

    it('does not modify regular paths', () => {
      const path = '/content/example/path';
      assert.strictEqual(cleanPath(path), path);
    });

    it('masks JWT tokens', () => {
      const path = '/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      assert.strictEqual(cleanPath(path), '/<jwt>');
    });

    it('masks high-entropy PNRs', () => {
      const path = '/content/AB123C/page';
      assert.strictEqual(cleanPath(path), '/content/<pnr>/page');
    });

    it('agressively masks low-entropy PNRs if the path looks suspicious', () => {
      const path = '/trip/AB123C/page';
      assert.strictEqual(cleanPath(path), '/trip/<pnr>/page');
    });

    it('handles PNRs with only numbers (no letters)', () => {
      const path = '/content/12345/page';
      const result = cleanPath(path);
      // The result should either be the original path or masked, depending on entropy
      assert.ok(result === path || result === '/content/<pnr>/page');
    });

    it('handles PNRs with only letters (no numbers)', () => {
      const path = '/content/ABCDE/page';
      const result = cleanPath(path);
      // The result should either be the original path or masked, depending on entropy
      assert.ok(result === path || result === '/content/<pnr>/page');
    });

    it('evaluates false positive and false negative rates for PNR detection', () => {
      // Test common words - these should NOT be identified as PNRs (false positives)
      const wordResults = commonWords.map((word) => {
        const path = `/content/${word.toLocaleUpperCase()}/page`;
        const result = cleanPath(path);
        return result.includes('<pnr>');
      });

      const falsePositives = wordResults.filter(Boolean);
      const falsePositiveRate = (falsePositives.length / commonWords.length) * 100;

      // Test quasi-PNRs - these SHOULD be identified as PNRs (check for false negatives)
      const pnrResults = quasiPNRs.map((pnr) => {
        const path = `/content/${pnr}/page`;
        const result = cleanPath(path);
        return result.includes('<pnr>');
      });

      const falseNegatives = pnrResults.filter((result) => !result);
      const falseNegativeRate = (falseNegatives.length / quasiPNRs.length) * 100;

      console.log(`False positive rate: ${falsePositiveRate.toFixed(2)}% (${falsePositives.length}/${commonWords.length})`);
      console.log(`False negative rate: ${falseNegativeRate.toFixed(2)}% (${falseNegatives.length}/${quasiPNRs.length})`);

      const MAX_RATE = 2;
      // Test fails if either rate is above MAX_RATE
      assert.ok(falsePositiveRate <= MAX_RATE, `False positive rate (${falsePositiveRate.toFixed(2)}%) exceeds threshold of ${MAX_RATE}%`);
      assert.ok(falseNegativeRate <= MAX_RATE, `False negative rate (${falseNegativeRate.toFixed(2)}%) exceeds threshold of ${MAX_RATE}%`);
    });
  });
});

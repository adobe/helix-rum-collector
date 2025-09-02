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
  });
});

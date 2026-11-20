/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const dir = new URL('../workflows/', import.meta.url);
const files = readdirSync(dir).filter((name) => /\.ya?ml$/.test(name));

test('every external action and reusable workflow is pinned to a full commit SHA', () => {
  const unpinned = [];
  files.forEach((name) => {
    readFileSync(new URL(name, dir), 'utf8').split('\n').forEach((line, i) => {
      const match = line.match(/^\s*(?:-\s*)?uses:\s*['"]?([^\s'"#]+)/);
      if (!match || match[1].startsWith('./')) {
        return;
      }
      if (!/@[0-9a-f]{40}$/.test(match[1])) {
        unpinned.push(`${name}:${i + 1} ${match[1]}`);
      }
    });
  });
  assert.deepEqual(unpinned, [], 'pin with `uses: owner/repo@<40-char sha> # vX.Y.Z`');
});

test('the retired semantic-release comment action is not used', () => {
  files.forEach((name) => {
    const text = readFileSync(new URL(name, dir), 'utf8');
    assert.ok(!text.includes('github-semantic-release-comment-action'), name);
  });
});

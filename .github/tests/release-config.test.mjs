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
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = new URL('../../', import.meta.url);
const require = createRequire(new URL('package.json', root));
const configURL = new URL(existsSync(new URL('.releaserc.cjs', root))
  ? '.releaserc.cjs' : '.releaserc.js', root);
const { default: config } = await import(configURL.href);
const plugins = config.plugins.map((plugin) => (Array.isArray(plugin) ? plugin : [plugin, {}]));

test('release config and every configured plugin resolve without release credentials', () => {
  const paths = [fileURLToPath(root), dirname(require.resolve('semantic-release'))];
  plugins.forEach(([name]) => assert.doesNotThrow(() => require.resolve(name, { paths }), name));
});

test('release metadata is generated without committing to protected source branches', () => {
  assert.ok(plugins.some(([name]) => name === '@semantic-release/npm'));
  assert.ok(!plugins.some(([name]) => name === '@semantic-release/git'));
  const [, changelog] = plugins.find(([name]) => name === '@semantic-release/changelog');
  assert.equal(changelog.changelogFile, 'release-notes.md');
  const [, github] = plugins.find(([name]) => name === '@semantic-release/github');
  assert.ok(github.assets.some((asset) => asset.path === 'release-notes.md'));
  const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
  assert.equal(pkg.devDependencies['@semantic-release/git'], undefined);
  assert.equal(pkg.scripts['semantic-release-dry'], undefined);
});

test('publishing uses the job token and remains explicitly paused by default', () => {
  const workflow = new URL(existsSync(new URL('.github/workflows/main.yaml', root))
    ? '.github/workflows/main.yaml' : '.github/workflows/semantic-release.yml', root);
  const text = readFileSync(workflow, 'utf8');
  // eslint-disable-next-line no-template-curly-in-string -- GitHub workflow syntax, not JavaScript.
  assert.ok(text.includes('GITHUB_TOKEN: ${{ github.token }}'));
  assert.ok(!text.includes('secrets.RELEASE_GITHUB_TOKEN'));
  assert.ok(!text.includes('ADOBE_BOT'));
  assert.ok(text.includes("vars.RELEASE_ENABLED == 'true'"));
  assert.ok(text.includes('contents: write'));
});

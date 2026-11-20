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
import assert from 'assert';
import { readFileSync } from 'fs';
import { describe, it } from 'node:test';
import { LEGACY_RELEASES } from '../src/legacy-releases.mjs';
import {
  ALIAS_REQUESTS, HOSTS, coverageRequests, verifyCoverage,
} from '../tools/verify-package-coverage.mjs';

// src/index.mjs registers a fetch listener on import, so read the constant from its source.
const WEB_VITALS_SOURCE = readFileSync(new URL('../src/index.mjs', import.meta.url), 'utf8')
  .match(/export const WEB_VITALS_SOURCE = '([^']+)'/)[1];

describe('Pre-deploy package coverage guard', () => {
  it('covers aliases, the web-vitals source and every legacy file on every backend', () => {
    const urls = coverageRequests();
    const legacyFiles = Object.values(LEGACY_RELEASES)
      .flatMap((versions) => Object.values(versions))
      .reduce((n, files) => n + Object.keys(files).length, 0);
    const aliasFiles = Object.values(ALIAS_REQUESTS)
      .flatMap((aliases) => Object.values(aliases))
      .reduce((n, files) => n + files.length, 0);
    assert.equal(urls.length, HOSTS.length * (legacyFiles + aliasFiles));
    HOSTS.forEach((host) => {
      assert(urls.includes(`https://${host}${WEB_VITALS_SOURCE}`), `${host} web-vitals`);
      assert(urls.includes(`https://${host}/.rum/@adobe/helix-rum-js@^2/dist/rum-standalone.js`));
      assert(urls.includes(`https://${host}/.rum/@adobe/helix-rum-js@2.10.5/dist/rum-standalone.js`));
      assert(urls.includes(`https://${host}/.rum/@adobe/helix-rum-enhancer@^2/src/plugins/a11y.js`));
    });
  });

  it('reports every request that would not be served', async () => {
    const respond = async ({ url }) => (url.endsWith('/bad.js')
      ? new Response('no', { status: 502, headers: { 'x-error': 'Integrity check failed' } })
      : new Response('ok', { status: 200 }));
    const failures = await verifyCoverage(['https://a/ok.js', 'https://b/bad.js', 'https://a/bad.js'], { respond, concurrency: 2 });
    assert.deepEqual(failures, [
      { url: 'https://a/bad.js', status: 502, error: 'Integrity check failed' },
      { url: 'https://b/bad.js', status: 502, error: 'Integrity check failed' },
    ]);
    const thrown = await verifyCoverage(['https://c/x.js'], {
      respond: async () => {
        throw new Error('boom');
      },
    });
    assert.deepEqual(thrown, [{ url: 'https://c/x.js', status: undefined, error: 'boom' }]);
  });

  it('runs in the release job before semantic-release deploys', () => {
    const workflow = readFileSync(new URL('../.github/workflows/semantic-release.yml', import.meta.url), 'utf8');
    const guard = workflow.indexOf('run: npm run verify-package-coverage');
    assert(guard > 0, 'guard step missing');
    assert(guard < workflow.indexOf('npm run semantic-release'), 'guard must run before the deploy');
  });
});

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
/* eslint-env serviceworker */
import assert from 'assert';
import { it, describe } from 'node:test';
import { respondHelixPkgReg } from '../src/hlxpkgreg.mjs';

describe('Test Helix Package Registry Handler', () => {
  it('serves a package', async () => {
    const req = {};
    req.url = 'http://foo.bar.org/.rum/@adobe/helix-rum-js@2.10.5/src/index.js';

    const resp = await respondHelixPkgReg(req);
    const text = await resp.text();
    assert.equal(200, resp.status);
    assert.equal('hlx', resp.headers.get('x-rum-trace'));
    assert(text.includes('export function sampleRUM'), 'Contents should export sampleRUM function');
  });

  async function testWildcarding(inurl, usedurl, message) {
    const req = {
      url: inurl,
    };

    const storedFetch = global.fetch;
    try {
      global.fetch = (v, opts) => {
        assert.equal('hlxpkgreg', opts.backend);
        if (v.url === usedurl) {
          return {
            status: 200,
            headers: new Headers(),
          };
        }
        throw new Error(`${message}Unexpected URL: ${v.url} was expecting ${usedurl}`);
      };

      const resp = await respondHelixPkgReg(req);
      assert.equal(200, resp.status);
    } finally {
      global.fetch = storedFetch;
    }
  }

  it('serves an exact package', async () => {
    await testWildcarding(
      'http://foo.bar.org/.rum/@adobe/helix-rum-js@2.10.5/src/index.js',
      'https://release-2-10-5--helix-rum-js--adobe.aem.live/src/index.js',
      'Exact version should be served. ',
    );
  });

  it('serves an approximately equivalent package', async () => {
    await testWildcarding(
      'http://foo.bar.org/.rum/@adobe/helix-rum-js@~2.10.5/src/index.js',
      'https://release-2-10-x--helix-rum-js--adobe.aem.live/src/index.js',
      'Approximately equivalent version with micro version wildcard should be served. ',
    );

    await testWildcarding(
      'http://foo.bar.org/.rum/@adobe/helix-rum-js@~2.10/src/index.js',
      'https://release-2-10-x--helix-rum-js--adobe.aem.live/src/index.js',
      'Approximately equivalent version with micro version wildcard should be served. ',
    );

    await testWildcarding(
      'http://foo.bar.org/.rum/@adobe/helix-rum-js@~2/src/index.js',
      'https://release-2-0-x--helix-rum-js--adobe.aem.live/src/index.js',
      'Approximately equivalent version with micro version wildcard should be served. ',
    );
  });

  it('serves a compatible package', async () => {
    await testWildcarding(
      'http://foo.bar.org/.rum/@adobe/helix-rum-enhancer@^2.10.5/src/index.js',
      'https://release-2-x--helix-rum-enhancer--adobe.aem.live/src/index.js',
      'Compatible version with minor version wildcard should be served. ',
    );

    await testWildcarding(
      'http://foo.bar.org/.rum/@adobe/helix-rum-enhancer@^2.10/src/index.js',
      'https://release-2-x--helix-rum-enhancer--adobe.aem.live/src/index.js',
      'Compatible version with minor version wildcard should be served. ',
    );

    await testWildcarding(
      'http://foo.bar.org/.rum/@adobe/helix-rum-enhancer@^2/src/index.js',
      'https://release-2-x--helix-rum-enhancer--adobe.aem.live/src/index.js',
      'Compatible version with minor version wildcard should be served. ',
    );
  });

  it('serves no version at all', async () => {
    const req = {};
    req.url = 'http://foo.bar.org/.rum/@adobe/helix-rum-js/src/index.js';
    const resp = await respondHelixPkgReg(req);
    assert(resp.status === 500, 'No version should return 500');
  });

  it('serves an unknown helix package', async () => {
    const req = {};
    req.url = 'http://foo.bar.org/.rum/@adobe/helix-rum-aaaarrr@2.10.5/src/index.js';
    const resp = await respondHelixPkgReg(req);
    assert(resp.status === 500, 'Unknown package should return 500');
  });

  // it('cleans up response', async () => {
  //   const req = {};
  //   req.url = 'http://foo.bar.org/.rum/@adobe/helix-rum-js?generation=42';

  //   const storedFetch = global.fetch;
  //   try {
  //     // Mock the global fetch function
  //     global.fetch = (v, opts) => {
  //       assert.equal('jsdelivr', opts.backend);
  //       if (v.url === 'https://cdn.jsdelivr.net/npm/@adobe/helix-rum-js') {
  //         const headers = new Headers();
  //         headers.append('foo', 'bar');
  //         headers.append('x-jsd-version', 'eek');
  //         headers.append('x-jsd-version-type', 'eek');
  //         headers.append('x-served-by', 'eek');
  //         headers.append('x-cache', 'eek');

  //         const resp = {
  //           headers,
  //           ok: true,
  //           status: 200,
  //         };
  //         return resp;
  //       }
  //       return undefined;
  //     };

  //     const resp = await respondHelixPkgReg(req);
  //     console.log('response', resp);
  //   } finally {
  //     global.fetch = storedFetch;
  //   }
  // });
});

/*
 * Copyright 2021 Adobe. All rights reserved.
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
import { describe, it } from 'node:test';
import assert from 'assert';

[
  {
    provider: 'cloudflare',
    proddomain: 'rum.hlx-cloudflare.page',
    cidomain: 'helix3--helix-rum-collector-ci.helix-runtime.workers.dev',
  },
  {
    provider: 'fastly',
    proddomain: 'rum.hlx3.page',
    cidomain: 'helix-rum-collector-ci.edgecompute.app',
  },
].forEach((env) => {
  const domain = !process.env.CI ? env.proddomain : env.cidomain;
  describe(`Helix RUM Collector Post-Deploy Validation on ${env.provider}`, () => {
    it('Missing body returns 400', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }

      const response = await fetch(`https://${domain}`, {
        method: 'POST',
      });
      assert.strictEqual(response.status, 400);
    });

    it('RUM collection with masked timestamp (t) returns 201', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const response = await fetch(`https://${domain}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          t: 1234,
          cwv: {
            CLS: 1.0,
            LCP: 1.0,
            FID: 4,
          },
          id: 'truncaty-me-timestampy-please',
          weight: 1,
        }),
      });
      assert.strictEqual(response.status, 201);
    });

    it('RUM collection returns 201', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const response = await fetch(`https://${domain}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cwv: {
            CLS: 1.0,
            LCP: 1.0,
            FID: 4,
          },
          id: 'blablub',
          weight: 1,
        }),
      });
      assert.strictEqual(response.status, 201);
    });

    it('RUM collection with empty string id returns 201', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const response = await fetch(`https://${domain}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cwv: {
            CLS: 1.0,
            LCP: 1.0,
            FID: 4,
          },
          id: '',
          weight: 1,
        }),
      });
      assert.strictEqual(response.status, 201);
    });

    it('RUM collection via GET returns 201', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const response = await fetch(`https://${domain}/.rum/1?data=%7B%22checkpoint%22%3A%22noscript%22%2C%22weight%22%3A1%7D`, {
        method: 'GET',
      });
      assert.strictEqual(response.status, 201);
    });

    it('CORS headers are set', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const response = await fetch(`https://${domain}/`, {
        method: 'OPTIONS',
      });
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get('access-control-allow-origin'), '*');
    });

    it('robots.txt denies everything', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const response = await fetch(`https://${domain}/robots.txt`, {
        method: 'GET',
      });
      assert.strictEqual(response.status, 200);
      // eslint-disable-next-line no-unused-expressions
      assert.strictEqual(response.headers.get('content-type'), 'text/plain');
    });

    it('web vitals module is being served', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const response = await fetch(`https://${domain}/.rum/web-vitals@2.1.3/dist/web-vitals.base.js`, {
        method: 'GET',
      });
      assert.strictEqual(response.status, 200);
      // eslint-disable-next-line no-unused-expressions
      assert.match(response.headers.get('content-type'), /^application\/javascript/);
    });

    it('web vitals module is being served without redirect', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const response = await fetch(`https://${domain}/.rum/web-vitals/dist/web-vitals.iife.js`, {
        method: 'GET',
      });
      assert.strictEqual(response.status, 200);
      // eslint-disable-next-line no-unused-expressions
      assert.match(response.headers.get('content-type'), /^application\/javascript/);
    });

    it('rum js module is being served without redirect', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const response = await fetch(`https://${domain}/.rum/@adobe/helix-rum-js@^1/src/index.js`, {
        method: 'GET',
      });
      assert.strictEqual(response.status, 200);
      // eslint-disable-next-line no-unused-expressions
      assert.match(response.headers.get('content-type'), /^application\/javascript/);
    });

    it('rum js module is served with compression', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const response = await fetch(`https://${domain}/.rum/@adobe/helix-rum-js@^1/src/index.js`, {
        method: 'GET',
        headers: {
          'Accept-Encoding': 'brotli, gzip, deflate',
        },
      });
      assert.strictEqual(response.status, 200);
      // eslint-disable-next-line no-unused-expressions
      assert.match(response.headers.get('content-type'), /^application\/javascript/);
      assert.match(response.headers.get('content-encoding'), /^(br|gzip|deflate)$/);
    });

    it.skip('rum js module is being served with default replacements', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const response = await fetch(`https://${domain}/.rum/@adobe/helix-rum-js@1.0.0/src/index.js`, {
        method: 'GET',
      });
      assert.strictEqual(response.status, 200);
      // eslint-disable-next-line no-unused-expressions
      assert.match(response.headers.get('content-type'), /^application\/javascript/);
      const text = await response.text();
      assert.include(text, 'adobe-helix-rum-js-1.0.0');
    });

    it('Missing id returns 400', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const response = await fetch(`https://${domain}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cwv: {
            CLS: 1.0,
            LCP: 1.0,
            FID: 4,
          },
          weight: 1,
        }),
      });
      assert.strictEqual(response.status, 400);
    });

    it('Non-numeric weight returns 400', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const response = await fetch(`https://${domain}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cwv: {
            CLS: 1.0,
            LCP: 1.0,
            FID: 4,
          },
          id: 'blablub',
          weight: 'one',
        }),
      });
      assert.strictEqual(response.status, 400);
    });

    it('Non-object root returns 400', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const response = await fetch(`https://${domain}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([]),
      });
      assert.strictEqual(response.status, 400);
    });

    it('Sensitive files return 404 - package.json', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const url = '/.rum/@adobe/helix-rum-js@^2/package.json';
      const response = await fetch(`https://${domain}${url}`, {
        method: 'GET',
      });
      assert.strictEqual(response.status, 404, `Expected 404 for ${url}`);
      const text = await response.text();
      assert.match(text, /Not Found/);
    });

    it('Sensitive files return 404 - CHANGELOG.md', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }
      const url = '/.rum/@adobe/helix-rum-js@^2/CHANGELOG.md';
      const response = await fetch(`https://${domain}${url}`, {
        method: 'GET',
      });
      assert.strictEqual(response.status, 404, `Expected 404 for ${url}`);
      const text = await response.text();
      assert.match(text, /Not Found/);
    });

    it('Reject paths that are double-encoded', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }

      const resp = await fetch(`https://${domain}/.rum/@adobe/helix-rum-js@%5E1/src/.%252e%252f.%252e%252f.%252e%252ffavicon.ico`);
      assert.strictEqual(resp.status, 400);
      const respTxt = await resp.text();
      assert(respTxt.startsWith('Invalid path'));
    });

    it('Reject paths that contain encoded ".."', async function test() {
      if (!process.env.TEST_INTEGRATION) {
        this.skip();
      }

      const resp = await fetch(`https://${domain}/.rum/@adobe/helix-rum-js@^1/src/.%2e%2f.%2e%2f.%2e%2ffavicon.ico`);
      assert.strictEqual(resp.status, 400);
      const respTxt = await resp.text();
      assert(respTxt.startsWith('Invalid path'));
    });
  });
});

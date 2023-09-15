/*
 * Copyright 2023 Adobe. All rights reserved.
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
import { respondUnpkg } from '../src/unpkg.mjs';

describe('Test unpkg handler', () => {
  it('handles web-vitals request', async () => {
    const req = {};
    req.url = 'http://foo.bar.org/.rum/web-vitals';

    const storedFetch = global.fetch;

    try {
      // Mock the global fetch function
      global.fetch = (v, opts) => {
        assert.equal('unpkg.com', opts.backend);
        if (v.url === 'https://unpkg.com/web-vitals') {
          const resp = {
            url: v.url,
            status: 200,
            type: 'test-response',
          };
          resp.headers = new Map();
          return resp;
        }
        return undefined;
      };

      const resp = await respondUnpkg(req);

      assert.equal(200, resp.status);
      assert.equal('test-response', resp.type);
    } finally {
      global.fetch = storedFetch;
    }
  });

  it('handles @adobe/helix-rum request', async () => {
    const req = {};
    req.url = 'http://foo.bar.org/.rum/@adobe/helix-rum-js?generation=42';

    const storedFetch = global.fetch;

    try {
      // Mock the global fetch function
      global.fetch = (v, opts) => {
        assert.equal('unpkg.com', opts.backend);
        if (v.url === 'https://unpkg.com/@adobe/helix-rum-js') {
          const resp = {
            ok: true,
            url: v.url,
            status: 200,
          };
          resp.headers = new Map();
          resp.headers.set('foo-header', 'bar');
          resp.text = () => '//__HELIX_RUM_JS_VERSION__ some text';
          return resp;
        }
        return undefined;
      };

      const resp = await respondUnpkg(req);

      assert.equal(200, resp.status);
      const t = await resp.text();
      assert.equal('//42 some text', t);
      assert.equal('bar', resp.headers.get('foo-header'));
    } finally {
      global.fetch = storedFetch;
    }
  });

  it('handles redirects', async () => {
    const req = {};
    req.url = 'http://foo.bar.org/.rum/web-vitals';

    const storedFetch = global.fetch;

    try {
      // Mock the global fetch function
      global.fetch = (v, opts) => {
        assert.equal('unpkg.com', opts.backend);
        if (v.url === 'https://unpkg.com/web-vitals') {
          const resp = { status: 302 };
          resp.headers = new Map();
          resp.headers.set('location', 'relocated/web-vitals');
          resp.headers.set('cache-control', 'forget-it');
          return resp;
        }
        if (v.url === 'https://unpkg.com/relocated/web-vitals') {
          const resp = { status: 302 };
          resp.headers = new Map();
          resp.headers.set('location', 'https://foo.bar.web.vitals');
          return resp;
        }
        if (v.url === 'https://foo.bar.web.vitals/') {
          const resp = {
            url: v.url,
            status: 200,
          };
          resp.headers = new Map();
          resp.text = () => '//got-there-in-the-end';
          return resp;
        }

        return undefined;
      };

      const resp = await respondUnpkg(req);

      assert.equal(200, resp.status);
      assert.equal('https://foo.bar.web.vitals/', resp.url);
      assert.equal('//got-there-in-the-end', await resp.text());
      assert.equal('forget-it', resp.headers.get('cache-control'));
    } finally {
      global.fetch = storedFetch;
    }
  });

  it('cleans up response if transform causes errors', async () => {
    const req = {};
    req.url = 'http://foo.bar.org/.rum/@adobe/helix-rum-js?generation=42';

    const storedFetch = global.fetch;

    try {
      // Mock the global fetch function
      global.fetch = (v, opts) => {
        assert.equal('unpkg.com', opts.backend);
        if (v.url === 'https://unpkg.com/@adobe/helix-rum-js') {
          const headers = new Map();
          headers.set('foo', 'bar');
          headers.set('cf-cache-status', 'eek');
          headers.set('cf-ray', 'eek');
          headers.set('expect-ct', 'eek');
          headers.set('fly-request-id', 'eek');
          headers.set('server', 'eek');

          const resp = {
            headers,
            ok: true,
            url: v.url,
            status: 200,
          };
          resp.test = () => undefined; // will trigger an error in transformBody
          return resp;
        }
        return undefined;
      };

      const resp = await respondUnpkg(req);

      assert.equal(200, resp.status);
      assert.equal('bar', resp.headers.get('foo'));

      // Should clear these headers in the cleanupHeaders() even though
      // the transformBody throws an exception.
      assert(resp.headers.get('cf-cache-status') === undefined);
      assert(resp.headers.get('cf-ray') === undefined);
      assert(resp.headers.get('expect-ct') === undefined);
      assert(resp.headers.get('fly-request-id') === undefined);
      assert(resp.headers.get('server') === undefined);
    } finally {
      global.fetch = storedFetch;
    }
  });
});

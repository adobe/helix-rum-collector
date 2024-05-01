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
/* eslint-env serviceworker */
import assert from 'assert';
import { respondUnpkg } from '../src/unpkg.mjs';

describe.skip('Test unpkg handler', () => {
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
          };
          resp.headers = new Headers();
          resp.headers.append('xyz', 'abc');
          return resp;
        }
        return undefined;
      };

      const resp = await respondUnpkg(req);

      assert.equal(200, resp.status);
      assert.equal('abc', resp.headers.get('xyz'));
    } finally {
      global.fetch = storedFetch;
    }
  });

  it('handles @adobe/helix-rum request', async () => {
    const req = {};
    req.url = 'http://foo.bar.org/.rum/@adobe/helix-rum-js@^1?generation=42';

    const storedFetch = global.fetch;

    try {
      // Mock the global fetch function
      global.fetch = (v, opts) => {
        assert.equal('unpkg.com', opts.backend);
        if (v.url === 'https://unpkg.com/@adobe/helix-rum-js@^1') {
          const resp = {
            ok: true,
            url: v.url,
            status: 302,
          };
          resp.headers = new Headers();
          resp.headers.append('location', 'https://unpkg.com/@adobe/helix-rum-js@1.0.1');
          resp.headers.append('foo-header', 'bar');
          return resp;
        }
        if (v.url === 'https://unpkg.com/@adobe/helix-rum-js@1.0.1') {
          const resp = {
            ok: true,
            url: v.url,
            status: 200,
          };
          resp.headers = new Headers();
          resp.headers.append('foo-header', 'bar');
          resp.body = '//__HELIX_RUM_JS_VERSION__ some text';
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

  it('handles redirect', async () => {
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
          const resp = {
            url: v.url,
            status: 200,
          };
          resp.headers = new Headers();
          resp.headers.append('server', 'hidden');
          resp.headers.append('etag', '123');
          return resp;
        }

        return undefined;
      };

      const resp = await respondUnpkg(req);

      assert.equal(200, resp.status);
      assert.equal('forget-it', resp.headers.get('cache-control'));
      assert.equal('123', resp.headers.get('etag'));
      assert(!resp.headers.has('server'));
    } finally {
      global.fetch = storedFetch;
    }
  });

  it('handles double redirects', async () => {
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
          resp.body = '//got-there-in-the-end';
          return resp;
        }

        return undefined;
      };

      const resp = await respondUnpkg(req);

      assert.equal(200, resp.status);
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
          const headers = new Headers();
          headers.append('foo', 'bar');
          headers.append('cf-cache-status', 'eek');
          headers.append('cf-ray', 'eek');
          headers.append('expect-ct', 'eek');
          headers.append('fly-request-id', 'eek');
          headers.append('server', 'eek');

          const resp = {
            headers,
            ok: true,
            url: 'bheuaark!', // will trigger an error in transformBody
            status: 200,
          };
          return resp;
        }
        return undefined;
      };

      const resp = await respondUnpkg(req);

      assert.equal(200, resp.status);
      assert.equal('bar', resp.headers.get('foo'));

      // Should clear these headers in the cleanupHeaders() even though
      // the transformBody throws an exception.
      assert(!resp.headers.has('cf-cache-status'));
      assert(!resp.headers.has('cf-ray'));
      assert(!resp.headers.has('expect-ct'));
      assert(!resp.headers.has('fly-request-id'));
      assert(!resp.headers.has('server'));
    } finally {
      global.fetch = storedFetch;
    }
  });
});

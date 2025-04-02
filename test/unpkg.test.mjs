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
import { it, describe } from 'node:test';
import { respondUnpkg } from '../src/unpkg.mjs';

describe('Test unpkg handler', () => {
  it.only('handles web-vitals request', async () => {
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
      assert.equal('cross-origin', resp.headers.get('Cross-Origin-Resource-Policy'));
    } finally {
      global.fetch = storedFetch;
    }
  });

  it('handles web-vitals 404 request', async () => {
    const req = {};
    req.url = 'http://foo.bar.org/.rum/web-vitals@0.1.0/error';

    const storedFetch = global.fetch;

    try {
      // Mock the global fetch function
      global.fetch = (v, opts) => {
        assert.equal('unpkg.com', opts.backend);
        if (v.url === 'https://unpkg.com/web-vitals@0.1.0/error') {
          const resp = {
            url: v.url,
            status: 404,
          };
          resp.headers = new Headers();
          resp.headers.append('xyz', 'abc');
          return resp;
        }
        return undefined;
      };

      const resp = await respondUnpkg(req);

      assert.equal(404, resp.status);
      assert.equal('Error: 404 from backend', resp.headers.get('x-error'));
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
          resp.headers.append('cache-control', 'forget-it');
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
          return resp;
        }
        if (v.url === 'https://unpkg.com/relocated/web-vitals') {
          const resp = { status: 302 };
          resp.headers = new Map();
          resp.headers.set('location', 'https://foo.bar.web.vitals/rel2');
          return resp;
        }
        if (v.url === 'https://foo.bar.web.vitals/rel2') {
          const resp = {
            url: v.url,
            status: 200,
          };
          resp.headers = new Map();
          resp.headers.set('cache-control', 'forget-it');
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

  it('Redirects to directory listing are prevented', async () => {
    const req = {
      url: 'http://rum.hlx.page/.rum/@adobe/helix-rum-js@2/src',
    };

    const storedFetch = global.fetch;

    let redirectsMade = 0;
    try {
      global.fetch = (v) => {
        if (v.url === 'https://unpkg.com/@adobe/helix-rum-js@2/src') {
          redirectsMade += 1;
          return {
            status: 302,
            headers: new Headers({
              Location: 'https://unpkg.com/@adobe/helix-rum-js@2/src/',
            }),
          };
        }
        return null;
      };

      const resp = await respondUnpkg(req);
      assert.equal(404, resp.status);
      assert.equal(1, redirectsMade, 'Expected redirect to be made by the test');
    } finally {
      global.fetch = storedFetch;
    }
  });

  it('Redirects to directory listing are prevented2', async () => {
    const req = {
      url: 'https://unpkg.com/npm/@adobe/helix-rum-js@2/src',
    };

    const storedFetch = global.fetch;

    const redirectsMade = [];
    try {
      global.fetch = (v) => {
        if (v.url === 'https://unpkg.com/@adobe/helix-rum-js@2/src') {
          redirectsMade.push('a');
          return {
            status: 302,
            headers: new Headers({
              Location: 'https://unpkg.com/@adobe/helix-rum-js@2/src/sub',
            }),
          };
        } else if (v.url === 'https://unpkg.com/@adobe/helix-rum-js@2/src/sub') {
          redirectsMade.push('b');
          return {
            status: 302,
            headers: new Headers({
              Location: 'https://unpkg.com/@adobe/helix-rum-js@2/src/sub/',
            }),
          };
        }
        return null;
      };

      const resp = await respondUnpkg(req);
      assert.equal(404, resp.status);
      assert.deepStrictEqual(['a', 'b'], redirectsMade, 'Expected two redirects to be made by the test');
    } finally {
      global.fetch = storedFetch;
    }
  });

  it('sets cache-control to 1 hour if the URL contains a range character', async () => {
    const req = {
      url: 'https://foo.bar.org/.rum/@adobe/helix-rum-enhancer@%5E2/src/index.js',
    };

    const storedFetch = global.fetch;
    try {
      // Mock the global fetch function
      global.fetch = (v) => {
        const resp = {
          url: v.url,
          status: 200,
        };
        resp.headers = new Headers();
        return resp;
      };

      const resp = await respondUnpkg(req);
      assert.equal(200, resp.status);
      assert.equal('public, max-age=3600', resp.headers.get('cache-control'));
    } finally {
      global.fetch = storedFetch;
    }
  });

  it('forces cache-control to 1 hour if the URL contains a range character', async () => {
    const req = {
      url: 'https://foo.bar.org/.rum/@adobe/helix-rum-enhancer@~2/src/index.js',
    };

    const storedFetch = global.fetch;
    try {
      // Mock the global fetch function
      global.fetch = (v) => {
        const resp = {
          url: v.url,
          status: 200,
        };
        resp.headers = new Headers();
        resp.headers.set('cache-control', 'max-age=999999999');
        return resp;
      };

      const resp = await respondUnpkg(req);
      assert.equal(200, resp.status);
      assert.equal(
        'public, max-age=3600',
        resp.headers.get('cache-control'),
        'Should have overridden the cache control header on range request',
      );
    } finally {
      global.fetch = storedFetch;
    }
  });

  it('keeps original cache-control for specific version requests', async () => {
    const req = {
      url: 'https://foo.bar.org/.rum/@adobe/helix-rum-enhancer@2.33.0/src/index.js',
    };

    const storedFetch = global.fetch;
    try {
      // Mock the global fetch function
      global.fetch = (v) => {
        const resp = {
          url: v.url,
          status: 200,
        };
        resp.headers = new Headers();
        resp.headers.set('cache-control', 'max-age=999999999');
        return resp;
      };

      const resp = await respondUnpkg(req);
      assert.equal(200, resp.status);
      assert.equal('max-age=999999999', resp.headers.get('cache-control'));
    } finally {
      global.fetch = storedFetch;
    }
  });
});

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
import { respondJsdelivr } from '../src/jsdelivr.mjs';

describe('Test jdelivr handler', () => {
  it('handles web-vitals request', async () => {
    const req = {};
    req.url = 'http://foo.bar.org/.rum/web-vitals';

    const storedFetch = global.fetch;

    try {
      // Mock the global fetch function
      global.fetch = (v, opts) => {
        assert.equal('jsdelivr', opts.backend);
        if (v.url === 'https://cdn.jsdelivr.net/npm/web-vitals') {
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

      const resp = await respondJsdelivr(req);

      assert.equal(200, resp.status);
      assert.equal('abc', resp.headers.get('xyz'));
      assert.equal('cross-origin', resp.headers.get('Cross-Origin-Resource-Policy'));
      assert.equal(
        'public, max-age=3600',
        resp.headers.get('cache-control'),
        'If not set, cache-control should default to 1 hour',
      );
    } finally {
      global.fetch = storedFetch;
    }
  });

  it('handles redirects', async () => {
    const req = {
      url: 'http://foo.bar.org/npm/first',
    };

    const storedFetch = global.fetch;

    try {
      global.fetch = (v) => {
        if (v.url === 'https://cdn.jsdelivr.net/npm/first') {
          return {
            status: 302,
            headers: new Headers({
              Location: 'https://cdn.jsdelivr.net/npm/second',
            }),
          };
        } else if (v.url === 'https://cdn.jsdelivr.net/npm/second') {
          return {
            status: 301,
            headers: new Headers({
              Location: '/npm/third',
            }),
          };
        } else if (v.url === 'https://cdn.jsdelivr.net/npm/third') {
          return {
            status: 200,
            headers: new Headers({
              foo: 'bar',
            }),
          };
        }
        return null;
      };

      const resp = await respondJsdelivr(req);
      assert.equal(200, resp.status);
      assert.equal('bar', resp.headers.get('foo'));
    } finally {
      global.fetch = storedFetch;
    }
  });

  it('handles redirects 2', async () => {
    const req = {
      url: 'http://foo.bar.org/npm/first',
    };

    const storedFetch = global.fetch;

    try {
      global.fetch = (v) => {
        if (v.url === 'https://cdn.jsdelivr.net/npm/first') {
          return {
            status: 307,
            headers: new Headers({
              Location: 'https://cdn.jsdelivr.net/npm/second',
            }),
          };
        } else if (v.url === 'https://cdn.jsdelivr.net/npm/second') {
          return {
            status: 200,
            headers: new Headers({
              hi: 'ha',
            }),
          };
        }
        return null;
      };

      const resp = await respondJsdelivr(req);
      assert.equal(200, resp.status);
      assert.equal('ha', resp.headers.get('hi'));
    } finally {
      global.fetch = storedFetch;
    }
  });

  it('cleans up response', async () => {
    const req = {};
    req.url = 'http://foo.bar.org/.rum/@adobe/helix-rum-js?generation=42';

    const storedFetch = global.fetch;

    try {
      // Mock the global fetch function
      global.fetch = (v, opts) => {
        assert.equal('jsdelivr', opts.backend);
        if (v.url === 'https://cdn.jsdelivr.net/npm/@adobe/helix-rum-js') {
          const headers = new Headers();
          headers.append('foo', 'bar');
          headers.append('x-jsd-version', 'eek');
          headers.append('x-jsd-version-type', 'eek');
          headers.append('x-served-by', 'eek');
          headers.append('x-cache', 'eek');

          const resp = {
            headers,
            ok: true,
            status: 200,
          };
          return resp;
        }
        return undefined;
      };

      const resp = await respondJsdelivr(req);

      assert.equal(200, resp.status);
      assert.equal('bar', resp.headers.get('foo'));

      // Should clear these headers in the cleanupHeaders()
      assert(!resp.headers.has('x-jsd-version'));
      assert(!resp.headers.has('x-jsd-version-tyep'));
      assert(!resp.headers.has('x-served-by'));
      assert(!resp.headers.has('x-cache'));
    } finally {
      global.fetch = storedFetch;
    }
  });

  it('Redirects to directory listing are prevented', async () => {
    const req = {
      url: 'https://cdn.jsdelivr.net/npm/@adobe/helix-rum-js@2/src',
    };

    const storedFetch = global.fetch;

    let redirectsMade = 0;
    try {
      global.fetch = (v) => {
        if (v.url === 'https://cdn.jsdelivr.net/npm/@adobe/helix-rum-js@2/src') {
          redirectsMade += 1;
          return {
            status: 302,
            headers: new Headers({
              Location: 'https://cdn.jsdelivr.net/npm/@adobe/helix-rum-js@2/src/',
            }),
          };
        }
        return null;
      };

      const resp = await respondJsdelivr(req);
      assert.equal(404, resp.status);
      assert.equal(1, redirectsMade, 'Expected redirect to be made by the test');
    } finally {
      global.fetch = storedFetch;
    }
  });

  it('Redirects to directory listing are prevented2', async () => {
    const req = {
      url: 'https://cdn.jsdelivr.net/npm/@adobe/helix-rum-js@2/src',
    };

    const storedFetch = global.fetch;

    const redirectsMade = [];
    try {
      global.fetch = (v) => {
        if (v.url === 'https://cdn.jsdelivr.net/npm/@adobe/helix-rum-js@2/src') {
          redirectsMade.push('a');
          return {
            status: 302,
            headers: new Headers({
              Location: 'https://cdn.jsdelivr.net/npm/@adobe/helix-rum-js@2/src/sub',
            }),
          };
        } else if (v.url === 'https://cdn.jsdelivr.net/npm/@adobe/helix-rum-js@2/src/sub') {
          redirectsMade.push('b');
          return {
            status: 302,
            headers: new Headers({
              Location: 'https://cdn.jsdelivr.net/npm/@adobe/helix-rum-js@2/src/sub/',
            }),
          };
        }
        return null;
      };

      const resp = await respondJsdelivr(req);
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

      const resp = await respondJsdelivr(req);
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
        resp.headers.set('content-type', 'application/javascript; charset=utf-8');
        return resp;
      };

      const resp = await respondJsdelivr(req);
      assert.equal(200, resp.status);
      assert.equal('text/javascript; charset=utf-8', resp.headers.get('content-type'));
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
        resp.headers.set('content-type', 'text/javascript');
        return resp;
      };

      const resp = await respondJsdelivr(req);
      assert.equal(200, resp.status);
      assert.equal('text/javascript', resp.headers.get('content-type'));
      assert.equal('max-age=999999999', resp.headers.get('cache-control'));
    } finally {
      global.fetch = storedFetch;
    }
  });
});

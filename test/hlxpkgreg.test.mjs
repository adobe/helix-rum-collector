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
import { createHash } from 'crypto';
import { gzipSync } from 'zlib';
import { afterEach, describe, it } from 'node:test';
import {
  branchFor, decodeBody, getReleaseVersion, respondHelixPkgReg,
} from '../src/hlxpkgreg.mjs';
import { LEGACY_RELEASES } from '../src/legacy-releases.mjs';

const digest = (content) => ({
  integrity: `sha384-${createHash('sha384').update(content).digest('base64')}`,
  size: Buffer.byteLength(content),
});

const manifestFor = (pkg, version, files) => JSON.stringify({
  schema: 1,
  package: `@adobe/${pkg}`,
  version,
  files: Object.fromEntries(Object.entries(files).map(([p, c]) => [p, digest(c)])),
});

/**
 * A fake aem.live: `site['release-2-x--helix-rum-js']['dist/a.js'] = 'content'`.
 * Records every requested URL. Bodies are gzip-encoded like aem.live's unless plain is set.
 */
function fakeAemLive(site, { plain = false, headers = {} } = {}) {
  const requested = [];
  global.fetch = async (req, opts) => {
    assert.equal(opts.backend, 'hlxpkgreg');
    requested.push(req.url);
    const url = new URL(req.url);
    const [branch] = url.hostname.split('--adobe.aem');
    const files = Object.hasOwn(site, branch) ? site[branch] : {};
    const path = url.pathname.slice(1);
    const content = Object.hasOwn(files, path) ? files[path] : undefined;
    if (content === undefined) {
      return new Response('not found', { status: 404 });
    }
    return new Response(plain ? content : gzipSync(content), {
      status: 200,
      headers: {
        'content-type': 'text/javascript; charset=utf-8',
        server: 'noway',
        'x-cache': 'HIT',
        ...(plain ? {} : { 'content-encoding': 'gzip' }),
        ...headers,
      },
    });
  };
  return requested;
}

const request = (path, host = 'foo.bar.org') => ({ url: `http://${host}${path}` });

describe('Verified Helix package registry', () => {
  const storedFetch = global.fetch;
  afterEach(() => {
    global.fetch = storedFetch;
  });

  it('maps version specs to release branches', () => {
    assert.deepEqual(getReleaseVersion('2.11.4'), { ver: '2-11-4', cc: 'public, max-age=31536000, immutable', exact: '2.11.4' });
    assert.equal(getReleaseVersion('~2.11.4').ver, '2-11-x');
    assert.equal(getReleaseVersion('~2.11').ver, '2-11-x');
    assert.equal(getReleaseVersion('~2').ver, '2-0-x');
    assert.equal(getReleaseVersion('^2.10.5').ver, '2-x');
    assert.equal(getReleaseVersion('^1').ver, '1-x');
    assert.equal(getReleaseVersion('^2').cc, 'public, max-age=3600');
    assert.equal(getReleaseVersion('<2.10.5'), null);
    assert.equal(branchFor('2.53.0'), 'release-2-53-0');
    assert.equal(branchFor('2.4.0-rc.1'), 'release-2-4-0-rc-1');
  });

  it('serves an exact release file that matches its manifest, decoded', async () => {
    const js = '// helix-rum-js 2.18.0\nfunction sampleRUM() {}\n';
    const requested = fakeAemLive({
      'release-2-18-0--helix-rum-js': {
        'release-manifest.json': manifestFor('helix-rum-js', '2.18.0', { 'dist/rum-standalone.js': js }),
        'dist/rum-standalone.js': js,
      },
    });
    const resp = await respondHelixPkgReg(request('/.rum/@adobe/helix-rum-js@2.18.0/dist/rum-standalone.js'));
    assert.equal(resp.status, 200);
    assert.equal(await resp.text(), js);
    assert.equal(resp.headers.get('cache-control'), 'public, max-age=31536000, immutable');
    assert.equal(resp.headers.get('x-rum-trace'), 'hlx');
    assert.equal(resp.headers.get('x-rum-release'), '2.18.0');
    assert.equal(resp.headers.get('x-rum-integrity'), digest(js).integrity);
    assert.equal(resp.headers.get('content-encoding'), null);
    assert.equal(resp.headers.get('server'), null);
    assert.equal(resp.headers.get('x-cache'), null);
    assert.deepEqual(requested.sort(), [
      'https://release-2-18-0--helix-rum-js--adobe.aem.live/dist/rum-standalone.js',
      'https://release-2-18-0--helix-rum-js--adobe.aem.live/release-manifest.json',
    ]);
  });

  it('resolves an alias to its exact write-once branch', async () => {
    const js = '// enhancer 2.53.0\n';
    const manifest = manifestFor('helix-rum-enhancer', '2.53.0', { 'src/index.js': js });
    const requested = fakeAemLive({
      'release-2-x--helix-rum-enhancer': { 'release-manifest.json': manifest, 'src/index.js': 'alias copy, not used' },
      'release-2-53-0--helix-rum-enhancer': { 'release-manifest.json': manifest, 'src/index.js': js },
    });
    const resp = await respondHelixPkgReg(request('/.rum/@adobe/helix-rum-enhancer@%5E2/src/index.js', 'rum.hlx3.page'));
    assert.equal(resp.status, 200);
    assert.equal(await resp.text(), js);
    assert.equal(resp.headers.get('cache-control'), 'public, max-age=3600');
    assert.equal(resp.headers.get('x-rum-trace'), 'hlx-fastly');
    assert.equal(resp.headers.get('x-rum-release'), '2.53.0');
    // The alias branch's own copy of the file is never requested.
    assert.deepEqual(requested.sort(), [
      'https://release-2-53-0--helix-rum-enhancer--adobe.aem-fastly.live/release-manifest.json',
      'https://release-2-53-0--helix-rum-enhancer--adobe.aem-fastly.live/src/index.js',
      'https://release-2-x--helix-rum-enhancer--adobe.aem-fastly.live/package.json',
      'https://release-2-x--helix-rum-enhancer--adobe.aem-fastly.live/release-manifest.json',
    ]);
  });

  it('verifies releases without a manifest against the npm-derived legacy table', async () => {
    const js = 'legacy bytes';
    const legacy = LEGACY_RELEASES['@adobe/helix-rum-enhancer']['2.52.0'];
    const original = legacy['src/plugins/a11y.js'];
    legacy['src/plugins/a11y.js'] = digest(js);
    try {
      fakeAemLive({
        'release-2-x--helix-rum-enhancer': { 'package.json': '{"version":"2.52.0"}' },
        'release-2-52-0--helix-rum-enhancer': { 'src/plugins/a11y.js': js },
      }, { plain: true });
      const resp = await respondHelixPkgReg(request('/.rum/@adobe/helix-rum-enhancer@^2/src/plugins/a11y.js', 'rum.hlx-cloudflare.page'));
      assert.equal(resp.status, 200);
      assert.equal(await resp.text(), js);
      assert.equal(resp.headers.get('x-rum-release'), '2.52.0');
      assert.equal(resp.headers.get('x-rum-trace'), 'hlx-cloudflare');
    } finally {
      legacy['src/plugins/a11y.js'] = original;
    }
  });

  it('refuses a file whose bytes do not match the approved digest', async () => {
    fakeAemLive({
      'release-2-18-0--helix-rum-js': {
        'release-manifest.json': manifestFor('helix-rum-js', '2.18.0', { 'dist/micro.js': 'approved' }),
        'dist/micro.js': 'tampered',
      },
    });
    const resp = await respondHelixPkgReg(request('/.rum/@adobe/helix-rum-js@2.18.0/dist/micro.js'));
    assert.equal(resp.status, 502);
    assert.equal(resp.headers.get('x-error'), 'Integrity check failed');
    assert.equal(resp.headers.get('cache-control'), 'no-store');
    assert(!(await resp.text()).includes('tampered'));
  });

  it('refuses a file that is not listed in the manifest', async () => {
    fakeAemLive({
      'release-2-18-0--helix-rum-js': {
        'release-manifest.json': manifestFor('helix-rum-js', '2.18.0', { 'dist/micro.js': 'x' }),
        'dist/extra.js': 'not approved',
      },
    });
    const resp = await respondHelixPkgReg(request('/.rum/@adobe/helix-rum-js@2.18.0/dist/extra.js'));
    assert.equal(resp.status, 404);
    assert.equal(resp.headers.get('x-error'), 'Not in an approved release');
  });

  it('refuses Object.prototype names without touching the origin', async () => {
    const requested = fakeAemLive({
      'release-2-18-0--helix-rum-js': {
        'release-manifest.json': manifestFor('helix-rum-js', '2.18.0', { 'dist/micro.js': 'x' }),
      },
    });
    for (const path of [
      '/.rum/@adobe/helix-rum-js@2.10.5/constructor',
      '/.rum/@adobe/helix-rum-js@2.10.5/toString',
      '/.rum/@adobe/helix-rum-js@2.10.5/__proto__',
      '/.rum/@adobe/helix-rum-js@2.10.5/hasOwnProperty',
      '/.rum/@adobe/helix-rum-js@2.18.0/constructor',
      '/.rum/@adobe/helix-rum-js@2.18.0/__proto__',
    ]) {
      requested.length = 0;
      // eslint-disable-next-line no-await-in-loop
      const resp = await respondHelixPkgReg(request(path));
      assert.equal(resp.status, 404, path);
      assert.equal(resp.headers.get('x-error'), 'Not in an approved release', path);
      // Only the manifest lookup (and the parallel file fetch, cancelled unread) happen;
      // nothing is verified or served.
      assert(requested.every((u) => u.includes('release-2-')), path);
    }
  });

  it('refuses a malformed manifest entry', async () => {
    fakeAemLive({
      'release-2-18-0--helix-rum-js': {
        'release-manifest.json': JSON.stringify({
          schema: 1, package: '@adobe/helix-rum-js', version: '2.18.0', files: { 'dist/micro.js': { integrity: 42 } },
        }),
        'dist/micro.js': 'x',
      },
    });
    const resp = await respondHelixPkgReg(request('/.rum/@adobe/helix-rum-js@2.18.0/dist/micro.js'));
    assert.equal(resp.status, 404);
  });

  it('refuses a manifest for another package or version', async () => {
    for (const manifest of [
      manifestFor('helix-rum-enhancer', '2.18.0', { 'dist/micro.js': 'x' }),
      manifestFor('helix-rum-js', '2.18.1', { 'dist/micro.js': 'x' }),
    ]) {
      fakeAemLive({ 'release-2-18-0--helix-rum-js': { 'release-manifest.json': manifest, 'dist/micro.js': 'x' } });
      // eslint-disable-next-line no-await-in-loop
      const resp = await respondHelixPkgReg(request('/.rum/@adobe/helix-rum-js@2.18.0/dist/micro.js'));
      assert.equal(resp.status, 404);
    }
  });

  it('refuses an unknown release, an unresolvable alias and a missing file', async () => {
    fakeAemLive({
      'release-3-x--helix-rum-js': { 'package.json': 'not json' },
      'release-2-18-0--helix-rum-js': {
        'release-manifest.json': manifestFor('helix-rum-js', '2.18.0', { 'dist/micro.js': 'x' }),
      },
    });
    const cases = [
      ['/.rum/@adobe/helix-rum-js@2.0.0/dist/micro.js', 404, 'Not in an approved release'],
      ['/.rum/@adobe/helix-rum-js@^3/dist/micro.js', 404, 'Unknown release'],
      ['/.rum/@adobe/helix-rum-js@~2.9/dist/micro.js', 404, 'Unknown release'],
      ['/.rum/@adobe/helix-rum-js@2.10/dist/micro.js', 404, 'Unknown release'],
      ['/.rum/@adobe/helix-rum-js@2.18.0/dist/micro.js', 502, 'Release file unavailable: 404'],
      ['/.rum/@adobe/helix-rum-js@2.18.0', 404, 'No file'],
      ['/.rum/@adobe/helix-rum-js/dist/micro.js', 404, 'No version'],
      ['/.rum/@adobe/helix-rum-aaaarrr@2.10.5/src/index.js', 404, 'Unsupported package'],
      ['/.rum/@adobe/helix-rum-enhancer@<2.10.5/src/index.js', 404, 'Unsupported version'],
    ];
    for (const [path, status, error] of cases) {
      // eslint-disable-next-line no-await-in-loop
      const resp = await respondHelixPkgReg(request(path));
      assert.equal(resp.status, status, path);
      assert.equal(resp.headers.get('x-error'), error, path);
    }
  });

  it('decodes gzip by its magic number, whatever the headers say', async () => {
    assert.equal(new TextDecoder().decode(await decodeBody(gzipSync('abc'))), 'abc');
    assert.equal(new TextDecoder().decode(await decodeBody(new TextEncoder().encode('abc'))), 'abc');
  });

  it('has legacy digests for every version that still gets traffic', () => {
    assert.deepEqual(Object.keys(LEGACY_RELEASES['@adobe/helix-rum-js']), ['1.9.0', '2.10.5', '2.14.0', '2.15.0', '2.17.0']);
    assert.deepEqual(Object.keys(LEGACY_RELEASES['@adobe/helix-rum-enhancer']), ['1.23.1', '2.34.2', '2.45.1', '2.47.3', '2.51.0', '2.51.1', '2.52.0']);
    const releases = Object.values(LEGACY_RELEASES).flatMap((versions) => Object.values(versions));
    releases.forEach((files) => {
      assert(Object.keys(files).length > 0);
      Object.values(files).forEach(({ integrity, size }) => {
        assert.match(integrity, /^sha384-[A-Za-z0-9+/]{64}$/);
        assert(size > 0);
      });
    });
    assert(LEGACY_RELEASES['@adobe/helix-rum-js']['2.10.5']['dist/rum-standalone.js']);
    assert(LEGACY_RELEASES['@adobe/helix-rum-js']['1.9.0']['src/index.js']);
    assert(LEGACY_RELEASES['@adobe/helix-rum-enhancer']['2.52.0']['src/plugins/a11y.js']);
  });
});

#!/usr/bin/env node
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

// Pre-deploy guard: replays the package requests that carry real traffic through the
// verifying handler, against the live release branches on every backend, and fails if any
// would not be served. Package serving has no fallback, so a release, branch or backfill
// that isn't in place yet must stop the deploy instead of breaking RUM on customer sites.
//
//   node tools/verify-package-coverage.mjs
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { respondHelixPkgReg } from '../src/hlxpkgreg.mjs';
import { LEGACY_RELEASES } from '../src/legacy-releases.mjs';

// Files that loaders request through aliases (rum.hlx.page logs, November 2026).
export const ALIAS_REQUESTS = {
  'helix-rum-js': {
    '^2': ['dist/rum-standalone.js', 'dist/micro.js', 'dist/rum-standalone-404.js'],
    '^1': ['src/index.js'],
  },
  'helix-rum-enhancer': {
    '^2': [
      'src/index.js',
      ...['a11y', 'cwv', 'form', 'martech', 'onetrust', 'redirect', 'softnav', 'trustarc',
        'usercentrics', 'video', 'webcomponent'].map((p) => `src/plugins/${p}.js`),
      // what /.rum/web-vitals/dist/web-vitals.iife.js is served from
      'src/vendor/web-vitals.iife.js',
    ],
    '^1': ['src/index.js'],
  },
};

// The collector's production hosts select the aem.live backend (aem.live, aem-fastly.live,
// aem-cloudflare.live).
export const HOSTS = ['rum.hlx.page', 'rum.hlx3.page', 'rum.hlx-cloudflare.page'];

export function coverageRequests() {
  const paths = [];
  Object.entries(ALIAS_REQUESTS).forEach(([pkg, aliases]) => {
    Object.entries(aliases).forEach(([alias, files]) => {
      files.forEach((file) => paths.push(`/.rum/@adobe/${pkg}@${alias}/${file}`));
    });
  });
  // Every approved file of every legacy release with traffic, at its exact version.
  Object.entries(LEGACY_RELEASES).forEach(([name, versions]) => {
    Object.entries(versions).forEach(([version, files]) => {
      Object.keys(files).forEach((file) => paths.push(`/.rum/${name}@${version}/${file}`));
    });
  });
  return HOSTS.flatMap((host) => paths.map((path) => `https://${host}${path}`));
}

export async function verifyCoverage(urls, { concurrency = 8, respond = respondHelixPkgReg } = {}) {
  const failures = [];
  let next = 0;
  const worker = async () => {
    while (next < urls.length) {
      const url = urls[next];
      next += 1;
      let status;
      let error;
      try {
        // eslint-disable-next-line no-await-in-loop
        const resp = await respond({ url });
        status = resp.status;
        error = resp.headers.get('x-error');
        // eslint-disable-next-line no-await-in-loop
        await resp.arrayBuffer();
      } catch (e) {
        error = e.message;
      }
      if (status !== 200) {
        failures.push({ url, status, error });
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return failures.sort((a, b) => a.url.localeCompare(b.url));
}

async function main() {
  const urls = coverageRequests();
  // The handler logs each refusal; the summary below lists them once.
  const consoleError = console.error;
  console.error = () => {};
  let failures;
  try {
    failures = await verifyCoverage(urls);
  } finally {
    console.error = consoleError;
  }
  if (failures.length) {
    process.stderr.write(`${failures.length} of ${urls.length} package requests would not be served:\n`);
    failures.forEach(({ url, status, error }) => process.stderr.write(`  ${status ?? 'ERR'} ${url}  ${error ?? ''}\n`));
    process.stderr.write('Release the libraries and run the backfills before deploying (docs/PACKAGE-SERVING.md).\n');
    process.exit(1);
  }
  process.stdout.write(`All ${urls.length} package requests are served and verified.\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    process.stderr.write(`${e.stack}\n`);
    process.exit(1);
  });
}

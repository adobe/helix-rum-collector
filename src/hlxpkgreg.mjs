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
/* eslint-env serviceworker */
import { cleanupResponse } from './cdnutils.mjs';

// TODO do we need to check for the fact that there is a newer version at all?
// E.g. when requesting ~1.2.3 we should not be served version 1.1.6 if that is
// the latest version. We should only serve 1.2.3, 1.2.4, 1.2.5 etc, whatever is the
// newest.
// Let's not handle version 0.x specially, as the supported packages all have versions
// higher than 0.x
function getReleaseVersion(verstr) {
  const trimmed = verstr.trim();
  const prefix = trimmed[0];
  const va = trimmed.split('.');
  const orgva = va.slice(); // keep original version too
  if (va.length === 1) {
    va.push('0'); // Always have at least 2 version components
  }

  const wildcardCC = 'public, max-age=3600';
  switch (prefix) { // prefix
    case '~':
      // ignore micro
      return { ver: `${va[0].substring(1)}-${va[1]}-x`, cc: wildcardCC };
    case '^':
      // ignore micro and minor
      return { ver: `${va[0].substring(1)}-x`, cc: wildcardCC };
    default:
      if (prefix >= '0' && prefix <= '9') {
        // exact version
        return {
          ver: orgva.join('-'),
          cc: 'public, max-age=31536000, immutable',
        };
      } else {
        return null;
      }
  }
}

export async function respondHelixPkgReg(req) {
  const url = new URL(req.url);
  const paths = url.pathname.split('/').slice(3);

  const [pkgname, pkgver] = paths[0].split('@');
  if (pkgname !== 'helix-rum-js' && pkgname !== 'helix-rum-enhancer') {
    return { status: 500, body: 'Unsupported package' };
  }
  if (!pkgver) {
    return { status: 500, body: 'No version' };
  }

  const relver = getReleaseVersion(pkgver);
  if (!relver) {
    return { status: 500, body: 'Unsupported version' };
  }
  const beurl = new URL(`https://release-${relver.ver}--${pkgname}--adobe.aem.live/${paths.slice(1).join('/')}`);
  const bereq = new Request(beurl.href);
  console.log('fetching', bereq.url);
  const beresp = await fetch(bereq, {
    backend: 'hlxpkgreg',
  });
  console.log('fetched', bereq.url, beresp.status, beresp.headers.get('ETag'), beresp.headers.get('Content-Length'));

  const ccMap = new Map();
  ccMap.set('cache-control', relver.cc);
  ccMap.set('x-rum-trace', 'hlx'); // Trace the backend used
  return cleanupResponse(beresp, req, ccMap);
}

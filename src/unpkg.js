/*
 * Copyright 2022 Adobe. All rights reserved.
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

function cleanupHeaders(resp) {
  [
    'cf-cache-status',
    'cf-ray',
    'expect-ct',
    'fly-request-id',
    'server',
  ].forEach((headername) => resp.headers.delete(headername));
  return resp;
}

export async function respondUnpkg(req) {
  const url = new URL(req.url);
  const paths = url.pathname.split('/');
  const beurl = new URL(paths.slice(2).join('/'), 'https://unpkg.com');
  const bereq = new Request(beurl.href);
  const beresp = await fetch(bereq, {
    backend: 'unpkg.com',
  });
  if (beresp.status === 302) {
    const bereq2 = new Request(new URL(beresp.headers.get('location'), 'https://unpkg.com'));
    const beresp2 = await fetch(bereq2, {
      backend: 'unpkg.com',
    });

    // override the cache control header
    beresp2.headers.set('cache-control', beresp.headers.get('cache-control'));

    if (beresp2.status === 302) {
      const bereq3 = new Request(new URL(beresp2.headers.get('location'), 'https://unpkg.com'));
      const beresp3 = await fetch(bereq3, {
        backend: 'unpkg.com',
      });

      // override the cache control header
      beresp3.headers.set('cache-control', beresp.headers.get('cache-control'));

      return cleanupHeaders(beresp3);
    }
    return cleanupHeaders(beresp2);
  }
  return cleanupHeaders(beresp);
}

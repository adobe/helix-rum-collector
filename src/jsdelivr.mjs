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

// Headers removed by cleanupHeaders()
const removedHeaders = [
  'cf-cache-status',
  'cf-ray',
  'server',
  'x-jsd-version',
  'x-jsd-version-type',
  'x-served-by',
  'x-cache',
];

const redirectHeaders = [301, 302, 307, 308];

/**
 * Removes the headers listed in removeHeaders from the Response.
 * It does this by creating a new Response which is a copy of the
 * original with the headers removed.
 *
 * @param {Response} resp the response to clean
 * @returns the recreated, cleaned response
 */
function cleanupHeaders(resp) {
  // Can't modify the response headers, so recreate a new one with the headers removed
  const newHeaders = new Headers();

  for (const kv of resp.headers.entries()) {
    if (!removedHeaders.includes(kv[0])) {
      newHeaders.append(kv[0], kv[1]);
    }
  }

  const result = new Response(resp.body, {
    headers: newHeaders,
    status: resp.status,
    statusText: resp.statusText,
  });
  return result;
}

export async function respondJsdelivr(req) {
  const url = new URL(req.url);
  const paths = url.pathname.split('/');
  const beurl = new URL(paths.slice(2).join('/'), 'https://cdn.jsdelivr.net/npm/');
  const bereq = new Request(beurl.href);
  console.log('fetching', bereq.url);
  const beresp = await fetch(bereq, {
    backend: 'jsdelivr',
  });
  console.log('fetched', bereq.url, beresp.status, beresp.headers.get('ETag'), beresp.headers.get('Content-Length'));

  if (redirectHeaders.includes(beresp.status)) {
    const bereq2 = new Request(new URL(beresp.headers.get('location'), 'https://cdn.jsdelivr.net'));
    const beresp2 = await fetch(bereq2, {
      backend: 'jsdelivr',
    });
    console.log('fetched', bereq2.url, beresp2.status, beresp2.headers.get('ETag'), beresp2.headers.get('Content-Length'));

    // override the cache control header
    beresp2.headers.set('cache-control', beresp.headers.get('cache-control'));

    if (redirectHeaders.includes(beresp2.status)) {
      const bereq3 = new Request(new URL(beresp2.headers.get('location'), 'https://cdn.jsdelivr.net'));
      const beresp3 = await fetch(bereq3, {
        backend: 'jsdelivr',
      });
      console.log('fetched', bereq3.url, beresp3.status, beresp3.headers.get('ETag'), beresp3.headers.get('Content-Length'));

      // override the cache control header
      beresp3.headers.set('cache-control', beresp.headers.get('cache-control'));

      return cleanupHeaders(beresp3);
    }
    return cleanupHeaders(beresp2);
  }
  return cleanupHeaders(beresp);
}

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
  'expect-ct',
  'fly-request-id',
  'server',
];

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
      console.log('keeping header', kv[0], kv[1]);
    }
  }

  const result = new Response(resp.body, {
    headers: newHeaders,
    status: resp.status,
    statusText: resp.statusText,
  });
  return result;
}

async function transformBody(resp, responseUrl, req) {
  const url = new URL(req.url);
  const respURL = new URL(responseUrl);
  if (resp.ok
    && resp.status === 200
    && url.pathname.indexOf('@adobe/helix-rum-js') >= 0) {
    const generation = url.searchParams.get('generation') || respURL.pathname.split(/[@\\/]/).slice(2, 5).join('-');
    const text = await resp.text();
    console.log('response length', text.length);
    const body = text.replace(/__HELIX_RUM_JS_VERSION__/, generation.replace(/[^a-z0-9_.-]/ig, ''));
    return new Response(body, { headers: resp.headers });
  }
  return resp;
}

async function cleanupResponse(resp, req) {
  const cleanedResponse = cleanupHeaders(resp);
  try {
    return await transformBody(cleanedResponse, resp.url, req);
  } catch (e) {
    console.error(e.message);
  }
  return cleanedResponse;
}

export async function respondUnpkg(req) {
  const url = new URL(req.url);
  const paths = url.pathname.split('/');
  const beurl = new URL(paths.slice(2).join('/'), 'https://cdn.jsdelivr.net/npm/');
  const bereq = new Request(beurl.href);
  console.log('fetching [1]', bereq.url);
  const beresp = await fetch(bereq, {
    backend: 'jsdelivr',
  });
  console.log('fetched [1]', bereq.url, beresp.status, beresp.headers.get('content-length'));
  return cleanupResponse(beresp, req);
}

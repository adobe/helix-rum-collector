/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const removedHeaders = [
  'cf-cache-status',
  'cf-ray',
  'expect-ct',
  'fly-request-id',
  'nel',
  'report-to',
  'server',
  'timing-allow-origin',
  'x-cache',
  'x-jsd-version-type',
  'x-jsd-version',
  'x-served-by',
];

/**
 * Removes the headers listed in removeHeaders from the Response.
 * It does this by creating a new Response which is a copy of the
 * original with the headers removed.
 *
 * @param {Response} resp the response to clean
 * @param {Map} addHeaders Headers to add to the response (optional)
 * @returns the recreated, cleaned response
 */
export function cleanupHeaders(resp, addHeaders) {
  // Can't modify the response headers, so recreate a new one with the headers removed
  const newHeaders = new Headers();

  for (const kv of resp.headers.entries()) {
    if (!removedHeaders.includes(kv[0])) {
      // eslint-disable-next-line prefer-destructuring
      newHeaders.set(kv[0], kv[1]);
    }
  }

  if (addHeaders) {
    // Add all the addHeaders
    addHeaders.forEach((value, key) => newHeaders.set(key, value));
  }

  const cacheControl = resp.headers.get('cache-control');
  if (!cacheControl || cacheControl === 'null') {
    // Ensure that cacheControl has a value, if not set, use 1 hour
    newHeaders.set('cache-control', 'public, max-age=3600');
  }

  newHeaders.set('Cross-Origin-Resource-Policy', 'cross-origin');
  newHeaders.set('x-compress-hint', 'on');

  // const headers = Object.fromEntries(newHeaders);

  // const headers = {
  //   'Content-Type': 'text/plain',
  //   'x-yippie': 'yoyo',
  //   'cache-control': 'public, max-age=3700',
  // };

  const result = new Response(resp.body, {
    headers: newHeaders,
    // headers,
    status: resp.status,
    statusText: resp.statusText,
  });
  return result;
}
export async function transformBody(resp, responseUrl, req) {
  const url = new URL(req.url);
  const respURL = new URL(responseUrl);
  if (resp.ok
    && resp.status === 200
    && url.pathname.indexOf('@adobe/helix-rum-js') >= 0) {
    const urlversion = respURL.pathname.split(/[@\\/]/).slice(2, 5).pop();
    if (urlversion === '1.0.0' || urlversion === '1.0.1') {
      // only rewrite for 1.0.0 and 1.0.1 – newer versions don't need this
      const generation = url.searchParams.get('generation') || respURL.pathname.split(/[@\\/]/).slice(2, 5).join('-');
      // in my testing, this has often returned an empty string, therefore
      // we try to reduce this code path as much as possible without breaking
      // compatibility. In the next breaking change we should remove this entirely
      // because it's not needed anymore.
      const text = await resp.text();
      const body = text.replace(/__HELIX_RUM_JS_VERSION__/, generation.replace(/[^a-z0-9_.-]/ig, ''));
      return new Response(body, { headers: resp.headers });
    }
  }
  return resp;
}
export async function cleanupResponse(resp, req, newHeaders) {
  const cleanedResponse = cleanupHeaders(resp, newHeaders);
  try {
    if (resp.status < 400) {
      return await transformBody(cleanedResponse, resp.url, req);
    }
    return new Response(`error: ${resp.status}`, {
      status: resp.status,
      headers: {
        'Content-Type': 'text/plain',
        'x-blah': 'yeehaa',
        'cache-control': 'public, max-age=300',
        'x-error': `Error: ${resp.status} from backend`,
      },
    });
  } catch (e) {
    console.error(e.message);
  }
  return cleanedResponse;
}

export function prohibitDirectoryRequest(req) {
  if (req?.url.endsWith('/')) {
    return new Response('Directory listing is not permitted', { status: 404 });
  }
  return undefined;
}

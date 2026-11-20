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
  'x-cache-hits',
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
      newHeaders.set(kv[0], kv[1]);
    }
  }

  if (addHeaders) {
    // Add all the addHeaders
    addHeaders.forEach((value, key) => newHeaders.set(key, value));
  }

  const cacheControl = newHeaders.get('cache-control');
  if (!cacheControl || cacheControl === 'null') {
    // Ensure that cacheControl has a value, if not set, use 1 hour
    newHeaders.set('cache-control', 'public, max-age=3600');
  }

  const contentType = newHeaders.get('content-type');
  if (contentType && contentType.indexOf('application/javascript') >= 0) {
    // content-type of application/javascript is obsolete and replaced by text/javascript
    const newContentType = contentType.replace('application/javascript', 'text/javascript');
    newHeaders.set('content-type', newContentType);
  }

  newHeaders.set('Cross-Origin-Resource-Policy', 'cross-origin');
  newHeaders.set('X-Frame-Options', 'DENY');
  newHeaders.set('x-compress-hint', 'on');

  const result = new Response(resp.body, {
    headers: newHeaders,
    status: resp.status,
    statusText: resp.statusText,
  });
  return result;
}
export function prohibitDirectoryRequest(req) {
  if (req?.url.endsWith('/')) {
    return new Response('Directory listing is not permitted', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
        'x-error': 'Error: Directory listing is not permitted',
        'X-Frame-Options': 'DENY',
      },
    });
  }
  return undefined;
}

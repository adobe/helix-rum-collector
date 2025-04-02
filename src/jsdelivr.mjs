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
import { cleanupResponse, prohibitDirectoryRequest } from './cdnutils.mjs';

const redirectHeaders = [301, 302, 307, 308];

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


  // TODO maybe move to cleanup response?
  let ccMap;
  if (beurl.href.includes('^')) {
    ccMap = new Map([['yeeee', 'haaa'], ['cache-control', 'public, max-age=3600']]);
  }

  if (redirectHeaders.includes(beresp.status)) {
    const bereq2 = new Request(new URL(beresp.headers.get('location'), 'https://cdn.jsdelivr.net'));
    const err2 = prohibitDirectoryRequest(bereq2);
    if (err2) {
      return cleanupResponse(err2);
    }

    const beresp2 = await fetch(bereq2, {
      backend: 'jsdelivr',
    });
    console.log('fetched', bereq2.url, beresp2.status, beresp2.headers.get('ETag'), beresp2.headers.get('Content-Length'));

    if (redirectHeaders.includes(beresp2.status)) {
      const bereq3 = new Request(new URL(beresp2.headers.get('location'), 'https://cdn.jsdelivr.net'));
      const err3 = prohibitDirectoryRequest(bereq3);
      if (err3) {
        return cleanupResponse(err3);
      }

      const beresp3 = await fetch(bereq3, {
        backend: 'jsdelivr',
      });
      console.log('fetched', bereq3.url, beresp3.status, beresp3.headers.get('ETag'), beresp3.headers.get('Content-Length'));

      return cleanupResponse(beresp3, req, ccMap);
    }
    return cleanupResponse(beresp2, req, ccMap);
  }
  return cleanupResponse(beresp, req, ccMap);
}

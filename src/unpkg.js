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
    return fetch(bereq2, {
      backend: 'unpkg.com',
    });
  }
  return beresp;
}

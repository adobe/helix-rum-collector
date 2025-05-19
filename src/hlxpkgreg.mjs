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
import { cleanupResponse, prohibitDirectoryRequest } from './cdnutils.mjs';

const redirectHeaders = [301, 302, 307, 308];
const rangeChars = ['^', '~'];

function getReleaseVersion(verstr) {
  const trimmed = verstr.trim();
  const prefix = trimmed[0];
  const va = trimmed.split('.');
  const orgva = va.slice(); // keep original version too
  if (va.length === 1) {
    va.push('0'); // Always have at least 2 version components
  }

  if (prefix === '~') {
    // ignore micro
    return `${va[0].substring(1)}-${va[1]}-x`;
  } else if (prefix === '^') {
    // ignore micro and minor
    return `${va[0].substring(1)}-x`;
  }
  return orgva.join('-');
}

export async function respondHelixPkgReg(req) {
  const url = new URL(req.url);
  const paths = url.pathname.split('/').slice(3);

  const [pkgname, pkgver] = paths[0].split('@');
  if (pkgname !== 'helix-rum-js' && pkgname !== 'helix-rum-enhancer') {
    return null; // TODO Make sure the other registries are used
  }
  const relver = getReleaseVersion(pkgver);
  const beurl = new URL(`https://release-${relver}--${pkgname}--adobe.aem.live/${paths.slice(1).join('/')}`);
  const bereq = new Request(beurl.href);
  console.log('fetching', bereq.url);
  const beresp = await fetch(bereq, {
    backend: 'hlxpkgreg', // TODO add this backend to the config
  });
  console.log('fetched', bereq.url, beresp.status, beresp.headers.get('ETag'), beresp.headers.get('Content-Length'));

  const ccMap = new Map();
  ccMap.set('x-rum-trace', 'hlx'); // Trace the backend used
  return cleanupResponse(beresp, req, ccMap);
}

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
import { cleanupHeaders } from './cdnutils.mjs';
import { LEGACY_RELEASES } from './legacy-releases.mjs';
import { BACKENDS } from './utils.mjs';

// Versions whose branch name (non-alphanumerics replaced by '-') is unambiguous; the
// release tooling only publishes these.
const VERSION = /^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z]+(\.[0-9A-Za-z]+)*)?$/;
const PACKAGES = ['helix-rum-js', 'helix-rum-enhancer'];

// Note we don't check for the fact that an older version could potentially be returned
// if a compatible version with a version that is not yet released is requested. For
// example if ~1.2.3 is requested but the latest released version is 1.2.1 then just 1-2-x
// is used which will return 1.2.1 as that what it's mapped to. So the precondition to using
// this function is that the version string input should be at least a released version.
// We also don't handle version 0.x specially, as the supported packages all have versions
// higher than 0.x
export function getReleaseVersion(verstr) {
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
          exact: trimmed,
        };
      } else {
        return null;
      }
  }
}

function getBackendSuffix(url) {
  const { hostname } = url;

  const backend = BACKENDS.find((b) => b.proddomain === hostname || b.cidomain === hostname);
  if (backend) {
    return `-${backend.provider}`;
  }
  return '';
}

export function branchFor(version) {
  return `release-${version.replace(/[^0-9A-Za-z]/g, '-')}`;
}

function base64(buffer) {
  let binary = '';
  new Uint8Array(buffer).forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export async function sha384(bytes) {
  return `sha384-${base64(await crypto.subtle.digest('SHA-384', bytes))}`;
}

/**
 * aem.live sends gzip-encoded bodies even when the request doesn't ask for it. Depending on
 * the platform, fetch() may or may not have decoded it already, so decide by the gzip magic
 * number rather than the Content-Encoding header. JavaScript and JSON never start with it.
 */
export async function decodeBody(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
    const stream = new Response(bytes).body.pipeThrough(new DecompressionStream('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  return bytes;
}

function refuse(status, message, details) {
  if (details) {
    console.error(JSON.stringify({
      metric: 'rum-package-refused', status, message, ...details,
    }));
  }
  return new Response(`error: ${message}`, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Frame-Options': 'DENY',
      'x-error': message,
    },
  });
}

/**
 * Serves a file of a RUM package from its release branch on aem.live, but only if its
 * decoded bytes match the approved SHA-384 digest for that exact release:
 *
 * - an alias (^2, ~2.17) is resolved to the exact version it currently points to
 *   (release-manifest.json, or package.json for older releases), and the file is served
 *   from that version's write-once release-X-Y-Z branch;
 * - the approved digests come from that exact branch's release-manifest.json or, for
 *   releases that predate manifests, from LEGACY_RELEASES, built from verified npm tarballs;
 * - anything unlisted, missing or mismatched is refused. There is no other source.
 */
export async function respondHelixPkgReg(req) {
  const url = new URL(req.url);
  const paths = decodeURI(url.pathname).split('/').slice(3);

  const [pkgname, pkgver] = paths[0].split('@');
  if (!PACKAGES.includes(pkgname)) {
    return refuse(404, 'Unsupported package');
  }
  if (!pkgver) {
    return refuse(404, 'No version');
  }
  const relver = getReleaseVersion(pkgver);
  if (!relver) {
    return refuse(404, 'Unsupported version');
  }
  const file = paths.slice(1).join('/');
  if (!file) {
    return refuse(404, 'No file');
  }

  const backend = getBackendSuffix(url);
  const fetchBranch = (branch, path) => fetch(
    new Request(`https://${branch}--${pkgname}--adobe.aem${backend}.live/${path}`),
    { backend: 'hlxpkgreg' },
  );
  const readJson = async (branch, path) => {
    const resp = await fetchBranch(branch, path);
    if (resp.status !== 200) {
      return null;
    }
    try {
      return JSON.parse(new TextDecoder().decode(await decodeBody(await resp.arrayBuffer())));
    } catch (e) {
      return null;
    }
  };

  let version = relver.exact;
  if (!version) {
    const alias = `release-${relver.ver}`;
    const aliasManifest = await readJson(alias, 'release-manifest.json');
    version = aliasManifest?.version ?? (await readJson(alias, 'package.json'))?.version;
  }
  if (typeof version !== 'string' || !VERSION.test(version)) {
    return refuse(404, 'Unknown release', { pkgname, pkgver, version });
  }

  const exactBranch = branchFor(version);
  const name = `@adobe/${pkgname}`;
  const manifest = await readJson(exactBranch, 'release-manifest.json');
  const approved = manifest
    && manifest.schema === 1 && manifest.package === name && manifest.version === version
    ? manifest.files?.[file]
    : LEGACY_RELEASES[name]?.[version]?.[file];
  if (!approved) {
    return refuse(404, 'Not in an approved release', {
      pkgname, pkgver, version, file, manifest: Boolean(manifest),
    });
  }

  const beresp = await fetchBranch(exactBranch, file);
  if (beresp.status !== 200) {
    return refuse(502, `Release file unavailable: ${beresp.status}`, {
      pkgname, version, file, status: beresp.status,
    });
  }
  const bytes = await decodeBody(await beresp.arrayBuffer());
  const integrity = await sha384(bytes);
  if (integrity !== approved.integrity || bytes.length !== approved.size) {
    return refuse(502, 'Integrity check failed', {
      pkgname, pkgver, version, file, integrity, size: bytes.length, approved,
    });
  }

  const ccMap = new Map();
  ccMap.set('cache-control', relver.cc);
  ccMap.set('access-control-allow-origin', '*');
  ccMap.set('access-control-allow-methods', 'GET, HEAD, OPTIONS');
  ccMap.set('access-control-allow-headers', '*');
  ccMap.set('access-control-expose-headers', '*');
  ccMap.set('x-rum-trace', `hlx${backend}`); // Trace the backend used
  ccMap.set('x-rum-release', version);
  ccMap.set('x-rum-integrity', integrity);
  // The body was consumed above, so copy only the headers.
  const { headers } = cleanupHeaders(new Response(null, { headers: beresp.headers }), ccMap);
  // The body is served decoded; the CDN compresses it again (x-compress-hint).
  headers.delete('content-encoding');
  headers.delete('content-length');
  return new Response(bytes, { status: 200, headers });
}

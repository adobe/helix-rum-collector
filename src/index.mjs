/*
 * Copyright 2021 Adobe. All rights reserved.
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

import { ConsoleLogger } from './console-logger.mjs';
import { CoralogixErrorLogger } from './coralogix-error-logger.mjs';
import { CoralogixLogger } from './coralogix-logger.mjs';
import { GoogleLogger } from './google-logger.mjs';
import { respondHelixPkgReg } from './hlxpkgreg.mjs';
import { respondJsdelivr } from './jsdelivr.mjs';
import { respondRobots } from './robots.mjs';
import { S3Logger } from './s3-logger.mjs';
import { respondUnpkg } from './unpkg.mjs';

const REGISTRY_TIMEOUT_MS = 5000;

function respondError(message, status, e, req) {
  const msg = e && e.message ? `${message}: ${e.message}` : message;
  const headers = {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Frame-Options': 'DENY',
    'X-Error': msg,
  };

  const response = new Response(`${msg}\n`, {
    status,
    headers,
  });
  console.error('Loggable error:', msg, e && e.stack);
  try {
    const c = new CoralogixErrorLogger(req);
    c.logError(status, message);
  } catch (err) {
    console.error(`error logging error: ${err.message}`);
  }
  return response;
}

function getRandomID() {
  return Math.random().toString(36).slice(-4);
}

function respondInfo(ctx) {
  return new Response(`{"platform": "${ctx?.runtime?.name}", "version": "${ctx?.func?.version}"}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Frame-Options': 'DENY',
    },
  });
}

export function respondCORS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Frame-Options': 'DENY',
    },
    status: 204,
  });
}

async function respondRegistry(regName, req, successTracker, timeout) {
  return new Promise((resolve, reject) => {
    function callRegistry() {
      if (successTracker.success) {
        reject(new Error('Already obtained'));
        return;
      }

      try {
        const respondFunc = regName === 'jsdelivr' ? respondJsdelivr : respondUnpkg;
        respondFunc(req).then(
          (resp) => {
            if (resp.status >= 500) {
              reject(new Error(`Error from registry: ${resp.status}`));
              return;
            }
            // eslint-disable-next-line no-param-reassign
            successTracker.success = true;
            resolve(resp);
          },
        );
      } catch (error) {
        reject(error);
      }
    }

    if (timeout) {
      setTimeout(callRegistry, timeout);
    } else {
      callRegistry();
    }
  });
}

async function respondPackage(req, isHelix) {
  let errmsg = '';
  if (isHelix) {
    // If Helix can serve the package, then always try that first
    try {
      const resp = await respondHelixPkgReg(req);
      if (resp.status === 200) {
        return resp;
      } else {
        console.log('Helix package registry response: ', resp);
        errmsg = `Helix package registry response: ${resp.status} ${resp.statusText}`;
      }
    } catch (e) {
      console.error('Error from Helix package registry: ', e);
      errmsg = `Error from Helix package registry: ${e.message}`;
    }
    console.log('Falling back to jsdelivr/unpkg');
  }

  // We're going to serve from a non-Helix package registry
  const useJsdelivr = Math.random() < 0.5; // 50% chance to use jsdelivr
  const jsdDelay = useJsdelivr ? undefined : REGISTRY_TIMEOUT_MS;
  const unpkgDelay = useJsdelivr ? REGISTRY_TIMEOUT_MS : undefined;

  // This shared object between the promises is used to track
  // if one of the requests has succeeded, to avoid unneccessary requests.
  const successTracker = {};
  try {
    const resp = await Promise.any([
      respondRegistry('jsdelivr', req, successTracker, jsdDelay),
      respondRegistry('unpkg', req, successTracker, unpkgDelay),
    ]);
    resp.headers.set('x-error', errmsg);
    return resp;
  } catch (error) {
    return new Response(error.errors, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Frame-Options': 'DENY',
      },
    });
  }
}

export async function main(req, ctx) {
  if (req.method === 'OPTIONS') {
    return respondCORS();
  }
  const { pathname } = new URL(req.url);

  // Reject all encoded characters except %5E (^) when used for semantic versioning
  // i.e. allow patterns like @package@%5E2.0.0 but reject any other % encoding
  const validVersionPattern = /%5[Ee](?:\d|$)/;

  const hasInvalidEncoding = pathname.includes('%')
    && !pathname
      .split('/')
      .every((segment) => !segment.includes('%')
        || (segment.match(/%/g).length === 1 // exactly one % sign is allowed
          && validVersionPattern.test(segment))); // and only if it's the ^ character

  if (hasInvalidEncoding || decodeURI(pathname).includes('..') || decodeURI(pathname).includes(':')) {
    return respondError('Invalid path', 400, undefined, req);
  }

  try {
    if (req.method === 'GET' && pathname.startsWith('/robots.txt')) {
      return respondRobots(req);
    }
    if (req.method === 'GET' && pathname.startsWith('/info.json')) {
      return respondInfo(ctx);
    }

    // Block access to sensitive files
    if (pathname.toLowerCase().includes('package.json')
      || pathname.toLowerCase().includes('changelog.md')) {
      return respondError('Not Found', 404, undefined, req);
    }

    const isDirList = (pathname.endsWith('/'));
    if (req.method === 'GET' && pathname.match(/^\/\.rum\/web-vitals[@/]/)) {
      if (isDirList) {
        return respondError('Directory listing is not allowed', 404, undefined, req);
      }
      return respondPackage(req);
    }
    if (req.method === 'GET' && pathname.startsWith('/.rum/@adobe/helix-rum')) {
      if (isDirList) {
        return respondError('Directory listing is not allowed', 404, undefined, req);
      }
      return respondPackage(req, true);
    }
    const body = req.method === 'GET'
      ? JSON.parse(new URL(req.url).searchParams.get('data'))
      : await req.json();

    const headers = {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'X-Frame-Options': 'DENY',
    };

    const {
      weight = 1,
      id = req.method === 'GET' ? `${getRandomID()}` : undefined,
      cwv = {},
      referer, referrer,
      generation, checkpoint,
      target,
      source,
      t,
    } = body;

    if (!id && id !== '') {
      return respondError('id field is required', 400, undefined, req);
    }
    if (!weight || typeof weight !== 'number') {
      return respondError('weight must be a number', 400, undefined, req);
    }
    if (typeof cwv !== 'object') {
      return respondError('cwv must be an object', 400, undefined, req);
    }

    // Remove any properties that aren't allowed metrics
    Object.keys(cwv).forEach((key) => {
      if (!['LCP', 'INP', 'CLS', 'TTFB'].includes(key)) {
        delete cwv[key];
      }
    });

    try {
      if (ctx?.runtime?.name === 'compute-at-edge') {
        const c = new CoralogixLogger(req);
        c.logRUM(cwv, id, weight, referer || referrer, generation, checkpoint, target, source, t);

        const s = new S3Logger(req);
        s.logRUM(cwv, id, weight, referer || referrer, generation, checkpoint, target, source, t);

        const g = new GoogleLogger(req);
        g.logRUM(cwv, id, weight, referer || referrer, generation, checkpoint, target, source, t);
      } else {
        const l = new ConsoleLogger(req, ctx?.altConsole);
        l.logRUM(cwv, id, weight, referer || referrer, generation, checkpoint, target, source, t);
      }
    } catch (err) {
      return respondError(`Could not collect RUM: ${err.message}`, 500, err, req);
    }

    const response = new Response('rum collected.', {
      status: 201,
      headers,
    });

    return response;
  } catch (e) {
    return respondError(`RUM Collector expects POST body as JSON, got ${req.method}`, 400, e, req);
  }
}

export async function handler(event) {
  // Get the client reqest from the event
  return main(event.request, event.ctx);
}

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', (event) => {
  event.respondWith(handler(event));
});

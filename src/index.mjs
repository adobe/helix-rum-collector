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

import { GoogleLogger } from './google-logger.mjs';
import { CoralogixLogger } from './coralogix-logger.mjs';
import { CoralogixErrorLogger } from './coralogix-error-logger.mjs';
import { respondRobots } from './robots.mjs';
import { respondUnpkg } from './unpkg.mjs';

function respondError(message, status, e, req) {
  const headers = new Headers();
  const msg = e && e.message ? `${message}: ${e.message}` : message;

  headers.set('Content-Type', 'text/plain; charset=utf-8');
  headers.set('X-Error', msg);

  const response = new Response(`${msg}\n`, {
    status,
    headers,
  });
  console.error(msg);
  try {
    const c = new CoralogixErrorLogger(req);
    c.logError(status, message);
  } catch (err) {
    console.error(`error logging error: ${err.message}`);
  }
  return response;
}

function hashCode(s) {
  // eslint-disable-next-line no-bitwise
  s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);
}

async function main(req) {
  try {
    if (req.method === 'GET' && new URL(req.url).pathname.startsWith('/robots.txt')) {
      return respondRobots(req);
    }
    if (req.method === 'GET' && new URL(req.url).pathname.startsWith('/.rum/web-vitals')) {
      return respondUnpkg(req);
    }
    if (req.method === 'GET' && new URL(req.url).pathname.startsWith('/.rum/@adobe/helix-rum')) {
      return respondUnpkg(req);
    }
    const body = req.method === 'GET'
      ? JSON.parse(new URL(req.url).searchParams.get('data'))
      : await req.json();

    const headers = new Headers();
    headers.set('Content-Type', 'text/plain; charset=utf-8');

    const {
      weight = 1,
      id = req.method === 'GET' ? `${hashCode(req.url)}-${new Date().getTime()}-${Math.random().toString(16).substr(2, 14)}` : undefined,
      cwv = {},
      referer, referrer,
      generation, checkpoint,
      target,
      source,
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

    try {
      const c = new CoralogixLogger(req);
      c.logRUM(cwv, id, weight, referer || referrer, generation, checkpoint, target, source);

      const g = new GoogleLogger(req);
      g.logRUM(cwv, id, weight, referer || referrer, generation, checkpoint, target, source);
    } catch (err) {
      return respondError(`Could not collect RUM: ${err.message}`, 500, err, req);
    }

    const response = new Response('rum collected.', {
      status: 201,
      headers,
    });

    return response;
  } catch (e) {
    return respondError('RUM Collector expects POST body as JSON', 400, e, req);
  }
}

async function handler(event) {
  // Get the client reqest from the event
  const req = event.request;
  return main(req);
}

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', (event) => {
  event.respondWith(handler(event));
});

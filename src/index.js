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

import { GoogleLogger } from './google-logger';
import { CoralogixLogger } from './coralogix-logger';

function respondError(message, status, e) {
  const headers = new Headers();
  const msg = e && e.message ? `${message}: ${e.message}` : message;

  headers.set('Content-Type', 'text/plain; charset=utf-8');
  headers.set('X-Error', msg);

  const response = new Response(`${msg}\n`, {
    status,
    headers,
  });
  console.error(msg);
  return response;
}

async function main(req) {
  try {
    const body = await req.json();

    const headers = new Headers();
    headers.set('Content-Type', 'text/plain; charset=utf-8');

    const {
      weight = 1, id, cwv = {}, referer, generation,
    } = body;

    if (!id) {
      return respondError('id field is required', 400);
    }
    if (!weight && typeof weight !== 'number') {
      return respondError('weight must be a number', 400);
    }
    if (typeof cwv !== 'object') {
      return respondError('cwv must be an object', 400);
    }

    const c = new CoralogixLogger(req);
    c.logRUM(cwv, id, weight, referer, generation);

    const g = new GoogleLogger(req);
    g.logRUM(cwv, id, weight, referer, generation);

    const response = new Response('rum collected.', {
      status: 201,
      headers,
    });

    return response;
  } catch (e) {
    return respondError('RUM Collector expects POST body as JSON', 400, e);
  }
}

addEventListener('fetch', async (event) => {
  // NOTE: By default, console messages are sent to stdout (and stderr for `console.error`).
  // To send them to a logging endpoint instead, use `console.setEndpoint:
  // console.setEndpoint("my-logging-endpoint");

  // Get the client reqest from the event
  const req = event.request;

  event.respondWith(await main(req, {}));
});

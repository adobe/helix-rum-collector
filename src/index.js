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

const GoogleLogger = require('./google-logger');
const CoralogixLogger = require('./coralogix-logger');

async function main(req) {
  console.log('request received (JS)');

  try {
    const body = await req.json();

    const headers = new Headers();
    headers.set('Content-Type', 'text/plain; charset=utf-8');

    const { weight = 1, id, cwv = {} } = body;

    const c = new CoralogixLogger(req);
    c.logRUM(cwv, id, weight);

    const g = new GoogleLogger(req);
    g.logRUM(cwv, id, weight);

    const response = new Response('rum collected.', {
      status: 201,
      headers,
    });

    return response;
  } catch (e) {
    const headers = new Headers();

    console.error(e);

    const message = `RUM collection expects a JSON POST or PUT body: ${e.message}`;

    headers.set('Content-Type', 'text/plain; charset=utf-8');
    headers.set('X-Error', message);

    const response = new Response(`${message}\n`, {
      status: 400,
      headers,
    });
    console.error('RUM collection expects a JSON POST or PUT body.');

    return response;
  }
}

addEventListener('fetch', async (event) => {
  // NOTE: By default, console messages are sent to stdout (and stderr for `console.error`).
  // To send them to a logging endpoint instead, use `console.setEndpoint:
  // console.setEndpoint("my-logging-endpoint");

  // Get the client reqest from the event
  const req = event.request;

  event.respondWith(await main(req, {}));

  /*

  // Make any desired changes to the client request.
  req.headers.set('Host', 'example.com');

  // We can filter requests that have unexpected methods.
  const VALID_METHODS = ['GET'];
  if (!VALID_METHODS.includes(req.method)) {
    const response = new Response('This method is not allowed', {
      status: 405,
    });
    // Send the response back to the client.
    event.respondWith(response);
    return;
  }

  const { method } = req;
  const urlParts = req.url.split('//').pop().split('/');
  const path = `/${urlParts.join('/')}`;

  // If request is a `GET` to the `/` path, send a default response.
  if (method === 'GET' && path === '/') {
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    const response = new Response('Hallo Stefan\n', {
      status: 200,
      headers,
    });
    // Send the response back to the client.
    event.respondWith(response);
    return;
  }

  // Catch all other requests and return a 404.
  const response = new Response('The page you requested could not be found', {
    status: 404,
  });
  // Send the response back to the client.
  event.respondWith(response); */
});

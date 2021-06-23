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
addEventListener('fetch', async (event) => {
  // NOTE: By default, console messages are sent to stdout (and stderr for `console.error`).
  // To send them to a logging endpoint instead, use `console.setEndpoint:
  // console.setEndpoint("my-logging-endpoint");

  // Get the client reqest from the event
  const req = event.request;

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
  const host = urlParts.shift();
  const path = `/${urlParts.join('/')}`;

  // If request is a `GET` to the `/` path, send a default response.
  if (method == 'GET' && path == '/') {
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
  event.respondWith(response);
});

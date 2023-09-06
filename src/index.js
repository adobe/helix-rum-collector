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

import { GoogleLogger } from './google-logger.js';
import { CoralogixLogger } from './coralogix-logger.js';
import { CoralogixErrorLogger } from './coralogix-error-logger.js';
import { handleRequest } from './request-handler.js';

async function main(req) {
  handleRequest(req, new CoralogixLogger(req), CoralogixErrorLogger(req), GoogleLogger(req));
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

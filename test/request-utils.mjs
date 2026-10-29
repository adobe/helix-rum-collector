/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * Creates a real POST request with a streamed body.
 * @param {string} url the request URL
 * @param {Map<string,string>} headers the request headers
 * @param {string|object} body the body, objects get serialized as JSON
 * @returns {Request} the request
 */
export function postRequest(url, headers = new Map(), body = undefined) {
  return new Request(url, {
    method: 'POST',
    headers: [...headers],
    body: typeof body === 'string' || body instanceof ReadableStream ? body : JSON.stringify(body),
    duplex: 'half',
  });
}

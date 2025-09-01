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
/* eslint-env mocha */
import assert from 'assert';
import { it, describe } from 'node:test';

import { respondDNTStatus, respondDNTPolicy } from '../src/dnt.mjs';

describe('Test DNT resources', () => {
  it('responds with correct DNT status', async () => {
    const req = {
      url: 'https://example.com/.well-known/dnt/',
    };

    const resp = await respondDNTStatus(req);
    assert.equal(200, resp.status);
    assert.equal('application/tracking-status+json', resp.headers.get('Content-Type'));

    // Verify the response is valid JSON
    const data = await resp.json();
    assert.equal('N', data.tracking); // Verify tracking status is 'Not tracking'
    assert(data.compliance && data.compliance.includes('https://www.w3.org/TR/tracking-dnt/'));
  });

  it('responds with correct DNT policy', async () => {
    const req = {
      url: 'https://example.com/.well-known/dnt-policy.txt',
    };

    const resp = await respondDNTPolicy(req);
    assert.equal(200, resp.status);
    assert.equal('text/plain', resp.headers.get('Content-Type'));

    // Verify the response is a string containing the policy text
    const text = await resp.text();
    assert(text.includes('Do Not Track Compliance Policy'));
  });
});

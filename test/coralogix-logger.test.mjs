/*
 * Copyright 2023 Adobe. All rights reserved.
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
import { lastLogMessage } from '../src/logger.mjs';
import { CoralogixLogger } from '../src/coralogix-logger.mjs';

describe('Test Coralogix Logger', () => {
  it('Test log RUM', () => {
    const headers = new Map();
    headers.set('x-forwarded-host', 'www.foo.com');
    headers.set('user-agent', 'Mozilla/5.0 (compatible; HubSpot Crawler; +https://www.hubspot.com)');
    const method = 'GET';
    const url = new URL('http://www.foo.com/testing123');

    const req = { headers, method, url };

    const cl = new CoralogixLogger(req);

    const myJSON = { foo: 'bar', zoo: 777 };
    cl.logRUM(
      myJSON,
      '123',
      3,
      undefined,
      42,
      12345,
      'http://www.foo.com/testing123',
      'http://www.foo.com/somesource',
      999,
    );

    const logged = JSON.parse(lastLogMessage);
    assert(logged.timestamp.toString().endsWith('00999'));
    assert.equal('helix-rum-collector', logged.applicationName);
    assert.equal('www.foo.com', logged.subsystemName);
    assert.equal(3, logged.severity);
    assert.equal('http://www.foo.com/testing123', logged.json.edgecompute.url);
    assert.equal('http://www.foo.com/testing123', logged.json.cdn.url);
    assert.equal(logged.timestamp, logged.json.time.start_msec);
    assert(logged.json.time.elapsed < 100);
    assert.equal('123', logged.json.request.id);
    assert.equal('GET', logged.json.request.method);
    assert.equal('bot', logged.json.request.user_agent);
    assert.equal(42, logged.json.rum.generation);
    assert.equal(12345, logged.json.rum.checkpoint);
    assert.equal('http://www.foo.com/testing123', logged.json.rum.target);
    assert.equal('http://www.foo.com/somesource', logged.json.rum.source);
    assert.equal(3, logged.json.rum.weight);
    assert.equal('bar', logged.json.rum.foo);
    assert.equal(777, logged.json.rum.zoo);
  });

  it('Test log RUM clean URLs', () => {
    const headers = new Map();
    const url = new URL('http://www.foo.com/testing123#with-a-fragment');

    const req = { headers, url };
    const cl = new CoralogixLogger(req);
    cl.logRUM(
      {},
      'x-123',
      4,
      'http://www.foo.com/testing123#with-a-fragment',
      8,
      'error',
      'http://www.foo.com/sometarget?foo=bar#somehash',
      'http://www.foo.com/somesource#my-fragment',
    );

    const logged = JSON.parse(lastLogMessage);
    assert.equal('http://www.foo.com/testing123', logged.json.edgecompute.url);
    assert.equal('http://www.foo.com/testing123', logged.json.cdn.url);
    assert.equal(5, logged.severity);
    assert.equal('http://www.foo.com/sometarget', logged.json.rum.target);
    assert.equal('http://www.foo.com/somesource', logged.json.rum.source);
  });
});

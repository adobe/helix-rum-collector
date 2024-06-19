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
import { it, describe } from 'node:test';
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

    const now = Date.now();
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
      now,
    );

    const logged = JSON.parse(lastLogMessage);
    assert.equal(logged.timestamp, now);
    assert.equal('helix-rum-collector', logged.applicationName);
    assert.equal('www.foo.com', logged.subsystemName);
    assert.equal(3, logged.severity);

    assert.ok(!logged.json, 'JSON should be empty');
    assert.ok(logged.text);
    const loggedJSON = JSON.parse(logged.text);

    assert.equal('http://www.foo.com/testing123', loggedJSON.edgecompute.url);
    assert.equal('http://www.foo.com/testing123', loggedJSON.cdn.url);
    assert(loggedJSON.time.start_msec.toString().endsWith('00999'));
    assert.equal(
      Math.floor(logged.timestamp / 100000000),
      Math.floor(loggedJSON.time.start_msec / 100000000),
    );
    assert(loggedJSON.time.elapsed < 100);
    assert.equal('123', loggedJSON.request.id);
    assert.equal('GET', loggedJSON.request.method);
    assert.equal('Mozilla/5.0 (compatible; HubSpot Crawler; +https://www.hubspot.com)', loggedJSON.request.user_agent);
    assert.equal('bot', loggedJSON.rum.user_agent);
    assert.equal(42, loggedJSON.rum.generation);
    assert.equal(12345, loggedJSON.rum.checkpoint);
    assert.equal('http://www.foo.com/testing123', loggedJSON.rum.target);
    assert.equal('http://www.foo.com/somesource', loggedJSON.rum.source);
    assert.equal(3, loggedJSON.rum.weight);
    assert.equal('bar', loggedJSON.rum.foo);
    assert.equal(777, loggedJSON.rum.zoo);
  });
});

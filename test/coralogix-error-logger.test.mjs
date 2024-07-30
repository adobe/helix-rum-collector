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
import { CoralogixErrorLogger } from '../src/coralogix-error-logger.mjs';

describe('Test Coralogix Error Logger', () => {
  it('Log a message', () => {
    const method = 'POST';
    const headers = new Map();
    headers.set('x-forwarded-host', 'www.foo.com');
    headers.set('user-agent', 'lynx');
    const url = new URL('http://www.foo.com/blah');
    const req = { method, headers, url };
    const cel = new CoralogixErrorLogger(req);

    cel.logError(456, 'You cant do that', 123);

    const logged = JSON.parse(lastLogMessage);
    assert.equal('helix-rum-collector', logged.applicationName);
    assert.equal('www.foo.com', logged.subsystemName);
    assert.equal(4, logged.severity);

    assert.ok(!logged.json, 'JSON should be empty');
    assert.ok(logged.text);
    const loggedJSON = JSON.parse(logged.text);

    assert.equal('You cant do that', loggedJSON.message);
    assert.equal('http://www.foo.com/blah', loggedJSON.edgecompute.url);
    assert.equal('http://www.foo.com/blah', loggedJSON.cdn.url);
    assert.equal('POST', loggedJSON.request.method);
    assert.equal('desktop', loggedJSON.request.user_agent);
  });
});

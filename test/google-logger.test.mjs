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
import { GoogleLogger } from '../src/google-logger.mjs';

describe('Test Google Logger', () => {
  it('Test log RUM', () => {
    const headers = new Map();
    headers.set('x-forwarded-host', 'www.foo.com');
    headers.set('user-agent', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36');
    const url = new URL('http://www.foo.com/testing123');

    const req = { headers, url };

    const gl = new GoogleLogger(req);

    const myJSON = { foo: ['b', 'ar'] };
    gl.logRUM(
      myJSON,
      'someid',
      5,
      'http://www.foo.com/referer',
      67,
      9999999999999,
      'http://www.foo.com/target',
      'http://www.foo.com/source',
      11,
    );

    const logged = JSON.parse(lastLogMessage);
    assert(logged.time.toString().endsWith('00.011'), logged.time.toString());
    assert.equal('www.foo.com', logged.host);
    assert.equal('http://www.foo.com/referer', logged.url);
    assert.equal('mobile', logged.user_agent);
    assert.equal(5, logged.weight);
    assert.equal(67, logged.generation);
    assert.equal(9999999999999, logged.checkpoint);
    assert.equal('http://www.foo.com/target', logged.target);
    assert.equal('http://www.foo.com/source', logged.source);
    assert.equal('someid', logged.id);
    assert.deepEqual(['b', 'ar'], logged.foo);
    assert.equal('www.foo.com', logged.hostname);
  });
});

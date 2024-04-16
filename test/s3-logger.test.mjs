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
import { S3Logger } from '../src/s3-logger.mjs';
import { lastLogMessage } from '../src/logger.mjs';

describe('Test S3 Logger', () => {
  it('log to RUM', () => {
    const headers = new Map();
    headers.set('x-forwarded-host', 'www.foo.com');
    headers.set('host', 'www.acme.com');
    headers.set('user-agent', 'Opera/12.0(Windows NT 5.2;U;en)Presto/22.9.168 Version/12.00');
    const url = new URL('http://www.foo.com/testing123');

    const req = { headers, url };

    const cl = new S3Logger(req);

    const myJSON = { foo: ['b', 'ar'] };
    cl.logRUM(
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
    assert(logged.time.toString().endsWith('0011'));
    assert.equal(logged.host, 'www.foo.com');
    assert.equal(logged.url.toString(), 'http://www.foo.com/referer');
    assert.equal(logged.weight, 5);
    assert.equal(logged.generation, 67);
    assert.equal(logged.checkpoint, 9999999999999);
    assert.equal(logged.target.toString(), 'http://www.foo.com/target');
    assert.equal(logged.source.toString(), 'http://www.foo.com/source');
    assert.equal(logged.id, 'someid');
    assert.equal(logged.user_agent, 'desktop:windows');
    assert.deepEqual(logged.foo, ['b', 'ar']);
  });
});

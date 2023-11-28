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
import { ConsoleLogger } from "../src/console-logger.mjs";

describe('Test Console Logger', () => {
  it('log to RUM', () => {
    const headers = new Map();
    headers.set('x-forwarded-host', 'www.foo.com');
    const url = new URL('http://www.foo.com/testing123');

    const req = { headers, url };

    const logged = [];
    const testLogger = {
      log: (...args) => logged.push(args),
    };
    const gl = new ConsoleLogger(req, testLogger);

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

    assert.equal(logged.length, 1);
    const ld = JSON.parse(logged[0]);
    assert(ld.time.toString().endsWith('0011'));
    assert.equal(ld.host, 'www.foo.com');
    assert.equal(ld.url.toString(), 'http://www.foo.com/referer');
    assert.equal(ld.weight, 5);
    assert.equal(ld.generation, 67);
    assert.equal(ld.checkpoint, 9999999999999);
    assert.equal(ld.target.toString(), 'http://www.foo.com/target');
    assert.equal(ld.source.toString(), 'http://www.foo.com/source');
    assert.equal(ld.id, 'someid');
    assert.deepEqual(ld.foo, ['b', 'ar']);
  });
});

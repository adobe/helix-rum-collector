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
      10,
      'http://www.foo.com/referer',
      67,
      'error',
      'http://www.foo.com/target',
      'http://www.foo.com/source',
      11,
    );

    const logged = JSON.parse(lastLogMessage);
    assert(logged.time.toString().endsWith('0011'));
    assert.equal(logged.host, 'www.foo.com');
    assert.equal(logged.url.toString(), 'http://www.foo.com/referer');
    assert.equal(logged.weight, 10);
    assert.equal(logged.generation, 67);
    assert.equal(logged.checkpoint, 'error');
    assert.equal(logged.target.toString(), 'http://www.foo.com/target');
    assert.equal(logged.source.toString(), 'http://www.foo.com/source');
    assert.equal(logged.id, 'someid');
    assert.equal(logged.user_agent, 'desktop:windows:presto');
    assert.deepEqual(logged.foo, ['b', 'ar']);
  });

  it('Skip invalid checkpoints', () => {
    const headers = new Map();
    const url = 'https://log/this';

    const req = { headers, url };
    const gl = new S3Logger(req);
    gl.logRUM({}, 'q123', 10, undefined, undefined, 'error');
    gl.logRUM({}, 'q987', 10, undefined, undefined, 'dontlogthischeckpoint');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('q123', logged.id);
  });

  it('Skip invalid ids', () => {
    const headers = new Map();
    const url = 'https://log/this';

    const req = { headers, url };
    const gl = new S3Logger(req);
    gl.logRUM({}, 'q123', 10, undefined, undefined, 'error');
    gl.logRUM({}, '(sleep 30)', 10, undefined, undefined, 'error');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('q123', logged.id);
  });

  it('Skips invalid audience checkpoints', () => {
    const headers = new Map();
    const url = 'https://log/this';

    const req = { headers, url };
    const gl = new S3Logger(req);
    gl.logRUM({}, 'q1337', 1, undefined, undefined, 'audience', 'foo:bar', 'foo');
    gl.logRUM({}, 'q1338', 1, undefined, undefined, 'audience', 'bar', 'foo');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('q1337', logged.id);
  });

  it('Skips invalid experiment checkpoints', () => {
    const headers = new Map();
    const url = 'https://log/this';

    const req = { headers, url };
    const gl = new S3Logger(req);
    gl.logRUM({}, 'q1339', 1, undefined, undefined, 'experiment', 'bar', 'foo');
    gl.logRUM({}, 'q1340', 1, undefined, undefined, 'experiment', '', 'foo');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('q1339', logged.id);
  });

  it('Strips query parameters from all URL properties', () => {
    const headers = new Map();
    headers.set('x-forwarded-host', 'www.foo.com');
    headers.set('referer', 'https://www.foo.com/referer?ref=123&tracking=456');
    const url = new URL('https://www.foo.com/page?utm_source=test&utm_campaign=test');

    const req = { headers, url };
    const gl = new S3Logger(req);
    gl.logRUM(
      {},
      'test123',
      1,
      'https://www.foo.com/referer?ref=123&tracking=456',
      42,
      'error',
      'https://www.foo.com/target?dest=789&id=abc',
      'https://www.foo.com/source?src=xyz&from=home',
    );

    const logged = JSON.parse(lastLogMessage);
    assert.equal(logged.url, 'https://www.foo.com/referer');
    assert.equal(logged.referer, 'https://www.foo.com/referer');
    assert.equal(logged.target, 'https://www.foo.com/target');
    assert.equal(logged.source, 'https://www.foo.com/source');
  });
});

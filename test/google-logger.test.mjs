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
import { GoogleLogger } from '../src/google-logger.mjs';

describe('Test Google Logger', () => {
  it('log to RUM', () => {
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
      'error',
      'http://www.foo.com/target',
      'http://www.foo.com/source',
      11,
    );

    const logged = JSON.parse(lastLogMessage);
    assert(logged.time.toString().endsWith('00.011'), logged.time.toString());
    assert.equal('www.foo.com', logged.host);
    assert.equal('http://www.foo.com/referer', logged.url);
    assert.equal('mobile:android', logged.user_agent);
    assert.equal(5, logged.weight);
    assert.equal(67, logged.generation);
    assert.equal('error', logged.checkpoint);
    assert.equal('http://www.foo.com/target', logged.target);
    assert.equal('http://www.foo.com/source', logged.source);
    assert.equal('someid', logged.id);
    assert.deepEqual(['b', 'ar'], logged.foo);
    assert.equal('www.foo.com', logged.hostname);
  });

  it('hostname handling', () => {
    const headers = new Map();
    headers.set('host', 'a_host');
    headers.set('referer', 'http://somehost.com/somepage.html');
    headers.set('user-agent', 'Joppie');

    const req = { headers };

    const gl = new GoogleLogger(req);
    gl.logRUM(
      {},
      '1234',
      3,
      'not_a_url',
      49,
      'error',
      'sometarget',
      'somesource',
      undefined,
    );

    const logged = JSON.parse(lastLogMessage);
    assert.equal('a_host', logged.host);
    assert.equal('not_a_url', logged.url);
    assert.equal('desktop', logged.user_agent);
    assert.equal('http://somehost.com/somepage.html', logged.referer);
    assert.equal(3, logged.weight);
    assert.equal(49, logged.generation);
    assert.equal('error', logged.checkpoint);
    assert.equal('sometarget', logged.target);
    assert.equal('somesource', logged.source);
    assert.equal('1234', logged.id);
    assert.equal('somehost.com', logged.hostname);
  });

  it('hostname handling 2', () => {
    const headers = new Map();
    const url = 'https://www.blahblah.com/hihaho';

    const req = { headers, url };

    const gl = new GoogleLogger(req);
    gl.logRUM({}, 'x', 1, '?', undefined, 'error');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('?', logged.url);
    assert.equal('www.blahblah.com', logged.hostname);
    assert.equal('x', logged.id);
    assert.equal(1, logged.weight);
  });

  it('Clean the fragment from the reported URL', () => {
    const headers = new Map();
    const url = 'https://www.blahblah.com/hihaho#with-a-fragment';

    const req = { headers, url };
    const gl = new GoogleLogger(req);
    gl.logRUM({}, 'q123', 5, undefined, undefined, 'error');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('https://www.blahblah.com/hihaho', logged.url);
  });

  it('Skip invalid checkpoints', () => {
    const headers = new Map();
    const url = 'https://log/this';

    const req = { headers, url };
    const gl = new GoogleLogger(req);
    gl.logRUM({}, 'q123', 5, undefined, undefined, 'error');
    gl.logRUM({}, 'q987', 5, undefined, undefined, 'dontlogthischeckpoint');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('q123', logged.id);
  });
});

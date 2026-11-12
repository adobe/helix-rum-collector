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
      10,
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
    assert.equal('mobile:android:blink', logged.user_agent);
    assert.equal(10, logged.weight);
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
    // no page URL supplied: fall back to the Referer header
    gl.logRUM(
      {},
      '1234',
      10,
      undefined,
      49,
      'error',
      'sometarget',
      'somesource',
      undefined,
    );

    const logged = JSON.parse(lastLogMessage);
    assert.equal('a_host', logged.host);
    assert.equal('http://somehost.com/somepage.html', logged.url);
    assert.equal('undefined', logged.user_agent);
    assert.equal('http://somehost.com/somepage.html', logged.referer);
    assert.equal(10, logged.weight);
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
    // no page URL and no Referer header: fall back to the request URL
    gl.logRUM({}, 'x', 1, undefined, undefined, 'error');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('https://www.blahblah.com/hihaho', logged.url);
    assert.equal('www.blahblah.com', logged.hostname);
    assert.equal('x', logged.id);
    assert.equal(1, logged.weight);
  });

  it('Skip invalid page URLs instead of attributing them to the Referer', () => {
    const headers = new Map();
    headers.set('x-forwarded-host', 'main--site--org.aem.live');
    headers.set('referer', 'https://www.example.com/');

    const req = { headers, url: 'https://rum.hlx.page/.rum/1' };
    const gl = new GoogleLogger(req);
    gl.logRUM({}, 'valid', 100, 'https://www.example.com/page', undefined, 'top');

    [
      '-1 OR 2+547-547-1=0+0+0+1',
      'if(now()=sysdate(),sleep(15),0)',
      '@@ph9Pz',
      'not_a_url',
      '?',
      '/relative/path',
      ' ',
      'vbscript:msgbox(1)',
      'data:text/html,hello',
      'file:///etc/passwd',
      'http://',
    ].forEach((invalid) => {
      gl.logRUM({}, 'invalid', 100, invalid, undefined, 'top');
    });

    const logged = JSON.parse(lastLogMessage);
    assert.equal('valid', logged.id);
    assert.equal('https://www.example.com/page', logged.url);
    assert.equal('www.example.com', logged.hostname);
  });

  it('Skip invalid Referer headers when no page URL is supplied', () => {
    const headers = new Map();
    headers.set('referer', 'not a url');

    const req = { headers, url: 'https://rum.hlx.page/.rum/1' };
    const gl = new GoogleLogger(req);
    gl.logRUM({}, 'sentinel', 100, 'https://www.example.com/', undefined, 'top');
    gl.logRUM({}, 'invalid', 100, undefined, undefined, 'top');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('sentinel', logged.id);
  });

  it('Keep page hostnames that differ from the collection host', () => {
    const headers = new Map();
    headers.set('x-forwarded-host', 'main--site--org.aem.live');
    headers.set('referer', 'https://main--site--org.aem.live/');

    const req = { headers, url: 'https://rum.hlx.page/.rum/1' };
    const gl = new GoogleLogger(req);
    gl.logRUM({}, 'abc', 100, 'https://www.customer.com/products', undefined, 'top');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('main--site--org.aem.live', logged.host);
    assert.equal('https://www.customer.com/products', logged.url);
    assert.equal('www.customer.com', logged.hostname);
  });

  it('Keep browser extension pages, attributed to the extension ID', () => {
    const headers = new Map();
    headers.set('host', 'rum.hlx.page');

    const req = { headers, url: 'https://rum.hlx.page/.rum/1' };
    const gl = new GoogleLogger(req);
    gl.logRUM({}, 'ext', 100, 'chrome-extension://peihfocninegcbeiinjopkkopoibmggg/popup.html', undefined, 'error', 'metrics-load-error', 'llmo-extension');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('ext', logged.id);
    assert.equal('chrome-extension://peihfocninegcbeiinjopkkopoibmggg/popup.html', logged.url);
    assert.equal('peihfocninegcbeiinjopkkopoibmggg', logged.hostname);
  });

  it('Clean the fragment from the reported URL', () => {
    const headers = new Map();
    const url = 'https://www.blahblah.com/hihaho#with-a-fragment';

    const req = { headers, url };
    const gl = new GoogleLogger(req);
    gl.logRUM({}, 'q123', 10, undefined, undefined, 'error');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('https://www.blahblah.com/hihaho', logged.url);
  });

  it('Skip invalid checkpoints', () => {
    const headers = new Map();
    const url = 'https://log/this';

    const req = { headers, url };
    const gl = new GoogleLogger(req);
    gl.logRUM({}, 'q123', 10, undefined, undefined, 'error');
    gl.logRUM({}, 'q987', 10, undefined, undefined, 'dontlogthischeckpoint');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('q123', logged.id);
  });

  it('Skip invalid ids', () => {
    const headers = new Map();
    const url = 'https://log/this';

    const req = { headers, url };
    const gl = new GoogleLogger(req);
    gl.logRUM({}, 'q123', 10, undefined, undefined, 'error');
    gl.logRUM({}, '(sleep 30)', 10, undefined, undefined, 'error');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('q123', logged.id);
  });

  it('Skips invalid audience checkpoints', () => {
    const headers = new Map();
    const url = 'https://log/this';

    const req = { headers, url };
    const gl = new GoogleLogger(req);
    gl.logRUM({}, 'q1337', 1, undefined, undefined, 'audience', 'foo:bar', 'foo');
    gl.logRUM({}, 'q1338', 1, undefined, undefined, 'audience', 'bar', 'foo');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('q1337', logged.id);
  });

  it('Skips invalid experiment checkpoints', () => {
    const headers = new Map();
    const url = 'https://log/this';

    const req = { headers, url };
    const gl = new GoogleLogger(req);
    gl.logRUM({}, 'q1339', 1, undefined, undefined, 'experiment', 'bar', 'foo');
    gl.logRUM({}, 'q1340', 1, undefined, undefined, 'experiment', '', 'foo');

    const logged = JSON.parse(lastLogMessage);
    assert.equal('q1339', logged.id);
  });
});

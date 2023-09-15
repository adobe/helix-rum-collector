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

const methods = {};

// Mock this function which will be called by index.mjs
global.addEventListener = function addEventListener() {
};

describe('Test index', () => {
  before(async () => {
    const mod = await import('../src/index.mjs');
    Object.keys(mod).forEach((f) => {
      methods[f] = mod[f];
    });
  });

  it('main GET', async () => {
    const headers = new Map();
    headers.set('host', 'somehost');
    headers.set('user-agent', 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36');

    const req = { headers };
    req.method = 'GET';
    req.url = 'http://foo.bar.org?data={"referer":"http://blahblah", "checkpoint": 1234567}';

    const resp = await methods.main(req);
    assert.equal(201, resp.status);
    assert.equal('text/plain; charset=utf-8', resp.headers.get('Content-Type'));

    const logged = JSON.parse(lastLogMessage);
    assert.equal(1234567, logged.checkpoint);
    assert.equal('http://blahblah/', logged.url);
    assert.equal('desktop', logged.user_agent);
    assert.equal(1, logged.weight);
    assert.equal('somehost', logged.host);
    assert.equal('blahblah', logged.hostname);
  });

  it('main GET generates ID', async () => {
    const headers = new Map();
    const req = { headers };
    req.method = 'GET';
    req.url = 'http://foo.bar.org?data={}';

    const resp = await methods.main(req);
    assert.equal(201, resp.status);

    const logged = JSON.parse(lastLogMessage);
    const id1 = logged.id;
    assert(id1.length > 0);

    // Make another identical request
    const resp2 = await methods.main(req);
    assert.equal(201, resp2.status);

    const logged2 = JSON.parse(lastLogMessage);
    assert(logged2.id.length > 0);

    assert(id1 !== logged2.id, 'The generated IDs should be different for 2 identical GET requests');
  });

  it('main POST via handler', async () => {
    const headers = new Map();
    headers.set('user-agent', 'Opera/9.80 (MAUI Runtime; Opera Mini/4.4.39030/191.315; U; en) Presto/2.12.423 Version/12.16');
    headers.set('x-forwarded-host', 'www.foobar.com');

    const json = () => JSON.parse(`{
      "weight": 5,
      "id": "foobar",
      "cwv": {
        "a": "aaa",
        "b": 123
      },
      "referrer": "http://a.b.c",
      "generation": 42,
      "checkpoint": 1,
      "target": "https://t",
      "source": "1.2.3.4",
      "t": "3"
    }`);

    const req = { headers, json };
    req.method = 'POST';
    req.url = 'http://foo.bar.org';

    const event = { request: req };

    const resp = await methods.handler(event);

    assert.equal(201, resp.status);
    assert.equal('text/plain; charset=utf-8', resp.headers.get('Content-Type'));

    const logged = JSON.parse(lastLogMessage);
    assert.equal('foobar', logged.id);
    assert(logged.time.toString().endsWith('.003'));
    assert.equal('http://a.b.c/', logged.url);
    assert.equal(5, logged.weight);
    assert.equal(42, logged.generation);
    assert.equal('https://t/', logged.target);
    assert.equal('1.2.3.4', logged.source);
    assert.equal('aaa', logged.a);
    assert.equal(123, logged.b);
    assert.equal('www.foobar.com', logged.host);
    assert.equal('mobile', logged.user_agent);
  });

  it('error handling', async () => {
    const headers = new Map();
    headers.set('host', 'some.host');
    headers.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0');

    const json = () => JSON.parse('{"malformed"}');

    const req = { headers, json };
    req.method = 'POST';
    req.url = 'http://foo.bar.org';

    const resp = await methods.main(req);

    assert.equal(400, resp.status);
    assert(resp.headers.get('X-Error').startsWith('RUM Collector expects'));
    assert.equal('text/plain; charset=utf-8', resp.headers.get('Content-Type'));

    const logged = JSON.parse(lastLogMessage);
    assert.equal(4, logged.severity);
    assert.equal('some.host', logged.subsystemName);
    assert.equal('http://foo.bar.org', logged.json.edgecompute.url);
    assert.equal('http://foo.bar.org', logged.json.cdn.url);
    assert.equal('POST', logged.json.request.method);
    assert.equal('desktop', logged.json.request.user_agent);
    assert(logged.timestamp.toString().endsWith('000'));
    assert.equal(logged.timestamp, logged.json.time.start_msec);
    assert(logged.json.message.startsWith('RUM Collector expects'));
  });

  it('responds to robots.txt', async () => {
    const headers = new Map();

    const req = { headers };
    req.method = 'GET';
    req.url = 'http://x.y/robots.txt';

    const resp = await methods.main(req);
    assert.equal(200, resp.status);
    assert.equal('text/plain', resp.headers.get('content-type'));
    const t = await resp.text();
    assert(t.includes('User-agent: *'));
    assert(t.includes('Disallow: /'));
  });

  async function verifyInput(data, errPrefix) {
    const headers = new Map();

    const req = { headers };
    req.method = 'GET';
    req.url = `http://foo.bar.org?data=${data}`;

    const resp = await methods.main(req);
    assert.equal(400, resp.status);
    assert(
      resp.headers.get('X-Error').startsWith(errPrefix),
      `${resp.headers.get('X-Error')} should start with ${errPrefix}`,
    );
  }

  it('responds to web-vitals', async () => {
    const headers = new Map();

    const req = { headers };
    req.method = 'GET';
    req.url = 'http://x.y/.rum/web-vitals';

    const resp = await methods.main(req);

    assert.equal(200, resp.status);
    assert(resp.ok);

    const t = await resp.text();
    assert(t.includes('webVitals'));
  });

  it('responds to helix-rum-js', async () => {
    const headers = new Map();

    const req = { headers };
    req.method = 'GET';
    req.url = 'http://x.y/.rum/@adobe/helix-rum-js';

    const resp = await methods.main(req);

    assert.equal(200, resp.status);
    assert(resp.ok);
    assert(resp.headers.has('etag'));
    assert(!resp.headers.has('server'));
    assert(!resp.headers.has('cf-cache-status'));
    assert(!resp.headers.has('cr-ray'));

    const t = await resp.text();
    assert(t.includes('export function sampleRUM'));
  });

  it('verifies inputs', async () => {
    await verifyInput('{"id": null}', 'id field is required');
    await verifyInput('{"weight": "hello"}', 'weight must be a number');
    await verifyInput('{"cwv": 123}', 'cwv must be an object');
  });
});

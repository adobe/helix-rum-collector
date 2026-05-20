/*
 * Copyright 2026 Adobe. All rights reserved.
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
import { before, describe, it } from 'node:test';
import { lastLogMessage } from '../src/logger.mjs';

const methods = {};

global.addEventListener = function addEventListener() {};

describe('Test index - ua body field', () => {
  before(async () => {
    const mod = await import('../src/index.mjs');
    Object.keys(mod).forEach((f) => {
      methods[f] = mod[f];
    });
  });

  it('beacon with ua field uses overridden user agent for bot classification', async () => {
    const headers = new Map();
    headers.set('host', 'www.example.com');
    headers.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

    const json = () => ({
      weight: 1,
      id: 'webdriver-test',
      checkpoint: 'top',
      ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 +http://navigator.webdriver',
    });

    const req = { headers, json };
    req.method = 'POST';
    req.url = 'http://www.example.com/.rum/1';

    const ctx = { runtime: { name: 'compute-at-edge' } };
    const resp = await methods.main(req, ctx);

    assert.equal(201, resp.status);
    const logged = JSON.parse(lastLogMessage);
    assert.equal('bot', logged.user_agent);
  });

  it('beacon without ua field uses real user-agent header', async () => {
    const headers = new Map();
    headers.set('host', 'www.example.com');
    headers.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

    const json = () => ({
      weight: 1,
      id: 'normal-browser-test',
      checkpoint: 'top',
    });

    const req = { headers, json };
    req.method = 'POST';
    req.url = 'http://www.example.com/.rum/1';

    const ctx = { runtime: { name: 'compute-at-edge' } };
    const resp = await methods.main(req, ctx);

    assert.equal(201, resp.status);
    const logged = JSON.parse(lastLogMessage);
    assert.equal('desktop:windows:blink', logged.user_agent);
  });
});

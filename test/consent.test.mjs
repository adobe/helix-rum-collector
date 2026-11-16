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
import assert from 'assert';
import {
  before, beforeEach, describe, it,
} from 'node:test';
// eslint-disable-next-line import/no-extraneous-dependencies
import esmock from 'esmock';
import { isValidCheckpoint, sourceTargetValidator } from '../src/utils.mjs';
import { postRequest } from './request-utils.mjs';

const sources = ['onetrust', 'trustarc', 'usercentrics'];
const targets = ['show', 'hidden', 'suppressed', 'granted', 'rejected', 'customized'];
const validValues = sources.flatMap((source) => targets.map((target) => ({ source, target })));
const invalidValues = [
  ['missing both fields', {}],
  ...['source', 'target'].flatMap((field) => {
    const allowed = field === 'source' ? sources : targets;
    return [
      ['missing', undefined],
      ['empty', ''],
      ['unknown', 'unknown'],
      ['zero', 0],
      ['number', 1],
      ['true', true],
      ['false', false],
      ['null', null],
      ['empty array', []],
      ['allowed value in array', [allowed[0]]],
      ['nested array', [[allowed[0]]]],
      ['object', {}],
      ['object containing allowed value', { value: allowed[0] }],
      ...Object.getOwnPropertyNames(Object.prototype).map((key) => [`prototype key ${key}`, key]),
      ...allowed.flatMap((value) => [
        [`uppercase ${value}`, value.toUpperCase()],
        [`leading whitespace ${value}`, ` ${value}`],
        [`trailing whitespace ${value}`, `${value} `],
        [`tab/newline ${value}`, `\t${value}\n`],
      ]),
    ].map(([description, value]) => [
      `${field}: ${description}`,
      { source: 'onetrust', target: 'show', [field]: value },
    ]);
  }),
  ...['accept', 'reject', 'dismiss'].map((target) => [
    `derived click classification ${target}`, { source: 'onetrust', target },
  ]),
];

describe('Consent source/target validator', () => {
  it('keeps the existing consent checkpoint', () => {
    assert.strictEqual(isValidCheckpoint('consent'), true);
  });

  validValues.forEach(({ source, target }) => {
    it(`accepts ${source}/${target}`, () => {
      assert.strictEqual(sourceTargetValidator.consent(source, target), true);
    });
  });

  invalidValues.forEach(([description, { source, target }]) => {
    it(`rejects ${description}`, () => {
      assert.strictEqual(sourceTargetValidator.consent(source, target), false);
    });
  });

  it('does not coerce objects into allowed strings', () => {
    const source = { toString: () => 'onetrust' };
    const target = { toString: () => 'show' };
    const noCoercion = {
      [Symbol.toPrimitive]: () => { throw new Error('must not coerce'); },
    };
    [source, Object('onetrust'), noCoercion].forEach((value) => {
      assert.strictEqual(sourceTargetValidator.consent(value, 'show'), false);
    });
    [target, Object('show'), noCoercion].forEach((value) => {
      assert.strictEqual(sourceTargetValidator.consent('onetrust', value), false);
    });
  });
});

// Match the entrypoint's existing tests; no service-worker listener is needed in Node.
global.addEventListener = function addEventListener() {};

describe('Consent ingestion', () => {
  let main;
  const logged = [];

  before(async () => {
    // Only replace the output adapter. Exercise the real S3, Google and Console loggers.
    const outputMock = {
      '../src/logger.mjs': {
        Logger: class {
          constructor(destination) {
            this.destination = destination;
          }

          log(message) {
            logged.push({ destination: this.destination, data: JSON.parse(message) });
          }
        },
      },
    };
    const [s3, google] = await Promise.all([
      esmock('../src/s3-logger.mjs', outputMock),
      esmock('../src/google-logger.mjs', outputMock),
    ]);
    ({ main } = await esmock('../src/index.mjs', {
      '../src/s3-logger.mjs': s3,
      '../src/google-logger.mjs': google,
    }));
  });

  beforeEach(() => {
    logged.length = 0;
  });

  async function collect(fields, runtime, method) {
    const body = {
      id: 'consent-test',
      weight: 100,
      checkpoint: 'consent',
      referer: 'https://www.example.com/page?private=removed#fragment',
      generation: 'consent-test',
      // Disallowed metric keys must not override the validated checkpoint/source/target.
      cwv: {
        CLS: 0.01, checkpoint: 'click', source: 'unknown', target: 'unknown',
      },
      ...fields,
    };
    const headers = new Map([['referer', 'https://www.example.com/header?private=removed#fragment']]);
    const url = new URL('https://collector.example/.rum/1');
    if (method === 'GET') {
      url.searchParams.set('data', JSON.stringify(body));
    }
    const request = method === 'GET'
      ? new Request(url, { headers: [...headers] })
      : postRequest(url, headers, body);
    const response = await main(request, {
      runtime: { name: runtime },
      altConsole: {
        log: (message) => logged.push({ destination: 'Console', data: JSON.parse(message) }),
      },
    });
    assert.strictEqual(response.status, 201);
    assert.strictEqual(await response.text(), 'rum collected.');
  }

  [
    ['compute-at-edge', ['S3', 'BigQuery-Clustered']],
    ['cloudflare', ['Console']],
  ].forEach(([runtime, destinations]) => {
    ['GET', 'POST'].forEach((method) => {
      describe(`${runtime} ${method}`, () => {
        validValues.forEach(({ source, target }) => {
          it(`logs ${source}/${target} unchanged with privacy filtering`, async () => {
            await collect({ source, target }, runtime, method);
            assert.deepStrictEqual(logged.map((entry) => entry.destination), destinations);
            logged.forEach(({ data }) => {
              assert.strictEqual(data.checkpoint, 'consent');
              assert.strictEqual(data.source, source);
              assert.strictEqual(data.target, target);
              assert.strictEqual(data.id, 'consent-test');
              assert.strictEqual(data.weight, 100);
              assert.strictEqual(data.generation, 'consent-test');
              assert.strictEqual(data.CLS, 0.01);
              assert.strictEqual(data.url, 'https://www.example.com/page');
              assert.strictEqual(data.referer, 'https://www.example.com/header');
            });
          });
        });

        invalidValues.forEach(([description, fields]) => {
          it(`silently drops ${description}`, async () => {
            await collect(fields, runtime, method);
            assert.deepStrictEqual(logged, []);
          });
        });

        it('does not apply the consent allowlist to other checkpoints', async () => {
          await collect({ checkpoint: 'click', source: 'other-provider', target: 'accept' }, runtime, method);
          assert.deepStrictEqual(logged.map((entry) => entry.destination), destinations);
          logged.forEach(({ data }) => {
            assert.strictEqual(data.checkpoint, 'click');
            assert.strictEqual(data.source, 'other-provider');
            assert.strictEqual(data.target, 'accept');
          });
        });
      });
    });
  });
});

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
import { expect } from '@esm-bundle/chai';
// import * as ind from '../src/index.js';
// import { main } from '../src/index.js';

// const { expect } = require('chai');
// const { main } = require('src/index.js');
import { respondRobots } from '../src/robots.js';
import { hashCode } from '../src/request-handler.js';
// import { expect } from '@esm-bundle/chai';

const scripts = {};

describe('Initial unit test', () => {
  before(async () => {
    const mod = {};
    mod.foo = () => {};
    // const mod = await import('/../src/index');
    Object
      .keys(mod)
      .forEach((func) => {
        scripts[func] = mod[func];
      });
  });

  it('My Test', async () => {
    const req = {};
    req.method = 'POST';
    req.url = 'http://foo.bar';

    // console.log('Keys:' + Object.keys(scripts));
    // main(req);
    respondRobots();
    console.log(`Hashcode ${hashCode('foo')}`);
    expect(1).to.equal(1);
  });
});

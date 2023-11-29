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
import { isSpider } from '../src/spiders.mjs';

describe('Test IAB Spider List', () => {
  it('isSpider is a function', () => {
    assert.equal(typeof isSpider, 'function');
  });

  it('Firefox is not a spider', () => {
    assert.equal(isSpider('Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0'), false);
  });

  it('Googlebot is a spider', () => {
    assert.equal(isSpider('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'), true);
  });
});

/*
 * Copyright 2024 Adobe. All rights reserved.
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
  describe, it, beforeEach, afterEach,
} from 'node:test';
import { anonymizeAudience } from '../src/audiences.mjs';

describe('anonymizeAudience', () => {
  const originalRandom = Math.random;

  beforeEach(() => {
    Math.random = () => 0;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  it('strips out invalid audiences', () => {
    assert.equal(anonymizeAudience('foo', 'bar'), null);
    assert.equal(anonymizeAudience('foo', 'bar:baz'), null);
  });

  it('returns the observed audience if randomization algorithm allows it', () => {
    Math.random = () => 0.6;
    assert.equal(anonymizeAudience('foo', 'foo'), 'foo');
    assert.equal(anonymizeAudience('foo', 'foo:bar:baz:qux'), 'foo');
    assert.equal(anonymizeAudience('foo', 'bar:baz:qux:foo'), 'foo');
  });

  it('returns a random audience if randomization algorithm enforces it', () => {
    Math.random = () => 0.59;
    assert.ok(['default', 'foo'].includes(anonymizeAudience('foo', 'foo')));
    assert.ok(['default', 'foo', 'bar', 'baz'].anonymizeAudience('foo', 'foo:bar:baz:qux'));
    assert.ok(['default', 'foo', 'bar', 'baz'].anonymizeAudience('foo', 'bar:baz:qux:foo'));
  });
});

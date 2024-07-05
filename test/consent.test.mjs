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
import { describe, it } from 'node:test';
import { classifyConsent } from '../src/consent.mjs';

describe('classifyConsent', () => {
  const testCases = [
    { selector: '#onetrust-accept-btn-handler', source: 'onetrust', target: 'accept' },
    { selector: '#onetrust-reject-all-handler', source: 'onetrust', target: 'reject' },
    { selector: '#onetrust-close-pc-btn-handler', source: 'onetrust', target: 'dismiss' },
    { selector: '#usercentrics-root', source: 'usercentrics', target: undefined },
    { selector: '#truste-consent-button', source: 'truste', target: 'accept' },
    { selector: '#CybotCookiebotDialogBodyButtonDecline', source: 'cybot', target: 'reject' },
    { selector: '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll', source: 'cybot', target: 'accept' },
    // Negative test cases
    { selector: '#unknown-selector', source: undefined, target: undefined },
    { selector: '.button', source: undefined, target: undefined },
    { selector: '.hero', source: undefined, target: undefined },
    { selector: '.columns', source: undefined, target: undefined },
    { selector: 'form button', source: undefined, target: undefined },
    { selector: 'form input[type="text"]', source: undefined, target: undefined },
    { selector: '#main-content', source: undefined, target: undefined },
    { selector: '.cards', source: undefined, target: undefined },
    { selector: '.carousel', source: undefined, target: undefined },
    { selector: '#header', source: undefined, target: undefined },
    { selector: '.footer', source: undefined, target: undefined },
    { selector: '#search', source: undefined, target: undefined },
    { selector: '#map', source: undefined, target: undefined },
    { selector: '#spa-root', source: undefined, target: undefined },
    { selector: '#app', source: undefined, target: undefined },
    { selector: '#stage', source: undefined, target: undefined },
    { selector: '#root', source: undefined, target: undefined },
    { selector: '#navigation', source: undefined, target: undefined },
  ];

  testCases.forEach(({ selector, source, target }) => {
    it(`should find ${source} (${target}) in ${selector}`, () => {
      const result = classifyConsent(selector);

      if (source || target) {
        assert.equal(result.checkpoint, 'consent');
        assert.equal(result.source, source);
        assert.equal(result.target, target);
      } else {
        assert.ok(result === undefined, 'result should be undefined');
      }
    });
  });
});

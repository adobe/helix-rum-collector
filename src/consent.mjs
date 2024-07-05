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
const vendors = {
  onetrust: {
    match: /#(onetrust|ot)-/,
    accept: /accept/,
    reject: /reject/,
    dismiss: /close-pc-btn-handler/,
  },
  usercentrics: {
    match: /#usercentrics-root/,
    // we don't have nicely id'd buttons here
  },
  truste: {
    match: /#truste/,
    accept: /consent-button/,
    dismiss: /close/,
  },
  cybot: {
    match: /#CybotCookiebot/,
    accept: /AllowAll/,
    reject: /Decline/,
  },
};

export function classifyConsent(cssSelector) {
  return cssSelector
    && (Object.entries(vendors)
      .filter(([_, { match }]) => match.test(cssSelector))
      .map(([vendor, spec]) => ({
        checkpoint: 'consent',
        source: vendor,
        target: Object.entries(spec)
          .filter(([key]) => key !== 'match')
          .filter(([_, pattern]) => pattern.test(cssSelector))
          .map(([key]) => key)
          .pop(),
      }))).pop();
}

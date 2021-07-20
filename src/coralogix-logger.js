/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
module.exports = class CoralogixLogger {
  constructor(req) {
    this.subsystemName = 'undefined';
    this.req = req;

    if (req.headers.get('x-forwarded-host')) {
      this.subsystemName = (req.headers.get('x-forwarded-host') || '').split(',')[0].trim();
    } else if (req.headers.get('host')) {
      this.subsystemName = req.headers.get('host');
    }
    this.start = Math.floor(Date.now());
    this.req = req;
    // eslint-disable-next-line: no-console
    // console.setEndpoint('Coralogix');
    this.logger = fastly.getLogger('Coralogix');
  }

  logRUM(json, id, weight) {
    const now = Math.floor(Date.now());

    const data = {
      timestamp: now,
      applicationName: 'helix-rum-collector-js',
      subsystemName: this.subsystemName,
      severity: 3,
      json: {
        edgecompute: {
          url: this.req.url,
        },
        cdn: {
          url: this.req.headers.has('referer') ? this.req.headers.get('referer') : this.req.url,
        },
        time: {
          start_msec: this.start,
          elapsed: now - this.start,
        },
        request: {
          id,
          method: this.req.method,
          user_agent: this.req.headers.get('user-agent'),
        },
        rum: {
          weight,
          ...json,
        },
      },
    };
    console.log(JSON.stringify(data));
    this.logger.log(JSON.stringify(data));
  }
};

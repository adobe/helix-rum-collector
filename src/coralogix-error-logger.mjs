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
import { Logger } from './logger.mjs';
import { getMaskedTime, getMaskedUserAgent, getSubsystem } from './utils.mjs';

export class CoralogixErrorLogger {
  constructor(req) {
    this.subsystemName = getSubsystem(req);
    this.req = req;
    this.start = Math.floor(Date.now());
    this.req = req;
    // eslint-disable-next-line: no-console
    // console.setEndpoint('Coralogix');
    this.logger = new Logger('Coralogix');
  }

  logError(status, message, timePadding) {
    console.log(`logging to Coralogix: ${typeof this.logger}`);
    const now = Math.floor(Date.now());
    const ts = getMaskedTime(timePadding);

    const data = {
      timestamp: ts,
      applicationName: 'helix-rum-collector',
      subsystemName: this.subsystemName,
      severity: Math.floor(status / 100),
      json: {
        edgecompute: {
          url: this.req.url,
        },
        cdn: {
          url: this.req.headers.has('referer') ? this.req.headers.get('referer') : this.req.url,
        },
        time: {
          start_msec: ts,
          elapsed: now - this.start,
        },
        request: {
          method: this.req.method,
          user_agent: getMaskedUserAgent(this.req.headers.get('user-agent')),
        },
        message,
      },
    };
    console.log('ready to log (coralogix)');
    // console.log(JSON.stringify(data));
    this.logger.log(JSON.stringify(data));
    console.log('done');
  }
}

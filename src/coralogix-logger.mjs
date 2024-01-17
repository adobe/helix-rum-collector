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
import { cleanurl, getForwardedHost, getMaskedTime, getMaskedUserAgent } from './utils.mjs';

export class CoralogixLogger {
  constructor(req) {
    this.subsystemName = 'undefined';
    this.req = req;

    if (req.headers.get('x-forwarded-host')) {
      this.subsystemName = getForwardedHost(req.headers.get('x-forwarded-host'));
    } else if (req.headers.get('host')) {
      this.subsystemName = req.headers.get('host');
    }
    this.start = Math.floor(Date.now());
    this.req = req;
    // eslint-disable-next-line: no-console
    // console.setEndpoint('Coralogix');
    this.logger = new Logger('Coralogix');
  }

  logRUM(json, id, weight, referer, generation, checkpoint, target, source, timePadding) {
    console.log(`logging to Coralogix: ${typeof this.logger}`);
    const maskedNow = getMaskedTime(timePadding);
    console.log('at least I know the time');

    const data = {
      timestamp: maskedNow,
      applicationName: 'helix-rum-collector',
      subsystemName: this.subsystemName,
      severity: checkpoint === 'error' ? 5 : 3,
      json: {
        edgecompute: {
          url: this.req.url,
        },
        cdn: {
          url: cleanurl(referer || (this.req.headers.has('referer') ? this.req.headers.get('referer') : this.req.url)),
        },
        time: {
          start_msec: maskedNow,
          elapsed: Math.floor(Date.now()) - this.start,
        },
        request: {
          id,
          method: this.req.method,
          user_agent: getMaskedUserAgent(this.req.headers.get('user-agent')),
        },
        rum: {
          generation,
          checkpoint,
          target: cleanurl(target),
          source: cleanurl(source),
          weight,
          ...json,
        },
      },
    };
    console.log('ready to log (coralogix)');
    // console.log(JSON.stringify(data));
    this.logger.log(JSON.stringify(data));
    console.log('done');
  }
}

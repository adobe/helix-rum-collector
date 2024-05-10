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
import {
  cleanurl, getMaskedTime, getMaskedUserAgent, getSubsystem,
} from './utils.mjs';

export class CoralogixLogger {
  constructor(req) {
    this.subsystemName = getSubsystem(req);
    this.req = req;
    this.start = Math.floor(Date.now());
    this.req = req;
    // eslint-disable-next-line: no-console
    // console.setEndpoint('Coralogix');
    this.logger = new Logger('Coralogix');
  }

  logRUM(
    json,
    id,
    weight,
    referer,
    generation,
    checkpoint,
    target,
    source,
    timePadding,
    now = Date.now(),
  ) {
    console.log(`logging to Coralogix: ${typeof this.logger}`);
    const maskedNow = getMaskedTime(timePadding);

    const data = {
      timestamp: now,
      applicationName: 'helix-rum-collector',
      subsystemName: this.subsystemName,
      severity: checkpoint === 'error' ? 5 : 3,
      // Coralogix recommends using a string for the text field, even though JSON could be used
      text: JSON.stringify({
        edgecompute: {
          url: this.req.url,
        },
        cdn: {
          url: cleanurl(referer || (this.req.headers.has('referer') ? this.req.headers.get('referer') : this.req.url)),
        },
        time: {
          start_msec: maskedNow,
          elapsed: Math.floor(now) - this.start,
        },
        request: {
          id,
          method: this.req.method,
          headers: {
            x_forwarded_host: this.req.headers.get('x-forwarded-host'),
            // 🤷‍♂️
            x_adobe_routing: this.req.headers.get('x-adobe-routing'),
          },
          user_agent: this.req.headers.get('user-agent'),
        },
        rum: {
          generation,
          checkpoint,
          target: cleanurl(target),
          source: cleanurl(source),
          weight,
          user_agent: getMaskedUserAgent(this.req.headers),
          ...json,
        },
      }),
    };
    console.log('ready to log (coralogix)');

    this.logger.log(JSON.stringify(data));

    if (this.req.headers.get('user-agent') === 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36') {
      // This might be a bot, let's see if we can find more information.
      this.logger.log(JSON.stringify(Object.fromEntries(this.req.headers)));
    }

    console.log('done');
  }
}

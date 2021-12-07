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
/* global fastly */
export class GoogleLogger {
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
    this.logger = fastly.getLogger('BigQuery');
  }

  logRUM(json, id, weight, referer, generation, checkpoint, target, source) {
    console.log('logging to Google');
    const now = Math.floor(Date.now());

    const data = {
      time: now,
      host: this.subsystemName,
      url: referer || (this.req.headers.has('referer') ? this.req.headers.get('referer') : this.req.url),
      user_agent: this.req.headers.get('user-agent'),
      referer: this.req.headers.get('referer'),
      weight,
      generation,
      checkpoint,
      target,
      source,
      id,
      ...json,
    };

    console.log(JSON.stringify(data));
    this.logger.log(JSON.stringify(data));
  }
}

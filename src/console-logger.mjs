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
import {
  cleanurl, getMaskedTime, getMaskedUserAgent, getSubsystem,
} from './utils.mjs';

export class ConsoleLogger {
  constructor(req, altLogger) {
    this.subsystemName = getSubsystem(req);
    this.req = req;
    this.start = Math.floor(Date.now());
    if (altLogger) {
      // This can be set for testing
      this.logger = altLogger;
    } else {
      this.logger = console;
    }
  }

  logRUM(json, id, weight, referer, generation, checkpoint, target, source, timePadding) {
    console.log('logging to Console.');

    const now = getMaskedTime(timePadding);
    const data = {
      time: now,
      host: this.subsystemName,
      url: referer || (this.req.headers.has('referer') ? this.req.headers.get('referer') : this.req.url),
      user_agent: getMaskedUserAgent(this.req.headers),
      referer: cleanurl(this.req.headers.get('referer')),
      weight,
      generation,
      checkpoint,
      target: cleanurl(target),
      source: cleanurl(source),
      id,
      ...json,
    };

    this.logger.log(JSON.stringify(data));
  }
}

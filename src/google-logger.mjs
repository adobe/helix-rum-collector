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
  cleanurl, getMaskedTime, getMaskedUserAgent, getSubsystem, isReasonableWeight, isValidCheckpoint,
} from './utils.mjs';
import { classifyAcquisition } from './acquisition.mjs';

export class GoogleLogger {
  constructor(req) {
    this.subsystemName = getSubsystem(req);
    this.req = req;
    this.start = Math.floor(Date.now());
    this.req = req;
    this.clusterlogger = new Logger('BigQuery-Clustered');
  }

  logRUM(json, id, weight, referer, generation, checkpoint, target, source, timePadding) {
    if (!isValidCheckpoint(checkpoint) && !isReasonableWeight(weight)) {
      return;
    }
    console.log('logging to Google');
    const now = getMaskedTime(timePadding);

    if (checkpoint === 'utm' && (source === 'utm_source' || source === 'utm_medium')) {
      /* eslint-disable no-param-reassign */
      checkpoint = 'acquisition';
      source = classifyAcquisition(target);
    }
    if (checkpoint === 'paid' || checkpoint === 'email') {
      checkpoint = 'acquisition';
      source = classifyAcquisition(source, true);
    }

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

    const hn = (url) => {
      try {
        return (new URL(url)).hostname;
      } catch (e) {
        if (this.req.headers.has('referer')) {
          return new URL(this.req.headers.get('referer')).hostname;
        }
        return new URL(this.req.url).hostname;
      }
    };

    const clusterdata = {
      ...data,
      time: now / 1000, // the cluster table uses TIMESTAMP for time, so that it can be partitioned
      hostname: hn(data.url), // the cluster table uses hostname for clustering
      url: cleanurl(data.url),
    };

    this.clusterlogger.log(JSON.stringify(clusterdata));
  }
}

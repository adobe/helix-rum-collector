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
// Pass the current time to facilitate unit testing
export function maskTime(time, timePadding) {
  const nearestHour = Math.floor(time / 3600000) * 3600000;

  if (timePadding) {
    return nearestHour + timePadding;
  } else {
    // If the padding is missing we use the current second to spread
    // the result a little bit. We drop the current minute and the
    // current milliseconds
    const numSeconds = Math.floor((time - nearestHour) / 1000);
    const currentSecondAsMS = (numSeconds % 60) * 1000;

    return nearestHour + currentSecondAsMS;
  }
}

/**
 * Mask the current time by truncating it to the current hour and
 * adding the padding provided.
 *
 * @param {number} timePadding the padding to be added.
 * @returns the masked time.
 */
export function getMaskedTime(timePadding) {
  return maskTime(Date.now(), timePadding);
}

export function cleanurl(url) {
  // if URL does not parse, return it as is
  try {
    const u = new URL(url);
    // potential PII
    u.search = '';
    u.username = '';
    u.password = '';
    u.hash = '';
    return u.toString();
  } catch (e) {
    return url;
  }
}

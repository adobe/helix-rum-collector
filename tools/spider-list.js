#!/bin/env node;
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
/*
# Fields - delimited by a pipe symbol [|]:
# 1) pattern - case insensitive string to match anywhere in the string
# 2) active flag
# 1=pattern is active and should be matched
# 0=pattern is inactive, and should ignored
# 3) comma and space separated list of exception patterns - case insensitive string to
#    match anywhere in the string.  Use ì, î
# 4) an additional flag was added to this list in November 2005 to identify
#    those user-agent strings on this list that would not pass the valid user-
#    agent test and therefore, are redundant if both lists are used.
#          1=this entry is not needed for those who use a two-pass approach
#          0=this entry is always needed for both one-pass and two-pass
#            approaches
# 5) Another flag was added to this list when the IAB and ABC merged their two
#    lists (01/06) to identify those strings that primarily impact page
#    impression measurement vs. those strings that primarily impact ad
#    impression measurement (or both). The flags are as follows:
#          0=this entry primarily impacts page impression measurement
#          1=this entry primarily impacts ad impression measurement
#          2=this entry impacts both
# 6) start-of-string flag
#          1=pattern must occur at the start of the UA string
#          0=pattern may appear anywhere within the UA string
# 7) **Inactive Date. Inactive Robot List Only.
# mm/dd/yyyy format
*/
const { writeFileSync } = require('fs');

const spiders = process.env.IAB_SPIDER_LIST || '';

const spiderList = spiders
  .split(/\r?\n/)
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => {
    // eslint-disable-next-line no-unused-vars
    const [pattern, active, exceptions, _redundant, _impression, start] = line.split('|');
    return {
      pattern: pattern.toLowerCase(),
      active: active === '1',
      exceptions: exceptions ? exceptions.split(', ') : [],
      start: start === '1',
    };
  })
  .filter((entry) => entry.active)
  .map((entry) => {
    const start = `
  if ((() => {
    const pattern = '${entry.pattern.toLowerCase()}';
    const match = ${entry.start ? 'ua.toLowerCase().startsWith(pattern)' : 'ua.toLowerCase().includes(pattern)'};
    if (match) {`;
    const middle = entry.exceptions
      .map((exception) => `
      if (ua.includes('${exception.toLowerCase()}')) {
        return false;
      }`);
    const end = `
      return true;
    }
    return false;
  })(ua)) {
    return true;
  }`;
    return start + middle.join('\n') + end;
  });
const start = `/*
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
export function isSpider(ua) {`;
const middle = spiderList.join('\n');
const end = `
  return false;
}
`;
// console.log(start + middle + end);
writeFileSync('./src/spiders.mjs', start + middle + end);

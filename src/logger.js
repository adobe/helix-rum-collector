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
// this thing is only for testing, so we ignore it in code coverage
/* c8 ignore start */
export class Logger {
  constructor() {
    // detect if we are running in nodejs
    this.logImpl = typeof process !== 'undefined' ? console : import('fastly:logger');
  }

  log(...args) {
    // check if this.logImpl is a promise
    if (typeof this.logImpl.then === 'function') {
      this.logImpl.then((impl) => impl.log(...args));
      return;
    }
    this.logImpl.log(...args);
  }
}

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
/// <reference types="@fastly/js-compute" />
// eslint-disable-next-line import/no-mutable-exports
export let lastLogMessage = [];

export class Logger {
  constructor(name) {
    console.log('creating logger', typeof process);
    this.logImpl = console;
    if (typeof process === 'undefined') {
      // fastly.
      this.logPromise = import('fastly:logger');
      this.logPromise.then((module) => {
        this.logImpl = new module.Logger(name);
        console.log('logger created', name, this.logImpl);
        this.logPromise = null;
      });
    }
  }

  log(...args) {
    // check if this.logImpl is a promise
    const p = this.logPromise;
    if (p) {
      p.then(() => {
        console.log('this.logImpl should be a thing now', this.logImpl);
        this.logImpl.log(...args);
        console.log('logged', args);
      });
    } else {
      lastLogMessage = args;
      this.logImpl.log(...args);
    }
  }
}

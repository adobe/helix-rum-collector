/*
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
const parentconfig = require('eslint-config-airbnb-base/rules/variables.js');

module.exports = {
  root: true,
  extends: '@adobe/helix',
  parserOptions: {
    ecmaVersion: '2020',
    sourceType: 'module',
  },
  env: {
    es2020: true,
  },
  rules: {
    // addEventListener is seen as a "confusing" global by AirBnb, but essential for the
    // service workers API
    'no-restricted-globals': parentconfig.rules['no-restricted-globals']
      .filter((e) => e !== 'addEventListener'),
    // keep named exports over default exports for classes
    'import/prefer-default-export': [0],
  },
};

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
import tsParser from '@typescript-eslint/parser';
import { recommended } from '@adobe/eslint-config-helix';

export default [
  {
    ignores: [
      '.vscode/*',
      'logs/*',
      'demos/*',
      'test/integration',
      'test/integration-with-cgi-bin',
      'test/tmp/*',
      'test/loadtests/*',
      'tmp/*',
      'coverage/*',
      'google/*',
      'dist/*',
      'htdocs/scrani.js',
      'universal/*',
      'as-pect.config.js',
      'vendor',
      'bin',
      '.releaserc.js',
    ],
  },
  {
    ...recommended,
    languageOptions: {
      ...recommended.languageOptions,
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...recommended.languageOptions.globals,
        addEventListener: 'readonly',
      },
    },
    rules: {
      ...recommended.rules,
      'import/prefer-default-export': [0],
      'no-console': 0,
      'import/no-unresolved': [2, { ignore: ['^fastly:'] }],
    },
  },
  {
    files: ['src/**/*.mjs', 'test/**/*.mjs'],
  },
];

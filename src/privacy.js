/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const filters = {
  cleanJWT: (str) => {
    if (!str || typeof str.replace !== 'function') return str;
    return str.replace(/eyJ[a-zA-Z0-9]+\.eyJ[a-zA-Z0-9]+\.[a-zA-Z0-9]+/g, '<jwt>');
  },

  cleanCode: (str) => {
    if (!str || typeof str.replace !== 'function') return str;
    return str.replace(/(trip\/)[A-Z0-9]{5,7}\/[A-Z]+/, '$1');
  },
};

export function cleanPath(path) {
  if (!path) return path;

  return Object.values(filters).reduce(
    (result, filter) => filter(result),
    path,
  );
}

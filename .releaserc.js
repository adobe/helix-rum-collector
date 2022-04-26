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

module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', {
      changelogFile: 'CHANGELOG.md',
    }],
    ["@semantic-release/npm", {
      npmPublish: false,
    }],
    ['@semantic-release/git', {
      assets: ['package.json', 'package-lock.json', 'CHANGELOG.md'],
      message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
    }],
    ['@semantic-release/exec', {
      publishCmd: `npm run deploy && jq -nMc \
      --arg name "helix-rum-collector@v\${nextRelease.version}" \
      --arg applications "helix-rum-collector" \
      --arg subsystems "" '{
      "timestamp": (now * 1000),
      "name": $name,
      "application": $applications | split(","),
      "subsystem": $subsystems | split(",")
    } ' | curl -X POST -H "Authorization: Bearer ${process.env.CORALOGIX_API_KEY}" -H "Content-Type: application/json" -d @- -sSL 'https://webapi.coralogix.com/api/v1/external/tags'`
    }],
    '@semantic-release/github',
  ],
  branches: ['main']
};

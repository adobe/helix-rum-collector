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
      publishCmd: `npm run deploy`
    }],
    ['@adobe/semantic-release-coralogix', {
      iconUrl: 'https://main--helix-website--adobe.hlx.page/media_13916754ab1f54a7a0b88dcb62cf6902d58148b1c.png',
      applications: ['helix-rum-collector']
    }],
    '@semantic-release/github',
    [
      "semantic-release-slack-bot",
      {
        notifyOnSuccess: false,
        notifyOnFail: false,
        markdownReleaseNotes: true,
      }
    ]
  ],
  branches: ['main']
};

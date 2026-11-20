#!/usr/bin/env node
/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Builds the issue text for a failed scheduled package coverage check.
//
//   node tools/package-coverage-issue.mjs <coverage.txt> <run-url> > issue.md
//   node tools/package-coverage-issue.mjs --marker <coverage.txt>
//
// The marker identifies the set of refused requests, so an unchanged failure isn't
// reported again on every run. A missing or empty output (the guard never ran, e.g. npm ci
// failed) is reported too, as its own state.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const REFUSED = /^\s+(ERR|[0-9]{3}) (https:\/\/\S+)/;

export function refusedRequests(output) {
  return [...new Set(output.split('\n')
    .map((line) => line.match(REFUSED))
    .filter(Boolean)
    .map(([, status, url]) => `${status} ${url}`))].sort();
}

export function summarize(path) {
  const output = existsSync(path) ? readFileSync(path, 'utf8') : '';
  const refused = refusedRequests(output);
  const state = refused.length ? refused.join('\n') : 'guard-did-not-report';
  const id = createHash('sha256').update(state).digest('hex').slice(0, 16);
  return { output, refused, marker: `<!-- package-coverage: ${id} -->` };
}

export function issueBody(path, runUrl) {
  const { output, refused, marker } = summarize(path);
  const details = refused.length
    ? `${refused.length === 1 ? 'This request has' : `These ${refused.length} requests have`} real traffic and would now be refused (no fallback):\n\n\`\`\`\n${refused.join('\n')}\n\`\`\``
    : `The guard did not report its results (it may not have run, e.g. if \`npm ci\` failed). Last output:\n\n\`\`\`\n${output.split('\n').slice(-40).join('\n').trim() || '(none)'}\n\`\`\``;
  return `${marker}\nThe scheduled package coverage check failed: ${runUrl}\n\n${details}\n\nSee docs/PACKAGE-SERVING.md.\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args[0] === '--marker' && args.length === 2) {
    process.stdout.write(`${summarize(args[1]).marker}\n`);
  } else if (args.length === 2) {
    process.stdout.write(issueBody(args[0], args[1]));
  } else {
    process.stderr.write('usage: package-coverage-issue.mjs <coverage.txt> <run-url> | --marker <coverage.txt>\n');
    process.exit(2);
  }
}

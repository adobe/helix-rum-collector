/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-env serviceworker */

import { GoogleLogger } from './google-logger.mjs';
import { CoralogixLogger } from './coralogix-logger.mjs';
import { CoralogixErrorLogger } from './coralogix-error-logger.mjs';
import { ConsoleLogger } from './console-logger.mjs';
import { S3Logger } from './s3-logger.mjs';
import { respondRobots } from './robots.mjs';
import { respondJsdelivr } from './jsdelivr.mjs';
import { respondUnpkg } from './unpkg.mjs';

const PACKAGE_REGISTRIES = ['jsdelivr', 'unpkg'];

function respondError(message, status, e, req) {
  const headers = new Headers();
  const msg = e && e.message ? `${message}: ${e.message}` : message;

  headers.set('Content-Type', 'text/plain; charset=utf-8');
  headers.set('X-Error', msg);

  const response = new Response(`${msg}\n`, {
    status,
    headers,
  });
  console.error(msg);
  try {
    const c = new CoralogixErrorLogger(req);
    c.logError(status, message);
  } catch (err) {
    console.error(`error logging error: ${err.message}`);
  }
  return response;
}

function getRandomID() {
  return Math.random().toString(36).slice(-4);
}

function respondInfo(ctx) {
  return new Response(`{"platform": "${ctx?.runtime?.name}", "version": "${ctx?.func?.version}"}`);
}

export function respondCORS() {
  return new Response('no data collected', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function randomZeroOrOne() {
  return (Math.random() >= 0.5) ? 1 : 0;
}

export function getOtherPackageRegistry(regName) {
  return regName === PACKAGE_REGISTRIES[1] ? PACKAGE_REGISTRIES[0] : PACKAGE_REGISTRIES[1];
}

async function respondRegistry(regName, req) {
  console.log('Using package registry', regName);

  if (regName === 'jsdelivr') {
    return respondJsdelivr(req);
  }

  // Fall back to unpkg
  return respondUnpkg(req);
}

async function respondPackage(req) {
  let pkgreg = new URL(req.url).searchParams.get('pkgreg');

  if (!pkgreg) {
    pkgreg = PACKAGE_REGISTRIES[randomZeroOrOne()];
  }

  try {
    let resp = await respondRegistry(pkgreg, req);
    if (resp.status !== 200) {
      console.log('Changing registry as its response was', resp.status);
      resp = await respondRegistry(getOtherPackageRegistry(pkgreg), req);
    }
    return resp;
  } catch (error) {
    console.log('Contacting registry caused this error', error);
    console.log('Changing package registry');

    return respondRegistry(getOtherPackageRegistry(pkgreg), req);
  }
}

export async function main(req, ctx) {
  if (req.method === 'OPTIONS') {
    return respondCORS();
  }
  try {
    if (req.method === 'GET' && new URL(req.url).pathname.startsWith('/robots.txt')) {
      return respondRobots(req);
    }
    if (req.method === 'GET' && new URL(req.url).pathname.startsWith('/info.json')) {
      return respondInfo(ctx);
    }
    if (req.method === 'GET' && new URL(req.url).pathname.startsWith('/.rum/web-vitals')) {
      return respondPackage(req);
    }
    if (req.method === 'GET' && new URL(req.url).pathname.startsWith('/.rum/@adobe/helix-rum')) {
      return respondPackage(req);
    }
    const body = req.method === 'GET'
      ? JSON.parse(new URL(req.url).searchParams.get('data'))
      : await req.json();

    const headers = new Headers();
    headers.set('Content-Type', 'text/plain; charset=utf-8');

    const {
      weight = 1,
      id = req.method === 'GET' ? `${getRandomID()}` : undefined,
      cwv = {},
      referer, referrer,
      generation, checkpoint,
      target,
      source,
      t,
    } = body;

    if (!id && id !== '') {
      return respondError('id field is required', 400, undefined, req);
    }
    if (!weight || typeof weight !== 'number') {
      return respondError('weight must be a number', 400, undefined, req);
    }
    if (typeof cwv !== 'object') {
      return respondError('cwv must be an object', 400, undefined, req);
    }

    try {
      if (ctx?.runtime?.name === 'compute-at-edge') {
        const c = new CoralogixLogger(req);
        c.logRUM(cwv, id, weight, referer || referrer, generation, checkpoint, target, source, t);

        const s = new S3Logger(req);
        s.logRUM(cwv, id, weight, referer || referrer, generation, checkpoint, target, source, t);

        const g = new GoogleLogger(req);
        g.logRUM(cwv, id, weight, referer || referrer, generation, checkpoint, target, source, t);
      } else {
        const l = new ConsoleLogger(req, ctx?.altConsole);
        l.logRUM(cwv, id, weight, referer || referrer, generation, checkpoint, target, source, t);
      }
    } catch (err) {
      return respondError(`Could not collect RUM: ${err.message}`, 500, err, req);
    }

    const response = new Response('rum collected.', {
      status: 201,
      headers,
    });

    return response;
  } catch (e) {
    return respondError(`RUM Collector expects POST body as JSON, got ${req.method}`, 400, e, req);
  }
}

export async function handler(event) {
  // Get the client reqest from the event
  return main(event.request, event.ctx);
}

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', (event) => {
  event.respondWith(handler(event));
});

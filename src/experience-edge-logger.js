/*
 * Copyright 2022 Adobe. All rights reserved.
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

export class ExperienceEdgeLogger {
  constructor(req) {
    this.req = req;
    this.hostname = 'undefined';

    if (req.headers.get('x-forwarded-host')) {
      this.hostname = (req.headers.get('x-forwarded-host') || '').split(',')[0].trim();
    } else if (req.headers.get('host')) {
      this.hostname = req.headers.get('host');
    }
  }

  // eslint-disable-next-line no-unused-vars
  async logRUM(json, id, weight, referer, generation, checkpoint, target, source) {
    console.log('logging to experience edge');

    // most of this is copied from the example, but it's a start
    const data = {
      events: [
        {
          xdm: {
            eventType: 'web.webpagedetails.pageViews',
            web: {
              webPageDetails: {
                URL: referer || (this.req.headers.has('referer') ? this.req.headers.get('referer') : this.req.url),
              },
              webReferrer: {
                URL: '',
              },
            },
            device: {
              screenHeight: 2160,
              screenWidth: 3840,
              screenOrientation: 'landscape',
            },
            environment: {
              type: 'browser',
              browserDetails: {
                viewportWidth: 1578,
                viewportHeight: 226,
              },
            },
            placeContext: {
              localTime: '2021-12-08T14:11:55.763-07:00',
              localTimezoneOffset: 420,
            },
            timestamp: new Date().toISOString(),
            implementationDetails: {
              name: 'https://ns.adobe.com/experience/alloy/reactor',
              version: generation,
              environment: 'browser',
            },
          },
          query: {
            personalization: {
              schemas: [
                'https://ns.adobe.com/personalization/html-content-item',
                'https://ns.adobe.com/personalization/json-content-item',
                'https://ns.adobe.com/personalization/redirect-item',
                'https://ns.adobe.com/personalization/dom-action',
              ],
              decisionScopes: [
                '__view__',
              ],
            },
          },
          data: {
            test: 'pass',
          },
        },
      ],
      query: {
        identity: {
          fetch: [
            'ECID',
          ],
        },
      },
      meta: {
        state: {
          domain: 'example.com',
          cookiesEnabled: true,
          entries: [
            {
              key: 'kndctr_97D1F3F459CE0AD80A495CBE_AdobeOrg_identity',
              value: 'CiY4MzQxODI0Nzg4NTE1NzE3MDcwMTI4MzMwNTc3NjEyNjg3Mjk2OFIOCPORubbZLxgBKgNPUjLwAfORubbZLw==',
            },
            {
              key: 'kndctr_97D1F3F459CE0AD80A495CBE_AdobeOrg_consent',
              value: 'general=in',
            },
          ],
        },
      },
    };

    const endpoint = new URL('https://edge.adobedc.net/ee/v1/collect?configId=7cca5ac0-0a9e-4caa-98f8-e0cae555b171:prod');
    endpoint.searchParams.append('requestId', id);
    // headers from curl:
    // -H 'Connection: keep-alive'
    // -H 'Pragma: no-cache'
    // -H 'Cache-Control: no-cache'
    // -H 'Sec-Fetch-Dest: empty'
    // -H 'Content-Type: text/plain; charset=UTF-8'
    // -H 'Accept: */*'
    // -H 'Origin: http://localhost:8080'
    // -H 'Sec-Fetch-Site: cross-site'
    // -H 'Sec-Fetch-Mode: cors'
    // -H 'Referer: http://localhost:8080/client'
    // -H 'Accept-Language: en,ro;q=0.9'
    const options = {
      backend: 'experience-edge',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
        Accept: '*/*',
        Origin: 'http://localhost:8080',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        Referer: referer || (this.req.headers.has('referer') ? this.req.headers.get('referer') : this.req.url),
        'Accept-Language': 'en,ro;q=0.9',
        'User-Agent': this.req.headers.get('User-Agent'),
      },
      body: JSON.stringify(data),
    };
    // make a fetch request to the experience edge using the data above

    const response = await fetch(endpoint, options);
    console.log('response from experience edge', response.status, response.statusText);
  }
}

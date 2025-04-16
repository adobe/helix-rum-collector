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

/**
 * Responds with a machine-readable DNT status resource
 * According to W3C Tracking Preference Expression (DNT) spec:
 * https://www.w3.org/TR/tracking-dnt/
 *
 * @param {Request} req The request object
 * @returns {Response} The response object with DNT tracking status
 */
export function respondDNTStatus(req) {
  const headers = {
    'Content-Type': 'application/tracking-status+json',
    'Cache-Control': 'max-age=604800',
    'X-Frame-Options': 'DENY',
    Tk: 'N',
  };

  // Extract the origin from the request URL
  const url = new URL(req.url);
  const { origin } = url;

  // Our tracking status object as per section 7.5 of the spec
  const trackingStatus = {
    tracking: 'N', // N = Not tracking
    policy: `${origin}/.well-known/dnt-policy.txt`,
    qualifiers: ['sfd'], // security, financial, debugging
    controller: ['https://www.adobe.com/privacy.html'],
    compliance: ['https://www.w3.org/TR/tracking-dnt/'],
  };

  return new Response(JSON.stringify(trackingStatus, null, 2), {
    status: 200,
    headers,
  });
}

/**
 * Responds with a human-readable DNT policy
 *
 * @param {Request} req The request object
 * @returns {Response} The response object with human-readable DNT policy
 */
export function respondDNTPolicy(req) {
  // Extract the origin from the request URL
  const url = new URL(req.url);
  const { origin } = url;

  const headers = {
    'Content-Type': 'text/plain',
    'Cache-Control': 'max-age=604800',
    'X-Frame-Options': 'DENY',
    Tk: 'N',
  };

  const policy = `Operational Telemetry - Do Not Track Policy
Do Not Track Compliance Policy

Version 1.0

This domain complies with user opt-outs from tracking via the "Do Not Track"
or "DNT" header  [http://www.w3.org/TR/tracking-dnt/].  This file will always
be posted via HTTPS at ${origin}/.well-known/dnt-policy.txt
to indicate this fact.

PRIVACY COMMITMENT
-----------------
Adobe Experience Manager's Operational Telemetry Collector is designed to preserve visitor privacy
and minimize data collection. We are committed to respecting Do Not Track (DNT) preferences.

DATA COLLECTION
--------------
Our Operational Telemetry:
- Only captures information from a small fraction of page views (sampling)
- Has no concept of visitors, visits, or sessions - only individual checkpoints during a page view
- Does not use any client-side state or ID (such as cookies or localStorage)
- Does not perform "fingerprinting" of devices or individuals

COLLECTED DATA
-------------
When DNT is not enabled, the limited data we collect may include:
- The host name of the site being visited
- The host name of the data collection server
- A simplified device class identifier (not the full user agent string)
- Rounded timestamp (to preserve privacy)
- URL of page visited (without URL parameters)
- Referrer URL (without URL parameters)
- A randomly generated page view ID
- The weight or inverse of the sampling rate
- Checkpoint names during page loading
- Source and target of interaction events
- Core Web Vitals performance metrics (LCP, INP, CLS, TTFB)

DATA USAGE
---------
The collected data is only used for:
- Identifying and fixing performance bottlenecks
- Estimating page view numbers
- Understanding compatibility with other scripts

PRIVACY PROTECTION
----------------
Our Operational Telemetry is designed to prevent:
1. Identification of individual visitors or devices
2. Fingerprinting
3. Tracking of visits or sessions
4. Enrichment with personally identifiable information

For privacy-related inquiries, please contact privacy@adobe.com

---

Last updated: 2025-04-16`;

  return new Response(policy, {
    status: 200,
    headers,
  });
}

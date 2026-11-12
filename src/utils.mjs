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
// Pass the current time to facilitate unit testing
import { isSpider } from './spiders.mjs';
import { bots } from './bots.mjs';
import { cleanPath } from './privacy.mjs';

export const BACKENDS = [
  {
    provider: 'cloudflare',
    proddomain: 'rum.hlx-cloudflare.page',
    cidomain: 'helix3--helix-rum-collector-ci.helix-runtime.workers.dev',
  },
  {
    provider: 'fastly',
    proddomain: 'rum.hlx3.page',
    cidomain: 'helix-rum-collector-ci.edgecompute.app',
  },
];

export function isReasonableWeight(weight) {
  return [1, // debug
    10, // low
    20, // that one customer who's doing it differently
    100, // default
    1000, // high
  ].includes(weight);
}
export function isValidCheckpoint(checkpoint) {
  const knowncheckpoints = [
    'loadresource',
    'cwv',
    'click',
    'top',
    // 'lazy', // killed, not used in minirum anymore
    'viewmedia',
    'viewblock',
    // 'leave', // killed, not in the explorer
    'enter',
    'error',
    'navigate',
    'utm', // we keep it for now - needs to play nicely with with paid
    'reload',
    'back_forward',
    // 'lcp', // not needed anymore, helix-specific
    'missingresource',
    'audience',
    'a11y',
    'experiment',
    'formsubmit',
    '404',
    '4xx', // for 403, 429, etc
    // 'convert', // not valuable
    'search',
    // 'unsupported',
    'fill', // when a form field is filled
    // 'formviews', // no data in last 30 days
    // 'formready', // no data in last 30 days
    // 'formabondoned', // no data in last 30 days
    // 'noscript', // insufficient use
    // 'formfieldchange', // no data in last 30 days
    // 'formfieldfocus', // no data in last 30 days
    // 'nullsearch', // killed, not in the explorer
    // 'formvalidationerrors', // no data in last 30 days
    'consent',
    'paid',
    'email',
    'acquisition',
    'login',
    'signup',
    'language', // record language preference
    'prerender',
    'redirect', // there was a redirect as part of the request
  ];
  const now = Date.now();
  // Jan 1st 2025 is the date the sidekick team has promised to remove the sidekick: checkpoints
  // and use regular checkpoints instead
  const eol = new Date(2025, 0, 1).getTime();
  if (now < eol && checkpoint && typeof checkpoint === 'string' && checkpoint.startsWith('sidekick:')) {
    return true;
  }
  return knowncheckpoints.indexOf(checkpoint) > -1;
}

export const sourceTargetValidator = {
  a11y: (source = '') => ['off', 'on', 'low', 'medium', 'high'].includes(source),
  audience: (source = '', target = '') => source.match(/^[\w-]+$/)
    && target.match(/^[\w-:]+$/)
    && ['default', ...target.split(':')].includes(source),
  experiment: (source = '', target = '') => source.match(/^[\w-]+$/)
    && target.match(/^[\w-]+$/),
};

export function isValidId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9-]+$/.test(id);
}

export function maskTime(time, timePadding) {
  const msPerHour = 3600000;

  const baseHour = Math.floor(time / msPerHour) * msPerHour;

  let numPadding;
  if (typeof timePadding === 'string') {
    numPadding = Number(timePadding);
  } else {
    numPadding = timePadding;
  }

  if (typeof numPadding === 'number' && !Number.isNaN(numPadding)) {
    // Limit the padding to a day
    const padding = Math.min(numPadding, 24 * msPerHour);

    return baseHour + padding;
  } else {
    // If the padding is missing we use the current second to spread
    // the result a little bit. We drop the current minute.
    const numSeconds = Math.floor((time - baseHour) / 1000);
    const numMillis = time - baseHour - (numSeconds * 1000);
    const currentSecondAsMS = (numSeconds % 60) * 1000;

    return baseHour + currentSecondAsMS + numMillis;
  }
}

/**
 * Mask the current time by truncating it to the current hour and
 * adding the padding provided.
 *
 * @param {number} timePadding the padding to be added.
 * @returns the masked time.
 */
export function getMaskedTime(timePadding) {
  return maskTime(Date.now(), timePadding);
}

/**
 * Extract the OS from the user agent string
 * @returns {Enumerator(':android', ':ios', ':ipados', '')} the OS
 */
function getMobileOS(userAgent) {
  if (userAgent.includes('android')) {
    return ':android';
  } else if (userAgent.includes('ipad')) {
    return ':ipados';
  } else if (userAgent.includes('like mac os')) {
    return ':ios';
  }
  return '';
}
/**
 * Extract the OS from the user agent string
 * @returns {Enumerator(':windows', ':mac', ':linux', '')} the OS
 */
function getDesktopOS(userAgent) {
  if (userAgent.includes('windows')) {
    return ':windows';
  } else if (userAgent.includes('mac os')) {
    return ':mac';
  } else if (userAgent.includes('linux')) {
    return ':linux';
  } else if (userAgent.includes('x11; cros')) {
    return ':chromeos';
  }
  return '';
}

/**
 * Determines the type of bot based on the user agent string. If no bot
 * type can be determined, the empty string is returned.
 * @param {string} userAgent the user agent string
 * @returns {Enumerator('', ':search', ':seo', ':social', ':ai', ':security')} the bot type
 */
function getBotType(userAgent) {
  for (const [category, botList] of Object.entries(bots)) {
    const matched = botList.find(({ regex }) => new RegExp(regex, 'i').test(userAgent));
    if (matched) {
      const subtype = matched.subtype ? `:${matched.subtype}` : '';
      return `:${category.toLowerCase()}${subtype}`;
    }
  }
  return '';
}

function getBrowserEngine(userAgent) {
  const engines = [
    {
      name: 'edgehtml',
      pattern: /windows.+ edge/,
    }, {
      name: 'blink',
      pattern: /webkit.+chrome/,
    }, {
      name: 'presto',
      pattern: /presto/,
    }, {
      name: 'webkit',
      pattern: /(webkit)\/([\w.]+)/,
    }, {
      name: 'gecko',
      pattern: /rv:([\w.]{1,9})\b.+(gecko)/,
    }];

  const engine = engines.find(({ pattern }) => pattern.test(userAgent));
  return engine ? `:${engine.name}` : '';
}

// RFC 8941 building blocks, restricted to what a Signature-Agent header needs.
const SF_KEY = '[a-z*][a-z0-9_.*-]*';
const SF_STRING = '"(?:[^"\\\\]|\\\\["\\\\])*"';
const SF_BARE_ITEM = `(?:${SF_STRING}|[^\\s,;="()]+)`;
const SF_PARAMS = `(?:;\\s*${SF_KEY}(?:=${SF_BARE_ITEM})?)*`;
const SF_LEGACY_STRING = new RegExp(`^${SF_STRING}$`);
const SF_DICT_MEMBER = new RegExp(`(${SF_KEY})(?:=(${SF_BARE_ITEM}))?(${SF_PARAMS})[ \\t]*(,[ \\t]*|$)`, 'y');

function unquote(sfString) {
  return sfString.slice(1, -1).replace(/\\(["\\])/g, '$1');
}

/**
 * Extracts the agent URLs declared in a Signature-Agent header. Accepts the
 * Structured Fields dictionary defined by draft-ietf-webbotauth-httpsig-protocol
 * (`sig1="https://agent.example"`), and the legacy bare string form
 * (`"https://agent.example"`) that earlier drafts defined and deployments still send.
 * Dictionary members whose value is not a string, or that carry parameters, are
 * ignored, as the draft requires. A header that does not parse yields no agents.
 * @param {string} header the Signature-Agent header value
 * @returns {string[]} the declared agent URLs, without quotes
 */
export function parseSignatureAgent(header) {
  if (typeof header !== 'string') {
    return [];
  }
  const input = header.trim();
  if (SF_LEGACY_STRING.test(input)) {
    return [unquote(input)];
  }
  const members = new Map();
  SF_DICT_MEMBER.lastIndex = 0;
  while (SF_DICT_MEMBER.lastIndex < input.length) {
    const match = SF_DICT_MEMBER.exec(input);
    // unparseable member, or a trailing comma
    if (!match || (match[4] !== '' && SF_DICT_MEMBER.lastIndex === input.length)) {
      return [];
    }
    const [, key, value, params] = match;
    // duplicate keys: the last member wins (RFC 8941, section 4.2.2)
    members.set(key, !params && value?.startsWith('"') ? unquote(value) : null);
  }
  return [...members.values()].filter((value) => value !== null);
}

// Self-declared Signature-Agent URLs, in order of precedence when a request
// declares more than one (e.g. an agent driving another operator's browser).
const SIGNATURE_AGENT_LABELS = [
  ['https://chatgpt.com', 'bot:ai:chatgpt-agent'],
  ['https://muse.ai', 'bot:ai:meta-agent'],
  ['https://www.meta.com', 'bot:ai:meta-agent'],
];

function getSignatureAgentLabel(header) {
  const agents = parseSignatureAgent(header);
  const known = SIGNATURE_AGENT_LABELS.find(([url]) => agents.includes(url));
  return known ? known[1] : undefined;
}

export function getMaskedUserAgent(headers) {
  if (!headers) {
    return 'undefined';
  }

  if (headers.get('CloudFront-Is-Desktop-Viewer') === 'true') {
    return 'desktop';
  } else if (headers.get('CloudFront-Is-Mobile-Viewer') === 'true') {
    return 'mobile';
  } else if (headers.get('CloudFront-Is-SmartTV-Viewer') === 'true') {
    return 'desktop';
  } else if (headers.get('CloudFront-Is-Tablet-Viewer') === 'true') {
    return 'mobile';
  }
  if (headers.get('x-newrelic-id')) {
    return 'bot:monitoring';
  }

  const userAgent = headers.get('user-agent') || '';
  const lcUA = userAgent.toLowerCase();

  // Beacon-level automation markers appended to the `ua` body field by the RUM
  // client libraries. These are NOT crawler user agents, and each means something
  // different, so they stay distinguishable from crawlers and from each other:
  //
  //   +http://navigator.webdriver  helix-rum-js, on every beacon of the pageview:
  //                                navigator.webdriver was true (self-declaring automation)
  //   +http://event.untrusted      helix-rum-enhancer, on a single click:
  //                                event.isTrusted === false (script-synthesised click)
  //   +http://event.hidden         helix-rum-enhancer, on a single click:
  //                                fired while the tab was not visible
  //
  // They still classify as `bot`, so every existing bot filter keeps matching; the
  // suffix is additive. Collapsing all three into a bare `bot` (the previous
  // behaviour) pooled them with unclassified crawlers and discarded the distinction
  // rum-distiller needs to re-classify a bundle from its own click events.
  if (lcUA.includes('+http://navigator.webdriver')) {
    return 'bot:webdriver';
  }
  if (lcUA.includes('+http://event.untrusted')) {
    return 'bot:untrusted';
  }
  if (lcUA.includes('+http://event.hidden')) {
    return 'bot:hidden';
  }

  if (lcUA.includes('bot')
    || lcUA.includes('spider')
    || lcUA.includes('crawler')
    || lcUA.includes('ahc/')
    || lcUA.includes('node')
    || lcUA.includes('python')
    || lcUA.includes('probe')
    || lcUA.includes('axios')
    || lcUA.includes('curl')
    || lcUA.includes('synthetics')
    || lcUA.includes('claude-agent')
    || lcUA.includes('google-agent')
    || lcUA.includes('manus-user')
    || lcUA.includes('+https://')
    || lcUA.includes('+http://')
    || isSpider(lcUA)) {
    return `bot${getBotType(lcUA)}`;
  }

  // Cloud browsers can use ordinary Chrome UAs and webdriver=false. Match the exact
  // declared Signature-Agent URL, after preserving existing UA-based bot labels.
  // Like a UA, this is a self-declared analytics signal, NOT verified Web Bot Auth:
  // authenticating it requires validating Signature and Signature-Input.
  const signatureAgentLabel = getSignatureAgentLabel(headers.get('signature-agent'));
  if (signatureAgentLabel) {
    return signatureAgentLabel;
  }

  if (lcUA.includes('mobile')
    || lcUA.includes('android')
    || lcUA.includes('opera mini')) {
    const mobileOS = getMobileOS(lcUA);
    return `mobile${mobileOS}${mobileOS ? getBrowserEngine(lcUA) : ''}`;
  }
  if (lcUA.includes('mozilla')
    || lcUA.includes('opera')) {
    const desktopOS = getDesktopOS(lcUA);
    return `desktop${desktopOS}${desktopOS ? getBrowserEngine(lcUA) : ''}`;
  }

  return 'undefined';
}

function cleanCode(str) {
  // Use a regex to replace everything after and including the & and = chars with an empty string
  if (str && typeof str.replace === 'function' && str.includes('&') && str.includes('=')) {
    return str.replace(/(&.+=.+).+/, '');
  }
  // Use a regex to replace everything after 'trip/' with an empty string
  if (str && typeof str.replace === 'function') {
    return str.replace(/(trip\/)[A-Z0-9]{5,7}\/[A-Z]+/, '$1');
  }
  return str;
}

export function cleanurl(url) {
  // if URL does not parse, return it as is
  try {
    const u = new URL(url);
    // potential PII
    u.search = '';
    u.username = '';
    u.password = '';
    u.hash = '';
    u.pathname = cleanPath(u.pathname, ['jwt', 'uuid', 'email']);
    u.pathname = cleanCode(u.pathname);
    return u.toString().replace(/@/g, '');
  } catch (e) {
    return cleanCode(cleanPath(url, ['jwt', 'uuid', 'email']));
  }
}

/**
 * Determine the hostname to record for a measured page. Normally this is the
 * URL's hostname without the port, which keeps clustering cardinality low for
 * production traffic. For loopback / local development hosts the port is the
 * only thing that distinguishes one local app from another (e.g. a SLICC dev
 * server on localhost:5710 vs another tool on localhost:3000), so for those we
 * preserve it by returning the host (hostname:port). IPv6 loopback and
 * `*.localhost` names are treated the same way.
 * @param {string} url the URL to extract the hostname from
 * @returns {string} the hostname, including the port for loopback hosts
 */
export function getHostname(url) {
  const { hostname, host } = new URL(url);
  const isLoopback = hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '[::1]'
    || hostname.endsWith('.localhost');
  return isLoopback ? host : hostname;
}

export function getForwardedHost(fhh) {
  const hosts = fhh.split(',');

  const match = hosts
    .map((h) => h.trim())
    .filter((h) => h.match(/.+-.+[.](adobeaemcloud|aemcloud|aem|hlx)[.](page|live|net)$/));

  if (match.length > 0) {
    return match[0];
  } else {
    return hosts[0].trim();
  }
}

function cleanDNSSegment(segment) {
  return segment
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/^(.{63}).*$/, '$1')
    .toLowerCase();
}

export function extractAdobeRoutingInfo(value) {
  // value is a string with key value pairs, separated by a comma
  // extract program, environment and tier
  const routingInfo = value
    .split(/,(?=.*=)/)
    .map((pair) => pair.trim())
    .filter((pair) => pair.includes('='))
    .map((pair) => pair.split('='))
    .reduce((acc, [key, val]) => {
      acc[key] = cleanDNSSegment(val);
      return acc;
    }, {});
  if (routingInfo.ams) {
    return `${routingInfo.tier}-${routingInfo.env}-${routingInfo.ams}.adobecqms.net`;
  }
  if (routingInfo.commerce) {
    return `${routingInfo.commerce}.adobecommerce.net`;
  }
  return `${routingInfo.tier}-p${routingInfo.program}-e${routingInfo.environment}.adobeaemcloud.net`;
}

/**
 * Extract the subsystem from the request
 * @param {Request} req the request
 * @returns {string} the subsystem
 */
export function getSubsystem(req) {
  const params = req.url && new URL(req.url).searchParams;
  if (req.headers.get('x-adobe-routing')) {
    return extractAdobeRoutingInfo(req.headers.get('x-adobe-routing'));
  } else if (params && params.has('routing')) {
    return extractAdobeRoutingInfo(params.get('routing'));
  } else if (req.headers.get('x-forwarded-host')) {
    return getForwardedHost(req.headers.get('x-forwarded-host'));
  } else if (req.headers.get('host')) {
    return req.headers.get('host');
  }
  return 'undefined';
}

/**
 * Cloudflare applies a 16kb limit to all log messages, so we need to make sure
 * that the JSON we send to the logger is not too large. This function will
 * apply a couple of tricks to make this happen
 * 1. limit the length of any string value to 1024 characters
 * 2. cast LCP, INP, TTFB to integers
 * @param {Object} obj an object to be logged
 * @returns {String} the sanitized object as a JSON string
 */
export function bloatControl(obj) {
  // the object can have nested objects, so we may need recursion
  const sanitize = (o, k) => {
    if (typeof o === 'string' && o.length > 1024) {
      return `${o.substring(0, 1024)}…`;
    }
    if (typeof o === 'number') {
      if (['LCP', 'INP', 'TTFB'].includes(k)) {
        return Math.floor(o);
      }
      return o;
    }
    if (Array.isArray(o)) {
      return o.map(sanitize);
    }
    if (typeof o === 'object' && o !== null) {
      return Object.entries(o).reduce((acc, [key, value]) => {
        acc[key] = sanitize(value, key);
        return acc;
      }, {});
    }
    return o;
  };
  return JSON.stringify(sanitize(obj));
}

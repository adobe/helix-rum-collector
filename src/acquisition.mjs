/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable object-curly-newline */

const hasText = (s) => typeof s === 'string' && s.trim().length > 0;
const sanitize = (str) => (str || '').toLowerCase().replace(/[^a-zA-Z0-9]/, '');

const vendorClassifications = [
  { regex: /google|googleads|google-ads|google_search|google_deman|adwords|dv360|gdn|doubleclick|dbm|gmb|2mdn/i, result: 'google' },
  { regex: /instagram|ig/i, result: 'instagram' },
  { regex: /facebook|fb|meta/i, result: 'facebook' },
  { regex: /bing/i, result: 'bing' },
  { regex: /tiktok/i, result: 'tiktok' },
  { regex: /youtube|yt/i, result: 'youtube' },
  { regex: /linkedin/i, result: 'linkedin' },
  { regex: /twitter/i, result: 'x' },
  { regex: /snapchat/i, result: 'snapchat' },
  { regex: /microsoft/i, result: 'microsoft' },
  { regex: /pinterest/i, result: 'pinterest' },
  { regex: /reddit/i, result: 'reddit' },
  { regex: /spotify/i, result: 'spotify' },
  { regex: /criteo/i, result: 'criteo' },
  { regex: /taboola/i, result: 'taboola' },
  { regex: /outbrain/i, result: 'outbrain' },
  { regex: /yahoo/i, result: 'yahoo' },
  { regex: /marketo/i, result: 'marketo' },
  { regex: /eloqua/i, result: 'eloqua' },
  { regex: /substack/i, result: 'substack' },
  { regex: /line/i, result: 'line' },
  { regex: /yext/i, result: 'yext' },
  { regex: /teads/i, result: 'teads' },
  { regex: /yandex/i, result: 'yandex' },
  { regex: /baidu/i, result: 'baidu' },
  { regex: /amazon|ctv/i, result: 'amazon' },
  { regex: /duckduckgo/i, result: 'duckduckgo' },
];

// Known tracking params
const tracking = {
  paid: /gclid|gclsrc|wbraid|gbraid|dclid|msclkid|fb(cl|ad_|pxl_)id|tw(clid|src|term)|li_fat_id|epik|ttclid/,
  email: /mc_([ce])id|mkt_tok/,
};

// Known referrers
const referrers = {
  search: /^(https?:\/\/)?(.*\.)?(google|yahoo|bing|yandex|baidu|duckduckgo|brave|ecosia|aol|startpage|ask)\.(.*)(\/|$)/,
  social: /^(https?:\/\/)?(.*\.)?(facebook|tiktok|snapchat|x|twitter|pinterest|reddit|linkedin|threads|quora|discord|tumblr|mastodon|bluesky|instagram)\.(.*)(\/|$)/,
  ad: /googlesyndication|2mdn|spotify/,
  video: /^(https?:\/\/)?(.*\.)?(youtube|vimeo|twitch|dailymotion|wistia|amazon)\.(.*)(\/|$)/,
};

// Known UTM Sources
const utmSources = {
  paid: ['gdn'],
};

// Known UTM Mediums
const utmMediums = {
  paid: /^\bpp\b|(.*(cp[acmuv]|ppc|paid|display|banner|poster|placement|ads|adwords|dbm|programmatic).*)$/,
  search: ['google', 'paidsearch', 'paidsearchnb', 'sea', 'sem'],
  social: ['facebook', 'gnews', 'instagramfeed', 'instagramreels', 'instagramstories', 'line', 'linkedin', 'metasearch', 'organicsocialown', 'paidsocial', 'social', 'sociallinkedin', 'socialpaid'],
  video: /video|dv360|tv/i,
  affiliate: ['aff', 'affiliate', 'affiliatemarketing'],
  organicsocial: ['organicsocial'],
  email: ['em', 'email', 'mail', 'newsletter', 'hs_email'],
  sms: ['sms', 'mms'],
  qr: ['qr', 'qrcode'],
  push: ['push', 'pushnotification'],
  local: ['gmb'],
};

// HELPERS
const any = () => true;
const anyOf = (truth) => (text) => {
  if (Array.isArray(truth)) return truth.includes(text);
  if (truth instanceof RegExp) return truth.test(text);
  return truth === text;
};
const none = (input) => (Array.isArray(input) ? input.length === 0 : !hasText(input));
const not = (truth) => (text) => {
  if (Array.isArray(truth)) return !truth.includes(text);
  if (truth instanceof RegExp) return !truth.test(text);
  return truth !== text;
};
const another = (truth) => (text) => hasText(text) && truth !== text;
const same = (truth) => (text) => hasText(text) && truth === text;
const notEmpty = (text) => hasText(text);

const RULES = (origin) => ([
  // PAID
  { category: 'paid:search', referrer: anyOf(referrers.search), utmSource: any, utmMedium: anyOf(utmMediums.search), tracking: none },
  { category: 'paid:search', referrer: anyOf(referrers.search), utmSource: any, utmMedium: anyOf(utmMediums.paid), tracking: none },
  { category: 'paid:search', referrer: anyOf(referrers.search), utmSource: any, utmMedium: any, tracking: anyOf(tracking.paid) },

  { category: 'paid:social', referrer: anyOf(referrers.social), utmSource: any, utmMedium: anyOf(utmMediums.social), tracking: none },
  { category: 'paid:social', referrer: anyOf(referrers.social), utmSource: any, utmMedium: anyOf(utmMediums.paid), tracking: none },
  { category: 'paid:social', referrer: anyOf(referrers.social), utmSource: any, utmMedium: any, tracking: anyOf(tracking.paid) },

  { category: 'paid:video', referrer: anyOf(referrers.video), utmSource: any, utmMedium: anyOf(utmMediums.video), tracking: any },
  { category: 'paid:video', referrer: anyOf(referrers.video), utmSource: any, utmMedium: anyOf(utmMediums.paid), tracking: any },
  { category: 'paid:video', referrer: anyOf(referrers.video), utmSource: any, utmMedium: any, tracking: anyOf(tracking.paid) },

  { category: 'paid:display', referrer: notEmpty, utmSource: any, utmMedium: anyOf(utmMediums.paid), tracking: any },
  { category: 'paid:display', referrer: anyOf(referrers.ad), utmSource: any, utmMedium: any, tracking: any },
  { category: 'paid:display', referrer: notEmpty, utmSource: anyOf(utmSources.paid), utmMedium: any, tracking: any },

  { category: 'paid:affiliate', referrer: notEmpty, utmSource: any, utmMedium: anyOf(utmMediums.affiliate), tracking: any },

  { category: 'paid:local', referrer: notEmpty, utmSource: any, utmMedium: anyOf(utmMediums.local), tracking: none },

  { category: 'paid:uncategorized', referrer: not(origin), utmSource: any, utmMedium: anyOf(utmMediums.paid), tracking: any },
  { category: 'paid:uncategorized', referrer: not(origin), utmSource: any, utmMedium: any, tracking: anyOf(tracking.paid) },

  // EARNED
  { category: 'earned:search', referrer: anyOf(referrers.search), utmSource: none, utmMedium: none, tracking: none },
  { category: 'earned:search', referrer: anyOf(referrers.search), utmSource: any, utmMedium: not(utmMediums.paid), tracking: not(tracking.paid) },

  { category: 'earned:social', referrer: anyOf(referrers.social), utmSource: none, utmMedium: none, tracking: none },
  { category: 'earned:social', referrer: not(origin), utmSource: any, utmMedium: anyOf(utmMediums.organicsocial), tracking: none },

  { category: 'earned:video', referrer: anyOf(referrers.video), utmSource: none, utmMedium: none, tracking: none },
  { category: 'earned:video', referrer: anyOf(referrers.video), utmSource: any, utmMedium: not(utmMediums.paid), tracking: none },

  { category: 'earned:referral', referrer: another(origin), utmSource: none, utmMedium: none, tracking: none },

  // OWNED
  { category: 'owned:direct', referrer: none, utmSource: none, utmMedium: none, tracking: none },
  { category: 'owned:internal', referrer: same(origin), utmSource: none, utmMedium: none, tracking: none },
  { category: 'owned:email', referrer: any, utmSource: any, utmMedium: any, tracking: anyOf(tracking.email) },
  { category: 'owned:email', referrer: any, utmSource: any, utmMedium: anyOf(utmMediums.email), tracking: any },
  { category: 'owned:sms', referrer: none, utmSource: any, utmMedium: anyOf(utmMediums.sms), tracking: none },
  { category: 'owned:qr', referrer: none, utmSource: any, utmMedium: anyOf(utmMediums.qr), tracking: none },
  { category: 'owned:push', referrer: none, utmSource: any, utmMedium: anyOf(utmMediums.push), tracking: none },

  // FALLBACK
  { category: 'owned:uncategorized', referrer: any, utmSource: any, utmMedium: any, tracking: any },
]);

function vendor(origin) {
  return vendorClassifications
    .reduce((result, classification) => (
      !result && classification.regex.test(origin)
        ? classification.result
        : result), '');
}

export function classifyAcquisition(url, referrer, query) {
  try {
    let { origin } = new URL(url);
    if (!origin.endsWith('/')) origin += '/';

    const rules = RULES(origin);

    const usp = new URLSearchParams(query);

    const utmMedium = sanitize(usp.get('utm_medium') || '');
    const utmSource = sanitize(usp.get('utm_source') || '');
    const others = [...usp.keys()].find((k) => Object.values(tracking)
      .some((t) => t.test(k))) || '';

    const { category } = rules.find((r) => (
      r.referrer(referrer) && r.utmSource(utmSource) && r.utmMedium(utmMedium) && r.tracking(others)
    ));

    const vendorResult = vendor(referrer || utmMedium || utmSource);

    return vendorResult ? `${category}:${vendorResult}` : category;
  } catch (e) {
    console.error('Error during traffic classification', e);
    return 'owned:uncategorized';
  }
}

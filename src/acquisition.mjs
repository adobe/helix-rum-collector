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
const vendorClassifications = [
  { regex: /google|googleads|google-ads|google_search|google_deman|adwords|dv360|gdn/i, result: 'google' },
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
];

/* is the vendor paid or owned */
const vendorTypeLookup = {
  yext: 'paid',
  reddit: 'paid',
  tiktok: 'paid',
  google: 'paid',
  amazon: 'paid',
};

const categoryClassifications = [
  { regex: /search|sem|sea$/i, result: 'search' },
  { regex: /display|programmatic|banner|gdn/i, result: 'display' },
  { regex: /video|dv360|tv/i, result: 'video' },
  { regex: /email|newsletter/i, result: 'email' },
  { regex: /social|bio/i, result: 'social' },
  { regex: /affiliate/i, result: 'affiliate' },
  { regex: /local/i, result: 'local' },
  { regex: /sms/i, result: 'sms' },
  { regex: /qr/i, result: 'qr' },
  { regex: /push/i, result: 'push' },
  { regex: /print/i, result: 'print' },
  { regex: /web/i, result: 'web' },
];

const paidOwnedClassifications = [
  { regex: /cpc|ppc|paid|cpm|cpv|banner|display|programmatic|affiliate|^sea$|ads/i, result: 'paid' },
  // "organic" is treated as "owned" as it is not paid and not earned
  // (noone puts UTM tags on real organic traffic)
  { regex: /email|newsletter|hs_email|organic|sms|qr|qrcode|print|website|web|linkin.bio/i, result: 'owned' },
  { regex: /push/i, result: 'owned' },
  // { regex: /social/i, result: 'earned' },
];

const vendorCategoryLookup = {
  google: 'search',
  bing: 'search',
  yahoo: 'search',
  facebook: 'social',
  instagram: 'social',
  linkedin: 'social',
  x: 'social',
  snapchat: 'social',
  pinterest: 'social',
  reddit: 'social',
  youtube: 'video',
  spotify: 'display',
  yext: 'local',
  line: 'social',
  substack: 'email',
  outbrain: 'display',
  taboola: 'display',
  criteo: 'display',
  eloqua: 'email',
  microsoft: 'display',
  marketo: 'email',
  tiktok: 'video',
  amazon: 'display',
  yandex: 'search',
  baidu: 'search',
};

const categoryTypeLookup = {
  search: 'paid',
  display: 'paid',
  affiliate: 'paid',
  local: 'paid',
  email: 'owned',
  web: 'owned',
  sms: 'owned',
  qr: 'owned',
  print: 'owned',
};

function vendor(origin) {
  return vendorClassifications
    .reduce((result, classification) => (
      !result && classification.regex.test(origin)
        ? classification.result
        : result), '');
}

function category(origin, vendorResult) {
  const categoryResult = categoryClassifications
    .reduce((result, classification) => (
      !result && classification.regex.test(origin)
        ? classification.result
        : result), '');

  if (categoryResult) return categoryResult;
  return vendorCategoryLookup[vendorResult] || '';
}

function paidowned(origin, vendorResult, categoryResult) {
  const paidOwnedResult = paidOwnedClassifications
    .reduce((result, classification) => (
      !result && classification.regex.test(origin)
        ? classification.result
        : result), '');

  if (paidOwnedResult) return paidOwnedResult;
  return vendorTypeLookup[vendorResult] || categoryTypeLookup[categoryResult] || '';
}

export function classifyAcquisition(origin, isPaid = false) {
  const vendorResult = vendor(origin);
  const categoryResult = category(origin, vendorResult);
  const paidOwnedResult = isPaid
    ? 'paid'
    : paidowned(origin, vendorResult, categoryResult);

  let result = paidOwnedResult;
  if (categoryResult || vendorResult) {
    result += `:${categoryResult}`;
  }
  if (vendorResult) {
    result += `:${vendorResult}`;
  }
  return result;
}

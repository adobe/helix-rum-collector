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
// classified with a little help from ChatGPT
// get an up-to-date lisf of unclassified bot user agents from Coralogix
// source logs
// | select $d.request.user_agent as ua, $d.rum.user_agent as ua2
// | filter $d.ua2 == 'bot'
// | groupby ua agg count() as count
// | orderby count desc;
export const bots = {
  Ads: [
    {
      user_agent: 'adbeat.com/policy',
      regex: 'adbeat.com/policy',
    },
    {
      user_agent: 'SnapchatAds/1.0',
      regex: 'SnapchatAds',
    },
  ],
  Syndication: [
    {
      user_agent: 'WordPress.com mshots',
      regex: 'WordPress.com mshots',
    },
    { user_agent: 'Drupal', regex: 'Drupal' },
  ],
  Commerce: [
    {
      user_agent: 'AmazonProductDiscovery/1.0',
      regex: 'AmazonProductDiscovery',
    },
  ],
  Quality: [
    {
      user_agent: 'Chrome-Lighthouse LighthouseMetricsWorker/11.6.0',
      regex: 'Chrome-Lighthouse LighthouseMetricsWorker',
    },
    {
      user_agent: 'PTST/SpeedCurve/230921.100924',
      regex: 'PTST/SpeedCurve',
    },
    {
      user_agent: 'Ghost Inspector',
      regex: 'Ghost Inspector',
    },
    {
      user_agent: 'OSVCLinkChecker/1.0',
      regex: 'OSVCLinkChecker',
    },
  ],
  Monitoring: [

    {
      user_agent: 'DatadogSynthetics',
      regex: 'DatadogSynthetics',
    },
    {
      user_agent: 'Catchpoint',
      regex: 'catchpoint',
    },
    {
      user_agent: 'Site24x7',
      regex: 'Site24x7',
    },
    {
      user_agent: 'PingdomPagespeed/1.0',
      regex: 'Pingdom',
    },
    {
      user_agent: 'CloudWatchSynthetics',
      regex: 'CloudWatchSynthetics',
    },
    {
      user_agent: 'PingdomTMS/2020.2',
      regex: 'PingdomTMS',
    },
    {
      user_agent: 'DatadogSynthetics',
      regex: 'DatadogSynthetics',
    },
    {
      user_agent: 'CloudWatchSynthetics',
      regex: 'CloudWatchSynthetics',
    },
    {
      user_agent: 'Site24x7',
      regex: 'Site24x7',
    },
    {
      user_agent: 'RuxitSynthetic various versions',
      regex: 'RuxitSynthetic',
    },
  ],
  Social: [
    {
      user_agent: 'facebookexternalhit/1.1',
      regex: 'facebookexternalhit',
    },
  ],
  SEO: [
    {
      user_agent: 'AhrefsBot/7.0',
      regex: 'AhrefsBot',
    },
    {
      user_agent: 'BrightEdge Crawler/1.0',
      regex: 'BrightEdge Crawler',
    },
    {
      user_agent: 'AhrefsSiteAudit/6.1',
      regex: 'AhrefsSiteAudit',
    },
    {
      user_agent: 'Screaming Frog SEO Spider/19.4',
      regex: 'Screaming Frog SEO Spider',
    },
    {
      user_agent: 'SiteAuditBot/0.97',
      regex: 'SiteAuditBot',
    },
  ],
  Search: [
    {
      user_agent: 'CoveoBot/2.0',
      regex: 'CoveoBot',
    },
    {
      user_agent: 'Algolia Crawler/v2.370.1',
      regex: 'Algolia Crawler',
    },
    {
      user_agent: 'YandexRenderResourcesBot/1.0',
      regex: 'YandexRenderResourcesBot',
    },
    {
      user_agent: 'MS-Search Crawler',
      regex: 'ms-search-crawler',
    },
    {
      user_agent: 'Bingbot/2.0 various versions',
      regex: 'bingbot',
    },
    {
      user_agent: 'Googlebot/2.1',
      regex: 'Googlebot',
    },
  ],
  Security: [
    {
      user_agent: 'Popetech-Scanbot/1.0',
      regex: 'Popetech-Scanbot',
    },
  ],
};

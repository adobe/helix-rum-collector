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
// | sort by count desc
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
    {
      user_agent: 'Storebot-Google/1.0',
      regex: 'Storebot-Google',
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
    {
      user_agent: 'TagInspector/500.1',
      regex: 'TagInspector',
    },
    {
      user_agent: 'SiteCheck-sitecrawl by Siteimprove.com',
      regex: 'Siteimprove',
    },
    {
      user_agent: 'Chrome Lighthouse',
      regex: 'chrome-lighthouse',
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
    {
      user_agent: 'StatusCake_Pagespeed_Indev',
      regex: 'StatusCake_Pagespeed',
    },
    {
      user_agent: 'One.Shop New Relic Synthetics',
      regex: 'New Relic Synthetics',
    },
    {
      user_agent: 'Splunk Synthetics',
      regex: 'Splunk Synthetics',
    },
    {
      user_agent: 'VisualMonitoring/0.1',
      regex: 'VisualMonitoring',
    },
    {
      user_agent: 'ERAMonitor',
      regex: 'ERAMonitor',
    },
    {
      user_agent: 'WatchMouse',
      regex: 'watchmouse.com',
    },
    {
      user_agent: 'Elastic/Synthetics',
      regex: 'Elastic/Synthetics',
    },
  ],
  Social: [
    {
      user_agent: 'facebookexternalhit/1.1',
      regex: 'facebookexternalhit',
    },
    {
      user_agent: 'Pinterestbot/1.0',
      regex: 'Pinterestbot',
    },
    {
      user_agent: 'Slackbot-LinkExpanding',
      regex: 'Slackbot-LinkExpanding',
    },
    {
      user_agent: 'Iframely/1.3.1',
      regex: 'Iframely',
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
    {
      user_agent: 'DeepCrawl',
      regex: 'https://deepcrawl.com/bot',
    },
    {
      user_agent: 'OnCrawl',
      regex: 'http://www.oncrawl.com',
    },
  ],
  // There is some overlap between AI and Search, and some companies like Apple,
  // Google, and Meta have many bots that are used for different purposes.
  // the repo https://github.com/ai-robots-txt/ai.robots.txt/blob/main/robots.json
  // has a longer list of AI bots, but many of them don't have enough traffic
  // to be worth adding here. In addition, the repo seems to err on the side of
  // classifying crawlers as AI bots.
  AI: [
    {
      user_agent: 'Ai2Bot-Dolma',
      regex: 'Ai2Bot-Dolma',
    },
    {
      user_agent: 'GPTBot',
      regex: 'GPTBot',
    },
    {
      user_agent: 'Claude-Web',
      regex: 'Claude-Web',
    },
    {
      user_agent: 'anthropic-ai',
      regex: 'anthropic-ai',
    },
    {
      user_agent: 'Google-Extended',
      regex: 'Google-Extended',
    },
    {
      user_agent: 'FacebookBot',
      regex: 'FacebookBot',
    },
    {
      user_agent: 'Applebot-Extended',
      regex: 'Applebot.*Extended',
    },
    {
      user_agent: 'Meta-ExternalAgent',
      regex: 'Meta-ExternalAgent',
    },
    {
      user_agent: 'PerplexityBot',
      regex: 'PerplexityBot',
    },
    {
      user_agent: 'YouBot',
      regex: 'YouBot',
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
      regex: 'Yandex',
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
    {
      user_agent: 'Applebot/0.1',
      regex: 'Applebot',
    },
    {
      user_agent: 'AddSearchBot/1.0',
      regex: 'AddSearchBot',
    },
    {
      user_agent: 'ClarityBot/9.0',
      regex: 'ClarityBot',
    },
    {
      user_agent: 'PetalBot',
      regex: 'PetalBot',
    },
    {
      user_agent: '360spider',
      regex: '360spider',
    },
    {
      user_agent: 'yisouspider',
      regex: 'yisouspider',
    },
    {
      user_agent: 'ev-crawler',
      regex: 'ev-crawler',
    },
  ],
  Security: [
    {
      user_agent: 'Popetech-Scanbot/1.0',
      regex: 'Popetech-Scanbot',
    },
    {
      user_agent: 'Detectify',
      regex: 'Detectify',
    },
    {
      user_agent: 'Probely',
      regex: 'Probely',
    },
    {
      user_agent: 'VirusTotalBot',
      regex: 'VirusTotalBot',
    },

  ],
  Compliance: [
    {
      user_agent: 'Cookiebot/1.0',
      regex: 'Cookiebot',
    },
    {
      user_agent: 'OneTrustBot',
      regex: 'OneTrustBot',
    },
    {
      user_agent: 'CookieReports.com',
      regex: 'CookieReports.com',
    },
    {
      user_agent: 'ActiveComply',
      regex: 'ActiveComply',
    },
  ],
  Archive: [
    {
      user_agent: 'PageFreezer',
      regex: 'PageFreezer',
    },
    {
      user_agent: 'mirrorweb.com',
      regex: 'mirrorweb.com',
    },
    {
      // CCBot is a bot that crawls the web to find content for the Common Crawl project
      // common crawl is used to train many AI datasets, but the bot is not an AI crawler
      // per se, so it's not included in the AI category
      user_agent: 'CCBot',
      regex: 'CCBot',
    },
  ],
  Translation: [
    {
      user_agent: 'TransSync',
      regex: 'TransSync.*motionpoint',
    },
    {
      user_agent: 'WovnCrawler',
      regex: 'WovnCrawler',
    },
  ],
};

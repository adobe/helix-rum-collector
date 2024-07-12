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
import assert from 'assert';
import { describe, it } from 'node:test';
import { classifyAcquisition } from '../src/acquisition.mjs';

describe('classifyAcquisition', () => {
  const url = 'https://some-domain.com/some/path';

  const testCases = [
    // paid:search
    { referrer: 'https://www.google.com', query: 'gclid=something', expected: 'paid:search:google' },
    { referrer: 'https://www.google.com', query: 'utm_medium=googleads', expected: 'paid:search:google' },
    { referrer: 'https://www.google.com', query: 'utm_medium=google-ads', expected: 'paid:search:google' },
    { referrer: 'https://www.google.com', query: 'utm_medium=adwords', expected: 'paid:search:google' },
    { referrer: 'https://www.google.com', query: 'utm_medium=paid', expected: 'paid:search:google' },
    { referrer: 'https://www.google.com', query: 'utm_medium=cpc', expected: 'paid:search:google' },
    { referrer: 'https://www.google.com', query: 'utm_medium=ppc', expected: 'paid:search:google' },
    { referrer: 'https://www.google.com', query: 'utm_medium=pp', expected: 'paid:search:google' },
    { referrer: 'https://www.google.com', query: 'utm_medium=paidsearch', expected: 'paid:search:google' },
    { referrer: 'https://www.google.com', query: 'utm_medium=paidsearchnb', expected: 'paid:search:google' },
    { referrer: 'https://www.google.com', query: 'utm_medium=sea', expected: 'paid:search:google' },
    { referrer: 'https://www.google.com', query: 'utm_medium=sem', expected: 'paid:search:google' },
    { referrer: 'https://www.yahoo.com', query: 'utm_medium=paidsearch', expected: 'paid:search:yahoo' },
    { referrer: 'https://www.bing.com', query: 'utm_medium=paidsearch', expected: 'paid:search:bing' },
    { referrer: 'https://www.yandex.com', query: 'utm_medium=paidsearch', expected: 'paid:search:yandex' },
    { referrer: 'https://www.baidu.com', query: 'utm_medium=paidsearch', expected: 'paid:search:baidu' },
    { referrer: 'https://duckduckgo.com', query: 'utm_medium=paidsearch', expected: 'paid:search:duckduckgo' },
    { referrer: 'https://www.brave.com', query: 'utm_medium=paidsearch', expected: 'paid:search' },
    { referrer: 'https://www.ecosia.com', query: 'utm_medium=paidsearch', expected: 'paid:search' },
    { referrer: 'https://www.aol.com', query: 'utm_medium=paidsearch', expected: 'paid:search' },
    { referrer: 'https://www.startpage.com', query: 'utm_medium=paidsearch', expected: 'paid:search' },
    { referrer: 'https://www.ask.com', query: 'utm_medium=cpm', expected: 'paid:search' },

    // paid:social
    { referrer: 'https://www.facebook.com', query: 'fbclid=something', expected: 'paid:social:facebook' },
    { referrer: 'https://www.tiktok.com', query: 'twclid=something', expected: 'paid:social:tiktok' },
    { referrer: 'https://www.pinterest.com', query: 'epik=something', expected: 'paid:social:pinterest' },
    { referrer: 'https://twitter.com', query: 'twclid=something', expected: 'paid:social:x' },

    { referrer: 'https://www.facebook.com', query: 'utm_medium=facebook', expected: 'paid:social:facebook' },
    { referrer: 'https://www.facebook.com', query: 'utm_medium=paid', expected: 'paid:social:facebook' },
    { referrer: 'https://www.facebook.com', query: 'utm_medium=cpc', expected: 'paid:social:facebook' },
    { referrer: 'https://www.facebook.com', query: 'utm_medium=ppc', expected: 'paid:social:facebook' },
    { referrer: 'https://www.facebook.com', query: 'utm_medium=pp', expected: 'paid:social:facebook' },
    { referrer: 'https://www.tiktok.com', query: 'utm_medium=paid-social', expected: 'paid:social:tiktok' },
    { referrer: 'https://www.snapchat.com', query: 'utm_medium=paid_social', expected: 'paid:social:snapchat' },
    { referrer: 'https://x.com', query: 'utm_medium=paidsocial', expected: 'paid:social' },
    { referrer: 'https://twitter.com', query: 'utm_medium=social', expected: 'paid:social:x' },
    { referrer: 'https://www.pinterest.com', query: 'utm_medium=paidsearch', expected: 'paid:social:pinterest' },
    { referrer: 'https://www.linkedin.com', query: 'utm_medium=sociallinkedin', expected: 'paid:social:linkedin' },
    { referrer: 'https://www.threads.com', query: 'utm_medium=socialpaid', expected: 'paid:social' },
    { referrer: 'https://www.quora.com', query: 'utm_medium=paidsearch', expected: 'paid:social' },
    { referrer: 'https://www.discord.com', query: 'utm_medium=banner', expected: 'paid:social' },
    { referrer: 'https://www.tumblr.com', query: 'utm_medium=placement', expected: 'paid:social' },
    { referrer: 'https://mastodon.social', query: 'utm_medium=paidsearch', expected: 'paid:social' },
    { referrer: 'https://www.bluesky.com', query: 'utm_medium=paidsearch', expected: 'paid:social' },
    { referrer: 'https://www.instagram.com', query: 'utm_medium=cpm', expected: 'paid:social:instagram' },
    { referrer: 'https://www.reddit.com', query: 'utm_medium=cpc', expected: 'paid:social:reddit' },

    // paid:video
    { referrer: 'https://www.youtube.com', query: 'gclid=something', expected: 'paid:video:youtube' },
    { referrer: 'https://www.youtube.com', query: 'utm_medium=cpc', expected: 'paid:video:youtube' },
    { referrer: 'https://www.youtube.com', query: 'utm_medium=ppc', expected: 'paid:video:youtube' },
    { referrer: 'https://www.youtube.com', query: 'utm_medium=pp', expected: 'paid:video:youtube' },
    { referrer: 'https://www.vimeo.com', query: 'utm_medium=cpc', expected: 'paid:video' },
    { referrer: 'https://www.dailymotion.com', query: 'utm_medium=ppc', expected: 'paid:video' },
    { referrer: 'https://www.wistia.com', query: 'utm_medium=paid', expected: 'paid:video' },
    { referrer: 'https://www.youtube.com', query: 'utm_medium=dv360', expected: 'paid:video:youtube' },
    { referrer: 'https://www.youtube.com', query: 'utm_medium=video', expected: 'paid:video:youtube' },
    { referrer: 'https://www.amazon.com', query: 'utm_medium=ctv', expected: 'paid:video:amazon' },

    // paid:display
    { referrer: 'https://hebele.hebele.googlesyndication.com/', query: '', expected: 'paid:display:google' },
    { referrer: 'https://something.2mdn.com', query: '', expected: 'paid:display:google' },
    { referrer: 'https://www.spotify.com', query: '', expected: 'paid:display:spotify' },
    { referrer: 'https://www.taboola.com', query: 'utm_medium=cpc', expected: 'paid:display:taboola' },
    { referrer: 'https://www.outbrain.com', query: 'utm_medium=cpc', expected: 'paid:display:outbrain' },
    { referrer: 'https://www.criteo.com', query: 'utm_medium=cpc', expected: 'paid:display:criteo' },
    { referrer: 'https://www.unknown-domain.com', query: 'utm_medium=cpc', expected: 'paid:display' },
    { referrer: 'https://www.unknown-domain.com', query: 'utm_medium=ppc', expected: 'paid:display' },
    { referrer: 'https://www.unknown-domain.com', query: 'utm_medium=pp', expected: 'paid:display' },
    { referrer: 'https://www.unknown-domain.com', query: 'utm_medium=banner', expected: 'paid:display' },
    { referrer: 'https://www.unknown-domain.com', query: 'utm_medium=paid', expected: 'paid:display' },
    { referrer: 'https://www.unknown-domain.com', query: 'utm_medium=placement', expected: 'paid:display' },
    { referrer: 'https://www.unknown-domain.com', query: 'utm_medium=dbm', expected: 'paid:display' },
    { referrer: 'https://www.unknown-domain.com', query: 'utm_source=gdn', expected: 'paid:display' },

    // paid affiliate
    { referrer: 'https://www.instagram.com', query: 'utm_medium=affiliate', expected: 'paid:affiliate:instagram' },
    { referrer: 'https://www.tiktok.com', query: 'utm_medium=affiliatemarketing', expected: 'paid:affiliate:tiktok' },
    { referrer: 'https://www.unknown-domain.com', query: 'utm_medium=affiliatemarketing', expected: 'paid:affiliate' },

    // paid local
    { referrer: 'https://www.google.com', query: 'utm_medium=gmb', expected: 'paid:local:google' },

    // earned search
    { referrer: 'https://www.google.com', query: '', expected: 'earned:search:google' },
    { referrer: 'https://www.google.com', query: 'utm_medium=unknown', expected: 'earned:search:google' },
    { referrer: 'https://www.yahoo.com', query: '', expected: 'earned:search:yahoo' },
    { referrer: 'https://www.bing.com', query: '', expected: 'earned:search:bing' },
    { referrer: 'https://www.yandex.com', query: '', expected: 'earned:search:yandex' },
    { referrer: 'https://www.baidu.com', query: '', expected: 'earned:search:baidu' },
    { referrer: 'https://duckduckgo.com', query: '', expected: 'earned:search:duckduckgo' },
    { referrer: 'https://www.brave.com', query: '', expected: 'earned:search' },
    { referrer: 'https://www.ecosia.com', query: '', expected: 'earned:search' },
    { referrer: 'https://www.aol.com', query: '', expected: 'earned:search' },
    { referrer: 'https://www.startpage.com', query: '', expected: 'earned:search' },
    { referrer: 'https://www.ask.com', query: '', expected: 'earned:search' },

    // earned social
    { referrer: 'https://www.facebook.com', query: '', expected: 'earned:social:facebook' },
    { referrer: 'https://www.tiktok.com', query: '', expected: 'earned:social:tiktok' },
    { referrer: 'https://www.snapchat.com', query: '', expected: 'earned:social:snapchat' },
    { referrer: 'https://x.com', query: '', expected: 'earned:social' },
    { referrer: 'https://twitter.com', query: '', expected: 'earned:social:x' },
    { referrer: 'https://www.pinterest.com', query: '', expected: 'earned:social:pinterest' },
    { referrer: 'https://www.linkedin.com', query: '', expected: 'earned:social:linkedin' },
    { referrer: 'https://www.threads.com', query: '', expected: 'earned:social' },
    { referrer: 'https://www.quora.com', query: '', expected: 'earned:social' },
    { referrer: 'https://www.unknown-domain.com', query: 'utm_medium=organicsocial', expected: 'earned:social' },

    // earned video
    { referrer: 'https://www.youtube.com', query: '', expected: 'earned:video:youtube' },
    { referrer: 'https://www.vimeo.com', query: '', expected: 'earned:video' },
    { referrer: 'https://www.dailymotion.com', query: '', expected: 'earned:video' },
    { referrer: 'https://www.wistia.com', query: '', expected: 'earned:video' },
    { referrer: 'https://www.youtube.com', query: 'utm_medium=unknown', expected: 'earned:video:youtube' },

    // earned referral
    { referrer: 'https://www.unknown-domain.com', query: '', expected: 'earned:referral' },

    // owned direct
    { referrer: '', query: '', expected: 'owned:direct' },

    // owned internal
    { referrer: 'https://some-domain.com/', query: '', expected: 'owned:internal' },

    // owned email
    { referrer: '', query: 'utm_medium=email', expected: 'owned:email' },
    { referrer: '', query: 'utm_medium=mail', expected: 'owned:email' },
    { referrer: 'https://www.eloqua.com', query: 'utm_medium=newsletter', expected: 'owned:email:eloqua' },
    { referrer: '', query: 'mc_eid=something', expected: 'owned:email' },
    { referrer: 'https://www.marketo.com', query: 'mc_cid=something', expected: 'owned:email:marketo' },
    { referrer: 'https://www.unknown-domain.com', query: 'mkt_tok=something', expected: 'owned:email' },

    // owned sms
    { referrer: '', query: 'utm_medium=sms', expected: 'owned:sms' },
    { referrer: '', query: 'utm_medium=mms', expected: 'owned:sms' },

    // owned qr
    { referrer: '', query: 'utm_medium=qr', expected: 'owned:qr' },
    { referrer: '', query: 'utm_medium=qrcode', expected: 'owned:qr' },

    // owned push
    { referrer: '', query: 'utm_medium=push', expected: 'owned:push' },
    { referrer: '', query: 'utm_medium=pushnotification', expected: 'owned:push' },

    // owned uncategorized
    { referrer: 'some-referrer', query: 'utm_medium=some', expected: 'owned:uncategorized' },
    { referrer: '', query: 'utm_medium=some', expected: 'owned:uncategorized' },
  ];

  testCases
    .forEach(({ referrer, query, expected }) => {
      it(`should classify "Ref: '${referrer}', Query: '${query}'" as "${expected}"`, () => {
        assert.strictEqual(classifyAcquisition(url, referrer, query), expected);
      });
    });

  it('Error handling', () => {
    assert.strictEqual(classifyAcquisition('invalid-url'), 'owned:uncategorized');
  });
});

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
/* eslint-env mocha */
import assert from 'assert';
import {
  cleanurl, extractAdobeRoutingInfo, getForwardedHost, getMaskedUserAgent, getSubsystem, maskTime,
} from '../src/utils.mjs';

describe('Test Utils', () => {
  it('Mask the time', () => {
    const now = Date.now();
    const nearestHour = Math.floor(now / 3600000) * 3600000;
    const timePadding = 12345;

    assert.equal(nearestHour + timePadding, maskTime(now, timePadding));
  });

  it('Mask the time if timepadding is a string', () => {
    const now = Date.now();
    const nearestHour = Math.floor(now / 3600000) * 3600000;
    const timePadding = '12345';

    assert.equal(nearestHour + 12345, maskTime(now, timePadding));
  });

  it('Limit the masked time', () => {
    const now = Date.now();
    const nearestHour = Math.floor(now / 3600000) * 3600000;
    const timePadding = (24 * 3600000) + 789;

    assert.equal(nearestHour + (24 * 3600000), maskTime(now, timePadding));
  });

  it('Use current second if padding is missing', () => {
    const sometime = new Date(2023, 8, 6, 15, 45, 27, 999);

    const expectedTime = new Date(2023, 8, 6, 15, 0, 27).getTime();
    const masked = maskTime(sometime);
    assert.equal(expectedTime, masked);
  });

  it('Use current second if padding is not a number', () => {
    const sometime = new Date(2023, 8, 6, 15, 45, 27, 999);

    const expectedTime = new Date(2023, 8, 6, 15, 0, 27).getTime();
    const masked = maskTime(sometime, 'hello');
    assert.equal(expectedTime, masked);
  });

  function getUserAgentHeaders(ua) {
    const headers = new Map();
    headers.set('user-agent', ua);
    return headers;
  }

  it('Mask user agent', () => {
    assert.equal('mobile', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1')));
    assert.equal('mobile', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/20G75 [FBAN/FBIOS;FBDV/iPad11,3;FBMD/iPad;FBSN/iPadOS;FBSV/16.6;FBSS/2;FBID/tablet;FBLC/en_US;FBOP/5];FBNV/1')));
    assert.equal('mobile', getMaskedUserAgent(getUserAgentHeaders('Opera/9.80 (SpreadTrum; Opera Mini/4.4.33961/191.315; U; fr) Presto/2.12.423 Version/12.16')));

    assert.equal('bot', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)')));
    assert.equal('bot', getMaskedUserAgent(getUserAgentHeaders('"Mozilla/5.0 (compatible; HubSpot Crawler; +https://www.hubspot.com)"')));
    assert.equal('bot', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36 PingdomPageSpeed/1.0 (pingbot/2.0; +http://www.pingdom.com/)')));
    assert.equal('bot', getMaskedUserAgent(getUserAgentHeaders('AHC/2.1')));

    assert.equal('desktop', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.5563.64 Safari/537.36')));
    assert.equal('desktop', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Sidekick/6.30.0')));
    assert.equal('desktop', getMaskedUserAgent(getUserAgentHeaders('Opera/12.0(Windows NT 5.2;U;en)Presto/22.9.168 Version/12.00')));
    assert.equal('desktop', getMaskedUserAgent(getUserAgentHeaders('foobar')));

    assert.equal('undefined', getMaskedUserAgent(new Map()));
    assert.equal('undefined', getMaskedUserAgent());
  });

  it('Mask user agent CloudFront', () => {
    const hm1 = new Map();
    hm1.set('CloudFront-Is-Desktop-Viewer', 'true');
    assert.equal('desktop', getMaskedUserAgent(hm1));

    const hm2 = new Map();
    hm2.set('CloudFront-Is-Mobile-Viewer', 'true');
    assert.equal('mobile', getMaskedUserAgent(hm2));

    const hm3 = new Map();
    hm3.set('CloudFront-Is-SmartTV-Viewer', 'true');
    assert.equal('desktop', getMaskedUserAgent(hm3));

    const hm4 = new Map();
    hm4.set('CloudFront-Is-Tablet-Viewer', 'true');
    assert.equal('mobile', getMaskedUserAgent(hm4));
  });

  it('Cleaning of URLs', () => {
    assert.equal('http://foo.bar.com/test', cleanurl('http://foo.bar.com/test#my-fragment'));
    assert.equal('http://foo.bar.com/test', cleanurl('http://foo.bar.com/test?foo=bar'));
    assert.equal('http://foo.bar.com/test', cleanurl('http://foo.bar.com/test?foo=bar#with-fragment'));
    assert.equal('http://foo.bar.com:9091/test', cleanurl('http://someone:something@foo.bar.com:9091/test'));
  });

  it('Get Forwarded Host', () => {
    assert.equal('test--test--test.hlx.live', getForwardedHost('www.blah.blah,test--test--test.hlx.live'));
    assert.equal('test--the--domain.hlx.live', getForwardedHost('www.blah.blah, test--the--domain.hlx.live, foo.hlx.live '));
    assert.equal('main--helix-website--adobe.aem.live', getForwardedHost('www.aem.live, main--helix-website--adobe.aem.live'));
    assert.equal('www.blah.blah', getForwardedHost('www.blah.blah,test.hlx.co.uk'));
    assert.equal('www.blah.blah', getForwardedHost(' www.blah.blah '));
    assert.equal('www.foobar.aemcloud.net', getForwardedHost('www.foobar.aemcloud.net'));
    assert.equal('www.blah.blah', getForwardedHost('www.blah.blah,test.myaem.net'));
    assert.equal('www.blah.blah', getForwardedHost('www.blah.blah,test.somehlx.live'));
    assert.equal('p1234-e5678.aem.net', getForwardedHost('www.blah.blah, p1234-e5678.aem.net , www.hah.hah'));
    assert.equal(
      'author-p12334-e56789.adobeaemcloud.net',
      getForwardedHost('www.foo.net, author-p12334-e56789.adobeaemcloud.net'),
    );
    assert.equal('', getForwardedHost(''));
  });

  it('Extract Adobe Routing Info', () => {
    assert.equal('publish-p12345-e1234.adobeaemcloud.net', extractAdobeRoutingInfo('environment=1234,program=12345,tier=publish,foo=baz'));
  });

  it('Get Subsystem', () => {
    const headers = new Map();
    assert.equal('undefined', getSubsystem({
      headers,
    }));

    headers.set('host', 'www.blah.blah');
    assert.equal('www.blah.blah', getSubsystem({
      headers,
    }));

    headers.set('x-forwarded-host', 'www.blah.test');
    assert.equal('www.blah.test', getSubsystem({
      headers,
    }));

    headers.set('x-adobe-routing', 'environment=1234,program=12345,tier=publish,foo=baz');
    assert.equal('publish-p12345-e1234.adobeaemcloud.net', getSubsystem({
      headers,
    }));
  });
});

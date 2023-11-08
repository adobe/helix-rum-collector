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
import { cleanurl, getMaskedUserAgent, maskTime } from '../src/utils.mjs';

describe('Test Utils', () => {
  it('Mask the time', () => {
    const now = Date.now();
    const nearestHour = Math.floor(now / 3600000) * 3600000;
    const timePadding = 12345;

    assert.equal(nearestHour + timePadding, maskTime(now, timePadding));
  });

  it('Limit the masked time', () => {
    const now = Date.now();
    const nearestHour = Math.floor(now / 3600000) * 3600000;
    const timePadding = 9999999;

    assert.equal(nearestHour + 3600000, maskTime(now, timePadding));
  });

  it('Use current second if padding is missing', () => {
    const sometime = new Date(2023, 8, 6, 15, 45, 27, 999);

    const expectedTime = new Date(2023, 8, 6, 15, 0, 27).getTime();
    const masked = maskTime(sometime);
    assert.equal(expectedTime, masked);
  });

  it('Mask user agent', () => {
    assert.equal('mobile', getMaskedUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'));
    assert.equal('mobile', getMaskedUserAgent('Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/20G75 [FBAN/FBIOS;FBDV/iPad11,3;FBMD/iPad;FBSN/iPadOS;FBSV/16.6;FBSS/2;FBID/tablet;FBLC/en_US;FBOP/5];FBNV/1'));
    assert.equal('mobile', getMaskedUserAgent('Opera/9.80 (SpreadTrum; Opera Mini/4.4.33961/191.315; U; fr) Presto/2.12.423 Version/12.16'));

    assert.equal('bot', getMaskedUserAgent('Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)'));
    assert.equal('bot', getMaskedUserAgent('"Mozilla/5.0 (compatible; HubSpot Crawler; +https://www.hubspot.com)"'));
    assert.equal('bot', getMaskedUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36 PingdomPageSpeed/1.0 (pingbot/2.0; +http://www.pingdom.com/)'));
    assert.equal('bot', getMaskedUserAgent('AHC/2.1'));

    assert.equal('desktop', getMaskedUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.5563.64 Safari/537.36'));
    assert.equal('desktop', getMaskedUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Sidekick/6.30.0'));
    assert.equal('desktop', getMaskedUserAgent('Opera/12.0(Windows NT 5.2;U;en)Presto/22.9.168 Version/12.00'));
    assert.equal('desktop', getMaskedUserAgent('foobar'));

    assert.equal('undefined', getMaskedUserAgent());
  });

  it('Cleaning of URLs', () => {
    assert.equal('http://foo.bar.com/test', cleanurl('http://foo.bar.com/test#my-fragment'));
    assert.equal('http://foo.bar.com/test', cleanurl('http://foo.bar.com/test?foo=bar'));
    assert.equal('http://foo.bar.com/test', cleanurl('http://foo.bar.com/test?foo=bar#with-fragment'));
    assert.equal('http://foo.bar.com:9091/test', cleanurl('http://someone:something@foo.bar.com:9091/test'));
  });
});

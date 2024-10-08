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
import { it, describe } from 'node:test';
import {
  cleanurl,
  extractAdobeRoutingInfo,
  getForwardedHost,
  getMaskedUserAgent,
  getSubsystem,
  isValidId,
  maskTime,
  sourceTargetValidator,
  bloatControl,
} from '../src/utils.mjs';

describe('Test Utils', () => {
  it('Bloat control', () => {
    assert.equal('{}', bloatControl({}));
    assert.equal('[]', bloatControl([]));
    assert.equal('{"lorem":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ac molestie ex. Suspendisse a imperdiet enim. Nulla tempor, tellus volutpat dictum auctor, purus justo consequat felis, sit amet condimentum odio urna ornare dolor. Pellentesque eget ultrices libero. Suspendisse quis diam eu augue consectetur lobortis at et leo. Quisque efficitur sit amet sem id aliquet. In hac habitasse platea dictumst. Maecenas sed orci tincidunt, tempus diam lobortis, egestas nibh. Nulla arcu purus, fermentum vitae augue vel, sodales porttitor arcu. Quisque iaculis porttitor lectus, id rhoncus arcu sollicitudin lobortis.\\n\\nMauris massa leo, feugiat ac congue sit amet, auctor id arcu. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum hendrerit urna sit amet quam accumsan consequat quis id diam. Morbi scelerisque a diam in mollis. Ut at convallis diam, a accumsan sem. Curabitur molestie sem nec orci mattis, ut convallis metus pellentesque. Morbi vitae erat felis. Curabitur purus n…"}', bloatControl({
      lorem: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ac molestie ex. Suspendisse a imperdiet enim. Nulla tempor, tellus volutpat dictum auctor, purus justo consequat felis, sit amet condimentum odio urna ornare dolor. Pellentesque eget ultrices libero. Suspendisse quis diam eu augue consectetur lobortis at et leo. Quisque efficitur sit amet sem id aliquet. In hac habitasse platea dictumst. Maecenas sed orci tincidunt, tempus diam lobortis, egestas nibh. Nulla arcu purus, fermentum vitae augue vel, sodales porttitor arcu. Quisque iaculis porttitor lectus, id rhoncus arcu sollicitudin lobortis.

Mauris massa leo, feugiat ac congue sit amet, auctor id arcu. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum hendrerit urna sit amet quam accumsan consequat quis id diam. Morbi scelerisque a diam in mollis. Ut at convallis diam, a accumsan sem. Curabitur molestie sem nec orci mattis, ut convallis metus pellentesque. Morbi vitae erat felis. Curabitur purus nulla, tempus non arcu ut, convallis euismod justo. Etiam hendrerit risus ligula, a mattis libero placerat eu. Proin interdum elit quam. In sit amet dictum sapien. Duis tempor vulputate tellus. Nam fermentum ligula a nibh facilisis, et eleifend mi euismod.

Pellentesque viverra id magna vel varius. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec porta quis mauris sit amet aliquet. Duis non nulla sed metus sagittis condimentum. Nam rhoncus, risus et gravida tempus, nibh diam pellentesque tellus, vel accumsan arcu nibh in lorem. Pellentesque eu semper ipsum, ac lacinia ante. Phasellus neque urna, laoreet eu purus id, interdum tristique turpis. Nulla pretium fermentum elit non tristique. Aliquam ut orci elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed a pulvinar urna. Nunc vel augue ultrices, aliquet sapien eget, ornare sem. Etiam sagittis porttitor arcu vitae tristique. Praesent tempus neque ac vehicula viverra. Donec justo nibh, faucibus a rhoncus nec.`,
    }));

    assert.equal('{"LCP":1234,"INP":2345,"CLS":0.789,"TTFB":1234}', bloatControl({
      LCP: 1234.5678,
      INP: 2345.6789,
      CLS: 0.7890,
      TTFB: 1234.5678,
    }));

    // what is neither a string nor a number nor an array nor an object gets stringified as is
    assert.equal('true', bloatControl(true));
  });

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

    const expectedTime = new Date(2023, 8, 6, 15, 0, 27, 999).getTime();
    const masked = maskTime(sometime);
    assert.equal(expectedTime, masked);
  });

  it('Use current second if padding is not a number', () => {
    const sometime = new Date(2023, 8, 6, 15, 45, 27, 999);

    const expectedTime = new Date(2023, 8, 6, 15, 0, 27, 999).getTime();
    const masked = maskTime(sometime, 'hello');
    assert.equal(expectedTime, masked);
  });

  function getUserAgentHeaders(ua) {
    const headers = new Map();
    headers.set('user-agent', ua);
    return headers;
  }

  it('Mask user agent', () => {
    assert.equal('mobile:ios', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1')));
    assert.equal('mobile:ipados', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/20G75 [FBAN/FBIOS;FBDV/iPad11,3;FBMD/iPad;FBSN/iPadOS;FBSV/16.6;FBSS/2;FBID/tablet;FBLC/en_US;FBOP/5];FBNV/1')));
    assert.equal('mobile', getMaskedUserAgent(getUserAgentHeaders('Opera/9.80 (SpreadTrum; Opera Mini/4.4.33961/191.315; U; fr) Presto/2.12.423 Version/12.16')));
    assert.equal('mobile:android', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36')));

    assert.equal('bot', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)')));
    assert.equal('bot', getMaskedUserAgent(getUserAgentHeaders('"Mozilla/5.0 (compatible; HubSpot Crawler; +https://www.hubspot.com)"')));
    assert.equal('bot:monitoring', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36 PingdomPageSpeed/1.0 (pingbot/2.0; +http://www.pingdom.com/)')));
    assert.equal('bot', getMaskedUserAgent(getUserAgentHeaders('AHC/2.1')));
    assert.equal('bot:monitoring', getMaskedUserAgent(getUserAgentHeaders('mozilla/5.0 (x11; linux x86_64) applewebkit/537.36 (khtml, like gecko) chrome/123.0.6312.122 safari/537.36 datadogsynthetics')));
    assert.equal('bot:seo', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) https://deepcrawl.com/bot')));
    assert.equal('bot:search', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')));

    assert.equal('desktop:windows', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.5563.64 Safari/537.36')));
    assert.equal('desktop:mac', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Sidekick/6.30.0')));
    assert.equal('desktop:windows', getMaskedUserAgent(getUserAgentHeaders('Opera/12.0(Windows NT 5.2;U;en)Presto/22.9.168 Version/12.00')));
    assert.equal('desktop:chromeos', getMaskedUserAgent(getUserAgentHeaders('Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36')));
    assert.equal('desktop', getMaskedUserAgent(getUserAgentHeaders('foobar')));

    assert.equal('bot:monitoring', getMaskedUserAgent(new Map().set('x-newrelic-id', 'VQcPU1ZQGwYEXVZUBwY=')));

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
    // jwt tokens in URLs are discarded
    assert.equal(cleanurl('https://www.example.com/eyJmYWtlIjogdHJ1ZX0.eyJmYWtlIjogdHJ1ZX0.c3VwZXJmYWtl/auth'), 'https://www.example.com/%3Cjwt%3E/auth');
    assert.equal(cleanurl(123), 123);
    assert.equal(cleanurl(''), '');
    assert.equal(cleanurl(null), null);
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
    assert.equal('undefined-pundefined-eundefined.adobeaemcloud.net', extractAdobeRoutingInfo('nope'));
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

    assert.equal('publish-p12345-e1234.adobeaemcloud.net', getSubsystem({
      url: 'http://www.blah.com?routing=environment=1234,program=12345,tier=publish,foo=baz',
      headers: new Map(),
    }));
  });

  describe('Source & Target validators', () => {
    describe('audience', () => {
      it('has a validator for the "audience" checkpoint', () => {
        assert.ok(sourceTargetValidator.audience);
      });

      it('validates that source and target are proper identifiers', () => {
        assert.ok(sourceTargetValidator.audience('foo', 'foo'));
        assert.ok(sourceTargetValidator.audience('f-o-o', 'f-o-o'));
        assert.ok(sourceTargetValidator.audience('f_o_o', 'f_o_o'));
        assert.ok(sourceTargetValidator.audience('f00', 'f00'));
        assert.ok(sourceTargetValidator.audience('foo', 'foo:bar:baz'));
        assert.ok(sourceTargetValidator.audience('default', 'foo:bar:baz'));

        assert.ok(!sourceTargetValidator.audience('foo', 'bar:baz'));
        assert.ok(!sourceTargetValidator.audience('foo bar', 'baz qux'));
        assert.ok(!sourceTargetValidator.audience('foo!', 'foo!'));
      });
    });

    describe('experiment', () => {
      it('has a validator for the "experiment" checkpoint', () => {
        assert.ok(sourceTargetValidator.experiment);
      });

      it('validates that source and target are proper identifiers', () => {
        assert.ok(sourceTargetValidator.experiment('foo', 'bar'));
        assert.ok(sourceTargetValidator.experiment('f-o-o', 'b-a-r'));
        assert.ok(sourceTargetValidator.experiment('f_o_o', 'b_a_r'));
        assert.ok(sourceTargetValidator.experiment('f00', 'b4r'));

        assert.ok(!sourceTargetValidator.experiment('foo', 'bar:baz'));
        assert.ok(!sourceTargetValidator.experiment('foo bar', 'baz qux'));
        assert.ok(!sourceTargetValidator.experiment('foo!', 'bar?'));
      });
    });
  });

  it('id validation', () => {
    // unhappy path
    assert.strictEqual(isValidId(), false);
    assert.strictEqual(isValidId(null), false);
    assert.strictEqual(isValidId(123), false);
    assert.strictEqual(isValidId({}), false);
    assert.strictEqual(isValidId(''), false);
    assert.strictEqual(isValidId('(some command)'), false);
    assert.strictEqual(isValidId('"and/*!sleep/*aa*/*/(7)#'), false);

    // happy path
    assert.strictEqual(isValidId('a'), true);
    assert.strictEqual(isValidId('aAsaAF13'), true);
    assert.strictEqual(isValidId('aAs-aA-F13-'), true);
  });
});

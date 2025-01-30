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

import knownUserAgents from './fixtures/user-agents.json' with { type: 'json' };

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
    assert.equal('bot:monitoring', getMaskedUserAgent(new Map().set('x-newrelic-id', 'VQcPU1ZQGwYEXVZUBwY=')));

    assert.equal('undefined', getMaskedUserAgent(new Map()));
    assert.equal('undefined', getMaskedUserAgent());
  });

  describe('Mask and classify user agents', () => {
    knownUserAgents.forEach(({ desc, ua, expected }) => {
      it(`${desc}: classified as "${expected}"`, () => {
        assert.equal(getMaskedUserAgent(getUserAgentHeaders(ua)), expected);
      });
    });
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
    assert.equal('author.dev.12345.adobecqms.net', extractAdobeRoutingInfo('tier=author,env=dev,ams=12345'));
    assert.equal('publish.prod.our--customer--ids-can-be-unreasonably-long--they-aren-t-ids--b.adobecqms.net', extractAdobeRoutingInfo('tier=publish,env=prod,ams=Our (Customer) IDs can be unreasonably long. They aren\'t IDs, but really names.'));
    assert.equal('12345.adobecommerce.net', extractAdobeRoutingInfo('commerce=12345'));
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

/*
 * Copyright 2025 Adobe. All rights reserved.
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
import { cleanPath } from '../src/privacy.mjs';

// List of common words
export const commonWords = [
  'other', 'there', 'which', 'their', 'about', 'write', 'would', 'these', 'thing', 'could',
  'number', 'sound', 'people', 'water', 'first', 'place', 'after', 'little', 'round', 'year',
  'bring', 'every', 'great', 'think', 'right', 'state', 'three', 'small', 'again', 'point',
  'world', 'build', 'stand', 'should', 'found', 'answer', 'still', 'learn', 'cover', 'between',
  'state', 'never', 'thought', 'cross', 'story', 'three', 'large', 'spell', 'even', 'again',
  'land', 'there', 'under', 'through', 'before', 'might', 'right', 'little', 'house', 'picture',
  'again', 'mother', 'earth', 'father', 'stand', 'should', 'country', 'school', 'plant', 'cover',
  'between', 'state', 'begin', 'walk', 'paper', 'group', 'always', 'music', 'those', 'often',
  'until', 'river', 'second', 'carry', 'science', 'friend', 'began', 'mountain', 'number', 'present',
  'follow', 'picture', 'again', 'animal', 'mother', 'world', 'build', 'father', 'stand', 'own',
  'should', 'country', 'found', 'answer', 'school', 'ground', 'study', 'still', 'learn', 'plant',
  'cover', 'between', 'state', 'never', 'thought', 'start', 'story', 'again', 'three', 'spell',
  'large', 'even', 'again', 'there', 'ready', 'above', 'ever', 'list', 'though', 'watch',
  'color', 'face', 'enough', 'plain', 'usual', 'young', 'ready', 'above', 'whole', 'space',
  'heard', 'better', 'during', 'remember', 'early', 'ground', 'interest', 'reach', 'listen', 'travel',
  'morning', 'simple', 'toward', 'pattern', 'center', 'person', 'money', 'appear', 'figure', 'object',
  'decide', 'surface', 'system', 'record', 'common', 'golden', 'possible', 'wonder', 'laugh', 'thousand',
  'check', 'shape', 'equate', 'choose', 'bring', 'distant', 'language', 'among', 'friend', 'window',
  'summer', 'train', 'forest', 'exercise', 'mount', 'yesterday', 'winter', 'instrument', 'window', 'forest',
  'number', 'future', 'method', 'organ', 'separate', 'please', 'locate', 'period', 'indicate', 'radio',
  'spoke', 'human', 'effect', 'expect', 'modern', 'student', 'corner', 'supply', 'imagine', 'provide',
  'danger', 'thick', 'process', 'operate', 'soldier', 'create', 'rather', 'search', 'compare', 'string',
  'famous', 'dollar', 'stream', 'sight', 'triangle', 'hurry', 'clock', 'major', 'fresh', 'search',
  'yellow', 'allow', 'print', 'success', 'company', 'subtract', 'event', 'particular', 'opposite', 'shoulder',
  'spread', 'invent', 'cotton', 'determine', 'chance', 'gather', 'stretch', 'throw', 'shine', 'column',
  'select', 'repeat', 'require', 'prepare', 'oxygen', 'sugar', 'pretty', 'season', 'silver', 'branch',
  'suffix', 'afraid', 'sister', 'steel', 'discuss', 'similar', 'experience', 'valley', 'double', 'arrive',
  'master', 'division', 'substance', 'connect', 'spend', 'glance', 'original', 'charge', 'proper', 'segment',
  'instant', 'degree', 'popula', 'liquid', 'quotient', 'shell', 'equal', 'choose', 'collect', 'gentle',
  'woman', 'captain', 'practice', 'separate', 'difficult', 'doctor', 'please', 'protect', 'whose', 'locate',
  'radio', 'atomic', 'history', 'effect', 'modern', 'human', 'number', 'school', 'office', 'figure',
  'garden', 'equal', 'decide', 'choice', 'winter', 'yellow', 'circle', 'energy', 'method', 'object',
  'decide', 'global', 'almost', 'things', 'others', 'review', 'online', 'rights', 'autumn', 'worlds',
  'orange', 'battle', 'latest', 'salary', 'because', 'within', 'beyond', 'public', 'social', 'health',
  'around', 'inside', 'across', 'future', 'memory', 'credit', 'agency', 'source', 'status', 'series',
  'global', 'mobile', 'action', 'married', 'couple', 'player', 'option',
];

// List of quasi-PNRs
export const quasiPNRs = [
  'TRCSER', 'ZTJSPR', 'UDDKHA', 'YBNMBR', 'LPLVVK', 'BNCHHG', 'XCFHVB', 'XDOHND', 'ZXMPQM', 'PUYVBI',
  'XUNFOI', 'JWBVZZ', 'YXCCIL', 'QSCRHF', 'VTRQED', 'SRSBUT', 'ARAFZH', 'WNGYXY', 'XMRZQX', 'SDHIXX',
  'TVPJBU', 'ZHXLDF', 'PAJQJZ', 'FDNCXL', 'SMJLSM', 'HQOQFT', 'TMYBBD', 'AYNYXR', 'AYCWUK', 'NGTMNK',
  'TXLXKS', 'YSZJBV', 'RXRCEZ', 'ZMWCWY', 'NRIBOW', 'QQDUWO', 'NMPXQM', 'RVGJOY', 'NCIPHF', 'VQZMOR',
  'RMUYEM', 'SOQRVD', 'WURRHL', 'UZXXJR', 'VOKRQD', 'NYTEQR', 'FWHHDJ', 'RKIBRF', 'BXDGPF', 'UQMLHN',
  'QWQPSS', 'VUUZLP', 'NSLFUG', 'TDZHJM', 'WWEAFV', 'FPODMG', 'RJKKHT', 'HKKKEA', 'UEAINR', 'BQYGFQ',
  'YOWAZO', 'XCGDGF', 'TQCAZS', 'FVWZJW', 'XMOIFC', 'QQAOHK', 'SXXHSB', 'ZVMRJA', 'Fjguyn', 'UOCLOQ',
  'AZNSAS', 'QKBHVW', 'HTYZZL', 'FHRFFL', 'SETBHQ', 'LDZCKT', 'QTZIDZ', 'DZUOAX', 'DIKXJP', 'DAEXZK',
  'STZNNF', 'WTRVUH', 'HHAQWL', 'PIXDEX', 'PIXPZE', 'WGQZPS', 'WHYOWW', 'APEBTL', 'RCVZGU', 'ZAOBAR',
  'ZZPMSX', 'ZBKYYE', 'WIRHDV', 'JHGXYX', 'TPVASL', 'RGVOPK', 'BDSJCY', 'VESWML', 'SALTHS', 'LHUFOV',
  'YJHNJG', 'JNARJL', 'NQSATR', 'TCNOFO', 'TRVXDX', 'JBOTKP', 'HCFNJN', 'BGQBUJ', 'YLAZCF', 'RPNRVN',
  'UUOILJ', 'LSAGVZ', 'TZTFAH', 'QLIMDK', 'YFVSET', 'DPDSKB', 'WFNAKL', 'REWFJM', 'SDXGXM', 'HDHDJR',
  'XEPNHG', 'NMXYAE', 'FCVOXZ', 'NVPMEH', 'HCMNJV', 'RXXOCZ', 'JTXJVI', 'JPQJIX', 'VYHLRY', 'YIDUDP',
  'UFRUCD', 'NCQPXY', 'NQUMPH', 'HAYRHK', 'USQCJF', 'AVUQPD', 'FRDTLD', 'DAXKFY', 'RTEUQU', 'UWYBOI',
  'NWMYXV', 'ALVZWA', 'FHAKMQ', 'JCBTMI', 'DCDUFR', 'VRBCSR', 'ZNLBQQ', 'HPCCET', 'QUZZUL', 'LBRIUQ',
  'XRWIPK', 'WHGORD', 'DTPIBR', 'NXIFQI', 'ZFONIX', 'YbcGlp', 'BIFWKK', 'WSLYQN', 'DYJRNQ', 'ZSFTOT',
  'HVUNYO', 'HDZDKG', 'WDNMWY', 'ZJIOUB', 'VHHDGO', 'LPWPZJ', 'FYVSHG', 'SELOAK', 'VJSALB', 'LEHEAD',
  'TUBUDC', 'BTTZOR', 'ADGZAU', 'WXYB8M', 'LWXIZH', 'JTRARY', 'FUBJTC', 'QCMNEE', 'VPFCBS', 'UKFXSF',
  'BQSGVG', 'ZKBCLC', 'ROKAIS', 'XPSVSA', 'AXXAME', 'JJBIAP', 'HVJJDU', 'NUBHXC', 'SYLRBX', 'BANIRO',
  'SSHQTU', 'BXDIKI', 'TJGDBI', 'XHKTND', 'QMKLQO', 'YFCFWM', 'AMYILW', 'AZBNGO', 'XXEJIG', 'YJEOEG',
  'PSVUMY', 'YTMMBI', 'SRZLWL', 'ADTAOV', 'SYSDLH', 'BVHRPD', 'JNDWVX', 'WYKSIW', 'RYPJES', 'PRCAYJ',
  'PZUSUL', 'WVZTIM', 'NBZTKG', 'HEVQNY', 'NYQRTY', 'XGTGBC', 'TFVZXA', 'AMCDKY', 'TNPOOC', 'ANJCSP',
  'DALVZY', 'ZWXPCQ', 'ZYUYZY', 'JRYAWI', 'SWXDYA', 'BESMOT', 'USIXYQ', 'FVIGUQ', 'UYDWMX', 'VBATWH',
  'XPKNSO', 'SUIRRI', 'HITIXA', 'FFLWZM', 'ASHBSG', 'ZAVOQG', 'RTJURJ', 'HYXVUD', 'VKCFSG', 'TFTOOQ',
  'SSWECL', 'RNNXJF', 'VAJFJL', 'QAVIIV', 'AUFCGT', 'ZJKQFZ', 'TWNQAK', 'XQMCKZ', 'UUVYPG', 'VLDRAB',
  'UFMGGB', 'VAQWXX', 'WJGMXZ', 'SKATAR', 'BIFUUG', 'TAOKSI', 'JIJSZU', 'AGCCBQ', 'TRAATQ', 'WRBPTM',
  'ZRFHWK', 'YZICNQ', 'QUSIAH', 'VJNDML', 'SDXTBU', 'BECBXU', 'FINIIK', 'BJAAOP', 'JOXHSS', 'APXRWY',
  'BEGQXW', 'PRJRIT', 'NVQNJD', 'FGREVU', 'SWVLWW', 'TBFSRJ', 'SKYLUN', 'XTIOOF', 'RUZEGE', 'JEVLRY',
  'HRFFOQ', 'HARGZB', 'WUJEII', 'VQAICR', 'XBAMXO', 'AWVDMJ', 'TPMEIB', 'WLBDPO', 'YFOZKX', 'SGFGRG',
  'JGIBEW', 'HJPQDO', 'HNCTES', 'DZMRXU', 'RXFYQU', 'SYFBEZ', 'JKMPUJ', 'WVTLYK', 'LFVIDB',
];

describe('Privacy Functions', () => {
  describe('cleanPath', () => {
    it('handles null and undefined paths', () => {
      assert.strictEqual(cleanPath(null), null);
      assert.strictEqual(cleanPath(undefined), undefined);
    });

    it('does not modify regular paths', () => {
      const path = '/content/example/path';
      assert.strictEqual(cleanPath(path), path);
    });

    it('masks JWT tokens', () => {
      const path = '/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      assert.strictEqual(cleanPath(path), '/<jwt>');
    });

    it('masks high-entropy PNRs', () => {
      const path = '/content/AB123C/page';
      assert.strictEqual(cleanPath(path), '/content/<pnr>/page');
    });

    it('agressively masks low-entropy PNRs if the path looks suspicious', () => {
      const path = '/trip/AB123C/page';
      assert.strictEqual(cleanPath(path), '/trip/<pnr>/page');
    });

    it('handles PNRs with only numbers (no letters)', () => {
      const path = '/content/12345/page';
      const result = cleanPath(path);
      // The result should either be the original path or masked, depending on entropy
      assert.ok(result === path || result === '/content/<pnr>/page');
    });

    it('handles PNRs with only letters (no numbers)', () => {
      const path = '/content/ABCDE/page';
      const result = cleanPath(path);
      // The result should either be the original path or masked, depending on entropy
      assert.ok(result === path || result === '/content/<pnr>/page');
    });

    it('evaluates false positive and false negative rates for PNR detection', () => {
      // Test common words - these should NOT be identified as PNRs (false positives)
      const wordResults = commonWords.map((word) => {
        const path = `/content/${word}/page`;
        const result = cleanPath(path);
        return result.includes('<pnr>');
      });

      const falsePositives = wordResults.filter(Boolean);
      const falsePositiveRate = (falsePositives.length / commonWords.length) * 100;

      // Test quasi-PNRs - these SHOULD be identified as PNRs (check for false negatives)
      const pnrResults = quasiPNRs.map((pnr) => {
        const path = `/content/${pnr}/page`;
        const result = cleanPath(path);
        return result.includes('<pnr>');
      });

      const falseNegatives = pnrResults.filter((result) => !result);
      const falseNegativeRate = (falseNegatives.length / quasiPNRs.length) * 100;

      console.log(`False positive rate: ${falsePositiveRate.toFixed(2)}% (${falsePositives.length}/${commonWords.length})`);
      console.log(`False negative rate: ${falseNegativeRate.toFixed(2)}% (${falseNegatives.length}/${quasiPNRs.length})`);

      const MAX_RATE = 2;
      // Test fails if either rate is above MAX_RATE
      assert.ok(falsePositiveRate <= MAX_RATE, `False positive rate (${falsePositiveRate.toFixed(2)}%) exceeds threshold of ${MAX_RATE}%`);
      assert.ok(falseNegativeRate <= MAX_RATE, `False negative rate (${falseNegativeRate.toFixed(2)}%) exceeds threshold of ${MAX_RATE}%`);
    });
  });
});

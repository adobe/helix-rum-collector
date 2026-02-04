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

    it('email filter masks email addresses', () => {
      [
        // Basic email patterns
        ['/user/test@example.com/profile', '/user/<email>/profile'],
        ['/api/contact@domain.org', '/api/<email>'],

        // Email with dots in local part
        ['/path/user.name@example.com/data', '/path/<email>/data'],
        ['/first.middle.last@company.com', '/<email>'],

        // Email with plus signs (subaddressing)
        ['/user+tag@example.com/folder', '/<email>/folder'],
        ['/test.email+filter@domain.co/path', '/<email>/path'],

        // Email with underscores and hyphens
        ['/user_name@test-domain.com', '/<email>'],
        ['/test_user@sub-domain.example.com', '/<email>'],

        // Email with numbers
        ['/user123@example456.com/data', '/<email>/data'],
        ['/test2024@domain2024.org', '/<email>'],

        // Email with subdomains
        ['/contact@mail.example.com/api', '/<email>/api'],
        ['/admin@subdomain.test.co.uk', '/<email>'],

        // Email at different positions
        ['test@example.com', '<email>'],
        ['/test@example.com', '/<email>'],
        ['/path/to/test@example.com', '/path/to/<email>'],

        // Multiple emails in path
        ['/from/sender@example.com/to/receiver@domain.com', '/from/<email>/to/<email>'],

        // International TLDs
        ['/path/user@example.co.uk/data', '/path/<email>/data'],
        ['/test@domain.com.au', '/<email>'],

        // Edge case: email-like pattern with file extension
        // The regex treats .json as potential TLD part
        ['/prefix.test@example.com.json', '/<email>'],
        ['/file.admin@site.org.backup', '/<email>'],

        // Complex real-world patterns
        ['/api/v1/user.contact+test@sub-domain.example.co.uk/data.json', '/api/v1/<email>/data.json'],
        ['/auth/verify/test_user123@my-company.com', '/auth/verify/<email>'],
      ].forEach(([input, expected]) => {
        assert.strictEqual(cleanPath(input, ['email']), expected);
      });
    });

    it('email filter does not mask non-email patterns', () => {
      [
        // No TLD
        ['/user@localhost/path', '/user@localhost/path'],

        // Missing @ symbol
        ['/userexample.com/path', '/userexample.com/path'],

        // Invalid patterns
        ['/path/with@/folder', '/path/with@/folder'],
        ['/@example.com', '/@example.com'],

        // Regular paths that might look similar
        ['/user/profile/settings', '/user/profile/settings'],
        ['/path.with.dots/file', '/path.with.dots/file'],
      ].forEach(([input, expected]) => {
        assert.strictEqual(cleanPath(input, ['email']), expected);
      });
    });

    it('uuid filter masks UUID identifiers', () => {
      [
        // UUID v4 (random)
        ['/user/550e8400-e29b-41d4-a716-446655440000/profile', '/user/<uuid>/profile'],
        ['/api/123e4567-e89b-12d3-a456-426614174000', '/api/<uuid>'],
        ['/api/123e4567-e89b-12d3-a456-426614174000_xyz', '/api/<uuid>_xyz'],

        // UUID v1 (time-based)
        ['/resource/6ba7b810-9dad-11d1-80b4-00c04fd430c8/data', '/resource/<uuid>/data'],
        ['/path/to/6ba7b814-9dad-11d1-80b4-00c04fd430c8', '/path/to/<uuid>'],

        // UUID at different positions
        ['/550e8400-e29b-41d4-a716-446655440000', '/<uuid>'],
        ['/api/v1/550e8400-e29b-41d4-a716-446655440000/details', '/api/v1/<uuid>/details'],

        // UUID with file extensions
        ['/file/123e4567-e89b-12d3-a456-426614174000.json', '/file/<uuid>.json'],
        ['/data/550e8400-e29b-41d4-a716-446655440000.xml', '/data/<uuid>.xml'],

        // Multiple UUIDs in path
        ['/from/123e4567-e89b-12d3-a456-426614174000/to/550e8400-e29b-41d4-a716-446655440000', '/from/<uuid>/to/<uuid>'],
        ['/parent/6ba7b810-9dad-11d1-80b4-00c04fd430c8/child/6ba7b814-9dad-11d1-80b4-00c04fd430c8/data', '/parent/<uuid>/child/<uuid>/data'],

        // UUID in query-like patterns
        ['/api/resource/id=550e8400-e29b-41d4-a716-446655440000/fetch', '/api/resource/id=<uuid>/fetch'],
        ['/session/token-123e4567-e89b-12d3-a456-426614174000-active', '/session/token-<uuid>-active'],

        // All lowercase hex characters
        ['/path/abcdef12-3456-7890-abcd-ef1234567890/file', '/path/<uuid>/file'],
        ['/0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', '/<uuid>'],

        // Common UUID variations (NIL UUID)
        ['/system/00000000-0000-0000-0000-000000000000/config', '/system/<uuid>/config'],

        // UUID in URL-encoded or similar contexts
        ['/redirect/ref-550e8400-e29b-41d4-a716-446655440000-end', '/redirect/ref-<uuid>-end'],

        ['/user/profile/550e8400-e29b-41d4-a716-446655440000/avatar.png', '/user/profile/<uuid>/avatar.png'],
        ['/api/v2/orders/123e4567-e89b-12d3-a456-426614174000/items', '/api/v2/orders/<uuid>/items'],
        ['/workspace/6ba7b810-9dad-11d1-80b4-00c04fd430c8/documents', '/workspace/<uuid>/documents'],

        // Missing hyphens (UUID without dashes)
        ['/550e8400e29b41d4a716446655440000/path', '/<uuid>/path'],
        // UUID in mixed case (uppercase/lowercase)
        ['/path/550E8400-E29B-41D4-A716-446655440000/file', '/path/<uuid>/file'],
        ['/user/123E4567-E89B-12D3-A456-426614174000/profile', '/user/<uuid>/profile'],
        ['/ABCDEF12-3456-7890-ABCD-EF1234567890', '/<uuid>'],
        ['/MiXeD-CaSe/AaBbCc12-3456-7890-AbCd-Ef1234567890/data', '/MiXeD-CaSe/<uuid>/data'],
      ].forEach(([input, expected]) => {
        assert.strictEqual(cleanPath(input, ['uuid']), expected);
      });
    });

    it('uuid filter does not mask invalid UUID patterns', () => {
      [
        // Too short segments (11 hex chars in last segment instead of 12)
        ['/path/550e8400-e29b-41d4-a716-44665544000/file', '/path/550e8400-e29b-41d4-a716-44665544000/file'],
        ['/123e4567-e89b-12d3-a456-42661417400', '/123e4567-e89b-12d3-a456-42661417400'],

        // Wrong number of segments (4 segments instead of 5)
        ['/550e8400-e29b-41d4-446655440000/path', '/550e8400-e29b-41d4-446655440000/path'],
        ['/path/550e8400-e29b-41d4a716-446655440000', '/path/550e8400-e29b-41d4a716-446655440000'],

        // Too many segments (6 segments instead of 5)
        ['/550e8400-e29b-41d4-a716-4466-55440000/path', '/550e8400-e29b-41d4-a716-4466-55440000/path'],

        // Contains invalid hex characters (g-z)
        ['/550g8400-e29b-41d4-a716-446655440000/path', '/550g8400-e29b-41d4-a716-446655440000/path'],
        ['/path/123e4567-x89b-12d3-a456-426614174000', '/path/123e4567-x89b-12d3-a456-426614174000'],
        ['/path/zzze4567-e89b-12d3-a456-426614174000', '/path/zzze4567-e89b-12d3-a456-426614174000'],

        // Wrong segment lengths (first 4 segments must be 8-4-4-4)
        ['/550e840-e29b-41d4-a716-446655440000/path', '/550e840-e29b-41d4-a716-446655440000/path'],
        ['/550e8400-e29-41d4-a716-446655440000/path', '/550e8400-e29-41d4-a716-446655440000/path'],
        ['/550e8400-e29b-41d-a716-446655440000/path', '/550e8400-e29b-41d-a716-446655440000/path'],
        ['/550e8400-e29b-41d4-a71-446655440000/path', '/550e8400-e29b-41d4-a71-446655440000/path'],

        // Regular paths that might look similar
        ['/path/with-dashes-in-name/file', '/path/with-dashes-in-name/file'],
        ['/file-name-with-numbers-123/path', '/file-name-with-numbers-123/path'],
        ['/2024-01-15-blog-post/content', '/2024-01-15-blog-post/content'],
      ].forEach(([input, expected]) => {
        assert.strictEqual(cleanPath(input, ['uuid']), expected);
      });
    });

    it('uuid filter preserves AEM asset identifiers', () => {
      [
        // Test 1: AEM Assets with URN identifier (base path)
        ['/adobe/assets/urn:aaid:aem:12345678-1234-1234-1234-123456789abc', '/adobe/assets/urn:aaid:aem:12345678-1234-1234-1234-123456789abc'],

        // Test 2: AEM Assets with URN identifier (with subpath)
        ['/adobe/assets/urn:aaid:aem:12345678-1234-1234-1234-123456789abc/metadata', '/adobe/assets/urn:aaid:aem:12345678-1234-1234-1234-123456789abc/metadata'],

        // Test 3: Dynamic Media deliver with dm-aid
        ['/adobe/dynamicmedia/deliver/dm-aid--550e8400-e29b-41d4-a716-446655440000/image.jpg', '/adobe/dynamicmedia/deliver/dm-aid--550e8400-e29b-41d4-a716-446655440000/image.jpg'],

        // Test 4: AEM Assets path with regular UUID (should be masked)
        ['/adobe/assets/550e8400-e29b-41d4-a716-446655440000/metadata', '/adobe/assets/<uuid>/metadata'],

        // Test 5: Non-AEM path with UUID (should be masked)
        ['/user/profile/550e8400-e29b-41d4-a716-446655440000/data', '/user/profile/<uuid>/data'],

        // Test 6: URL-encoded URN identifier (should be preserved)
        ['/adobe/assets/urn%3Aaaid%3Aaem%3A12345678-1234-1234-1234-123456789abc', '/adobe/assets/urn%3Aaaid%3Aaem%3A12345678-1234-1234-1234-123456789abc'],

        // Test 7: URL-encoded URN identifier with subpath (should be preserved)
        ['/adobe/assets/urn%3Aaaid%3Aaem%3A12345678-1234-1234-1234-123456789abc/metadata', '/adobe/assets/urn%3Aaaid%3Aaem%3A12345678-1234-1234-1234-123456789abc/metadata'],
      ].forEach(([input, expected]) => {
        assert.strictEqual(cleanPath(input, ['uuid']), expected);
      });
    });
  });
});

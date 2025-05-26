-- Generate synthetic PII data for training
-- Creates various types of identifiers that might appear in URLs

CREATE TEMP FUNCTION generateUUID() RETURNS STRING
LANGUAGE js AS """
  // Generate UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
""";

CREATE TEMP FUNCTION generateCompactUUID() RETURNS STRING
LANGUAGE js AS """
  // Generate compact UUID (no hyphens)
  var uuid = '';
  for (var i = 0; i < 32; i++) {
    uuid += Math.floor(Math.random() * 16).toString(16);
  }
  return uuid;
""";

CREATE TEMP FUNCTION generateBase64ID(length INT64) RETURNS STRING
LANGUAGE js AS """
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  var result = '';
  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
""";

CREATE TEMP FUNCTION generateSessionID() RETURNS STRING
LANGUAGE js AS """
  // Various session ID formats
  var formats = [
    // Hex format
    () => {
      var hex = '';
      for (var i = 0; i < 16; i++) {
        hex += Math.floor(Math.random() * 16).toString(16);
      }
      return hex;
    },
    // Base64 format
    () => {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      var result = '';
      for (var i = 0; i < 24; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },
    // Alphanumeric format
    () => {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      var result = '';
      for (var i = 0; i < 20; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
  ];
  return formats[Math.floor(Math.random() * formats.length)]();
""";

CREATE TEMP FUNCTION generatePNR() RETURNS STRING
LANGUAGE js AS """
  // Generate airline PNR (6 alphanumeric characters)
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var pnr = '';
  for (var i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
""";

CREATE TEMP FUNCTION generatePhoneNumber() RETURNS STRING
LANGUAGE js AS """
  // Generate various phone number formats
  var formats = [
    () => '+1' + Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
    () => Math.floor(Math.random() * 900 + 100) + '-' + 
          Math.floor(Math.random() * 900 + 100) + '-' + 
          Math.floor(Math.random() * 9000 + 1000),
    () => '(' + Math.floor(Math.random() * 900 + 100) + ')' + 
          Math.floor(Math.random() * 900 + 100) + '-' + 
          Math.floor(Math.random() * 9000 + 1000),
    () => Math.floor(Math.random() * 9000000000 + 1000000000).toString()
  ];
  return formats[Math.floor(Math.random() * formats.length)]();
""";

CREATE TEMP FUNCTION generateEmailHash() RETURNS STRING
LANGUAGE js AS """
  // Generate email-like patterns that might appear in URLs
  var users = ['user', 'admin', 'test', 'john', 'jane', 'info', 'support'];
  var domains = ['gmail', 'yahoo', 'outlook', 'company', 'example'];
  var tlds = ['com', 'net', 'org', 'edu'];
  
  var user = users[Math.floor(Math.random() * users.length)] + 
             Math.floor(Math.random() * 1000);
  var domain = domains[Math.floor(Math.random() * domains.length)];
  var tld = tlds[Math.floor(Math.random() * tlds.length)];
  
  // Sometimes return encoded @ symbol
  if (Math.random() > 0.5) {
    return user + '%40' + domain + '.' + tld;
  } else {
    return user + '@' + domain + '.' + tld;
  }
""";

CREATE TEMP FUNCTION generateCustomerID() RETURNS STRING
LANGUAGE js AS """
  // Generate various customer ID formats
  var formats = [
    // Numeric ID
    () => 'C' + Math.floor(Math.random() * 9000000 + 1000000).toString(),
    // Alphanumeric ID
    () => {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      var id = '';
      for (var i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return id;
    },
    // UUID-like but shorter
    () => {
      var hex = '';
      for (var i = 0; i < 12; i++) {
        hex += Math.floor(Math.random() * 16).toString(16);
      }
      return hex;
    }
  ];
  return formats[Math.floor(Math.random() * formats.length)]();
""";

-- Generate 10,000 synthetic PII samples
WITH synthetic_data AS (
  SELECT 
    CASE 
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 0 THEN generateUUID()
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 1 THEN generateCompactUUID()
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 2 THEN generateBase64ID(CAST(5 + RAND() * 3 AS INT64))
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 3 THEN generateSessionID()
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 4 THEN generatePNR()
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 5 THEN generatePhoneNumber()
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 6 THEN generateEmailHash()
      ELSE generateCustomerID()
    END AS segment,
    CASE 
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 0 THEN 'uuid'
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 1 THEN 'compact_uuid'
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 2 THEN 'base64_id'
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 3 THEN 'session_id'
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 4 THEN 'pnr'
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 5 THEN 'phone'
      WHEN MOD(ROW_NUMBER() OVER(), 8) = 6 THEN 'email'
      ELSE 'customer_id'
    END AS pii_type,
    1 AS is_pii
  FROM UNNEST(GENERATE_ARRAY(1, 10000)) AS num
)
SELECT 
  segment,
  pii_type,
  is_pii
FROM synthetic_data
WHERE LENGTH(segment) >= 5 AND LENGTH(segment) <= 50
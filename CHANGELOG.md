# [2.41.0](https://github.com/adobe/helix-rum-collector/compare/v2.40.7...v2.41.0) (2025-07-04)


### Features

* **a11y:** add support for a new accessibility checkpoint ([bb1efb3](https://github.com/adobe/helix-rum-collector/commit/bb1efb3eba32729997bbf5f88deb6aeaeee287b4))
* **a11y:** add support for a new accessibilty checkpoint ([3378f75](https://github.com/adobe/helix-rum-collector/commit/3378f753e339923349f036ce58732830d448bcba))

## [2.40.7](https://github.com/adobe/helix-rum-collector/compare/v2.40.6...v2.40.7) (2025-06-30)


### Bug Fixes

* **coralogix:** only log to Coralogix if weight === 1 or is user agent is unknown or unknown bot ([#524](https://github.com/adobe/helix-rum-collector/issues/524)) ([0f2e059](https://github.com/adobe/helix-rum-collector/commit/0f2e059be2691bc6246716ea7dc9400dc127e866))

## [2.40.6](https://github.com/adobe/helix-rum-collector/compare/v2.40.5...v2.40.6) (2025-06-10)


### Bug Fixes

* **index:** Improve version character validation in URL segments ([1e008a5](https://github.com/adobe/helix-rum-collector/commit/1e008a583452f54319bce9dfddf8e9638cd4ecfc))

## [2.40.5](https://github.com/adobe/helix-rum-collector/compare/v2.40.4...v2.40.5) (2025-05-28)


### Bug Fixes

* update iconUrl in .releaserc.js to use the correct AEM domain ([8a50d38](https://github.com/adobe/helix-rum-collector/commit/8a50d383b0ee06bac95aea5bea86814ba31a9dab))

## [2.40.4](https://github.com/adobe/helix-rum-collector/compare/v2.40.3...v2.40.4) (2025-05-28)


### Bug Fixes

* **hlx:** add CORS headers to helix-rum-enhancer responses and update tests ([5366729](https://github.com/adobe/helix-rum-collector/commit/5366729b291f24f9620e90c7725430117d5b473a))

## [2.40.3](https://github.com/adobe/helix-rum-collector/compare/v2.40.2...v2.40.3) (2025-05-23)


### Bug Fixes

* apply cleanurl to referer in ConsoleLogger, GoogleLogger, and S3Logger ([5e7f567](https://github.com/adobe/helix-rum-collector/commit/5e7f567f36f37cb5b06098dd9af76ef3f475cbf0))

## [2.40.2](https://github.com/adobe/helix-rum-collector/compare/v2.40.1...v2.40.2) (2025-05-22)


### Bug Fixes

* **privacy:** filter pnrs more agressively based on suspicious path patterns ([bc3b996](https://github.com/adobe/helix-rum-collector/commit/bc3b996f3ecbe33a5ac1f5ae67d36b9808c49ee3))

## [2.40.1](https://github.com/adobe/helix-rum-collector/compare/v2.40.0...v2.40.1) (2025-05-22)


### Bug Fixes

* enhance URL validation by excluding specific encoded characters and paths with '..' ([e02e79d](https://github.com/adobe/helix-rum-collector/commit/e02e79d2ec2859d48dafa7cfb7617c032476e700))
* enhance URL validation to allow semantic versioning with %5E and reject other encodings ([cf7beeb](https://github.com/adobe/helix-rum-collector/commit/cf7beeb747710ba984c5ed9d4cd35e8d36ce7ed0))
* simplify URL validation by rejecting any encoded characters and paths with '..' ([bb82bb8](https://github.com/adobe/helix-rum-collector/commit/bb82bb8a355e03e17baebc46cd0d548d0545858b))
* update test to assert 400 status for invalid favicon path ([e9d3692](https://github.com/adobe/helix-rum-collector/commit/e9d3692a462db3d71907bcdacd86560d89c7a6ec))
* update test to assert 404 status for non-existent favicon and add case for rejecting partially encoded paths ([035636f](https://github.com/adobe/helix-rum-collector/commit/035636f50c70580f7a3a169dd428a4ef519a36e8))

# [2.40.0](https://github.com/adobe/helix-rum-collector/compare/v2.39.0...v2.40.0) (2025-05-22)


### Features

* **pkg:** serve AEM optel packages from aem.live ([55601c0](https://github.com/adobe/helix-rum-collector/commit/55601c09072664d380c1723709414940345a71e3))

# [2.39.0](https://github.com/adobe/helix-rum-collector/compare/v2.38.2...v2.39.0) (2025-05-21)


### Features

* remove convert checkpoint ([4019320](https://github.com/adobe/helix-rum-collector/commit/4019320615c13f812b0466e2ae673fa1ba6071b4))

## [2.38.2](https://github.com/adobe/helix-rum-collector/compare/v2.38.1...v2.38.2) (2025-05-21)


### Bug Fixes

* **privacy:** and improve vowel ratio calculation in privacy.js ([7bc44aa](https://github.com/adobe/helix-rum-collector/commit/7bc44aaaabcf4102d5442956bb9a139a8f5b0da6))
* **privacy:** update JWT regex pattern for improved matching ([1696a27](https://github.com/adobe/helix-rum-collector/commit/1696a271859e1a4cb476fbf7fa93b624fe308025))

## [2.38.1](https://github.com/adobe/helix-rum-collector/compare/v2.38.0...v2.38.1) (2025-05-21)


### Reverts

* Revert "Merge pull request [#511](https://github.com/adobe/helix-rum-collector/issues/511) from adobe/more-privacy-filters" ([c02450e](https://github.com/adobe/helix-rum-collector/commit/c02450e95c52790067d46ba0db388b32f4a93502))

# [2.38.0](https://github.com/adobe/helix-rum-collector/compare/v2.37.0...v2.38.0) (2025-05-21)


### Bug Fixes

* update URL handling in loggers to use cleanurl and add privacy.js for path sanitization ([0137263](https://github.com/adobe/helix-rum-collector/commit/013726321134c82cab09fdf2faa32b9f488dddc5))
* update user agent assertion and correct URL format in index tests ([14db69a](https://github.com/adobe/helix-rum-collector/commit/14db69a92e9a4837b337681ad620876a75d91f22))


### Features

* enhance privacy.js with PNR cleaning functionality and Shannon entropy calculation ([8ede4ee](https://github.com/adobe/helix-rum-collector/commit/8ede4ee6a7979791ae8bde59e0508896528133be))

# [2.37.0](https://github.com/adobe/helix-rum-collector/compare/v2.36.1...v2.37.0) (2025-05-20)


### Bug Fixes

* enhance cleanCode function to handle empty strings gracefully ([4947256](https://github.com/adobe/helix-rum-collector/commit/4947256b36968e4504bec195349a8741c93572af))
* improve cleanCode function to ensure it returns the original string when no valid replacement is found ([3c3354a](https://github.com/adobe/helix-rum-collector/commit/3c3354a50520162960595d18fb71d4871d6f8b7b))


### Features

* add cleanCode function to sanitize trip paths in URLs ([a798f76](https://github.com/adobe/helix-rum-collector/commit/a798f76e14ea3df6b7a925e597a44e20409ce178))

## [2.36.1](https://github.com/adobe/helix-rum-collector/compare/v2.36.0...v2.36.1) (2025-05-20)


### Bug Fixes

* **package:** update test command to exclude coverage for test files ([#509](https://github.com/adobe/helix-rum-collector/issues/509)) ([2676de1](https://github.com/adobe/helix-rum-collector/commit/2676de1d90e4cfb7c484b8289895def62024002e))

# [2.36.0](https://github.com/adobe/helix-rum-collector/compare/v2.35.2...v2.36.0) (2025-05-20)


### Features

* remove noscript checkpoint ([a676a17](https://github.com/adobe/helix-rum-collector/commit/a676a17d827c00d0d6dc65ead6eac446ac9c7612))

## [2.35.2](https://github.com/adobe/helix-rum-collector/compare/v2.35.1...v2.35.2) (2025-04-30)


### Bug Fixes

* **index:** improve web-vitals path matching with regex ([7bb5463](https://github.com/adobe/helix-rum-collector/commit/7bb5463d6100e2f07b2fe42ea7a9b5aeade0de2f))
* **index:** stricter path sanitation ([23a1f41](https://github.com/adobe/helix-rum-collector/commit/23a1f4117cffe31b8b8da5eaa91d57bb3e8ad649))

## [2.35.1](https://github.com/adobe/helix-rum-collector/compare/v2.35.0...v2.35.1) (2025-04-28)


### Bug Fixes

* enhance URL validation to reject paths containing ':' ([7f7269e](https://github.com/adobe/helix-rum-collector/commit/7f7269ebae3354bb5be84f695b46499779b9cff8))

# [2.35.0](https://github.com/adobe/helix-rum-collector/compare/v2.34.12...v2.35.0) (2025-04-16)


### Bug Fixes

* **respondError:** simplify error message handling ([76d0d7b](https://github.com/adobe/helix-rum-collector/commit/76d0d7b55b17b19c04649769d695fef9e28e9761))


### Features

* **security:** add X-Frame-Options header to responses ([ea053c7](https://github.com/adobe/helix-rum-collector/commit/ea053c7e5869dfd1c67eb4b62900f0b4cb880cc3))

## [2.34.12](https://github.com/adobe/helix-rum-collector/compare/v2.34.11...v2.34.12) (2025-04-16)


### Bug Fixes

* trigger release ([b035f25](https://github.com/adobe/helix-rum-collector/commit/b035f255e6c6906b7a60ba1362381771dbb9c596))

## [2.34.11](https://github.com/adobe/helix-rum-collector/compare/v2.34.10...v2.34.11) (2025-04-16)


### Bug Fixes

* trigger release ([4945cef](https://github.com/adobe/helix-rum-collector/commit/4945cef72c8afaab9d04fd271e715d7f3f86d3c8))

## [2.34.10](https://github.com/adobe/helix-rum-collector/compare/v2.34.9...v2.34.10) (2025-04-16)


### Bug Fixes

* **build:** remove reference to nonexistent lcov file ([0f7a888](https://github.com/adobe/helix-rum-collector/commit/0f7a8889f42214349a0c4d8a7fda7f69ece5b51c))
* **response:** update CORS response to use status 204 and null body ([29b3937](https://github.com/adobe/helix-rum-collector/commit/29b393743da3ec4013685b79d390ba61d69ac0d2))
* **tests:** update CORS test to assert status 204 instead of 200 ([3747c95](https://github.com/adobe/helix-rum-collector/commit/3747c9544bf399edb0073b30f1498742fe52547f))

## [2.34.9](https://github.com/adobe/helix-rum-collector/compare/v2.34.8...v2.34.9) (2025-04-11)


### Bug Fixes

* **response:** don't switch registries on responses < 500 ([397f235](https://github.com/adobe/helix-rum-collector/commit/397f2354bb5e3671fdceb0d5134d10109857bf65))

## [2.34.8](https://github.com/adobe/helix-rum-collector/compare/v2.34.7...v2.34.8) (2025-04-10)


### Bug Fixes

* trigger release ([233d2fa](https://github.com/adobe/helix-rum-collector/commit/233d2fa2fab975e50dd159cec371da9aa0fc0992))

## [2.34.7](https://github.com/adobe/helix-rum-collector/compare/v2.34.6...v2.34.7) (2025-04-10)


### Bug Fixes

* trigger release ([93e9bf7](https://github.com/adobe/helix-rum-collector/commit/93e9bf73d63a8f829292ae0eb5cc859d15f15faf))

## [2.34.6](https://github.com/adobe/helix-rum-collector/compare/v2.34.5...v2.34.6) (2025-04-10)


### Bug Fixes

* **registry:** use timeout to agressively switch to secondary registry if the first one is too slow ([a6d4411](https://github.com/adobe/helix-rum-collector/commit/a6d4411a478db6780a1ef0bd0ddd9655b9617ab4))

## [2.34.5](https://github.com/adobe/helix-rum-collector/compare/v2.34.4...v2.34.5) (2025-04-04)


### Bug Fixes

* **headers:** cache-control header should never return null ([#485](https://github.com/adobe/helix-rum-collector/issues/485)) ([6d09419](https://github.com/adobe/helix-rum-collector/commit/6d0941963d14651a476b8128fdcbc3a8b77f8eae)), closes [#483](https://github.com/adobe/helix-rum-collector/issues/483)

## [2.34.4](https://github.com/adobe/helix-rum-collector/compare/v2.34.3...v2.34.4) (2025-02-24)


### Bug Fixes

* **logging:** adjust error severity level in Coralogix logger ([b74f4da](https://github.com/adobe/helix-rum-collector/commit/b74f4da21bbc2e02c87e95127d98739999d37c7c))

## [2.34.3](https://github.com/adobe/helix-rum-collector/compare/v2.34.2...v2.34.3) (2025-01-30)


### Bug Fixes

* consolidate domain segments ([b9afd6c](https://github.com/adobe/helix-rum-collector/commit/b9afd6c9613230e1f6ae3f070519e03cfc50d9b5))
* updated AMS routing info ([7fc5bbe](https://github.com/adobe/helix-rum-collector/commit/7fc5bbe62c4e2b39d0e2cfec375f305c5190b392))

## [2.34.2](https://github.com/adobe/helix-rum-collector/compare/v2.34.1...v2.34.2) (2025-01-28)


### Bug Fixes

* **url:** Disallow encoded '..' and double encoded urls ([#456](https://github.com/adobe/helix-rum-collector/issues/456)) ([4a2f34a](https://github.com/adobe/helix-rum-collector/commit/4a2f34aa38cef0905afddc5d80dcde6f896961c9)), closes [#452](https://github.com/adobe/helix-rum-collector/issues/452)

## [2.34.1](https://github.com/adobe/helix-rum-collector/compare/v2.34.0...v2.34.1) (2025-01-27)


### Bug Fixes

* **url:** Disallow request URLs containing '..' ([#453](https://github.com/adobe/helix-rum-collector/issues/453)) ([192d6d3](https://github.com/adobe/helix-rum-collector/commit/192d6d327e4459584c09224b2dce182fbc1ed816))

# [2.34.0](https://github.com/adobe/helix-rum-collector/compare/v2.33.0...v2.34.0) (2025-01-17)


### Features

* **utils:** support AMS and Commerce IDs in routing information ([76c61c0](https://github.com/adobe/helix-rum-collector/commit/76c61c04e6a1f6672a2581c0f66a6deeb81968da))

# [2.33.0](https://github.com/adobe/helix-rum-collector/compare/v2.32.1...v2.33.0) (2025-01-15)


### Features

* additional bot classification and adjust devicetype fallback ([75dcf00](https://github.com/adobe/helix-rum-collector/commit/75dcf0048d9c866ff71080a7e0a6488552ea7d3e))

## [2.32.1](https://github.com/adobe/helix-rum-collector/compare/v2.32.0...v2.32.1) (2025-01-02)


### Bug Fixes

* **cwv:** remove deprecated FID ([bf2fc97](https://github.com/adobe/helix-rum-collector/commit/bf2fc97251d695cce6febd1f5ccef7e2934a3fb6))

# [2.32.0](https://github.com/adobe/helix-rum-collector/compare/v2.31.2...v2.32.0) (2024-12-19)


### Features

* enabling fill checkpoint. ([44149f9](https://github.com/adobe/helix-rum-collector/commit/44149f923f499af5934531bad3f67844b808cc2c))

## [2.31.2](https://github.com/adobe/helix-rum-collector/compare/v2.31.1...v2.31.2) (2024-12-11)


### Bug Fixes

* **cdn:** do not serve package.json or changelog ([6296a38](https://github.com/adobe/helix-rum-collector/commit/6296a38b70843ea2c3678884310cc0692a805098))

## [2.31.1](https://github.com/adobe/helix-rum-collector/compare/v2.31.0...v2.31.1) (2024-11-22)


### Bug Fixes

* include browser engines in user agent ([#421](https://github.com/adobe/helix-rum-collector/issues/421)) ([2781f75](https://github.com/adobe/helix-rum-collector/commit/2781f753844d60232a09e0c99b324441d28580fd))

# [2.31.0](https://github.com/adobe/helix-rum-collector/compare/v2.30.2...v2.31.0) (2024-11-11)


### Features

* **bots:** add more AI bots, based on ai.robots.txt ([4b49da5](https://github.com/adobe/helix-rum-collector/commit/4b49da55000f08134715b7fc14d6070eaef31eee))
* **bots:** add more bots, based on 2024-10-31 data ([1d9d4fa](https://github.com/adobe/helix-rum-collector/commit/1d9d4fab39dd16028ac382aa523134871d2439a9))
* **bots:** add more bots, based on extensive list of bots ([14949a9](https://github.com/adobe/helix-rum-collector/commit/14949a9d449f3f03658da8d2fe1065a67e2922da))

## [2.30.2](https://github.com/adobe/helix-rum-collector/compare/v2.30.1...v2.30.2) (2024-10-09)


### Bug Fixes

* filter invalid events in consolelogger ([#405](https://github.com/adobe/helix-rum-collector/issues/405)) ([ba3fbdb](https://github.com/adobe/helix-rum-collector/commit/ba3fbdbaf7860b340b4a15421f136b44c40de299))

## [2.30.1](https://github.com/adobe/helix-rum-collector/compare/v2.30.0...v2.30.1) (2024-10-07)


### Bug Fixes

* **packages:** Prevent package registry dir listings ([#402](https://github.com/adobe/helix-rum-collector/issues/402)) ([ed41ed7](https://github.com/adobe/helix-rum-collector/commit/ed41ed767ca1d33a00c93eb881bbc199e5c3a780))

# [2.30.0](https://github.com/adobe/helix-rum-collector/compare/v2.29.1...v2.30.0) (2024-09-19)


### Features

* **utils:** allow specifying the routing info via `routing` URL parameter ([a4b3834](https://github.com/adobe/helix-rum-collector/commit/a4b38340608c5987b6072eeee0ddc56b810b1430))

## [2.29.1](https://github.com/adobe/helix-rum-collector/compare/v2.29.0...v2.29.1) (2024-09-17)


### Bug Fixes

* extend deadline for sidekick checkpoints ([#393](https://github.com/adobe/helix-rum-collector/issues/393)) ([8b06d64](https://github.com/adobe/helix-rum-collector/commit/8b06d64877bb8168cdca5a64b567a627ad44d5ed))

# [2.29.0](https://github.com/adobe/helix-rum-collector/compare/v2.28.0...v2.29.0) (2024-09-12)


### Features

* **cdn:** enable compression on fastly ([5f98ead](https://github.com/adobe/helix-rum-collector/commit/5f98eadd3683fb4895698a64ea5744d2708fe5db))

# [2.28.0](https://github.com/adobe/helix-rum-collector/compare/v2.27.0...v2.28.0) (2024-09-09)


### Features

* **utils:** enable language checkpoint ([d3e1d3d](https://github.com/adobe/helix-rum-collector/commit/d3e1d3d5e6cdff9eca2da48d2afe8583106f89a4))
* **utils:** enable redirect checkpoint ([07bfa93](https://github.com/adobe/helix-rum-collector/commit/07bfa9366d28385371321393ba0f971cc25721ac))

# [2.27.0](https://github.com/adobe/helix-rum-collector/compare/v2.26.0...v2.27.0) (2024-08-29)


### Bug Fixes

* only track the 1st reported audience and bail out of invalid ([48f03da](https://github.com/adobe/helix-rum-collector/commit/48f03da0ccfaba3e051e75053ac10dfcd9b8c265))
* rename checkpoint to audiences to be backward compatible ([822224f](https://github.com/adobe/helix-rum-collector/commit/822224f68cb91d93debcb241c7e92f9925e0aaef))


### Features

* track audience using a privacy compliant algorithm ([014ea76](https://github.com/adobe/helix-rum-collector/commit/014ea76e11336383893d07b420f5f70fbdd0a914))
* validate experiment and audiences checkpoints ([3209abb](https://github.com/adobe/helix-rum-collector/commit/3209abb9e5408a346ce6ecc172cf883060679a8b))

# [2.26.0](https://github.com/adobe/helix-rum-collector/compare/v2.25.10...v2.26.0) (2024-08-26)


### Bug Fixes

* allow prerender checkpoint ([44dc9f2](https://github.com/adobe/helix-rum-collector/commit/44dc9f286b21d6bbf1fb28ca13fb701783a7f16a))
* **sanitize:** guard against empty objects ([61b381b](https://github.com/adobe/helix-rum-collector/commit/61b381bb7acc40a188ed5b50666a2419532d5fae))


### Features

* **logger:** control bloat of JSON logs for Cloudflare ([b872d3b](https://github.com/adobe/helix-rum-collector/commit/b872d3bfce70ebaa2d1598217b26571c4a57e0c0))
* **utils:** add bloat control utility to ensure JSON strings don't get too long ([cee29ea](https://github.com/adobe/helix-rum-collector/commit/cee29ea0c379d936a583eabfc1b29d9713c26c5a))

## [2.25.10](https://github.com/adobe/helix-rum-collector/compare/v2.25.9...v2.25.10) (2024-08-09)


### Bug Fixes

* unmask milliseconds ([#377](https://github.com/adobe/helix-rum-collector/issues/377)) ([e10009f](https://github.com/adobe/helix-rum-collector/commit/e10009f247777417c3ec8deed7c3de9628156e78))

## [2.25.9](https://github.com/adobe/helix-rum-collector/compare/v2.25.8...v2.25.9) (2024-08-06)


### Bug Fixes

* **bots:** add bot detection for deepcrawl ([32e27d9](https://github.com/adobe/helix-rum-collector/commit/32e27d975d5eb93160c6f136bbe3fdacefc654e2)), closes [#375](https://github.com/adobe/helix-rum-collector/issues/375)
* **utils:** detect bots first, then mobile ([f640f29](https://github.com/adobe/helix-rum-collector/commit/f640f293bf4987a7f0a08a9a51041cf824b0213e)), closes [#375](https://github.com/adobe/helix-rum-collector/issues/375)

## [2.25.8](https://github.com/adobe/helix-rum-collector/compare/v2.25.7...v2.25.8) (2024-08-05)


### Bug Fixes

* **cloudflare:** clean @ from URLs ([dd8b011](https://github.com/adobe/helix-rum-collector/commit/dd8b011b8d4904c361c0ac4a7e6ca30a762d17d1))
* **cloudflare:** clean up urls for real ([4fa53a0](https://github.com/adobe/helix-rum-collector/commit/4fa53a00eecae3998dc495a3dd542b80a08905d6))
* **jsdelivr:** support body rewriting ([8f2d61d](https://github.com/adobe/helix-rum-collector/commit/8f2d61d53862a1e8bb8dcd52df696490f1145e1a))

## [2.25.7](https://github.com/adobe/helix-rum-collector/compare/v2.25.6...v2.25.7) (2024-07-30)


### Bug Fixes

* basic id validation ([#367](https://github.com/adobe/helix-rum-collector/issues/367)) ([fc33116](https://github.com/adobe/helix-rum-collector/commit/fc33116c7ad2542863b829336089de2441ff768e))

## [2.25.6](https://github.com/adobe/helix-rum-collector/compare/v2.25.5...v2.25.6) (2024-07-30)


### Bug Fixes

* **logger:** reject unreasonable data ([50d52e5](https://github.com/adobe/helix-rum-collector/commit/50d52e54af786d64934189d4df17b05210e387ad))
* unit tests ([4307e87](https://github.com/adobe/helix-rum-collector/commit/4307e8704e2b825ecd21834c27aba9818f6d1028))

## [2.25.5](https://github.com/adobe/helix-rum-collector/compare/v2.25.4...v2.25.5) (2024-07-17)


### Bug Fixes

* remove acquisition classification ([b99489c](https://github.com/adobe/helix-rum-collector/commit/b99489c2f9bb1d69e8399e4bb438910e410129e6))

## [2.25.4](https://github.com/adobe/helix-rum-collector/compare/v2.25.3...v2.25.4) (2024-07-10)


### Bug Fixes

* **coralogix:** don't mask error time ([939191f](https://github.com/adobe/helix-rum-collector/commit/939191f16368efe11ee255b7fb84c54aab8e55ea))

## [2.25.3](https://github.com/adobe/helix-rum-collector/compare/v2.25.2...v2.25.3) (2024-07-09)


### Bug Fixes

* guard against potential non-strings ([#354](https://github.com/adobe/helix-rum-collector/issues/354)) ([2672bae](https://github.com/adobe/helix-rum-collector/commit/2672bae2da183810880f801c1613875c65ab5f5a)), closes [#353](https://github.com/adobe/helix-rum-collector/issues/353)

## [2.25.2](https://github.com/adobe/helix-rum-collector/compare/v2.25.1...v2.25.2) (2024-07-09)


### Bug Fixes

* **utils:** strip away JWT tokens in paths ([424f9bb](https://github.com/adobe/helix-rum-collector/commit/424f9bbedfab93ef42d28ea77debe3c43c183613))

## [2.25.1](https://github.com/adobe/helix-rum-collector/compare/v2.25.0...v2.25.1) (2024-07-04)


### Bug Fixes

* **utils:** allow a weight of 20, too ([1ee7212](https://github.com/adobe/helix-rum-collector/commit/1ee7212d1e21a1b0a139febeae696fd92d98338e))

# [2.25.0](https://github.com/adobe/helix-rum-collector/compare/v2.24.0...v2.25.0) (2024-07-04)


### Bug Fixes

* **loggers:** only log to consequential targets if weight is reasonable ([f85d143](https://github.com/adobe/helix-rum-collector/commit/f85d14368646d3504cc8b11b7d8db1aa7b41ca06))
* **utils:** guard against non-string checkpoints ([d73a49c](https://github.com/adobe/helix-rum-collector/commit/d73a49c9c5747bc9465a8a0da64de4fbe1878a68))


### Features

* **coralogix:** log unsupported checkpoints and unreasonable weights as warnings ([83f9a93](https://github.com/adobe/helix-rum-collector/commit/83f9a93556ae47fd19844c8261821cd48ddb0034))

# [2.24.0](https://github.com/adobe/helix-rum-collector/compare/v2.23.4...v2.24.0) (2024-06-28)


### Bug Fixes

* **acq:** dv360 is paid video ([18b00e7](https://github.com/adobe/helix-rum-collector/commit/18b00e7895cb5b610340c97d0ee3d14fdd657d91))
* **acq:** identify doubleclick bid manager ([0d5f57e](https://github.com/adobe/helix-rum-collector/commit/0d5f57eb09c79360297a99d7720172034ae58f29))


### Features

* **acq:** add push ([1f0c765](https://github.com/adobe/helix-rum-collector/commit/1f0c7651202bae4131ce422740a857507dce33de))
* **acq:** add yandex, baidu, amazon ([3c4bb97](https://github.com/adobe/helix-rum-collector/commit/3c4bb978c138266a98805473abf5636068e1caf2))
* **acq:** detect google my business (can be owned or earned) ([d2c8532](https://github.com/adobe/helix-rum-collector/commit/d2c85324425972f1c1531fd83b6d09672a5e5832))
* **acq:** identify amazon connected tv ([12fcb56](https://github.com/adobe/helix-rum-collector/commit/12fcb56f8f0be63e8413e9d15847452d049a21af))
* **acq:** identify google display network ([98c624c](https://github.com/adobe/helix-rum-collector/commit/98c624c2c222579e33783224a1f570af69fc7c02))
* **logger:** introduce `acqusition` checkpoint ([339e9b5](https://github.com/adobe/helix-rum-collector/commit/339e9b5030cc2439b9e957ceabe650a1dbe91ece))
* **utils:** add classifier for traffic acqusition ([c3a2655](https://github.com/adobe/helix-rum-collector/commit/c3a2655f52579c42f62f34dbb6c1fcff91777306))
* **utils:** allow-list acquisition checkpoint ([d2caacd](https://github.com/adobe/helix-rum-collector/commit/d2caacdfd7b8072d9517e9ef7422477d03f6c428))

## [2.23.4](https://github.com/adobe/helix-rum-collector/compare/v2.23.3...v2.23.4) (2024-06-24)


### Bug Fixes

* **utils:** drop unused variant checkpoint ([6607f9a](https://github.com/adobe/helix-rum-collector/commit/6607f9abed359b874bad3c2ef3b9df13ba84ad44))

## [2.23.3](https://github.com/adobe/helix-rum-collector/compare/v2.23.2...v2.23.3) (2024-06-20)


### Bug Fixes

* **utils:** guard against null ([56f772b](https://github.com/adobe/helix-rum-collector/commit/56f772ba870ac5fde07f9a92a2661e783810e78f))
* **utils:** remove and disable checkpoints without significant usage, deprecated checkpoints, or checkpoints that should no longer be used ([9fb97f7](https://github.com/adobe/helix-rum-collector/commit/9fb97f755aba08a0587ded0a0f6f03fb736e3eb4))

## [2.23.2](https://github.com/adobe/helix-rum-collector/compare/v2.23.1...v2.23.2) (2024-06-18)


### Bug Fixes

* **jsdelivr:** do not allow dir list ([551bc68](https://github.com/adobe/helix-rum-collector/commit/551bc68eb8718fb1867964c83bd3a37d332039bc))
* **jsdelivr:** stop creating url objects ([cae8014](https://github.com/adobe/helix-rum-collector/commit/cae80143cad5128592e6b2a942976f5e96a46f8f))

## [2.23.1](https://github.com/adobe/helix-rum-collector/compare/v2.23.0...v2.23.1) (2024-06-14)


### Bug Fixes

* **jsdelivr:** do not disclose path in 404 response ([c82696e](https://github.com/adobe/helix-rum-collector/commit/c82696eae7cab527d33b26bfcce9768cb4131ffe))

# [2.23.0](https://github.com/adobe/helix-rum-collector/compare/v2.22.0...v2.23.0) (2024-06-12)


### Features

* **checkpoints:** enable cwv2 checkpoint ([9a39310](https://github.com/adobe/helix-rum-collector/commit/9a393100bf986b86daabfeb8957843cfc6ca0936))

# [2.22.0](https://github.com/adobe/helix-rum-collector/compare/v2.21.1...v2.22.0) (2024-06-11)


### Features

* **checkpoints:** enable paid and email checkpoints ([f60e1f3](https://github.com/adobe/helix-rum-collector/commit/f60e1f33f65b413fe0a4b25f0b4a85cc298722b9))

## [2.21.1](https://github.com/adobe/helix-rum-collector/compare/v2.21.0...v2.21.1) (2024-06-11)


### Bug Fixes

* **checkpoint:** add consent to the list of valid checkpoints ([4980b1e](https://github.com/adobe/helix-rum-collector/commit/4980b1ebca7e24dd065b1a460ae33e00410b1193))

# [2.21.0](https://github.com/adobe/helix-rum-collector/compare/v2.20.0...v2.21.0) (2024-06-07)


### Features

* **user-agents:** detect new relic monitors ([5816b02](https://github.com/adobe/helix-rum-collector/commit/5816b025eb760f5f20ef991427bbaf0f31c4ab03))

# [2.20.0](https://github.com/adobe/helix-rum-collector/compare/v2.19.1...v2.20.0) (2024-06-06)


### Bug Fixes

* **index:** make the dev tools shut up about CORP when it's too late anyway ([f212c47](https://github.com/adobe/helix-rum-collector/commit/f212c474633448ee9b1e59ac487ea9197af13ea8))


### Features

* **cdn:** deliver friendly CORP headers ([f770b25](https://github.com/adobe/helix-rum-collector/commit/f770b2520a0cb28fc385bb2217fed3b3a0e59de2))

## [2.19.1](https://github.com/adobe/helix-rum-collector/compare/v2.19.0...v2.19.1) (2024-06-03)


### Bug Fixes

* **utils:** harden routing info against bad input ([f70acda](https://github.com/adobe/helix-rum-collector/commit/f70acdaa8c2cba54397bbf2d1df4252e8714ec05))

# [2.19.0](https://github.com/adobe/helix-rum-collector/compare/v2.18.2...v2.19.0) (2024-05-29)


### Features

* **logging:** verify checkpoints against allowed list of checkpoints before logging ([3890a0a](https://github.com/adobe/helix-rum-collector/commit/3890a0a1f2b20fa7bc51fc83820b51ef7a2420d8))

## [2.18.2](https://github.com/adobe/helix-rum-collector/compare/v2.18.1...v2.18.2) (2024-05-21)


### Bug Fixes

* **unpkg:** do not serve error responses verbatim ([f6b84d9](https://github.com/adobe/helix-rum-collector/commit/f6b84d90160e967508a02cb41dfa5fe8fac94cbe))

## [2.18.1](https://github.com/adobe/helix-rum-collector/compare/v2.18.0...v2.18.1) (2024-05-17)


### Bug Fixes

* change random id function ([50a5a5f](https://github.com/adobe/helix-rum-collector/commit/50a5a5f0aceace58076687252dbac23f405a1524))

# [2.18.0](https://github.com/adobe/helix-rum-collector/compare/v2.17.0...v2.18.0) (2024-05-08)


### Features

* **utils:** detect chromeos as desktop operating system ([9943ed3](https://github.com/adobe/helix-rum-collector/commit/9943ed3165c067a32e3d1ed037e875804da61ae2))

# [2.17.0](https://github.com/adobe/helix-rum-collector/compare/v2.16.0...v2.17.0) (2024-05-06)


### Bug Fixes

* **utils:** getForwardedHost should only extract hostnames that match the naming pattern ([a46756f](https://github.com/adobe/helix-rum-collector/commit/a46756fc286e8d076c532597bca1527ec2b0d724))


### Features

* **coralogix:** log forwarded host and adobe routing headers ([0b8c54a](https://github.com/adobe/helix-rum-collector/commit/0b8c54abb0641715749f5f3770c6309ba179ef79))

# [2.16.0](https://github.com/adobe/helix-rum-collector/compare/v2.15.1...v2.16.0) (2024-04-24)


### Features

* **bots:** add advanced bot detection ([ee67901](https://github.com/adobe/helix-rum-collector/commit/ee67901443480d23a7cc0cad9f86f0d9eae2c03d))

## [2.15.1](https://github.com/adobe/helix-rum-collector/compare/v2.15.0...v2.15.1) (2024-04-19)


### Bug Fixes

* **utils:** old android is mobile ([7326f1e](https://github.com/adobe/helix-rum-collector/commit/7326f1ed5d05cdd4084e6850733d9d69cb5bde9b))

# [2.15.0](https://github.com/adobe/helix-rum-collector/compare/v2.14.0...v2.15.0) (2024-04-19)


### Features

* trigger release ([520dd7c](https://github.com/adobe/helix-rum-collector/commit/520dd7c4a63ef1b3071e0f6ecfcdc33d6ed54e9e))

# [2.14.0](https://github.com/adobe/helix-rum-collector/compare/v2.13.0...v2.14.0) (2024-04-18)


### Features

* trigger release ([7d8ea1d](https://github.com/adobe/helix-rum-collector/commit/7d8ea1d566d2a908237f910e029e8a09bc22ee89))

# [2.13.0](https://github.com/adobe/helix-rum-collector/compare/v2.12.0...v2.13.0) (2024-04-18)


### Bug Fixes

* adjust test ([1237893](https://github.com/adobe/helix-rum-collector/commit/12378939b8d6c88c1f4e15e1945479ce0aa1d590))


### Features

* enhance Coralogix logs ([#304](https://github.com/adobe/helix-rum-collector/issues/304)) ([df7e161](https://github.com/adobe/helix-rum-collector/commit/df7e161a1b1d9d1ca7e3b9f6ffadd3f71e1ea120))

# [2.12.0](https://github.com/adobe/helix-rum-collector/compare/v2.11.0...v2.12.0) (2024-04-16)


### Features

* **utils:** detect mobile and desktop operating system ([5aa21dc](https://github.com/adobe/helix-rum-collector/commit/5aa21dc816bd68eb7264db525e3c2d1ec8330f9e))
* **utils:** detect more bots ([db59202](https://github.com/adobe/helix-rum-collector/commit/db59202bb4fa9ca8a9be037872c907f2f75d72dd))
* **utils:** detect more bots ([287edcc](https://github.com/adobe/helix-rum-collector/commit/287edcc34b3284c20fbf603d28a98657fcb506ed))

# [2.11.0](https://github.com/adobe/helix-rum-collector/compare/v2.10.1...v2.11.0) (2024-04-16)


### Features

* **coralogix:** log full user agent if it is not normalized ([3f08ad5](https://github.com/adobe/helix-rum-collector/commit/3f08ad5e4471b25aa9f46ce3c6a0e4a5ddfbd097))

## [2.10.1](https://github.com/adobe/helix-rum-collector/compare/v2.10.0...v2.10.1) (2024-04-16)


### Bug Fixes

* **index:** return 200 ([21ac92d](https://github.com/adobe/helix-rum-collector/commit/21ac92d66cb6c4654545ac63599c78011f2fa1b8))
* **index:** run options before everything ([63802d5](https://github.com/adobe/helix-rum-collector/commit/63802d5e4f30880f519dbdc4958d8cd507899725))
* **index:** run options before everything ([ea4a06c](https://github.com/adobe/helix-rum-collector/commit/ea4a06c40c93e03ff8ed5602b77a6138130ee890))
* **index:** support OPTIONS requests for CORS ([978fcc3](https://github.com/adobe/helix-rum-collector/commit/978fcc3b3f57282976efe1b996538b48cb5bd25e))
* **options:** don't return a body ([df5f2c6](https://github.com/adobe/helix-rum-collector/commit/df5f2c680a150562bdb5be4439990708ff5309ee))

# [2.10.0](https://github.com/adobe/helix-rum-collector/compare/v2.9.1...v2.10.0) (2024-03-20)


### Bug Fixes

* add s3 log endpoint ([4602d7d](https://github.com/adobe/helix-rum-collector/commit/4602d7d8e910dd3037cbc7334946ce741b7414de))


### Features

* **logger:** add S3 log target for (experimental) rum-bundler ([7548d43](https://github.com/adobe/helix-rum-collector/commit/7548d43c498aa1f205056ee15dd6744c9c6dc415))

## [2.9.1](https://github.com/adobe/helix-rum-collector/compare/v2.9.0...v2.9.1) (2024-03-20)


### Bug Fixes

* **logger:** support CloudFront-specific user-agent headers ([#288](https://github.com/adobe/helix-rum-collector/issues/288)) ([cdfbbf1](https://github.com/adobe/helix-rum-collector/commit/cdfbbf191c1aca8da34ec0b37135a190cc0e040c))

# [2.9.0](https://github.com/adobe/helix-rum-collector/compare/v2.8.0...v2.9.0) (2024-02-15)


### Bug Fixes

* **coralogix:** adjust error logger message format, too ([866dfbc](https://github.com/adobe/helix-rum-collector/commit/866dfbc9e65c4965243016099ad43f44bbc5df57))


### Features

* **coralogix:** support log format for new ingress endpoint in coralogix ([391b0b2](https://github.com/adobe/helix-rum-collector/commit/391b0b2e2af1d0cc6ce54d285daa6ab6a56e3411))

# [2.8.0](https://github.com/adobe/helix-rum-collector/compare/v2.7.0...v2.8.0) (2024-01-22)


### Features

* **utils:** Evaluate x-adobe-routing if set ([897875a](https://github.com/adobe/helix-rum-collector/commit/897875abaaf6a7778db4be14bd071fee09d606ac))
* **utils:** Evaluate x-adobe-routing if set ([f38ad82](https://github.com/adobe/helix-rum-collector/commit/f38ad823aa171f33cdaaeaa9a012dd5198f26868))

# [2.7.0](https://github.com/adobe/helix-rum-collector/compare/v2.6.0...v2.7.0) (2024-01-17)


### Features

* **utils:** Update extraction of hostname from X-Forwarded-Host to favour AEM hostname ([#256](https://github.com/adobe/helix-rum-collector/issues/256)) ([b233bdd](https://github.com/adobe/helix-rum-collector/commit/b233bdda3d8a8c3ab39064aca2a922c473b07098)), closes [#255](https://github.com/adobe/helix-rum-collector/issues/255)

# [2.6.0](https://github.com/adobe/helix-rum-collector/compare/v2.5.0...v2.6.0) (2024-01-08)


### Features

* **cloudflare:** rum collector available on cloudflare ([abd87cd](https://github.com/adobe/helix-rum-collector/commit/abd87cd784cdf8836dee140f9fc17f1e36fa9845))

# [2.5.0](https://github.com/adobe/helix-rum-collector/compare/v2.4.0...v2.5.0) (2023-11-29)


### Features

* **cloudflare:** Support Cloudflare Logging ([#236](https://github.com/adobe/helix-rum-collector/issues/236)) ([310f8ef](https://github.com/adobe/helix-rum-collector/commit/310f8ef7114a0dadd8158e1367e398e72bd91c03)), closes [#230](https://github.com/adobe/helix-rum-collector/issues/230)

# [2.4.0](https://github.com/adobe/helix-rum-collector/compare/v2.3.0...v2.4.0) (2023-11-29)


### Features

* **utils:** detect bots and spiders based on IAB list ([b4a6cfa](https://github.com/adobe/helix-rum-collector/commit/b4a6cfa13313507e7499a4c15f7b441b41b27389))

# [2.3.0](https://github.com/adobe/helix-rum-collector/compare/v2.2.5...v2.3.0) (2023-11-23)


### Features

* **context:** expose context to main method ([#233](https://github.com/adobe/helix-rum-collector/issues/233)) ([f170ac1](https://github.com/adobe/helix-rum-collector/commit/f170ac14cd2146ea588335fbab84f45e6964790c)), closes [#232](https://github.com/adobe/helix-rum-collector/issues/232)

## [2.2.5](https://github.com/adobe/helix-rum-collector/compare/v2.2.4...v2.2.5) (2023-11-16)


### Bug Fixes

* **fastly:** Dummy commit to trigger a release ([#228](https://github.com/adobe/helix-rum-collector/issues/228)) ([59b976e](https://github.com/adobe/helix-rum-collector/commit/59b976edc11cff502540a1e8d4a401924930d706))

## [2.2.4](https://github.com/adobe/helix-rum-collector/compare/v2.2.3...v2.2.4) (2023-11-09)


### Bug Fixes

* **log:** Limit time-padding value to 1 day ([#226](https://github.com/adobe/helix-rum-collector/issues/226)) ([2827c08](https://github.com/adobe/helix-rum-collector/commit/2827c0838ad0fc7e65e75a61e9591126e7250c8a)), closes [#225](https://github.com/adobe/helix-rum-collector/issues/225)

## [2.2.3](https://github.com/adobe/helix-rum-collector/compare/v2.2.2...v2.2.3) (2023-10-03)


### Bug Fixes

* **unpkg:** only perform GENERATION rewriting for old versions that still have generation support ([fea4cab](https://github.com/adobe/helix-rum-collector/commit/fea4cabded35ac89a334fde26c7b4e48e9d9c912))

## [2.2.2](https://github.com/adobe/helix-rum-collector/compare/v2.2.1...v2.2.2) (2023-09-21)


### Bug Fixes

* **unpkg:** fix the cleaning of response headers ([4ce0035](https://github.com/adobe/helix-rum-collector/commit/4ce00359d2fa803b14e3770e46243a3bb7fe7871))

## [2.2.1](https://github.com/adobe/helix-rum-collector/compare/v2.2.0...v2.2.1) (2023-09-15)


### Bug Fixes

* **log:** reduce entropy on generated IDs for GET requests ([0f61f37](https://github.com/adobe/helix-rum-collector/commit/0f61f37213e4d0f4eba2a9b87825c9c0fde20ba6))

# [2.2.0](https://github.com/adobe/helix-rum-collector/compare/v2.1.3...v2.2.0) (2023-09-11)


### Features

* **logger:** protect privacy by masking user agents ([3b77a96](https://github.com/adobe/helix-rum-collector/commit/3b77a96ff2b57b734fd8da927217e0f7dfb93287)), closes [#193](https://github.com/adobe/helix-rum-collector/issues/193)

## [2.1.3](https://github.com/adobe/helix-rum-collector/compare/v2.1.2...v2.1.3) (2023-09-08)


### Bug Fixes

* **logger:** spread the timestamps a little when time padding is missing ([aa58aa5](https://github.com/adobe/helix-rum-collector/commit/aa58aa58aba6d631006a64a651d569849161e137))

## [2.1.2](https://github.com/adobe/helix-rum-collector/compare/v2.1.1...v2.1.2) (2023-09-08)


### Reverts

* Revert "Revert "Merge pull request #195 from adobe/mask-timestamps"" ([fc7d36c](https://github.com/adobe/helix-rum-collector/commit/fc7d36c512f04f7eb1636e05c6817af3a8a7ac5a)), closes [#195](https://github.com/adobe/helix-rum-collector/issues/195)

## [2.1.1](https://github.com/adobe/helix-rum-collector/compare/v2.1.0...v2.1.1) (2023-09-08)


### Bug Fixes

* **index:** allow empty string as id ([c81b27c](https://github.com/adobe/helix-rum-collector/commit/c81b27ce1d0c1ef4d9611b93ade02bf787211786))

# [2.1.0](https://github.com/adobe/helix-rum-collector/compare/v2.0.0...v2.1.0) (2023-09-08)


### Bug Fixes

* **logger:** move triple slash reference types to correct source file ([e384814](https://github.com/adobe/helix-rum-collector/commit/e384814d60c536eae97d9b54398427f573ccfcf2))
* **test:** fix test coverage tool ([de41c4a](https://github.com/adobe/helix-rum-collector/commit/de41c4a3ee72712e18350dc73c6ac6aa31b3d07e))
* **test:** fix test coverage tool ([fd23ab4](https://github.com/adobe/helix-rum-collector/commit/fd23ab4c95441229213a68c88b144633560fbb6c))
* **test:** fix test coverage tool ([f900111](https://github.com/adobe/helix-rum-collector/commit/f900111fdf8f8c4890e96804ed8bea193d8ca194))


### Features

* **logger:** protect privacy by masking timestamps ([cd5c97c](https://github.com/adobe/helix-rum-collector/commit/cd5c97c45c7e15606f078058f2010fee0e2d1654)), closes [#192](https://github.com/adobe/helix-rum-collector/issues/192)

# [2.0.0](https://github.com/adobe/helix-rum-collector/compare/v1.16.4...v2.0.0) (2023-09-05)


### Bug Fixes

* **logger:** clean URLs from request parameters no matter where they are found ([7904b38](https://github.com/adobe/helix-rum-collector/commit/7904b38eff46564184b93945b1dfd774144e6288))


### Features

* **logger:** do not log url params by default ([53307f5](https://github.com/adobe/helix-rum-collector/commit/53307f5f6d6e79dfd09a9b168ce30ea7f973a37a))
* **utils:** if url is not valid, return it unchanged ([b2dadcf](https://github.com/adobe/helix-rum-collector/commit/b2dadcf3f119405f271243d031c87bd33416d709))


### BREAKING CHANGES

* **logger:** This is a breaking change because it changes the default behavior of the logger and drops URL params

## [1.16.4](https://github.com/adobe/helix-rum-collector/compare/v1.16.3...v1.16.4) (2023-07-05)


### Bug Fixes

* **google:** pass url into hostname detection ([2248da1](https://github.com/adobe/helix-rum-collector/commit/2248da10a8ba6a16f03da7b8372595f5e19736f6))
* **google:** use correct url value ([2221166](https://github.com/adobe/helix-rum-collector/commit/2221166baf976b267deb2ab1bd6d8208de952763))

## [1.16.3](https://github.com/adobe/helix-rum-collector/compare/v1.16.2...v1.16.3) (2023-05-16)


### Bug Fixes

* **google:** allow dealing with incomplete referrer URLs ([c0c3a77](https://github.com/adobe/helix-rum-collector/commit/c0c3a77cae3d8a6e13547e8964141ac979f0fa07))

## [1.16.2](https://github.com/adobe/helix-rum-collector/compare/v1.16.1...v1.16.2) (2023-05-02)


### Bug Fixes

* use node 18 ([c459a66](https://github.com/adobe/helix-rum-collector/commit/c459a66b837b64bdbef3169855413edb169cbcca))

## [1.16.1](https://github.com/adobe/helix-rum-collector/compare/v1.16.0...v1.16.1) (2022-08-02)


### Bug Fixes

* **deps:** update external fixes ([6e019f6](https://github.com/adobe/helix-rum-collector/commit/6e019f63c64972d79923c7dbb97015abb5c4bebe))

# [1.16.0](https://github.com/adobe/helix-rum-collector/compare/v1.15.1...v1.16.0) (2022-07-08)


### Features

* **unpkg:** serve any helix-rum packages ([e43daab](https://github.com/adobe/helix-rum-collector/commit/e43daab94af6dab86159ba6cf95031cdd03e8704))

## [1.15.1](https://github.com/adobe/helix-rum-collector/compare/v1.15.0...v1.15.1) (2022-06-27)


### Bug Fixes

* **deps:** update external fixes ([f75f9f3](https://github.com/adobe/helix-rum-collector/commit/f75f9f3078ee4ac88cff2d6b895a2ba9eb37231e))

# [1.15.0](https://github.com/adobe/helix-rum-collector/compare/v1.14.9...v1.15.0) (2022-05-24)


### Features

* **coralogix:** raise the severity of `checkpoint: error` to `error` ([dfec958](https://github.com/adobe/helix-rum-collector/commit/dfec958d26e6027de2343712e9ab107cd6beaeb1))

## [1.14.9](https://github.com/adobe/helix-rum-collector/compare/v1.14.8...v1.14.9) (2022-05-09)


### Bug Fixes

* **release:** send release notifications to helix-noisy ([1c9cce6](https://github.com/adobe/helix-rum-collector/commit/1c9cce6357d3fdcb3983ba9748916291871c6c6b))

## [1.14.8](https://github.com/adobe/helix-rum-collector/compare/v1.14.7...v1.14.8) (2022-05-09)


### Bug Fixes

* **release:** notify slack upon release ([2f9e6e2](https://github.com/adobe/helix-rum-collector/commit/2f9e6e2df7baeedde397b5fb3541a75698039e00))

## [1.14.7](https://github.com/adobe/helix-rum-collector/compare/v1.14.6...v1.14.7) (2022-05-06)


### Bug Fixes

* **release:** change release plugin order ([1e06bca](https://github.com/adobe/helix-rum-collector/commit/1e06bcad6da22c70b6479690bf76643be4e52195))
* **release:** use newer plugin version ([cc7f9aa](https://github.com/adobe/helix-rum-collector/commit/cc7f9aa316d1dfb986b567f958e2f7cc8890bc31))

## [1.14.6](https://github.com/adobe/helix-rum-collector/compare/v1.14.5...v1.14.6) (2022-05-06)


### Bug Fixes

* **deps:** bump semantic-release-coralogix plugin version ([97a37d6](https://github.com/adobe/helix-rum-collector/commit/97a37d6d896dc5947df767fb1fc23abd96a33272))
* force release ([c8e8731](https://github.com/adobe/helix-rum-collector/commit/c8e8731e2d935f3df583028fa3f872e08f8446de))

## [1.14.5](https://github.com/adobe/helix-rum-collector/compare/v1.14.4...v1.14.5) (2022-05-06)


### Bug Fixes

* force release ([23a0f19](https://github.com/adobe/helix-rum-collector/commit/23a0f19b3230361adb0c12527eb0a6cea18bc1de))

## [1.14.4](https://github.com/adobe/helix-rum-collector/compare/v1.14.3...v1.14.4) (2022-05-06)


### Bug Fixes

* force release ([a9062e7](https://github.com/adobe/helix-rum-collector/commit/a9062e7d2d3dc4b3441c765067213c5f4c4f680c))

## [1.14.3](https://github.com/adobe/helix-rum-collector/compare/v1.14.2...v1.14.3) (2022-04-26)


### Bug Fixes

* **release:** add icon to release tag ([37414c6](https://github.com/adobe/helix-rum-collector/commit/37414c6f01e828709776b7acf8a180bb6a27aa31))

## [1.14.2](https://github.com/adobe/helix-rum-collector/compare/v1.14.1...v1.14.2) (2022-04-26)


### Bug Fixes

* **release:** use separate api key for tagging ([b320c05](https://github.com/adobe/helix-rum-collector/commit/b320c059fce77fe8a87165fb436fb21364c1693c))

## [1.14.1](https://github.com/adobe/helix-rum-collector/compare/v1.14.0...v1.14.1) (2022-04-26)


### Bug Fixes

* **release:** tag releases in coralogix ([b159022](https://github.com/adobe/helix-rum-collector/commit/b159022b2cf9aef204ef11a5ded8416f9f3b0125))

# [1.14.0](https://github.com/adobe/helix-rum-collector/compare/v1.13.0...v1.14.0) (2022-04-26)


### Features

* **google:** log to clustered table ([fefb3d5](https://github.com/adobe/helix-rum-collector/commit/fefb3d545be338c80e6d89f5dcb9a1bdea738f48))
* **google:** partition and cluster data by hostname and timestamp ([3d77c9e](https://github.com/adobe/helix-rum-collector/commit/3d77c9eb2f117e0e36f8a8258738d3daf74b0583))

# [1.13.0](https://github.com/adobe/helix-rum-collector/compare/v1.12.1...v1.13.0) (2022-02-27)


### Bug Fixes

* **deps:** update external fixes ([#73](https://github.com/adobe/helix-rum-collector/issues/73)) ([354d5db](https://github.com/adobe/helix-rum-collector/commit/354d5db1fba57be6257b6bbaac40b7caa91fb121))
* **deps:** update external fixes ([#74](https://github.com/adobe/helix-rum-collector/issues/74)) ([de74d29](https://github.com/adobe/helix-rum-collector/commit/de74d294cdba007101409daa364dc812b4bf33d6))
* **index:** fix error logging ([963cdc7](https://github.com/adobe/helix-rum-collector/commit/963cdc74d7690c5a007a773b26729ee21f1e4909))
* **unpkg:** avoid avoidable errors ([74e4fb1](https://github.com/adobe/helix-rum-collector/commit/74e4fb1c5c1d775fc0c94916f93dd5633b07d986))
* **unpkg:** make generation parameter optional for version string injection ([0d76197](https://github.com/adobe/helix-rum-collector/commit/0d761973e42c1d1514a90010de9ce9eac8f63f93))


### Features

* **delivery:** serve helix-rum-js if requested ([55ceedc](https://github.com/adobe/helix-rum-collector/commit/55ceedc5d657278a8f79f2bd0dd324f3167f1b49))
* **unpkg:** add default generation based on version number ([b20c057](https://github.com/adobe/helix-rum-collector/commit/b20c057f4f02ece952fbc0408032b5505adf0b6e))
* **unpkg:** add string replacement feature ([07bc6ba](https://github.com/adobe/helix-rum-collector/commit/07bc6ba54ea63ced9d391a89e4c426f5ea1be8a5))
* **unpkg:** allow second-order redirects ([5497366](https://github.com/adobe/helix-rum-collector/commit/549736624bdf3af00a76d5498bde62b8b42bce46))

## [1.12.1](https://github.com/adobe/helix-rum-collector/compare/v1.12.0...v1.12.1) (2022-01-21)


### Bug Fixes

* **web-vitals:** allow loading from anywhere ([a219853](https://github.com/adobe/helix-rum-collector/commit/a2198531c0aedf070fdb5d3c754d0d227a108269))

# [1.12.0](https://github.com/adobe/helix-rum-collector/compare/v1.11.0...v1.12.0) (2022-01-20)


### Bug Fixes

* **robots:** use correct pathname for robots.txt ([4a3375c](https://github.com/adobe/helix-rum-collector/commit/4a3375c091f33f7e4cb12c37f65f0d9ee2ae83f9))
* **web-vitals:** do not cache redirects forever ([0d3c3c7](https://github.com/adobe/helix-rum-collector/commit/0d3c3c727fb1a8813ff5bf822b706d54cfecbc32))


### Features

* add robots.txt response ([6cb7668](https://github.com/adobe/helix-rum-collector/commit/6cb766810ec6a5ae0ef7c69534dfab72c1609b4f))
* **web-vitals:** clean up response headers ([81a51e1](https://github.com/adobe/helix-rum-collector/commit/81a51e183bd2a53f95b08403ac4f94bea913fd59))
* **web-vitals:** serve web-vitals module from rum collector ([cdb7ea4](https://github.com/adobe/helix-rum-collector/commit/cdb7ea4d1ba9bd79dfe3d8058d8112af6be7d935))

# [1.11.0](https://github.com/adobe/helix-rum-collector/compare/v1.10.0...v1.11.0) (2021-12-07)


### Features

* **index:** support `source` property ([1b21486](https://github.com/adobe/helix-rum-collector/commit/1b21486f39b874576eabb9f23c1655728eefa02f))

# [1.10.0](https://github.com/adobe/helix-rum-collector/compare/v1.9.1...v1.10.0) (2021-11-23)


### Features

* **rum:** add target property ([5299e7d](https://github.com/adobe/helix-rum-collector/commit/5299e7de4d717bcd022dd301e0140154be90252d))

## [1.9.1](https://github.com/adobe/helix-rum-collector/compare/v1.9.0...v1.9.1) (2021-11-15)


### Bug Fixes

* **deps:** update external fixes ([#56](https://github.com/adobe/helix-rum-collector/issues/56)) ([0a76aae](https://github.com/adobe/helix-rum-collector/commit/0a76aae5a0e4fcbb63f206c047023f17520e09bc))

# [1.9.0](https://github.com/adobe/helix-rum-collector/compare/v1.8.0...v1.9.0) (2021-09-28)


### Features

* **rum:** generate ID for some get requests ([5457472](https://github.com/adobe/helix-rum-collector/commit/5457472b169a15fbd0acd5e6b490c399e44ddca2)), closes [#41](https://github.com/adobe/helix-rum-collector/issues/41)

# [1.8.0](https://github.com/adobe/helix-rum-collector/compare/v1.7.1...v1.8.0) (2021-09-28)


### Features

* **logging:** log all errors to coralogix ([71fc037](https://github.com/adobe/helix-rum-collector/commit/71fc037479b45f405de3f528e69205d824722ae1))

## [1.7.1](https://github.com/adobe/helix-rum-collector/compare/v1.7.0...v1.7.1) (2021-09-27)


### Bug Fixes

* **deps:** pin dependencies ([d074611](https://github.com/adobe/helix-rum-collector/commit/d0746111f401262776562e93cd8f5c85d62d3ac6))

# [1.7.0](https://github.com/adobe/helix-rum-collector/compare/v1.6.0...v1.7.0) (2021-09-21)


### Bug Fixes

* **index:** do not import from as-compute ([8f842a4](https://github.com/adobe/helix-rum-collector/commit/8f842a4eb078f88535ed2341f3dff611aef0ff71))


### Features

* **index:** add ability to collect data via GET request and `data` URL parameter ([fdb3310](https://github.com/adobe/helix-rum-collector/commit/fdb3310ad3e0cfb5c6fa109c4e34de3048f12424))

# [1.6.0](https://github.com/adobe/helix-rum-collector/compare/v1.5.0...v1.6.0) (2021-09-17)


### Features

* **checkpoints:** add a new `checkpoint` data point ([30109d0](https://github.com/adobe/helix-rum-collector/commit/30109d06b53da744a2e56af734622898cf6b36c7)), closes [#34](https://github.com/adobe/helix-rum-collector/issues/34)

# [1.5.0](https://github.com/adobe/helix-rum-collector/compare/v1.4.0...v1.5.0) (2021-08-30)


### Features

* **referer:** both spelings of referrer are beautifull ([3db4669](https://github.com/adobe/helix-rum-collector/commit/3db4669e841c50cac86d62f5d9ae6177df06e798))

# [1.4.0](https://github.com/adobe/helix-rum-collector/compare/v1.3.0...v1.4.0) (2021-08-26)


### Bug Fixes

* **index:** additional request type checking ([b1ca9f6](https://github.com/adobe/helix-rum-collector/commit/b1ca9f68c6d404ab4451a03d1b87b1d6fc2d9210))
* **index:** additional request type checking ([d769a1d](https://github.com/adobe/helix-rum-collector/commit/d769a1d941fce5e373b7809eec05cbc193e8ff14))
* **index:** additional request type checking ([9d5799f](https://github.com/adobe/helix-rum-collector/commit/9d5799f5c2c3a104e21c7ac53bbeb40b5a4376a5))


### Features

* **google:** track generation ([4d54392](https://github.com/adobe/helix-rum-collector/commit/4d54392d67ed5faafafdc9bc53d1ebd6cea9c2e1))
* **index:** additional request type checking ([1f7d102](https://github.com/adobe/helix-rum-collector/commit/1f7d102e601d9b9689532075675478e61e0a1005))
* **rum:** add `generation` field for detailed change tracking (defaults to current month and year) and `referer` (one `r`, just like the HTTP spec says) for more accurate referrer tracking when using third-party mode ([a8b3747](https://github.com/adobe/helix-rum-collector/commit/a8b3747a548183dd9e271c3ab480e9f913a24b46))

# [1.3.0](https://github.com/adobe/helix-rum-collector/compare/v1.2.3...v1.3.0) (2021-07-30)


### Bug Fixes

* **index:** use correct imports ([b930918](https://github.com/adobe/helix-rum-collector/commit/b930918b65da2ca2f7d67172e40abf08e3666035))


### Features

* **google:** log to bigquery ([8bca8f1](https://github.com/adobe/helix-rum-collector/commit/8bca8f1ded8f09491641b53bfe78e8b9b6f54d01))
* **logging:** log to coralogix ([01f5216](https://github.com/adobe/helix-rum-collector/commit/01f52160d4a6445b5a71a551e592d58c07893e30))

## [1.2.3](https://github.com/adobe/helix-rum-collector/compare/v1.2.2...v1.2.3) (2021-07-11)


### Bug Fixes

* **deps:** update external fixes ([#27](https://github.com/adobe/helix-rum-collector/issues/27)) ([33aa7f8](https://github.com/adobe/helix-rum-collector/commit/33aa7f8826fc74d191b6e0fef628264c69c54b7f))

## [1.2.2](https://github.com/adobe/helix-rum-collector/compare/v1.2.1...v1.2.2) (2021-07-02)


### Bug Fixes

* **assembly:** the earlier refactoring merged from [#9](https://github.com/adobe/helix-rum-collector/issues/9) is also a fix for a 500 from C@E ([e61aa0f](https://github.com/adobe/helix-rum-collector/commit/e61aa0fdb8cfd76d364d69609de7509580d5da1d))

## [1.2.1](https://github.com/adobe/helix-rum-collector/compare/v1.2.0...v1.2.1) (2021-06-22)


### Bug Fixes

* **deps:** bumped as-compute version to 0.4.0 ([3cc19a1](https://github.com/adobe/helix-rum-collector/commit/3cc19a1ec5b72d44a90ba9d1674da52065a13b16))

# [1.2.0](https://github.com/adobe/helix-rum-collector/compare/v1.1.0...v1.2.0) (2021-06-04)


### Features

* allow cwv to be omitted ([#15](https://github.com/adobe/helix-rum-collector/issues/15)) ([b24db7f](https://github.com/adobe/helix-rum-collector/commit/b24db7f8917aa85844469efb3809a5edcc8e1569))

# [1.1.0](https://github.com/adobe/helix-rum-collector/compare/v1.0.1...v1.1.0) (2021-06-04)


### Features

* **index:** more detailed error reporting using x-error ([ece542b](https://github.com/adobe/helix-rum-collector/commit/ece542bf63a9592c80e592ee757db3f66a692390))

## [1.0.1](https://github.com/adobe/helix-rum-collector/compare/v1.0.0...v1.0.1) (2021-06-04)


### Bug Fixes

* **deps:** bump assembly-script-related dependencies ([fe9e18f](https://github.com/adobe/helix-rum-collector/commit/fe9e18f6792c0f84a5dfb31f0d7adf3cc2f3ee47))

# 1.0.0 (2021-06-03)


### Bug Fixes

* use most significant xfh as host replacement ([40b8b27](https://github.com/adobe/helix-rum-collector/commit/40b8b271ecd1fcce21a8e5eb9f58a98262ce6c97))
* **google:** do not log URL twice ([a355c81](https://github.com/adobe/helix-rum-collector/commit/a355c81af52dce0053a57ef113560e20e625eb3d))
* **index:** log the actual cwv values ([d4b8391](https://github.com/adobe/helix-rum-collector/commit/d4b83916c1cd4f9d1e69c57aa3b5be52ea320de0))
* **index:** reject missing body as 400 ([52a276f](https://github.com/adobe/helix-rum-collector/commit/52a276faa309ecf7cd0b059ba7d45ecf99b11325))


### Features

* **collection:** require weight and id attributes ([56da696](https://github.com/adobe/helix-rum-collector/commit/56da6966910df3231af9f1c907bcaff58c60ac7a))
* **google:** log to google ([2bb4751](https://github.com/adobe/helix-rum-collector/commit/2bb475172373fc029041632bed4e575b3c608da1))
* **rum:** log to coralogix ([16f73d1](https://github.com/adobe/helix-rum-collector/commit/16f73d183a2a9209846f3afa27304973ed40be7f))
* intitial project setup ([a955704](https://github.com/adobe/helix-rum-collector/commit/a955704a9dfb3f3d98253db593ac5cfbffec98e3))

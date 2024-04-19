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

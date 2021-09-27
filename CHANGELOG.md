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

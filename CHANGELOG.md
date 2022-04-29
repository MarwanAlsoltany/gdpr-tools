# Changelog

All notable changes to **GDPR-Tools** will be documented in this file.

<br />

## [[1.1.0] - 2021-04-29](https://github.com/MarwanAlsoltany/gdpr-tools/compare/v1.0.1...v1.1.0)
> This update is a breaking change if the `$appends` argument in `sanitizeData()` and/or `sanitizeApp()` methods is used.
- Update `Sanitizer` class:
    - Add `$whitelist` property.
    - Add `setWhitelist()` method.
    - Update `sanitizeData()` method by adding a new arguments.
    - Update `sanitizeApp()` method by adding a new arguments.
    - Add `getDomains()` method.
    - Update `getSearchPattern()` method to make use of whitelisted domains.
- Update tests:
    - Update `SanitizerTest` class.

<br />

## [[1.0.1] - 2021-04-25](https://github.com/MarwanAlsoltany/gdpr-tools/compare/v1.0.0...v1.0.1)
- Update `Sanitizer` class:
    - Update `sanitizeApp()` method to prevent infinite loops when closing open buffers.

<br />

## [[1.0.0] - 2021-04-25](https://github.com/MarwanAlsoltany/gdpr-tools/commits/v1.0.0)
- Initial release.

<br />

## [Unreleased]

<br />

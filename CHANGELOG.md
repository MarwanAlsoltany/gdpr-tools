# Changelog

All notable changes to **GDPR-Tools** will be documented in this file.

<br />

## [[1.2.0] - 2022-07-28](https://github.com/MarwanAlsoltany/gdpr-tools/compare/v1.1.0...v1.2.0)
- Update `Sanitizer` class:
    - Make the class not final.
    - Add `$appends` property.
    - Add `setAppends()` method.
    - Add `bootstrap()` method.
    - Update `getReplaceCallback()` method:
        - Add new attribute `data-consent-alternative` to the sanitized elements.
    - Update `sanitizeData()` method.
    - Update `sanitizeApp()` method.
- Add `AbstractCmpHelper` JS class.
- Add `ConcreteCmpHelper` JS class.
- Add `main.js` JavaScript SDK entry file.
- Add `cmp-helper.js` (compiled JavaScript SDK).
- Add `cmp-helper.config.js` (JavaScript SDK config file).
- Add `gdpr-tools.php` file.
- Add `gdpr-tools.config.php` file.
- Add `main.php` package entry file.
- Add `compile` executable.
- Update tests.

<br />

## [[1.1.0] - 2022-04-29](https://github.com/MarwanAlsoltany/gdpr-tools/compare/v1.0.1...v1.1.0)
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

## [[1.0.1] - 2022-04-25](https://github.com/MarwanAlsoltany/gdpr-tools/compare/v1.0.0...v1.0.1)
- Update `Sanitizer` class:
    - Update `sanitizeApp()` method to prevent infinite loops when closing open buffers.

<br />

## [[1.0.0] - 2022-04-25](https://github.com/MarwanAlsoltany/gdpr-tools/commits/v1.0.0)
- Initial release.

<br />

## [Unreleased]

<br />

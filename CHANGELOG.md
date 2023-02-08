# Changelog

All notable changes to **GDPR-Tools** will be documented in this file.

<br />

## [[1.4.1] - 2023-02-08](https://github.com/MarwanAlsoltany/gdpr-tools/compare/v1.4.0...v1.4.1)
- Update `AbstractCmpHelper` class:
    - Make all dispatched events receive the helper object in detail.
    - Make all dispatched events cancelable, do not bubble and not composed.
- Update `cmp-helper.config.js`:
    - Switch listened on event target from document to window.
    - Update event listener options to make sure it is the first.
    - Add a check for cmpHelper object existence in window.
    - Add a check to make sure the listened on event is trusted.

<br />

## [[1.4.0] - 2022-11-21](https://github.com/MarwanAlsoltany/gdpr-tools/compare/v1.3.0...v1.4.0)
- Update `AbstractCmpHelper` class:
    - Add new attribute `data-consent-decorates` to allow for teleporting element decoration elsewhere on the DOM.
    - Add `refresh()` method.
    - Add `getElementServiceName()` method.
    - Add `getElementCategoryName()` method.
    - Add `isDecoratable()` method.
    - Update `constructor()` method to listen on window resize to update overlay views.
    - Update `activate()` method to make use of `isDecoratable()`.
    - Update `deactivate()` method to make use of `isDecoratable()`.
    - Update `update()` method to change dispatched event name from `CmpHelperElementOnUpdate` to `CmpHelperOnUpdate`.
    - Update `decorate()` method to make use of `data-consent-decorates` attributes.
    - Update `undecorate()` method to make use of `data-consent-decorates` attributes.
    - Update `createDecoration()` method.
    - Fix properties and methods DocBlocks.
- Update `gdpr-tools.php`:
    - Make injected script always the first script.
- Recompile `cmp-helper.js`.

<br />

## [[1.3.0] - 2022-11-10](https://github.com/MarwanAlsoltany/gdpr-tools/compare/v1.2.2...v1.3.0)
> NOTE: This update should be fully backwards compatible. Attention may be required for projects using `gdpr-tools.phar`, as the way how the Frontend SDK is added to the document has been changed. It used to be appended to the `<body />` element. Starting from `v1.3.0` it will be inserted directly AFTER the `<title />` element to make sure it is the first script added to the document. The major change was introduced as some CMPs were prevent GDPR-Tools Frontend SDK from executing using the `beforescriptexecute` event. People using GDPR-Tools as a dependency via Composer shouldn't experience and change in behavior. 
- Update `Sanitizer` class:
    - Add `INJECTION_MODE_*` class constants:
        - `INJECTION_MODE_PREPEND`
        - `INJECTION_MODE_APPEND`
        - `INJECTION_MODE_BEFORE`
        - `INJECTION_MODE_AFTER`
    - Add `INJECTION_MODES` class constant
    - Add `inject()` method to simplify DOM manipulation.
    - Add `$prepends` property.
    - Add `setPrepends()` method.
    - Add `prepend()` method.
    - Update `append()` method to make use of `inject()` method.
- Update `Sanitizer` class:
    - Update `sanitizeData()` method to add new parameters `$prepends` and `$injections`.
    - Update `sanitizeApp()` method to add new parameters `$prepends` and `$injections`.
    - Update `getURIs()` method.
    - Update `getReplaceCallback()` method.
- Update `gdpr-tools.config.php`:
    - Add new config fields `prepends` and `injections`.
- Update `gdpr-tools.php`.
    - Make use of the newly created config fields (`prepends` and `injections`).
- Update `cmp-helper.config.js`:
    - Initialize `ConcreteCmpHelper` after document load.
    - Log some info GDPR-Tools in the console.
- Update tests:
    - Update `SanitizerTest` class.

<br />

## [[1.2.2] - 2022-08-17](https://github.com/MarwanAlsoltany/gdpr-tools/compare/v1.2.1...v1.2.2)
- No notable changes:
    - Fix typos.
    - Documentation improvements.

<br />

## [[1.2.1] - 2022-07-29](https://github.com/MarwanAlsoltany/gdpr-tools/compare/v1.2.0...v1.2.1)
- Update `AbstractCmpHelper` JS class:
    - Fix typo in `config` variable (`config.decoration` -> `config.decorations`).
- Recompile `cmp-helper.js`.
- Update `gdpr-tools.php`:
    - Add return type-hints to helper functions.
- General improvements, better documentation and CS fixes.

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

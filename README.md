<h1 align="center">GDPR-Tools</h1>

<div align="center">

Sanitize any PHP application HTML response to be GDPR compliant.


[![PHP Version][php-icon]][php-href]
[![Latest Version on Packagist][version-icon]][version-href]
[![Total Downloads][downloads-icon]][downloads-href]
[![License][license-icon]][license-href]
[![Maintenance][maintenance-icon]][maintenance-href]
[![Documentation][documentation-icon]][documentation-href]
[![Travis Build Status][travis-icon]][travis-href]
[![codecov][codecov-icon]][codecov-href]

[![Tweet][tweet-icon]][tweet-href] [![Star][github-icon]][github-href]



<details>
<summary>Table of Contents</summary>
<p>

[Installation](#installation)<br/>
[About GDPR-Tools](#about-gdpr-tools)<br/>
[How Does It Work](#how-does-it-work)<br/>
[Changelog](./CHANGELOG.md)<br/>
[Documentation](https://marwanalsoltany.com/gdpr-tools)

</p>
</details>

<br/>

<sup>If you like this project, giving it a :star: would be appreciated!</sup>

Do you feel like reading? Check out the full API on the documentation website on <br/>[`marwanalsoltany.github.io/gdpr-tools`](https://marwanalsoltany.github.io/gdpr-tools).

</div>


---


## Key Features

1. Zero dependencies
2. Minimal, intuitive and easy to get along with
3. Integrates easily in any application

---


## Installation

#### Using Composer:

```sh
composer require marwanalsoltany/gdpr-tools
```

#### Using Git:

```sh
git clone https://github.com/MarwanAlsoltany/gdpr-tools.git
```

#### Using Source:

Download [GDPR-Tools](https://github.com/MarwanAlsoltany/gdpr-tools/releases) as a `.zip` or `.tar.gz` and extract it where ever you like in you web server.


---


## About GDPR-Tools

GDPR-Tools is a simple and a fast way that help making an application [GDPR](https://gdpr.eu/what-is-gdpr/) compliant.
In short, GDPR is a set of rules and regulations that are designed to ensure that data is handled in a way that is compatible with the principles of the European Union's General Data Protection Regulation.


### Why does GDPR-Tools exist?

Normally, if you are building a new application, you must make the application GDPR compliant as you're building the app, but this is mostly not the case. If you have an application that is already built and you want to make it GDPR compliant, you have to go through the code again to see which elements load external resources and try to implement a way to make them load after client consent. There are also other stuff like iFrames and any other embeddable resources that get added by editors or plugins (in a CMS for example), these all must be blocked until the user gives consent depending on their category.

Trying to block these resources in the client side **is not possible** because the browser does not given possibility to stop/prevent sending any request to the external resource via JavaScript.

GDPR-Tools was created to solve that specific problem, make the HTML returned by the server side doesn't make any request to any external (3rd-Party) before user consent in the client side. It does that by sanitizing all HTML elements that load external resources (scripts, stylesheets, images, etc.), the sanitization is done in the form of replacing the values of attributes that load the resource with new values and setting the old values in `data-` attributes to be handled later in client side code.

![#1e90ff](https://via.placeholder.com/11/1e90ff/000000?text=+) **Fact:** *GDPR-Tools is not a plug-and-play solution, it takes care only of the server side part, you still have to take care of the client side part. See [**./src/Frontend/consent.js**](./src/Frontend/consent.js) to get started.*


---


## How Does it Work?

You can use GDPR-Tools in two ways:

1. The first and the recommended way is to listen to some event that fires before sending the response back to the client. For example in a Symfony application, this would be the `kernel.response` event. Note that you have to make sure that GDPR-Tools listener is the last listener).

```php

public function onKernelResponse(\Symfony\Component\HttpKernel\Event\ResponseEvent $event)
{
    $response = $event->getResponse();
    $content  = $response->getContent();

    $sanitizedContent = $this->getSanitizedContent($content);

    $response->setContent($sanitizedContent);
}

private function getSanitizedContent(string $content)
{
    // the condition that determines whether to sanitize the content or not
    $condition = function ($data) {
         // only html responses
         // or you can also check for some consent cookie here
         return stripos($data, '<!DOCTYPE html>') !== false;
    };

    // the temporary URIs/URLs to set for the sanitized elements
    $uris = [
       'link'   => sprintf('data:text/css;charset=UTF-8;base64,%s', base64_encode('body::after{content:"Consent Please";color:orangered}')),
       'script' => sprintf('data:text/javascript;charset=UTF-8;base64,%s', base64_encode('console.warn("Script Blocked!")')),
       'iframe' => sprintf('data:text/html;charset=UTF-8;base64,%s', base64_encode('<div>Consent Please!</div>')),
    ];

    // the data to append to the final html
    $appends = [
         'body' => [
             '<script defer src="/path/to/client-side-code.js"></script>',
         ],
    ];

    $sanitizedHTML = (new \MAKS\GDPRTools\Backend\Sanitizer())
         ->setData($html)
         ->setCondition($condition)
         ->setURIs($uris)
         ->sanitize()
         ->append($appends['body'][0], 'body')
         ->get();

    // or simply
    // $sanitizedHTML = (new \MAKS\GDPRTools\Backend\Sanitizer())->sanitizeData($html, $condition, $uris, $appends);

    return $sanitizedHTML;
}

```

2. The sound way, is to proxy app entry point. If you don't have the luxury of using some kind of event, you can make GDPR-Tools your entry point for the application.
```php

// first, you need to rename the application entry point to something else,
// let's say `index.php` is the entry point, so `index.php` becomes `app.php`

// second, make a new file with the same name as the old name of app entry point
// in our case it's `index.php`, the content of this new file would be something like this:

include '/path/to/gdpr-tools/src/Backend/Sanitizer.php';

// check out the `$condition`, `$uris`, `$appends` variables from the previous example
\MAKS\GDPRTools\Backend\Sanitizer::sanitizeApp('./app.php', $condition, $uris, $appends);

```

![#32cd32](https://via.placeholder.com/11/32cd32/000000?text=+) **Advice:** *The `\MAKS\GDPRTools\Backend\Sanitizer` is well documented, check out the DocBlocks of its properties and methods to learn more.*

### What Elements are Sanitized?

By default these elements (and attributes) will be sanitized if they point to a resource that is **NOT** on the same domain as the application (not same-origin):
- `<link href="" />`
- `<script src="" />`
- `<iframe src="" />`
- `<embed src="" />`
- `<img src="" srcset="" />`
- `<audio src="" />`
- `<video src="" poster="" />`
- `<source src="" srcset="" />`
- `<track src="" />`
- `<object data="" />`

See [`\MAKS\GDPRTools\Backend\Sanitizer::ELEMENTS`](./src/Backend/Sanitizer.php) to see all the elements that are sanitized by default.

### How Do the Sanitized Elements Look Like?

Each sanitized element will contain these attributes:
- `data-consent-element`:
    - The sanitized element tag name
- `data-consent-attribute`:
    - The sanitized attribute name
- `data-consent-value`:
    - The sanitized attribute value
- `data-consent-original-{{ sanitizedAttribute:[href|src|srcset|poster|data] }}` e.g. `data-consent-original-src`:
    - The original value of the sanitized attribute, this is useful when an element contains more than one sanitizable attribute, the second and third data-attributes will be overwritten when the second attribute is sanitized.

If want to name these attributes something else, you can provide custom names using the `\MAKS\GDPRTools\Backend\Sanitizer::$attributes` static property:

```php

\MAKS\GDPRTools\Backend\Sanitizer::$attributes = [
    'data-consent-element' => 'data-gdpr-element',
    'data-consent-attribute' => 'data-gdpr-attribute',
    'data-consent-value' => 'data-gdpr-value',
    // data-consent-original-(href|src|srcset|poster|data)
    'data-consent-original-src' => 'data-gdpr-original-src',
];

```

![#ff6347](https://via.placeholder.com/11/f03c15/000000?text=+) **Note:** *The name GDPR-Tools may suggest that this package contains a lot of stuff. On the contrary, it includes currently only the [`\MAKS\GDPRTools\Backend\Sanitizer`](./src/Backend/Sanitizer.php) class, but this may change in the future as there may be new requirements/needs.*

---


## License

GDPR-Tools is an open-source project licensed under the [**MIT**](./LICENSE) license.
<br/>
Copyright (c) 2022 Marwan Al-Soltany. All rights reserved.
<br/>










[php-icon]: https://img.shields.io/badge/php-%3D%3C7.4-yellow?style=flat&logo=php
[version-icon]: https://img.shields.io/packagist/v/marwanalsoltany/gdpr-tools.svg?style=flat&logo=packagist
[downloads-icon]: https://img.shields.io/packagist/dt/marwanalsoltany/gdpr-tools.svg?style=flat&logo=packagist
[license-icon]: https://img.shields.io/badge/license-MIT-red.svg?style=flat&logo=github
[maintenance-icon]: https://img.shields.io/badge/maintained-yes-orange.svg?style=flat&logo=github
[documentation-icon]: https://img.shields.io/website-up-down-blue-red/http/marwanalsoltany.com/gdpr-tools.svg
[travis-icon]: https://img.shields.io/travis/com/MarwanAlsoltany/gdpr-tools/master.svg?style=flat&logo=travis
[tweet-icon]: https://img.shields.io/twitter/url/http/shields.io.svg?style=social
[github-icon]: https://img.shields.io/github/stars/MarwanAlsoltany/gdpr-tools.svg?style=social&label=Star
[codecov-icon]: https://codecov.io/gh/MarwanAlsoltany/gdpr-tools/branch/master/graph/badge.svg

[php-href]: https://github.com/MarwanAlsoltany/gdpr-tools/search?l=php
[version-href]: https://packagist.org/packages/marwanalsoltany/gdpr-tools
[downloads-href]: https://packagist.org/packages/marwanalsoltany/gdpr-tools/stats
[license-href]: ./LICENSE
[maintenance-href]: https://github.com/MarwanAlsoltany/gdpr-tools/graphs/commit-activity
[documentation-href]: https://marwanalsoltany.github.io/gdpr-tools
[travis-href]: https://travis-ci.com/MarwanAlsoltany/gdpr-tools
[tweet-href]: https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2FMarwanAlsoltany%2Fgdpr-tools&text=Make%20any%20PHP%20application%20GDPR%20compliant
[github-href]: https://github.com/MarwanAlsoltany/gdpr-tools/stargazers
[codecov-href]: https://codecov.io/gh/MarwanAlsoltany/gdpr-tools

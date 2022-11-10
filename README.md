<h1 align="center">GDPR-Tools</h1>

<div align="center">

Sanitize any PHP application HTML response to be GDPR-compliant.


[![PHP Version][php-icon]][php-href]
[![Latest Version on Packagist][version-icon]][version-href]
[![Packagist Downloads][downloads-icon]][downloads-href]
[![GitHub Downloads][github-downloads-icon]][github-downloads-href]
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

GDPR-Tools is a simple and a fast way that helps in making an application [GDPR](https://gdpr.eu/what-is-gdpr/) compliant.
In short, GDPR is a set of rules and regulations that are designed to ensure that data is handled in a way that is compatible with the principles of the European Union's General Data Protection Regulation.


### Why does GDPR-Tools exist?

Normally, if you are building a new application, you should make the application GDPR-compliant as you're building the app, but this is mostly not the case. If you have an application that is already built and you want to make it GDPR-compliant, you have to go through the code again to see which elements load external resources and try to implement a way to make them load after client consent. There are also other stuff like `<iframe />` elements and other embeddable resources that get added by editors or plugins (in a CMS context for example). To make the app GDPR-compliant, all these resources must be blocked (depending on their category) until the user gives their consent.

Trying to block these resources in the client side using JavaScript **is not possible** because the browser does not give any possibility to stop/prevent requesting the external resource.

GDPR-Tools was created to solve that specific problem, make the HTML returned by the server side doesn't make any requests to any external resources (3rd-Party services) before user gives their consent in the client side. It does that by sanitizing all HTML elements that load external resources (scripts, stylesheets, images, etc.), the sanitization is done in the form of replacing the values of the attributes that load the resource with new values and setting the old values in `data-` attributes to be handled later in client side code.

![■](https://user-images.githubusercontent.com/7969982/182090864-09a2573a-59e3-4c82-bf9f-e2b9cd360c27.png) **Note:** *~~GDPR-Tools takes currently care only of blocking requests to external resources.~~* *Starting from `v1.2.0`, GDPR-Tools can also block inline scripts. Actually, it can block/modify any attributes as long as it constructed how to do that.*

![■](https://user-images.githubusercontent.com/7969982/182090858-f98dc83e-da1c-4f14-a538-8ac0a9bc43c3.png) **Fact:** *~~GDPR-Tools is not a plug-and-play solution, it takes care only of the server side part, you still have to implement of the client side part. See [**consent.js**](./src/Frontend/consent.js) to get started.~~* *Starting from `v1.2.0`, GDPR-Tools also provides a client side [**SDK**](./src/Frontend/src) that can be integrated using simple config with any CMP.*


---


## How Does it Work?

You can use GDPR-Tools in three ways:

1) The first and the recommended way is to listen to some event that fires before sending the response back to the client. For example in a Symfony application, this would be the `kernel.response` event. Note that you have to make sure that GDPR-Tools listener is the last listener. The following code snippet demonstrates a slimmed down version of how to do that:

```php

public function onKernelResponse(\Symfony\Component\HttpKernel\Event\ResponseEvent $event)
{
    $response = $event->getResponse();
    $content  = $response->getContent();

    $sanitizedContent = $this->sanitizedContent($content);

    $response->setContent($sanitizedContent);
}

private function sanitizedContent(string $content): string
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

    $whitelist = [
        'cdn.your-cmp.com',
        'unpkg.com',
        'cdnjs.cloudflare.com',
    ];

    // the data to append to the final html
    $appends = [
         'body' => [
             '<script defer src="/path/to/client-side-code.js"></script>',
         ],
    ];

    $sanitizedHTML = (new \MAKS\GDPRTools\Backend\Sanitizer())
         ->setData($content)
         ->setCondition($condition)
         ->setURIs($uris)
         ->setWhitelist($whitelist)
         ->setAppends($appends)
         ->sanitize()
         ->get();

    // or simply
    // $sanitizedHTML = (new \MAKS\GDPRTools\Backend\Sanitizer())->sanitizeData($content, $condition, $uris, $whitelist, $appends);

    return $sanitizedHTML;
}

```

2) The second way, is when you don't have the luxury of using some kind of an event. In this case, you can simply proxy app entry point by making a new entry point that points to the old entry and makes use of `MAKS\GDPRTools\Backend\Sanitizer::sanitizeApp()` to sanitize the response before sending it back to the client. The following code snippet demonstrates a slimmed down version of how to do that:
```php

// first, you need to rename the application entry point to something else,
// let's say `index.php` is the entry point, so `index.php` becomes `app.php`

// second, make a new file with the same name as the old name of app entry point
// in our case it's `index.php`, the content of this new file would be something like this:

include '/path/to/gdpr-tools/src/Backend/Sanitizer.php';

// check out the `$condition`, `$uris`, `$whitelist`, and `$appends` variables from the previous example
// you can also add `$prepends` (similar to `$appends`) and `$injections` (modes: 'prepend', 'append', 'before', 'after')
\MAKS\GDPRTools\Backend\Sanitizer::sanitizeApp('./app.php', $condition, $uris, $whitelist, $appends);

```

![■](https://user-images.githubusercontent.com/7969982/182090863-c6bf7159-7056-4a00-bc97-10a5d296c797.png) **Hint:** *The [`\MAKS\GDPRTools\Backend\Sanitizer`](./src/Backend/Sanitizer.php) class is well documented, check out the DocBlocks of its properties and methods to learn more.*

3) The third way is to use the PHAR-Archive, this is available since `v1.2.0`, and it is by far, the most simple one. The PHAR-Archive ([`gdpr-tools.phar`](https://github.com/MarwanAlsoltany/gdpr-tools/releases/latest)) is a complete package that includes GDPR-Tools [Backend](./src/Backend) and [Frontend](./src/Frontend). You can use it to sanitize the response before sending it to the client using a simple config file (example [`gdpr-tools.config.php`](./src/Package/gdpr-tools.config.php)). The PHAR will sanitize the response (backend part) and build the necessary JavaScript code that integrates with the used CMP (frontend part) and attach it to the final response to handle the consent on the client-side. The following code snippet demonstrates how to do that:

```php

// first, you need to download the PHAR archive (gdpr-tools.phar) from the releases page and add it in you web-server root directory

// second, you need to rename the application entry point to something else,
// let's say `index.php` is the entry point, so `index.php` becomes `app.php`

// third, make a new file with the same name as the old name of app entry point
// in our case it's `index.php`, the content of this new file would be something like this:

require './gdpr-tools.phar';

// finally, you need to add a config file (gdpr-tools.config.php)
// on the same level of (gdpr-tools.phar) configure it as needed

```

![■](https://user-images.githubusercontent.com/7969982/182090863-c6bf7159-7056-4a00-bc97-10a5d296c797.png) **Hint:** *Check out the comments on [`gdpr-tools.config.php`](./src/Package/gdpr-tools.config.php) fields, to learn more about the expected data-types.*

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

> Check out [`\MAKS\GDPRTools\Backend\Sanitizer::ELEMENTS`](./src/Backend/Sanitizer.php) to see all the elements that are sanitized by default.

Starting from `v1.2.0` with the introduction of the JavaScript SDK, you can also prevent inline scripts from running (Google Analytics script for example). Because there is not way to determine if an inline script is going to perform some action that requests and external resource and therefore requires user consent, the backend part in this case have to done manually.

The prevention of executing the script can achieved by changing the script element to the following:

```html

<!-- FROM -->
<script type="text/javascript">
    // JavaScript code ...
</script>

<!-- TO -->
<script type="text/blocked" data-consent-element="script" data-consent-attribute="type" data-consent-value="text/javascript" data-consent-category="marketing">
    // JavaScript code ...
</script>

```

When the script is added like the example above, it will not be executed until the user consents to the use of `marketing` cookies. The JavaScript SDK will evaluate the script as soon as the consent to the given category is given and add the `data-consent-evaluated="true"` attribute to denote that the script have been evaluated and the `data-consent-alternative="text/blocked"` to revert back the element if the consent is withdrawn.

### How Do the Sanitized Elements Look Like?

Each sanitized element will contain these attributes:
- Attributes added in the Backend:
    - `data-consent-element`:
        - The sanitized element tag name.
    - `data-consent-attribute`:
        - The sanitized attribute name.
    - `data-consent-value`:
        - The sanitized attribute value.
    - `data-consent-alternative`:
        - The alternative attribute value that will be used instead of the original value (this attribute will be added in the frontend automatically if it was not specified in the backend).
    - `data-consent-original-{{ sanitizedAttribute:[href|src|srcset|poster|data] }}` e.g. `data-consent-original-src`:
        - The original value of the sanitized attribute, this is useful when an element contains more than one sanitizable attribute, the second and third data-attributes will be overwritten when the second attribute is sanitized.
- Attributes added in the Frontend:
    - `data-consent-category`:
        - The sanitized element category.
    - `data-consent-decorator`:
        - The sanitized element decorator (wrapper element) ID (available only on elements that are decorated).
    - `data-consent-evaluated`:
        - The sanitized element evaluation state (available only on inline `<script>` elements).

If you want to name these attributes something else, you can provide custom names (name translations) using the `\MAKS\GDPRTools\Backend\Sanitizer::$attributes` static property on the backend and/or `frontend.attributes` in the config file or `settings.attributes` on the frontend.

#### Example of how it's done on the Backend:

```php

\MAKS\GDPRTools\Backend\Sanitizer::$attributes = [
    'data-consent-element' => 'data-gdpr-element',
    'data-consent-attribute' => 'data-gdpr-attribute',
    'data-consent-value' => 'data-gdpr-value',
    'data-consent-alternative' => 'data-gdpr-alternative',
    // data-consent-original-(href|src|srcset|poster|data)
    'data-consent-original-src' => 'data-gdpr-original-src',
];

```

#### Example of how it's done in the config file:

- [`gdpr-tools.config.php`](./src/Package/gdpr-tools.config.php#L54):

#### Example of how it's done in the Frontend:
- [`AbstractCmpHelper.js`](./src/Frontend/src/classes/AbstractCmpHelper.js#L672)


### JavaScript SDK

The JavaScript SDK is pretty straightforward. You can either use the complied `ConcreteCmpHelper` class extend the `AbstractCmpHelper` class or `ConcreteCmpHelper` class to create your own `CmpHelper` class. The example bellow demonstrates how to use the shipped `ConcreteCmpHelper` class.

```js

const config = {
  cookieName: 'CmpCookie',
  objectName: 'CmpObject',
  updateEventName: 'CmpObjectOnUpdate',
  functions: {
    showDialog: () => CmpObject.showDialog(),
    consentTo: (category) => CmpObject.consentTo(category),
    isConsentedTo: (category) => CmpObject.isConsentedTo(category),
  },
  settings: {
    attributes: {
      'data-consent-element':         'data-consent-element',
      'data-consent-attribute':       'data-consent-attribute',
      'data-consent-value':           'data-consent-value',
      'data-consent-alternative':     'data-consent-alternative',
      'data-consent-original-href':   'data-consent-original-href',
      'data-consent-original-src':    'data-consent-original-src',
      'data-consent-original-srcset': 'data-consent-original-srcset',
      'data-consent-original-poster': 'data-consent-original-poster',
      'data-consent-original-data':   'data-consent-original-data',
      'data-consent-category':        'data-consent-category',
      'data-consent-decorator':       'data-consent-decorator',
      'data-consent-evaluated':       'data-consent-evaluated',
    },
    categories: [
      'necessary',
      'preferences',
      'statistics',
      'marketing',
      'unclassified',
    ],
    categorization: {
      necessary: [
        'google.com/recaptcha',
      ],
      preferences: [
        'cdn.jsdelivr.net',
      ],
      statistics: [
        'google-analytics.com',
      ],
      marketing: [
        'facebook.com',
        'twitter.com',
        'google.com',
        'youtube.com',
        'youtube-nocookie.com',
      ],
      unclassified: [],
    },
    decorations: [
      'iframe',
      'img',
      'audio',
      'video',
    ],
    messages: {
      overlayTitle:        'Content is being blocked due to insufficient Cookies configuration!',
      overlayDescription:  'This content requires consent to the "{type}" cookies, to be viewed.',
      overlayAcceptButton: 'Allow this category',
      overlayInfoButton:   'More info',
    },
    classes: {
      wrapper: '',
      container: '',
      element: '',
      overlay: '',
      overlayTitle: '',
      overlayDescription: '',
      overlayButtons: '',
      overlayAcceptButton: '',
      overlayInfoButton: '',
    }
  },
};

window.cmpHelper = (new ConcreteCmpHelper(config)).update();

```
![■](https://user-images.githubusercontent.com/7969982/182090864-09a2573a-59e3-4c82-bf9f-e2b9cd360c27.png) **Note:** *The JavaScript SDK has an active state, it will revert blocked elements attributes if the consent is withdrawn (readd decorations to element that have decoration and reload the resource if the consent is given again).*

#### Extending The Frontend SDK

The `*CmpHelper` classes expose some properties to access the currently blocked elements and other useful information.
For example, the wrapper is always created for the current viewport to best match the actual size of the element. Resizing the viewport might make the layout broken as the wrapper is not automatically resized by default, to solve this issue, the following snippet can be used to resize the wrapper:

```js

window.addEventListener('resize', () => {
    window.cmpHelper.elements.forEach(element => {
        if (element.dataset.hasOwnProperty('consentDecorator')) {
            // refresh the decoration
            window.cmpHelper.undecorate(element);
            window.cmpHelper.decorate(element);
        }
    })
});

// the following line may be needed depending on your case
window.dispatchEvent(new Event('resize'));

```

Also some useful events are fired throughout the life cycle of `*CmpHelper` classes to allow for hooking into them to perform some additional actions. For example, you may want to give a hint about the resource that is currently being blocked, the following snippet can be used to do that:

```js

window.addEventListener('CmpHelperElementOnDecorate', (event) => {
    const services = {
        'google': (url) => url.pathname.includes('/maps') ? 'Google Maps' : 'Google',
        'youtube': (url) => 'YouTube',
        // other services ...
    };

    const element    = event.detail.element;
    const decoration = event.detail.decoration;
    const url        = new URL(element.dataset.consentValue);
    const service    = url.hostname.split('.').reverse().at(1); // domain without TLD
    const owner      = services[service] ? services[service](url) : '"' + url.hostname + '"';

    decoration.overlayTitle.innerText = decoration.overlayTitle.innerText.replace('Content', `Content of ${owner}`);
});

```

![■](https://user-images.githubusercontent.com/7969982/182090863-c6bf7159-7056-4a00-bc97-10a5d296c797.png) **Hint:** *The [`AbstractCmpHelper`](./src/Frontend/src/classes/AbstractCmpHelper.js) class is well documented, check out the DocBlocks of methods to learn more about the fired events (search for [`@fires`](./src/Frontend/src/classes/AbstractCmpHelper.js#:~:text=%40fires)).*


---


## License

GDPR-Tools is an open-source project licensed under the [**MIT**](./LICENSE) license.
<br/>
Copyright (c) 2022 Marwan Al-Soltany. All rights reserved.
<br/>










[php-icon]: https://img.shields.io/badge/php-%3D%3C7.4-yellow?style=flat&logo=php
[version-icon]: https://img.shields.io/packagist/v/marwanalsoltany/gdpr-tools.svg?style=flat&logo=packagist
[downloads-icon]: https://img.shields.io/packagist/dt/marwanalsoltany/gdpr-tools.svg?style=flat&logo=packagist
[github-downloads-icon]: https://img.shields.io/github/downloads/MarwanAlsoltany/gdpr-tools/total?logo=github&label=downloads
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
[github-downloads-href]: https://github.com/MarwanAlsoltany/gdpr-tools/releases
[license-href]: ./LICENSE
[maintenance-href]: https://github.com/MarwanAlsoltany/gdpr-tools/graphs/commit-activity
[documentation-href]: https://marwanalsoltany.github.io/gdpr-tools
[travis-href]: https://travis-ci.com/MarwanAlsoltany/gdpr-tools
[tweet-href]: https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2FMarwanAlsoltany%2Fgdpr-tools&text=Make%20any%20PHP%20application%20GDPR%20compliant
[github-href]: https://github.com/MarwanAlsoltany/gdpr-tools/stargazers
[codecov-href]: https://codecov.io/gh/MarwanAlsoltany/gdpr-tools

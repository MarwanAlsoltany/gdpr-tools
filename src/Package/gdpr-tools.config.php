<?php

/** @package GDPRTools\Package */

namespace MAKS\GDPRTools\Package;

return [

    // [optional] (string|null) App entry point.
    'entryPoint' => __DIR__ . '/app.php',

    // [optional] (bool|null) Add frontend script as URL to a file or Base64 Data-URI.
    'javascriptFile' => true,

    // [required] (array) Frontend configuration.
    'frontend' => [

        // [required] (string) CMP settings cookie name.
        'cookieName' => 'CookieName',

        // [required] (string) CMP JavaScript-SDK object name.
        'objectName' => 'CookieObject',

        // [required] (string) CMP JavaScript-SDK update event name.
        'updateEventName' => 'CookieObjectOnUpdate',

        // [required] (array) CMP JavaScript-SDK proxy function.
        'functions' => [

            // [required] (string) A JavaScript function as string to show the CMP dialog.
            'showDialog' => <<<'JS'
                () => {
                    CookieObject.show();
                }
            JS,

            // [required] (string) A JavaScript function as string to consent to the given category (function will be passed the category).
            'consentTo' => <<<'JS'
                (category) => {
                    CookieObject.consentTo(category);
                }
            JS,

            // [required] (string) A JavaScript function as string to check if a consent is given to the given category (function will be passed the category and must return a boolean).
            'isConsentedTo' => <<<'JS'
                (category) => {
                    CookieObject.isConsentedTo(category);
                }
            JS,

        ],

        // [optional] (array) Sanitization attributes names.
        'attributes' => [

            // [required] (string) "data-consent-element" attribute name override.
            'data-consent-element' => 'data-consent-element',

            // [required] (string) "data-consent-attribute" attribute name override.
            'data-consent-attribute' => 'data-consent-attribute',

            // [required] (string) "data-consent-value" attribute name override.
            'data-consent-value' => 'data-consent-value',

            // [required] (string) "data-consent-original-href" attribute name override.
            'data-consent-original-href' => 'data-consent-original-href',

            // [required] (string) "data-consent-original-src" attribute name override.
            'data-consent-original-src' => 'data-consent-original-src',

            // [required] (string) "data-consent-original-srcset" attribute name override.
            'data-consent-original-srcset' => 'data-consent-original-srcset',

            // [required] (string) "data-consent-original-poster" attribute name override.
            'data-consent-original-poster' => 'data-consent-original-poster',

            // [required] (string) "data-consent-original-data" attribute name override.
            'data-consent-original-data' => 'data-consent-original-data',

            // [required] (string) "data-consent-category" attribute name override.
            'data-consent-category' => 'data-consent-category',

            // [required] (string) "data-consent-alternative" attribute name override.
            'data-consent-alternative' => 'data-consent-alternative',

            // [required] (string) "data-consent-decorator" attribute name override.
            'data-consent-decorator' => 'data-consent-decorator',

            // [required] (string) "data-consent-evaluated" attribute name override.
            'data-consent-evaluated' => 'data-consent-evaluated',

        ],

        // [required] (array) Cookies categories.
        'categories' => [
            'necessary',
            'preferences',
            'statistics',
            'marketing',
            'unclassified',
        ],

        // [required] (array) Services categorizations.
        'categorization' => [
            'necessary'=> [
                'google.com/recaptcha',
            ],
            'preferences'=> [
                'app.cloudpano.com',
            ],
            'statistics'=> [
                'google-analytics.com',
            ],
            'marketing'=> [
                'studio1.de',
                'google.com',
                'youtube.com',
                'youtube-nocookie.com',
                'facebook.com',
                'soundcloud.com',
                'doubleclick.net',
            ],
            'unclassified'=> [],
        ],

        // [optional] (array|null) Elements that should be decorated.
        'decorations' => [
            'iframe',
            'img',
            'embed',
            'audio',
            'video',
            'track',
            'object',
        ],

        // [optional] (array|null) Decoration overlay messages.
        'messages' => [

            // [optional] (string) Overlay title text.
            'overlayTitle' => 'Content is blocked due to insufficient Cookies configuration!',

            // [optional] (string) Overlay description text.
            'overlayDescription' => 'This content requires consent to the "{type}" Cookies, to be viewed.',

            // [optional] (string) Overlay accept button text.
            'overlayAcceptButton' => 'Allow this category',

            // [optional] (string) Overlay info button text.
            'overlayInfoButton' => 'More Info',

        ],

        // [optional] (array|null) Decoration CSS Classes.
        'classes' => [

            // [optional] (string) Wrapper CSS class.
            'wrapper' => '',

            // [optional] (string) Container CSS class.
            'container' => 'd-flex justify-content-center align-items-center h-100 w-100 bg-dark text-white',

            // [optional] (string) Element CSS class.
            'element' => 'd-none',

            // [optional] (string) Overlay CSS class.
            'overlay' => 'w-75',

            // [optional] (string) Overlay title CSS class.
            'overlayTitle' => 'h4 mb-5 text-center font-weight-bold',

            // [optional] (string) Overlay description CSS class.
            'overlayDescription' => 'mb-3 text-center',

            // [optional] (string) Overlay buttons CSS class.
            'overlayButtons' => 'd-flex flex-nowrap justify-content-center align-items-center',

            // [optional] (string) Overlay accept button CSS class.
            'overlayAcceptButton' => 'btn btn-outline-light',

            // [optional] (string) Overlay info button CSS class.
            'overlayInfoButton' => 'btn btn-outline-light',

        ],

    ],

    // [required] (array) Backend configuration.
    'backend' => [

        // [optional] (callable) A function to determine whether or not to perform the sanitization (function will be passed the data being sanitized and must return a boolean).
        'condition' => null,

        // [optional] (array|null) Domains that should not be sanitized.
        'whitelist' => [
            'cdn.jsdelivr.net',
        ],

        // [optional] (array|null) URIs to be used as replacements for sanitized resources.
        'uris' => [

            // [required] (string) <link href="" /> "link" element temporary "href" value.
            'link' => 'data:text/css;charset=UTF-8;base64,',

            // [required] (string) <script src="" /> "script" element temporary "src" value.
            'script' => 'data:text/javascript;charset=UTF-8;base64,',

            // [required] (string) <iframe src="" /> "iframe" element temporary "src" value.
            'iframe' => 'data:text/html;charset=UTF-8;base64,',

            // [required] (string) <embed src="" /> "embed" element temporary "src" value.
            'embed' => 'data:image/gif;charset=UTF-8;base64,',

            // [required] (string) <img src="" /> "img" element temporary "src" value.
            'img' => 'data:image/png;charset=UTF-8;base64,',

            // [required] (string) <audio src="" /> "audio" element temporary "src" value.
            'audio' => 'data:audio/mp3;charset=UTF-8;base64,',

            // [required] (string) <video src="" /> "video" element temporary "src" value.
            'video' => 'data:video/mp4;charset=UTF-8;base64,',

            // [required] (string) <source src="" /> "source" element temporary "src" value.
            'source' => 'data:audio/mpeg;charset=UTF-8;base64,',

            // [required] (string) <track src="" /> "track" element temporary "src" value.
            'track' => 'data:video/webm;charset=UTF-8;base64,',

            // [required] (string) <object data="" /> "object" element temporary "data" value.
            'object' => 'data:img/jpg;charset=UTF-8;base64,',

        ],

        // [optional] (array|null) HTML appends to the final sanitized response.
        'appends' => [

            // [optional] (array|string) HTML to append to the <head> element.
            'head' => [
                // '<link rel="stylesheet" href="/path/to/style.css" />',
            ],

            // [optional] (array|string) HTML to append to the <body> element.
            'body' => [
                // '<script src="/path/to/script.js"></script>',
            ],

        ],

    ],

];

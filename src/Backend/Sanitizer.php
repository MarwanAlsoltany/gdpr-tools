<?php

/**
 * @author Marwan Al-Soltany <MarwanAlsoltany@gmail.com>
 * @copyright Marwan Al-Soltany 2022
 * For the full copyright and license information, please view
 * the LICENSE file that was distributed with this source code.
 */

declare(strict_types=1);

namespace MAKS\GDPRTools\Backend;

use function strtr;
use function key;
use function current;
use function array_keys;
use function array_values;
use function preg_quote;
use function preg_replace;
use function preg_replace_callback;
use function ob_start;
use function ob_flush;
use function ob_end_flush;
use function ob_get_level;
use function flush;

/**
 * A class that sanitizes HTML elements which load external resources automatically, the is achieved
 * by setting their attributes that load the external resources to temporary URI/URL and saving the
 * original attributes values in a temporary attribute to be used again to reload the resources upon consent.
 *
 * Elements that will be sanitized are:
 * - `<link href="" />`
 * - `<script src="" />`
 * - `<iframe src="" />`
 * - `<embed src="" />`
 * - `<img src="" srcset="" />`
 * - `<audio src="" />`
 * - `<video src="" poster="" />`
 * - `<source src="" srcset="" />`
 * - `<track src="" />`
 * - `<object data="" />`
 *
 * Example:
 * ```
 * // sanitizing the response before returning it to the client
 * // e.g. in kernel response event listener
 *
 * $condition = function ($data) {
 *      // only html responses or check additionally for some consent cookie
 *      return strpos($data, '<!DOCTYPE html>') !== false;
 * };
 *
 * $uris = [
 *    'link'   => sprintf('data:text/css;charset=UTF-8;base64,%s', base64_encode('body::after{content:"Blocked! Consent Please.";color:orangered}')),
 *    'script' => sprintf('data:text/javascript;charset=UTF-8;base64,%s', base64_encode('console.log("Blocked! Consent Please.")')),
 *    'iframe' => sprintf('data:text/html;charset=UTF-8;base64,%s', base64_encode('<div>Blocked! Consent Please.</div>')),
 * ];
 *
 * $whitelist = [
 *     'unpkg.com',
 *     'cdnjs.cloudflare.com',
 * ];
 *
 * $appends = [
 *      'body' => [
 *          '<script defer src="/path/to/client-side-code.js"></script>',
 *      ],
 * ];
 *
 * $sanitizedHTML = (new \MAKS\GDPRTools\Backend\Sanitizer())
 *      ->setData($html)
 *      ->setCondition($condition)
 *      ->setURIs($uris)
 *      ->setWhitelist($whitelist)
 *       ->setAppends($appends)
 *      ->sanitize()
 *      ->append('<script id="sanitization">{"sanitized":true}</script>', 'body') // add additional appends.
 *      ->get();
 *
 *
 * // sanitizing using the shorthand
 * $sanitizedHTML = (new \MAKS\GDPRTools\Backend\Sanitizer())->sanitizeData($html, $condition, $uris, $whitelist, $appends);
 *
 *
 * // sanitizing app entry
 * // (1) rename index.php to app.php
 * // (2) create index.php with following content
 * // (3) the result will simply be returned to the client
 *
 * require '/path/to/src/Backend/Sanitizer.php';
 *
 * \MAKS\GDPRTools\Backend\Sanitizer::sanitizeApp('./app.php', $condition, $uris, $whitelist, $appends);
 * ```
 *
 * @package GDPRTools\Backend
 * @since 1.0.0
 * @api
 */
class Sanitizer
{
    /**
     * Package version.
     *
     * @var string
     *
     * @since 1.4.0
     */
    public const VERSION = 'v1.5.0';

    /**
     * HTML elements that load external resources.
     *
     * Available elements are:
     * - `<link href="" />`
     * - `<script src="" />`
     * - `<iframe src="" />`
     * - `<embed src="" />`
     * - `<img src="" srcset="" />`
     * - `<audio src="" />`
     * - `<video src="" poster="" />`
     * - `<source src="" srcset="" />`
     * - `<track src="" />`
     * - `<object data="" />`
     *
     * @var array<string,array>
     */
    public const ELEMENTS = [
        // element => attributes
        'link'   => ['href'],
        'script' => ['src'],
        'iframe' => ['src'],
        'embed'  => ['src'],
        'img'    => ['src', 'srcset'],
        'audio'  => ['src'],
        'video'  => ['src', 'poster'],
        'source' => ['src', 'srcset'],
        'track'  => ['src'],
        'object' => ['data'],
    ];

    /**
     * `PREPEND` injection mode.
     *
     * @var string
     */
    public const INJECTION_MODE_PREPEND = 'PREPEND';

    /**
     * `APPEND` injection mode.
     *
     * @var string
     */
    public const INJECTION_MODE_APPEND  = 'APPEND';

    /**
     * `BEFORE` injection mode.
     *
     * @var string
     */
    public const INJECTION_MODE_BEFORE  = 'BEFORE';

    /**
     * `AFTER` injection mode.
     *
     * @var string
     */
    public const INJECTION_MODE_AFTER   = 'AFTER';

    /**
     * Injection modes search and replacements.
     *
     * @var array
     */
    protected const INJECTION_MODES = [
        // mode   => [search => replacement]
        self::INJECTION_MODE_PREPEND => ['/(<\s*{target}[^>]*>)/i' => '$1{data}'],
        self::INJECTION_MODE_APPEND  => ['/(<\/\s*{target}\s*>)/i' => '{data}$1'],
        self::INJECTION_MODE_BEFORE  => ['/(<\s*{target}[^>]*>)/i' => '{data}$1'],
        self::INJECTION_MODE_AFTER   => ['/(<\/\s*{target}\s*>)/i' => '$1{data}'],
    ];


    /**
     * The overrides for the names of the attributes added after the sanitization.
     *
     * Available attributes are:
     * - `data-consent-element`
     * - `data-consent-attribute`
     * - `data-consent-value`
     * - `data-consent-alternative`
     * - `data-consent-original-{{ attribute:[href|src|srcset|poster|data] }}` e.g. `data-consent-original-src`
     *
     * @var array<string,string>
     */
    public static array $attributes = [];


    /**
     * The result after the sanitization.
     *
     * @var string
     */
    private string $result;

    /**
     * The data to sanitize.
     *
     * @var string
     */
    private string $data;

    /**
     * The condition to check before sanitizing.
     *
     * @var callable
     */
    private $condition;

    /**
     * The temporary URIs/URLs to replace the original sources with.
     *
     * @var array<string,string>
     */
    private array $uris;

    /**
     * The list of the whitelisted domains that should not be sanitized.
     *
     * @var array<int,string>
     */
    private array $whitelist;

    /**
     * The list of appends for each target.
     *
     * @param array<string,array<string,array<string>|string>>
     *
     * @since 1.2.0
     */
    private array $appends;

    /**
     * The list of prepends for each target.
     *
     * @param array<string,array<string,array<string>|string>>
     *
     * @since 1.3.0
     */
    private array $prepends;


    /**
     * Sanitizer constructor.
     */
    public function __construct()
    {
        $this->data      = '';
        $this->condition = fn () => true;
        $this->uris      = [];
        $this->whitelist = [];
        $this->appends   = [];
        $this->prepends  = [];
        $this->result    = '';


        $this->bootstrap();
    }


    /**
     * Use this method instead of `self::__construct()` to bootstrap the object.
     *
     * @since 1.2.0
     */
    protected function bootstrap(): void
    {
        // ...
    }

    /**
     * Sets the data to sanitize.
     */
    public function setData(string $data)
    {
        $this->data = $data;

        return $this;
    }

    /**
     * Sets the condition to check that determines whether to sanitize the data or not.
     *
     * @param callable $condition The condition to check before sanitizing.
     *      The passed callback will be executed when calling `self::sanitize()` to check if the data should be sanitized.
     *      The callback will be passed the data and must return a boolean (signature: `fn (string $data): bool`).
     *      The callback should check for a Cookie or something in the data (HTML) to determine whether to sanitize the data or not.
     *
     * @return static
     */
    public function setCondition(callable $condition)
    {
        $this->condition = $condition;

        return $this;
    }

    /**
     * Sets the temporary URIs/URLs to set for each sanitized element.
     *
     * @param array<string,string> $uris An associative array
     *      where keys are element names (see `self::ELEMENTS` array keys)
     *      and values are the URIs (base64 encoded data) or normal URLs.
     *
     * @return static
     */
    public function setURIs(array $uris)
    {
        $this->uris = $uris;

        return $this;
    }

    /**
     * Sets the list of whitelisted domains that should not be sanitized.
     *
     * @param array<int,string> $whitelist An array of domains that should not be sanitized.
     *      Sub-domains must be specified separately.
     *
     * @return static
     */
    public function setWhitelist(array $whitelist)
    {
        $this->whitelist = $whitelist;

        return $this;
    }

    /**
     * Sets the list of appends for each target.
     *
     * @param array<string,array<string,array<string>|string>> $appends The data to append.
     *      An associative array where keys are the target to append to and values are a string or array of the data to append.
     *
     * @return static
     *
     * @since 1.2.0
     */
    public function setAppends(array $appends)
    {
        $this->appends = $appends;

        return $this;
    }

    /**
     * Sets the list of prepends for each target.
     *
     * @param array<string,array<string,array<string>|string>> $prepends The data to prepend.
     *      An associative array where keys are the target to prepend in and values are a string or array of the data to prepend.
     *
     * @return static
     *
     * @since 1.3.0
     */
    public function setPrepends(array $prepends)
    {
        $this->prepends = $prepends;

        return $this;
    }

    /**
     * Appends some data to the current data/result.
     * This method is useful to add some `<script>` or `<link>` to the `<head>` and/or `<body>` elements.
     *
     * NOTE: This method will append the data whether the data has changed (sanitized) or not.
     *
     * @param string|array $data The data to inject, a string or an array of strings.
     * @param string $target [optional] The target to append to.
     *      It's advisable to only add to top-level elements (i.e. `<head>`, `<body>`).
     *      The data will be appended to the first element only.
     *
     * @return static
     *
     * @since 1.2.0
     */
    public function append($data, string $target = 'body')
    {
        return $this->inject($data, $target, static::INJECTION_MODE_APPEND);
    }

    /**
     * Prepends some data in the current data/result.
     * This method is useful to add some `<script>` or `<link>` to the `<head>` and/or `<body>` elements.
     *
     * NOTE: This method will prepend the data whether the data has changed (sanitized) or not.
     *
     * @param string|array $data The data to inject, a string or an array of strings.
     * @param string $target [optional] The target to prepend in.
     *      It's advisable to only add to top-level elements (i.e. `<head>`, `<body>`).
     *      The data will be prepended in the first element only.
     *
     * @return static
     *
     * @since 1.3.0
     */
    public function prepend($data, string $target = 'head')
    {
        return $this->inject($data, $target, static::INJECTION_MODE_PREPEND);
    }

    /**
     * Injects data around or into an element (modes: `PREPEND`, `APPEND`, `BEFORE`, `AFTER`).
     *
     * @param string|array $data The data to inject, a string or an array of strings.
     * @param string $target The target to inject in.
     *      It's advisable to only use top-level and unique elements (i.e. `<head>`, `<body>`).
     *      The data will be injected in or around the first element only.
     * @param string $mode The mode of injection.
     *      One of `PREPEND`, `APPEND`, `BEFORE`, or `AFTER` (defaults and falls back to `APPEND`).
     *
     * @return static
     *
     * @since 1.3.0
     */
    public function inject($data, string $target, string $mode = self::INJECTION_MODE_APPEND)
    {
        $default = static::INJECTION_MODES[static::INJECTION_MODE_APPEND];
        $mode    = static::INJECTION_MODES[strtoupper($mode)] ?? $default;

        $buffer  = empty($this->result) ? 'data' : 'result';
        $data    = implode(' ', (array)$data);
        $target  = preg_quote(trim($target, '< />'), '/');
        $search  = strtr(key($mode), ['{target}' => $target]);
        $replace = strtr(current($mode), ['{data}' => $data]);
        $result  = preg_replace($search, $replace, $this->{$buffer}, 1);

        $this->{$buffer} = $result ?? $this->{$buffer};

        return $this;
    }

    /**
     * Sanitizes the current data.
     *
     * @return static
     */
    public function sanitize()
    {
        $data      = $this->data;
        $condition = $this->condition;

        if (!(bool)$condition($data)) {
            $this->result = $data;

            return $this;
        }

        $search  = $this->getSearchPattern();
        $replace = $this->getReplaceCallback();

        $data = preg_replace_callback($search, $replace, $data);

        $this->result = strtr($data, self::$attributes);

        return $this;
    }

    /**
     * Returns the current result and resets class internal state.
     *
     * @return string
     */
    public function get(): string
    {
        $result = $this->result;

        // reset to initial state
        $this->__construct();

        return $result;
    }

    /**
     * Sanitize the given HTML code.
     *
     * @param string $data The HTML code to sanitize.
     * @param callable|null $condition [optional] The condition to check before sanitizing.
     *      The passed callback will be executed when calling `self::sanitize()` to check if the data should be sanitized.
     *      The callback will be passed the data and must return a boolean (signature: `fn (string $data): bool`).
     *      The callback should check for a Cookie or something in the data (HTML) to determine whether to sanitize the data or not.
     * @param array<string,string>|null $uris [optional] The temporary URIs/URLs to set for each sanitized element.
     *      An associative array where keys are element names and values are the URIs (base64 encoded data) or normal URLs.
     * @param array<int,string>|null $whitelist An array of domains that should not be sanitized.
     *      Sub-domains must be specified separately.
     * @param array<string,array<string,array<string>|string>>|null $appends [optional] The data to append.
     *      An associative array where keys are the targets to append to and values are a string or an array of strings of the data to append.
     * @param array<string,array<string,array<string>|string>>|null $prepends [optional] The data to prepend.
     *      An associative array where keys are the targets to prepend to and values are a string or an array of strings of the data to prepend.
     * @param array<string,array<string,array<string>|string>>|null $injections [optional] The data to inject.
     *      An associative array where keys are the modes values are the sames as `$prepends` or `$appends`.
     *
     * @return string The sanitized HTML code.
     */
    public function sanitizeData(
        string $data,
        ?callable $condition = null,
        ?array $uris = null,
        ?array $whitelist = null,
        ?array $appends = null,
        ?array $prepends = null,
        ?array $injections = null
    ): string {
        $this->setData($data);

        if (!empty($condition)) {
            $this->setCondition($condition);
        }

        if (!empty($uris)) {
            $this->setURIs($uris);
        }

        if (!empty($whitelist)) {
            $this->setWhitelist($whitelist);
        }

        if (!empty($appends)) {
            $this->setAppends($appends);
        }

        if (!empty($prepends)) {
            $this->setPrepends($prepends);
        }

        $this->sanitize();

        $injections = array_merge_recursive([
            self::INJECTION_MODE_PREPEND => $this->prepends,
            self::INJECTION_MODE_APPEND  => $this->appends,
            self::INJECTION_MODE_BEFORE  => [],
            self::INJECTION_MODE_AFTER   => [],
        ], (array)$injections);

        foreach ($injections as $mode => $targets) {
            foreach ($targets as $target => $data) {
                $this->inject($data, $target, $mode);
            }
        }

        return $this->get();
    }

    /**
     * Sanitize the HTML resulting from including the passed path.
     *
     * NOTE: This method should be the last step in the application
     *      as it will flush all opened buffers to the client.
     *
     * @param string $path The path to app entry point (`index.php`).
     * @param callable|null $condition [optional] The condition to check before sanitizing.
     *      The passed callback will be executed when calling `self::sanitize()` to check if the data should be sanitized.
     *      The callback will be passed the data and must return a boolean (signature: `fn (string $data): bool`).
     *      The callback should check for a Cookie or something in the data (HTML) to determine whether to sanitize the data or not.
     * @param array<string,string>|null $uris [optional] The temporary URIs/URLs to set for each sanitized element.
     *      An associative array where keys are element names and values are the URIs (base64 encoded data) or normal URLs.
     * @param array<int,string>|null $whitelist An array of domains that should not be sanitized.
     *      Sub-domains must be specified separately.
     * @param array<string,array<string,array<string>|string>>|null $appends [optional] The data to append.
     *      An associative array where keys are the targets to append to and values are a string or an array of strings of the data to append.
     * @param array<string,array<string,array<string>|string>>|null $prepends [optional] The data to prepend.
     *      An associative array where keys are the targets to prepend to and values are a string or an array of strings of the data to prepend.
     * @param array<string,array<string,array<string>|string>>|null $injections [optional] The data to inject.
     *      An associative array where keys are the modes values are the sames as `$prepends` or `$appends`.
     *
     * @return void The buffer will simply be flushed to the client.
     *
     * @codeCoverageIgnore This method is tested manually as it flushes all opened buffers.
     */
    public static function sanitizeApp(
        string $path,
        ?callable $condition = null,
        ?array $uris = null,
        ?array $whitelist = null,
        ?array $appends = null,
        ?array $prepends = null,
        ?array $injections = null
    ): void {
        ob_start(function ($data) use ($condition, $uris, $whitelist, $appends, $prepends, $injections) {
            return (new static())->sanitizeData(
                $data,
                $condition,
                $uris,
                $whitelist,
                $appends,
                $prepends,
                $injections
            );
        });

        require $path;

        // in case the buffer is not flushed
        // normally this should be done by the Response object
        while (ob_get_level()) {
            ob_end_flush();
            ob_get_level() && ob_flush();
            ob_get_level() && flush();
        }
    }

    /**
     * Returns a listed of domains that should not be sanitized.
     *
     * @return array<int,string>
     */
    private function getDomains(): array
    {
        $origin  = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $domains = array_filter(array_merge([$origin], array_values($this->whitelist)));

        return $domains;
    }

    /**
     * Returns the Data-URIs to set to the sanitized elements.
     *
     * @return array<string,string>
     */
    private function getURIs(): array
    {
        $uris = [];

        foreach (self::ELEMENTS as $element => $attributes) {
            $uris[$element] = $this->uris[$element] ?? 'data:text/plain;base64,IA==';
        }

        return $uris;
    }

    /**
     * Returns the search pattern to find the elements to sanitize.
     *
     * @return string
     */
    private function getSearchPattern(): string
    {
        $domains = $this->getDomains();

        $elements   = implode('|', array_keys(self::ELEMENTS));
        $attributes = implode('|', array_map(fn (array $attrs) => implode('|', $attrs), array_values(self::ELEMENTS)));
        $whitelist  = implode('|', array_map(fn (string $domain) => preg_quote($domain, '/'), $domains));

        // elements which load external resources and have a src or an equivalent attribute
        // that are not requesting the same origin or one of the whitelisted domains
        $regex = '/(?:(?<head><(?<element>\s*{e})[^>]+?)(?:(?<attribute>{a})\s*=\s*"(?<value>https?:\/\/(?![^>]*(?:{w}))[^>]+?))")/';
        $placeholders = [
            '{e}' => $elements,
            '{a}' => $attributes,
            '{w}' => $whitelist,
        ];

        return strtr($regex, $placeholders);
    }

    /**
     * Returns the callback to replace the elements to sanitize.
     *
     * @return callable
     */
    private function getReplaceCallback(): callable
    {
        static $uris = null;

        if ($uris === null) {
            $uris = $this->getURIs();
        }

        /**
         * INPUT:
         * <link rel="stylesheet" href="https://cdn.tld/style.css" />
         *
         * OUTPUT: (multiline is for readability)
         * <link
         *      rel="stylesheet"
         *      href="{uri}"
         *      data-consent-element="link"
         *      data-consent-attribute="href"
         *      data-consent-value="https://cdn.tld/style.css"
         *      data-consent-alternative="{uri}"
         *      data-consent-original-href="https://cdn.tld/style.css"
         * />
         */
        $placeholder = (
            '{head}{attribute}="{uri}" ' . // i.e: <link rel="stylesheet" href="{uri}"
            'data-consent-element="{element}" ' . // i.e: data-consent-element="link"
            'data-consent-attribute="{attribute}" ' . // i.e: data-consent-attribute="href"
            'data-consent-value="{value}" ' . // i.e: data-consent-value="https://cdn.tld/style.css"
            'data-consent-alternative="{uri}" ' . // i.e: data-consent-alternative="{uri}"
            // in case the element has more than one sanitizable attribute, the first three
            // data-consent-* attributes will be overridden with the latest values when parsing the HTML
            'data-consent-original-{attribute}="{value}"' // i.e: data-consent-original-href="https://cdn.tld/style.css"
        );

        return fn ($matches) => strtr($placeholder, [
            '{head}'      => $matches['head'],
            '{element}'   => $matches['element'],
            '{attribute}' => $matches['attribute'],
            '{value}'     => $matches['value'],
            '{uri}'       => $uris[$matches['element']] ?? '',
        ]);
    }
}

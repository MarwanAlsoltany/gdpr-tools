<?php

/**
 * @author Marwan Al-Soltany <MarwanAlsoltany@gmail.com>
 * @copyright Marwan Al-Soltany 2022
 * For the full copyright and license information, please view
 * the LICENSE file that was distributed with this source code.
 *
 * @package GDPRTools\Package
 * @since 1.2.0
 * @internal
 */

declare(strict_types=1);

namespace MAKS\GDPRTools\Package;

define('NAME', 'gdpr-tools');
define('PHAR', 'phar://' . NAME);
define('ROOT', getcwd());

require PHAR . '/../Backend/Sanitizer.php';

use MAKS\GDPRTools\Backend\Sanitizer;

if (!realpath($config = vsprintf('%s%s%s.config.php', [
    ROOT,
    DIRECTORY_SEPARATOR,
    NAME
]))) {
    die("GDPR-Tools config file '{$config}' not found!" . PHP_EOL);
}

$configuration = include $config;
$validation    = getConfigValidations();

foreach ($validation as $key => $validator) {
    $validator(getConfigValue($configuration, $key, null));
}

$settings = [
    'cookieName'      => getConfigValue($configuration, 'frontend.cookieName', ''),
    'objectName'      => getConfigValue($configuration, 'frontend.objectName', ''),
    'updateEventName' => getConfigValue($configuration, 'frontend.updateEventName', ''),
    'functions'       => getConfigValue($configuration, 'frontend.functions', []),
    'settings'        => [
        'attributes'     => getConfigValue($configuration, 'frontend.attributes', []),
        'categories'     => getConfigValue($configuration, 'frontend.categories', []),
        'categorization' => getConfigValue($configuration, 'frontend.categorization', []),
        'decorations'    => getConfigValue($configuration, 'frontend.decorations', []),
        'messages'       => getConfigValue($configuration, 'frontend.messages', []),
        'classes'        => getConfigValue($configuration, 'frontend.classes', []),
    ],
];

$helper = getCmpHelperScript();
$config = getCmpHelperConfig($settings);
$script = "{$helper}\n\n{$config}";

if (getConfigValue($configuration, 'javascriptFile', false)) {
    $script = getCmpHelperFileScript($script);
} else {
    $script = getCmpHelperBase64Script($script);
}

$entry      = getConfigValue($configuration, 'entryPoint', ROOT . '/app.php');
$condition  = getConfigValue($configuration, 'backend.condition', fn ($data) => stripos($data, '<!DOCTYPE html>') !== false);
$uris       = getConfigValue($configuration, 'backend.uris', []);
$whitelist  = getConfigValue($configuration, 'backend.whitelist', []);
$appends    = getConfigValue($configuration, 'backend.appends', ['head' => [''], 'body' => ['']]);
$prepends   = getConfigValue($configuration, 'backend.prepends', ['head' => [''], 'body' => ['']]);
$injections = getConfigValue($configuration, 'backend.injections', ['PREPEND' => [], 'APPEND' => [], 'BEFORE' => [], 'AFTER' => ['title' => ['']]]);
$attributes = getConfigValue($configuration, 'frontend.attributes', []);

// we try to insert GDPR-Tools Frontend SDK before any other script, as some CMPs
// use the 'beforescriptexecute' event to block it if it was added after them.
// we insert it after the <title /> expecting it to be before any <script /> element.
$injections['AFTER']['title'] = array_merge(array($script), array_values((array)$injections['AFTER']['title']));

Sanitizer::$attributes = $attributes;
Sanitizer::sanitizeApp($entry, $condition, $uris, $whitelist, $appends, $prepends, $injections);


// helpers

function getCacheId(): string {
    // trigger cache busting for any change within library source
    return md5(
        strval(filemtime(PHAR . '/../Backend')) .
        strval(filemtime(PHAR . '/../Frontend')) .
        strval(filemtime(PHAR . '/../Package'))
    );
}

function getCmpHelperScript(): string {
    $script = file_get_contents(PHAR . '/../Frontend/dist/cmp-helper.js');

    return $script;
}

function getCmpHelperConfig(array $settings): string {
    $config = file_get_contents(PHAR . '/../Frontend/dist/cmp-helper.config.js');
    $config = str_replace('{config}', json_encode($settings, JSON_HEX_APOS | JSON_HEX_QUOT), $config);

    return $config;
}

function getCmpHelperFileScript(string $script): string {
    file_put_contents(ROOT . ($path = '/gdpr-tools.cmp-helper.js'), $script);

    return sprintf('<script id="gdpr-tools" type="text/javascript" src="%s?version=%s&cid=%s"></script>', $path, Sanitizer::VERSION, getCacheId());
}

function getCmpHelperBase64Script(string $script): string {
    return sprintf('<script id="gdpr-tools" type="text/javascript" src="data:text/javascript;charset=UTF-8;base64,%s"></script>', base64_encode($script));
}

function getConfigValue(array $array, string $key, $default = null) {
    if (!count($array)) {
        return $default;
    }

    $data = $array;

    if (strpos($key, '.') !== false) {
        $parts = explode('.', $key);

        foreach ($parts as $part) {
            if (!isset($data[$part])) {
                return $default;
            }

            $data = $data[$part];
        }

        return $data ?? $default;
    }

    return $data[$key] ?? $default;
}

function getConfigValidations(): array {
    return [
        'entryPoint'               => fn ($value) => is_string($value) && realpath($value) || is_null($value) || die('GDPR-Tools config is invalid: "entryPoint" must be a string (path to a file) or null!'),
        'javascriptFile'           => fn ($value) => is_bool($value) || is_null($value) || die('GDPR-Tools config is invalid: "javascriptFile" must be a boolean or null!'),
        'frontend.cookieName'      => fn ($data) => is_string($data) && !empty($data) || die('GDPR-Tools config is invalid: "frontend.cookieName" must be a non-empty string!'),
        'frontend.objectName'      => fn ($data) => is_string($data) && !empty($data) || die('GDPR-Tools config is invalid: "frontend.objectName" must be a non-empty string!'),
        'frontend.updateEventName' => fn ($data) => is_string($data) && !empty($data) || die('GDPR-Tools config is invalid: "frontend.updateEventName" must be a non-empty string!'),
        'frontend.functions'       => fn ($data) => is_array($data) && !empty($data) || die('GDPR-Tools config is invalid: "frontend.functions" must be a non-empty array!'),
        'frontend.attributes'      => fn ($data) => is_array($data) || is_null($data) || die('GDPR-Tools config is invalid: "frontend.attributes" must be an array or null!'),
        'frontend.categories'      => fn ($data) => is_array($data) || !empty($data) || die('GDPR-Tools config is invalid: "frontend.categories" must be a non-empty array!'),
        'frontend.categorization'  => fn ($data) => is_array($data) || !empty($data) || die('GDPR-Tools config is invalid: "frontend.categorization" must be a non-empty array!'),
        'frontend.decorations'     => fn ($data) => is_array($data) || is_null($data) || die('GDPR-Tools config is invalid: "frontend.decorations" must be an array or null!'),
        'frontend.messages'        => fn ($data) => is_array($data) || is_null($data) || die('GDPR-Tools config is invalid: "frontend.messages" must be an array or null!'),
        'frontend.classes'         => fn ($data) => is_array($data) || is_null($data) || die('GDPR-Tools config is invalid: "frontend.classes" must be an array or null!'),
        'backend.condition'        => fn ($data) => is_callable($data) || is_null($data) || die('GDPR-Tools config is invalid: "backend.condition" must be a callable or null!'),
        'backend.whitelist'        => fn ($data) => is_array($data) || is_null($data) || die('GDPR-Tools config is invalid: "backend.whitelist" must be an array or null!'),
        'backend.uris'             => fn ($data) => is_array($data) || is_null($data) || die('GDPR-Tools config is invalid: "backend.uris" must be an array or null!'),
        'backend.appends'          => fn ($data) => is_array($data) || is_null($data) || die('GDPR-Tools config is invalid: "backend.appends" must be an array or null!'),
        'backend.prepends'         => fn ($data) => is_array($data) || is_null($data) || die('GDPR-Tools config is invalid: "backend.prepends" must be an array or null!'),
        'backend.injections'       => fn ($data) => is_array($data) || is_null($data) || die('GDPR-Tools config is invalid: "backend.prepends" must be an array or null!'),
    ];
}

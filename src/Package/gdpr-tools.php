<?php

/**
 * @author Marwan Al-Soltany <MarwanAlsoltany@gmail.com>
 * @copyright Marwan Al-Soltany 2022
 * For the full copyright and license information, please view
 * the LICENSE file that was distributed with this source code.
 */

declare(strict_types=1);

namespace MAKS\GDPRTools\Package;

define('NAME', 'gdpr-tools');
define('PHAR', 'phar://' . NAME);
define('ROOT', getcwd());

require PHAR . '/../Backend/Sanitizer.php';

use MAKS\GDPRTools\Backend\Sanitizer;

if (!realpath($config = sprintf('%s%s%s.config.php', ROOT, DIRECTORY_SEPARATOR, NAME))) {
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

$entry     = getConfigValue($configuration, 'entryPoint', ROOT . '/app.php');
$condition = getConfigValue($configuration, 'backend.condition', fn ($data) => stripos($data, '<!DOCTYPE html>') !== false);
$uris      = getConfigValue($configuration, 'backend.uris', []);
$whitelist = getConfigValue($configuration, 'backend.whitelist', []);
$appends   = getConfigValue($configuration, 'backend.appends', ['head' => [''], 'body' => ['']]);

$appends['body']   = (array)$appends['body'];
$appends['body'][] = $script;

Sanitizer::sanitizeApp($entry, $condition, $uris, $whitelist, $appends);


// helpers

function getCmpHelperScript() {
    $script = file_get_contents(PHAR . '/../Frontend/dist/cmp-helper.js');

    return $script;
}

function getCmpHelperConfig(array $settings) {
    $config = file_get_contents(PHAR . '/../Frontend/dist/cmp-helper.config.js');
    $config = str_replace('{config}', json_encode($settings, JSON_HEX_APOS | JSON_HEX_QUOT), $config);

    return $config;
}

function getCmpHelperFileScript(string $script) {
    file_put_contents(ROOT . ($path = '/gdpr-tools.cmp-helper.js'), $script);

    return sprintf('<script id="gdpr-tools" src="%s"></script>', $path);
}

function getCmpHelperBase64Script(string $script) {
    return sprintf('<script id="gdpr-tools" src="data:text/javascript;charset=UTF-8;base64,%s"></script>', base64_encode($script));
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

function getConfigValidations() {
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
    ];
}

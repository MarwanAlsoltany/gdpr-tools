<?php

declare(strict_types=1);

namespace MAKS\GDPRTools\Tests\Backend;

use MAKS\GDPRTools\Tests\TestCase;
use MAKS\GDPRTools\Backend\Sanitizer;

class SanitizerTest extends TestCase
{
    private Sanitizer $sanitizer;


    public function setUp(): void
    {
        parent::setUp();

        $this->sanitizer = new Sanitizer();
    }

    public function tearDown(): void
    {
        parent::tearDown();

        unset($this->sanitizer);
    }


    public function testSanitizerInstance()
    {
        $this->assertIsObject($this->sanitizer);
        $this->assertInstanceOf(Sanitizer::class, $this->sanitizer);
    }

    public function testSanitizerInterface()
    {
        $data      = $this->getTestData();
        $condition = $this->getTestCondition();
        $uris      = $this->getTestURIs();
        $whitelist = $this->getTestWhitelist();
        $appends   = $this->getTestAppends();

        $html = $this->sanitizer
            ->setData($data)
            ->setCondition($condition)
            ->setURIs($uris)
            ->setWhitelist($whitelist)
            ->append($appends['head'], 'head')
            ->sanitize()
            ->append($appends['body'][0], 'body')
            ->get();

        $this->assertIsString($html);
        $this->assertNotEquals($data, $html);
        $this->assertStringContainsString('data-consent-', $html);
        $this->assertStringContainsString('data-consent-element="link"', $html);
        $this->assertStringContainsString('data-consent-element="script"', $html);
        $this->assertStringContainsString('data-consent-element="iframe"', $html);
        $this->assertStringContainsString('data-consent-attribute="src"', $html);
        $this->assertStringContainsString('data-consent-attribute="href"', $html);
        $this->assertStringContainsString('data-consent-value="https://', $html);
        $this->assertStringContainsString('data-consent-original-src', $html);
        $this->assertStringContainsString('data-consent-original-href', $html);
        $this->assertStringContainsString('<script src="https://unpkg', $html);
        $this->assertStringContainsString($uris['link'], $html);
        $this->assertStringContainsString($uris['script'], $html);
        $this->assertStringContainsString($uris['iframe'], $html);
        $this->assertStringContainsString('<script defer src="/path/to/client-side-code.js"></script></head>', $html);
        $this->assertStringContainsString('<script defer src="/path/to/client-side-code.js"></script></body>', $html);
    }

    public function testSanitizerDataMethod()
    {
        $data      = $this->getTestData();
        $condition = $this->getTestCondition();
        $uris      = $this->getTestURIs();
        $whitelist = $this->getTestWhitelist();
        $appends   = $this->getTestAppends();

        $html = $this->sanitizer->sanitizeData($data, $condition, $uris, $whitelist, $appends);

        $this->assertIsString($html);
        $this->assertNotEquals($data, $html);

        $this->assertStringContainsString('data-consent-element="link"', $html);
        $this->assertStringContainsString('data-consent-element="script"', $html);
        $this->assertStringContainsString('data-consent-element="iframe"', $html);
    }

    public function testSanitizerDataMethodWithAttributesNamesOverwritten()
    {
        $data      = $this->getTestData();
        $condition = $this->getTestCondition();
        $uris      = $this->getTestURIs();
        $whitelist = $this->getTestWhitelist();
        $appends   = $this->getTestAppends();

        Sanitizer::$attributes = [
            'data-consent-element' => 'data-gdpr-element',
            'data-consent-attribute' => 'data-gdpr-attribute',
            'data-consent-value' => 'data-gdpr-value',
            'data-consent-original' => 'data-gdpr-original',
        ];

        $html = $this->sanitizer->sanitizeData($data, $condition, $uris, $whitelist, $appends);

        $this->assertIsString($html);
        $this->assertNotEquals($data, $html);

        $this->assertStringContainsString('data-gdpr-', $html);
        $this->assertStringContainsString('data-gdpr-element=', $html);
        $this->assertStringContainsString('data-gdpr-attribute=', $html);
        $this->assertStringContainsString('data-gdpr-value=', $html);
        $this->assertStringContainsString('data-gdpr-original-href=', $html);
    }

    public function testSanitizerDataMethodWithFalsyCondition()
    {
        $data = $this->getTestData();
        $uris = $this->getTestURIs();

        $html = $this->sanitizer->sanitizeData($data, fn () => false, $uris);

        $this->assertIsString($html);
        $this->assertEquals($data, $html);
    }


    private function getTestData()
    {
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/lodash@1.3.0/dist/lodash.min.js"></script>
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="col pt-5">
                <div class="embed-responsive embed-responsive-21by9 w-100" style="height:720px;">
                    <iframe class="embed-responsive-item w-100 h-100" src="https://getbootstrap.com/"></iframe>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
HTML;
    }

    private function getTestCondition(): callable
    {
        return fn ($data) => strpos($data, '<!DOCTYPE html>') !== false;
    }

    private function getTestURIs(): array
    {
        return [
            'link'   => sprintf('data:text/css;charset=UTF-8;base64,%s', base64_encode('body::after{content:"Consent Please";color:orangered}')),
            'script' => sprintf('data:text/javascript;charset=UTF-8;base64,%s', base64_encode('console.log("Blocked!")')),
            'iframe' => sprintf('data:text/html;charset=UTF-8;base64,%s', base64_encode('<div>Consent Please!</div>')),
        ];
    }

    private function getTestWhitelist(): array
    {
        return [
            'google.com',
            'unpkg.com',
        ];
    }

    private function getTestAppends(): array
    {
        return [
            'head' => '<script defer src="/path/to/client-side-code.js"></script>',
            'body' => [
                '<script defer src="/path/to/client-side-code.js"></script>',
            ],
        ];
    }
}

<?php
namespace Tests;

use PHPUnit\Framework\TestCase;

// Charger la fonction depuis InterventionController
require_once __DIR__ . '/../src/Controllers/InterventionController.php';

class SanitizeHtmlTest extends TestCase
{
    public function testAllowedTagsAreKept(): void
    {
        $input  = '<p><strong>Texte</strong> en <em>italique</em></p>';
        $result = \App\Controllers\sanitizeHtml($input);

        $this->assertStringContainsString('<strong>', $result);
        $this->assertStringContainsString('<em>',     $result);
        $this->assertStringContainsString('<p>',      $result);
    }

    public function testScriptTagIsRemoved(): void
    {
        $input  = '<p>Texte</p><script>alert("xss")</script>';
        $result = \App\Controllers\sanitizeHtml($input);

        $this->assertStringNotContainsString('<script>', $result);
        $this->assertStringNotContainsString('alert',    $result);
    }

    public function testOnClickAttributeIsRemoved(): void
    {
        $input  = '<p onclick="alert(1)">Texte</p>';
        $result = \App\Controllers\sanitizeHtml($input);

        $this->assertStringNotContainsString('onclick', $result);
    }

    public function testLinkWithHrefIsKept(): void
    {
        $input  = '<a href="https://example.com">Lien</a>';
        $result = \App\Controllers\sanitizeHtml($input);

        $this->assertStringContainsString('href="https://example.com"', $result);
    }

    public function testLinkWithJavascriptIsRemoved(): void
    {
        $input  = '<a href="javascript:alert(1)">Lien</a>';
        $result = \App\Controllers\sanitizeHtml($input);

        $this->assertStringNotContainsString('javascript:', $result);
    }

    public function testEmptyStringReturnsEmpty(): void
    {
        $result = \App\Controllers\sanitizeHtml('');
        $this->assertEmpty($result);
    }

    public function testListsAreKept(): void
    {
        $input  = '<ul><li>Item 1</li><li>Item 2</li></ul>';
        $result = \App\Controllers\sanitizeHtml($input);

        $this->assertStringContainsString('<ul>', $result);
        $this->assertStringContainsString('<li>', $result);
    }
}
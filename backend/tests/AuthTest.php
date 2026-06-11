<?php
namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Auth;

class AuthTest extends TestCase
{
    private string $secret = 'test_secret_key_for_phpunit';

    protected function setUp(): void
    {
        $_ENV['LDC_APP_SECRET'] = $this->secret;
    }

    public function testGenerateTokenReturnsString(): void
    {
        $payload = ['sub' => 1, 'user' => 'admin', 'role' => 'admin', 'exp' => time() + 3600];
        $token   = Auth::generateToken($payload);

        $this->assertIsString($token);
        $this->assertNotEmpty($token);
        // Un JWT a 3 parties séparées par des points
        $this->assertCount(3, explode('.', $token));
    }

    public function testValidTokenIsVerified(): void
    {
        $payload = ['sub' => 1, 'user' => 'admin', 'role' => 'admin', 'exp' => time() + 3600];
        $token   = Auth::generateToken($payload);
        $decoded = Auth::verifyToken($token);

        $this->assertNotNull($decoded);
        $this->assertEquals(1,       $decoded['sub']);
        $this->assertEquals('admin', $decoded['user']);
        $this->assertEquals('admin', $decoded['role']);
    }

    public function testExpiredTokenIsRejected(): void
    {
        $payload = ['sub' => 1, 'user' => 'admin', 'role' => 'admin', 'exp' => time() - 1];
        $token   = Auth::generateToken($payload);
        $decoded = Auth::verifyToken($token);

        $this->assertNull($decoded);
    }

    public function testTamperedTokenIsRejected(): void
    {
        $payload = ['sub' => 1, 'user' => 'admin', 'role' => 'admin', 'exp' => time() + 3600];
        $token   = Auth::generateToken($payload);

        // Modifier la signature
        $parts        = explode('.', $token);
        $parts[2]     = 'invalidsignature';
        $tamperedToken = implode('.', $parts);

        $decoded = Auth::verifyToken($tamperedToken);
        $this->assertNull($decoded);
    }

    public function testTokenWithDifferentSecretIsRejected(): void
    {
        $payload = ['sub' => 1, 'user' => 'admin', 'role' => 'admin', 'exp' => time() + 3600];
        $token   = Auth::generateToken($payload);

        // Changer le secret
        $_ENV['LDC_APP_SECRET'] = 'autre_secret';
        $decoded = Auth::verifyToken($token);

        $this->assertNull($decoded);
    }
}
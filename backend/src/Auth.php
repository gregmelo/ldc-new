<?php
namespace App;

class Auth
{
    public static function generateToken(array $payload): string
    {
        $header  = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = base64_encode(json_encode($payload));
        $sig     = base64_encode(hash_hmac('sha256', "$header.$payload", $_ENV['LDC_APP_SECRET'], true));
        return "$header.$payload.$sig";
    }

    public static function verifyToken(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;
        [$header, $payload, $sig] = $parts;
        $expected = base64_encode(hash_hmac('sha256', "$header.$payload", $_ENV['LDC_APP_SECRET'], true));
        if (!hash_equals($expected, $sig)) return null;
        $data = json_decode(base64_decode($payload), true);
        if (!$data || (isset($data['exp']) && $data['exp'] < time())) return null;
        return $data;
    }

    public static function check(): array
    {
        $headers = getallheaders();
        $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $token   = str_replace('Bearer ', '', $auth);
        $payload = self::verifyToken($token);
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Non autorise']);
            exit;
        }
        return $payload;
    }

    public static function checkAdmin(): array
    {
        $user = self::check();
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Acces reserve aux administrateurs']);
            exit;
        }
        return $user;
    }

    public static function body(): array
    {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
}

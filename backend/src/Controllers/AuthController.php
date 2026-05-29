<?php
namespace App\Controllers;

use App\Auth;
use App\Database;

class AuthController
{
    public function login(): void
    {
        $body = Auth::body();
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM users WHERE username = ?');
        $stmt->execute([$body['username'] ?? '']);
        $user = $stmt->fetch();

        if (!$user || !password_verify($body['password'] ?? '', $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Identifiants incorrects']);
            return;
        }

        $token = Auth::generateToken([
            'sub'  => $user['id'],
            'user' => $user['username'],
            'role' => $user['role'],
            'exp'  => time() + 86400 * 7,
        ]);

        echo json_encode([
            'token'    => $token,
            'role'     => $user['role'],
            'username' => $user['username'],
        ]);
    }

    public function me(): void
    {
        echo json_encode(Auth::check());
    }
}

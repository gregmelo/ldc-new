<?php
namespace App\Controllers;

use App\Auth;
use App\Database;
use App\ActivityLog;
use OpenApi\Attributes as OA;

class AuthController
{

#[OA\Post(
    path: "/login",
    summary: "Authentification",
    tags: ["Auth"],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["username", "password"],
            properties: [
                new OA\Property(property: "username", type: "string", example: "admin"),
                new OA\Property(property: "password", type: "string", example: "motdepasse"),
            ]
        )
    ),
    responses: [
        new OA\Response(response: 200, description: "Token JWT retourné"),
        new OA\Response(response: 401, description: "Identifiants incorrects"),
    ]
)]
    public function login(): void
    {
        $body = Auth::body();
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM users WHERE username = ?');
        $stmt->execute([$body['username'] ?? '']);
        $user = $stmt->fetch();

        if (!$user || !password_verify($body['password'] ?? '', $user['password_hash'])) {
            // Log tentative échouée
            ActivityLog::log(
                $db,
                ['sub' => null, 'user' => $body['username'] ?? 'inconnu'],
                'login_failed', 'auth', null,
                "Tentative de connexion échouée pour : " . ($body['username'] ?? 'inconnu')
            );
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

        ActivityLog::log(
            $db,
            ['sub' => $user['id'], 'user' => $user['username']],
            'login', 'auth', $user['id'],
            "Connexion réussie"
        );

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
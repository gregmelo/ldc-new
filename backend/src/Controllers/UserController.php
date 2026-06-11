<?php
namespace App\Controllers;

use App\Auth;
use App\Database;
use OpenApi\Attributes as OA;

class UserController
{
    #[OA\Get(
        path: "/users",
        summary: "Liste des utilisateurs",
        tags: ["Users"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(response: 200, description: "Liste des utilisateurs"),
            new OA\Response(response: 403, description: "Accès refusé"),
        ]
    )]
    public function index(): void
    {
        Auth::checkAdmin();
        $db   = Database::getInstance();
        $stmt = $db->query('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC');
        echo json_encode($stmt->fetchAll());
    }

    #[OA\Post(
        path: "/users",
        summary: "Créer un utilisateur",
        tags: ["Users"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["username", "password", "role"],
                properties: [
                    new OA\Property(property: "username", type: "string", example: "john_doe"),
                    new OA\Property(property: "password", type: "string", example: "motdepasse"),
                    new OA\Property(property: "role",     type: "string", enum: ["admin", "user"]),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Utilisateur créé"),
            new OA\Response(response: 400, description: "Données invalides"),
            new OA\Response(response: 403, description: "Accès refusé"),
        ]
    )]
    public function create(): void
    {
        Auth::checkAdmin();
        $body = Auth::body();

        if (empty($body['username']) || empty($body['password']) || empty($body['role'])) {
            http_response_code(400);
            echo json_encode(['error' => 'username, password et role requis']);
            return;
        }

        $db   = Database::getInstance();
        $hash = password_hash($body['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        $stmt = $db->prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
        $stmt->execute([$body['username'], $hash, $body['role']]);
        echo json_encode(['id' => $db->lastInsertId(), 'success' => true]);
    }

    #[OA\Delete(
        path: "/users/{id}",
        summary: "Supprimer un utilisateur",
        tags: ["Users"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Utilisateur supprimé"),
            new OA\Response(response: 403, description: "Accès refusé"),
        ]
    )]
    public function delete(int $id): void
    {
        $me = Auth::checkAdmin();
        if ($id === (int)$me['sub']) {
            http_response_code(400);
            echo json_encode(['error' => 'Impossible de supprimer votre propre compte']);
            return;
        }
        $db   = Database::getInstance();
        $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }

    #[OA\Put(
        path: "/users/{id}/password",
        summary: "Modifier un mot de passe",
        tags: ["Users"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["password"],
                properties: [
                    new OA\Property(property: "password", type: "string", example: "nouveaumotdepasse"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Mot de passe modifié"),
            new OA\Response(response: 401, description: "Non autorisé"),
        ]
    )]
    public function updatePassword(int $id): void
    {
        $me   = Auth::check();
        $body = Auth::body();

        if ($me['role'] !== 'admin' && (int)$me['sub'] !== $id) {
            http_response_code(403);
            echo json_encode(['error' => 'Non autorise']);
            return;
        }

        if (empty($body['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'password requis']);
            return;
        }

        $db   = Database::getInstance();
        $hash = password_hash($body['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        $stmt = $db->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
        $stmt->execute([$hash, $id]);
        echo json_encode(['success' => true]);
    }
}
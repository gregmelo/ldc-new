<?php
namespace App\Controllers;

use App\Auth;
use App\Database;

class UserController
{
    public function index(): void
    {
        Auth::checkAdmin();
        $db   = Database::getInstance();
        $stmt = $db->query('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC');
        echo json_encode($stmt->fetchAll());
    }

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

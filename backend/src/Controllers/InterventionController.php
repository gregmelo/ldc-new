<?php
namespace App\Controllers;

use App\Auth;
use App\Database;

class InterventionController
{
    public function index(): void
    {
        Auth::check();
        $db   = Database::getInstance();
        $stmt = $db->query('SELECT * FROM interventions ORDER BY date DESC, id DESC');
        echo json_encode($stmt->fetchAll());
    }

    public function show(int $id): void
    {
        Auth::check();
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM interventions WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Introuvable']);
            return;
        }
        echo json_encode($row);
    }

    public function create(): void
    {
        Auth::check();
        $body = Auth::body();

        if (empty($body['date']) || empty($body['nom']) || empty($body['type']) || empty($body['sujet'])) {
            http_response_code(400);
            echo json_encode(['error' => 'date, nom, type et sujet requis']);
            return;
        }

        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO interventions (date, nom, type, duree, sujet, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $body['date'],
            htmlspecialchars($body['nom']),
            $body['type'],
            $body['duree'] ?? null,
            htmlspecialchars($body['sujet']),
            htmlspecialchars($body['notes'] ?? ''),
            $body['status'] ?? 'en_cours',
        ]);

        echo json_encode(['id' => $db->lastInsertId(), 'success' => true]);
    }

    public function update(int $id): void
    {
        Auth::check();
        $body = Auth::body();

        if (empty($body['date']) || empty($body['nom']) || empty($body['type']) || empty($body['sujet'])) {
            http_response_code(400);
            echo json_encode(['error' => 'date, nom, type et sujet requis']);
            return;
        }

        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'UPDATE interventions SET date=?, nom=?, type=?, duree=?, sujet=?, notes=?, status=? WHERE id=?'
        );
        $stmt->execute([
            $body['date'],
            htmlspecialchars($body['nom']),
            $body['type'],
            $body['duree'] ?? null,
            htmlspecialchars($body['sujet']),
            htmlspecialchars($body['notes'] ?? ''),
            $body['status'] ?? 'en_cours',
            $id,
        ]);

        echo json_encode(['success' => true]);
    }

    public function delete(int $id): void
    {
        Auth::check();
        $db   = Database::getInstance();
        $stmt = $db->prepare('DELETE FROM interventions WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
}

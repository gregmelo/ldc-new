<?php
namespace App\Controllers;

use App\Auth;
use App\Database;
use App\ActivityLog;
use OpenApi\Attributes as OA;

function sanitizeHtml(string $html): string
{
    $config = \HTMLPurifier_Config::createDefault();
    $config->set('HTML.Allowed', 'p,br,strong,em,h2,ul,ol,li,a[href|rel],blockquote,code,pre');
    $config->set('HTML.AllowedAttributes', 'a.href,a.rel');
    $config->set('Attr.AllowedRel', 'noopener noreferrer');
    $purifier = new \HTMLPurifier($config);
    return $purifier->purify($html);
}

class InterventionController
{
    #[OA\Get(
        path: "/interventions",
        summary: "Liste des interventions",
        tags: ["Interventions"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(response: 200, description: "Liste des interventions"),
            new OA\Response(response: 401, description: "Non autorisé"),
        ]
    )]
    public function index(): void
    {
        Auth::check();
        $db   = Database::getInstance();
        $stmt = $db->query('SELECT * FROM interventions ORDER BY date DESC, id DESC');
        echo json_encode($stmt->fetchAll());
    }

    #[OA\Get(
        path: "/interventions/{id}",
        summary: "Détails d'une intervention",
        tags: ["Interventions"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Détails de l'intervention"),
            new OA\Response(response: 401, description: "Non autorisé"),
            new OA\Response(response: 404, description: "Intervention non trouvée"),
        ]
    )]
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

    #[OA\Post(
        path: "/interventions",
        summary: "Créer une intervention",
        tags: ["Interventions"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["date", "nom", "type", "sujet"],
                properties: [
                    new OA\Property(property: "date",     type: "string", format: "date", example: "2026-06-01"),
                    new OA\Property(property: "date_fin", type: "string", format: "date", example: "2026-06-02"),
                    new OA\Property(property: "nom",      type: "string", example: "Jean-Luc"),
                    new OA\Property(property: "type",     type: "string", enum: ["visio", "message"]),
                    new OA\Property(property: "category", type: "string", example: "Teams"),
                    new OA\Property(property: "duree",    type: "integer", example: 30),
                    new OA\Property(property: "sujet",    type: "string", example: "Problème accès Teams"),
                    new OA\Property(property: "notes",    type: "string"),
                    new OA\Property(property: "status",   type: "string", enum: ["en_cours", "resolu", "en_attente", "annule", "envoye_support"]),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Intervention créée"),
            new OA\Response(response: 400, description: "Données invalides"),
            new OA\Response(response: 401, description: "Non autorisé"),
        ]
    )]
    public function create(): void
    {
        $user = Auth::check();
        $body = Auth::body();

        if (empty($body['date']) || empty($body['nom']) || empty($body['type']) || empty($body['sujet'])) {
            http_response_code(400);
            echo json_encode(['error' => 'date, nom, type et sujet requis']);
            return;
        }

        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO interventions (date, date_fin, nom, type, category, duree, sujet, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $body['date'],
            !empty($body['date_fin']) ? $body['date_fin'] : null,
            $body['nom'],
            $body['type'],
            $body['category'] ?? 'Autre',
            $body['duree'] ?? null,
            $body['sujet'],
            sanitizeHtml($body['notes'] ?? ''),
            $body['status'] ?? 'en_cours',
        ]);

        $newId = (int)$db->lastInsertId();
        ActivityLog::log($db, $user, 'create', 'intervention', $newId,
            "Nouvelle intervention pour {$body['nom']} : {$body['sujet']}"
        );

        echo json_encode(['id' => $newId, 'success' => true]);
    }

    #[OA\Put(
        path: "/interventions/{id}",
        summary: "Modifier une intervention",
        tags: ["Interventions"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["date", "nom", "type", "sujet"],
                properties: [
                    new OA\Property(property: "date",     type: "string", format: "date"),
                    new OA\Property(property: "date_fin", type: "string", format: "date"),
                    new OA\Property(property: "nom",      type: "string"),
                    new OA\Property(property: "type",     type: "string", enum: ["visio", "message"]),
                    new OA\Property(property: "category", type: "string"),
                    new OA\Property(property: "duree",    type: "integer"),
                    new OA\Property(property: "sujet",    type: "string"),
                    new OA\Property(property: "notes",    type: "string"),
                    new OA\Property(property: "status",   type: "string", enum: ["en_cours", "resolu", "en_attente", "annule", "envoye_support"]),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Intervention modifiée"),
            new OA\Response(response: 400, description: "Données invalides"),
            new OA\Response(response: 401, description: "Non autorisé"),
        ]
    )]
    public function update(int $id): void
    {
        $user = Auth::check();
        $body = Auth::body();

        if (empty($body['date']) || empty($body['nom']) || empty($body['type']) || empty($body['sujet'])) {
            http_response_code(400);
            echo json_encode(['error' => 'date, nom, type et sujet requis']);
            return;
        }

        $db = Database::getInstance();

        $oldStmt = $db->prepare('SELECT status, nom, sujet FROM interventions WHERE id = ?');
        $oldStmt->execute([$id]);
        $old = $oldStmt->fetch();

        $stmt = $db->prepare(
            'UPDATE interventions SET date=?, date_fin=?, nom=?, type=?, category=?, duree=?, sujet=?, notes=?, status=? WHERE id=?'
        );
        $stmt->execute([
            $body['date'],
            !empty($body['date_fin']) ? $body['date_fin'] : null,
            $body['nom'],
            $body['type'],
            $body['category'] ?? 'Autre',
            $body['duree'] ?? null,
            $body['sujet'],
            sanitizeHtml($body['notes'] ?? ''),
            $body['status'] ?? 'en_cours',
            $id,
        ]);

        $newStatus = $body['status'] ?? 'en_cours';
        if ($old && $old['status'] !== $newStatus) {
            ActivityLog::log($db, $user, 'status_change', 'intervention', $id,
                "Statut modifié : {$old['status']} → {$newStatus} ({$body['nom']} : {$body['sujet']})"
            );
        } else {
            ActivityLog::log($db, $user, 'update', 'intervention', $id,
                "Intervention modifiée pour {$body['nom']} : {$body['sujet']}"
            );
        }

        echo json_encode(['success' => true]);
    }

    #[OA\Delete(
        path: "/interventions/{id}",
        summary: "Supprimer une intervention",
        tags: ["Interventions"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Intervention supprimée"),
            new OA\Response(response: 401, description: "Non autorisé"),
        ]
    )]
    public function delete(int $id): void
    {
        $user = Auth::check();
        $db   = Database::getInstance();

        $stmt = $db->prepare('SELECT nom, sujet FROM interventions WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        $deleteStmt = $db->prepare('DELETE FROM interventions WHERE id = ?');
        $deleteStmt->execute([$id]);

        ActivityLog::log($db, $user, 'delete', 'intervention', $id,
            $row ? "Intervention supprimée pour {$row['nom']} : {$row['sujet']}" : "Intervention #$id supprimée"
        );

        echo json_encode(['success' => true]);
    }
}
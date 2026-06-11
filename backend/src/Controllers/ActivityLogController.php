<?php
namespace App\Controllers;

use App\Auth;
use App\Database;
use App\ActivityLog;
use OpenApi\Attributes as OA;

class ActivityLogController
{
    #[OA\Get(
        path: "/activity-log",
        summary: "Journal d'activité",
        tags: ["Journal"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "limit",  in: "query", schema: new OA\Schema(type: "integer", default: 25)),
            new OA\Parameter(name: "offset", in: "query", schema: new OA\Schema(type: "integer", default: 0)),
        ],
        responses: [
            new OA\Response(response: 200, description: "Journal d'activité"),
            new OA\Response(response: 403, description: "Accès refusé"),
        ]
    )]
    public function index(): void
    {
        Auth::checkAdmin();
        $db = Database::getInstance();

        $limit  = isset($_GET['limit'])  ? (int)$_GET['limit']  : 50;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        $stmt = $db->prepare(
            'SELECT * FROM activity_log ORDER BY created_at DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':limit',  $limit,  \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        $logs = $stmt->fetchAll();

        $countStmt = $db->query('SELECT COUNT(*) FROM activity_log');
        $total = (int)$countStmt->fetchColumn();

        echo json_encode(['logs' => $logs, 'total' => $total]);
    }

    #[OA\Delete(
        path: "/activity-log",
        summary: "Purge du journal d'activité",
        tags: ["Journal"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(response: 200, description: "Journal purgé"),
            new OA\Response(response: 403, description: "Accès refusé"),
        ]
    )]
    public function purge(): void
    {
        Auth::checkAdmin();
        $db = Database::getInstance();
        $db->exec('TRUNCATE TABLE activity_log');

        $user = Auth::check();
        ActivityLog::log($db, $user, 'purge', 'activity_log', null, 'Journal d\'activité purgé');

        echo json_encode(['success' => true]);
    }
}
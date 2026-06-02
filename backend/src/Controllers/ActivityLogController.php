<?php

namespace App\Controllers;

use App\Auth;
use App\Database;
use App\ActivityLog;

class ActivityLogController
{
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

    public function purge(): void
    {
        Auth::checkAdmin();
        $db = Database::getInstance();
        $db->exec('TRUNCATE TABLE activity_log');

        // Log la purge elle-même
        $user = Auth::check();
        ActivityLog::log($db, $user, 'purge', 'activity_log', null, 'Journal d\'activité purgé');

        echo json_encode(['success' => true]);
    }
}

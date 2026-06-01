<?php
namespace App;

class ActivityLog
{
    public static function log(
        \PDO $db,
        array $user,
        string $action,
        string $entity,
        ?int $entityId = null,
        ?string $description = null
    ): void {
        try {
            $stmt = $db->prepare(
                'INSERT INTO activity_log (user_id, username, action, entity, entity_id, description) VALUES (?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $user['sub'] ?? null,
                $user['user'] ?? 'system',
                $action,
                $entity,
                $entityId,
                $description,
            ]);
        } catch (\Exception $e) {
            // Ne pas bloquer l'application si le log échoue
        }
    }
}
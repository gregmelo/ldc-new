<?php
namespace Tests;

use PHPUnit\Framework\TestCase;
use App\ActivityLog;

class ActivityLogTest extends TestCase
{
    private \PDO $db;

    protected function setUp(): void
    {
        // Base SQLite en mémoire pour les tests
        $this->db = new \PDO('sqlite::memory:');
        $this->db->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
        $this->db->exec('
            CREATE TABLE activity_log (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id     INTEGER NULL,
                username    VARCHAR(100) NOT NULL,
                action      VARCHAR(50)  NOT NULL,
                entity      VARCHAR(50)  NOT NULL,
                entity_id   INTEGER NULL,
                description TEXT NULL,
                created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ');
    }

    public function testLogInsertsRow(): void
    {
        $user = ['sub' => 1, 'user' => 'admin'];

        ActivityLog::log($this->db, $user, 'create', 'intervention', 42, 'Test log');

        $stmt  = $this->db->query('SELECT * FROM activity_log');
        $rows  = $stmt->fetchAll();

        $this->assertCount(1, $rows);
        $this->assertEquals('admin',        $rows[0]['username']);
        $this->assertEquals('create',       $rows[0]['action']);
        $this->assertEquals('intervention', $rows[0]['entity']);
        $this->assertEquals(42,             $rows[0]['entity_id']);
        $this->assertEquals('Test log',     $rows[0]['description']);
    }

    public function testLogWithNullEntityId(): void
    {
        $user = ['sub' => 1, 'user' => 'admin'];

        ActivityLog::log($this->db, $user, 'purge', 'activity_log', null, 'Journal purgé');

        $stmt = $this->db->query('SELECT * FROM activity_log');
        $rows = $stmt->fetchAll();

        $this->assertCount(1, $rows);
        $this->assertNull($rows[0]['entity_id']);
    }

    public function testLogMultipleEntries(): void
    {
        $user = ['sub' => 1, 'user' => 'admin'];

        ActivityLog::log($this->db, $user, 'create', 'intervention', 1, 'Création 1');
        ActivityLog::log($this->db, $user, 'update', 'intervention', 1, 'Modification 1');
        ActivityLog::log($this->db, $user, 'delete', 'intervention', 1, 'Suppression 1');

        $stmt = $this->db->query('SELECT COUNT(*) as total FROM activity_log');
        $row  = $stmt->fetch();

        $this->assertEquals(3, $row['total']);
    }

    public function testLogDoesNotThrowOnError(): void
    {
        // PDO avec une table inexistante ne doit pas faire planter l'application
        $badDb = new \PDO('sqlite::memory:');
        $user  = ['sub' => 1, 'user' => 'admin'];

        // Ne doit pas lever d'exception
        $this->expectNotToPerformAssertions();
        ActivityLog::log($badDb, $user, 'create', 'intervention', 1, 'Test');
    }
}
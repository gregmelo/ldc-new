<?php
namespace App;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            try {
                self::$instance = new PDO(
                    'mysql:host=' . $_ENV['LDC_DB_HOST'] . ';dbname=' . $_ENV['LDC_DB_NAME'] . ';charset=utf8mb4',
                    $_ENV['LDC_DB_USER'],
                    $_ENV['LDC_DB_PASS'],
                    [
                        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    ]
                );
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Connexion BDD echouee']);
                exit;
            }
        }
        return self::$instance;
    }
}

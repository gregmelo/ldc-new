<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Router;

// Chargement .env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();
$dotenv->required(['LDC_DB_HOST', 'LDC_DB_NAME', 'LDC_DB_USER', 'LDC_DB_PASS', 'LDC_APP_SECRET']);

// CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . ($_ENV['LDC_ALLOWED_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$router = new Router();
$router->dispatch();

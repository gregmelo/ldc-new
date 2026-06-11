<?php
require_once __DIR__ . '/../vendor/autoload.php';

// Charger les variables d'environnement de test
if (file_exists(__DIR__ . '/../.env.test')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..', '.env.test');
    $dotenv->load();
}
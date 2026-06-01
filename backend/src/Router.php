<?php
namespace App;

use App\Controllers\AuthController;
use App\Controllers\InterventionController;
use App\Controllers\UserController;
use App\Controllers\ActivityLogController;

class Router
{
    private string $method;
    private array  $segments;
    private string $endpoint;

    public function __construct()
    {
        $this->method   = $_SERVER['REQUEST_METHOD'];
        $uri            = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $this->segments = array_values(array_filter(explode('/', $uri)));
        $this->endpoint = end($this->segments) ?: '';
    }

    public function dispatch(): void
    {
        $seg = $this->segments;
        $ep  = $this->endpoint;
        $m   = $this->method;
        $n   = count($seg);

        if ($ep === 'login' && $m === 'POST') {
            (new AuthController())->login(); return;
        }
        if ($ep === 'me' && $m === 'GET') {
            (new AuthController())->me(); return;
        }

        // /activity-log
        if ($ep === 'activity-log' && $m === 'GET') {
            (new ActivityLogController())->index(); return;
        }

        // /users
        if ($ep === 'users') {
            $ctrl = new UserController();
            if ($m === 'GET')  { $ctrl->index(); return; }
            if ($m === 'POST') { $ctrl->create(); return; }
        }
        if ($n >= 2 && $seg[$n-2] === 'users' && is_numeric($ep)) {
            $ctrl = new UserController();
            if ($m === 'DELETE') { $ctrl->delete((int)$ep); return; }
        }
        if ($ep === 'password' && $n >= 3 && $seg[$n-3] === 'users' && $m === 'PUT') {
            (new UserController())->updatePassword((int)$seg[$n-2]); return;
        }

        // /interventions
        if ($ep === 'interventions') {
            $ctrl = new InterventionController();
            if ($m === 'GET')  { $ctrl->index(); return; }
            if ($m === 'POST') { $ctrl->create(); return; }
        }
        if ($n >= 2 && $seg[$n-2] === 'interventions' && is_numeric($ep)) {
            $ctrl = new InterventionController();
            if ($m === 'GET')    { $ctrl->show((int)$ep); return; }
            if ($m === 'PUT')    { $ctrl->update((int)$ep); return; }
            if ($m === 'DELETE') { $ctrl->delete((int)$ep); return; }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route introuvable']);
    }
}
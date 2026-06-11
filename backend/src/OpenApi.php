<?php
namespace App;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: "Suivi Interventions LDC",
    version: "1.0.0",
    description: "API de suivi des interventions support LDC",
)]
#[OA\Server(url: "/ldc/backend/public/index.php", description: "Production")]
#[OA\SecurityScheme(
    securityScheme: "bearerAuth",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT"
)]
class OpenApi {}
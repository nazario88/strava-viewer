<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://strava.dailyheroes.io')
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$config = require 'config.php';

$clientId     = $config['STRAVA_CLIENT_ID'];
$clientSecret = $config['STRAVA_CLIENT_SECRET'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON body']);
    exit;
}

$grantType = $input['grant_type'] ?? 'authorization_code';

if ($grantType === 'refresh_token') {
    // Rafraîchissement du token
    $refreshToken = $input['refresh_token'] ?? '';
    if (empty($refreshToken)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing refresh_token']);
        exit;
    }

    $payload = [
        'client_id'     => $clientId,
        'client_secret' => $clientSecret,
        'grant_type'    => 'refresh_token',
        'refresh_token' => $refreshToken,
    ];
} else {
    // Échange code → token initial
    $code = $input['code'] ?? '';
    if (empty($code)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing code']);
        exit;
    }

    $payload = [
        'client_id'     => $clientId,
        'client_secret' => $clientSecret,
        'code'          => $code,
        'grant_type'    => 'authorization_code',
    ];
}

$context = stream_context_create([
    'http' => [
        'method'  => 'POST',
        'header'  => 'Content-Type: application/json',
        'content' => json_encode($payload),
    ]
]);

$response = file_get_contents('https://www.strava.com/oauth/token', false, $context);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to contact Strava API']);
    exit;
}

echo $response;
?>

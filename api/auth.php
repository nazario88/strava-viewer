<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$config = require 'config.php';

$clientId = $config['STRAVA_CLIENT_ID'];
$clientSecret = $config['STRAVA_CLIENT_SECRET'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $response = file_get_contents('https://www.strava.com/oauth/token', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => json_encode([
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'code' => $input['code'],
                'grant_type' => 'authorization_code'
            ])
        ]
    ]));
    
    echo $response;
}
?>
<?php
// Example 2: The proxy (slides 11-13)
// Client -> THIS SCRIPT -> Open-Meteo
// This script returns JSON in OUR schema. Change providers later and only this file changes.
require __DIR__ . '/helpers.php';

function respond(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($payload, JSON_PRETTY_PRINT);
    exit;
}

// WMO weather codes -> plain English. This is provider-specific knowledge,
// so it lives in the proxy and the client never has to learn it.
function describe_weather_code(int $code): string
{
    return match (true) {
        $code === 0           => 'Clear sky',
        $code <= 3            => 'Partly cloudy',
        $code <= 48           => 'Fog',
        $code <= 57           => 'Drizzle',
        $code <= 67           => 'Rain',
        $code <= 77           => 'Snow',
        $code <= 82           => 'Rain showers',
        $code <= 86           => 'Snow showers',
        $code >= 95           => 'Thunderstorm',
        default               => 'Unknown',
    };
}

// 1. Validate what the client sent us
$coords = read_coordinates();
if ($coords === null) {
    respond(400, ['error' => 'Provide numeric lat (-90..90) and lon (-180..180), e.g. ?lat=44.65&lon=-63.57']);
}
[$lat, $lon] = $coords;

// 2. Call the provider
$providerUrl = 'https://api.open-meteo.com/v1/forecast?' . http_build_query([
    'latitude'        => $lat,
    'longitude'       => $lon,
    'current_weather' => 'true',
    'timezone'        => 'auto',
]);
$result = http_get($providerUrl, 8);

// 3. Map provider failures to a status the client understands.
//    502 Bad Gateway = "I'm fine, but the server I depend on is not."
if (!$result['ok']) {
    respond(502, ['error' => 'Weather provider unavailable', 'detail' => $result['error']]);
}

$data    = json_decode($result['body'], true);
$current = $data['current_weather'] ?? null;
if ($current === null) {
    respond(502, ['error' => 'Weather provider returned an unexpected response']);
}

// 4. Return OUR stable shape, not the provider's
$normalized = [
    'provider'  => 'open-meteo',
    'requested' => ['lat' => $lat, 'lon' => $lon],
    'current'   => [
        'temp_c'         => $current['temperature'],
        'wind_kph'       => $current['windspeed'],
        'condition'      => describe_weather_code((int) $current['weathercode']),
        'observed_at'    => $current['time'],
    ],
    'retrieved_at' => gmdate('c'),
];

respond(200, $normalized);

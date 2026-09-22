<?php
// Shared helpers for the server-side HTTP examples.

// A tiny wrapper around the "PHP cURL essentials" slide.
// Returns an array so the caller decides how to handle each failure:
//   ok     - true when we got a body back and the status was below 400
//   status - the HTTP status code from the remote server (0 if we never got one)
//   body   - the response body as a string (or null)
//   error  - a human-readable problem description (or null)
function http_get(string $url, int $timeout = 10): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,          // give us the body instead of echoing it
        CURLOPT_TIMEOUT        => $timeout,      // never let a slow provider hang our page
        CURLOPT_FOLLOWLOCATION => true,          // follow redirects
        CURLOPT_SSL_VERIFYPEER => true,          // always verify the provider's certificate
        CURLOPT_HTTPHEADER     => ['Accept: application/json'],
    ]);

    $body   = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error  = curl_error($ch);
    curl_close($ch);

    if ($body === false) {
        // Network-level failure: DNS, timeout, TLS...
        return ['ok' => false, 'status' => $status, 'body' => null, 'error' => $error];
    }
    if ($status >= 400) {
        return ['ok' => false, 'status' => $status, 'body' => $body, 'error' => "Provider returned HTTP $status"];
    }
    return ['ok' => true, 'status' => $status, 'body' => $body, 'error' => null];
}

// A few cities to click through in the weather demos
function demo_cities(): array
{
    return [
        'Halifax'    => ['lat' => 44.65, 'lon' => -63.57],
        'Toronto'    => ['lat' => 43.65, 'lon' => -79.38],
        'Vancouver'  => ['lat' => 49.28, 'lon' => -123.12],
        "St. John's" => ['lat' => 47.56, 'lon' => -52.71],
    ];
}

// Read and validate ?lat= and ?lon= from the query string.
// Returns [lat, lon] as floats, or null if either is missing or out of range.
// Never trust input, even when you're only passing it on to another server.
function read_coordinates(): ?array
{
    $lat = filter_var($_GET['lat'] ?? null, FILTER_VALIDATE_FLOAT);
    $lon = filter_var($_GET['lon'] ?? null, FILTER_VALIDATE_FLOAT);

    if ($lat === false || $lon === false || $lat < -90 || $lat > 90 || $lon < -180 || $lon > 180) {
        return null;
    }
    return [$lat, $lon];
}

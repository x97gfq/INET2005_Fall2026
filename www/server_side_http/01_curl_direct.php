<?php
// Example 1: Direct call + render (slides 9-10)
// The BROWSER talks to this PHP page. This PHP page (the server) talks to Open-Meteo.
// The browser never contacts the weather provider itself.
require __DIR__ . '/helpers.php';

// Default to Halifax when no (valid) coordinates are supplied
[$lat, $lon] = read_coordinates() ?? [44.65, -63.57];

$providerUrl = 'https://api.open-meteo.com/v1/forecast?' . http_build_query([
    'latitude'        => $lat,
    'longitude'       => $lon,
    'current_weather' => 'true',
    'timezone'        => 'auto',
]);

// --- The cURL essentials, written out longhand ---
$ch = curl_init($providerUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 8,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_HTTPHEADER     => ['Accept: application/json'],
]);
$body = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

$error   = null;
$current = null;
if ($body === false || $code >= 400) {
    $error = $curlError ?: "Provider returned HTTP $code";
} else {
    $data    = json_decode($body, true);
    $current = $data['current_weather'] ?? null;
    if ($current === null) {
        $error = 'Provider response did not contain current_weather.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Example 1: Direct cURL call</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <h2 class="mb-3">Example 1: Direct cURL call</h2>

      <p>
        <?php foreach (demo_cities() as $name => $c): ?>
          <a class="btn btn-sm btn-outline-primary" href="?lat=<?php echo $c['lat']; ?>&lon=<?php echo $c['lon']; ?>"><?php echo htmlspecialchars($name); ?></a>
        <?php endforeach; ?>
      </p>

      <?php if ($error): ?>
        <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
      <?php else: ?>
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">Current weather at <?php echo htmlspecialchars((string) $lat); ?>, <?php echo htmlspecialchars((string) $lon); ?></h5>
            <p class="display-5 mb-1"><?php echo htmlspecialchars((string) $current['temperature']); ?> &deg;C</p>
            <p class="mb-1">Wind: <?php echo htmlspecialchars((string) $current['windspeed']); ?> km/h</p>
            <!-- Notice the raw provider value. Our page now depends on Open-Meteo's schema and codes. -->
            <p class="mb-1">Condition (WMO code): <?php echo htmlspecialchars((string) $current['weathercode']); ?></p>
            <p class="text-muted mb-0">Observed at <?php echo htmlspecialchars((string) $current['time']); ?></p>
          </div>
        </div>

        <details>
          <summary>Raw JSON from the provider</summary>
          <pre class="bg-light p-3 mt-2"><?php echo htmlspecialchars(json_encode(json_decode($body), JSON_PRETTY_PRINT)); ?></pre>
        </details>
      <?php endif; ?>

      <p class="mt-4 text-muted">Request made by PHP: <code><?php echo htmlspecialchars($providerUrl); ?></code></p>
    </div>
  </div>
</div>
</body>
</html>

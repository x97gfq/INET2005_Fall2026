<?php
// Example 3: A client that consumes OUR proxy (slide 14)
// This page has no idea Open-Meteo exists. It only knows the proxy's schema.
require __DIR__ . '/helpers.php';

[$lat, $lon] = read_coordinates() ?? [44.65, -63.57];

// The proxy lives in the same folder on this same server. Inside the Docker
// container Apache answers on localhost:80, so PHP can call itself over HTTP.
$proxyUrl = 'http://localhost' . dirname($_SERVER['SCRIPT_NAME']) . '/02_weather_proxy.php?' . http_build_query([
    'lat' => $lat,
    'lon' => $lon,
]);

// file_get_contents() is the no-frills alternative to cURL.
// ignore_errors lets us read the JSON error body when the proxy answers 4xx/5xx.
$context = stream_context_create(['http' => ['timeout' => 10, 'ignore_errors' => true]]);
$raw     = @file_get_contents($proxyUrl, false, $context);
$json    = $raw === false ? null : json_decode($raw, true);

$error = null;
if ($json === null) {
    $error = 'Could not reach the proxy.';
} elseif (isset($json['error'])) {
    $error = $json['error'];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Example 3: Client of our proxy</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <h2 class="mb-3">Example 3: Client of our proxy</h2>

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
            <h5 class="card-title">Current weather at <?php echo htmlspecialchars((string) $json['requested']['lat']); ?>, <?php echo htmlspecialchars((string) $json['requested']['lon']); ?></h5>
            <p class="display-5 mb-1"><?php echo htmlspecialchars((string) $json['current']['temp_c']); ?> &deg;C</p>
            <p class="mb-1">Wind: <?php echo htmlspecialchars((string) $json['current']['wind_kph']); ?> km/h</p>
            <p class="mb-1">Condition: <?php echo htmlspecialchars($json['current']['condition']); ?></p>
            <p class="text-muted mb-0">
              Provider: <?php echo htmlspecialchars($json['provider']); ?> &middot;
              retrieved <?php echo htmlspecialchars($json['retrieved_at']); ?>
            </p>
          </div>
        </div>
      <?php endif; ?>

      <p class="mt-4 text-muted">Request made by PHP: <code><?php echo htmlspecialchars($proxyUrl); ?></code></p>
      <p><a href="02_weather_proxy.php?lat=<?php echo $lat; ?>&lon=<?php echo $lon; ?>">View the raw proxy JSON</a></p>
    </div>
  </div>
</div>
</body>
</html>

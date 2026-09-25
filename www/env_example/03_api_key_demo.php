<?php
// Example 3: an API key from .env.
// This uses a fake key and does not call a real API — the point is WHERE the
// key comes from and how it's used, which is identical for a real one.
require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;
use Dotenv\Repository\RepositoryBuilder;
use Dotenv\Repository\Adapter\PutenvAdapter;

// See 01_load_env.php for why PutenvAdapter is added: it makes getenv() work,
// not just $_ENV.
$repository = RepositoryBuilder::createWithDefaultAdapters()
    ->addWriter(PutenvAdapter::class)
    ->immutable()
    ->make();

Dotenv::create($repository, __DIR__)->load();

$apiKey = getenv('WEATHER_API_KEY');

// This is what Examples in server_side_http/ would actually send:
$exampleUrl = 'https://api.example.com/v1/forecast?' . http_build_query([
    'city'    => 'Halifax',
    'apikey'  => $apiKey,
]);

function maskKey(string $key): string
{
    if (strlen($key) <= 4) {
        return str_repeat('*', strlen($key));
    }
    return str_repeat('*', strlen($key) - 4) . substr($key, -4);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Example 3: API key from .env</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <h2 class="mb-3">Example 3: API key from .env</h2>

      <p>Key loaded from <code>.env</code> (masked for display): <code><?php echo htmlspecialchars(maskKey($apiKey)); ?></code></p>

      <p>The request this key would be used in:</p>
      <pre class="bg-light p-3"><?php echo htmlspecialchars($exampleUrl); ?></pre>

      <div class="alert alert-warning">
        This key is fake and this URL is never actually requested. If it were real,
        <code>getenv('WEATHER_API_KEY')</code> is the ONLY place it should ever appear in
        your code — never typed directly into a <code>.php</code> file, and never
        pasted into a GitHub issue, a Slack message, or a screenshot.
      </div>

      <p class="text-muted mt-4">See <code>server_side_http/</code> for full working examples of making this kind of request with cURL.</p>
    </div>
  </div>
</div>
</body>
</html>

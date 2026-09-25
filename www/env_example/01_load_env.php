<?php
// Example 1: loading a .env file and reading it two ways.
// vlucas/phpdotenv reads a plain-text .env file and copies its values into
// PHP's environment, where getenv() and $_ENV can see them — nothing in this
// script's own code ever contains the real values.
require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;
use Dotenv\Exception\InvalidPathException;
use Dotenv\Repository\RepositoryBuilder;
use Dotenv\Repository\Adapter\PutenvAdapter;

// ?simulate_missing=1 points phpdotenv at a folder with no .env file, so you
// can see how a MISSING .env is handled — the same try/catch idea from the
// exception_handling folder applies here too.
$targetDir = isset($_GET['simulate_missing']) ? __DIR__ . '/no_such_folder' : __DIR__;

// By default, phpdotenv (v5) only fills $_ENV and $_SERVER — it deliberately
// skips putenv() because it isn't safe on every server setup. Adding
// PutenvAdapter here also calls putenv(), so PHP's own getenv() can see the
// values too, which is what this example is demonstrating.
$repository = RepositoryBuilder::createWithDefaultAdapters()
    ->addWriter(PutenvAdapter::class)
    ->immutable()
    ->make();

$dotenv = Dotenv::create($repository, $targetDir);
$loadError = null;

try {
    $dotenv->load();
} catch (InvalidPathException $e) {
    $loadError = $e->getMessage();
}

// Two ways to read a loaded variable — both work once ->load() has run.
$dbHostViaGetenv = getenv('DB_HOST');
$dbHostViaEnvArray = $_ENV['DB_HOST'] ?? null;

// Never print a real secret in full. Showing only the first/last couple of
// characters is enough to prove it loaded without exposing it.
function mask(string $value): string
{
    $len = strlen($value);
    if ($len <= 4) {
        return str_repeat('*', $len);
    }
    return substr($value, 0, 2) . str_repeat('*', $len - 4) . substr($value, -2);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Example 1: Loading a .env file</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <h2 class="mb-3">Example 1: Loading a .env file</h2>

      <p><a href="?simulate_missing=1" class="btn btn-sm btn-outline-secondary">Simulate a missing .env file</a>
      <a href="01_load_env.php" class="btn btn-sm btn-outline-secondary">Reset</a></p>

      <?php if ($loadError): ?>
        <div class="alert alert-danger">
          <strong>Could not load .env:</strong> <?php echo htmlspecialchars($loadError); ?>
        </div>
        <p class="text-muted">phpdotenv threw <code>Dotenv\Exception\InvalidPathException</code>, which we caught with an ordinary <code>try</code>/<code>catch</code> — the same pattern from the exception_handling examples.</p>
      <?php else: ?>
        <div class="alert alert-success">.env loaded successfully from this folder.</div>

        <table class="table table-bordered bg-white">
          <thead><tr><th>Variable</th><th>getenv('DB_HOST')</th><th>$_ENV['DB_HOST']</th></tr></thead>
          <tbody>
            <tr>
              <td>DB_HOST</td>
              <td><?php echo htmlspecialchars((string) $dbHostViaGetenv); ?></td>
              <td><?php echo htmlspecialchars((string) $dbHostViaEnvArray); ?></td>
            </tr>
          </tbody>
        </table>

        <table class="table table-bordered bg-white">
          <thead><tr><th>Variable</th><th>Value (masked)</th></tr></thead>
          <tbody>
            <?php foreach (['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASS', 'WEATHER_API_KEY'] as $key): ?>
              <tr>
                <td><code><?php echo $key; ?></code></td>
                <td><?php echo htmlspecialchars(mask((string) $_ENV[$key])); ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
        <p class="text-muted">Values are masked here only so a screen-share doesn't leak them. In your own code you'd use the real value directly — see Examples 2 and 3.</p>
      <?php endif; ?>
    </div>
  </div>
</div>
</body>
</html>

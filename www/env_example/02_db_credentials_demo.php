<?php
// Example 2: using .env for real database credentials.
// Notice there is NOT ONE hardcoded credential anywhere in this file — every
// value needed to connect comes from getenv(), which phpdotenv filled in
// from .env.
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

$host = getenv('DB_HOST');
$port = (int) getenv('DB_PORT');
$name = getenv('DB_NAME');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');

$connected = false;
$serverInfo = null;
$error = null;

// mysqli_report makes a failed connection throw an exception instead of just
// a warning, so we can handle it with the try/catch pattern from earlier.
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conn = new mysqli($host, $user, $pass, $name, $port);
    $connected = true;
    $serverInfo = $conn->server_info;
    $conn->close();
} catch (mysqli_sql_exception $e) {
    $error = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Example 2: DB credentials from .env</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <h2 class="mb-3">Example 2: DB credentials from .env</h2>

      <p>Connecting to <code><?php echo htmlspecialchars("$host:$port/$name"); ?></code> as <code><?php echo htmlspecialchars($user); ?></code> — all four values came from <code>.env</code>, not from this file.</p>

      <?php if ($connected): ?>
        <div class="alert alert-success">Connected! MySQL server version: <?php echo htmlspecialchars($serverInfo); ?></div>
      <?php else: ?>
        <div class="alert alert-danger">Connection failed: <?php echo htmlspecialchars($error); ?></div>
      <?php endif; ?>

      <p class="text-muted mt-4">Why this matters: this same code works unchanged on your laptop, a teammate's laptop, and a production server — each machine just needs its own <code>.env</code> with its own credentials. Nobody has to edit PHP code (or commit a password) to point it at a different database.</p>
    </div>
  </div>
</div>
</body>
</html>

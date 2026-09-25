<?php
// Example 4: parse_ini_file() — reading .env with NO package at all.
// A .env file is really just simple INI-style text (KEY=value), and PHP has
// a built-in function for exactly that. No Composer, no vendor/, no
// require — this is the whole "loading" step:
$envFile = __DIR__ . '/.env';

$config = null;
$error = null;

if (!is_file($envFile)) {
    $error = "No .env file found at $envFile";
} else {
    // INI_SCANNER_RAW keeps every value as a plain string — without it,
    // parse_ini_file() converts things like "true"/"false"/"null" into real
    // PHP booleans/null, which .env files don't expect.
    $config = parse_ini_file($envFile, false, INI_SCANNER_RAW);
    if ($config === false) {
        $error = "$envFile could not be parsed — check for a stray quote or special character.";
    }
}

// parse_ini_file() only hands back an array. It does NOT touch getenv() or
// $_ENV for you — if you want those to work too, you set them yourself:
$populateSuperglobals = isset($_GET['populate_env']);
if ($populateSuperglobals && $config !== null) {
    foreach ($config as $key => $value) {
        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
}

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
<title>Example 4: parse_ini_file()</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <h2 class="mb-3">Example 4: parse_ini_file()</h2>
      <p class="text-muted">Same <code>.env</code> file as Examples 1–3, read with zero third-party code.</p>

      <?php if ($error): ?>
        <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
      <?php else: ?>
        <div class="alert alert-success">.env parsed successfully with <code>parse_ini_file()</code>.</div>

        <table class="table table-bordered bg-white">
          <thead><tr><th>Key</th><th>Value (masked)</th></tr></thead>
          <tbody>
            <?php foreach ($config as $key => $value): ?>
              <tr>
                <td><code><?php echo htmlspecialchars($key); ?></code></td>
                <td><?php echo htmlspecialchars(mask((string) $value)); ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>

        <p>
          <a class="btn btn-sm btn-outline-primary" href="?populate_env=1">Also copy these into $_ENV / getenv()</a>
          <a class="btn btn-sm btn-outline-secondary" href="04_parse_ini_file.php">Reset</a>
        </p>

        <?php if ($populateSuperglobals): ?>
          <table class="table table-bordered bg-white">
            <thead><tr><th>Variable</th><th>getenv('DB_HOST')</th><th>$_ENV['DB_HOST']</th></tr></thead>
            <tbody>
              <tr>
                <td>DB_HOST</td>
                <td><?php echo htmlspecialchars((string) getenv('DB_HOST')); ?></td>
                <td><?php echo htmlspecialchars((string) $_ENV['DB_HOST']); ?></td>
              </tr>
            </tbody>
          </table>
          <p class="text-muted">Both work now — but only because the <code>foreach</code> loop above set them by hand. <code>parse_ini_file()</code> itself never touches <code>$_ENV</code> or the process environment.</p>
        <?php endif; ?>
      <?php endif; ?>

      <h5 class="mt-4">parse_ini_file() vs. vlucas/phpdotenv</h5>
      <table class="table table-bordered bg-white">
        <thead><tr><th></th><th><code>parse_ini_file()</code></th><th><code>vlucas/phpdotenv</code></th></tr></thead>
        <tbody>
          <tr><td>Setup</td><td>None — built into PHP</td><td>Composer + <code>vendor/</code></td></tr>
          <tr><td>Result</td><td>A plain array you use directly</td><td>Fills <code>$_ENV</code> (and, if configured, <code>getenv()</code>) automatically</td></tr>
          <tr><td>Missing file</td><td>Returns <code>false</code> + a PHP warning</td><td>Throws a catchable <code>InvalidPathException</code></td></tr>
          <tr><td>Quoted / multiline values, variable references</td><td>Basic INI rules only</td><td>Handles these properly</td></tr>
        </tbody>
      </table>
      <p class="text-muted">For a small class project, <code>parse_ini_file()</code> is often all you need. Real-world apps tend to reach for <code>phpdotenv</code> as the project grows, mainly for the safer error handling and edge cases above.</p>
    </div>
  </div>
</div>
</body>
</html>

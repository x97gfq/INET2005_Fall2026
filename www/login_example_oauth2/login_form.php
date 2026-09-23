<?php
session_start();
require __DIR__ . '/config.php';

// Same flash-message pattern as login_example4 - the callback page leaves an
// error here and redirects, and we show it exactly once.
$errors = $_SESSION['flash_errors'] ?? [];
$notice = $_SESSION['flash_notice'] ?? null;
unset($_SESSION['flash_errors'], $_SESSION['flash_notice']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Login with Google</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-5">
      <h2 class="mb-1">Sign In</h2>
      <p class="text-muted">OAuth2 / OpenID Connect with Google</p>

      <?php if ($notice): ?>
        <div class="alert alert-info"><?php echo htmlspecialchars($notice); ?></div>
      <?php endif; ?>
      <?php if (!empty($errors)): ?>
        <div class="alert alert-danger">
          <ul class="mb-0">
            <?php foreach ($errors as $error): ?>
              <li><?php echo htmlspecialchars($error); ?></li>
            <?php endforeach; ?>
          </ul>
        </div>
      <?php endif; ?>

      <?php if (!oauth_is_configured()): ?>
        <div class="alert alert-warning">
          <strong>Not configured yet.</strong> Copy <code>config.local.php.example</code> to
          <code>config.local.php</code> and add your Google client ID and secret.
          See <code>README.md</code> for the Google Cloud Console steps.
        </div>
      <?php else: ?>
        <!--
          Notice there is no username or password field anywhere on this page.
          That is the whole point of OAuth2: this app never sees the user's
          Google password. The button just starts the flow.
        -->
        <div class="card">
          <div class="card-body text-center">
            <p class="card-text">This app never sees your Google password.</p>
            <a href="oauth_start.php" class="btn btn-primary btn-lg">Sign in with Google</a>
          </div>
        </div>
      <?php endif; ?>

      <hr class="my-4">
      <p class="small text-muted mb-1">Compare with <code>login_example4</code>, where this app
      stored the password hash itself. Here Google does the authenticating and
      tells us who the user is.</p>
      <a href="dashboard.php" class="small">Try the dashboard without logging in &rarr;</a>
    </div>
  </div>
</div>
</body>
</html>

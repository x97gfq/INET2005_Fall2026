<?php
session_start();

// This ends OUR session only. The user is still signed in to Google itself -
// clicking "Sign in with Google" again will usually go straight through
// without asking for a password. Logging out of the identity provider is a
// separate thing, and most apps deliberately do not do it.
$_SESSION = [];
session_destroy();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Logged Out</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-6">
      <h2 class="mb-4">Logged Out</h2>
      <div class="alert alert-secondary">
        Your session with <em>this app</em> is gone. You are still signed in to Google -
        that is why signing back in may not ask for your password again.
      </div>
      <a href="login_form.php" class="btn btn-primary me-2">Back to Sign In</a>
      <a href="dashboard.php" class="btn btn-outline-secondary">Try the Dashboard</a>
    </div>
  </div>
</div>
</body>
</html>

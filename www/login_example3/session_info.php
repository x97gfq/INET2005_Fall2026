<?php
// This page never sets $_SESSION - it only reads whatever is already there,
// to prove a session carries over between separate page loads
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Session Info</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-6">
      <h2 class="mb-4">Session Info</h2>
      <?php if (isset($_SESSION['username'])): ?>
        <div class="alert alert-success">
          Session is active.<br>
          Logged in as <strong><?php echo htmlspecialchars($_SESSION['username']); ?></strong><br>
          Logged in at: <?php echo date('Y-m-d H:i:s', $_SESSION['login_time']); ?>
        </div>
        <a href="logout.php" class="btn btn-outline-danger">Logout</a>
      <?php else: ?>
        <div class="alert alert-warning">No active session — you are not logged in.</div>
        <a href="login_form.php" class="btn btn-primary">Go to Login</a>
      <?php endif; ?>
    </div>
  </div>
</div>
</body>
</html>

<?php
session_start();

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
      <div class="alert alert-secondary">You have been logged out. The session no longer exists.</div>
      <a href="login_form.php" class="btn btn-primary me-2">Back to Login</a>
      <a href="dashboard.php" class="btn btn-outline-secondary">Try the Dashboard</a>
    </div>
  </div>
</div>
</body>
</html>

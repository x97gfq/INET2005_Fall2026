<?php
session_start();

// This is the page being protected - anyone without an active session
// gets bounced straight back to the login form
if (!isset($_SESSION['username'])) {
    $_SESSION['flash_notice'] = 'Please log in to continue.';
    header('Location: login_form.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Dashboard</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-6">
      <h2 class="mb-4">Dashboard</h2>
      <div class="alert alert-success">Welcome back, <?php echo htmlspecialchars($_SESSION['username']); ?>!</div>
      <p>This page only renders while a session is active. Try opening this URL in a private/incognito window.</p>
      <a href="logout.php" class="btn btn-outline-danger">Logout</a>
    </div>
  </div>
</div>
</body>
</html>

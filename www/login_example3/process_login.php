<?php
// session_start() must run before any output - it either resumes an existing
// session (via the cookie the browser sends back) or starts a new one
// session_start() is what tells PHP "look at the session ID cookie the browser just sent, find that session's data on the server, and load it into $_SESSION.
// load the existing session, if any:
session_start();

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

$conn = new mysqli('db', 'login_demo_user', 'LoginDemo!2026', 'login_demo');
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

$stmt = $conn->prepare('SELECT password_hash FROM users WHERE username = ?');
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();

$loginOk = false;
if ($row = $result->fetch_assoc()) {
    $loginOk = password_verify($password, $row['password_hash']);
}

$stmt->close();
$conn->close();

if ($loginOk) {
    // Anything stored in $_SESSION here is available on every later page,
    // for this browser, until the session ends
    $_SESSION['username'] = $username;
    $_SESSION['login_time'] = time();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Login Result</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-6">
      <h2 class="mb-4">Login Result</h2>
      <?php if ($loginOk): ?>
        <div class="alert alert-success">Welcome, <?php echo htmlspecialchars($username); ?>! You are logged in.</div>
        <a href="session_info.php" class="btn btn-primary me-2">View Session Info</a>
        <a href="logout.php" class="btn btn-outline-danger">Logout</a>
      <?php else: ?>
        <div class="alert alert-danger">Invalid username or password.</div>
        <a href="login_form.php" class="btn btn-secondary">Back to Login</a>
      <?php endif; ?>
    </div>
  </div>
</div>
</body>
</html>

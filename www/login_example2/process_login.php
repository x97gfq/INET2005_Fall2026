<?php
// $_POST is a superglobal array holding all values submitted via method="post"
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

// Dedicated database login, scoped to read-only access on login_demo.users
$conn = new mysqli('db', 'login_demo_user', 'LoginDemo!2026', 'login_demo');
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

// A prepared statement with a bound parameter keeps user input out of the SQL string,
// which is what prevents SQL injection
$stmt = $conn->prepare('SELECT password_hash FROM users WHERE username = ?');
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();

$loginOk = false;
if ($row = $result->fetch_assoc()) {
    // password_verify() compares the plaintext password against the stored bcrypt hash -
    // the plaintext password itself is never stored anywhere
    $loginOk = password_verify($password, $row['password_hash']);
}

$stmt->close();
$conn->close();
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
        <div class="alert alert-success">Welcome, <?php echo htmlspecialchars($username); ?>! Login successful.</div>
      <?php else: ?>
        <div class="alert alert-danger">Invalid username or password.</div>
      <?php endif; ?>
      <a href="login_form.php" class="btn btn-secondary">Back to Login</a>
    </div>
  </div>
</div>
</body>
</html>

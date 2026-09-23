<?php
// =============================================================================
//  INTENTIONALLY VULNERABLE - FOR TEACHING SQL INJECTION ONLY. DO NOT COPY.
//  The secure version of this file lives in ../login_example2/process_login.php
// =============================================================================

// $_POST is a superglobal array holding all values submitted via method="post"
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

// This demo uses a table that stores passwords in PLAINTEXT (another bad practice)
// so the password can be compared inside the SQL query - which is what makes the
// classic authentication-bypass injection possible.
$conn = new mysqli('db', 'login_demo_user', 'LoginDemo!2026', 'login_demo');
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

// !!! THE VULNERABILITY !!!
// The username and password are concatenated straight into the SQL string.
// Whatever the user types becomes part of the query itself, so they can rewrite
// the query's logic. A prepared statement (see login_example2) is what fixes this.
$sql = "SELECT username FROM users_plaintext "
     . "WHERE username = '" . $username . "' "
     . "AND password = '" . $password . "'";

// Show the query so students can see exactly what their input built
$builtQuery = $sql;

$result = $conn->query($sql);

$loginOk = false;
$loggedInAs = '';
if ($result && $row = $result->fetch_assoc()) {
    $loginOk = true;
    $loggedInAs = $row['username'];
}

$conn->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Login Result (VULNERABLE)</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <h2 class="mb-4">Login Result</h2>
      <?php if ($loginOk): ?>
        <div class="alert alert-success">Welcome, <?php echo htmlspecialchars($loggedInAs); ?>! Login successful.</div>
      <?php else: ?>
        <div class="alert alert-danger">Invalid username or password.</div>
      <?php endif; ?>

      <p class="mt-4 mb-1"><strong>The SQL that was actually run:</strong></p>
      <pre class="bg-light border p-3"><?php echo htmlspecialchars($builtQuery); ?></pre>

      <a href="login_form.php" class="btn btn-secondary">Back to Login</a>
    </div>
  </div>
</div>
</body>
</html>

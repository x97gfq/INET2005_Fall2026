<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Login Form (VULNERABLE)</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-5">
      <div class="alert alert-warning">
        <strong>Teaching example - intentionally insecure.</strong>
        This login is vulnerable to SQL injection. Compare it with <code>login_example2</code>.
      </div>
      <h2 class="mb-4">Login</h2>
      <!-- method="post" sends the form data in the request body, not the URL -->
      <form action="process_login.php" method="post">
        <div class="mb-3">
          <label for="username" class="form-label">Username</label>
          <input type="text" class="form-control" id="username" name="username">
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input type="text" class="form-control" id="password" name="password">
        </div>
        <button type="submit" class="btn btn-primary">Login</button>
      </form>
    </div>
  </div>
</div>
</body>
</html>

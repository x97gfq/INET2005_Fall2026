<?php
// $_POST is a superglobal array holding all values submitted via method="post"
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Submitted Values</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-6">
      <h2 class="mb-4">Submitted Values</h2>
      <table class="table table-bordered">
        <tr>
          <th>Username</th>
          <td><?php echo htmlspecialchars($username); ?></td>
        </tr>
        <tr>
          <th>Password</th>
          <td><?php echo htmlspecialchars($password); ?></td>
        </tr>
      </table>
      <a href="login_form.php" class="btn btn-secondary">Back to Login</a>
    </div>
  </div>
</div>
</body>
</html>

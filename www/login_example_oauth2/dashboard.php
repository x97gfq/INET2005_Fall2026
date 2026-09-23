<?php
session_start();

// The protected page. Guarding it is identical to login_example4 - the only
// difference is how the session got created in the first place.
if (!isset($_SESSION['google_sub'])) {
    $_SESSION['flash_notice'] = 'Please sign in to continue.';
    header('Location: login_form.php');
    exit;
}

$claims = $_SESSION['demo_id_token_claims'] ?? [];
$tokens = $_SESSION['demo_token_response']  ?? [];
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Dashboard</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5 mb-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <h2 class="mb-4">Dashboard</h2>

      <div class="card mb-4">
        <div class="card-body d-flex align-items-center">
          <?php if (!empty($_SESSION['picture'])): ?>
            <img src="<?php echo htmlspecialchars($_SESSION['picture']); ?>"
                 alt="" class="rounded-circle me-3" width="64" height="64">
          <?php endif; ?>
          <div>
            <h5 class="mb-1">Welcome, <?php echo htmlspecialchars($_SESSION['name']); ?></h5>
            <div class="text-muted"><?php echo htmlspecialchars($_SESSION['email'] ?? 'no email'); ?>
              <?php if ($_SESSION['email_verified']): ?>
                <span class="badge bg-success">verified</span>
              <?php else: ?>
                <span class="badge bg-warning text-dark">unverified</span>
              <?php endif; ?>
            </div>
          </div>
        </div>
      </div>

      <p>You are signed in, and this application has never seen your password.
         It only knows what Google told it.</p>

      <h5 class="mt-4">What the ID token said about you</h5>
      <p class="text-muted small">These are the <em>claims</em> from the JWT Google returned.
         <code>sub</code> is the stable user ID you would store in your database.</p>
      <table class="table table-sm table-bordered">
        <tbody>
        <?php foreach ($claims as $key => $value): ?>
          <tr>
            <th class="w-25"><?php echo htmlspecialchars($key); ?></th>
            <td><?php echo htmlspecialchars(is_scalar($value) ? (string) $value : json_encode($value)); ?></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>

      <h5 class="mt-4">What the token endpoint returned</h5>
      <p class="text-muted small">Tokens are truncated here on purpose. Never print or log real tokens.</p>
      <pre class="bg-light p-3 border small"><?php echo htmlspecialchars(json_encode($tokens, JSON_PRETTY_PRINT)); ?></pre>

      <a href="logout.php" class="btn btn-outline-danger">Logout</a>
    </div>
  </div>
</div>
</body>
</html>

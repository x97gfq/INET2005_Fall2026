<?php
// In-class activity: COMPLETED VERSION (instructor copy)
// Look up a Pokémon with PokéAPI (https://pokeapi.co)
require __DIR__ . '/helpers.php';

// The name typed into the form (?name=...). Default to pikachu.
$name = strtolower(trim($_GET['name'] ?? 'pikachu'));

// TODO 1: the name goes at the end of the path. urlencode() keeps
// spaces and symbols from breaking the URL.
$url = 'https://pokeapi.co/api/v2/pokemon/' . urlencode($name);

$data  = null;
$error = null;

$response = http_get($url);

if ($response['ok']) {
    $data = json_decode($response['body'], true);
} else {
    $error = "Could not find a Pokémon called \"$name\".";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Activity: Pokédex</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5" style="max-width: 600px;">
  <h2>Pokédex</h2>

  <form method="get" class="input-group mb-3">
    <input type="text" name="name" class="form-control" value="<?php echo htmlspecialchars($name); ?>">
    <button class="btn btn-primary" type="submit">Search</button>
  </form>

  <?php if ($error): ?>
    <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
  <?php else: ?>
    <table class="table table-bordered">
      <tr>
        <th>Name</th>
        <td><?php echo htmlspecialchars($data['name']); ?></td>
      </tr>

      <!-- TODO 2: one row per value, following the Name row -->
      <tr>
        <th>Picture</th>
        <td><img src="<?php echo htmlspecialchars($data['sprites']['front_default']); ?>" alt="<?php echo htmlspecialchars($data['name']); ?>"></td>
      </tr>
      <tr>
        <th>Height</th>
        <td><?php echo htmlspecialchars($data['height']); ?></td>
      </tr>
      <tr>
        <th>Weight</th>
        <td><?php echo htmlspecialchars($data['weight']); ?></td>
      </tr>
      <tr>
        <th>Type</th>
        <td><?php echo htmlspecialchars($data['types'][0]['type']['name']); ?></td>
      </tr>
    </table>
  <?php endif; ?>

  <p class="text-muted small">Request made by PHP: <code><?php echo htmlspecialchars($url); ?></code></p>
</div>
</body>
</html>

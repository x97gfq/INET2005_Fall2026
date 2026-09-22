<?php
// In-class activity: look up a Pokémon with PokéAPI (https://pokeapi.co)
//
// No API key needed. Try this in your browser to see the raw JSON:
//     https://pokeapi.co/api/v2/pokemon/pikachu
//
// Work through the TODOs in order. Reload the page after each one.
require __DIR__ . '/helpers.php';

// The name typed into the form (?name=...). Default to pikachu.
$name = strtolower(trim($_GET['name'] ?? 'pikachu'));

// TODO 1: Build the request URL.
// PokéAPI puts the Pokémon's name at the end of the path:
//     https://pokeapi.co/api/v2/pokemon/<name>
// Join the base URL and $name together with the . operator.
// Wrap $name in urlencode() so spaces and symbols can't break the URL.
$url = '';

$data  = null;
$error = null;

if ($url === '') {
    $error = 'TODO 1: build $url';
} else {
    $response = http_get($url);

    if ($response['ok']) {
        $data = json_decode($response['body'], true);
    } else {
        $error = "Could not find a Pokémon called \"$name\".";
    }
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

      <!-- TODO 2: Add a row for each of these, using the Name row above as your pattern.
             Picture  -> $data['sprites']['front_default']   (put it in an <img src="...">)
             Height   -> $data['height']                     (in decimetres)
             Weight   -> $data['weight']                     (in hectograms)
             Type     -> $data['types'][0]['type']['name']   (the first type)
           Open the URL at the bottom of the page to see where each value lives in the JSON. -->

    </table>
  <?php endif; ?>

  <p class="text-muted small">Request made by PHP: <code><?php echo htmlspecialchars($url); ?></code></p>
</div>
</body>
</html>

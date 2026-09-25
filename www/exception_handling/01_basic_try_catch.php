<?php
// Example 1: try / catch basics
// Normally, an error inside a PHP script stops the whole page with a fatal
// error. throw + try/catch let YOU decide what happens instead.

$quantity = $_GET['quantity'] ?? '3';
$stock    = 5; // pretend we have 5 units in stock

$result = null;
$error  = null;

try {
    // A function can refuse bad input by throwing an exception instead of
    // quietly continuing with a nonsense value.
    $result = check_order($quantity, $stock);
} catch (Exception $e) {
    // Anything thrown inside the try block lands here instead of crashing
    // the page. $e is an Exception object — getMessage() is the text we
    // passed to `throw new Exception(...)`.
    $error = $e->getMessage();
}

function check_order(string $quantityInput, int $stock): string
{
    if (!ctype_digit($quantityInput)) {
        throw new Exception("\"$quantityInput\" is not a whole number.");
    }

    $quantity = (int) $quantityInput;

    if ($quantity <= 0) {
        throw new Exception('Quantity must be at least 1.');
    }

    if ($quantity > $stock) {
        throw new Exception("Only $stock units are in stock.");
    }

    return "Order confirmed for $quantity unit(s).";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Example 1: Basic try/catch</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <h2 class="mb-3">Example 1: Basic try/catch</h2>

      <form class="row g-2 mb-4" method="get">
        <div class="col-auto">
          <input type="text" class="form-control" name="quantity" value="<?php echo htmlspecialchars($quantity); ?>">
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" type="submit">Place order</button>
        </div>
      </form>

      <p>We have <strong><?php echo $stock; ?></strong> units in stock. Try a negative number, 0, a huge number, or letters like <code>abc</code>.</p>

      <?php if ($error): ?>
        <div class="alert alert-danger">
          <strong>Order rejected:</strong> <?php echo htmlspecialchars($error); ?>
        </div>
      <?php else: ?>
        <div class="alert alert-success"><?php echo htmlspecialchars($result); ?></div>
      <?php endif; ?>

      <p class="text-muted mt-4">Notice the page never crashes, no matter what you type. <code>check_order()</code> throws an exception for bad input; the <code>catch</code> block turns it into a friendly message.</p>
    </div>
  </div>
</div>
</body>
</html>

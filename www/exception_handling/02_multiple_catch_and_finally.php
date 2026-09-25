<?php
// Example 2: multiple catch blocks + finally
// PHP throws its OWN exceptions/errors when built-in operations go wrong —
// you don't always have to write `throw` yourself. This example triggers two
// different built-in ones and catches each with its own message.
declare(strict_types=1);

function divide_strict(int $a, int $b): int
{
    return intdiv($a, $b); // intdiv() throws DivisionByZeroError when $b is 0
}

$aRaw = $_GET['a'] ?? '10';
$bRaw = $_GET['b'] ?? '2';

$result = null;
$error  = null;
$errorType = null;

try {
    if (!ctype_digit($aRaw) || !ctype_digit($bRaw)) {
        // strict_types is on, so passing these STRINGS straight into a
        // function typed `int $a, int $b` throws a TypeError — PHP will not
        // silently convert "abc" (or even "10") to an int for us.
        $result = divide_strict($aRaw, $bRaw);
    } else {
        $result = divide_strict((int) $aRaw, (int) $bRaw);
    }
} catch (DivisionByZeroError $e) {
    // Most specific first: catches ONLY division-by-zero.
    $errorType = 'DivisionByZeroError';
    $error = $e->getMessage();
} catch (TypeError $e) {
    // Catches ONLY the wrong-type case.
    $errorType = 'TypeError';
    $error = $e->getMessage();
} catch (Throwable $e) {
    // Catch-all safety net. Throwable is the top of the whole hierarchy, so
    // this line must come LAST — PHP checks catch blocks in order and uses
    // the first match.
    $errorType = get_class($e);
    $error = $e->getMessage();
} finally {
    // finally ALWAYS runs — whether the try succeeded, an exception was
    // caught, or even (rare) if nothing above was caught at all. Use it for
    // cleanup that must happen no matter what, e.g. closing a file or
    // database connection.
    $finishedAt = date('H:i:s');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Example 2: Multiple catch blocks + finally</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <h2 class="mb-3">Example 2: Multiple catch blocks + finally</h2>

      <form class="row g-2 mb-3" method="get">
        <div class="col-auto">
          <input type="text" class="form-control" name="a" value="<?php echo htmlspecialchars($aRaw); ?>" placeholder="a">
        </div>
        <div class="col-auto">
          <input type="text" class="form-control" name="b" value="<?php echo htmlspecialchars($bRaw); ?>" placeholder="b">
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" type="submit">intdiv(a, b)</button>
        </div>
      </form>

      <p class="mb-4">
        Try <code>a=10&amp;b=2</code> (works), <code>a=10&amp;b=0</code> (DivisionByZeroError),
        or <code>a=abc&amp;b=2</code> (TypeError).
      </p>

      <?php if ($error): ?>
        <div class="alert alert-danger">
          <strong>Caught <?php echo htmlspecialchars($errorType); ?>:</strong>
          <?php echo htmlspecialchars($error); ?>
        </div>
      <?php else: ?>
        <div class="alert alert-success">intdiv(<?php echo htmlspecialchars($aRaw); ?>, <?php echo htmlspecialchars($bRaw); ?>) = <?php echo $result; ?></div>
      <?php endif; ?>

      <p class="text-muted">The <code>finally</code> block ran at <?php echo $finishedAt; ?>, no matter which branch above ran.</p>

      <hr>
      <p class="text-muted mb-0"><code>DivisionByZeroError</code> and <code>TypeError</code> are both subclasses of <code>Error</code>, not <code>Exception</code> — both extend the shared <code>Throwable</code> interface. A plain <code>catch (Exception $e)</code> would <strong>not</strong> catch either of them; <code>catch (Throwable $e)</code> catches anything.</p>
    </div>
  </div>
</div>
</body>
</html>

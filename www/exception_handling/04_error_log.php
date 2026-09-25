<?php
// Example 4: error_log() — log the technical details, show the user a
// friendly message. This is the "graceful error handling" from the slide:
// developers still get everything they need to debug, but the visitor never
// sees a raw stack trace.

$logFile = __DIR__ . '/logs/app.log';

function process_payment(float $amount): string
{
    if ($amount <= 0) {
        throw new Exception("Invalid payment amount: $amount");
    }
    if ($amount > 10000) {
        throw new RuntimeException("Payment amount $amount exceeds the fraud-check limit of 10000");
    }

    return 'Payment of $' . number_format($amount, 2) . ' processed.';
}

$amountRaw = $_GET['amount'] ?? '25';

$successMessage = null;
$userMessage    = null;

try {
    $successMessage = process_payment((float) $amountRaw);
} catch (Throwable $e) {
    // message_type 3 = "append this string to a file" (the 3rd argument).
    // We build our own log line with a timestamp, the exception class, the
    // message, and exactly where it happened — everything needed to debug,
    // none of which is safe to show a visitor.
    $line = sprintf(
        '[%s] %s: %s in %s:%d%s',
        date('Y-m-d H:i:s'),
        get_class($e),
        $e->getMessage(),
        basename($e->getFile()),
        $e->getLine(),
        PHP_EOL
    );
    //https://www.php.net/manual/en/function.error-log.php
    error_log($line, 3, $logFile);

    // The visitor only ever sees this — never $e->getMessage() directly.
    $userMessage = 'Sorry, we could not process that payment. Please try again later.';
}

// Read back the last few log lines to show the class what got written.
// (In a real app, log files are private and are never displayed on a page.)
$recentLines = [];
if (is_file($logFile)) {
    $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $recentLines = array_slice($lines, -5);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Example 4: error_log()</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <h2 class="mb-3">Example 4: error_log()</h2>

      <form class="row g-2 mb-4" method="get">
        <div class="col-auto">
          <span class="input-group-text">$</span>
        </div>
        <div class="col-auto">
          <input type="text" class="form-control" name="amount" value="<?php echo htmlspecialchars($amountRaw); ?>">
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" type="submit">Pay</button>
        </div>
      </form>

      <p class="mb-4">Try <code>25</code> (works), <code>-5</code> (Exception), or <code>50000</code> (RuntimeException).</p>

      <?php if ($userMessage): ?>
        <div class="alert alert-warning"><?php echo htmlspecialchars($userMessage); ?></div>
        <p class="text-muted">That's ALL the visitor sees. The technical detail went to <code>logs/app.log</code> instead.</p>
      <?php else: ?>
        <div class="alert alert-success"><?php echo htmlspecialchars($successMessage); ?></div>
      <?php endif; ?>

      <h5 class="mt-4">Last 5 lines of <code>logs/app.log</code></h5>
      <p class="text-muted">(Shown here only so the class can see it happen — a real app would never expose its log file on a public page.)</p>
      <?php if ($recentLines): ?>
        <pre class="bg-light p-3"><?php echo htmlspecialchars(implode("\n", $recentLines)); ?></pre>
      <?php else: ?>
        <p class="text-muted">No log entries yet — trigger an error above first.</p>
      <?php endif; ?>
    </div>
  </div>
</div>
</body>
</html>

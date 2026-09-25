<?php
// Example 3: a custom exception class
// A custom exception class lets you attach your own data to the error (here,
// how much money was missing) and lets a catch block target YOUR error
// specifically, separate from any other Exception in the app.

class InsufficientFundsException extends Exception
{
    // Extra data a plain Exception doesn't have.
    private float $shortfall;

    public function __construct(float $requested, float $balance)
    {
        $this->shortfall = $requested - $balance;

        // Build the standard Exception's message, then hand it up with
        // parent::__construct() so getMessage() still works normally.
        parent::__construct(sprintf(
            'Cannot withdraw $%.2f — balance is only $%.2f.',
            $requested,
            $balance
        ));
    }

    public function getShortfall(): float
    {
        return $this->shortfall;
    }
}

function withdraw(float $balance, float $amount): float
{
    if ($amount <= 0) {
        // A different problem, so a plain Exception is fine here.
        throw new Exception('Withdrawal amount must be positive.');
    }

    if ($amount > $balance) {
        throw new InsufficientFundsException($amount, $balance);
    }

    return $balance - $amount;
}

$balance = 100.00;
$amountRaw = $_GET['amount'] ?? '150';

$newBalance = null;
$error = null;
$shortfall = null;

try {
    $newBalance = withdraw($balance, (float) $amountRaw);
} catch (InsufficientFundsException $e) {
    // Caught BEFORE the generic Exception below, so this only matches our
    // specific error and lets us read the extra getShortfall() data.
    $error = $e->getMessage();
    $shortfall = $e->getShortfall();
} catch (Exception $e) {
    // Anything else (e.g. a negative/zero amount) falls through to here.
    $error = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Example 3: Custom exception class</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <h2 class="mb-3">Example 3: Custom exception class</h2>

      <p>Account balance: <strong>$<?php echo number_format($balance, 2); ?></strong></p>

      <form class="row g-2 mb-4" method="get">
        <div class="col-auto">
          <span class="input-group-text">$</span>
        </div>
        <div class="col-auto">
          <input type="text" class="form-control" name="amount" value="<?php echo htmlspecialchars($amountRaw); ?>">
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" type="submit">Withdraw</button>
        </div>
      </form>

      <p class="mb-4">Try <code>50</code> (works), <code>150</code> (InsufficientFundsException), or <code>-20</code> (plain Exception).</p>

      <?php if ($error): ?>
        <div class="alert alert-danger">
          <?php echo htmlspecialchars($error); ?>
          <?php if ($shortfall !== null): ?>
            <br>Custom data from the exception object: short by <strong>$<?php echo number_format($shortfall, 2); ?></strong> (via <code>$e-&gt;getShortfall()</code>, a method a plain <code>Exception</code> doesn't have).
          <?php endif; ?>
        </div>
      <?php else: ?>
        <div class="alert alert-success">Withdrawal approved. New balance: $<?php echo number_format($newBalance, 2); ?></div>
      <?php endif; ?>
    </div>
  </div>
</div>
</body>
</html>

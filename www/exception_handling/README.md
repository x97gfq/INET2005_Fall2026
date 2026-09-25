# Exception Handling in PHP

So far, when something went wrong in your code (bad input, a missing file, a
calculation that doesn't make sense), the script usually either kept going
with garbage values or crashed with a fatal error. **Exceptions** give you a
third option: stop what you're doing, hand control to a block of code written
specifically to deal with the problem, and let the rest of the script decide
what "recovering" looks like.

```text
try {
    // code that might fail
} catch (SomeExceptionType $e) {
    // runs ONLY if that code throws SomeExceptionType (or a subclass)
} finally {
    // runs every time, whether or not an exception was thrown
}
```

# Running the Examples

Start the stack from the root of the repo:

```bash
docker compose up -d --build
```

Then open these pages:

| Page | What it shows |
| --- | --- |
| http://localhost/exception_handling/01_basic_try_catch.php | **Example 1:** the basic `try`/`catch`/`throw` shape |
| http://localhost/exception_handling/02_multiple_catch_and_finally.php | **Example 2:** several `catch` blocks + `finally`, using PHP's own built-in errors |
| http://localhost/exception_handling/03_custom_exception_class.php | **Example 3:** writing your own exception class |
| http://localhost/exception_handling/04_error_log.php | **Example 4:** logging the real error with `error_log()` while showing the user a safe message |

Each page has a small form so you can trigger both the success path and the
error path yourself — the suggested values to try are printed on the page.

# The Files

| File | What it does |
| --- | --- |
| `01_basic_try_catch.php` | A function `throw`s a plain `Exception` for bad input; one `catch` block turns it into a friendly message. |
| `02_multiple_catch_and_finally.php` | Triggers PHP's own `DivisionByZeroError` and `TypeError`, catches each with a separate `catch` block (most specific first), and always runs a `finally` block. |
| `03_custom_exception_class.php` | Defines `InsufficientFundsException extends Exception` with its own extra data (`getShortfall()`), and catches it separately from a plain `Exception`. |
| `04_error_log.php` | Uses `error_log()` to write full technical detail to `logs/app.log`, while the browser only ever sees a generic, safe message. |
| `logs/app.log` | Created automatically the first time Example 4 catches an error. Safe to delete — it will be recreated. |

# Key Ideas

## throw and catch

`throw` creates and raises an exception object; `catch` catches it by type:

```php
function check_order(string $quantityInput, int $stock): string
{
    if (!ctype_digit($quantityInput)) {
        throw new Exception("\"$quantityInput\" is not a whole number.");
    }
    // ...
}

try {
    $result = check_order($quantity, $stock);
} catch (Exception $e) {
    $error = $e->getMessage(); // the text passed to `new Exception(...)`
}
```

Without the `try`/`catch`, an uncaught exception stops the script with a
fatal error — exactly the crash we're trying to avoid.

## Multiple catch blocks — most specific first

You can stack several `catch` blocks after one `try`. PHP checks them **in
order** and uses the first type that matches, so put the most specific
exception classes first and the most general ones last:

```php
try {
    $result = divide_strict($a, $b);
} catch (DivisionByZeroError $e) {
    // only division by zero
} catch (TypeError $e) {
    // only a wrong argument type
} catch (Throwable $e) {
    // anything else — must come last
}
```

`Exception` and `Error` (which includes `TypeError` and `DivisionByZeroError`)
are separate branches that both implement `Throwable`. A `catch (Exception $e)`
will **not** catch a `TypeError`; `catch (Throwable $e)` catches everything.

## finally

Code in `finally` runs after the `try`/`catch`, no matter what happened —
success, a caught exception, or (rarer) an exception nobody caught. It's the
right place for cleanup that must always happen, like closing a database
connection or a file handle.

## Custom exception classes

A custom class lets you attach your own data to the error and lets a `catch`
block target *your* error specifically:

```php
class InsufficientFundsException extends Exception
{
    private float $shortfall;

    public function __construct(float $requested, float $balance)
    {
        $this->shortfall = $requested - $balance;
        parent::__construct(sprintf(
            'Cannot withdraw $%.2f — balance is only $%.2f.',
            $requested, $balance
        ));
    }

    public function getShortfall(): float
    {
        return $this->shortfall;
    }
}
```

Always call `parent::__construct($message)` so the normal `getMessage()`
behaviour still works. Naming the class with an `Exception` suffix
(`InsufficientFundsException`) is a common PHP convention, not a rule.

## error_log() — log the detail, show the user something safe

`$e->getMessage()` often contains information you don't want a visitor to
see (file paths, database details, internal logic). `error_log()` lets you
record the full detail somewhere private while the page shows a generic
message instead:

```php
try {
    $result = process_payment($amount);
} catch (Throwable $e) {
    $line = sprintf(
        '[%s] %s: %s in %s:%d%s',
        date('Y-m-d H:i:s'),
        get_class($e),
        $e->getMessage(),
        basename($e->getFile()),
        $e->getLine(),
        PHP_EOL
    );
    error_log($line, 3, __DIR__ . '/logs/app.log'); // 3 = append to this file

    $userMessage = 'Sorry, we could not process that payment. Please try again later.';
}
```

`error_log()`'s second argument (`message_type`) controls **where** the
message goes:

| `message_type` | Destination |
| --- | --- |
| `0` (default) | The server's normal error log (whatever `php.ini` / Apache is configured to use) |
| `3` | A specific file, given as the 3rd argument — what Example 4 uses |
| `1` | Email (rarely used today) |

This is the difference between **debugging** (you, later, reading the log
file to see exactly what happened) and **graceful error handling** (the
visitor seeing a normal, non-scary message right now).

## Log files must not be web-accessible

Writing detail to a log file only helps if that file stays private. This
folder's `logs/.htaccess` blocks direct requests for it:

```apache
<FilesMatch "\.log$">
    Require all denied
</FilesMatch>
```

Try [http://localhost/exception_handling/logs/app.log](http://localhost/exception_handling/logs/app.log) —
**403 Forbidden**, even though Example 4's page reads and displays a few
lines from that exact file using PHP. Comment out the block and reload to see
the difference: the whole raw log, handed straight to anyone who requests it
by name.

# Why This Matters

- **The page keeps working.** One bad input or one failed operation
  shouldn't take down the whole request.
- **Errors are handled where it makes sense.** A `catch` block near the top
  of a script can decide to retry, show a message, or log and move on —
  whichever fits.
- **Debugging stays possible without scaring users.** Full detail goes to a
  log file; the visitor gets a message that doesn't leak internals.
- **Different problems, different responses.** Multiple `catch` blocks let
  you react differently to "this input is the wrong type" versus "this
  operation is mathematically impossible" versus "something totally
  unexpected happened."

# Further Reading

- [PHP Manual: Exceptions](https://www.php.net/manual/en/language.exceptions.php)
- [PHP Manual: `try` / `catch` / `finally`](https://www.php.net/manual/en/language.exceptions.php#language.exceptions.catch)
- [PHP Manual: `error_log()`](https://www.php.net/manual/en/function.error-log.php)
- [PHP Manual: the `Throwable` interface](https://www.php.net/manual/en/class.throwable.php)
- [PHP Manual: `DivisionByZeroError` and other `Error` classes](https://www.php.net/manual/en/class.error.php)
- [W3Schools: PHP Exceptions](https://www.w3schools.com/php/php_exception.asp)
- [W3Schools: PHP `try...catch`](https://www.w3schools.com/php/php_try_catch.asp)

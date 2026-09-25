# Using .env Files in PHP

So far, anything a script needed — a database password, an API key — has
either been typed straight into the PHP file or hardcoded in a config array.
That means every secret is sitting right there in your source code, which is
a problem the moment that code is shared, backed up, or pushed to GitHub.

A **`.env` file** keeps that kind of value *out* of your code. It's a plain
text file, one `KEY=value` per line, that lives next to your project but is
never committed to version control. Your PHP code asks for `DB_PASS` by
name; it doesn't matter (or need to know) whether the real value is a local
test password or a production secret — that decision lives in `.env`, not in
the code.

```text
DB_HOST=db
DB_USER=appuser
DB_PASS=apppassword
```

PHP has no built-in way to read a `.env` file, so this folder uses the most
widely-used package for it: **[vlucas/phpdotenv](https://github.com/vlucas/phpdotenv)**,
installed with [Composer](https://getcomposer.org/) (PHP's package manager).

# Running the Examples

Start the stack from the root of the repo:

```bash
docker compose up -d --build
```

The packages this folder needs are already installed (see **Setup Note**
below if you're setting this up somewhere new). Then open these pages:

| Page | What it shows |
| --- | --- |
| http://localhost/env_example/01_load_env.php | **Example 1:** loading `.env` and reading a value with both `getenv()` and `$_ENV` |
| http://localhost/env_example/02_db_credentials_demo.php | **Example 2:** connecting to the real MySQL container using only `.env` credentials |
| http://localhost/env_example/03_api_key_demo.php | **Example 3:** using an API key from `.env` without ever hardcoding it |
| http://localhost/env_example/04_parse_ini_file.php | **Example 4:** reading the same `.env` with PHP's built-in `parse_ini_file()` — no package at all |

# The Files

| File | What it does |
| --- | --- |
| `.env` | The **real** values for this machine. **Not committed to git** — see below. |
| `.env.example` | A committed template listing which variables exist, with placeholder values. Copy this to `.env` and fill in real values on a new machine. |
| `composer.json` / `composer.lock` | Tell Composer this folder needs `vlucas/phpdotenv`, and pin the exact version installed. |
| `vendor/` | Where Composer put the downloaded package code. Created by `composer install`. |
| `01_load_env.php` | Loads `.env`, reads a value with `getenv()` and `$_ENV`, and shows what happens if `.env` is missing. |
| `02_db_credentials_demo.php` | Connects to MySQL using credentials read entirely from `.env` — no password anywhere in the PHP file. |
| `03_api_key_demo.php` | Reads a (fake) API key from `.env` and shows how it would be used in a request, with a masked display. |
| `04_parse_ini_file.php` | Reads the same `.env` with the built-in `parse_ini_file()` — no Composer, no package, and a side-by-side comparison with `phpdotenv`. |

# Key Ideas

## What goes in .env

Anything that (a) differs between machines/environments or (b) should never
be public:

```env
DB_HOST=db
DB_PORT=3306
DB_NAME=appdb
DB_USER=appuser
DB_PASS=apppassword

WEATHER_API_KEY=demo_key_67890abcdef
```

Common examples: database credentials, third-party API keys, mail server
passwords, encryption keys.

## Installing vlucas/phpdotenv with Composer

```bash
composer require vlucas/phpdotenv
```

This downloads the package into `vendor/` and adds it to `composer.json`.
From then on, one line gives your script access to it:

```php
require __DIR__ . '/vendor/autoload.php';
```

## Loading the file

```php
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__); // look for .env in this folder
$dotenv->load();
```

"Immutable" means values already set in the real environment (for example,
by the hosting platform) win over `.env` — `.env` fills in what's missing,
it doesn't override things that are already configured.

## Reading variables: getenv() vs $_ENV

Both read the values `phpdotenv` loaded:

```php
$host = getenv('DB_HOST');   // PHP's built-in function
$host = $_ENV['DB_HOST'];    // the superglobal array
```

**Note for this course:** by default, `phpdotenv` v5 only fills `$_ENV` (and
`$_SERVER`) — it deliberately does *not* call `putenv()`, because that isn't
safe on every server configuration. That means `getenv()` may come back empty
unless you explicitly opt in, which the examples in this folder do:

```php
use Dotenv\Repository\RepositoryBuilder;
use Dotenv\Repository\Adapter\PutenvAdapter;

$repository = RepositoryBuilder::createWithDefaultAdapters()
    ->addWriter(PutenvAdapter::class)
    ->immutable()
    ->make();

$dotenv = Dotenv::create($repository, __DIR__);
$dotenv->load();
```

If you only ever plan to use `$_ENV`, the simpler `Dotenv::createImmutable()`
from Example 1's comments is all you need.

## The no-package alternative: parse_ini_file()

A `.env` file is really just simple `KEY=value` text, which is also valid
INI syntax — so PHP's built-in `parse_ini_file()` can read one directly, with
no Composer and no package:

```php
$config = parse_ini_file(__DIR__ . '/.env', false, INI_SCANNER_RAW);
echo $config['DB_HOST'];
```

This is a completely reasonable choice for a small project. The trade-off is
that you get a plain array back — `parse_ini_file()` doesn't touch `$_ENV` or
`getenv()` for you, doesn't distinguish "file missing" from "file empty" with
anything better than a `false` return value and a warning, and doesn't handle
edge cases like quoted or multiline values as carefully as `phpdotenv` does.
See `04_parse_ini_file.php` for a full comparison.

## Keeping .env out of version control

Add it to `.gitignore` (already done for this repo — see the entry for
`www/env_example/.env`) and commit `.env.example` instead:

```gitignore
www/env_example/.env
```

If a `.env` file with real secrets is ever accidentally committed, **the
secrets are compromised** — changing the file in a later commit does not
remove it from git history. Rotate (change) any leaked credentials
immediately; don't just delete the file.

## .env also needs to be blocked from the web server

Keeping `.env` out of git isn't enough by itself — if it sits inside a
folder the web server can serve, anyone who requests it by name can read it
directly in a browser, no login or exploit required. This folder's
`.htaccess` blocks that:

```apache
<FilesMatch "^\.env">
    Require all denied
</FilesMatch>
```

Try it yourself: [http://localhost/env_example/.env](http://localhost/env_example/.env) returns
**403 Forbidden**, even though the file is right there in the folder.
Comment out that block and reload to see what happens without it — the raw
file contents, credentials included, printed straight to the browser.

# Why This Matters

- **Secrets never touch source control.** A password typed into a `.php`
  file is copied everywhere that file goes — every clone, every backup,
  every commit in `git log` forever. `.env` isn't part of any of that.
- **Same code, different environments.** Development, testing, and
  production can use the exact same PHP code with completely different
  credentials, just by giving each machine its own `.env`.
- **New teammates just copy a template.** `.env.example` tells them exactly
  which variables to set, without ever seeing the real values.
- **Debugging and error handling stay honest.** Combine this with what you
  learned in `exception_handling/`: if `.env` is missing or a required key
  isn't set, catch that specifically and fail with a clear message instead
  of a confusing crash somewhere else in the app.

# Setup Note (new machine / fresh clone)

`.env` is gitignored, so a fresh clone of this repo won't have one yet — copy
the template and edit it:

```bash
cd www/env_example
cp .env.example .env
```

`vendor/` (the downloaded `phpdotenv` package) **is** committed to this repo,
which is unusual — most real projects gitignore `vendor/` too and expect
everyone to run `composer install`. It's committed here only because the
course Docker image doesn't include Composer itself, so this keeps the
examples working immediately after `docker compose up`. If you add Composer
to the image later and prefer the normal approach, delete `vendor/`, add it
to `.gitignore`, and run `composer install` (which reads `composer.lock` and
reproduces the exact same versions).

# Further Reading

- [php.net: `parse_ini_file()`](https://www.php.net/manual/en/function.parse-ini-file.php)
- [php.net: `getenv()`](https://www.php.net/manual/en/function.getenv.php)
- [php.net: `$_ENV`](https://www.php.net/manual/en/reserved.variables.environment.php)
- [php.net: `$_SERVER`](https://www.php.net/manual/en/reserved.variables.server.php)
- [W3Schools: PHP Superglobals](https://www.w3schools.com/php/php_superglobals.asp)
- [vlucas/phpdotenv on GitHub](https://github.com/vlucas/phpdotenv)
- [vlucas/phpdotenv on Packagist](https://packagist.org/packages/vlucas/phpdotenv)
- [Getting Started with Composer](https://getcomposer.org/doc/00-intro.md)

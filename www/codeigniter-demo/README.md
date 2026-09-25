# CodeIgniter 4: Hello, MVC

Everything we've built so far has been a single PHP file that does it all: it
reads the request, talks to the database, *and* echoes the HTML. That works
for one page. Once a site has fifty pages it gets messy, because the SQL,
the business rules and the markup are all mixed together in every file.

A **framework** gives every project the same structure so you don't have to
invent one each time. This folder uses **[CodeIgniter 4](https://codeigniter.com/)**,
a small, fast PHP framework built on the **Model–View–Controller (MVC)** pattern.

> **Slides:** `slides/codeigniter_mvc_hello.pptx` (in the repo root) covers
> the same material as this README.

# What is MVC?

**MVC** splits an application into three jobs, and each job lives in its own file:

| Part | Its one job | In CodeIgniter | Never does... |
| --- | --- | --- | --- |
| **Model** | Owns the **data**: fetch it, save it, validate it. | `app/Models/` | ...echo HTML |
| **View** | Owns the **presentation**: turns data into HTML. | `app/Views/` | ...run SQL or make decisions |
| **Controller** | The **traffic cop**: takes the request, asks the model for data, picks a view and hands the data to it. | `app/Controllers/` | ...hold data or build HTML itself |

**A restaurant analogy:**

- The **controller** is the *server*. They take your order (the request), walk it to the kitchen, and bring back the plate.
- The **model** is the *kitchen*. It knows where the ingredients are and how to prepare them. You never go in there yourself.
- The **view** is the *plating*: the same food can be presented many ways (HTML page, JSON, PDF) without changing the kitchen.

**Why bother?**

- **Change one thing without breaking the others.** A designer can rewrite a view without touching the SQL. You can move the model from a PHP array to MySQL without touching a single view.
- **Everyone knows where to look.** A bug in the price calculation? It's in a model. A typo on the page? It's in a view.
- **Reuse.** One model can feed many controllers, and one view can be used by many pages.

## The journey of one request

```text
 Browser: GET http://localhost/codeigniter-demo/public/hello
    |
    v
 public/index.php          <- the "front controller": EVERY request enters here
    |
    v
 app/Config/Routes.php     <- "hello" matches  $routes->get('hello', 'Hello::index')
    |
    v
 app/Controllers/Hello.php <- Hello::index() builds $data
    |       \
    |        (Model)       <- not needed for Hello World; you'll add one in the activity
    v
 app/Views/hello.php       <- view('hello', $data) turns $data into HTML
    |
    v
 Browser receives the HTML
```

Notice there is **no `hello.php` in the URL**. You don't request files any
more; you request **routes**, and the framework decides which code runs.
That idea is called a **[front controller](https://en.wikipedia.org/wiki/Front_controller)**.

# Running the Demo

Start the stack from the root of the repo (the `--build` matters the first
time, see [Setup Notes](#setup-notes)):

```bash
docker compose up -d --build
```

Then open:

| URL | What it shows |
| --- | --- |
| http://localhost/codeigniter-demo/public/hello | **The demo:** Route → `Hello` controller → `hello` view |
| http://localhost/codeigniter-demo/public/ | CodeIgniter's built-in welcome page (the `Home` controller) |
| http://localhost/codeigniter-demo/ | Redirects to `public/` (see [Why public/ is in the URL](#why-public-is-in-the-url)) |

# The Three Files

Only three files were created or changed to make `/hello` work.

## 1. The route: `app/Config/Routes.php`

```php
<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');

// INET2005 demo: GET /hello -> Hello controller, index() method
$routes->get('hello', 'Hello::index');
```

Read `$routes->get('hello', 'Hello::index')` as: *"when a **GET** request
arrives for **hello**, run the **index()** method of the **Hello** controller."*
There is also `$routes->post(...)` for form submissions.

## 2. The controller: `app/Controllers/Hello.php`

```php
<?php

namespace App\Controllers;

class Hello extends BaseController
{
    public function index(): string
    {
        // Every key in this array becomes a variable inside the view:
        // 'message' -> $message, 'title' -> $title
        $data = [
            'title'   => 'Hello from CodeIgniter 4',
            'message' => 'Hello, World! This message was created in the Hello controller and displayed by the hello view.',
        ];

        // Load app/Views/hello.php and pass it $data
        return view('hello', $data);
    }
}
```

- `namespace App\Controllers;` is how CodeIgniter finds the class. The class name `Hello` **must** match the file name `Hello.php`, capital letter included.
- `extends BaseController` gives us everything a CodeIgniter controller can do.
- `view('hello', $data)` loads `app/Views/hello.php`. **Each key of `$data` becomes its own variable in the view.**

## 3. The view: `app/Views/hello.php`

```php
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?= esc($title) ?></title>
    ...
</head>
<body>
    <h1><?= esc($title) ?></h1>
    <p class="message"><?= esc($message) ?></p>
</body>
</html>
```

- `<?= ... ?>` is short for `<?php echo ... ?>`.
- **`esc()`** is CodeIgniter's version of `htmlspecialchars()`. Wrap every value you print in it to prevent XSS. It's the same rule we followed in the login examples, with a shorter name.
- The view does no thinking. It doesn't know or care *where* `$message` came from.

# Folder Layout

```text
www/codeigniter-demo/
├── .htaccess          <- INET2005 addition: blocks everything outside public/
├── README.md          <- this file
├── env                <- template for a .env file (see Development Mode)
├── app/               <- YOUR code lives here
│   ├── Config/
│   │   ├── App.php        <- baseURL and indexPage set for this container
│   │   └── Routes.php     <- URL -> Controller::method map        (edited)
│   ├── Controllers/
│   │   ├── BaseController.php
│   │   ├── Home.php       <- the default welcome page
│   │   └── Hello.php      <- the demo controller                 (new)
│   ├── Models/            <- empty for now; the activity adds one
│   └── Views/
│       ├── errors/
│       ├── hello.php      <- the demo view                       (new)
│       └── welcome_message.php
├── public/            <- the ONLY folder meant to be visible on the web
│   ├── .htaccess          <- sends every URL to index.php
│   └── index.php          <- the front controller
├── system/            <- the framework itself. Don't edit.
├── writable/          <- cache, logs, sessions, uploads. PHP must be able to write here.
└── tests/, spark, composer.json, phpunit.dist.xml, preload.php  (not used in this demo)
```

**Rule of thumb:** you write code in `app/`. You never touch `system/`,
because that's the framework and upgrading CodeIgniter replaces it entirely.

# Setup Notes

## How it was installed (no Composer)

1. Downloaded the latest stable release (**v4.7.4**) from the official
   **[codeigniter4/framework releases](https://github.com/codeigniter4/framework/releases)** page as a zip.
2. Extracted it into `www/codeigniter-demo/`.
3. Confirmed `app/`, `public/`, `system/` and `writable/` are all present.

The "framework" zip ships the `system/` folder already inside it, so no
`composer install` is needed.

## The `intl` extension (Dockerfile change)

CodeIgniter 4 **[requires](https://codeigniter.com/user_guide/intro/requirements.html)**
the PHP `intl` extension, which the `php:8.3-apache` image doesn't include.
Without it, every page shows:

```text
The framework needs the following extension(s) installed and loaded: intl.
```

The repo's `Dockerfile` now installs it:

```dockerfile
# intl is required by CodeIgniter 4 (www/codeigniter-demo)
RUN apt-get update && apt-get install -y --no-install-recommends libicu-dev \
    && docker-php-ext-install intl \
    && rm -rf /var/lib/apt/lists/*
```

**If you pulled this repo onto a machine that already had the stack running,
rebuild once:** `docker compose up -d --build`. You can check that it worked with:

```bash
docker exec inet-lamp-web php -m | grep intl
```

## Why `public/` is in the URL

On a real server you'd point Apache's document root at the `public/` folder,
so `app/`, `system/` and `writable/` could never be reached from a browser.
Our container's document root is the whole `www/` folder, which is shared by
every example in the course. So:

- The URL includes `/codeigniter-demo/public/`.
- `app/Config/App.php` sets `$baseURL = 'http://localhost/codeigniter-demo/public/'` so helpers like `site_url()` build correct links.
- `app/Config/App.php` sets `$indexPage = ''` because `public/.htaccess` (with `mod_rewrite`) already routes requests through `index.php`. That gives you `/public/hello` instead of `/public/index.php/hello`. Both URLs work.
- **`www/codeigniter-demo/.htaccess`** (added for this course) returns **403 Forbidden** for anything outside `public/`. Without it, a browser could download files like `env` or `composer.json`. `app/`, `system/` and `writable/` already ship with their own "deny all" `.htaccess` files.

## File permissions on `writable/`

CodeIgniter writes logs, cache and session files into `writable/`, so the web
server user (`www-data` inside the container) must be able to write there.
On a normal Linux server you would run something like `chmod -R 775 writable`.

**On this setup you don't have to do anything.** `www/` is a Windows folder
bind-mounted into a Linux container, and Docker Desktop presents every file
as owned by `root` with permissions `rwxrwxrwx` (777). Linux `chmod`/`chown`
have no real effect on those files. We tested that `www-data` can create
files in `writable/cache/`.

This is only true on Windows or macOS with Docker Desktop. **If you ever
deploy to a real Linux server,** give `writable/` to the web server user and
keep everything else read-only.

## Development mode (recommended while you work)

By default CodeIgniter runs in **production** mode. Any error shows only a
generic "Whoops!" page. While you're learning, switch to **development** mode
to get full error messages and the debug toolbar:

1. Copy the file `env` (no dot) to `.env` in the same folder.
2. Open `.env`, find `# CI_ENVIRONMENT = production`, and change it to (no `#`):
   ```ini
   CI_ENVIRONMENT = development
   ```
3. Refresh the page. There's now a small flame icon in the bottom right corner:
   the debug toolbar.

The `.htaccess` above keeps `.env` from being downloaded.

# Activity: Add a Products Page (Model → Controller → View)

The Hello demo skipped the **M**. In this activity you add a full MVC page.
A **model** holds a fake array of products, a **controller** asks the model
for them, and a **view** displays them in a table.

When you're done, http://localhost/codeigniter-demo/public/products shows a
table of products.

> **Why a fake array?** The point of MVC is that the controller and view
> **don't care where the data comes from**. Next time we'll swap the array for
> a MySQL table, and only the model will change.

## Step 1: Add the route

In `app/Config/Routes.php`, under the `hello` route, add:

```php
$routes->get('products', 'Products::index');
```

If you visit the URL now, you'll get a 404, because the controller doesn't
exist yet. That's expected.

## Step 2: Create the model

Create **`app/Models/ProductModel.php`**:

```php
<?php

namespace App\Models;

class ProductModel
{
    // Fake data. Later this will come from MySQL.
    private array $products = [
        ['id' => 1, 'name' => 'USB-C Cable',         'price' => 12.99,  'in_stock' => true],
        ['id' => 2, 'name' => 'Wireless Mouse',      'price' => 29.50,  'in_stock' => true],
        ['id' => 3, 'name' => 'Mechanical Keyboard', 'price' => 89.00,  'in_stock' => false],
        ['id' => 4, 'name' => '27" Monitor',         'price' => 249.99, 'in_stock' => true],
    ];

    // Return every product
    public function getAll(): array
    {
        return $this->products;
    }
}
```

- `namespace App\Models;` must match the folder, and the class name must match the file name.
- Add at least **two products of your own** to the array.
- This is a plain PHP class. CodeIgniter also has a built-in `CodeIgniter\Model` class for database tables, which we'll use once the data moves to MySQL.

## Step 3: Create the controller

Create **`app/Controllers/Products.php`**. Use `Hello.php` as your guide.
Here's the skeleton; fill in the `TODO`s:

```php
<?php

namespace App\Controllers;

use App\Models\ProductModel;   // lets us write "ProductModel" instead of the full name

class Products extends BaseController
{
    public function index(): string
    {
        // TODO 1: create a new ProductModel object and store it in $model

        $data = [
            'title'    => 'Our Products',
            // TODO 2: add a 'products' key whose value is $model->getAll()
        ];

        // TODO 3: return the 'products' view, passing it $data
    }
}
```

## Step 4: Create the view

Create **`app/Views/products.php`**. It needs to:

1. Show `$title` in the `<title>` and in an `<h1>`, using `esc()`.
2. Build a `<table>` with columns **Name**, **Price** and **Stock**.
3. Use a `foreach` loop over `$products` to output one `<tr>` per product.
   - Name: `esc($product['name'])`
   - Price: `'$' . number_format($product['price'], 2)`
   - Stock: `In stock` or `Sold out` depending on `$product['in_stock']`

Tip: in views, the "alternative syntax" for loops keeps the HTML readable:

```php
<?php foreach ($products as $product): ?>
    <tr>
        <td><?= esc($product['name']) ?></td>
        <!-- your other two <td>s here -->
    </tr>
<?php endforeach; ?>
```

## Step 5: Check your work

Visit http://localhost/codeigniter-demo/public/products.

- [ ] The page shows your title and a table containing **every** product, including the ones you added.
- [ ] Prices show two decimals (`$89.00`, not `$89`).
- [ ] The keyboard shows **Sold out**.
- [ ] `27" Monitor` displays correctly. View the page source: the quote should appear as `&quot;`, which proves `esc()` is working.
- [ ] Your view contains **no** product data, and your controller contains **no** HTML.

**Explain it:** in two or three sentences, trace what happens from the
moment you press Enter on `/products` until the table appears. Name the
four files involved, in order.

## Stretch goals

1. **Detail page.** Add a route `$routes->get('products/(:num)', 'Products::show/$1');`,
   a `getById(int $id)` method in the model that loops through the array
   and returns the matching product (or `null`), a `show(int $id)` method in
   the controller and a `product_detail` view. Then make each product name
   in the table a link: `<a href="<?= site_url('products/' . $product['id']) ?>">`.
2. **Proper 404.** If `getById()` returns `null`, throw
   `\CodeIgniter\Exceptions\PageNotFoundException::forPageNotFound()` in the controller.
   Try `/products/99`.
3. **Add a nav link** on the Hello page to `site_url('products')`.

## Troubleshooting

| You see | Likely cause |
| --- | --- |
| A **404 - Page Not Found** page | The route is missing, the class or file name differs in capitalisation (`products.php` vs `Products.php`), or the `namespace` line is wrong. |
| `Class "App\Models\ProductModel" not found` | File is not in `app/Models/`, the file name doesn't match the class, or the `use` line is missing in the controller. |
| `Undefined variable $products` in the view | The key in `$data` is spelled differently from the variable you used in the view, or you forgot to pass `$data` to `view()`. |
| A blank "Whoops!" page | An error in production mode. Turn on [development mode](#development-mode-recommended-while-you-work) to see the real message. |
| `The framework needs ... intl` | The container wasn't rebuilt. Run `docker compose up -d --build`. |

# References

**The MVC pattern**

- Wikipedia: [Model–view–controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
- Wikipedia: [Front controller](https://en.wikipedia.org/wiki/Front_controller) (why every request goes through `public/index.php`)
- CodeIgniter User Guide: [Models, Views, and Controllers](https://codeigniter.com/user_guide/concepts/mvc.html)

**CodeIgniter**

- Wikipedia: [CodeIgniter](https://en.wikipedia.org/wiki/CodeIgniter)
- [CodeIgniter 4 User Guide](https://codeigniter.com/user_guide/) (the official documentation)
- User Guide: [URI Routing](https://codeigniter.com/user_guide/incoming/routing.html) · [Controllers](https://codeigniter.com/user_guide/incoming/controllers.html) · [Views](https://codeigniter.com/user_guide/outgoing/views.html) · [Models](https://codeigniter.com/user_guide/models/model.html) · [Global Functions (`esc()`, `view()`, `site_url()`)](https://codeigniter.com/user_guide/general/common_functions.html) · [Server Requirements](https://codeigniter.com/user_guide/intro/requirements.html)
- [codeigniter4/framework on GitHub](https://github.com/codeigniter4/framework/releases) (the download used here)

**PHP refreshers from w3schools** (the controller and model are PHP classes)

- [PHP OOP: What is OOP?](https://www.w3schools.com/php/php_oop_what_is.asp) · [Classes and Objects](https://www.w3schools.com/php/php_oop_classes_objects.asp)
- [PHP Namespaces](https://www.w3schools.com/php/php_namespaces.asp) (what `namespace App\Controllers;` means)
- [PHP Multidimensional Arrays](https://www.w3schools.com/php/php_arrays_multidimensional.asp) (the shape of the fake product data)
- [PHP foreach Loop](https://www.w3schools.com/php/php_looping_foreach.asp) (for the view in the activity)

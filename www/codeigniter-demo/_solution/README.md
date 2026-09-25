# Activity Solution (instructor only)

**Not committed to git** (see the repo's `.gitignore`) and **not reachable from
the web** (`codeigniter-demo/.htaccess` returns 403 for anything outside `public/`).

This is the finished Products activity from `../README.md`, including all three
stretch goals. The files use the same paths as `app/`, so they drop straight in.

| File | Status | What it does |
| --- | --- | --- |
| `app/Config/Routes.php` | replaces the demo's copy | Adds `products` and `products/(:num)` routes |
| `app/Models/ProductModel.php` | new | Fake product array, `getAll()`, `getById()` (stretch 1) |
| `app/Controllers/Products.php` | new | `index()` and `show()` with a 404 for unknown ids (stretch 1 and 2) |
| `app/Views/products.php` | new | Table built with `foreach`, names link to the detail page |
| `app/Views/product_detail.php` | new | One product (stretch 1) |
| `app/Views/hello.php` | replaces the demo's copy | Adds a "See our products" link (stretch 3) |

## Show it in class

From `www/codeigniter-demo/`:

```bash
cp -r _solution/app/. app/
```

Then open:

- http://localhost/codeigniter-demo/public/products
- http://localhost/codeigniter-demo/public/products/2
- http://localhost/codeigniter-demo/public/products/99 (404)

## Put the demo back afterwards

`codeigniter-demo/` isn't in git yet, so you can't use `git checkout` to undo.
Instead:

```bash
rm app/Models/ProductModel.php app/Controllers/Products.php \
   app/Views/products.php app/Views/product_detail.php
```

Then restore the original `app/Config/Routes.php` and `app/Views/hello.php`.
They're in `_solution/original/`:

```bash
cp -r _solution/original/app/. app/
```

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?= esc($title) ?></title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; }
    </style>
</head>
<body>
    <h1><?= esc($product['name']) ?></h1>

    <p>Price: $<?= number_format($product['price'], 2) ?></p>
    <p>Stock: <?= $product['in_stock'] ? 'In stock' : 'Sold out' ?></p>

    <p><a href="<?= site_url('products') ?>">Back to all products</a></p>
</body>
</html>

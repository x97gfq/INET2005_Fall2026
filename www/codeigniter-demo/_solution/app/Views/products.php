<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?= esc($title) ?></title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
        .sold-out { color: #999; }
    </style>
</head>
<body>
    <!-- The "V" in MVC: displays $products, doesn't care where they came from. -->
    <h1><?= esc($title) ?></h1>

    <table>
        <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
        </tr>
        <?php foreach ($products as $product): ?>
            <tr>
                <!-- Stretch goal 1: each name links to the detail page -->
                <td><a href="<?= site_url('products/' . $product['id']) ?>"><?= esc($product['name']) ?></a></td>
                <td>$<?= number_format($product['price'], 2) ?></td>
                <?php if ($product['in_stock']): ?>
                    <td>In stock</td>
                <?php else: ?>
                    <td class="sold-out">Sold out</td>
                <?php endif; ?>
            </tr>
        <?php endforeach; ?>
    </table>

    <p><a href="<?= site_url('hello') ?>">Back to Hello</a></p>
</body>
</html>

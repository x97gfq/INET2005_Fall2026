<?php

namespace App\Models;

/**
 * ProductModel (the "M" in MVC).
 *
 * Owns the product data. For now the data is a hard-coded array; later it
 * will come from MySQL, and only this file will need to change.
 */
class ProductModel
{
    // Fake data. Later this will come from MySQL.
    private array $products = [
        ['id' => 1, 'name' => 'USB-C Cable',         'price' => 12.99,  'in_stock' => true],
        ['id' => 2, 'name' => 'Wireless Mouse',      'price' => 29.50,  'in_stock' => true],
        ['id' => 3, 'name' => 'Mechanical Keyboard', 'price' => 89.00,  'in_stock' => false],
        ['id' => 4, 'name' => '27" Monitor',         'price' => 249.99, 'in_stock' => true],
        ['id' => 5, 'name' => 'Webcam',              'price' => 54.95,  'in_stock' => true],
        ['id' => 6, 'name' => 'Laptop Stand',        'price' => 39.00,  'in_stock' => false],
    ];

    // Return every product
    public function getAll(): array
    {
        return $this->products;
    }

    // Stretch goal 1: return one product, or null if the id doesn't exist
    public function getById(int $id): ?array
    {
        foreach ($this->products as $product) {
            if ($product['id'] === $id) {
                return $product;
            }
        }

        return null;
    }
}

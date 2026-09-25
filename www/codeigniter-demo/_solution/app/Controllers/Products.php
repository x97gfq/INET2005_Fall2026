<?php

namespace App\Controllers;

use App\Models\ProductModel;
use CodeIgniter\Exceptions\PageNotFoundException;

/**
 * Products controller (the "C" in MVC).
 *
 * Asks ProductModel for data and hands it to a view. No HTML, no data.
 */
class Products extends BaseController
{
    // GET /products
    public function index(): string
    {
        $model = new ProductModel();

        $data = [
            'title'    => 'Our Products',
            'products' => $model->getAll(),
        ];

        return view('products', $data);
    }

    // Stretch goals 1 and 2: GET /products/(:num)
    public function show(int $id): string
    {
        $model   = new ProductModel();
        $product = $model->getById($id);

        if ($product === null) {
            throw PageNotFoundException::forPageNotFound("No product with id {$id}");
        }

        $data = [
            'title'   => $product['name'],
            'product' => $product,
        ];

        return view('product_detail', $data);
    }
}

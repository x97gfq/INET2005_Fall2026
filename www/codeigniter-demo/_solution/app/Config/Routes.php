<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');

// INET2005 demo: GET /hello -> Hello controller, index() method
$routes->get('hello', 'Hello::index');

// Activity: GET /products -> Products controller, index() method
$routes->get('products', 'Products::index');

// Stretch goal 1: GET /products/3 -> Products::show(3)
$routes->get('products/(:num)', 'Products::show/$1');

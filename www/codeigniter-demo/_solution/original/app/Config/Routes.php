<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');

// INET2005 demo: GET /hello -> Hello controller, index() method
$routes->get('hello', 'Hello::index');

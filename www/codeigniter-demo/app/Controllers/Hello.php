<?php

namespace App\Controllers;

/**
 * Hello controller (the "C" in MVC).
 *
 * The router sends GET /hello here (see app/Config/Routes.php).
 * The controller decides WHAT to show, then hands the data to a view
 * that decides HOW to show it.
 */
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

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?= esc($title) ?></title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; }
        .message { background: #fdf0ec; border-left: 4px solid #dd4814; padding: 1rem; }
    </style>
</head>
<body>
    <!-- This is the "V" in MVC: it only displays data, it does not decide what the data is. -->
    <h1><?= esc($title) ?></h1>

    <p class="message"><?= esc($message) ?></p>

    <p><small>Rendered by <code>app/Views/hello.php</code> using data from <code>App\Controllers\Hello::index()</code>.</small></p>
</body>
</html>

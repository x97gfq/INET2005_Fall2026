<?php
session_start();

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

// Server-side validation happens before we ever touch the database
$errors = [];
if ($username === '') {
    $errors[] = 'Username is required.';
}
if ($password === '') {
    $errors[] = 'Password is required.';
}

if (!empty($errors)) {
    $_SESSION['flash_errors'] = $errors;
    $_SESSION['old_username'] = $username;
    header('Location: login_form.php');
    exit;
}

$conn = new mysqli('db', 'login_demo_user', 'LoginDemo!2026', 'login_demo');
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

$stmt = $conn->prepare('SELECT password_hash FROM users WHERE username = ?');
$stmt->bind_param('s', $username);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();
$conn->close();

if (!$row || !password_verify($password, $row['password_hash'])) {
    // Same generic message either way - never reveal which part was wrong
    $_SESSION['flash_errors'] = ['Invalid username or password.'];
    $_SESSION['old_username'] = $username;
    header('Location: login_form.php');
    exit;
}

// A fresh session ID on login prevents session fixation - an attacker who
// tricked a victim into using a known session ID can no longer reuse it
session_regenerate_id(true);
$_SESSION['username'] = $username;
$_SESSION['login_time'] = time();

// process_login.php never renders a page itself - it only validates and
// redirects (the POST/Redirect/GET pattern), so refreshing the result
// page never resubmits the form
header('Location: dashboard.php');
exit;

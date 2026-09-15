<?php
// $_SERVER is a built-in superglobal array with info about the server and request
echo "Server Name: " . $_SERVER['SERVER_NAME'] . "<br>";
echo "Request Method: " . $_SERVER['REQUEST_METHOD'] . "<br>";
echo "Script Name: " . $_SERVER['SCRIPT_NAME'] . "<br>";
echo "Client IP Address: " . $_SERVER['REMOTE_ADDR'] . "<br>";
echo "User's Browser: " . $_SERVER['HTTP_USER_AGENT'] . "<br>";
?>

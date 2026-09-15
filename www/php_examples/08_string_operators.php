<?php
// String operators join (concatenate) strings together
$first = "Jamie";
$last = "Symonds";

$fullName = $first . " " . $last; // . joins two strings
echo $fullName . "<br>";

$greeting = "Hello, ";
$greeting .= $fullName;           // .= appends to the existing string
echo $greeting . "<br>";
?>
